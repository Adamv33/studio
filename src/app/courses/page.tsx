
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockCourses, mockInstructors } from '@/data/mockData';
import type { Course, Instructor } from '@/types';
import { CourseTable } from '@/components/courses/CourseTable';
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
import { generateCourseDescription } from '@/ai/flows/generate-course-description-flow';

const availableCourseTypes: Course['courseType'][] = ['Heartsaver', 'BLS', 'ACLS', 'PALS', 'Other'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [pastedData, setPastedData] = useState('');
  const [batchInstructorId, setBatchInstructorId] = useState<string>('');
  const [batchTrainingAddress, setBatchTrainingAddress] = useState<string>('');
  const [batchCourseType, setBatchCourseType] = useState<Course['courseType']>('Other');
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isGeneratingDescriptions, setIsGeneratingDescriptions] = useState(false);
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
  }, [batchInstructorId]); 

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
     toast({
        title: "Course Deleted",
        description: `Course has been removed.`,
        variant: "destructive"
    });
  }, [toast]);

  const handleBulkAddCourses = async () => {
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
     if (!batchCourseType) {
        toast({ title: "Missing Course Type", description: "Please select a course type for this batch.", variant: "destructive" });
        return;
    }

    const lines = pastedData.trim().split('\n');
    let coursesSuccessfullyParsed = 0;
    
    const parsedCourses: Omit<Course, 'description'>[] = lines.map((line, index) => {
      const fields = line.split('\t');
      if (fields.length < 6) {
        console.warn(`Line ${index + 1} has insufficient data. Expected 6 tab-separated fields, got ${fields.length}. Line: "${line}"`);
        return null; 
      }
      const [eCardCode, courseDate, studentFirstName, studentLastName, studentEmail, studentPhone] = fields;

      const selectedInstructor = instructors.find(i => i.id === batchInstructorId);
      if (!selectedInstructor) {
        console.error(`Selected instructor with ID ${batchInstructorId} not found.`);
        return null;
      }

      coursesSuccessfullyParsed++;
      return {
        id: `pasted_${Date.now()}_${index}`,
        eCardCode: eCardCode || `PENDING_ECARD_${index}`,
        courseDate: courseDate || new Date().toISOString().split('T')[0],
        studentFirstName: studentFirstName || 'N/A',
        studentLastName: studentLastName || 'N/A',
        studentEmail: studentEmail || 'N/A',
        studentPhone: studentPhone || 'N/A',
        instructorId: batchInstructorId,
        instructorName: selectedInstructor.name,
        trainingLocationAddress: batchTrainingAddress,
        courseType: batchCourseType, 
      };
    }).filter(course => course !== null && course.eCardCode) as Omit<Course, 'description'>[];

    if (parsedCourses.length === 0) {
      if (lines.length > 0) {
         toast({ title: "Parsing Failed", description: "No valid courses found in pasted data. Ensure data is tab-separated with 6 columns.", variant: "destructive" });
      }
      return;
    }

    setIsGeneratingDescriptions(true);
    toast({ title: "Processing Courses", description: `Parsed ${parsedCourses.length} courses. Generating descriptions...` });

    const coursesWithDescriptionsPromises = parsedCourses.map(async (course) => {
      try {
        const { description } = await generateCourseDescription({ courseType: course.courseType || 'Other' });
        return { ...course, description };
      } catch (error) {
        console.error(`Failed to generate description for course ${course.id}:`, error);
        toast({ title: "AI Error", description: `Could not generate description for ${course.studentFirstName} ${course.studentLastName}.`, variant: "destructive" });
        return { ...course, description: `Standard ${course.courseType || 'Other'} course.` }; 
      }
    });

    const newCoursesWithDescriptions = await Promise.all(coursesWithDescriptionsPromises);
    setIsGeneratingDescriptions(false);
    
    if (newCoursesWithDescriptions.length > 0) {
      setCourses(prev => [...newCoursesWithDescriptions, ...prev]);
      toast({ title: "Courses Added", description: `${newCoursesWithDescriptions.length} courses added with AI-generated descriptions.` });
      setPastedData('');
      // setBatchInstructorId(instructors.length > 0 ? instructors[0].id : ''); // Keep instructor selected
      // setBatchTrainingAddress(''); // Keep address
      // setBatchCourseType('Other'); // Reset course type for next batch or keep selected? For now, reset.
      setIsAddCourseDialogOpen(false);
    } else if (lines.length > 0 && coursesSuccessfullyParsed === 0) {
        toast({ title: "Parsing Failed", description: "No courses were added. Ensure data is tab-separated with 6 columns.", variant: "destructive" });
    } else if (lines.length > 0 && coursesSuccessfullyParsed < lines.length) {
        toast({ title: "Partial Success", description: `${coursesSuccessfullyParsed} courses added. Some lines may have had formatting issues. Descriptions generated.`, variant: "default" });
        setPastedData('');
        setIsAddCourseDialogOpen(false);
    }
  };

  useEffect(() => {
    if (isAddCourseDialogOpen) {
      if (instructors.length > 0 && !batchInstructorId) {
        setBatchInstructorId(instructors[0].id);
      }
      // If batchCourseType is not set or dialog reopens, default it.
      if (!batchCourseType) {
        setBatchCourseType('Other');
      }
    }
  }, [isAddCourseDialogOpen, instructors, batchInstructorId, batchCourseType]);


  return (
    <div>
      <PageHeader
        title="Courses"
        description="Manage instructor-led course data. AI can help generate descriptions."
        actions={
            <Dialog open={isAddCourseDialogOpen} onOpenChange={(isOpen) => {
                setIsAddCourseDialogOpen(isOpen);
                if (!isOpen) { 
                    setPastedData('');
                    // Optionally reset other batch fields here if desired when dialog closes
                    // setBatchCourseType('Other');
                } else {
                    if (instructors.length > 0 && !batchInstructorId) {
                        setBatchInstructorId(instructors[0].id);
                    }
                    if (!batchCourseType) {
                         setBatchCourseType('Other');
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
                            Select the course type, instructor, and enter the training address for this entire batch. AI will attempt to generate descriptions.
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
                            <Label htmlFor="batchCourseType">Course Type for this Batch</Label>
                            <Select value={batchCourseType} onValueChange={(value) => setBatchCourseType(value as Course['courseType'])}>
                                <SelectTrigger id="batchCourseType" className="my-1">
                                    <SelectValue placeholder="Select course type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCourseTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <Button type="button" variant="outline" disabled={isGeneratingDescriptions}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleBulkAddCourses} disabled={isGeneratingDescriptions}>
                          {isGeneratingDescriptions ? "Processing..." : "Parse and Add Courses"}
                        </Button>
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

