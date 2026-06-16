import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * Hito 4.0 - Versión v.2.2
 * Configuración de Firebase - Soporte Multi-Tab Offline, Storage y Auth
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "nodonet-ai-2026.firebaseapp.com",
  projectId: "nodonet-ai-2026",
  storageBucket: "nodonet-ai-2026.firebasestorage.app",
  messagingSenderId: "811700121378",
  appId: "1:811700121378:web:fb2d12141d1cab4b7bbf7b"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Habilitar persistencia compartida para evitar bloqueos entre PC, Mac y Celulares
if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    console.warn("Advertencia de sincronización offline:", err.message);
  });
}

export { db, storage, auth, googleProvider };