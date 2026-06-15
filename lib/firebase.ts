import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * Hito 4.0 - Versión v.2.1
 * Configuración de Firebase - Soporte Offline, Storage y Auth
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

// Habilitar la "magia" de persistencia Offline solo en el lado del cliente
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Persistencia advertencia: Múltiples pestañas abiertas.");
    } else if (err.code === 'unimplemented') {
      console.warn("El navegador no soporta persistencia offline.");
    }
  });
}

export { db, storage, auth, googleProvider };