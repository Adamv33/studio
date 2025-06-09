
# InstructPoint

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Important Note on Data Persistence & Initial Setup

Currently, this application uses **mock data** (found in `src/data/mockData.ts`) for all instructor information, courses, and documents. This means:
- Data is temporary and will reset when the server restarts.
- Data is not shared between users or sessions.

**For the application to function correctly, store data permanently, and avoid common runtime errors (like "404 Not Found" for database access or "500 Internal Server Error" during page loads), the following Firebase backend services MUST be set up and integrated:**

1.  **Enable Cloud Firestore:**
    *   Go to the Firebase Console, select your project.
    *   Navigate to "Build" > "Firestore Database".
    *   Click "Create database" and follow the prompts (choosing a region and security rules - "Production mode" is recommended for real use, "Test mode" for initial development).
    *   **Failure to enable Firestore is a very common cause of 404 errors for database services or 500 Internal Server Errors when the application attempts to initialize Firebase SDKs or access data.**

2.  **Ensure Firebase App Hosting is Set Up and Deployed:**
    *   Your application needs to be successfully deployed to Firebase App Hosting.
    *   Deploy your application using the Firebase CLI: `firebase apphosting:backends:deploy` from your project root.
    *   **If App Hosting is not correctly set up, the deployment fails, or the backend is not recognized (e.g., 404 errors for backend services), you may encounter 500 Internal Server Errors when accessing the app.**

3.  **Configure AI Service Permissions (for Genkit features):**
    *   Grant the "Vertex AI User" role to your App Hosting service account in the Google Cloud IAM settings.
    *   To find your service account name:
        *   Go to the Google Cloud Console.
        *   Ensure you have selected the Google Cloud project linked to your Firebase project.
        *   In the navigation menu, go to "IAM & Admin" > "IAM".
        *   In the IAM members list, find the service account used by Firebase App Hosting. It will typically include your project ID and a reference to "apphosting" or "gcp-sa-apphosting" (e.g., `firebase-app-hosting-compute@YOUR-PROJECT-ID.iam.gserviceaccount.com` or `service-PROJECT_NUMBER@gcp-sa-apphosting.iam.gserviceaccount.com`).
    *   Once found, click the pencil icon to edit its roles, add "Vertex AI User", and save.
    *   **Missing these permissions is a very common cause for "500 Internal Server Errors" when AI features (like course description generation) are used, as Genkit will fail to access the Google AI models.**

After enabling these services and successfully deploying, the application code will need to be modified in the future to interact with these services instead of mock data for full persistence.

### Troubleshooting Common Errors:

*   **404 Errors (for Firestore, App Hosting backend):** This usually means the respective service (Firestore, App Hosting backend) is not enabled, not fully provisioned, or not correctly deployed in your Firebase project. Revisit the setup steps in the Firebase Console and ensure your deployment was successful.
*   **500 Internal Server Error:** This is a generic server-side error. It's crucial to find the *specific* error message.
    *   **Check Server Logs:** The most important step is to check your server logs for the specific error message and stack trace.
        *   If running locally (e.g., `npm run dev`), the detailed error appears in your terminal.
        *   If deployed to Firebase App Hosting, go to the Firebase Console > App Hosting > (your backend) > "Logs" tab.
    *   **Common Causes (as listed above):** Often related to missing AI service permissions (step 3), issues with Firestore/App Hosting setup (steps 1 & 2), or other unhandled exceptions in server-side code (e.g., incorrect model configuration for AI).
    *   Once you have the specific error from the logs, it will be much easier to diagnose the problem. If the logs point to a specific code file or function, please share that detail.
