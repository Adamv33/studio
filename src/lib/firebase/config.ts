// This file will hold your Firebase project configuration.

const isServer = typeof window === 'undefined';

let firebaseConfigData: any;

if (isServer && process.env.FIREBASE_WEBAPP_CONFIG) {
  // In App Hosting build/runtime, FIREBASE_WEBAPP_CONFIG is provided.
  console.log("======================================================================");
  console.log("[BUILD_TIME_CONFIG_LOG] Using FIREBASE_WEBAPP_CONFIG (from App Hosting environment)");
  try {
    firebaseConfigData = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    console.log("[BUILD_TIME_CONFIG_LOG] Successfully parsed FIREBASE_WEBAPP_CONFIG.");
    console.log(`[BUILD_TIME_CONFIG_LOG] API Key from FIREBASE_WEBAPP_CONFIG: '${firebaseConfigData.apiKey ? firebaseConfigData.apiKey.substring(0,10) + '...' : 'MISSING'}'`);
  } catch (e) {
    console.error("[BUILD_TIME_CONFIG_LOG] CRITICAL: Failed to parse FIREBASE_WEBAPP_CONFIG:", e);
    console.error("[BUILD_TIME_CONFIG_LOG] FIREBASE_WEBAPP_CONFIG string was:", process.env.FIREBASE_WEBAPP_CONFIG);
    // Fallback or throw error, for now, let it proceed to use NEXT_PUBLIC variables which will likely fail
    firebaseConfigData = {};
  }
  console.log("======================================================================");
} else {
  // Local development or environment where FIREBASE_WEBAPP_CONFIG is not set.
  // Expects .env.local to provide NEXT_PUBLIC_ variables.
  if (isServer) { // Still log if it's a server environment but not App Hosting with the specific var
    console.log("======================================================================");
    console.log("[BUILD_TIME_CONFIG_LOG] FIREBASE_WEBAPP_CONFIG not found or not server. Attempting to use NEXT_PUBLIC_ variables (expected for local dev).");
    console.log("======================================================================");
  }
  firebaseConfigData = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
}

export const firebaseConfig = firebaseConfigData;

// Logging the final config being used
const logContext = isServer ? "[BUILD_TIME_FINAL_CONFIG_LOG]" : "[CLIENT_SIDE_FINAL_CONFIG_LOG]";

console.log("======================================================================");
console.log(`${logContext} Final Firebase config values being EXPORTED:`);
console.log(`${logContext} apiKey: ${firebaseConfig.apiKey ? `'${firebaseConfig.apiKey.substring(0,10)}...' (length: ${firebaseConfig.apiKey.length})` : 'MISSING or empty'}`);
console.log(`${logContext} authDomain: ${firebaseConfig.authDomain || 'MISSING or empty'}`);
console.log(`${logContext} projectId: ${firebaseConfig.projectId || 'MISSING or empty'}`);
console.log(`${logContext} storageBucket: ${firebaseConfig.storageBucket || 'MISSING or empty (Optional)'}`);
console.log(`${logContext} messagingSenderId: ${firebaseConfig.messagingSenderId || 'MISSING or empty (Optional)'}`);
console.log(`${logContext} appId: ${firebaseConfig.appId || 'MISSING or empty'}`);
console.log(`${logContext} measurementId: ${firebaseConfig.measurementId || 'MISSING or empty (Optional)'}`);
console.log("======================================================================");


// Client-side specific logs for development, if needed for local verification
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log("======================================================================");
  console.log("%cCLIENT_SIDE_DEV_LOG: Firebase Config Loaded by App:", "color: blue; font-weight: bold;", firebaseConfig);

  // You can add checks here for NEXT_PUBLIC_ variables if you want to ensure .env.local is working for local dev
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn(
      "CLIENT_SIDE_DEV_LOG: NEXT_PUBLIC_FIREBASE_API_KEY is not set in your .env.local. " +
      "This is fine if deploying to App Hosting (which uses FIREBASE_WEBAPP_CONFIG), " +
      "but local Firebase features might not work without it."
    );
  }
  console.log("======================================================================");
}
