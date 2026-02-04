"""
JoinWork - Migrate local JSON data to Google Cloud Firestore.
Run once to upload backend/data/*.json to Firestore collections.
Usage: python migrate_to_firestore.py (from backend/ or project root)
"""

import json
import os
import sys

# Add backend to path so we can import app's firebase init
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BACKEND_DIR, 'data')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

def load_json_file(path, default=None):
    """Load JSON array or object from file. Return default if file missing or invalid."""
    if default is None:
        default = []
    try:
        if os.path.isfile(path):
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data if isinstance(data, list) else [data]
        return default
    except Exception as e:
        print(f'  [WARN] Could not load {path}: {e}')
        return default

def main():
    print('\n=== JoinWork: Migrate JSON to Firestore ===\n')
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        print('ERROR: firebase-admin not installed. Run: pip install firebase-admin')
        sys.exit(1)
    if firebase_admin._apps:
        firebase_admin.get_app()
    else:
        key_paths = [
            os.path.join(BACKEND_DIR, 'serviceAccountKey.json'),
            os.path.join(BACKEND_DIR, 'serviceAccountKey.json.json'),
        ]
        cred = None
        for path in key_paths:
            if os.path.isfile(path):
                cred = credentials.Certificate(path)
                print(f'Using credentials: {path}\n')
                break
        if not cred:
            print('ERROR: serviceAccountKey.json not found in backend/')
            sys.exit(1)
        firebase_admin.initialize_app(cred)
    db = firestore.client()

    collections = [
        ('users', 'users.json', 'user_id'),
        ('graduates', 'graduates.json', 'graduate_id'),
        ('companies', 'companies.json', 'company_id'),
        ('jobs', 'jobs.json', 'job_id'),
        ('applications', 'applications.json', 'application_id'),
        ('workshops', 'workshops.json', 'workshop_id'),
    ]
    max_ids = {}

    for coll_name, filename, id_field in collections:
        path = os.path.join(DATA_DIR, filename)
        items = load_json_file(path, [])
        if not items:
            print(f'  {coll_name}: no data (file missing or empty)')
            max_ids[coll_name] = 0
            continue
        max_id = 0
        batch = db.batch()
        count = 0
        for item in items:
            id_val = item.get(id_field)
            if id_val is not None:
                try:
                    id_int = int(id_val)
                    max_id = max(max_id, id_int)
                except (TypeError, ValueError):
                    pass
            doc_id = str(id_val) if id_val is not None else None
            if doc_id is None:
                continue
            # Store all fields; doc id = numeric id for efficient lookups
            payload = {k: v for k, v in item.items() if k != id_field}
            ref = db.collection(coll_name).document(doc_id)
            batch.set(ref, payload)
            count += 1
            if count >= 500:  # Firestore batch limit
                batch.commit()
                batch = db.batch()
                count = 0
        try:
            if count > 0:
                batch.commit()
        except Exception as e:
            print(f'  ERROR writing {coll_name}: {e}')
            raise
        max_ids[coll_name] = max_id
        print(f'  {coll_name}: {len(items)} documents (max {id_field}={max_id})')

    try:
        counter_ref = db.collection('counters').document('main')
        counter_ref.set(max_ids, merge=True)
    except Exception as e:
        print(f'  ERROR setting counters: {e}')
        raise
    print(f'\n  counters/main set to: {max_ids}')
    print('\n=== Migration complete ===')
    print('  Run the app with: python app.py (or flask run)\n')
    return 0

if __name__ == '__main__':
    try:
        sys.exit(main() or 0)
    except Exception as e:
        print(f'\nMigration failed: {e}')
        sys.exit(1)
