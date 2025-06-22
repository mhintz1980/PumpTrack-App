// Central Firestore initialiser – avoids multiple app instances
import { getApps, initializeApp, cert, applicationDefault, ServiceAccount } from 'firebase-admin/app';
import { getFirestore as _getFirestore } from 'firebase-admin/firestore';

export function getFirestore() {
  // If an app is already initialised (e.g. hot reload) reuse it
  if (getApps().length) return _getFirestore();

  // • Locally / prod:  use the JSON-string service account from env
  // • On Workstations / Cloud Shell: fall back to ADC
  if (process.env.FIREBASE_ADMIN_KEY) {
    initializeApp({
      credential: cert(
        JSON.parse(process.env.FIREBASE_ADMIN_KEY) as ServiceAccount
      ),
    });
  } else {
    initializeApp({ credential: applicationDefault() });
  }

  return _getFirestore();
}