

export interface Certification {
  name: string;
  issuedDate?: string; 
  expiryDate?: string; 
}

// Updated UserRole to include Admin and specific coordinator roles
export type UserRole = 'Admin' | 'TrainingCenterCoordinator' | 'TrainingSiteCoordinator' | 'Instructor';

export interface UserProfile {
  uid: string; // Firebase Auth UID
  email: string;
  firstName?: string;
  lastName?: string;
  instructorId?: string; 
  phoneNumber?: string;
  mailingAddress?: string;
  trainingFacultyName?: string; 
  role: UserRole; // Assigned role
  isApproved: boolean; // Approval status
  profilePictureUrl?: string;
  managedByInstructorId?: string; // UID of the direct supervisor (TCC or TSC)
}

export interface Instructor {
  id: string; // Corresponds to UserProfile.uid
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
  isTrainingFaculty: boolean; // This might be redundant if role implies it, or specific to certain instructors
  supervisor?: string; // Legacy field, prefer managedByInstructorId. Can be display name of manager.
  profilePictureUrl?: string;
  uploadedDocuments?: PersonalDocument[];
  role: UserRole; 
  managedByInstructorId?: string; // UID of the direct supervisor (TCC or TSC)
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
  instructorName?: string; 
  trainingLocationAddress: string;
  courseType: CourseType;
  description?: string; 
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
