# Studio

The source code for this project is now hosted at `https://github.com/Adamv33/studio.git`.

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Important Note on Data Persistence & Initial Setup

Currently, this application uses **mock data** (found in `src/data/mockData.ts`) for all instructor information, courses, and documents. This means:
- Data is temporary and will reset when the server restarts.
- Data is not shared between users or sessions.

**For the application to function correctly with real user authentication, data persistence, and to avoid common runtime errors (like "400 Bad Request" for database access, "client is offline" Firestore errors, or "500 Internal Server Error" during page loads), the following Firebase backend services MUST be set up and integrated:**

### 1. Configure Firebase Environment Variables (`.env.local`) - CRITICAL

*   Create a file named `.env.local` in the **ROOT DIRECTORY** of your project (if it doesn't already exist). This is the same level as `package.json`.
*   Go to your Firebase project settings in the [Firebase Console](https://console.firebase.google.com/).
    *   Select your project (e.g., `instructorhub-nkxkd`).
    *   Click the **gear icon (⚙️)** next to "Project Overview" to go to **Project settings**.
    *   Under the **General** tab, scroll down to **Your apps**.
    *   Click on your **Web app** (it will have a `</>` icon). If you don't have one, click "Add app" and choose Web. Give it a nickname like "Studio Web App".
    *   Find the **SDK setup and configuration** section and select the **Config** option.
*   You will see a `firebaseConfig` object. Copy these values into your `.env.local` file, prefixing each key with `NEXT_PUBLIC_`. **The file should contain plain text key-value pairs, NOT a JSON object.**

    **Correct `.env.local` format:**
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID_FROM_FIREBASE_CONSOLE"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID_FROM_FIREBASE_CONSOLE" # Optional, include if present
    ```
    *Replace "YOUR_..._FROM_FIREBASE_CONSOLE" with the actual values from your Firebase project.*
*   **VERY IMPORTANT:** After creating or modifying `.env.local`, you **MUST restart your Next.js development server** (e.g., stop `npm run dev` with Ctrl+C, then re-run `npm run dev`). Next.js only loads these variables on startup.
*   The console logs in `src/lib/firebase/config.ts` will help you verify if these values are being loaded correctly by your application. Check your browser's developer console for messages starting with "Firebase Config Loaded by App:".

### 2. Enable Firebase Authentication

*   In the Firebase Console, go to "Build" > "Authentication".
*   Click "Get started".
*   Under the "Sign-in method" tab, enable the "Email/Password" provider (and any others you plan to use).
*   You will need to manually add users here for them to be able to log in.

### 3. Enable and Configure Cloud Firestore (CRITICAL for "Client is Offline" / 400 Errors)

This is the **most common cause** of "client is offline" or 400 errors on Firestore Listen channels.

*   Go to the Firebase Console > Your Project (`instructorhub-nkxkd`) > **Build** > **Firestore Database**.
*   **Crucial Step - Creating the Database Instance:**
    *   **If you see a button that says "Create database"**:
        *   **You MUST click "Create database".** This step is essential. If no database instance exists, the client SDK has no database to connect to, resulting in "client is offline" errors.
        *   **Choose a Mode:**
            *   For initial setup and to quickly resolve connection issues, start in **Test mode**. This sets up very permissive security rules (e.g., `allow read, write: if true;` or `allow read, write: if request.time < timestamp.date(202X, MM, DD);`). You **MUST** change this to secure rules before production.
            *   Alternatively, you can choose **Production mode** (secure by default with rules like `allow read, write: if false;`). If you choose this, you **MUST** immediately edit the rules (see next step).
        *   **Choose a Location (Region):** Select a region for your database (e.g., `us-central1 (Iowa)`, `europe-west1 (Belgium)`, etc.). This choice is permanent. Pick one geographically appropriate for your users.
        *   Click **Enable**. It might take a few moments to provision.
    *   **If a database already exists:** You'll see your data or an empty database interface with tabs like "Data", "Rules", "Indexes", "Usage".

*   **Set/Verify Security Rules:**
    *   Go to the "Rules" tab in the Firestore Database section.
    *   For initial development and testing, ensure your rules allow access. If you started in Production mode or want to ensure access, use permissive rules like:
        ```rules
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allows all authenticated users to read and write all documents
            // THIS IS INSECURE FOR PRODUCTION, USE FOR TESTING ONLY
            // For even more open testing (e.g. if auth isn't set up yet, or to bypass auth checks temporarily):
            match /{document=**} {
              allow read, write: if true;
            }
            // If you want to restrict to authenticated users for a start:
            // match /{document=**} {
            //   allow read, write: if request.auth != null;
            // }
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
    *   **Cloud Firestore API** (This is absolutely critical for Firestore to work. If disabled, clients will appear "offline" or get 400/403 errors.)
    *   **Identity Platform API** (Used by Firebase Authentication)
    *   **Cloud Storage API** (If you plan to use Firebase Storage for file uploads)
    *   And any other Google Cloud services your app might use (like Vertex AI for Genkit).
    *   If any are missing, search for them in the "Library" and enable them for your project. This can take a few minutes to take effect.

### 5. Ensure Firebase App Hosting is Set Up and Deployed (for Production)

*   Your application needs to be successfully deployed to Firebase App Hosting for production use.
*   Deploy your application using the Firebase CLI: `firebase apphosting:backends:deploy` from your project root.
*   **Important for Builds:** Ensure your App Hosting backend is linked to the correct GitHub repository (e.g., `https://github.com/Adamv33/studio.git`) and branch (`main` or `master`) that contains **all** your project files, including `package.json` at the root. If `package.json` is missing from the commit being built, the build will fail.

### 6. Configure AI Service Permissions (for Genkit features)

*   Grant the "Vertex AI User" role to your App Hosting service account in the Google Cloud IAM settings.
*   To find your service account name:
    *   Go to the Google Cloud Console > IAM & Admin > IAM.
    *   Find the service account (e.g., `service-PROJECT_NUMBER@gcp-sa-apphosting.iam.gserviceaccount.com` or similar for App Hosting, or your Compute Engine default service account if running elsewhere).
    *   Edit its roles, add "Vertex AI User", and save.

### Troubleshooting "Client is Offline" / Firestore 400 Errors on /Listen channel:

This is the most common error if Firestore is not set up correctly. Carefully re-check:

1.  **`.env.local` File (Step 1):**
    *   Is it present in the project **root**?
    *   Is it named **exactly** `.env.local`?
    *   Are all `NEXT_PUBLIC_FIREBASE_...` keys correct and taken from your Firebase Console SDK Config? (No JSON, just key=value pairs).
    *   Did you **restart your dev server** (`npm run dev`) after any changes? Check the browser console for logs from `src/lib/firebase/config.ts` which show the loaded config.

2.  **Firestore Database Created (Step 3a - CRITICAL):**
    *   Did you go to Firebase Console > Firestore Database and **explicitly click "Create database"** if it was not already created?
    *   Was a **region selected** and the database enabled? If this step was missed, the client SDK has no database instance to connect to. The error `POST https://firestore.clients6.google.com/$rpc/google.firestore.admin.v1.FirestoreAdmin/GetDatabase 404 (Not Found)` seen in the Firebase Console's own network requests strongly indicates this step might be missing.

3.  **Cloud Firestore API Enabled (Step 4):**
    *   In Google Cloud Console, is the **"Cloud Firestore API"** listed under "Enabled APIs & services" for your project? If not, enable it and wait a few minutes.

4.  **Firestore Security Rules (Step 3b):**
    *   Are your rules permissive enough for testing (e.g., `allow read, write: if true;`)?
    *   Did you **Publish** the rules?

5.  **Browser Issues:**
    *   Try an incognito/private window or a different browser to rule out extension interference.
    *   Clear your browser's cache and site data for your development domain (e.g., `localhost:9002` or your `cloudworkstations.dev` URL).

6.  **Network:**
    *   Ensure no firewalls, proxies, or VPNs are blocking `firestore.googleapis.com` or other Google Cloud Platform domains.
    *   Persistent `net::ERR_INTERNET_DISCONNECTED` errors for your application's own resources indicate a broader network issue between your browser and the server hosting your app, which will also prevent Firestore from connecting.

7.  **Billing Account:** (Less common for initial setup within free tiers)
    *   Ensure your Google Cloud project is linked to an active and healthy billing account. Sometimes, if a project's billing status is problematic, services can be restricted.

If you've meticulously gone through all these steps and are still facing issues, please provide details of where you're stuck and any error messages from your browser console or server logs.
    
