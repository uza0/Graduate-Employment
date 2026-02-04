"""
JoinWork - Backend Server (Python Flask)
Firestore-backed API for authentication and business logic.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import jwt
import datetime
from functools import wraps
import os

# Firebase Admin
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

JWT_SECRET = os.environ.get('JWT_SECRET', 'joinwork-secret-key-change-in-production')

# ============================================
# FIREBASE INITIALIZATION
# ============================================

def init_firebase():
    """Initialize Firebase Admin SDK. Uses FIREBASE_CREDENTIALS_JSON env var (Render) or serviceAccountKey.json in app directory (Linux-friendly relative path)."""
    if firebase_admin._apps:
        return firebase_admin.get_app()
    cred = None
    # Prefer env var on Render/production (no secret file in repo)
    import json as _json
    env_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
    if env_json:
        try:
            cred = credentials.Certificate(_json.loads(env_json))
            print('[FIREBASE] Using credentials from FIREBASE_CREDENTIALS_JSON')
        except Exception as e:
            print(f'[FIREBASE] FIREBASE_CREDENTIALS_JSON invalid: {e}')
    if not cred:
        # File-based: use directory of this file (works on Linux/Render)
        app_dir = os.path.dirname(os.path.abspath(__file__))
        for name in ('serviceAccountKey.json', 'serviceAccountKey.json.json'):
            path = os.path.join(app_dir, name)
            if os.path.isfile(path):
                cred = credentials.Certificate(path)
                print(f'[FIREBASE] Using credentials: {name}')
                break
    if not cred:
        raise FileNotFoundError(
            'Firebase credentials not found. Set FIREBASE_CREDENTIALS_JSON or place serviceAccountKey.json in the app directory.'
        )
    return firebase_admin.initialize_app(cred)

try:
    init_firebase()
    db = firestore.client()
    print('[FIREBASE] Firestore client ready')
except Exception as e:
    print(f'[FIREBASE ERROR] {e}')
    db = None

# ============================================
# HELPERS: Serialization & ID generation
# ============================================

def serialize_value(v):
    """Convert Firestore values to JSON-serializable types."""
    if v is None:
        return None
    if hasattr(v, 'isoformat'):  # datetime
        return v.isoformat()
    if isinstance(v, dict):
        return {k: serialize_value(val) for k, val in v.items()}
    if isinstance(v, list):
        return [serialize_value(x) for x in v]
    return v

def doc_to_dict(doc, id_field=None, id_value=None):
    """Convert Firestore document snapshot to dict with optional id field."""
    if doc is None or not doc.exists:
        return None
    d = doc.to_dict()
    d = serialize_value(d)
    if id_field is not None and id_value is not None:
        d[id_field] = id_value
    return d

def get_next_id(collection_name):
    """Get next integer ID for a collection using counters/main. Thread-safe via transaction."""
    if not db:
        raise RuntimeError('Firestore not initialized')
    counter_ref = db.collection('counters').document('main')
    @firestore.transactional
    def _inc(transaction):
        snap = counter_ref.get(transaction=transaction)
        data = snap.to_dict() or {}
        next_val = data.get(collection_name, 0) + 1
        transaction.set(counter_ref, {**data, collection_name: next_val}, merge=True)
        return next_val
    transaction = db.transaction()
    return _inc(transaction)

# ============================================
# DB HELPERS: Users
# ============================================

def get_user_by_id(user_id):
    """Fetch user by user_id (document ID = str(user_id))."""
    if not db:
        return None
    try:
        ref = db.collection('users').document(str(user_id))
        doc = ref.get()
        if not doc.exists:
            return None
        d = doc.to_dict()
        d = serialize_value(d)
        d['user_id'] = int(doc.id) if doc.id.isdigit() else d.get('user_id')
        return d
    except Exception as e:
        print(f'[DB] get_user_by_id error: {e}')
        return None

def get_user_by_email(email):
    """Fetch user by email (query)."""
    if not db:
        return None
    try:
        email = (email or '').strip().lower()
        refs = db.collection('users').where('email', '==', email).limit(1).stream()
        for doc in refs:
            d = doc.to_dict()
            d = serialize_value(d)
            d['user_id'] = int(doc.id) if doc.id.isdigit() else d.get('user_id')
            return d
        return None
    except Exception as e:
        print(f'[DB] get_user_by_email error: {e}')
        return None

def create_user(data):
    """Create user document. doc_id = str(user_id). Returns new user dict or None."""
    if not db:
        return None
    try:
        user_id = get_next_id('users')
        ref = db.collection('users').document(str(user_id))
        payload = {
            'full_name': data.get('full_name', ''),
            'email': (data.get('email') or '').strip().lower(),
            'password_hash': data.get('password_hash', ''),
            'role': data.get('role', 'graduate'),
            'created_at': data.get('created_at', datetime.datetime.utcnow().isoformat()),
        }
        ref.set(payload)
        return {'user_id': user_id, **payload}
    except Exception as e:
        print(f'[DB] create_user error: {e}')
        return None

# ============================================
# DB HELPERS: Graduates
# ============================================

def get_graduate_by_id(graduate_id):
    if not db:
        return None
    try:
        doc = db.collection('graduates').document(str(graduate_id)).get()
        if not doc.exists:
            return None
        d = doc.to_dict()
        d = serialize_value(d)
        d['graduate_id'] = int(doc.id) if doc.id.isdigit() else d.get('graduate_id')
        return d
    except Exception as e:
        print(f'[DB] get_graduate_by_id error: {e}')
        return None

def get_graduate_by_user_id(user_id):
    if not db:
        return None
    try:
        refs = db.collection('graduates').where('user_id', '==', int(user_id)).limit(1).stream()
        for doc in refs:
            d = doc.to_dict()
            d = serialize_value(d)
            d['graduate_id'] = int(doc.id) if doc.id.isdigit() else d.get('graduate_id')
            return d
        return None
    except Exception as e:
        print(f'[DB] get_graduate_by_user_id error: {e}')
        return None

def create_graduate(data):
    if not db:
        return None
    try:
        graduate_id = get_next_id('graduates')
        ref = db.collection('graduates').document(str(graduate_id))
        payload = {k: v for k, v in data.items() if k != 'graduate_id'}
        ref.set(payload)
        return {'graduate_id': graduate_id, **payload}
    except Exception as e:
        print(f'[DB] create_graduate error: {e}')
        return None

def update_graduate(graduate_id, data):
    if not db:
        return False
    try:
        ref = db.collection('graduates').document(str(graduate_id))
        ref.update(data)
        return True
    except Exception as e:
        print(f'[DB] update_graduate error: {e}')
        return False

# ============================================
# DB HELPERS: Companies
# ============================================

def get_company_by_id(company_id):
    if not db:
        return None
    try:
        doc = db.collection('companies').document(str(company_id)).get()
        if not doc.exists:
            return None
        d = doc.to_dict()
        d = serialize_value(d)
        d['company_id'] = int(doc.id) if doc.id.isdigit() else d.get('company_id')
        return d
    except Exception as e:
        print(f'[DB] get_company_by_id error: {e}')
        return None

def get_company_by_user_id(user_id):
    if not db:
        return None
    try:
        refs = db.collection('companies').where('user_id', '==', int(user_id)).limit(1).stream()
        for doc in refs:
            d = doc.to_dict()
            d = serialize_value(d)
            d['company_id'] = int(doc.id) if doc.id.isdigit() else d.get('company_id')
            return d
        return None
    except Exception as e:
        print(f'[DB] get_company_by_user_id error: {e}')
        return None

def create_company(data):
    if not db:
        return None
    try:
        company_id = get_next_id('companies')
        ref = db.collection('companies').document(str(company_id))
        payload = {k: v for k, v in data.items() if k != 'company_id'}
        ref.set(payload)
        return {'company_id': company_id, **payload}
    except Exception as e:
        print(f'[DB] create_company error: {e}')
        return None

# ============================================
# DB HELPERS: Jobs
# ============================================

def get_job_by_id(job_id):
    if not db:
        return None
    try:
        doc = db.collection('jobs').document(str(job_id)).get()
        if not doc.exists:
            return None
        d = doc.to_dict()
        d = serialize_value(d)
        d['job_id'] = int(doc.id) if doc.id.isdigit() else d.get('job_id')
        return d
    except Exception as e:
        print(f'[DB] get_job_by_id error: {e}')
        return None

def get_jobs_filtered(company_id=None, status=None):
    if not db:
        return []
    try:
        q = db.collection('jobs')
        if company_id is not None:
            q = q.where('company_id', '==', int(company_id))
        if status is not None:
            q = q.where('status', '==', status)
        out = []
        for doc in q.stream():
            d = doc.to_dict()
            d = serialize_value(d)
            d['job_id'] = int(doc.id) if doc.id.isdigit() else d.get('job_id')
            out.append(d)
        return out
    except Exception as e:
        print(f'[DB] get_jobs_filtered error: {e}')
        return []

def create_job(data):
    if not db:
        return None
    try:
        job_id = get_next_id('jobs')
        ref = db.collection('jobs').document(str(job_id))
        payload = {k: v for k, v in data.items() if k != 'job_id'}
        ref.set(payload)
        return {'job_id': job_id, **payload}
    except Exception as e:
        print(f'[DB] create_job error: {e}')
        return None

def update_job(job_id, data):
    if not db:
        return False
    try:
        db.collection('jobs').document(str(job_id)).update(data)
        return True
    except Exception as e:
        print(f'[DB] update_job error: {e}')
        return False

def delete_job(job_id):
    if not db:
        return False
    try:
        db.collection('jobs').document(str(job_id)).delete()
        return True
    except Exception as e:
        print(f'[DB] delete_job error: {e}')
        return False

# ============================================
# DB HELPERS: Applications
# ============================================

def get_application_by_id(application_id):
    if not db:
        return None
    try:
        doc = db.collection('applications').document(str(application_id)).get()
        if not doc.exists:
            return None
        d = doc.to_dict()
        d = serialize_value(d)
        d['application_id'] = int(doc.id) if doc.id.isdigit() else d.get('application_id')
        return d
    except Exception as e:
        print(f'[DB] get_application_by_id error: {e}')
        return None

def get_applications_by_job_id(job_id):
    if not db:
        return []
    try:
        refs = db.collection('applications').where('job_id', '==', int(job_id)).stream()
        out = []
        for doc in refs:
            d = doc.to_dict()
            d = serialize_value(d)
            d['application_id'] = int(doc.id) if doc.id.isdigit() else d.get('application_id')
            out.append(d)
        return out
    except Exception as e:
        print(f'[DB] get_applications_by_job_id error: {e}')
        return []

def get_application_by_job_and_graduate(job_id, graduate_id):
    if not db:
        return None
    try:
        refs = db.collection('applications').where('job_id', '==', int(job_id)).where('graduate_id', '==', int(graduate_id)).limit(1).stream()
        for doc in refs:
            d = doc.to_dict()
            d = serialize_value(d)
            d['application_id'] = int(doc.id) if doc.id.isdigit() else d.get('application_id')
            return d
        return None
    except Exception as e:
        print(f'[DB] get_application_by_job_and_graduate error: {e}')
        return None

def create_application(data):
    if not db:
        return None
    try:
        application_id = get_next_id('applications')
        ref = db.collection('applications').document(str(application_id))
        payload = {k: v for k, v in data.items() if k != 'application_id'}
        ref.set(payload)
        return {'application_id': application_id, **payload}
    except Exception as e:
        print(f'[DB] create_application error: {e}')
        return None

def update_application(application_id, data):
    if not db:
        return False
    try:
        db.collection('applications').document(str(application_id)).update(data)
        return True
    except Exception as e:
        print(f'[DB] update_application error: {e}')
        return False

# ============================================
# DB HELPERS: Workshops
# ============================================

def get_all_workshops():
    if not db:
        return []
    try:
        out = []
        for doc in db.collection('workshops').stream():
            d = doc.to_dict()
            d = serialize_value(d)
            d['workshop_id'] = int(doc.id) if doc.id.isdigit() else d.get('workshop_id')
            out.append(d)
        return out
    except Exception as e:
        print(f'[DB] get_all_workshops error: {e}')
        return []

# ============================================
# AUTH HELPERS
# ============================================

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, password_hash):
    return hash_password(password) == password_hash

def generate_token(user):
    payload = {
        'userId': user['user_id'],
        'email': user.get('email', ''),
        'role': user.get('role', 'graduate'),
        'full_name': user.get('full_name', ''),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# ============================================
# MIDDLEWARE: token_required (fetch user from Firestore)
# ============================================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(' ')[1]
            except IndexError:
                return jsonify({'error': True, 'message': 'Invalid token format'}), 401
        if not token:
            return jsonify({'error': True, 'message': 'Access token required'}), 401
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = data.get('userId')
            current_user = get_user_by_id(user_id)
            if not current_user:
                # Fallback from token for backwards compatibility (e.g. stale token)
                current_user = {
                    'user_id': user_id,
                    'email': data.get('email', ''),
                    'role': data.get('role', 'graduate'),
                    'full_name': data.get('full_name', 'User'),
                    'password_hash': None
                }
            request.current_user = current_user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': True, 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': True, 'message': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            current_user = getattr(request, 'current_user', None)
            if not current_user:
                return jsonify({'error': True, 'message': 'Access token required'}), 401
            if current_user.get('role') not in allowed_roles:
                return jsonify({'error': True, 'message': 'Forbidden: insufficient permissions'}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ============================================
# AUTH ROUTES
# ============================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json() or {}
        for field in ['full_name', 'email', 'password', 'role']:
            if not data.get(field):
                return jsonify({'error': True, 'message': f'Missing required field: {field}'}), 400
        email = data['email'].strip().lower()
        if get_user_by_email(email):
            return jsonify({'error': True, 'message': 'Email already registered'}), 400
        password_hash = hash_password(data['password'])
        created_at = datetime.datetime.utcnow().isoformat()
        new_user = create_user({
            'full_name': data['full_name'],
            'email': email,
            'password_hash': password_hash,
            'role': data['role'],
            'created_at': created_at,
        })
        if not new_user:
            return jsonify({'error': True, 'message': 'Failed to create user'}), 500
        user_id = new_user['user_id']
        if data['role'] == 'graduate':
            card_num = (data.get('unified_card_number') or '').strip().replace(' ', '')
            if card_num and (len(card_num) != 12 or not card_num.isdigit()):
                return jsonify({'error': True, 'message': 'Unified Card Number must be exactly 12 digits'}), 400
            create_graduate({
                'user_id': user_id,
                'university': data.get('university', ''),
                'major': data.get('major', ''),
                'unified_card_number': card_num,
                'skills': data.get('skills', ''),
                'age': int(data['age']) if data.get('age') else None,
                'date_of_birth': data.get('date_of_birth', ''),
                'gender': data.get('gender', ''),
                'profile_picture': data.get('profile_picture', ''),
                'projects': data.get('projects', ''),
                'experience': data.get('experience', ''),
            })
        elif data['role'] == 'company':
            if not (data.get('company_name') or '').strip():
                return jsonify({'error': True, 'message': 'Company name is required'}), 400
            create_company({
                'user_id': user_id,
                'company_name': data.get('company_name', '').strip(),
                'sector': (data.get('sector') or '').strip(),
                'location': (data.get('location') or '').strip(),
            })
        token = generate_token(new_user)
        return jsonify({
            'token': token,
            'user': {
                'user_id': new_user['user_id'],
                'full_name': new_user['full_name'],
                'email': new_user['email'],
                'role': new_user['role']
            }
        }), 201
    except Exception as e:
        print(f'Signup error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': True, 'message': 'Email and password required'}), 400
        email = data['email'].strip().lower()
        user = get_user_by_email(email)
        if not user:
            return jsonify({'error': True, 'message': 'Invalid email or password'}), 401
        if not user.get('password_hash'):
            return jsonify({'error': True, 'message': 'Invalid email or password'}), 401
        if not verify_password(data['password'], user['password_hash']):
            return jsonify({'error': True, 'message': 'Invalid email or password'}), 401
        token = generate_token(user)
        return jsonify({
            'token': token,
            'user': {
                'user_id': user['user_id'],
                'full_name': user['full_name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
    except Exception as e:
        print(f'Login error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    u = request.current_user
    return jsonify({
        'user_id': u['user_id'],
        'full_name': u.get('full_name', ''),
        'email': u.get('email', ''),
        'role': u.get('role', '')
    }), 200

# ============================================
# GRADUATES ROUTES
# ============================================

@app.route('/api/graduates/<int:graduate_id>', methods=['GET'])
@token_required
@role_required(['graduate', 'company'])
def get_graduate(graduate_id):
    graduate = get_graduate_by_id(graduate_id)
    if not graduate:
        return jsonify({'error': True, 'message': 'Graduate not found'}), 404
    user = get_user_by_id(graduate['user_id'])
    result = {**graduate, 'full_name': user['full_name'] if user else '', 'email': user['email'] if user else ''}
    return jsonify(result), 200

@app.route('/api/graduates/<int:graduate_id>', methods=['PUT'])
@token_required
@role_required(['graduate'])
def update_graduate_route(graduate_id):
    try:
        data = request.get_json() or {}
        graduate = get_graduate_by_id(graduate_id)
        if not graduate:
            return jsonify({'error': True, 'message': 'Graduate not found'}), 404
        if graduate['user_id'] != request.current_user['user_id']:
            return jsonify({'error': True, 'message': 'Unauthorized'}), 403
        updates = {}
        for key in ['university', 'major', 'skills', 'date_of_birth', 'gender', 'profile_picture', 'projects', 'experience']:
            if key in data:
                updates[key] = data[key]
        if 'unified_card_number' in data:
            card_num = (data.get('unified_card_number') or '').strip().replace(' ', '')
            if card_num and (len(card_num) != 12 or not card_num.isdigit()):
                return jsonify({'error': True, 'message': 'Unified Card Number must be exactly 12 digits'}), 400
            updates['unified_card_number'] = card_num
        if 'age' in data:
            updates['age'] = int(data['age']) if data['age'] else None
        if not update_graduate(graduate_id, updates):
            return jsonify({'error': True, 'message': 'Update failed'}), 500
        updated = get_graduate_by_id(graduate_id)
        return jsonify(updated), 200
    except Exception as e:
        print(f'Update graduate error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/graduates/user/<int:user_id>', methods=['GET'])
@token_required
@role_required(['graduate'])
def get_graduate_by_user(user_id):
    if request.current_user['user_id'] != user_id:
        return jsonify({'error': True, 'message': 'Unauthorized'}), 403
    graduate = get_graduate_by_user_id(user_id)
    if not graduate:
        return jsonify({'error': True, 'message': 'Graduate profile not found'}), 404
    user = get_user_by_id(user_id)
    result = {**graduate, 'full_name': user['full_name'] if user else '', 'email': user['email'] if user else ''}
    return jsonify(result), 200

@app.route('/api/graduates', methods=['POST'])
@token_required
@role_required(['graduate'])
def create_graduate_route():
    try:
        data = request.get_json() or {}
        user_id = request.current_user['user_id']
        if get_graduate_by_user_id(user_id):
            return jsonify({'error': True, 'message': 'Profile already exists'}), 400
        card_num = (data.get('unified_card_number') or '').strip().replace(' ', '')
        if card_num and (len(card_num) != 12 or not card_num.isdigit()):
            return jsonify({'error': True, 'message': 'Unified Card Number must be exactly 12 digits'}), 400
        graduate = create_graduate({
            'user_id': user_id,
            'university': data.get('university', ''),
            'major': data.get('major', ''),
            'unified_card_number': card_num,
            'skills': data.get('skills', ''),
            'age': int(data['age']) if data.get('age') else None,
            'projects': data.get('projects', ''),
            'experience': data.get('experience', ''),
        })
        if not graduate:
            return jsonify({'error': True, 'message': 'Failed to create profile'}), 500
        return jsonify(graduate), 201
    except Exception as e:
        print(f'Create graduate error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

# ============================================
# JOBS ROUTES
# ============================================

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        company_id = request.args.get('company_id', type=int)
        status = request.args.get('status')
        filtered = get_jobs_filtered(company_id=company_id, status=status)
        jobs_with_company = []
        for job in filtered:
            company = get_company_by_id(job['company_id'])
            job_data = {**job, 'company_name': company['company_name'] if company else 'Unknown Company'}
            jobs_with_company.append(job_data)
        return jsonify({'jobs': jobs_with_company, 'total': len(jobs_with_company)}), 200
    except Exception as e:
        print(f'Get jobs error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/jobs', methods=['POST'])
@token_required
@role_required(['company'])
def create_job_route():
    try:
        data = request.get_json() or {}
        user_id = request.current_user['user_id']
        company = get_company_by_user_id(user_id)
        if not company:
            user = get_user_by_id(user_id)
            company_name = user['full_name'] if user else f'Company {user_id}'
            company = create_company({
                'user_id': user_id,
                'company_name': company_name,
                'sector': '',
                'location': ''
            })
            if not company:
                return jsonify({'error': True, 'message': 'Failed to create company profile'}), 500
        if not data.get('title') or not data.get('description') or not data.get('location'):
            return jsonify({'error': True, 'message': 'Title, description, and location are required'}), 400
        job = create_job({
            'company_id': company['company_id'],
            'title': data['title'],
            'description': data['description'],
            'location': data['location'],
            'salary': float(data['salary']) if data.get('salary') else None,
            'skills_required': data.get('skills_required', ''),
            'employment_type': data.get('employment_type', 'full-time'),
            'status': 'active',
            'created_at': datetime.datetime.utcnow().isoformat()
        })
        if not job:
            return jsonify({'error': True, 'message': 'Failed to create job'}), 500
        return jsonify(job), 201
    except Exception as e:
        print(f'Create job error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = get_job_by_id(job_id)
    if not job:
        return jsonify({'error': True, 'message': 'Job not found'}), 404
    company = get_company_by_id(job['company_id'])
    job_data = {**job, 'company_name': company['company_name'] if company else 'Unknown Company'}
    return jsonify(job_data), 200

@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
@token_required
@role_required(['company'])
def update_job_route(job_id):
    try:
        data = request.get_json() or {}
        user_id = request.current_user['user_id']
        job = get_job_by_id(job_id)
        if not job:
            return jsonify({'error': True, 'message': 'Job not found'}), 404
        company = get_company_by_id(job['company_id'])
        if not company or company['user_id'] != user_id:
            return jsonify({'error': True, 'message': 'Unauthorized'}), 403
        updates = {}
        for key in ['title', 'description', 'location', 'salary', 'skills_required', 'employment_type', 'status']:
            if key in data:
                updates[key] = float(data[key]) if key == 'salary' and data[key] else data[key]
        if not update_job(job_id, updates):
            return jsonify({'error': True, 'message': 'Update failed'}), 500
        updated = get_job_by_id(job_id)
        return jsonify(updated), 200
    except Exception as e:
        print(f'Update job error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@token_required
@role_required(['company'])
def delete_job_route(job_id):
    try:
        user_id = request.current_user['user_id']
        job = get_job_by_id(job_id)
        if not job:
            return jsonify({'error': True, 'message': 'Job not found'}), 404
        company = get_company_by_id(job['company_id'])
        if not company or company['user_id'] != user_id:
            return jsonify({'error': True, 'message': 'Unauthorized'}), 403
        if not delete_job(job_id):
            return jsonify({'error': True, 'message': 'Delete failed'}), 500
        return jsonify({'message': 'Job deleted successfully'}), 200
    except Exception as e:
        print(f'Delete job error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/jobs/<int:job_id>/applications', methods=['GET'])
@token_required
@role_required(['company'])
def get_job_applications(job_id):
    try:
        user_id = request.current_user['user_id']
        job = get_job_by_id(job_id)
        if not job:
            return jsonify({'error': True, 'message': 'Job not found'}), 404
        company = get_company_by_id(job['company_id'])
        if not company or company['user_id'] != user_id:
            return jsonify({'error': True, 'message': 'Unauthorized'}), 403
        job_apps = get_applications_by_job_id(job_id)
        applications_with_graduate = []
        for app in job_apps:
            graduate = get_graduate_by_id(app['graduate_id'])
            user = get_user_by_id(graduate['user_id']) if graduate else None
            app_data = {**app}
            if graduate and user:
                app_data['graduate_name'] = user['full_name']
                app_data['graduate_email'] = user['email']
                app_data['graduate_major'] = graduate.get('major', '')
                app_data['graduate_university'] = graduate.get('university', '')
                app_data['graduate_gpa'] = graduate.get('GPA')
                app_data['graduate_skills'] = graduate.get('skills', '')
            applications_with_graduate.append(app_data)
        return jsonify({'applications': applications_with_graduate, 'total': len(applications_with_graduate)}), 200
    except Exception as e:
        print(f'Get applications error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/jobs/<int:job_id>/apply', methods=['POST'])
@token_required
@role_required(['graduate'])
def apply_for_job(job_id):
    try:
        data = request.get_json() or {}
        user_id = request.current_user['user_id']
        job = get_job_by_id(job_id)
        if not job:
            return jsonify({'error': True, 'message': 'Job not found'}), 404
        graduate = get_graduate_by_user_id(user_id)
        if not graduate:
            user = get_user_by_id(user_id)
            if not user:
                return jsonify({'error': True, 'message': 'User not found'}), 404
            graduate = create_graduate({
                'user_id': user_id,
                'university': '',
                'major': '',
                'unified_card_number': '',
                'skills': '',
                'age': None,
                'projects': '',
                'experience': ''
            })
            if not graduate:
                return jsonify({'error': True, 'message': 'Failed to create graduate profile'}), 500
        if get_application_by_job_and_graduate(job_id, graduate['graduate_id']):
            return jsonify({'error': True, 'message': 'You have already applied for this job'}), 400
        application = create_application({
            'job_id': job_id,
            'graduate_id': graduate['graduate_id'],
            'status': 'pending',
            'cover_letter': data.get('cover_letter', ''),
            'applied_date': datetime.datetime.utcnow().isoformat()
        })
        if not application:
            return jsonify({'error': True, 'message': 'Failed to create application'}), 500
        return jsonify(application), 201
    except Exception as e:
        print(f'Apply for job error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

# ============================================
# APPLICATIONS ROUTES
# ============================================

@app.route('/api/applications/<int:application_id>', methods=['PUT'])
@token_required
@role_required(['company'])
def update_application_status(application_id):
    try:
        data = request.get_json() or {}
        status = data.get('status')
        if status not in ['accepted', 'rejected', 'pending']:
            return jsonify({'error': True, 'message': 'Invalid status. Must be accepted, rejected, or pending'}), 400
        application = get_application_by_id(application_id)
        if not application:
            return jsonify({'error': True, 'message': 'Application not found'}), 404
        job = get_job_by_id(application['job_id'])
        if not job:
            return jsonify({'error': True, 'message': 'Job not found'}), 404
        company = get_company_by_id(job['company_id'])
        if not company or company['user_id'] != request.current_user['user_id']:
            return jsonify({'error': True, 'message': 'Unauthorized'}), 403
        if not update_application(application_id, {'status': status}):
            return jsonify({'error': True, 'message': 'Update failed'}), 500
        updated = get_application_by_id(application_id)
        return jsonify(updated), 200
    except Exception as e:
        print(f'Update application status error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

# ============================================
# COMPANIES ROUTES
# ============================================

@app.route('/api/companies/user/<int:user_id>', methods=['GET'])
@token_required
@role_required(['company'])
def get_company_by_user(user_id):
    if request.current_user['user_id'] != user_id:
        return jsonify({'error': True, 'message': 'Unauthorized'}), 403
    company = get_company_by_user_id(user_id)
    if not company:
        user = get_user_by_id(user_id)
        company_name = user['full_name'] if user else f'Company {user_id}'
        company = create_company({
            'user_id': user_id,
            'company_name': company_name,
            'sector': '',
            'location': ''
        })
        if not company:
            return jsonify({'error': True, 'message': 'Failed to create company profile'}), 500
    return jsonify(company), 200

@app.route('/api/companies/<int:company_id>', methods=['GET'])
@token_required
def get_company(company_id):
    company = get_company_by_id(company_id)
    if not company:
        return jsonify({'error': True, 'message': 'Company not found'}), 404
    return jsonify(company), 200

# ============================================
# WORKSHOPS ROUTES
# ============================================

@app.route('/api/workshops', methods=['GET'])
def get_workshops():
    try:
        workshops = get_all_workshops()
        return jsonify({'workshops': workshops, 'total': len(workshops)}), 200
    except Exception as e:
        print(f'Get workshops error: {e}')
        return jsonify({'error': True, 'message': 'Internal server error'}), 500

# ============================================
# HEALTH & ADMIN
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'JoinWork API is running'}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': True, 'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': True, 'message': 'Internal server error'}), 500

@app.route('/api/admin/database', methods=['GET'])
def view_database():
    """Development only: aggregate counts from Firestore."""
    try:
        if not db:
            return jsonify({'error': True, 'message': 'Firestore not initialized'}), 500
        def with_id(coll_name, id_key):
            out = []
            for doc in db.collection(coll_name).stream():
                d = serialize_value(doc.to_dict())
                d[id_key] = int(doc.id) if doc.id.isdigit() else doc.id
                out.append(d)
            return out
        users_list = with_id('users', 'user_id')
        graduates_list = with_id('graduates', 'graduate_id')
        companies_list = with_id('companies', 'company_id')
        jobs_list = with_id('jobs', 'job_id')
        applications_list = with_id('applications', 'application_id')
        workshops_list = with_id('workshops', 'workshop_id')
        return jsonify({
            'error': False,
            'data': {
                'users': users_list,
                'graduates': graduates_list,
                'companies': companies_list,
                'jobs': jobs_list,
                'applications': applications_list,
                'workshops': workshops_list,
                'stats': {
                    'total_users': len(users_list),
                    'total_graduates': len(graduates_list),
                    'total_companies': len(companies_list),
                    'total_jobs': len(jobs_list),
                    'total_applications': len(applications_list),
                    'total_workshops': len(workshops_list),
                }
            }
        }), 200
    except Exception as e:
        print(f'View database error: {e}')
        return jsonify({'error': True, 'message': str(e)}), 500

if __name__ == '__main__':
    print('\n' + '='*60)
    print('  JoinWork - Backend (Flask + Firestore)')
    print('='*60)
    print('  Server: http://localhost:3000')
    print('  API:    http://localhost:3000/api')
    print('='*60)
    app.run(host='0.0.0.0', port=3000, debug=True)
