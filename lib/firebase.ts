import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type UserCredential,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getApp(): FirebaseApp {
  return getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
}

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _googleProvider: GoogleAuthProvider | undefined;

const app: FirebaseApp = new Proxy({} as FirebaseApp, {
  get(_, prop) {
    if (!_app) _app = getApp();
    return Reflect.get(_app, prop);
  },
});

const auth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_auth) {
      if (!_app) _app = getApp();
      _auth = getAuth(_app);
    }
    return Reflect.get(_auth, prop);
  },
});

const db: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_db) {
      if (!_app) _app = getApp();
      _db = getFirestore(_app);
    }
    return Reflect.get(_db, prop);
  },
});

const googleProvider: GoogleAuthProvider = new Proxy(
  {} as GoogleAuthProvider,
  {
    get(_, prop) {
      if (!_googleProvider) {
        _googleProvider = new GoogleAuthProvider();
        _googleProvider.addScope("profile");
        _googleProvider.addScope("email");
      }
      return Reflect.get(_googleProvider, prop);
    },
  }
);

export { app, auth, db, googleProvider };

export async function signInWithGoogle(): Promise<UserCredential> {
  // Force lazy init before calling signInWithPopup
  if (!_auth) {
    if (!_app) _app = getApp();
    _auth = getAuth(_app);
  }
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.addScope("profile");
    _googleProvider.addScope("email");
  }
  return signInWithPopup(_auth, _googleProvider);
}

export async function signOutUser(): Promise<void> {
  if (!_auth) {
    if (!_app) _app = getApp();
    _auth = getAuth(_app);
  }
  return signOut(_auth);
}
