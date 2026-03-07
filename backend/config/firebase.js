const admin = require('firebase-admin');

try {
    // Expected to be configured via environment variable: GOOGLE_APPLICATION_CREDENTIALS
    // or by passing a serviceAccount to initializeApp()
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log("Firebase Admin initialized successfully");
    }
} catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
    console.log("Ensure GOOGLE_APPLICATION_CREDENTIALS is set or provide a service account config.");
}

module.exports = admin;
