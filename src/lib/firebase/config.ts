// This file will hold your Firebase project configuration.
// It reads its values from environment variables that should be
// defined in a .env.local file in the ROOT of your project.

// ========================================================================
// !! CRITICAL !! HOW TO CREATE AND POPULATE YOUR .env.local FILE:
// (Instructions omitted for brevity, but were present in original file)
// ========================================================================

// Log process.env to see what's available during build/runtime
// Check if running in a server-side context (like Next.js build or server components)
const isServer = typeof window === 'undefined';

if (isServer) {
  console.log("======================================================================");
  console.log("======================================================================");
  console.log("[BUILD_TIME_ENV_LOG] SERVER-SIDE (BUILD PHASE) LOGGING INITIATED.");
  console.log("[BUILD_TIME_ENV_LOG] Logging all process.env keys available to firebase/config.ts (build phase):");
  Object.keys(process.env).forEach(key => {
    // Log common CI/CD and Firebase related env vars, plus NEXT_PUBLIC vars
    if (key.startsWith('NEXT_PUBLIC_') || key.startsWith('FIREBASE_') || key.includes('VERCEL') || key.includes('NODE_ENV') || key.includes('CI') || key.includes('GITHUB_') || key.startsWith('GOOGLE_') || key.startsWith('CLOUD_') || key.startsWith('XDG_')) {
      console.log(`[BUILD_TIME_ENV_LOG] process.env.${key}=${process.env[key]}`);
    }
  });
  console.log("[BUILD_TIME_ENV_LOG] --- End of relevant process.env keys ---");
  console.log("======================================================================");
  console.log("======================================================================");
}


export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Enhanced logging logic
const logContext = isServer ? "[BUILD_TIME_CONFIG_LOG]" : "[CLIENT_SIDE_CONFIG_LOG]";

console.log("======================================================================");
console.log("======================================================================");
console.log(`${logContext} Firebase config values being USED by the application IN firebaseConfig OBJECT:`);
console.log(`${logContext} apiKey (from process.env.NEXT_PUBLIC_FIREBASE_API_KEY): ${firebaseConfig.apiKey ? `'${firebaseConfig.apiKey}' (length: ${firebaseConfig.apiKey.length})` : 'MISSING or empty'}`);
console.log(`${logContext} authDomain (from process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN): ${firebaseConfig.authDomain || 'MISSING or empty'}`);
console.log(`${logContext} projectId (from process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID): ${firebaseConfig.projectId || 'MISSING or empty'}`);
console.log(`${logContext} storageBucket (from process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET): ${firebaseConfig.storageBucket || 'MISSING or empty (Optional if not using Storage)'}`);
console.log(`${logContext} messagingSenderId (from process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID): ${firebaseConfig.messagingSenderId || 'MISSING or empty (Optional)'}`);
console.log(`${logContext} appId (from process.env.NEXT_PUBLIC_FIREBASE_APP_ID): ${firebaseConfig.appId || 'MISSING or empty'}`);
console.log(`${logContext} measurementId (from process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID): ${firebaseConfig.measurementId || 'MISSING or empty (Optional)'}`);
console.log("======================================================================");
console.log("======================================================================");


// Original console logs for client-side debugging in development (can be helpful)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log("======================================================================");
  console.log("%cCLIENT_SIDE_DEV_LOG: Firebase Config Loaded by App:", "color: blue; font-weight: bold;", firebaseConfig);

  const placeholderValues = ["YOUR_API_KEY", "YOUR_AUTH_DOMAIN", "YOUR_PROJECT_ID", "YOUR_STORAGE_BUCKET", "YOUR_MESSAGING_SENDER_ID", "YOUR_APP_ID", "AIzaSy..................."];
  let criticalErrorFound = false;

  if (!firebaseConfig.apiKey || placeholderValues.some(p => firebaseConfig.apiKey?.includes(p))) {
    console.error(
      "CLIENT_SIDE_DEV_LOG: CRITICAL: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing, using a placeholder, or seems incomplete in .env.local. " +
      "Please verify .env.local and RESTART your dev server."
    );
    criticalErrorFound = true;
  }
   if (!firebaseConfig.projectId || placeholderValues.some(p => firebaseConfig.projectId?.includes(p))) {
    console.error("CLIENT_SIDE_DEV_LOG: CRITICAL: Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing or a placeholder in .env.local. Verify and RESTART dev server.");
    criticalErrorFound = true;
  }
   if (!firebaseConfig.appId || placeholderValues.some(p => firebaseConfig.appId?.includes(p))) {
    console.error("CLIENT_SIDE_DEV_LOG: CRITICAL: Firebase App ID (NEXT_PUBLIC_FIREBASE_APP_ID) is missing or a placeholder in .env.local. Verify and RESTART dev server.");
    criticalErrorFound = true;
  }


  if (criticalErrorFound) {
     console.error("%cCLIENT_SIDE_DEV_LOG: One or more critical Firebase config values are missing or incorrect. Please check .env.local and RESTART your dev server.", "color: red; font-weight: bold; font-size: 1.1em;");
  } else {
     console.log("%cCLIENT_SIDE_DEV_LOG: Basic Firebase config keys seem to be present in .env.local for client-side dev.", "color: green;");
  }
  console.log("======================================================================");
}
