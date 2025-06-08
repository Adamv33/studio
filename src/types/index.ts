

export interface Certification {
  name: string;
  issuedDate?: string; 
  expiryDate?: string; 
}

export type UserRole = 'Instructor' | 'TrainingSiteCoordinator' | 'TrainingCenterCoordinator';

export interface Instructor {
  id: string;
  name: string;
  instructorId: string; // Official ID number for the instructor
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
  supervisor?: string; // Name of the supervisor (could be TCC or TSC)
  profilePictureUrl?: string;
  uploadedDocuments?: PersonalDocument[];
  role: UserRole;
  managedByInstructorId?: string; // ID of the TrainingSiteCoordinator or TrainingCenterCoordinator who manages this instructor
}

export type CourseType =
  | 'ACLS EP'
  | 'ACLS Provider'
  | 'Advisor: BLS'
  | 'BLS Provider'
  | 'HeartCode ACLS w/lnstructor'
  | 'HeartCode ACLS w/VAM'
  | 'HeartCode BLS w/lnstructor'
  | 'HeartCode BLS w/VAM'
  | 'HeartCode PALS w/lnstructor'
  | 'HeartCode PALS w/VAM'
  | 'Heartsaver CPR AED'
  | 'Heartsaver First Aid'
  | 'Heartsaver First Aid CPR AED'
  | 'Heartsaver for K-12 Schools'
  | 'Heartsaver Pediatric First Aid CPR AED'
  | 'PALS Plus Provider'
  | 'PALS Provider'
  | 'PEARS Provider'
  | 'Other';

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
  courseType: CourseType;
  description?: string; // AI-generated description
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

    