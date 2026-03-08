const admin = require('firebase-admin');

try {
    if (!admin.apps.length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin initialized with service account from ENV");
        } else {
            // Expected to be configured via environment variable: GOOGLE_APPLICATION_CREDENTIALS
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log("Firebase Admin initialized with applicationDefault()");
        }
    }
} catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
    console.log("Ensure FIREBASE_SERVICE_ACCOUNT (JSON string) or GOOGLE_APPLICATION_CREDENTIALS is set.");
}

module.exports = admin;
