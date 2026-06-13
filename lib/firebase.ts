import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <--- NUEVA IMPORTACIÓN

/**
 * Hito 4.0 - Versión v.2.0
 * Configuración de Firebase - Soporte para Base de Datos, Almacenamiento y Autenticación
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "nodonet-ai-2026.firebaseapp.com",
  projectId: "nodonet-ai-2026",
  storageBucket: "nodonet-ai-2026.firebasestorage.app",
  messagingSenderId: "811700121378",
  appId: "1:811700121378:web:fb2d12141d1cab4b7bbf7b"
};

// Inicializar Firebase (Evita inicializar dos veces en Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializar Servicios
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // <--- NUEVA INSTANCIA DE AUTH
const googleProvider = new GoogleAuthProvider(); // <--- NUEVO PROVEEDOR DE GOOGLE

// Exportación de módulos para NodoNet AI
export { db, storage, auth, googleProvider }; // <--- EXPORTACIONES ACTUALIZADAS