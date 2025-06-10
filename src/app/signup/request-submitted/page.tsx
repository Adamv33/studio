
'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, LogIn } from 'lucide-react';

export default function AccountRequestSubmittedPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12 px-4">
      <PageHeader
        title="Account Request Submitted"
        description="Your request has been prepared for sending."
      />
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-headline">
            Email Prepared!
          </CardTitle>
          <CardDescription>
            Your account request information has been prepared in your email client.
            Please review and send the email to complete your request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Once the administrator receives and processes your email, your account will be set up.
            Please allow up to 24 hours for this process. You will be notified via email once your account is active.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-5">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <LogIn className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
