
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockInstructors as allMockInstructors } from '@/data/mockData'; // Renamed to avoid conflict
import type { Instructor, UserProfile } from '@/types';
import { PlusCircle, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InstructorCard } from '@/components/instructors/InstructorCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// Helper function to get all instructors managed by a supervisor, recursively
const getManagedInstructorsRecursive = (supervisorId: string, instructors: Instructor[], allInstructors: Instructor[]): Instructor[] => {
  let managed: Instructor[] = [];
  const directReports = allInstructors.filter(i => i.managedByInstructorId === supervisorId);
  managed = managed.concat(directReports);
  directReports.forEach(report => {
    if (report.role === 'TrainingCenterCoordinator' || report.role === 'TrainingSiteCoordinator') {
      managed = managed.concat(getManagedInstructorsRecursive(report.id, [], allInstructors));
    }
  });
  return Array.from(new Set(managed.map(i => i.id))).map(id => managed.find(i => i.id === id)!); // Deduplicate
};


export default function InstructorsPage() {
  const { currentUser, userProfile, loading: authLoading } = useAuth(); // Get current user and profile
  const [instructors, setInstructors] = useState<Instructor[]>([]); // This will hold all instructors initially loaded
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['Active', 'Inactive', 'Pending']);
  const { toast } = useToast();

  useEffect(() => {
    // Initially, load all instructors. Filtering will happen in useMemo.
    setInstructors(allMockInstructors);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  }, []);

  const canAddInstructor = useMemo(() => {
    if (!userProfile) return false;
    return ['Admin', 'TrainingCenterCoordinator', 'TrainingSiteCoordinator'].includes(userProfile.role);
  }, [userProfile]);

  const filteredInstructors = useMemo(() => {
    if (authLoading || !userProfile) {
      return []; // Wait for auth to load or if no profile, show nothing (or loading state)
    }

    let displayableInstructors: Instructor[] = [];

    switch (userProfile.role) {
      case 'Admin':
        displayableInstructors = instructors;
        break;
      case 'TrainingCenterCoordinator':
        // TCC sees self and all instructors they manage directly or indirectly
        const tccSelf = instructors.find(i => i.id === userProfile.uid);
        const managedByTCC = getManagedInstructorsRecursive(userProfile.uid, [], instructors);
        displayableInstructors = tccSelf ? [tccSelf, ...managedByTCC] : managedByTCC;
        break;
      case 'TrainingSiteCoordinator':
        // TSC sees self and all instructors they directly manage
        const tscSelf = instructors.find(i => i.id === userProfile.uid);
        const managedByTSC = instructors.filter(i => i.managedByInstructorId === userProfile.uid);
        displayableInstructors = tscSelf ? [tscSelf, ...managedByTSC] : managedByTSC;
        break;
      case 'Instructor':
        // Instructor sees only themselves on this page
        const instructorSelf = instructors.find(i => i.id === userProfile.uid);
        displayableInstructors = instructorSelf ? [instructorSelf] : [];
        break;
      default:
        displayableInstructors = [];
    }
    
    // Deduplicate just in case (e.g., self is also in managed list)
    displayableInstructors = Array.from(new Set(displayableInstructors.map(i => i.id))).map(id => displayableInstructors.find(i => i.id === id)!);

    return displayableInstructors
      .filter(instructor =>
        (instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.instructorId.toLowerCase().includes(searchTerm.toLowerCase())) &&
        statusFilter.includes(instructor.status)
      );
  }, [instructors, searchTerm, statusFilter, userProfile, authLoading]);


  const handleDeleteInstructor = useCallback((id: string) => {
    // In a real app, this would be an API call and then update state based on response.
    // For mock data, we filter out from the main `allMockInstructors` and update local state.
    // This deletion logic should also respect RBAC in a real scenario (API would enforce).
    
    // Update the main source if using mockData directly (not best practice for real app)
    const index = allMockInstructors.findIndex(i => i.id === id);
    if (index > -1) allMockInstructors.splice(index, 1);
    
    setInstructors(prev => prev.filter(instructor => instructor.id !== id));
    toast({
        title: "Instructor Deleted",
        description: `Instructor has been removed.`,
        variant: "destructive"
    });
  }, [toast]);

  if (authLoading) {
    return <div className="text-center py-10"><p className="text-muted-foreground text-lg">Loading instructors...</p></div>;
  }

  return (
    <div>
      <PageHeader
        title="Instructors"
        description="Manage instructor profiles, certifications, and documents."
        actions={
          canAddInstructor ? (
            <Link href="/instructors/new" passHref>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Instructor
              </Button>
            </Link>
          ) : null
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search instructors by name, email, or ID..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter by Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['Active', 'Inactive', 'Pending'].map(status => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.includes(status)}
                onCheckedChange={() => handleStatusFilterChange(status)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredInstructors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
            <InstructorCard 
              key={instructor.id} 
              instructor={instructor} 
              onDelete={handleDeleteInstructor} 
              currentUserProfile={userProfile} // Pass current user profile for permission checks
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-lg">No instructors found matching your criteria or accessible to you.</p>
        </div>
      )}
    </div>
  );
}
