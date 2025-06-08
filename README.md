
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Important Note on Data Persistence

Currently, this application uses **mock data** (found in `src/data/mockData.ts`) for all instructor information, courses, and documents. This means:
- Data is temporary and will reset when the server restarts.
- Data is not shared between users or sessions.

For the application to store data permanently and function as a real-world tool, **Firebase backend services need to be set up and integrated**:
- **Cloud Firestore:** For structured data like instructor profiles, course details, etc.
- **Cloud Storage for Firebase:** For file uploads like documents and images.

The "Deploy App" page within the application contains a guide with steps on how to enable these services in your Firebase project console. After enabling them, the application code will need to be modified to interact with these services.
```
