
// This file will hold your Firebase project configuration.
// It reads its values from environment variables that should be
// defined in a .env.local file in the ROOT of your project.

// ========================================================================
// !! IMPORTANT !! HOW TO CREATE AND POPULATE YOUR .env.local FILE:
// ========================================================================
//
// 1. In the ROOT directory of your project, create a file named:
//    .env.local
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
//    and select the Web icon (</>) to register one.
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
//    NEXT_PUBLIC_ prefix for each key. It should look like this:
//
//    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaS..."
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
//    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
//    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
//    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="12345..."
//    NEXT_PUBLIC_FIREBASE_APP_ID="1:12345...:web:abc123..."
//    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XYZ..."
//
//    Replace "your-project-id", "AIzaS...", etc., with YOUR ACTUAL values from
//    the Firebase console.
//
// 9. !! AFTER CREATING OR MODIFYING .env.local, YOU MUST RESTART YOUR NEXT.JS DEVELOPMENT SERVER !!
//    (Stop `npm run dev` with Ctrl+C, then run `npm run dev` again).
//
// ========================================================================

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Check if all required config values are present (especially for client-side)
// This helps catch issues early if .env.local is not set up correctly.
if (typeof window !== 'undefined') { // Only run this check on the client-side
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.error(
      "Firebase API Key is missing or using placeholder. " +
      "Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set correctly in your .env.local file " +
      "and that you have restarted your development server."
    );
  }
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.error(
      "Firebase Project ID is missing or using placeholder. " +
      "Ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set correctly in your .env.local file " +
      "and that you have restarted your development server."
    );
  }
  // Add more checks for other critical variables if needed
}
