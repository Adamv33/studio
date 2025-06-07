'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { mockCourses, mockInstructors } from '@/data/mockData';
import type { Course, Instructor } from '@/types';
import { CourseTable } from '@/components/courses/CourseTable';
import { CourseForm } from '@/components/courses/CourseForm';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [pastedData, setPastedData] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setCourses(mockCourses.map(course => ({
        ...course,
        instructorName: mockInstructors.find(i => i.id === course.instructorId)?.name || 'Unknown Instructor'
    })));
    setInstructors(mockInstructors);
  }, []);

  const handleAddCourse = (newCourse: Course) => {
    const courseWithInstructorName = {
        ...newCourse,
        instructorName: instructors.find(i => i.id === newCourse.instructorId)?.name || 'Unknown Instructor'
    };
    setCourses(prev => [courseWithInstructorName, ...prev]);
    toast({
        title: "Course Added",
        description: `Course with eCard ${newCourse.eCardCode} has been added.`,
    });
    setIsFormOpen(false); // Close dialog after adding
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
     toast({
        title: "Course Deleted",
        description: `Course has been removed.`,
        variant: "destructive"
    });
  };

  const handleParsePastedData = () => {
    if (!pastedData.trim()) {
      toast({ title: "No Data", description: "Paste data into the textarea first.", variant: "destructive" });
      return;
    }
    const lines = pastedData.trim().split('\n');
    const newCourses: Course[] = lines.map((line, index) => {
      const fields = line.split('\t'); // Assuming tab-separated values
      // Basic parsing, needs robust error handling and field mapping in a real app
      const [eCardCode, courseDate, studentFirstName, studentLastName, studentEmail, studentPhone, instructorNameFromFile, trainingLocationAddress] = fields;
      
      const matchedInstructor = instructors.find(i => i.name.toLowerCase() === instructorNameFromFile?.toLowerCase());

      return {
        id: `pasted_${Date.now()}_${index}`,
        eCardCode: eCardCode || `PENDING_ECARD_${index}`,
        courseDate: courseDate || new Date().toISOString().split('T')[0],
        studentFirstName: studentFirstName || 'N/A',
        studentLastName: studentLastName || 'N/A',
        studentEmail: studentEmail || 'N/A',
        studentPhone: studentPhone || 'N/A',
        instructorId: matchedInstructor?.id || instructors[0]?.id || 'unknown_instr_id', // Fallback instructor
        instructorName: matchedInstructor?.name || instructors[0]?.name || 'Unknown Instructor',
        trainingLocationAddress: trainingLocationAddress || 'N/A',
        courseType: 'Other', // Default, could try to infer
      };
    }).filter(course => course.eCardCode); // Ensure at least eCardCode exists

    if (newCourses.length > 0) {
      setCourses(prev => [...newCourses, ...prev]);
      toast({ title: "Data Parsed", description: `${newCourses.length} courses added from pasted data.` });
      setPastedData(''); // Clear textarea
    } else {
      toast({ title: "Parsing Failed", description: "Could not parse data. Ensure format is correct.", variant: "destructive" });
    }
  };


  return (
    <div>
      <PageHeader
        title="Courses"
        description="Manage instructor-led course data."
        actions={
          <div className="flex gap-2">
             <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Paste Data</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Paste Course Data</DialogTitle>
                  <DialogDescription>
                    Paste data from your spreadsheet (tab-separated: eCard, Date, First, Last, Email, Phone, Instructor, Address).
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Paste data here..."
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  rows={10}
                  className="my-4"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleParsePastedData}>Parse and Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90"><PlusCircle className="mr-2 h-4 w-4" /> Add New Course</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                        <DialogDescription>Enter the details for the new course.</DialogDescription>
                    </DialogHeader>
                    <CourseForm instructors={instructors} onSubmit={handleAddCourse} />
                </DialogContent>
            </Dialog>
          </div>
        }
      />
      <Card>
        <CardHeader>
            <CardTitle>Course List</CardTitle>
        </CardHeader>
        <CardContent>
            <CourseTable courses={courses} onDeleteCourse={handleDeleteCourse} />
        </CardContent>
      </Card>
    </div>
  );
}
