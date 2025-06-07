
'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { mockCourses, mockInstructors } from '@/data/mockData';
import type { Course, Instructor } from '@/types';
import { CourseTable } from '@/components/courses/CourseTable';
// CourseForm is no longer used directly by the "Add New Course" button in this page, 
// but kept for potential future use (e.g., editing).
// import { CourseForm } from '@/components/courses/CourseForm'; 
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
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false); // Renamed for clarity
  const [isPasteDataDialogOpen, setIsPasteDataDialogOpen] = useState(false); // For the original paste button
  const { toast } = useToast();

  useEffect(() => {
    setCourses(mockCourses.map(course => ({
        ...course,
        instructorName: mockInstructors.find(i => i.id === course.instructorId)?.name || 'Unknown Instructor'
    })));
    setInstructors(mockInstructors);
  }, []);

  // This function is no longer directly used by the primary "Add New Course" button's dialog.
  // Kept for potential future "add single" functionality or if CourseForm is reintroduced.
  // const handleAddCourse = (newCourse: Course) => {
  //   const courseWithInstructorName = {
  //       ...newCourse,
  //       instructorName: instructors.find(i => i.id === newCourse.instructorId)?.name || 'Unknown Instructor'
  //   };
  //   setCourses(prev => [courseWithInstructorName, ...prev]);
  //   toast({
  //       title: "Course Added",
  //       description: `Course with eCard ${newCourse.eCardCode} has been added.`,
  //   });
  //   setIsAddCourseDialogOpen(false); 
  // };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
     toast({
        title: "Course Deleted",
        description: `Course has been removed.`,
        variant: "destructive"
    });
  };

  const handleParseAndAddPastedData = (sourceDialog: 'addCourse' | 'pasteData') => {
    if (!pastedData.trim()) {
      toast({ title: "No Data", description: "Paste data into the textarea first.", variant: "destructive" });
      return;
    }
    const lines = pastedData.trim().split('\n');
    const newCourses: Course[] = lines.map((line, index) => {
      const fields = line.split('\t'); 
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
        instructorId: matchedInstructor?.id || instructors[0]?.id || 'unknown_instr_id', 
        instructorName: matchedInstructor?.name || instructors[0]?.name || 'Unknown Instructor',
        trainingLocationAddress: trainingLocationAddress || 'N/A',
        courseType: 'Other', 
      };
    }).filter(course => course.eCardCode); 

    if (newCourses.length > 0) {
      const coursesWithFullInstructorNames = newCourses.map(course => ({
        ...course,
        instructorName: instructors.find(i => i.id === course.instructorId)?.name || 'Unknown Instructor'
      }));
      setCourses(prev => [...coursesWithFullInstructorNames, ...prev]);
      toast({ title: "Data Parsed", description: `${newCourses.length} courses added from pasted data.` });
      setPastedData(''); 
      if (sourceDialog === 'addCourse') {
        setIsAddCourseDialogOpen(false);
      } else {
        setIsPasteDataDialogOpen(false);
      }
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
             <Dialog open={isPasteDataDialogOpen} onOpenChange={setIsPasteDataDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsPasteDataDialogOpen(true)}><FileText className="mr-2 h-4 w-4" /> Paste Data</Button>
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
                    <Button type="button" variant="secondary" onClick={() => setPastedData('')}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={() => handleParseAndAddPastedData('pasteData')}>Parse and Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddCourseDialogOpen} onOpenChange={setIsAddCourseDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddCourseDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add New Course</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Courses by Pasting Data</DialogTitle>
                        <DialogDescription>
                            Paste course roster data from your spreadsheet. Ensure data is tab-separated with columns: 
                            eCard Code, Course Date (YYYY-MM-DD), Student First Name, Student Last Name, Student Email, Student Phone, Instructor Name, Training Location Address. Each line represents a new course.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="e.g. ECARD00X	2024-08-01	Jane	Doe	jane@example.com	555-1234	Dr. Emily Carter	123 Main St..."
                      value={pastedData}
                      onChange={(e) => setPastedData(e.target.value)}
                      rows={10}
                      className="my-4"
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={() => setPastedData('')}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={() => handleParseAndAddPastedData('addCourse')}>Parse and Add Courses</Button>
                    </DialogFooter>
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

    