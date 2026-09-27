import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import path from "path";
import { readFileSync } from "fs";

function getServiceAccount(): ServiceAccount | undefined {
  // First try environment variable (for Vercel deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      // Support both raw JSON and base64-encoded JSON
      const jsonStr = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonStr);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return parsed as ServiceAccount;
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var:", e);
    }
  }

  // Fallback to credentials.json file (for local development)
  try {
    const credPath = path.join(process.cwd(), "credentials.json");
    const credFile = readFileSync(credPath, "utf-8");
    const parsed = JSON.parse(credFile);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed as ServiceAccount;
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
const adminAuth = getAuth(adminApp);

export { adminApp, adminDb, adminAuth };

