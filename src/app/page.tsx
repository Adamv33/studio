
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
      setFirestoreStatus("Testing Firestore connectivity...");
      setStatusIsError(false);
      try {
        // Attempt to read a non-existent document.
        // This tests connectivity and basic rules without needing the doc to exist.
        // The path is arbitrary and only for this test.
        const testDocRef = doc(firestore, '_internal_test_collection_', '_connectivity_check_doc_');
        await getDoc(testDocRef);
        // If getDoc doesn't throw, it means we connected to the Firestore backend,
        // even if the document itself doesn't exist or rules prevent reading this specific path.
        // A more robust check would be to see if the error is *not* a "client-offline" type.
        setFirestoreStatus("Firestore connectivity test successful. Basic connection to backend established.");
        setStatusIsError(false);
      } catch (error: any) {
        console.error("Firestore connectivity test error:", error);
        if (error.message && error.message.toLowerCase().includes("offline")) {
          setFirestoreStatus("Firestore Connection FAILED: Client is offline. CRITICAL: Ensure Firestore database is CREATED in Firebase Console (select region, test mode), Cloud Firestore API is ENABLED in GCP, and .env.local is correct & dev server RESTARTED.");
        } else if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) {
          setFirestoreStatus("Firestore Connection OK, but Permission Denied for test read. Check Firestore security rules to allow reads (e.g., `allow read: if true;` for a test path).");
        } else {
          setFirestoreStatus(`Firestore connection test encountered an error: ${error.message}`);
        }
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
            {statusIsError && firestoreStatus.includes("Client is offline") && (
                <p className="text-xs text-destructive mt-2">
                    <strong>Action Required:</strong> The most common cause is that the Firestore database has not been <strong className="underline">created and enabled</strong> in your Firebase project console. Please go to Firebase Console &gt; Build &gt; Firestore Database. If you see a "Create database" button, click it, choose a region, and select "Test mode". Also ensure the "Cloud Firestore API" is enabled in your Google Cloud project.
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
