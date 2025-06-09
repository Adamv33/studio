
# InstructPoint

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Important Note on Data Persistence & Initial Setup

Currently, this application uses **mock data** (found in `src/data/mockData.ts`) for all instructor information, courses, and documents. This means:
- Data is temporary and will reset when the server restarts.
- Data is not shared between users or sessions.

**For the application to function correctly with real user authentication, data persistence, and to avoid common runtime errors (like "404 Not Found" for database access, "client is offline" Firestore errors, or "500 Internal Server Error" during page loads), the following Firebase backend services MUST be set up and integrated:**

### 1. Configure Firebase Environment Variables (`.env.local`)

*   Create a file named `.env.local` in the root directory of your project (if it doesn't already exist).
*   Go to your Firebase project settings in the [Firebase Console](https://console.firebase.google.com/).
*   Under "Your apps", select your web app.
*   Find the "Firebase SDK snippet" and choose the "Config" option.
*   Copy the Firebase configuration values and add them to your `.env.local` file, prefixing each key with `NEXT_PUBLIC_`:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID" # Optional
    ```
*   **Important:** After creating or modifying `.env.local`, you **MUST restart your Next.js development server** (e.g., stop and re-run `npm run dev`).

### 2. Enable Firebase Authentication

*   In the Firebase Console, go to "Build" > "Authentication".
*   Click "Get started".
*   Under the "Sign-in method" tab, enable the "Email/Password" provider (and any others you plan to use).

### 3. Enable and Configure Cloud Firestore

*   Go to the Firebase Console > Your Project > **Build** > **Firestore Database**.
*   Click **"Create database"**.
    *   **Choose a Mode:** Start in **Production mode** (secure by default) or **Test mode**.
        *   **Test mode** allows open access for a limited time (e.g., `allow read, write: if request.time < timestamp.date(202X, MM, DD);`). This is useful for initial development to avoid permission errors.
        *   **Production mode** starts with locked-down rules (`allow read, write: if false;`). You will need to edit these.
    *   **Choose a Location (Region):** Select a region for your database (e.g., `us-central1`). This cannot be changed later.
*   **Set Security Rules:**
    *   Go to the "Rules" tab in the Firestore Database section.
    *   For initial development and testing the connection, you can use permissive rules. **These are NOT secure for production.**
        ```rules
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allows all authenticated users to read and write all documents
            match /{document=**} {
              allow read, write: if request.auth != null;
            }
          }
        }
        ```
    *   Click **Publish**.
    *   **Remember to implement proper, granular security rules before deploying to production.**

### 4. Check Enabled Google Cloud APIs

*   Ensure your Firebase project is linked to a Google Cloud project.
*   Go to the [Google Cloud Console](https://console.cloud.google.com/).
*   Select the correct project (it should match your Firebase project ID).
*   Navigate to "APIs & Services" > "Enabled APIs & services".
*   Verify that the following APIs are **ENABLED**:
    *   **Cloud Firestore API** (Crucial for Firestore connectivity)
    *   **Identity Platform API** (Used by Firebase Authentication)
    *   **Cloud Storage API** (If you plan to use Firebase Storage for file uploads)
    *   And any other Google Cloud services your app might use (like Vertex AI for Genkit).

### 5. Ensure Firebase App Hosting is Set Up and Deployed (for Production)

*   Your application needs to be successfully deployed to Firebase App Hosting for production use.
*   Deploy your application using the Firebase CLI: `firebase apphosting:backends:deploy` from your project root.

### 6. Configure AI Service Permissions (for Genkit features)

*   Grant the "Vertex AI User" role to your App Hosting service account in the Google Cloud IAM settings.
*   To find your service account name:
    *   Go to the Google Cloud Console > IAM & Admin > IAM.
    *   Find the service account (e.g., `service-PROJECT_NUMBER@gcp-sa-apphosting.iam.gserviceaccount.com` or similar).
    *   Edit its roles, add "Vertex AI User", and save.

After enabling these services, successfully deploying (for production), and ensuring your `.env.local` is correct, the application code will interact with these services instead of mock data.

### Troubleshooting Common Errors:

*   **"Failed to get document because the client is offline" / Firestore 400 Errors on /Listen channel:**
    *   This is the most common error if Firestore is not set up correctly.
    *   **Verify Step 1 & 3 above:**
        *   Is your `.env.local` file present, correct, and have you restarted your dev server?
        *   Did you **create** a Firestore database in the Firebase Console for your project?
        *   Did you select a region for Firestore?
        *   Are your Firestore security rules allowing access (at least for testing)?
        *   Is the "Cloud Firestore API" enabled in your Google Cloud project (Step 4)?
*   **404 Errors (for Firestore, App Hosting backend):** This usually means the respective service (Firestore, App Hosting backend) is not enabled, not fully provisioned, or not correctly deployed in your Firebase project. Revisit the setup steps.
*   **500 Internal Server Error:** This is a generic server-side error.
    *   **Check Server Logs:** The most important step is to check your server logs for the specific error message and stack trace.
        *   If running locally (e.g., `npm run dev`), the detailed error appears in your terminal.
        *   If deployed to Firebase App Hosting, go to the Firebase Console > App Hosting > (your backend) > "Logs" tab.
    *   Common Causes: Often related to missing AI service permissions, issues with Firestore/App Hosting setup, or other unhandled exceptions in server-side code.

If you've gone through all these steps and are still facing issues, please provide details of where you're stuck and any error messages from your browser console or server logs.
