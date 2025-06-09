
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
    *   **Failure to enable Firestore can lead to 404 errors when the application tries to access database services or contribute to 500 Internal Server Errors.**

2.  **Ensure Firebase App Hosting is Set Up and Deployed:**
    *   Your application needs to be successfully deployed to Firebase App Hosting.
    *   Follow the "Deploy App" page within the application (path: `/deployment-guide`) for detailed steps on deploying.
    *   **If App Hosting is not correctly set up or the deployment fails, you may encounter 404 errors for backend services or 500 Internal Server Errors when accessing the app.**

3.  **Configure AI Service Permissions (for Genkit features):**
    *   As detailed in Phase 3 of the in-app "Deploy App" guide, grant the "Vertex AI User" role to your App Hosting service account in the Google Cloud IAM settings.
    *   **Missing these permissions will likely cause "500 Internal Server Errors" when AI features (like course description generation) are used.**

The "Deploy App" page within the application contains a comprehensive guide with steps on how to enable these services in your Firebase project console and manage deployment. After enabling them, the application code will need to be modified in the future to interact with these services instead of mock data for full persistence.

### Troubleshooting Common Errors:

*   **404 Errors (for Firestore, App Hosting backend):** This usually means the respective service (Firestore, App Hosting backend) is not enabled, not fully provisioned, or not correctly deployed in your Firebase project. Revisit the setup steps in the Firebase Console and the in-app Deployment Guide.
*   **500 Internal Server Error:** This is a generic server-side error.
    *   **Check Server Logs:** The most important step is to check your server logs for the specific error message and stack trace.
        *   If running locally (e.g., `npm run dev`), the detailed error appears in your terminal.
        *   If deployed to Firebase App Hosting, go to the Firebase Console > App Hosting > (your backend) > "Logs" tab.
    *   **Common Causes:** Often related to missing AI service permissions (see step 3 above), issues with Firestore/App Hosting setup (steps 1 & 2), or other unhandled exceptions in server-side code.
    *   Once you have the specific error from the logs, it will be much easier to diagnose the problem.
