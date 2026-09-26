import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { readFileSync } from "fs";

function getServiceAccount(): ServiceAccount | undefined {
  // First try environment variable (for Vercel deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
    } catch {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var");
    }
  }

  // Fallback to credentials.json file (for local development)
  try {
    const credPath = path.join(process.cwd(), "credentials.json");
    const credFile = readFileSync(credPath, "utf-8");
    return JSON.parse(credFile) as ServiceAccount;
  } catch {
    console.warn("No Firebase credentials found. Some features may not work.");
    return undefined;
  }
}

const serviceAccount = getServiceAccount();

const adminApp =
  getApps().length === 0
    ? serviceAccount
      ? initializeApp({ credential: cert(serviceAccount) })
      : initializeApp()
    : getApps()[0];

const adminDb = getFirestore(adminApp);

export { adminApp, adminDb };
