
'use client';
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DeploymentGuidePage() {
  return (
    <div>
      <PageHeader
        title="Deployment Guide Wizard"
        description="Follow these steps to deploy your InstructorHub application using Firebase App Hosting."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-500" />Prerequisites</CardTitle>
            <CardDescription>Ensure you have the following set up before you begin deployment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">Node.js and npm/yarn</h4>
              <p className="text-sm text-muted-foreground">Make sure Node.js (which includes npm) is installed on your system. This project uses npm for package management.</p>
            </div>
            <div>
              <h4 className="font-semibold">Firebase CLI</h4>
              <p className="text-sm text-muted-foreground">
                Install or update the Firebase Command Line Interface: <code className="bg-muted px-1 py-0.5 rounded text-sm">npm install -g firebase-tools</code>.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Firebase Project</h4>
              <p className="text-sm text-muted-foreground">
                Create a project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a> if you haven't already.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Rocket className="mr-2 h-5 w-5 text-primary" />Deployment Steps</CardTitle>
            <CardDescription>Follow these commands in your project's root directory terminal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">1. Login to Firebase</h4>
              <p className="text-sm text-muted-foreground">Authenticate the Firebase CLI with your Google account:</p>
              <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto"><code>firebase login</code></pre>
            </div>
            <div>
              <h4 className="font-semibold">2. Link to Your Firebase Project</h4>
              <p className="text-sm text-muted-foreground">Associate your local project directory with your Firebase project. If you have multiple Firebase projects, select the correct one when prompted.</p>
              <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto"><code>firebase use --add</code></pre>
              <p className="text-sm text-muted-foreground mt-1">Select your desired Firebase project from the list.</p>
            </div>
            <div>
              <h4 className="font-semibold">3. Understanding `apphosting.yaml`</h4>
              <p className="text-sm text-muted-foreground">
                Your project includes an <code className="bg-muted px-1 py-0.5 rounded text-sm">apphosting.yaml</code> file. This file configures your Firebase App Hosting backend. For Next.js apps, Firebase often auto-detects settings, but this file can be used for custom configurations like environment variables or instance scaling.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">4. Deploy to Firebase App Hosting</h4>
              <p className="text-sm text-muted-foreground">This command will build your Next.js application (using <code className="bg-muted px-1 py-0.5 rounded text-sm">npm run build</code>) and deploy it to Firebase App Hosting.</p>
              <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto"><code>firebase apphosting:backends:deploy</code></pre>
              <p className="text-sm text-muted-foreground mt-1">Follow any prompts. The CLI will output the URL of your deployed application upon completion.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />Important Notes & Post-Deployment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">Genkit AI Services Authentication</h4>
              <p className="text-sm text-muted-foreground">
                For AI features (like course description generation) to work, your deployed app needs to authenticate with Google AI services. Firebase App Hosting usually handles this via Application Default Credentials (ADC).
                Ensure the service account used by App Hosting has the necessary IAM permissions (e.g., "Vertex AI User" or "AI Platform User" role) for the Gemini models. This is typically configured in your Google Cloud project associated with Firebase.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Environment Variables</h4>
              <p className="text-sm text-muted-foreground">
                If you add features requiring environment variables (e.g., API keys not suitable for ADC), configure them in the Firebase App Hosting settings for your backend in the Firebase Console.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Testing</h4>
              <p className="text-sm text-muted-foreground">
                Once deployed, thoroughly test all application features, including user interactions and AI functionalities, to ensure everything works as expected in the production environment.
              </p>
            </div>
             <div>
              <h4 className="font-semibold">Official Documentation</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>
                  <Link href="https://firebase.google.com/docs/app-hosting" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Firebase App Hosting Docs <ExternalLink className="inline h-3 w-3 ml-1" />
                  </Link>
                </li>
                <li>
                  <Link href="https://nextjs.org/docs/deployment" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Next.js Deployment Docs <ExternalLink className="inline h-3 w-3 ml-1" />
                  </Link>
                </li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold">Troubleshooting</h4>
              <p className="text-sm text-muted-foreground">
                If deployment fails, check the build logs provided by the Firebase CLI for error messages. These logs are crucial for diagnosing issues.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
