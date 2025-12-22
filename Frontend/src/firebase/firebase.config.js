// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration (guarded)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_Auth_Domain,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDERID,
  appId: import.meta.env.VITE_APPID
};

let app;
let authInstance;
let firebaseInitialized = false;

// Only initialize Firebase if a (likely) valid apiKey is present
if (firebaseConfig.apiKey && typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.length > 5) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    firebaseInitialized = true;
  } catch (e) {
    // If initialization fails, log and fallback to undefined auth
    console.error('Firebase initialization failed:', e);
    authInstance = undefined;
    firebaseInitialized = false;
  }
} else {
  console.warn('Firebase config missing or incomplete. Firebase will not be initialized.');
}

export const auth = authInstance;
export const firebaseInitializedFlag = firebaseInitialized;