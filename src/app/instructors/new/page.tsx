
'use client';
import React, { useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InstructorForm } from '@/components/instructors/InstructorForm';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast"
import type { Instructor, UserProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { mockInstructors } from '@/data/mockData'; 
import { useAuth } from '@/contexts/AuthContext';

export default function NewInstructorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && userProfile) {
      const canAccess = ['Admin', 'TrainingCenterCoordinator', 'TrainingSiteCoordinator'].includes(userProfile.role);
      if (!canAccess) {
        toast({ title: "Access Denied", description: "You don't have permission to add new instructors.", variant: "destructive"});
        router.push('/instructors');
      }
    } else if (!authLoading && !userProfile) {
        // Not logged in or no profile, redirect
        router.push('/login');
    }
  }, [userProfile, authLoading, router, toast]);

  const potentialSupervisors = useMemo(() => {
    if (!userProfile) return [];
    // Admins can see all TCCs and TSCs as potential supervisors.
    // TCCs can see TSCs they manage, or set themselves if adding direct instructor.
    // TSCs effectively supervise instructors under them, so this might be more about assigning to *their* group.
    
    // For simplicity:
    // Admin sees all TCC/TSC
    // TCC sees TSCs they manage
    // TSC sees no one (as they are the supervisor for instructors they add)
    
    // A better approach for "managedByInstructorId":
    // The new instructor's `managedByInstructorId` should be the ID of the user creating them,
    // if the creator is a TCC or TSC. Admins would need to select.

    return mockInstructors
      .filter(instr => {
        if (userProfile.role === 'Admin') {
          return ['TrainingCenterCoordinator', 'TrainingSiteCoordinator'].includes(instr.role);
        }
        if (userProfile.role === 'TrainingCenterCoordinator') {
          // A TCC can assign a TSC they manage as a supervisor for a new instructor
          return instr.role === 'TrainingSiteCoordinator' && instr.managedByInstructorId === userProfile.uid;
        }
        // TSCs will implicitly be the supervisor (managedByInstructorId) for instructors they create.
        return false; 
      })
      .map(instr => ({ id: instr.id, name: instr.name, role: instr.role as UserProfile['role'] }));
  }, [userProfile]);


  const handleSubmit = (data: Instructor) => {
    if (!userProfile) return;

    let managedBy: string | undefined = data.supervisor; // from form if selected by Admin
    
    if (userProfile.role === 'TrainingCenterCoordinator' || userProfile.role === 'TrainingSiteCoordinator') {
      // If TCC or TSC creates an instructor, they become the manager unless a sub-manager is chosen from potentialSupervisors
      // If data.supervisor is selected from the list (for TCC creating instructor under a TSC), use that.
      // Otherwise, the creator is the manager.
      if(!potentialSupervisors.find(s => s.name === data.supervisor)) {
        managedBy = userProfile.uid; // The creator is the direct manager
      }
    }


    const newInstructorWithId: Instructor = {
      ...data,
      id: `instr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: data.role || 'Instructor', // Default role if not set by Admin/TCC
      managedByInstructorId: managedBy,
      status: data.status || 'Pending', // Default to pending
      // profilePictureUrl will come from form data (might be blob URL)
    };
    
    mockInstructors.push(newInstructorWithId);
    
    toast({
        title: "Instructor Added",
        description: `${data.name} has been successfully added.`,
    })
    router.push('/instructors'); 
  };

  if (authLoading || !userProfile || !['Admin', 'TrainingCenterCoordinator', 'TrainingSiteCoordinator'].includes(userProfile.role)) {
    // Show loading or nothing until redirect in useEffect kicks in
    return <div className="text-center py-10"><p className="text-muted-foreground text-lg">Loading or Access Denied...</p></div>;
  }

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
            currentUserProfile={userProfile}
          />
        </CardContent>
      </Card>
    </div>
  );
}
