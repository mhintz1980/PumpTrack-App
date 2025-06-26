// src/lib/firebase.ts

import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore as _getFirestore } from 'firebase-admin/firestore';

// Ensures only one Firebase Admin app instance is ever created
export function getFirestore() {
  // Hot reload guard: reuse existing app
  if (getApps().length) return _getFirestore();

  // This will automatically use the service account key at the file path
  // specified by GOOGLE_APPLICATION_CREDENTIALS in your .env.local
  initializeApp({
    credential: applicationDefault(),
  });

  const db = _getFirestore();

  // 🚩 Point to emulator if FIRESTORE_EMULATOR_HOST is set (local dev)
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    db.settings({
      host: process.env.FIRESTORE_EMULATOR_HOST,
      ssl: false,
    });
  }
  
  return db;
}
