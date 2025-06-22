// Central Firestore initialiser – avoids multiple app instances
import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore as _getFirestore } from 'firebase-admin/firestore';

export const getFirestore = () => {
  if (!getApps().length) {
    initializeApp({
      credential: cert(
        JSON.parse(process.env.FIREBASE_ADMIN_KEY! as string) as ServiceAccount
      ),
    });
  }
  return _getFirestore();
};
