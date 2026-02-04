/**
 * JoinWork - Firebase Web SDK configuration (Serverless)
 *
 * 1. Firebase Console: https://console.firebase.google.com
 * 2. Select your project (or create one) > Project settings (gear) > General
 * 3. Under "Your apps", add a Web app if needed, then copy the firebaseConfig object
 * 4. Replace the values below (apiKey, authDomain, projectId, etc.)
 *
 * Scripts required before this file (already added in login, signup, dashboard, etc.):
 *   firebase-app-compat.js, firebase-firestore-compat.js
 */
(function () {
  var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  window.FIREBASE_CONFIG = firebaseConfig;

  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      window.db = firebase.firestore();
      console.log('[Firebase] Firestore initialized');
    } catch (e) {
      console.error('[Firebase] Init error:', e);
      window.db = null;
    }
  } else {
    console.warn('[Firebase] SDK not loaded. Add Firebase script tags before firebase-config.js');
    window.db = null;
  }
})();
