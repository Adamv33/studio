
'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockCourses, mockInstructors } from '@/data/mockData';
import type { Course, Instructor } from '@/types';
import { CourseTable } from '@/components/courses/CourseTable';
// CourseForm is no longer used directly by the "Add New Course" button in this page,
// but kept for potential future use (e.g., editing).
// import { CourseForm } from '@/components/courses/CourseForm';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [batchInstructorId, setBatchInstructorId] = useState<string>('');
  const [batchTrainingAddress, setBatchTrainingAddress] = useState<string>('');
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadedCourses = mockCourses.map(course => ({
        ...course,
        instructorName: mockInstructors.find(i => i.id === course.instructorId)?.name || 'Unknown Instructor'
    }));
    setCourses(loadedCourses);
    setInstructors(mockInstructors);
    if (mockInstructors.length > 0 && !batchInstructorId) {
        setBatchInstructorId(mockInstructors[0].id);
    }
  }, [batchInstructorId]); // Added batchInstructorId to dependencies to ensure it's set if instructors load later

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
     toast({
        title: "Course Deleted",
        description: `Course has been removed.`,
        variant: "destructive"
    });
  };

  const handleBulkAddCourses = () => {
    if (!pastedData.trim()) {
      toast({ title: "No Data", description: "Paste student roster data into the textarea first.", variant: "destructive" });
      return;
    }
    if (!batchInstructorId) {
        toast({ title: "Missing Instructor", description: "Please select an instructor for this batch.", variant: "destructive" });
        return;
    }
    if (!batchTrainingAddress.trim()) {
        toast({ title: "Missing Address", description: "Please enter a training location address for this batch.", variant: "destructive" });
        return;
    }

    const lines = pastedData.trim().split('\n');
    let coursesSuccessfullyParsed = 0;
    const newCourses: Course[] = lines.map((line, index) => {
      const fields = line.split('\t');
      // Expecting 6 fields: eCard, Date, First, Last, Email, Phone
      if (fields.length < 6) {
        console.warn(`Line ${index + 1} has insufficient data. Expected 6 tab-separated fields, got ${fields.length}. Line: "${line}"`);
        return null; // Skip this line
      }
      const [eCardCode, courseDate, studentFirstName, studentLastName, studentEmail, studentPhone] = fields;

      const selectedInstructor = instructors.find(i => i.id === batchInstructorId);
      if (!selectedInstructor) {
        // This case should ideally not happen if batchInstructorId is validated and from the list
        console.error(`Selected instructor with ID ${batchInstructorId} not found.`);
        return null;
      }

      coursesSuccessfullyParsed++;
      return {
        id: `pasted_${Date.now()}_${index}`,
        eCardCode: eCardCode || `PENDING_ECARD_${index}`,
        courseDate: courseDate || new Date().toISOString().split('T')[0], // Consider making date mandatory from paste
        studentFirstName: studentFirstName || 'N/A',
        studentLastName: studentLastName || 'N/A',
        studentEmail: studentEmail || 'N/A',
        studentPhone: studentPhone || 'N/A',
        instructorId: batchInstructorId,
        instructorName: selectedInstructor.name,
        trainingLocationAddress: batchTrainingAddress,
        courseType: 'Other', // Default course type, can be changed later or made selectable
      };
    }).filter(course => course !== null && course.eCardCode) as Course[];

    if (newCourses.length > 0) {
      setCourses(prev => [...newCourses, ...prev]);
      toast({ title: "Courses Added", description: `${newCourses.length} courses added from pasted data.` });
      setPastedData('');
      // Optionally reset batchInstructorId and batchTrainingAddress or keep them for next paste
      // setBatchInstructorId(instructors.length > 0 ? instructors[0].id : '');
      // setBatchTrainingAddress('');
      setIsAddCourseDialogOpen(false);
    } else if (lines.length > 0 && coursesSuccessfullyParsed === 0) {
        toast({ title: "Parsing Failed", description: "No courses were added. Ensure data is tab-separated with 6 columns: eCard, Date, First Name, Last Name, Email, Phone.", variant: "destructive" });
    } else if (lines.length > 0 && coursesSuccessfullyParsed < lines.length) {
        toast({ title: "Partial Success", description: `${coursesSuccessfullyParsed} courses added. Some lines may have had formatting issues.`, variant: "default" });
        setPastedData('');
        setIsAddCourseDialogOpen(false);
    }
  };

  // Effect to set default instructor when dialog opens and instructors are available
  useEffect(() => {
    if (isAddCourseDialogOpen && instructors.length > 0 && !batchInstructorId) {
      setBatchInstructorId(instructors[0].id);
    }
  }, [isAddCourseDialogOpen, instructors, batchInstructorId]);


  return (
    <div>
      <PageHeader
        title="Courses"
        description="Manage instructor-led course data."
        actions={
            <Dialog open={isAddCourseDialogOpen} onOpenChange={(isOpen) => {
                setIsAddCourseDialogOpen(isOpen);
                if (!isOpen) { // Reset fields when dialog closes
                    setPastedData('');
                    // setBatchInstructorId(instructors.length > 0 ? instructors[0].id : ''); // Keep last selected or reset
                    // setBatchTrainingAddress(''); // Keep last entered or reset
                } else {
                    // Ensure default instructor is set when dialog opens if not already set
                    if (instructors.length > 0 && !batchInstructorId) {
                        setBatchInstructorId(instructors[0].id);
                    }
                }
            }}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90"><PlusCircle className="mr-2 h-4 w-4" /> Add New Courses</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Courses by Pasting Data</DialogTitle>
                        <DialogDescription>
                            Paste student roster data from your spreadsheet (tab-separated). Each line represents one student.
                            Expected columns: eCard Code, Course Date (YYYY-MM-DD), Student First Name, Student Last Name, Student Email, Student Phone.
                            Then, select an instructor and enter the training address for this entire batch.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="pastedCourseData">Pasted Student Roster Data</Label>
                            <Textarea
                              id="pastedCourseData"
                              placeholder="ECARD00X	2024-08-01	Jane	Doe	jane@example.com	555-1234&#x0a;ECARD00Y	2024-08-01	John	Smith	john@example.com	555-5678"
                              value={pastedData}
                              onChange={(e) => setPastedData(e.target.value)}
                              rows={8}
                              className="my-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="batchInstructor">Instructor for this Batch</Label>
                            <Select value={batchInstructorId} onValueChange={setBatchInstructorId}>
                                <SelectTrigger id="batchInstructor" className="my-1">
                                    <SelectValue placeholder="Select an instructor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {instructors.map(instructor => (
                                        <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="batchTrainingAddress">Training Location Address for this Batch</Label>
                            <Input
                                id="batchTrainingAddress"
                                placeholder="e.g., 123 Main St, Anytown, USA"
                                value={batchTrainingAddress}
                                onChange={(e) => setBatchTrainingAddress(e.target.value)}
                                className="my-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleBulkAddCourses}>Parse and Add Courses</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
