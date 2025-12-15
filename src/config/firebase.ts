import admin from 'firebase-admin';

const initializeFirebase = () => {
    if (!admin.apps.length) {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
    }

    return admin.firestore();
};

export const db = initializeFirebase();
export { admin };