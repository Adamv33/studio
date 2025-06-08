
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockInstructors } from '@/data/mockData';
import type { Instructor } from '@/types';
import { PlusCircle, Filter } from 'lucide-react';
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
import { Search } from 'lucide-react'; 

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['Active', 'Inactive', 'Pending']);
  const { toast } = useToast();


  useEffect(() => {
    setInstructors(mockInstructors);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  }, []);

  const filteredInstructors = useMemo(() => {
    return instructors
      .filter(instructor =>
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.instructorId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(instructor => statusFilter.includes(instructor.status));
  }, [instructors, searchTerm, statusFilter]);

  const handleDeleteInstructor = useCallback((id: string) => {
    setInstructors(prev => prev.filter(instructor => instructor.id !== id));
    toast({
        title: "Instructor Deleted",
        description: `Instructor with ID ${id} has been removed.`,
        variant: "destructive"
    });
  }, [toast]);


  return (
    <div>
      <PageHeader
        title="Instructors"
        description="Manage instructor profiles, certifications, and documents."
        actions={
          <Link href="/instructors/new" passHref>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Instructor
            </Button>
          </Link>
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
            <InstructorCard key={instructor.id} instructor={instructor} onDelete={handleDeleteInstructor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-lg">No instructors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
