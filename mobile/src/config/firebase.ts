import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5URvj8Vu8dNBkz9ygKBDKxzakRWPtCos",
  authDomain: "playmate-4ee9f.firebaseapp.com",
  projectId: "playmate-4ee9f",
  storageBucket: "playmate-4ee9f.firebasestorage.app",
  messagingSenderId: "913429327705",
  appId: "1:913429327705:web:d3414ab97494c8b8c92648",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
