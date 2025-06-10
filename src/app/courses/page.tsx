'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockInstructors } from '@/data/mockData'; // Keep for instructor dropdown
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
import { firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp, orderBy, query } from 'firebase/firestore';
import { format } from 'date-fns'; // For date formatting if needed

const availableCourseTypes: Course['courseType'][] = [
  'ACLS EP',
  'ACLS Provider',
  'Advisor: BLS',
  'BLS Provider',
  'HeartCode ACLS w/lnstructor',
  'HeartCode ACLS w/VAM',
  'HeartCode BLS w/lnstructor',
  'HeartCode BLS w/VAM',
  'HeartCode PALS w/lnstructor',
  'HeartCode PALS w/VAM',
  'Heartsaver CPR AED',
  'Heartsaver First Aid',
  'Heartsaver First Aid CPR AED',
  'Heartsaver for K-12 Schools',
  'Heartsaver Pediatric First Aid CPR AED',
  'PALS Plus Provider',
  'PALS Provider',
  'PEARS Provider',
  'Other'
];


export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [pastedData, setPastedData] = useState('');
  const [batchInstructorId, setBatchInstructorId] = useState<string>('');
  const [batchTrainingAddress, setBatchTrainingAddress] = useState<string>('');
  const [batchCourseType, setBatchCourseType] = useState<Course['courseType']>('BLS Provider');
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isGeneratingDescriptions, setIsGeneratingDescriptions] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const { toast } = useToast();

  const fetchCourses = useCallback(async () => {
    setIsLoadingCourses(true);
    try {
      const coursesCollectionRef = collection(firestore, 'courses');
      // Order by courseDate descending, so newer courses appear first
      const q = query(coursesCollectionRef, orderBy('courseDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const firestoreCourses = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Course));
      setCourses(firestoreCourses);
    } catch (error) {
      console.error("Error fetching courses from Firestore:", error);
      toast({
        title: "Error Loading Courses",
        description: "Could not fetch courses from the database. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCourses(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCourses();
    // Load instructors for the dropdown (still from mockData for now)
    // In a full Firestore app, instructors would also come from Firestore.
    setInstructors(mockInstructors);
    if (mockInstructors.length > 0 && !batchInstructorId) {
        setBatchInstructorId(mockInstructors[0].id);
    }
  }, [fetchCourses, batchInstructorId]);

  const handleDeleteCourse = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(firestore, 'courses', id));
      setCourses(prev => prev.filter(course => course.id !== id));
      toast({
          title: "Course Deleted",
          description: `Course record has been removed from Firestore.`,
          variant: "destructive"
      });
    } catch (error) {
      console.error("Error deleting course from Firestore:", error);
      toast({
        title: "Error Deleting Course",
        description: "Could not remove the course from Firestore. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleBulkAddCourses = useCallback(async () => {
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
    
    const parsedCoursesData: Omit<Course, 'id' | 'description'>[] = lines.map((line, index) => {
      const fields = line.split('\t');
      if (fields.length < 6) {
        console.warn(`Line ${index + 1} has insufficient data. Expected 6 tab-separated fields, got ${fields.length}. Line: "${line}"`);
        return null; 
      }
      const [eCardCode, courseDateStr, studentFirstName, studentLastName, studentEmail, studentPhone] = fields;
      
      // Validate date format (YYYY-MM-DD)
      const courseDate = courseDateStr && /^\d{4}-\d{2}-\d{2}$/.test(courseDateStr) 
        ? courseDateStr 
        : new Date().toISOString().split('T')[0];


      const selectedInstructor = instructors.find(i => i.id === batchInstructorId);
      if (!selectedInstructor) {
        console.error(`Selected instructor with ID ${batchInstructorId} not found in mock list.`);
        toast({ title: "Instructor Not Found", description: `Could not find details for selected instructor.`, variant: "destructive" });
        return null;
      }

      coursesSuccessfullyParsed++;
      return {
        eCardCode: eCardCode || `PENDING_ECARD_${index}`,
        courseDate: courseDate, 
        studentFirstName: studentFirstName || 'N/A',
        studentLastName: studentLastName || 'N/A',
        studentEmail: studentEmail || 'N/A',
        studentPhone: studentPhone || 'N/A',
        instructorId: batchInstructorId,
        instructorName: selectedInstructor.name, 
        trainingLocationAddress: batchTrainingAddress,
        courseType: batchCourseType, 
      };
    }).filter(course => course !== null && course.eCardCode) as Omit<Course, 'id' | 'description'>[];

    if (parsedCoursesData.length === 0) {
      if (lines.length > 0) {
         toast({ title: "Parsing Failed", description: "No valid courses found in pasted data. Ensure data is tab-separated with 6 columns and dates are YYYY-MM-DD.", variant: "destructive" });
      }
      return;
    }

    setIsGeneratingDescriptions(true);
    toast({ title: "Processing Courses", description: `Parsed ${parsedCoursesData.length} courses. Generating descriptions and saving to Firestore...` });

    let coursesAddedToFirestore = 0;
    const coursesCollectionRef = collection(firestore, 'courses');

    for (const courseData of parsedCoursesData) {
      try {
        const { description } = await generateCourseDescription({ courseType: courseData.courseType || 'Other' });
        const courseToSave: Omit<Course, 'id'> = { ...courseData, description };
        
        await addDoc(coursesCollectionRef, courseToSave);
        coursesAddedToFirestore++;

      } catch (error) {
        console.error(`Failed to generate description or save course for ${courseData.studentFirstName} ${courseData.studentLastName}:`, error);
        toast({ title: "AI/Save Error", description: `Could not process/save course for ${courseData.studentFirstName} ${courseData.studentLastName}.`, variant: "destructive" });
      }
    }
    setIsGeneratingDescriptions(false);
    
    if (coursesAddedToFirestore > 0) {
      toast({ title: "Courses Added", description: `${coursesAddedToFirestore} courses added to Firestore with AI-generated descriptions.` });
      await fetchCourses(); 
      setPastedData('');
      setIsAddCourseDialogOpen(false);
    } else if (lines.length > 0 && coursesSuccessfullyParsed === 0) {
        toast({ title: "Parsing Failed", description: "No courses were added. Ensure data is tab-separated and valid.", variant: "destructive" });
    } else if (lines.length > 0 && coursesAddedToFirestore < coursesSuccessfullyParsed) {
        toast({ title: "Partial Success", description: `${coursesAddedToFirestore} courses added to Firestore. Some may have failed.`, variant: "default" });
        await fetchCourses(); 
        setPastedData('');
        setIsAddCourseDialogOpen(false);
    }
  }, [pastedData, batchInstructorId, batchTrainingAddress, batchCourseType, instructors, toast, fetchCourses]);

  useEffect(() => {
    if (isAddCourseDialogOpen) {
      if (instructors.length > 0 && !batchInstructorId) {
        setBatchInstructorId(instructors[0].id);
      }
      if (!batchCourseType && availableCourseTypes.length > 0) {
        setBatchCourseType(availableCourseTypes[0]);
      }
    }
  }, [isAddCourseDialogOpen, instructors, batchInstructorId, batchCourseType]);


  return (
    <div>
      <PageHeader
        title="Courses"
        description="Manage instructor-led course data. AI can help generate descriptions. Data is stored in Firestore."
        actions={
            <Dialog open={isAddCourseDialogOpen} onOpenChange={(isOpen) => {
                setIsAddCourseDialogOpen(isOpen);
                if (!isOpen) { 
                    setPastedData(''); // Clear pasted data when dialog is closed
                } else {
                    // Pre-fill if dialog is opening and values are not set
                    if (instructors.length > 0 && !batchInstructorId) {
                        setBatchInstructorId(instructors[0].id);
                    }
                    if (!batchCourseType && availableCourseTypes.length > 0) {
                         setBatchCourseType(availableCourseTypes[0]);
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
                            Select the course type, instructor, and enter the training address for this entire batch. AI will attempt to generate descriptions. Courses will be saved to Firestore.
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
                        <Button onClick={handleBulkAddCourses} disabled={isGeneratingDescriptions || !pastedData.trim() || !batchInstructorId || !batchTrainingAddress || !batchCourseType}>
                          {isGeneratingDescriptions ? "Processing..." : "Parse and Add Courses to Firestore"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        }
      />
      <Card>
        <CardHeader>
            <CardTitle>Course List (from Firestore)</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoadingCourses ? (
              <p className="text-center text-muted-foreground py-8">Loading courses from Firestore...</p>
            ) : (
              <CourseTable courses={courses} onDeleteCourse={handleDeleteCourse} />
            )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-2">
        Note: Course data is now managed in Firestore. Ensure security rules for the 'courses' collection allow read/write access as needed. For example, to allow any authenticated user: `match /courses/{document=**} { allow read, write: if request.auth != null; }`
      </p>
    </div>
  );
}
