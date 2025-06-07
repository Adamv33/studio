'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockCourses, mockInstructors } from '@/data/mockData';
import type { Course, Instructor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface CourseStats {
  totalCourses: number;
  coursesByYear: { year: string; count: number }[];
  coursesByType: { type: string; count: number }[];
}

const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const courseTypes: Course['courseType'][] = ['Heartsaver', 'BLS', 'ACLS', 'PALS', 'Other'];
const chartConfig = courseTypes.reduce((acc, type, index) => {
  acc[type.toLowerCase()] = {
    label: type,
    color: chartColors[index % chartColors.length],
  };
  return acc;
}, {} as ChartConfig);


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
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
      
    stats.coursesByType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }));

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
        <Select value={selectedInstructorId} onValueChange={setSelectedInstructorId}>
          <SelectTrigger className="w-full md:w-[280px]">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          </CardHeader>
          <CardContent>
            {instructorStats.coursesByYear.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={instructorStats.coursesByYear} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-center py-4">No course data for this year range.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {instructorStats.coursesByType.length > 0 ? (
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent nameKey="type" />} />
                    <Pie
                      data={instructorStats.coursesByType}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {instructorStats.coursesByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartConfig[entry.type.toLowerCase()]?.color || chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                     <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
               <p className="text-muted-foreground text-center py-4">No course data by type.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
