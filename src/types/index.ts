
export interface Certification {
  name: string;
  issuedDate?: string; 
  expiryDate?: string; 
  isCurrent?: boolean; 
}

export interface Instructor {
  id: string;
  name: string;
  instructorId: string;
  status: 'Active' | 'Inactive' | 'Pending';
  phoneNumber: string;
  mailingAddress: string;
  emailAddress: string;
  certifications: {
    heartsaver?: Certification;
    bls?: Certification;
    acls?: Certification;
    pals?: Certification;
  };
  isTrainingFaculty: boolean;
  supervisor?: string;
  profilePictureUrl?: string;
  uploadedDocuments?: PersonalDocument[];
}

export interface Course {
  id: string;
  eCardCode: string;
  courseDate: string; 
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
  instructorId: string; 
  instructorName?: string; // For display
  trainingLocationAddress: string;
  courseType: 'Heartsaver' | 'BLS' | 'ACLS' | 'PALS' | 'Other';
}

export interface CurriculumDocument {
  id: string;
  name:string;
  type: 'folder' | 'pdf' | 'doc' | 'video' | 'link';
  path?: string; 
  children?: CurriculumDocument[];
  size?: string;
  lastModified?: string;
  description?: string;
}

export interface PersonalDocument {
  id: string;
  name: string;
  type: 'renewal_packet' | 'certification_card' | 'resume' | 'other';
  uploadDate: string; 
  fileUrl?: string; 
  instructorId: string;
  size?: string;
}
