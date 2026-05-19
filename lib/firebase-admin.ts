import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function parsePrivateKey(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) {
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set");
  }

  let key = raw;

  // Strip wrapping quotes if present (common when pasting from JSON files)
  key = key.replace(/^["']|["']$/g, "");

  // Convert literal \n strings to actual newlines (idempotent — does nothing if already real newlines)
  key = key.replace(/\\n/g, "\n");

  // Sanity check: must look like a PEM private key
  if (
    !key.includes("-----BEGIN PRIVATE KEY-----") ||
    !key.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY does not look like a valid PEM key. Expected to find -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- markers."
    );
  }

  return key;
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const key = parsePrivateKey();

  console.log("[firebase-admin] init for project:", projectId, "key prefix:", key.slice(0, 30));

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: key,
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
