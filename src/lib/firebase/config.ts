// This file will hold your Firebase project configuration.

const isServer = typeof window === 'undefined';

let firebaseConfigData = {
  apiKey: undefined as string | undefined,
  authDomain: undefined as string | undefined,
  projectId: undefined as string | undefined,
  storageBucket: undefined as string | undefined,
  messagingSenderId: undefined as string | undefined,
  appId: undefined as string | undefined,
  measurementId: undefined as string | undefined,
};

// Logic to determine which config source to use
if (isServer && process.env.FIREBASE_WEBAPP_CONFIG) {
  // SERVER-SIDE (App Hosting build/runtime): Use FIREBASE_WEBAPP_CONFIG
  console.log("======================================================================");
  console.log("[BUILD_TIME_CONFIG_LOG] Using FIREBASE_WEBAPP_CONFIG (from App Hosting environment)");
  try {
    const webAppConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    firebaseConfigData = {
      apiKey: webAppConfig.apiKey,
      authDomain: webAppConfig.authDomain,
      projectId: webAppConfig.projectId,
      storageBucket: webAppConfig.storageBucket,
      messagingSenderId: webAppConfig.messagingSenderId,
      appId: webAppConfig.appId,
      measurementId: webAppConfig.measurementId || undefined,
    };
    console.log("[BUILD_TIME_CONFIG_LOG] Successfully parsed FIREBASE_WEBAPP_CONFIG.");
    console.log("[BUILD_TIME_CONFIG_LOG] API Key from FIREBASE_WEBAPP_CONFIG:", firebaseConfigData.apiKey ? `'${firebaseConfigData.apiKey.substring(0,10)}...'` : 'MISSING');
  } catch (e) {
    console.error("[BUILD_TIME_CONFIG_LOG] CRITICAL: Failed to parse FIREBASE_WEBAPP_CONFIG:", e);
    console.error("[BUILD_TIME_CONFIG_LOG] FIREBASE_WEBAPP_CONFIG string was:", process.env.FIREBASE_WEBAPP_CONFIG);
    // Fallback to NEXT_PUBLIC_ if server-side parsing fails (shouldn't happen in App Hosting if var is set)
    firebaseConfigData = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    console.log("[BUILD_TIME_CONFIG_LOG] Fell back to NEXT_PUBLIC_ variables due to FIREBASE_WEBAPP_CONFIG parsing error.");
  }
} else {
  // CLIENT-SIDE or SERVER-SIDE (local dev, or if FIREBASE_WEBAPP_CONFIG is not set on server): Use NEXT_PUBLIC_ variables
  // NEXT_PUBLIC_ variables are inlined by Next.js build process if next.config.ts sets them in `env`
  if(isServer) { // Specifically for local dev server-side, or server-side if FIREBASE_WEBAPP_CONFIG was unexpectedly missing
    console.log("======================================================================");
    console.log("[BUILD_TIME_CONFIG_LOG] FIREBASE_WEBAPP_CONFIG not found or not server. Using NEXT_PUBLIC_ variables (expected for local dev server-side, or client-side).");
  }
  firebaseConfigData = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

export const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId,
};

// Final log to show what's being exported by this module
const finalLogContext = isServer ? "[BUILD_TIME_FINAL_CONFIG_LOG]" : "[CLIENT_SIDE_FINAL_CONFIG_LOG]";
console.log("======================================================================");
console.log("======================================================================");
console.log(`${finalLogContext} Final Firebase config values being EXPORTED from src/lib/firebase/config.ts:`);
console.log(`${finalLogContext} apiKey: ${firebaseConfig.apiKey ? `'${firebaseConfig.apiKey.substring(0,10)}...' (length: ${firebaseConfig.apiKey.length})` : 'MISSING or empty'}`);
console.log(`${finalLogContext} authDomain: ${firebaseConfig.authDomain || 'MISSING or empty'}`);
console.log(`${finalLogContext} projectId: ${firebaseConfig.projectId || 'MISSING or empty'}`);
console.log(`${finalLogContext} storageBucket: ${firebaseConfig.storageBucket || 'MISSING or empty (Optional)'}`);
console.log(`${finalLogContext} messagingSenderId: ${firebaseConfig.messagingSenderId || 'MISSING or empty (Optional)'}`);
console.log(`${finalLogContext} appId: ${firebaseConfig.appId || 'MISSING or empty'}`);
console.log(`${finalLogContext} measurementId: ${firebaseConfig.measurementId || 'MISSING or empty (Optional)'}`);
console.log("======================================================================");

// Client-side specific development logging (won't run during App Hosting build's server pass for this file)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log("======================================================================");
  console.log("%cCLIENT_SIDE_DEV_LOG: Firebase Config Loaded by App in DEV MODE (from src/lib/firebase/config.ts):", "color: blue; font-weight: bold;", firebaseConfig);
  // Add any specific client-side development checks here if needed
}