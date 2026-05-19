import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

let _app: App | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

const adminApp: App = new Proxy({} as App, {
  get(_, prop) {
    if (!_app) _app = getAdminApp();
    return Reflect.get(_app, prop);
  },
});

const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_auth) {
      if (!_app) _app = getAdminApp();
      _auth = getAuth(_app);
    }
    return Reflect.get(_auth, prop);
  },
});

const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_db) {
      if (!_app) _app = getAdminApp();
      _db = getFirestore(_app);
    }
    return Reflect.get(_db, prop);
  },
});

/**
 * Returns a prefixed Firestore collection name.
 * All server-side code should use this instead of raw collection names.
 */
function col(name: string): string {
  return `${process.env.FIRESTORE_COLLECTION_PREFIX || ""}${name}`;
}

export { adminApp, adminAuth, adminDb, col };
