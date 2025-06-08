
'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockInstructors, mockCourses } from '@/data/mockData';
import type { Instructor, Course, PersonalDocument } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3, User, Mail, Phone, MapPin, Award, ShieldCheck, Briefcase, FileText, UploadCloud, Search as SearchIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstructorForm } from '@/components/instructors/InstructorForm';
import { useToast } from "@/hooks/use-toast"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

const CertificationDisplay: React.FC<{ cert?: { name: string; issuedDate?: string; expiryDate?: string } }> = ({ cert }) => {
  if (!cert || (!cert.issuedDate && !cert.expiryDate)) return <span className="text-muted-foreground">Not specified</span>;
  
  const isExpired = cert.expiryDate ? new Date(cert.expiryDate) < new Date() : false;
  const badgeVariant = isExpired ? "destructive" : "default";
  
  return (
    <div className="text-sm">
      {cert.issuedDate && <p>Issued: {format(new Date(cert.issuedDate), "MMM d, yyyy")}</p>}
      {cert.expiryDate && (
        <div className="flex items-center">
          Expires: {format(new Date(cert.expiryDate), "MMM d, yyyy")}
          <Badge variant={badgeVariant} className="ml-2 px-1.5 py-0.5 text-xs">
            {isExpired ? "Expired" : "Current"}
          </Badge>
        </div>
      )}
    </div>
  );
};

const PersonalDocumentsSection: React.FC<{ instructor: Instructor, onDocumentsChange: (docs: PersonalDocument[]) => void }> = ({ instructor, onDocumentsChange }) => {
  const [documents, setDocuments] = useState<PersonalDocument[]>(instructor.uploadedDocuments || []);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newDocument: PersonalDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'certification_card' : file.name.endsWith('.docx') ? 'resume' : 'other', // Basic type inference
        uploadDate: new Date().toISOString().split('T')[0],
        instructorId: instructor.id,
        fileUrl: URL.createObjectURL(file), // Placeholder for actual URL
        size: `${(file.size / 1024).toFixed(1)}KB`
      };
      const updatedDocs = [...documents, newDocument];
      setDocuments(updatedDocs);
      onDocumentsChange(updatedDocs); // Propagate change up
      toast({ title: "Document Uploaded", description: `${file.name} uploaded successfully.` });
    }
  };

  const handleDeleteDocument = (docId: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    onDocumentsChange(updatedDocs);
    toast({ title: "Document Deleted", description: `Document removed.`, variant: "destructive" });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Documents</CardTitle>
        <CardDescription>Manage renewal packets, certification cards, and resumes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents (AI search placeholder)..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild variant="outline">
            <Label htmlFor={`file-upload-${instructor.id}`} className="cursor-pointer">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload
              <Input id={`file-upload-${instructor.id}`} type="file" className="sr-only" onChange={handleFileUpload} />
            </Label>
          </Button>
        </div>
        {filteredDocuments.length > 0 ? (
          <ScrollArea className="h-[200px] pr-3">
            <ul className="space-y-2">
              {filteredDocuments.map(doc => (
                <li key={doc.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: <span className="capitalize">{doc.type.replace('_', ' ')}</span> | Uploaded: {format(new Date(doc.uploadDate), "MMM d, yyyy")} | Size: {doc.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteDocument(doc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded or found.</p>
        )}
      </CardContent>
    </Card>
  );
};


export default function InstructorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);

  useEffect(() => {
    const foundInstructor = mockInstructors.find(instr => instr.id === id);
    if (foundInstructor) {
      setInstructor(foundInstructor);
      const coursesTaught = mockCourses.filter(course => course.instructorId === id);
      setInstructorCourses(coursesTaught);
    } else {
      // Handle not found, maybe redirect or show error
      router.push('/instructors');
    }
  }, [id, router]);

  if (!instructor) {
    return <div className="flex justify-center items-center h-screen"><p>Loading instructor data...</p></div>;
  }

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleFormSubmit = (data: Instructor) => {
    // Update mock data or state management
    const updatedInstructor = { ...instructor, ...data };
    setInstructor(updatedInstructor);
    // Find and update in the main mockInstructors array for persistence in this demo
    const index = mockInstructors.findIndex(i => i.id === id);
    if (index !== -1) mockInstructors[index] = updatedInstructor;
    
    toast({
        title: "Profile Updated",
        description: `${data.name}'s profile has been successfully updated.`,
    })
    setIsEditing(false);
  };
  
  const handleDocumentsChange = (updatedDocs: PersonalDocument[]) => {
    if (instructor) {
        const updatedInstructorData = { ...instructor, uploadedDocuments: updatedDocs };
        setInstructor(updatedInstructorData);
        // Update mockInstructors array
        const index = mockInstructors.findIndex(i => i.id === instructor.id);
        if (index !== -1) {
            mockInstructors[index] = updatedInstructorData;
        }
    }
  };


  return (
    <div>
      <PageHeader
        title={isEditing ? `Editing: ${instructor.name}` : instructor.name}
        description={isEditing ? 'Update instructor details below.' : `Instructor ID: ${instructor.instructorId}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>
            <Button onClick={handleEditToggle} className="bg-accent hover:bg-accent/90">
              <Edit3 className="mr-2 h-4 w-4" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>
        }
      />

      {isEditing ? (
        <Card>
          <CardContent className="p-6">
            <InstructorForm initialData={instructor} onSubmit={handleFormSubmit} />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="courses">Courses Taught</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4 p-6">
                <Image
                  src={instructor.profilePictureUrl || 'https://placehold.co/120x120.png'}
                  alt={instructor.name}
                  width={120}
                  height={120}
                  className="rounded-lg border object-cover shadow-sm"
                  data-ai-hint="instructor portrait"
                />
                <div className="flex-1">
                  <CardTitle className="text-2xl font-headline mb-1">{instructor.name}</CardTitle>
                  <CardDescription className="text-md">ID: {instructor.instructorId}</CardDescription>
                  <div className="mt-2 flex gap-2 items-center">
                    <Badge variant={instructor.status === 'Active' ? 'default' : instructor.status === 'Pending' ? 'secondary': 'destructive'} className="capitalize">
                      {instructor.status}
                    </Badge>
                    {instructor.isTrainingFaculty && <Badge variant="outline">Training Faculty</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-primary flex items-center"><User className="mr-2 h-5 w-5"/>Contact Information</h4>
                  <p className="text-sm flex items-center mb-1"><Mail className="mr-2 h-4 w-4 text-muted-foreground"/>{instructor.emailAddress}</p>
                  <p className="text-sm flex items-center mb-1"><Phone className="mr-2 h-4 w-4 text-muted-foreground"/>{instructor.phoneNumber}</p>
                  <p className="text-sm flex items-start"><MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5"/>{instructor.mailingAddress}</p>
                </div>
                 <div>
                  <h4 className="font-semibold mb-2 text-primary flex items-center"><Briefcase className="mr-2 h-5 w-5"/>Professional Details</h4>
                  {instructor.supervisor && <p className="text-sm mb-1">Supervisor: {instructor.supervisor}</p>}
                  <p className="text-sm">Training Faculty: {instructor.isTrainingFaculty ? 'Yes' : 'No'}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-3 text-primary flex items-center"><Award className="mr-2 h-5 w-5"/>Certifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(instructor.certifications).map(([key, cert]) => (
                      <Card key={key} className="p-3 bg-muted/30">
                        <CardHeader className="p-0 pb-1">
                           <CardTitle className="text-sm font-semibold capitalize flex items-center"><ShieldCheck className="mr-1.5 h-4 w-4 text-accent"/>{cert?.name || key}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <CertificationDisplay cert={cert} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
             <PersonalDocumentsSection instructor={instructor} onDocumentsChange={handleDocumentsChange} />
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Courses Taught</CardTitle>
                <CardDescription>List of courses instructed by {instructor.name}.</CardDescription>
              </CardHeader>
              <CardContent>
                {instructorCourses.length > 0 ? (
                   <ScrollArea className="h-[300px] pr-3">
                    <ul className="space-y-3">
                      {instructorCourses.map(course => (
                        <li key={course.id} className="p-3 border rounded-md hover:bg-muted/50">
                          <p className="font-medium text-sm">Course: {course.courseType} - eCard: {course.eCardCode}</p>
                          <p className="text-xs text-muted-foreground">Date: {format(new Date(course.courseDate), "MMM d, yyyy")} | Student: {course.studentFirstName} {course.studentLastName}</p>
                          <p className="text-xs text-muted-foreground">Location: {course.trainingLocationAddress}</p>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No courses found for this instructor.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
