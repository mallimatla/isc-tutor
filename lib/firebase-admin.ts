import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export function parsePrivateKey(): string {
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

// Check if required env vars are present (build-time guard)
const hasEnvVars =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_CLIENT_EMAIL &&
  !!process.env.FIREBASE_PRIVATE_KEY;

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

if (hasEnvVars) {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const key = parsePrivateKey();

    console.log(
      "[firebase-admin] init for project:",
      projectId,
      "client_email prefix:",
      (clientEmail ?? "").slice(0, 50),
      "key length:",
      key.length,
      "key suffix:",
      key.slice(-50)
    );

    adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: key }),
    });
  }

  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
} else {
  // Build-time: env vars not available — export stubs that throw at runtime
  const unavailable = (name: string): never => {
    throw new Error(
      `[firebase-admin] ${name} called but Firebase Admin SDK is not initialized. Missing env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY.`
    );
  };

  adminApp = new Proxy({} as App, {
    get() {
      return unavailable("adminApp");
    },
  });
  adminAuth = new Proxy({} as Auth, {
    get() {
      return unavailable("adminAuth");
    },
  });
  adminDb = new Proxy({} as Firestore, {
    get() {
      return unavailable("adminDb");
    },
  });
}

/**
 * Returns a prefixed Firestore collection name.
 * All server-side code should use this instead of raw collection names.
 */
function col(name: string): string {
  return `${process.env.FIRESTORE_COLLECTION_PREFIX || ""}${name}`;
}

export { adminApp, adminAuth, adminDb, col };
