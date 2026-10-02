import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import path from "path";

const serviceAccountPath = path.resolve(__dirname, "../../serviceAccountKey.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccountPath),
  });
}

export const auth = getAuth();
