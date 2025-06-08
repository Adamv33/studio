
'use client';
import React, { useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InstructorForm } from '@/components/instructors/InstructorForm';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast"
import type { Instructor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { mockInstructors } from '@/data/mockData'; // Import mockInstructors

export default function NewInstructorPage() {
  const router = useRouter();
  const { toast } = useToast();

  const potentialSupervisors = useMemo(() => {
    return mockInstructors
      .filter(instr => instr.role === 'TrainingCenterCoordinator' || instr.role === 'TrainingSiteCoordinator')
      .map(instr => ({ id: instr.id, name: instr.name }));
  }, []);

  const handleSubmit = (data: Instructor) => {
    const newInstructorWithId: Instructor = {
      ...data,
      id: `instr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      role: data.role || 'Instructor', // Default role if not set
      // profilePictureUrl will come from form data (might be blob URL)
    };
    
    // Add to mock data
    mockInstructors.push(newInstructorWithId);
    
    toast({
        title: "Instructor Added",
        description: `${data.name} has been successfully added.`,
    })
    router.push('/instructors'); 
  };

  return (
    <div>
      <PageHeader
        title="Add New Instructor"
        description="Fill in the details for the new instructor."
      />
      <Card>
        <CardContent className="p-6">
          <InstructorForm 
            onSubmit={handleSubmit} 
            potentialSupervisors={potentialSupervisors} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
