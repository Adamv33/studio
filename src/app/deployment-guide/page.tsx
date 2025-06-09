
'use client';
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, CheckCircle, AlertTriangle, ExternalLink, HardDrive, Terminal, KeyRound, CloudCog, Menu, Edit, Database, CloudUpload } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

// Helper component
function ImagePlaceholder({title, description}: {title: string, description: string}): JSX.Element {
  return (
    <div className="mt-2 p-3 border border-dashed rounded-md bg-muted/50">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DeploymentGuidePage(): JSX.Element {
  return (
    <div>
      <PageHeader
        title="Deployment Guide Wizard"
        description="Follow these detailed steps to deploy your InstructPoint application using Firebase App Hosting."
      />

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-500" />Phase 1: Prerequisites & Setup</CardTitle>
            <CardDescription>Ensure you have the following ready before starting the deployment process.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold flex items-center"><HardDrive className="mr-2 h-4 w-4" />Local Environment</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                <li><strong>Node.js and npm:</strong> Ensure Node.js (which includes npm) is installed. This project uses npm.</li>
                <li>
                  <strong>Firebase CLI:</strong> Install or update the Firebase Command Line Interface globally:
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto"><code>npm install -g firebase-tools</code></pre>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold flex items-center"><CloudCog className="mr-2 h-4 w-4" />Firebase Project</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Create/Select a Firebase Project:</strong> If you don't have one, create a project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a>.
                </li>
                <li>
                  <strong>Identify Your Project ID:</strong>
                  In the Firebase Console, select your project. Your <strong>Project ID</strong> is usually displayed on the Project Overview page or in the URL (e.g., `console.firebase.google.com/project/YOUR-PROJECT-ID/overview`). You'll need this for linking.
                  <ImagePlaceholder title="Firebase Project ID Location" description="Typically found in Project settings or near the project name on the overview page." />
                </li>
                <li>
                  <strong>Enable App Hosting (if not enabled):</strong>
                   Navigate to "Build" &gt; "App Hosting" in the Firebase Console. If it's your first time, you might need to click "Get started" and follow any prompts to enable it for your project.
                </li>
                 <li>
                  <strong>Billing Account:</strong> Firebase App Hosting (and Google Cloud services like Genkit's AI models) requires your Firebase project to be on the "Blaze (pay as you go)" plan and linked to a Google Cloud billing account. Ensure this is set up in your Firebase project settings.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Terminal className="mr-2 h-5 w-5 text-blue-500" />Phase 2: Firebase CLI Operations</CardTitle>
            <CardDescription>Execute these commands in your project's root directory terminal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold">1. Login to Firebase</h4>
              <p className="text-sm text-muted-foreground">Authenticate the Firebase CLI with your Google account. This will open a browser window for you to log in.</p>
              <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto"><code>firebase login</code></pre>
            </div>
            <div>
              <h4 className="font-semibold">2. Link to Your Firebase Project</h4>
              <p className="text-sm text-muted-foreground">
                Associate your local project directory with your Firebase project. Replace <code className="bg-muted px-1 py-0.5 rounded text-xs">your-project-id</code> with the <strong>Project ID</strong> you identified earlier.
              </p>
              <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto"><code>firebase use --add your-project-id</code></pre>
              <p className="text-sm text-muted-foreground mt-1">Alternatively, run <code className="bg-muted px-1 py-0.5 rounded text-xs">firebase use --add</code> and select your project from the list when prompted.</p>
            </div>
            <div>
              <h4 className="font-semibold">3. Deploy to Firebase App Hosting</h4>
              <p className="text-sm text-muted-foreground">This command builds your Next.js application (using <code className="bg-muted px-1 py-0.5 rounded text-xs">npm run build</code>) and deploys it. This may take a few minutes.</p>
              <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto"><code>firebase apphosting:backends:deploy</code></pre>
              <p className="text-sm text-muted-foreground mt-1">
                Follow any prompts. The CLI will output messages about the build and deployment process.
                Upon successful completion, it will display the <strong>URL of your deployed application</strong> (e.g., <code className="bg-muted px-1 py-0.5 rounded text-xs">https://your-app-name--your-project-id.web.app</code> or a custom domain if configured).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-orange-500" />Phase 3: Configure AI Service Permissions (Genkit)</CardTitle>
            <CardDescription>
              For AI features (like course description generation) to work, your deployed app needs permission to call Google AI services. This is typically handled via Application Default Credentials (ADC) and IAM roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">1. Navigate to Google Cloud Console IAM Page</h4>
              <p className="text-sm text-muted-foreground">
                Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>.
                Ensure you have selected the Google Cloud project that is linked to your Firebase project.
                In the navigation menu (<Menu className="inline h-3 w-3" />), go to <Badge variant="outline">IAM & Admin</Badge> &gt; <Badge variant="outline">IAM</Badge>.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">2. Find the App Hosting Service Account</h4>
              <p className="text-sm text-muted-foreground">
                In the IAM members list, find the service account used by Firebase App Hosting for your project. Its email address will typically include your project ID and a reference to "apphosting" or "gcp-sa-apphosting".
                <br />
                Example patterns:
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                  <li><code className="bg-muted px-1 py-0.5 rounded">service-PROJECT_NUMBER@gcp-sa-apphosting.iam.gserviceaccount.com</code></li>
                  <li><code className="bg-muted px-1 py-0.5 rounded">firebase-app-hosting-compute@YOUR_PROJECT_ID.iam.gserviceaccount.com</code></li>
                  <li>Or similar variations. Look for the one related to "App Hosting".</li>
                </ul>
                Replace <code className="bg-muted px-1 py-0.5 rounded text-xs">PROJECT_NUMBER</code> with your Google Cloud Project Number or <code className="bg-muted px-1 py-0.5 rounded text-xs">YOUR_PROJECT_ID</code> with your Firebase Project ID.
              </p>
              <ImagePlaceholder title="IAM Page in Google Cloud Console" description="Look for the service account that contains 'apphosting' or 'gcp-sa-apphosting' and your project ID in its email." />
            </div>
            <div>
              <h4 className="font-semibold">3. Grant "Vertex AI User" Role</h4>
              <p className="text-sm text-muted-foreground">
                Click the pencil icon (<Edit className="inline h-3 w-3" />) next to that service account to edit its roles.
                Click on <Badge variant="secondary">+ ADD ANOTHER ROLE</Badge>.
                In the "Select a role" filter, type <code className="bg-muted px-1 py-0.5 rounded text-xs">Vertex AI User</code> and select it.
                Click <Badge variant="default">SAVE</Badge>.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This role grants permissions to use Gemini models. It might take a few minutes for permissions to propagate.
              </p>
            </div>
             <div>
              <h4 className="font-semibold">4. (Alternative/Additional) Google AI API Key (If ADC fails or for specific models)</h4>
              <p className="text-sm text-muted-foreground">
                While ADC is preferred, if you need to use an API key for Genkit (e.g., for `GEMINI_API_KEY`), you would:
              </p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-xs text-muted-foreground">
                <li>
                  Generate an API key in the Google Cloud Console (APIs & Services &gt; Credentials).
                  Restrict the key to only allow access to "Generative Language API" or "Vertex AI API" as appropriate.
                </li>
                <li>
                  Set this API key as an environment variable in your Firebase App Hosting backend configuration. You can do this in the Firebase Console under App Hosting &gt; Your Backend &gt; "Environment variables" tab or by updating `apphosting.yaml`.
                  Example for `apphosting.yaml`:
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
{`runConfig:
  # ... other runConfig settings
  environmentVariables:
    GEMINI_API_KEY: "YOUR_API_KEY_HERE"`}
                  </pre>
                  Then redeploy: <code className="bg-muted px-1 py-0.5 rounded text-xs">firebase apphosting:backends:deploy</code>
                </li>
              </ol>
               <p className="text-xs text-muted-foreground mt-1">
                <strong>Note:</strong> Using Application Default Credentials (Step 3) is generally more secure and recommended for Google Cloud environments.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Database className="mr-2 h-5 w-5 text-green-600" />Phase 4: Setting up Data Persistence (Recommended)</CardTitle>
            <CardDescription>
              For the app to save data permanently (instructor profiles, courses, uploaded documents), you need to enable Firebase backend services. Currently, the app uses temporary mock data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold flex items-center"><Database className="mr-2 h-4 w-4" />1. Enable Cloud Firestore</h4>
              <p className="text-sm text-muted-foreground">Firestore will store structured data like instructor profiles and course information.</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-xs text-muted-foreground">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a> and select your project.</li>
                <li>In the left navigation, click "Build" &gt; "Firestore Database".</li>
                <li>Click "Create database".</li>
                <li>
                  Choose security rules:
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>Production mode:</strong> Recommended. Starts with data locked down. You'll define access rules later.</li>
                    <li><strong>Test mode:</strong> Allows open access for 30 days. Easier for quick testing, but remember to secure it.</li>
                  </ul>
                </li>
                <li>Click "Next".</li>
                <li>Select a Cloud Firestore location (this cannot be changed later).</li>
                <li>Click "Enable".</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold flex items-center"><CloudUpload className="mr-2 h-4 w-4" />2. Enable Cloud Storage for Firebase</h4>
              <p className="text-sm text-muted-foreground">Cloud Storage will store files like uploaded documents and profile pictures.</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-xs text-muted-foreground">
                <li>In the Firebase Console, under "Build", click "Storage".</li>
                <li>Click "Get started".</li>
                <li>Review the security rules information and click "Next". (Default rules are often fine to start for authenticated users).</li>
                <li>Confirm the Cloud Storage location (usually pre-selected, cannot be changed later).</li>
                <li>Click "Done".</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold">Next Steps for Application Code</h4>
              <p className="text-sm text-muted-foreground">
                After enabling these services, the application code will need to be modified to use Firestore and Cloud Storage instead of the current mock data. This involves writing code to read/write data and files. This can be addressed in future development steps.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />Phase 5: Post-Deployment & Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Test Your Application</h4>
              <p className="text-sm text-muted-foreground">
                Once deployed, thoroughly test all application features, especially user interactions and any AI functionalities (like course description generation), to ensure everything works as expected in the production environment. Open your browser's developer console for any errors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Check Logs</h4>
              <p className="text-sm text-muted-foreground">
                If you encounter issues:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Build Logs:</strong> The Firebase CLI provides build logs during deployment. If deploying from Git, check build logs in the Google Cloud Console under Cloud Build.</li>
                  <li><strong>Runtime Logs:</strong> In the Firebase Console, navigate to App Hosting &gt; Your Backend &gt; "Logs" tab to view runtime logs from your deployed application. These are crucial for diagnosing issues with server-side code or AI calls.</li>
                </ul>
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Custom Domains</h4>
              <p className="text-sm text-muted-foreground">
                Firebase App Hosting allows you to connect a custom domain. You can configure this in the App Hosting section of the Firebase Console.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Official Firebase App Hosting Documentation</h4>
              <p className="text-sm text-muted-foreground">
                For the most up-to-date and comprehensive information, always refer to the official documentation:
                <Link href="https://firebase.google.com/docs/app-hosting" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block mt-1">
                  Firebase App Hosting Docs <ExternalLink className="inline h-3 w-3 ml-1" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    