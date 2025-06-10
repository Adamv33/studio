
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Users, BookOpen, BarChart3, FolderKanban, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    const checkFirestoreConnectivity = async () => {
      setFirestoreStatus("Attempting to connect to Firestore and perform a test read...");
      setStatusIsError(false);
      console.log("[Firestore Test] Initializing test. Firestore object available:", !!firestore);
      if (firestore && firestore.app) {
        console.log("[Firestore Test] Firestore app options:", firestore.app.options);
      } else {
        console.error("[Firestore Test] Firestore object or firestore.app is not available prior to test doc ref creation.");
      }
      console.log("[Firestore Test] Firestore instance details (may be verbose):", firestore);

      try {
        if (!firestore || !firestore.app || typeof firestore.app.options?.projectId !== 'string') {
          const errorMessage = "[Firestore Test] Firestore object is invalid, app is missing, or projectId is missing before creating doc ref. Cannot proceed with test.";
          console.error(errorMessage, "Firestore object:", firestore, "App object:", firestore?.app, "App options:", firestore?.app?.options);
          setFirestoreStatus(`Firestore Initialization FAILED: ${errorMessage}`);
          setStatusIsError(true);
          return;
        }
        
        console.log(`[Firestore Test] Firestore seems initialized. Project ID: ${firestore.app.options.projectId}. Attempting to create doc ref for _internal_test_collection_/_connectivity_check_doc_`);
        const testDocRef = doc(firestore, '_internal_test_collection_', '_connectivity_check_doc_');
        console.log("[Firestore Test] Test document reference created successfully:", testDocRef.path);
        
        console.log("[Firestore Test] About to call getDoc(testDocRef).");
        await getDoc(testDocRef); // This will attempt the read
        console.log("[Firestore Test] getDoc call completed. If no error, and rules permit, this implies basic connectivity.");
        setFirestoreStatus("Firestore connectivity test: getDoc attempted. If successful and rules allow, basic connection established. If this message appears but you still see 'client offline' below it, the 'offline' error might be from a different Firestore operation or a persistent state.");
        setStatusIsError(false); // Assume success unless an error specific to this test is caught
      } catch (error: any) {
        console.error("[Firestore Test] Connectivity test caught an error during getDoc:", error);
        console.error("[Firestore Test] Error Name:", error.name);
        console.error("[Firestore Test] Error Code:", error.code);
        console.error("[Firestore Test] Error Message:", error.message);
        try {
            console.error("[Firestore Test] Full Error Object (stringified):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        } catch (stringifyError) {
            console.error("[Firestore Test] Could not stringify full error object:", stringifyError);
        }
        
        let detailedErrorMessage = `Firestore connection test encountered an error: ${error.message}. Code: ${error.code || 'N/A'}`;
        if (error.message && error.message.toLowerCase().includes("offline")) {
          detailedErrorMessage = "Firestore Connection FAILED: Client is offline. This is a critical issue usually related to Firebase project setup (Firestore DB not created/enabled in a region, or Cloud Firestore API disabled in GCP), or network issues preventing connection to Google services.";
        } else if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) {
          detailedErrorMessage = "Firestore Connection OK, but Permission Denied for test read. Your Firestore security rules are blocking access to the test path (`_internal_test_collection_/_connectivity_check_doc_`). Consider adding `allow read: if true;` for this specific path or globally for testing.";
        } else if (error.code === 'unimplemented') {
            detailedErrorMessage = `Firestore Connection FAILED: Operation is unimplemented. This might indicate an issue with the Firestore JS SDK version or a severe misconfiguration. Error: ${error.message}`;
        } else if (error.code === 'unavailable') {
            detailedErrorMessage = `Firestore Connection FAILED: Service is unavailable. This could be a temporary Firebase issue or a broader network problem preventing connection to Google services. Error: ${error.message}`;
        } else if (error.code === 'failed-precondition') {
            detailedErrorMessage = `Firestore Connection FAILED: Failed precondition. This often means the Firestore database hasn't been created/enabled in a region in your Firebase project. Error: ${error.message}`;
        }

        setFirestoreStatus(detailedErrorMessage);
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
        <Card className={`mb-6 ${statusIsError ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-500/10'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center text-sm font-semibold ${statusIsError ? 'text-destructive' : 'text-green-700'}`}>
              {statusIsError ? <AlertTriangle className="h-5 w-5 mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
              Firestore Connectivity Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xs ${statusIsError ? 'text-destructive' : 'text-green-600'}`}>{firestoreStatus}</p>
            {statusIsError && (firestoreStatus.includes("Client is offline") || firestoreStatus.includes("Failed precondition")) && (
                <p className="text-xs text-destructive mt-2">
                    <strong>Action Required:</strong> The most common causes are that the Firestore database has not been <strong className="underline">created and enabled in a specific region</strong> in your Firebase project console (Firebase Console > Build > Firestore Database), or the "Cloud Firestore API" is disabled in your Google Cloud project for this Firebase project. Double-check these settings.
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Quick Reminders</CardTitle>
          <CardDescription>Stay on top of important tasks and deadlines.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> Review instructor John Doe's expiring BLS certification (Next month).</li>
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> 5 new course completion forms to process.</li>
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> Update ACLS curriculum with latest 2024 guidelines.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
