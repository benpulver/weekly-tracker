import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { AppState } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyB4aRY4EhPPDsKekK8TSFy_-kHgs6DJGEk",
  authDomain: "weekly-tracker-46bff.firebaseapp.com",
  projectId: "weekly-tracker-46bff",
  storageBucket: "weekly-tracker-46bff.firebasestorage.app",
  messagingSenderId: "387427970977",
  appId: "1:387427970977:web:2b61bf1a4b60108b3ee5e0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export async function login() {
  return signInWithPopup(auth, provider);
}

export async function logout() {
  return signOut(auth);
}

export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function saveToCloud(uid: string, state: AppState) {
  await setDoc(doc(db, 'users', uid), { data: JSON.stringify(state), updatedAt: Date.now() });
}

export async function loadFromCloud(uid: string): Promise<AppState | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    return JSON.parse(snap.data().data);
  }
  return null;
}
