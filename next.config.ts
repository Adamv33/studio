
import type {NextConfig} from 'next';

// Function to parse FIREBASE_WEBAPP_CONFIG and prepare env vars
const getFirebaseEnvVars = () => {
  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    console.log('[next.config.js] Attempting to use FIREBASE_WEBAPP_CONFIG for NEXT_PUBLIC_ env variables.');
    try {
      const firebaseWebAppConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      const envVars = {
        NEXT_PUBLIC_FIREBASE_API_KEY: firebaseWebAppConfig.apiKey,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseWebAppConfig.authDomain,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseWebAppConfig.projectId,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseWebAppConfig.storageBucket,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseWebAppConfig.messagingSenderId,
        NEXT_PUBLIC_FIREBASE_APP_ID: firebaseWebAppConfig.appId,
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: firebaseWebAppConfig.measurementId || undefined, // Ensure undefined if not present
      };
      console.log('[next.config.js] Successfully parsed FIREBASE_WEBAPP_CONFIG. NEXT_PUBLIC_FIREBASE_API_KEY will be set to:', firebaseWebAppConfig.apiKey ? '**********' : 'MISSING');
      return envVars;
    } catch (e) {
      console.error('[next.config.js] CRITICAL: Failed to parse FIREBASE_WEBAPP_CONFIG:', e);
      // Fallback to empty if parsing fails, though this should ideally fail the build on App Hosting if config is crucial and malformed.
      return {};
    }
  }
  console.log('[next.config.js] FIREBASE_WEBAPP_CONFIG not found. For local development, Next.js will use .env.local for NEXT_PUBLIC_ variables.');
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

export default nextConfig;
