
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { UserPlus, Send } from 'lucide-react';

const accountRequestSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'A valid email address for your account is required' }),
  phoneNumber: z.string().min(10, { message: 'A valid phone number is required' }),
  mailingAddress: z.string().min(1, { message: 'Mailing address is required' }),
  instructorId: z.string().min(1, { message: 'Instructor ID is required' }),
  trainingFacultyName: z.string().min(1, { message: 'Training faculty name is required' }),
});

type AccountRequestFormData = z.infer<typeof accountRequestSchema>;

const ADMIN_EMAIL = "adam@emskillz.com";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountRequestFormData>({
    resolver: zodResolver(accountRequestSchema),
  });

  const onSubmit: SubmitHandler<AccountRequestFormData> = async (data) => {
    setIsSubmitting(true);

    const emailSubject = `InstructPoint Account Request - ${data.firstName} ${data.lastName}`;
    const emailBody = `
Hello Adam,

I would like to request an InstructPoint account. My details are as follows:

First Name: ${data.firstName}
Last Name: ${data.lastName}
Email Address for InstructPoint Account: ${data.email}
Phone Number: ${data.phoneNumber}
Mailing Address: ${data.mailingAddress}
Instructor ID: ${data.instructorId}
Name of Training Faculty member who trained me: ${data.trainingFacultyName}

Thank you,
${data.firstName} ${data.lastName}
    `;

    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Attempt to open mail client
    if (typeof window !== "undefined") {
      window.location.href = mailtoLink;
    }

    toast({
      title: 'Email Client Opened',
      description: 'Please review and send the prepared email in your mail application.',
      duration: 7000, 
    });
    
    // Redirect to the submission confirmation page
    router.push('/signup/request-submitted'); 

    // setIsSubmitting(false); // No longer needed here as we redirect
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12 px-4">
      <PageHeader
        title="Request InstructPoint Account"
        description="Complete the form below. Your details will be used to generate an email to the administrator for account creation and approval."
      />
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <UserPlus className="mr-2 h-6 w-6 text-primary" /> Account Request Form
          </CardTitle>
          <CardDescription>
            This information will be sent to <strong className="text-primary">{ADMIN_EMAIL}</strong>.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  disabled={isSubmitting}
                  className={errors.firstName ? 'border-destructive' : ''}
                  placeholder="e.g., Jane"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  disabled={isSubmitting}
                  className={errors.lastName ? 'border-destructive' : ''}
                  placeholder="e.g., Doe"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email for InstructPoint Account</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com (this will be your login email)"
                {...register('email')}
                disabled={isSubmitting}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g., 555-123-4567"
                {...register('phoneNumber')}
                disabled={isSubmitting}
                className={errors.phoneNumber ? 'border-destructive' : ''}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="mailingAddress">Mailing Address</Label>
              <Textarea
                id="mailingAddress"
                placeholder="e.g., 123 Main St, Anytown, USA 12345"
                {...register('mailingAddress')}
                disabled={isSubmitting}
                className={errors.mailingAddress ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.mailingAddress && (
                <p className="text-xs text-destructive">{errors.mailingAddress.message}</p>
              )}
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="instructorId">Instructor ID</Label>
                  <Input
                    id="instructorId"
                    placeholder="e.g., INS12345"
                    {...register('instructorId')}
                    disabled={isSubmitting}
                    className={errors.instructorId ? 'border-destructive' : ''}
                  />
                  {errors.instructorId && (
                    <p className="text-xs text-destructive">{errors.instructorId.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="trainingFacultyName">Training Faculty Name</Label>
                  <Input
                    id="trainingFacultyName"
                    placeholder="e.g., Dr. Smith"
                    {...register('trainingFacultyName')}
                    disabled={isSubmitting}
                    className={errors.trainingFacultyName ? 'border-destructive' : ''}
                  />
                  {errors.trainingFacultyName && (
                    <p className="text-xs text-destructive">{errors.trainingFacultyName.message}</p>
                  )}
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-5">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Preparing Email...' : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Prepare Request Email
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
