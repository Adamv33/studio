
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockCourses, mockInstructors } from '@/data/mockData';
import type { Course, Instructor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CourseStats {
  totalCourses: number;
  coursesByYear: { year: string; count: number }[];
  coursesByType: { type: string; count: number }[];
}

export default function CourseStatsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | 'all'>('all');

  useEffect(() => {
    setCourses(mockCourses);
    setInstructors(mockInstructors);
  }, []);

  const instructorStats = useMemo(() => {
    const filteredCourses = selectedInstructorId === 'all'
      ? courses
      : courses.filter(course => course.instructorId === selectedInstructorId);

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
      .sort((a, b) => parseInt(b.year) - parseInt(a.year)); // Sort by year descending
      
    stats.coursesByType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a,b) => b.count - a.count); // Sort by count descending

    return stats;
  }, [courses, selectedInstructorId]);

  const selectedInstructorName = selectedInstructorId === 'all' 
    ? 'All Instructors' 
    : instructors.find(i => i.id === selectedInstructorId)?.name || 'Selected Instructor';

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
    </div>
  );
}

    