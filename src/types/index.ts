

export interface Certification {
  name: string;
  issuedDate?: string; 
  expiryDate?: string; 
}

export type UserRole = 'Instructor' | 'TrainingSiteCoordinator' | 'TrainingCenterCoordinator' | 'Admin'; // Added Admin role

// This interface will represent the data stored in Firestore for a user's profile
export interface UserProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  instructorId?: string; // Official ID number for the instructor
  phoneNumber?: string;
  mailingAddress?: string;
  trainingFacultyName?: string; // From signup form
  role: UserRole;
  isApproved: boolean;
  profilePictureUrl?: string;
  // We can add other app-specific user fields here
}

// Instructor specific data, which might be a sub-collection or a separate collection linked by UID
// For now, keeping Instructor simple as it's more about their professional details managed in the app,
// while UserProfile is about their app access and basic identity.
export interface Instructor {
  id: string; // This would typically be the user's UID from Firebase Auth
  name: string; // Combination of firstName and lastName from UserProfile
  instructorId: string; 
  status: 'Active' | 'Inactive' | 'Pending'; // This might derive from UserProfile.isApproved initially
  phoneNumber: string;
  mailingAddress: string;
  emailAddress: string; // From UserProfile
  certifications: {
    heartsaver?: Certification;
    bls?: Certification;
    acls?: Certification;
    pals?: Certification;
  };
  isTrainingFaculty: boolean;
  supervisor?: string; 
  profilePictureUrl?: string; // From UserProfile
  uploadedDocuments?: PersonalDocument[];
  role: UserRole; // From UserProfile
  managedByInstructorId?: string; 
  // isApproved: boolean; // This will now come from UserProfile
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
  instructorId: string; // This should be the user's UID
  size?: string;
}

    
