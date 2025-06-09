
// This file will hold your Firebase project configuration.
// IMPORTANT: Replace the placeholder values below with your actual
// Firebase project's configuration.

// HOW TO GET THESE VALUES:
// 1. Go to the Firebase Console: https://console.firebase.google.com/
// 2. Select your project (e.g., "instructorhub-nkxkd").
// 3. Click on "Project settings" (the gear icon ⚙️ in the left sidebar).
// 4. Under the "General" tab, scroll down to the "Your apps" section.
// 5. If you have a Web app (</>) registered, click on it. If not, add one.
// 6. Find the "Firebase SDK snippet" and select the "Config" option.
// 7. You'll see an object with keys like apiKey, authDomain, projectId, etc.

// HOW TO USE WITH .env.local:
// Create a file named `.env.local` in the ROOT of your project.
// Add the values from the Firebase Console to this file, prefixed with `NEXT_PUBLIC_`.
// For example:
//
// NEXT_PUBLIC_FIREBASE_API_KEY="AIzaS..."
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
// NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="12345..."
// NEXT_PUBLIC_FIREBASE_APP_ID="1:12345...:web:abc123..."
// NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XYZ..." (Optional)
//
// !! AFTER CREATING OR MODIFYING .env.local, YOU MUST RESTART YOUR NEXT.JS DEVELOPMENT SERVER !!

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID" // Optional
};
