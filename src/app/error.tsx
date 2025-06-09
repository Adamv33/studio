
'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error("GlobalError caught in error.tsx:", error);
  }, [error])

  return (
    <div className="container mx-auto py-8">
        <PageHeader title="Application Error" description="We're sorry, something went wrong on our end." />
        <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-destructive font-headline">An Unexpected Error Occurred</CardTitle>
                <CardDescription>
                    There was an issue processing your request.
                    Please try again. If the problem persists, this usually indicates a server-side issue.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    For debugging, the client-side error message is:
                </p>
                <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto text-destructive">
                    {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                </pre>
                <Button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="bg-primary hover:bg-primary/90"
                >
                    Try to Reload Page
                </Button>
                <div className="pt-4 border-t mt-4">
                    <h4 className="font-semibold mb-2 text-primary">Troubleshooting Server Errors:</h4>
                    <p className="text-xs text-muted-foreground">
                        "Internal Server Errors" often stem from server-side configurations or issues with backend services.
                        The **most important step** is to check your **server logs** on Firebase App Hosting for the specific error details.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Common causes include:</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-4 mt-1">
                        <li><strong>Cloud Firestore Not Enabled:</strong> Ensure a Firestore database is created and active in your Firebase project.</li>
                        <li><strong>Missing AI Permissions:</strong> The App Hosting service account (e.g., `firebase-app-hosting-compute@YOUR-PROJECT-ID.iam.gserviceaccount.com`) must have the "Vertex AI User" role in Google Cloud IAM for AI features to work.</li>
                        <li><strong>Other unhandled exceptions</strong> in server-side code (check logs for details).</li>
                    </ul>
                     <p className="text-xs text-muted-foreground mt-3">
                        You can find server logs in the Firebase Console: App Hosting &gt; (Your Backend) &gt; Logs.
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
