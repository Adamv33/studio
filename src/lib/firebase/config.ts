/home/user/studio/next.config.ts file:

import type { NextConfig } from 'next';

// Function to parse FIREBASE_WEBAPP_CONFIG and prepare env vars
const getFirebaseEnvVars = () => {
  console.log("======================================================================");
  console.log("[next.config.ts] getFirebaseEnvVars FUNCTION CALLED.");
  console.log("======================================================================");

  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    console.log("[next.config.ts] FIREBASE_WEBAPP_CONFIG IS PRESENT. Attempting to parse and use for NEXT_PUBLIC_ env variables.");
    try {
      const firebaseWebAppConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      const envVars = {
        NEXT_PUBLIC_FIREBASE_API_KEY: firebaseWebAppConfig.apiKey,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseWebAppConfig.authDomain,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseWebAppConfig.projectId,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseWebAppConfig.storageBucket,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseWebAppConfig.messagingSenderId,
        NEXT_PUBLIC_FIREBASE_APP_ID: firebaseWebAppConfig.appId,
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: firebaseWebAppConfig.measurementId || undefined,
      };
      console.log("[next.config.ts] Successfully parsed FIREBASE_WEBAPP_CONFIG.");
      console.log("[next.config.ts] API Key from FIREBASE_WEBAPP_CONFIG that will be set for NEXT_PUBLIC_FIREBASE_API_KEY:", firebaseWebAppConfig.apiKey ? '********** (exists)' : 'MISSING in parsed config');
      console.log("[next.config.ts] envVars object to be returned:", JSON.stringify(envVars, (key, value) => key === 'NEXT_PUBLIC_FIREBASE_API_KEY' && value ? '**********' : value));
      return envVars;
    } catch (e) {
      console.error("[next.config.ts] CRITICAL: Failed to parse FIREBASE_WEBAPP_CONFIG:", e);
      console.error("[next.config.ts] FIREBASE_WEBAPP_CONFIG string was:", process.env.FIREBASE_WEBAPP_CONFIG);
      return {}; // Fallback to empty if parsing fails
    }
  }
  console.log("[next.config.ts] FIREBASE_WEBAPP_CONFIG NOT FOUND. For local development, Next.js will use .env.local for NEXT_PUBLIC_ variables (if defined there). Returning empty object from getFirebaseEnvVars.");
  // For local development, Next.js automatically loads .env.local.
  // Returning empty here ensures we don't override .env.local values if this runs locally without FIREBASE_WEBAPP_CONFIG.
  return {};
};

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Make the Firebase config available to the Next.js build process and client-side.
  env: getFirebaseEnvVars(),
};

console.log("======================================================================");
console.log("[next.config.ts] File processed. nextConfig object created.");
console.log("[next.config.ts] Value of nextConfig.env based on getFirebaseEnvVars:", JSON.stringify(nextConfig.env, (key, value) => key === 'NEXT_PUBLIC_FIREBASE_API_KEY' && value ? '**********' : value));
console.log("======================================================================");

export default nextConfig;