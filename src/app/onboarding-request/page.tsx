
'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ListChecks } from 'lucide-react';
import Link from 'next/link';

const requiredInfo = [
  "First Name",
  "Last Name",
  "Email Address Used to Log into Atlas",
  "Phone Number",
  "Mailing Address",
  "Instructor ID",
  "Name of Training Faculty member who trained you"
];

const emailTo = "adam@emskillz.com";
const emailSubject = "InstructPoint Access Request";
const emailBodyTemplate = `Hello Adam,

I would like to request access to InstructPoint. Please find my onboarding information below:

First Name: 
Last Name: 
Email Address Used to Log into Atlas: 
Phone Number: 
Mailing Address: 
Instructor ID: 
Name of Training Faculty member who trained you: 

Thank you.
`;

const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyTemplate)}`;

export default function OnboardingRequestPage() {
  return (
    <div>
      <PageHeader
        title="Request Access to InstructPoint"
        description="Follow the steps below to request an account for the InstructPoint platform."
      />
      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <ListChecks className="mr-3 h-6 w-6 text-primary" />
            Onboarding Process
          </CardTitle>
          <CardDescription>
            To gain access to InstructPoint, please send an email containing the following information
            to <strong className="text-primary">{emailTo}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">Required Information:</h3>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground bg-muted/50 p-4 rounded-md shadow-sm">
              {requiredInfo.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 border border-dashed border-border rounded-md bg-background">
            <p className="text-sm text-foreground">
              Please compile this information carefully and send it in an email.
              You can use the button below to open your default email client with a pre-filled template.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center sm:flex-row sm:justify-between gap-4 pt-6 border-t">
           <div className="text-sm text-muted-foreground text-center sm:text-left">
            <p>Send your completed information to:</p>
            <p className="font-medium text-foreground">{emailTo}</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-base py-3 px-6">
            <a href={mailtoLink}>
              <Mail className="mr-2 h-5 w-5" /> Open Email to Request Access
            </a>
          </Button>
        </CardFooter>
      </Card>
       <div className="mt-8 text-center">
         <p className="text-sm text-muted-foreground">
           Once your request is processed and your account is created, you will be notified.
         </p>
         <p className="text-sm text-muted-foreground mt-2">
           If you believe you already have an account, you can try accessing the <Link href="/" className="text-primary hover:underline font-medium">Dashboard</Link>.
         </p>
      </div>
    </div>
  );
}
