
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockInstructors } from '@/data/mockData'; // Keep for instructor dropdown
import type { Course, Instructor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

interface CourseStats {
  totalCourses: number;
  coursesByYear: { year: string; count: number }[];
  coursesByType: { type: string; count: number }[];
}

export default function CourseStatsPage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const coursesCollectionRef = collection(firestore, 'courses');
      const q = query(coursesCollectionRef, orderBy('courseDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const firestoreCourses = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Course));
      setAllCourses(firestoreCourses);
    } catch (error) {
      console.error("Error fetching courses from Firestore:", error);
      toast({
        title: "Error Loading Course Data",
        description: "Could not fetch course data for statistics.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllCourses();
    // Instructors list for filter dropdown (still mock for now)
    setInstructors(mockInstructors);
  }, [fetchAllCourses]);

  const instructorStats = useMemo(() => {
    const filteredCourses = selectedInstructorId === 'all'
      ? allCourses
      : allCourses.filter(course => course.instructorId === selectedInstructorId);

    const stats: CourseStats = {
      totalCourses: filteredCourses.length,
      coursesByYear: [],
      coursesByType: [],
    };

    const yearCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    filteredCourses.forEach(course => {
      const year = new Date(course.courseDate).getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      typeCounts[course.courseType] = (typeCounts[course.courseType] || 0) + 1;
    });

    stats.coursesByYear = Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year)); 
      
    stats.coursesByType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a,b) => b.count - a.count);

    return stats;
  }, [allCourses, selectedInstructorId]);

  const selectedInstructorName = selectedInstructorId === 'all' 
    ? 'All Instructors' 
    : instructors.find(i => i.id === selectedInstructorId)?.name || 'Selected Instructor';

  if (isLoading) {
    return (
        <div>
            <PageHeader title="Course Statistics" description="Loading statistics..." />
            <div className="text-center py-10">
                <p className="text-muted-foreground">Loading course data for statistics...</p>
            </div>
        </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Course Statistics"
        description={`Showing statistics for ${selectedInstructorName}.`}
      />

      <div className="mb-6">
        <Label htmlFor="instructor-select" className="sr-only">Select Instructor</Label>
        <Select value={selectedInstructorId} onValueChange={setSelectedInstructorId}>
          <SelectTrigger id="instructor-select" className="w-full md:w-[280px]">
            <SelectValue placeholder="Select Instructor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Instructors</SelectItem>
            {instructors.map(instructor => (
              <SelectItem key={instructor.id} value={instructor.id}>
                {instructor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Courses Taught</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{instructorStats.totalCourses}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Courses by Year</CardTitle>
            <CardDescription>Number of courses taught each year.</CardDescription>
          </CardHeader>
          <CardContent>
            {instructorStats.coursesByYear.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Courses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructorStats.coursesByYear.map((item) => (
                    <TableRow key={item.year}>
                      <TableCell className="font-medium">{item.year}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No course data for this selection.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses by Type</CardTitle>
            <CardDescription>Number of courses taught for each type.</CardDescription>
          </CardHeader>
          <CardContent>
            {instructorStats.coursesByType.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Type</TableHead>
                    <TableHead className="text-right">Courses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructorStats.coursesByType.map((item) => (
                    <TableRow key={item.type}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
               <p className="text-muted-foreground text-center py-4">No course data by type for this selection.</p>
            )}
          </CardContent>
        </Card>
      </div>
       <p className="text-xs text-muted-foreground mt-4">
        Note: Course data is now sourced from Firestore. Ensure security rules for the 'courses' collection allow read access.
      </p>
    </div>
  );
}

    