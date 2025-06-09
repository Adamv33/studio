
# InstructPoint

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Important Note on Data Persistence & Initial Setup

Currently, this application uses **mock data** (found in `src/data/mockData.ts`) for all instructor information, courses, and documents. This means:
- Data is temporary and will reset when the server restarts.
- Data is not shared between users or sessions.

**For the application to function correctly with real user authentication, data persistence, and to avoid common runtime errors (like "404 Not Found" for database access, "client is offline" Firestore errors, or "500 Internal Server Error" during page loads), the following Firebase backend services MUST be set up and integrated:**

### 1. Configure Firebase Environment Variables (`.env.local`)

*   Create a file named `.env.local` in the **root directory** of your project (if it doesn't already exist).
*   Go to your Firebase project settings in the [Firebase Console](https://console.firebase.google.com/).
    *   Select your project (e.g., `instructorhub-nkxkd`).
    *   Click the **gear icon (⚙️)** next to "Project Overview" to go to **Project settings**.
    *   Under the **General** tab, scroll down to **Your apps**.
    *   Click on your **Web app** (it will have a `</>` icon). If you don't have one, click "Add app" and choose Web.
    *   Find the **SDK setup and configuration** section and select the **Config** option.
*   You will see a `firebaseConfig` object. Copy these values into your `.env.local` file, prefixing each key with `NEXT_PUBLIC_`:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID_FROM_FIREBASE_CONSOLE" # Optional
    ```
    *Replace "YOUR_..._FROM_FIREBASE_CONSOLE" with the actual values from your Firebase project.*
*   **Important:** After creating or modifying `.env.local`, you **MUST restart your Next.js development server** (e.g., stop and re-run `npm run dev`).

### 2. Enable Firebase Authentication

*   In the Firebase Console, go to "Build" > "Authentication".
*   Click "Get started".
*   Under the "Sign-in method" tab, enable the "Email/Password" provider (and any others you plan to use).

### 3. Enable and Configure Cloud Firestore (Critical for "Client is Offline" Errors)

This is the most common cause of "client is offline" or 400 errors on Firestore listen channels.

*   Go to the Firebase Console > Your Project (`instructorhub-nkxkd`) > **Build** > **Firestore Database**.
*   **Crucial Step:**
    *   If you see a button that says **"Create database"**:
        *   Click **"Create database"**. This step is **ESSENTIAL**. If no database instance exists, the client will be "offline."
        *   **Choose a Mode:**
            *   For initial setup and to quickly resolve connection issues, start in **Test mode**. This sets up very permissive security rules (e.g., `allow read, write: if request.time < timestamp.date(202X, MM, DD);` or `allow read, write: if true;`). You can change this later.
            *   Alternatively, you can choose **Production mode** (secure by default with rules like `allow read, write: if false;`). If you choose this, you **MUST** immediately edit the rules (see step 3b).
        *   **Choose a Location (Region):** Select a region for your database (e.g., `us-central1`, `europe-west1`, etc.). This cannot be changed later. Pick one geographically appropriate for your users.
        *   Click **Enable**.
    *   If a database already exists, you'll see your data or an empty database interface.

*   **Set/Verify Security Rules:**
    *   Go to the "Rules" tab in the Firestore Database section.
    *   For initial development and testing, ensure your rules allow access. If you started in Production mode or want to ensure access:
        ```rules
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allows all authenticated users to read and write all documents
            // THIS IS INSECURE FOR PRODUCTION, USE FOR TESTING ONLY
            match /{document=**} {
              allow read, write: if request.auth != null;
              // For even more open testing (e.g. if auth isn't set up yet):
              // allow read, write: if true;
            }
          }
        }
        ```
    *   Click **Publish**. Rules changes can take a few moments to propagate.
    *   **Remember to implement proper, granular security rules before deploying to production.**

### 4. Check Enabled Google Cloud APIs

*   Ensure your Firebase project is linked to a Google Cloud project.
*   Go to the [Google Cloud Console](https://console.cloud.google.com/).
*   Select the correct project (it should match your Firebase project ID, e.g., `instructorhub-nkxkd`).
*   Navigate to "APIs & Services" > "Enabled APIs & services".
*   Verify that the following APIs are **ENABLED**:
    *   **Cloud Firestore API** (This is absolutely critical for Firestore to work. If disabled, clients will appear "offline".)
    *   **Identity Platform API** (Used by Firebase Authentication)
    *   **Cloud Storage API** (If you plan to use Firebase Storage for file uploads)
    *   And any other Google Cloud services your app might use (like Vertex AI for Genkit).
    *   If any are missing, search for them in the "Library" and enable them for your project.

### 5. Ensure Firebase App Hosting is Set Up and Deployed (for Production)

*   Your application needs to be successfully deployed to Firebase App Hosting for production use.
*   Deploy your application using the Firebase CLI: `firebase apphosting:backends:deploy` from your project root.

### 6. Configure AI Service Permissions (for Genkit features)

*   Grant the "Vertex AI User" role to your App Hosting service account in the Google Cloud IAM settings.
*   To find your service account name:
    *   Go to the Google Cloud Console > IAM & Admin > IAM.
    *   Find the service account (e.g., `service-PROJECT_NUMBER@gcp-sa-apphosting.iam.gserviceaccount.com` or similar for App Hosting, or your Compute Engine default service account if running elsewhere).
    *   Edit its roles, add "Vertex AI User", and save.

### Troubleshooting "Client is Offline" / Firestore 400 Errors on /Listen channel:

This is the most common error if Firestore is not set up correctly. Carefully re-check:

1.  **`.env.local` File (Step 1):** Is it present in the project root? Are all `NEXT_PUBLIC_FIREBASE_...` keys correct and taken from your Firebase Console? Did you restart your dev server after changes?
2.  **Firestore Database Created (Step 3a - CRITICAL):** Did you go to Firebase Console > Firestore Database and click **"Create database"**? Was a region selected? If this step was missed, the client SDK has no database instance to connect to.
3.  **Cloud Firestore API Enabled (Step 4):** In Google Cloud Console, is the "Cloud Firestore API" listed under "Enabled APIs & services" for your project?
4.  **Firestore Security Rules (Step 3b):** Are your rules permissive enough for testing (e.g., `allow read, write: if request.auth != null;` or `allow read, write: if true;`)?
5.  **Browser Issues:** Try an incognito window or a different browser to rule out extension interference.
6.  **Network:** Ensure no firewalls or proxies are blocking `firestore.googleapis.com`.

If you've meticulously gone through all these steps and are still facing issues, please provide details of where you're stuck and any error messages from your browser console or server logs.

    