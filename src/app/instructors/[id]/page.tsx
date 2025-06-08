
'use client';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockInstructors, mockCourses } from '@/data/mockData';
import type { Instructor, Course, PersonalDocument } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3, User, Mail, Phone, MapPin, Award, ShieldCheck, Briefcase, FileText, UploadCloud, Search as SearchIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstructorForm } from '@/components/instructors/InstructorForm';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

const CertificationDisplay: React.FC<{ cert?: { name: string; issuedDate?: string; expiryDate?: string } }> = memo(({ cert }) => {
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
});
CertificationDisplay.displayName = 'CertificationDisplay';


const PersonalDocumentsSection: React.FC<{ instructor: Instructor, onDocumentsChange: (docs: PersonalDocument[]) => void }> = memo(({ instructor, onDocumentsChange }) => {
  const [documents, setDocuments] = useState<PersonalDocument[]>(instructor.uploadedDocuments || []);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newDocument: PersonalDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'certification_card' : file.name.endsWith('.docx') || file.name.endsWith('.doc') ? 'resume' : file.name.toLowerCase().includes('packet') || file.name.toLowerCase().includes('renewal') ? 'renewal_packet' : 'other',
        uploadDate: new Date().toISOString().split('T')[0],
        instructorId: instructor.id,
        fileUrl: URL.createObjectURL(file), 
        size: `${(file.size / 1024).toFixed(1)}KB`
      };
      const updatedDocs = [...documents, newDocument];
      setDocuments(updatedDocs);
      onDocumentsChange(updatedDocs); 
      toast({ title: "Document Uploaded", description: `${file.name} uploaded successfully.` });
    }
  }, [documents, instructor.id, onDocumentsChange, toast]);

  const handleDeleteDocument = useCallback((docId: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    onDocumentsChange(updatedDocs);
    toast({ title: "Document Deleted", description: `Document removed.`, variant: "destructive" });
  }, [documents, onDocumentsChange, toast]);

  const filteredDocuments = useMemo(() => documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  ), [documents, searchTerm]);

  useEffect(() => {
    setDocuments(instructor.uploadedDocuments || []);
  }, [instructor.uploadedDocuments]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Documents</CardTitle>
        <CardDescription>Manage renewal packets, certification cards, and resumes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents by name or type..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Label htmlFor={`file-upload-${instructor.id}`} className="cursor-pointer flex items-center justify-center">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
              <Input id={`file-upload-${instructor.id}`} type="file" className="sr-only" onChange={handleFileUpload} />
            </Label>
          </Button>
        </div>
        {filteredDocuments.length > 0 ? (
          <ScrollArea className="h-[250px] pr-3">
            <ul className="space-y-3">
              {filteredDocuments.map(doc => (
                <li key={doc.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-sm truncate" title={doc.name}>{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: <span className="capitalize">{doc.type.replace('_', ' ')}</span> | Uploaded: {format(new Date(doc.uploadDate), "MMM d, yyyy")}
                      </p>
                       <p className="text-xs text-muted-foreground">Size: {doc.size}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-1">
                     {doc.fileUrl && doc.fileUrl.startsWith('blob:') && (
                        <Button variant="ghost" size="sm" asChild>
                           <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download={doc.name}>
                             View
                           </a>
                        </Button>
                     )}
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDeleteDocument(doc.id)} aria-label={`Delete document ${doc.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded or found matching your search.</p>
        )}
      </CardContent>
    </Card>
  );
});
PersonalDocumentsSection.displayName = 'PersonalDocumentsSection';


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
      router.push('/instructors');
    }
  }, [id, router]);

  const potentialSupervisors = useMemo(() => {
    return mockInstructors
      .filter(instr => (instr.role === 'TrainingCenterCoordinator' || instr.role === 'TrainingSiteCoordinator') && instr.id !== id)
      .map(instr => ({ id: instr.id, name: instr.name }));
  }, [id]);

  const handleEditToggle = useCallback(() => setIsEditing(prev => !prev), []);

  const handleFormSubmit = useCallback((data: Instructor) => {
    // Revoke old blob URL if it exists and a new one is provided or if it's cleared
    if (instructor?.profilePictureUrl && instructor.profilePictureUrl.startsWith('blob:') &&
        (!data.profilePictureUrl || data.profilePictureUrl !== instructor.profilePictureUrl)) {
      URL.revokeObjectURL(instructor.profilePictureUrl);
    }
    
    setInstructor(prevInstructor => {
      if (!prevInstructor) return null; 
      const updatedInstructor = { ...prevInstructor, ...data }; // data from form includes profilePictureUrl
      
      const index = mockInstructors.findIndex(i => i.id === id);
      if (index !== -1) {
        mockInstructors[index] = updatedInstructor; 
      }
      return updatedInstructor; 
    });
    
    toast({
        title: "Profile Updated",
        description: `${data.name}'s profile has been successfully updated.`,
    });
    setIsEditing(false);
  }, [id, toast, instructor?.profilePictureUrl]);
  
  const handleDocumentsChange = useCallback((updatedDocs: PersonalDocument[]) => {
    setInstructor(prevInstructor => {
        if (prevInstructor) {
            const updatedInstructorData = { ...prevInstructor, uploadedDocuments: updatedDocs };
            const index = mockInstructors.findIndex(i => i.id === prevInstructor.id);
            if (index !== -1) {
                mockInstructors[index] = updatedInstructorData; 
            }
            return updatedInstructorData;
        }
        return null;
    });
  }, []);

  // Cleanup blob URL on component unmount if it was created by this component instance
  useEffect(() => {
    return () => {
      if (instructor?.profilePictureUrl && instructor.profilePictureUrl.startsWith('blob:')) {
        // This cleanup is tricky because the blob URL might be from another session if not careful
        // For a robust solution, blob URLs should ideally be managed more centrally or avoided for long-term state
        // URL.revokeObjectURL(instructor.profilePictureUrl); // Potentially causes issues if URL is re-used. Manage more carefully or omit general cleanup.
      }
    };
  }, [instructor?.profilePictureUrl]);


  if (!instructor) {
    return <div className="flex justify-center items-center h-screen"><p>Loading instructor data...</p></div>;
  }

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
            <InstructorForm 
              initialData={instructor} 
              onSubmit={handleFormSubmit}
              potentialSupervisors={potentialSupervisors} 
            />
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
                  unoptimized={instructor.profilePictureUrl?.startsWith('blob:')} // Important for blob URLs
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
                  <p className="text-sm mb-1">Role: {instructor.role.replace(/([A-Z])/g, ' $1').trim()}</p>
                  {instructor.supervisor && <p className="text-sm mb-1">Supervisor: {instructor.supervisor}</p>}
                  <p className="text-sm">Training Faculty: {instructor.isTrainingFaculty ? 'Yes' : 'No'}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-3 text-primary flex items-center"><Award className="mr-2 h-5 w-5"/>Certifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {instructor.certifications && Object.entries(instructor.certifications).map(([key, cert]) => (
                      <Card key={key} className="p-3 bg-muted/30">
                        <CardHeader className="p-0 pb-1">
                           <CardTitle className="text-sm font-semibold capitalize flex items-center"><ShieldCheck className="mr-1.5 h-4 w-4 text-accent"/>{cert?.name || key}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <CertificationDisplay cert={cert} />
                        </CardContent>
                      </Card>
                    ))}
                    {(!instructor.certifications || Object.keys(instructor.certifications).length === 0) && (
                        <p className="text-sm text-muted-foreground col-span-full">No certifications listed.</p>
                    )}
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
