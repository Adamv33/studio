'use client';
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InstructorForm } from '@/components/instructors/InstructorForm';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast"
import type { Instructor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export default function NewInstructorPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data: Instructor) => {
    // In a real app, this would be an API call to save the data
    console.log('New instructor data:', data);
    // Add to mock data or state management if implementing client-side persistence for demo
    toast({
        title: "Instructor Added",
        description: `${data.name} has been successfully added.`,
    })
    router.push('/instructors'); // Redirect to instructors list after submission
  };

  return (
    <div>
      <PageHeader
        title="Add New Instructor"
        description="Fill in the details for the new instructor."
      />
      <Card>
        <CardContent className="p-6">
          <InstructorForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
