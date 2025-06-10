
// This file will hold your Firebase project configuration.
// It reads its values from environment variables that should be
// defined in a .env.local file in the ROOT of your project.

// ========================================================================
// !! CRITICAL !! HOW TO CREATE AND POPULATE YOUR .env.local FILE:
// ========================================================================
//
// 1. In the ABSOLUTE ROOT directory of your project (the same folder that
//    contains package.json, src, next.config.ts), create a file named EXACTLY:
//
//    .env.local
//
//    (Note the leading dot and all lowercase letters)
//
// 2. Go to the Firebase Console: https://console.firebase.google.com/
//
// 3. Select your Firebase project (e.g., "instructorhub-nkxkd").
//
// 4. Click on "Project settings" (the gear icon ⚙️ in the left sidebar).
//
// 5. Under the "General" tab, scroll down to the "Your apps" section.
//
// 6. If you have a Web app (</>) registered, click on it. If not, click "Add app"
//    and select the Web icon (</>) to register one. Give it a nickname (e.g., "InstructPoint Web App").
//
// 7. Find the "SDK setup and configuration" section and select the "Config" option.
//    You will see an object similar to this:
//
//    const firebaseConfig = {
//      apiKey: "AIzaS...",
//      authDomain: "your-project-id.firebaseapp.com",
//      projectId: "your-project-id",
//      storageBucket: "your-project-id.appspot.com",
//      messagingSenderId: "12345...",
//      appId: "1:12345...:web:abc123...",
//      measurementId: "G-XYZ..." // This one is optional
//    };
//
// 8. Copy these values into your .env.local file, using the
//    NEXT_PUBLIC_ prefix for each key. The file content should be PLAIN TEXT like this:
//
//    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaS..."
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
//    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
//    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
//    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="12345..."
//    NEXT_PUBLIC_FIREBASE_APP_ID="1:12345...:web:abc123..."
//    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XYZ..." // Optional
//
//    Replace "your-project-id", "AIzaS...", etc., with YOUR ACTUAL values from
//    the Firebase console. Ensure there are no extra spaces or quotes unless
//    they are part of the actual value (which is rare).
//
// 9. !! AFTER CREATING OR MODIFYING .env.local, YOU MUST RESTART YOUR NEXT.JS DEVELOPMENT SERVER !!
//    (Stop `npm run dev` with Ctrl+C in your terminal, then run `npm run dev` again).
//    Next.js only loads these variables at build time or when the dev server starts.
//
// ========================================================================

// Log process.env to see what's available during build/runtime
// Check if running in a server-side context (like Next.js build or server components)
const isServer = typeof window === 'undefined';
if (isServer) {
  console.log("[BUILD_TIME_ENV_LOG] Logging all process.env keys available to firebase/config.ts:");
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_') || key.startsWith('FIREBASE_') || key.includes('VERCEL') || key.includes('NODE_ENV')) {
      console.log(`[BUILD_TIME_ENV_LOG] ${key}=${process.env[key]}`);
    }
  });
  console.log("[BUILD_TIME_ENV_LOG] --- End of relevant process.env keys ---");
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

console.log(`${logContext} Attempting to read Firebase config values from process.env:`);
console.log(`${logContext} NEXT_PUBLIC_FIREBASE_API_KEY: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `'${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}' (length: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length})` : 'MISSING or empty'}`);
console.log(`${logContext} NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING or empty'}`);
console.log(`${logContext} NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING or empty'}`);
console.log(`${logContext} NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING or empty (Optional if not using Storage)'}`);
console.log(`${logContext} NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'MISSING or empty (Optional)'}`);
console.log(`${logContext} NEXT_PUBLIC_FIREBASE_APP_ID: ${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'MISSING or empty'}`);
console.log(`${logContext} NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'MISSING or empty (Optional)'}`);

console.log(`${logContext} Final firebaseConfig object constructed:`, firebaseConfig);


// Original console logs for client-side debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log("%cFirebase Config Loaded by App (from original log block):", "color: blue; font-weight: bold;", firebaseConfig);

  const placeholderValues = ["YOUR_API_KEY", "YOUR_AUTH_DOMAIN", "YOUR_PROJECT_ID", "YOUR_STORAGE_BUCKET", "YOUR_MESSAGING_SENDER_ID", "YOUR_APP_ID", "AIzaSy..................."];
  let criticalErrorFound = false;

  if (!firebaseConfig.apiKey || placeholderValues.some(p => firebaseConfig.apiKey?.includes(p))) {
    console.error(
      "CRITICAL (from original log block): Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing, using a placeholder, or seems incomplete in .env.local. " +
      "Please verify .env.local and RESTART your dev server."
    );
    criticalErrorFound = true;
  }
  if (!firebaseConfig.projectId || placeholderValues.some(p => firebaseConfig.projectId?.includes(p))) {
    console.error(
      "CRITICAL (from original log block): Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing or using a placeholder in .env.local. " +
      "Please verify .env.local and RESTART your dev server."
    );
    criticalErrorFound = true;
  }
   if (!firebaseConfig.authDomain) {
    console.warn("(from original log block) Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) is missing or empty in .env.local. This is usually required.");
     criticalErrorFound = true; // Assuming this is critical if missing
  }
   // Other optional checks from original log block...

  if (criticalErrorFound) {
     console.error("%c(from original log block) One or more critical Firebase config values are missing or incorrect. Please check .env.local and RESTART your dev server.", "color: red; font-weight: bold; font-size: 1.1em;");
  } else {
     console.log("%c(from original log block) Basic Firebase config keys seem to be present in .env.local for client-side dev.", "color: green;");
  }
}
