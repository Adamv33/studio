
'use client';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockInstructors as allMockInstructors } from '@/data/mockData'; // Keep for base instructor data
import type { Instructor, Course, PersonalDocument, UserProfile } from '@/types';
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
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';


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

const canEditProfile = (currentUserProfile: UserProfile | null, targetInstructorId: string, targetInstructorManagedById?: string, allInstructorsList?: Instructor[]): boolean => {
  if (!currentUserProfile) return false;
  if (currentUserProfile.role === 'Admin') return true;
  if (currentUserProfile.uid === targetInstructorId) return true;

  if (currentUserProfile.role === 'TrainingCenterCoordinator') {
    let currentManagedById = targetInstructorManagedById;
    const instructorBeingViewed = allInstructorsList?.find(i => i.id === targetInstructorId);
    if (!instructorBeingViewed) return false; 
    currentManagedById = instructorBeingViewed.managedByInstructorId;
    while (currentManagedById) {
      if (currentManagedById === currentUserProfile.uid) return true;
      const supervisor = allInstructorsList?.find(i => i.id === currentManagedById);
      currentManagedById = supervisor?.managedByInstructorId;
    }
    return false;
  }

  if (currentUserProfile.role === 'TrainingSiteCoordinator') {
    return targetInstructorManagedById === currentUserProfile.uid;
  }
  return false;
};


const PersonalDocumentsSection: React.FC<{ instructor: Instructor, onDocumentsChange: (docs: PersonalDocument[]) => void, canEdit: boolean }> = memo(({ instructor, onDocumentsChange, canEdit }) => {
  const [documents, setDocuments] = useState<PersonalDocument[]>(instructor.uploadedDocuments || []);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to Firebase Storage here and get a URL.
      // For mock, we'll use a blob URL for local preview.
      const newDocument: PersonalDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'certification_card' : file.name.endsWith('.docx') || file.name.endsWith('.doc') ? 'resume' : file.name.toLowerCase().includes('packet') || file.name.toLowerCase().includes('renewal') ? 'renewal_packet' : 'other',
        uploadDate: new Date().toISOString().split('T')[0],
        instructorId: instructor.id,
        fileUrl: URL.createObjectURL(file), // This is a temporary local URL
        size: `${(file.size / 1024).toFixed(1)}KB`
      };
      const updatedDocs = [...documents, newDocument];
      setDocuments(updatedDocs);
      onDocumentsChange(updatedDocs); // This updates the parent state, which should trigger Firestore save if implemented there
      toast({ title: "Document Uploaded (Locally)", description: `${file.name} previewed. Save profile to persist link if backend supports it.` });
    }
  }, [documents, instructor.id, onDocumentsChange, toast]);

  const handleDeleteDocument = useCallback((docId: string) => {
    const docToDelete = documents.find(doc => doc.id === docId);
    if (docToDelete?.fileUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(docToDelete.fileUrl); // Clean up local blob URL
    }
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    onDocumentsChange(updatedDocs);
    toast({ title: "Document Removed", description: `Document removed locally.`, variant: "destructive" });
  }, [documents, onDocumentsChange, toast]);

  const filteredDocuments = useMemo(() => documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  ), [documents, searchTerm]);

  useEffect(() => {
    // When instructor data (potentially from Firestore) changes, update local documents
    // This is important if parent component re-fetches instructor data
    setDocuments(instructor.uploadedDocuments || []);
  }, [instructor.uploadedDocuments]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Documents</CardTitle>
        <CardDescription>Manage renewal packets, certification cards, and resumes. Uploads are local previews; saving the profile would persist storage links in a real app.</CardDescription>
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
          {canEdit && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Label htmlFor={`file-upload-${instructor.id}`} className="cursor-pointer flex items-center justify-center">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
                <Input id={`file-upload-${instructor.id}`} type="file" className="sr-only" onChange={handleFileUpload} />
              </Label>
            </Button>
          )}
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
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDeleteDocument(doc.id)} aria-label={`Delete document ${doc.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
  const { userProfile, loading: authLoading } = useAuth();
  const id = params.id as string;

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchInstructorAndCourses = async () => {
      if (!id || authLoading) return; 
      
      setIsLoadingProfile(true);
      setIsLoadingCourses(true);
      
      const foundInstructor = allMockInstructors.find(instr => instr.id === id);
      
      if (foundInstructor) {
        setInstructor(foundInstructor);
        setIsLoadingProfile(false); // Instructor details (mock) loaded

        // Fetch courses taught by this instructor from Firestore
        try {
          const coursesCollectionRef = collection(firestore, 'courses');
          const q = query(coursesCollectionRef, where("instructorId", "==", id), orderBy("courseDate", "desc"));
          const querySnapshot = await getDocs(q);
          const coursesTaught = querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as Course));
          setInstructorCourses(coursesTaught);
        } catch (error) {
          console.error(`Error fetching courses for instructor ${id} from Firestore:`, error);
          toast({ title: "Error Loading Courses", description: "Could not load courses taught by this instructor from Firestore.", variant: "destructive" });
        } finally {
          setIsLoadingCourses(false);
        }
      } else {
        if (!authLoading && userProfile) { 
            toast({ title: "Not Found", description: "Instructor profile not found.", variant: "destructive" });
            router.push('/instructors');
        }
        setIsLoadingProfile(false);
        setIsLoadingCourses(false);
      }
    };

    fetchInstructorAndCourses();
  }, [id, router, toast, authLoading, userProfile]);

  const userCanEditThisProfile = useMemo(() => {
    if (!userProfile || !instructor) return false;
    return canEditProfile(userProfile, instructor.id, instructor.managedByInstructorId, allMockInstructors);
  }, [userProfile, instructor]);

  const potentialSupervisors = useMemo(() => {
    if (!userProfile) return [];
    return allMockInstructors
      .filter(instr => {
        if (instr.id === id) return false; 
        if (userProfile.role === 'Admin') {
          return ['TrainingCenterCoordinator', 'TrainingSiteCoordinator'].includes(instr.role);
        }
        if (userProfile.role === 'TrainingCenterCoordinator') {
          return instr.role === 'TrainingSiteCoordinator' && instr.managedByInstructorId === userProfile.uid;
        }
        return false; 
      })
      .map(instr => ({ id: instr.id, name: instr.name, role: instr.role as UserProfile['role'] }));
  }, [id, userProfile]);

  const handleEditToggle = useCallback(() => {
    if (userCanEditThisProfile) {
      setIsEditing(prev => !prev);
    } else {
      toast({ title: "Permission Denied", description: "You do not have permission to edit this profile.", variant: "destructive"});
    }
  }, [userCanEditThisProfile, toast]);

  const handleFormSubmit = useCallback((data: Instructor) => {
    if (!userCanEditThisProfile) {
      toast({ title: "Permission Denied", description: "You do not have permission to save these changes.", variant: "destructive"});
      return;
    }

    // Clean up old blob URL if a new one is not provided or is different
    if (instructor?.profilePictureUrl && instructor.profilePictureUrl.startsWith('blob:') &&
        (!data.profilePictureUrl || data.profilePictureUrl !== instructor.profilePictureUrl)) {
      URL.revokeObjectURL(instructor.profilePictureUrl);
    }
    
    setInstructor(prevInstructor => {
      if (!prevInstructor) return null; 
      const updatedInstructor = { ...prevInstructor, ...data }; 
      
      // Update mock data for instructor profile (in real app, this would be Firestore update for 'users' or 'instructors' collection)
      const index = allMockInstructors.findIndex(i => i.id === id);
      if (index !== -1) {
        allMockInstructors[index] = updatedInstructor; 
      }
      return updatedInstructor; 
    });
    
    toast({
        title: "Profile Updated (Mock)",
        description: `${data.name}'s profile has been updated in mock data. Firestore integration for profiles is separate.`,
    });
    setIsEditing(false);
  }, [id, toast, instructor?.profilePictureUrl, userCanEditThisProfile]);
  
  const handleDocumentsChange = useCallback((updatedDocs: PersonalDocument[]) => {
    setInstructor(prevInstructor => {
        if (prevInstructor) {
            const updatedInstructorData = { ...prevInstructor, uploadedDocuments: updatedDocs };
            // Update mock data (in real app, this would update the instructor's document in Firestore)
            const index = allMockInstructors.findIndex(i => i.id === prevInstructor.id);
            if (index !== -1) {
                allMockInstructors[index] = updatedInstructorData; 
            }
            return updatedInstructorData;
        }
        return null;
    });
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    const currentInstructor = instructor; // Capture instructor state at the time of effect setup
    return () => {
      currentInstructor?.uploadedDocuments?.forEach(doc => {
        if (doc.fileUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(doc.fileUrl);
        }
      });
      if (currentInstructor?.profilePictureUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentInstructor.profilePictureUrl);
      }
    };
  }, [instructor]);


  if (authLoading || isLoadingProfile ) {
    return <div className="flex justify-center items-center h-screen"><p>Loading instructor data...</p></div>;
  }
  
  // Moved this check after initial loading flags resolve
  if (!instructor) {
      // If not loading and instructor is still null, it means they weren't found (and redirection should have happened)
      // Or it's the brief moment before redirection after a failed fetch.
      return <div className="flex justify-center items-center h-screen"><p>Instructor not found or access denied.</p></div>;
  }

  if (userProfile?.role === 'Instructor' && userProfile.uid !== id) {
     toast({ title: "Access Denied", description: "You can only view your own profile.", variant: "destructive"});
     router.push('/instructors'); 
     return <div className="flex justify-center items-center h-screen"><p>Redirecting...</p></div>;
  }


  return (
    <div>
      <PageHeader
        title={isEditing ? `Editing: ${instructor.name}` : instructor.name}
        description={isEditing ? 'Update instructor details below.' : `Role: ${instructor.role.replace(/([A-Z])/g, ' $1').trim()} | ID: ${instructor.instructorId}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>
            {userCanEditThisProfile && (
              <Button onClick={handleEditToggle} className="bg-accent hover:bg-accent/90">
                <Edit3 className="mr-2 h-4 w-4" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            )}
          </div>
        }
      />

      {isEditing && userCanEditThisProfile ? (
        <Card>
          <CardContent className="p-6">
            <InstructorForm 
              initialData={instructor} 
              onSubmit={handleFormSubmit}
              potentialSupervisors={potentialSupervisors} 
              currentUserProfile={userProfile}
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
                  unoptimized={instructor.profilePictureUrl?.startsWith('blob:')} 
                />
                <div className="flex-1">
                  <CardTitle className="text-2xl font-headline mb-1">{instructor.name}</CardTitle>
                  <CardDescription className="text-md">ID: {instructor.instructorId}</CardDescription>
                  <div className="mt-2 flex gap-2 items-center flex-wrap">
                    <Badge variant={instructor.status === 'Active' ? 'default' : instructor.status === 'Pending' ? 'secondary': 'destructive'} className="capitalize">
                      {instructor.status}
                    </Badge>
                     <Badge variant="outline" className="capitalize">{instructor.role.replace(/([A-Z])/g, ' $1').trim()}</Badge>
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
                  {instructor.supervisor && <p className="text-sm mb-1">Supervisor: {allMockInstructors.find(i => i.id === instructor.managedByInstructorId)?.name || instructor.supervisor}</p>}
                  <p className="text-sm">Training Faculty: {instructor.isTrainingFaculty ? 'Yes' : 'No'}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-3 text-primary flex items-center"><Award className="mr-2 h-5 w-5"/>Certifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {instructor.certifications && Object.keys(instructor.certifications).length > 0 && Object.entries(instructor.certifications).map(([key, cert]) => (
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
             <PersonalDocumentsSection instructor={instructor} onDocumentsChange={handleDocumentsChange} canEdit={userCanEditThisProfile} />
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Courses Taught</CardTitle>
                <CardDescription>List of courses instructed by {instructor.name}. Sourced from Firestore.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCourses ? (
                    <p className="text-center text-muted-foreground py-8">Loading courses from Firestore...</p>
                ): instructorCourses.length > 0 ? (
                   <ScrollArea className="h-[300px] pr-3">
                    <ul className="space-y-3">
                      {instructorCourses.map(course => (
                        <li key={course.id} className="p-3 border rounded-md hover:bg-muted/50">
                          <p className="font-medium text-sm">Course: {course.courseType} - eCard: {course.eCardCode}</p>
                          <p className="text-xs text-muted-foreground">Date: {course.courseDate ? format(new Date(course.courseDate), "MMM d, yyyy") : "Invalid Date"} | Student: {course.studentFirstName} {course.studentLastName}</p>
                          <p className="text-xs text-muted-foreground">Location: {course.trainingLocationAddress}</p>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No courses found for this instructor in Firestore.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

    