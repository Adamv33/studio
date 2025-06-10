
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Users, BookOpen, BarChart3, FolderKanban, ArrowRight, AlertTriangle, CheckCircle2, WifiOff, AlertCircleIcon } from 'lucide-react';
import Image from 'next/image';
import { firestore } from '@/lib/firebase/clientApp'; // Import firestore instance
import { doc, getDoc } from 'firebase/firestore'; // Import firestore functions

const dashboardItems = [
  {
    title: 'Manage Instructors',
    description: 'View, add, and edit instructor profiles and certifications.',
    href: '/instructors',
    icon: Users,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'team meeting',
  },
  {
    title: 'Track Courses',
    description: 'Input and manage data for all instructor-led courses.',
    href: '/courses',
    icon: BookOpen,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'classroom lecture',
  },
  {
    title: 'View Statistics',
    description: 'Analyze course data and instructor performance metrics.',
    href: '/courses/stats',
    icon: BarChart3,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'data analytics',
  },
  {
    title: 'Access Curriculum',
    description: 'Find and download necessary curriculum and training materials.',
    href: '/curriculum',
    icon: FolderKanban,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'books library',
  },
];

export default function DashboardPage() {
  const [firestoreStatus, setFirestoreStatus] = useState<string | null>(null);
  const [statusIsError, setStatusIsError] = useState<boolean>(false);
  const [detailedErrorHelp, setDetailedErrorHelp] = useState<string | null>(null);

  useEffect(() => {
    const checkFirestoreConnectivity = async () => {
      setFirestoreStatus("Attempting to connect to Firestore and perform a test read...");
      setStatusIsError(false);
      setDetailedErrorHelp(null);
      console.log("[Firestore Test] Initializing test. Firestore object available:", !!firestore);
      if (firestore && firestore.app) {
        console.log("[Firestore Test] Firestore app options:", firestore.app.options);
        console.log("[Firestore Test] Firestore instance details (may be verbose):", firestore);
        console.log(`[Firestore Test] Firestore seems initialized. Project ID: ${firestore.app.options.projectId}. Attempting to create doc ref for _internal_test_collection_/_connectivity_check_doc_`);
      } else {
        console.warn("[Firestore Test] Firestore object or firestore.app is not available prior to test doc ref creation.");
      }

      try {
        if (!firestore || !firestore.app || typeof firestore.app.options?.projectId !== 'string') {
          const errorMessage = "CRITICAL: Firestore object is invalid, app is missing, or projectId is missing. This means Firebase failed to initialize correctly. Check `src/lib/firebase/clientApp.ts` and `config.ts` and ensure your `.env.local` file has the correct NEXT_PUBLIC_FIREBASE_ variables from your Firebase project settings.";
          console.warn("[Firestore Test]", errorMessage, "Firestore object:", firestore, "App object:", firestore?.app, "App options:", firestore?.app?.options);
          setFirestoreStatus(`Firestore Initialization FAILED: ${errorMessage}`);
          setDetailedErrorHelp("1. Ensure Firebase is correctly configured with API keys in your .env.local file. \n2. Verify `src/lib/firebase/clientApp.ts` correctly initializes Firebase. \n3. See README for .env.local setup instructions.");
          setStatusIsError(true);
          return;
        }
        
        const testDocRef = doc(firestore, '_internal_test_collection_', '_connectivity_check_doc_');
        console.log("[Firestore Test] Test document reference created successfully:", testDocRef.path);
        console.log("[Firestore Test] About to call getDoc(testDocRef).");
        await getDoc(testDocRef); 
        setFirestoreStatus("SUCCESS: Firestore connectivity test (getDoc on a test path) attempted. If the document doesn't exist (which is expected for this test path), Firestore considers this a successful read attempt (not found). This suggests basic connection and API key validity. If other Firestore features are failing, check their specific queries, data, and security rules.");
        setStatusIsError(false);
      } catch (error: any) {
        console.warn("[Firestore Test] Connectivity test caught an error during getDoc:", error);
        console.warn("[Firestore Test] Error Name:", error.name);
        console.warn("[Firestore Test] Error Code:", error.code);
        console.warn("[Firestore Test] Error Message:", error.message);
        try {
            console.warn("[Firestore Test] Full Error Object (stringified):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        } catch (stringifyError) {
            console.warn("[Firestore Test] Could not stringify full error object:", stringifyError);
        }
        
        let userFriendlyMessage = `Firestore Connection Test FAILED. Error: ${error.message} (Code: ${error.code || 'N/A'}).`;
        let helpText = "This often indicates a problem with your Firebase project's backend configuration or network access.";

        if (error.code === 'unavailable' || (error.message && error.message.toLowerCase().includes("offline"))) {
          userFriendlyMessage = "Firestore Connection FAILED: Client is OFFLINE or service is UNAVAILABLE.";
          helpText = "CRITICAL: \n1. VERIFY Firestore Database is CREATED and ENABLED in a region in your Firebase project console (Build > Firestore Database). \n2. Ensure 'Cloud Firestore API' is ENABLED in your Google Cloud project. \n3. Check your project's BILLING status in Google Cloud Console (must be active and healthy). \n4. Verify network connectivity (try a different network/incognito window, check for firewalls/proxies). \n5. Ensure your Firestore Security Rules are published and allow access (even if very open like `allow read, write: if true;` for testing). \n6. See README for Firebase setup troubleshooting.";
        } else if (error.code === 'permission-denied') {
          userFriendlyMessage = "Firestore Connection OK, but Permission Denied for test read.";
          helpText = "Your Firestore security rules are blocking access to the test path (`_internal_test_collection_/_connectivity_check_doc_`). Ensure rules allow reads for this path or globally for testing (e.g., `match /{document=**} { allow read: if true; }`) AND that rules are PUBLISHED in the Firebase Console. The current test uses very open rules, so this points to a deeper issue if they are correctly applied.";
        } else if (error.code === 'failed-precondition') {
            userFriendlyMessage = "Firestore Connection FAILED: Failed precondition.";
            helpText = "This often means the Firestore database hasn't been created/enabled in a region in your Firebase project, OR the necessary APIs (like 'Cloud Firestore API') are not enabled in Google Cloud. Please check these in the Firebase and Google Cloud consoles. Also verify project Billing status.";
        } else if (error.message && (error.message.toLowerCase().includes("xhr boats") || error.message.toLowerCase().includes("xmlhttprequest error"))) {
            userFriendlyMessage = "Firestore Connection FAILED: Network error (XHR/fetch or gRPC-web)."
            helpText = "This could be a CORS issue if running locally against a deployed backend, a network interruption, an ad-blocker, a misconfigured proxy, or a firewall. Check browser network tab for more details on the failed requests to '*.googleapis.com'. Also, ensure no browser extensions are interfering."
        }  else if (error.code === 'unauthenticated' || error.code === 'permission-denied') {
            userFriendlyMessage = `Firestore Access Denied (Code: ${error.code}).`;
            helpText = "Firebase Auth token might be invalid, or Firestore security rules are preventing access even for authenticated users. Ensure user is logged in and rules allow access for their UID or role. For the test path, rules should be `allow read, write: if true;`.";
        }

        setFirestoreStatus(userFriendlyMessage);
        setDetailedErrorHelp(helpText);
        setStatusIsError(true);
      }
    };

    checkFirestoreConnectivity();
  }, []);

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Welcome to InstructPoint"
        description="Your central platform for managing instructors, courses, and educational materials."
      />

      {firestoreStatus && (
        <Card className={`mb-6 shadow-md ${statusIsError ? 'border-destructive bg-destructive/5 text-destructive' : 'border-green-500 bg-green-500/5 text-green-700'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center text-base font-semibold`}>
              {statusIsError ? <AlertCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" /> : <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />}
              Firestore Connectivity Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="font-medium">{firestoreStatus}</p>
            {statusIsError && detailedErrorHelp && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  <p className="font-semibold mb-1">Possible Causes & Next Steps:</p>
                  <ul className="list-disc list-inside space-y-1 whitespace-pre-line">
                    {detailedErrorHelp.split('\n').map((line, idx) => line.trim() && <li key={idx}>{line.replace(/^\d+\.\s*/, '')}</li>)}
                  </ul>
                   <p className="mt-3 text-muted-foreground">
                    Refer to the <a href="/#readme-firebase-setup" className="underline hover:text-primary">Firebase Setup Guide in the README</a> for detailed troubleshooting.
                  </p>
                </div>
            )}
             {!statusIsError && (
                <p className="text-xs text-muted-foreground">
                    If you still encounter issues with specific Firestore features (e.g., loading courses), ensure your security rules for those collections (e.g., 'courses', 'users') are correctly configured in the Firebase Console.
                </p>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {dashboardItems.map((item) => (
          <Card key={item.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0">
               <Image 
                src={item.image} 
                alt={item.title} 
                width={600} 
                height={300} 
                className="w-full h-48 object-cover" 
                data-ai-hint={item.aiHint}
              />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <item.icon className="w-7 h-7 text-primary mr-3" />
                <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
              </div>
              <CardDescription className="mb-4 text-base">{item.description}</CardDescription>
              <Link href={item.href} passHref>
                <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
                  Go to {item.title.split(' ')[1]} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg" id="readme-firebase-setup">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Quick Reminders & Setup Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
           <p className="text-destructive font-semibold">
             If Firestore shows as "OFFLINE" or "UNAVAILABLE" above, your application will not function correctly. Please follow the backend setup steps carefully.
           </p>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Ensure your <code className="text-xs bg-muted p-1 rounded">.env.local</code> file has the correct Firebase Web App config. (See README).</li>
            <li>Verify a Firestore Database instance is **created and active in a region** in the Firebase Console.</li>
            <li>Ensure the **Cloud Firestore API** is ENABLED in your Google Cloud project.</li>
            <li>Check your Google Cloud project's **Billing status** (must be active and healthy).</li>
            <li>Adjust Firestore **Security Rules** as needed (start with permissive rules for testing).</li>
          </ul>
          <h4 className="font-semibold pt-2">Other Tasks:</h4>
          <ul className="space-y-1">
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> Review instructor John Doe's expiring BLS certification (Next month).</li>
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> 5 new course completion forms to process.</li>
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> Update ACLS curriculum with latest 2024 guidelines.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
