
import type { Instructor, Course, CurriculumDocument, PersonalDocument, UserRole } from '@/types';

// Define IDs for easier referencing
const adminUserId = 'admin_user_001';
const tccUserId = 'tcc_user_001';
const tscCarterId = 'tsc_carter_001';
const instructorLeeId = 'instr_lee_002';
const instructorRodriguezId = 'instr_rodriguez_003';


export const mockInstructors: Instructor[] = [
  // Admin User (SuperUser)
  // Note: For a real app, an Admin might not be an "Instructor" in this list 
  // unless they also instruct. Their powers come from their UserProfile.role.
  // For mock data, we can represent them as an instructor for simplicity in testing list views.
  {
    id: adminUserId, // This should match their Firebase Auth UID
    name: 'Admin User',
    instructorId: 'ADMIN000',
    status: 'Active',
    phoneNumber: '555-ADMIN',
    mailingAddress: '1 Admin Way, Control City, USA',
    emailAddress: 'admin@example.com',
    certifications: {},
    isTrainingFaculty: true, 
    supervisor: 'System',
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'Admin',
    // managedByInstructorId: undefined, // Admin is top-level
    uploadedDocuments: []
  },
  {
    id: tccUserId,
    name: 'Dr. Alan Grant (TCC)',
    instructorId: 'AG0000',
    status: 'Active',
    phoneNumber: '555-0000',
    mailingAddress: '1 EMskillz HQ, Innovation Park, USA',
    emailAddress: 'alan.grant.tcc@example.com',
    certifications: {
      bls: { name: 'BLS Provider', expiryDate: '2026-01-01', issuedDate: '2024-01-01' },
      acls: { name: 'ACLS Provider', expiryDate: '2026-01-01', issuedDate: '2024-01-01' },
    },
    isTrainingFaculty: true,
    supervisor: 'Admin User', // TCC supervised by Admin/System
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'TrainingCenterCoordinator',
    managedByInstructorId: adminUserId, // TCC managed by Admin
    uploadedDocuments: [
       { id: 'doc_tcc_001', name: 'TCC_Credentials.pdf', type: 'other', uploadDate: '2024-01-05', instructorId: tccUserId, fileUrl: '#', size: '300KB' },
    ]
  },
  {
    id: tscCarterId,
    name: 'Dr. Emily Carter (TSC)',
    instructorId: 'EC1001',
    status: 'Active',
    phoneNumber: '555-0101',
    mailingAddress: '123 Health St, Wellness City, TX 77001',
    emailAddress: 'emily.carter.tsc@example.com',
    certifications: {
      heartsaver: { name: 'Heartsaver First Aid CPR AED', expiryDate: '2025-08-15', issuedDate: '2023-08-15' },
      bls: { name: 'BLS Provider', expiryDate: '2025-06-20', issuedDate: '2023-06-20' },
      acls: { name: 'ACLS Provider', expiryDate: '2024-12-01', issuedDate: '2022-12-01' },
      pals: { name: 'PALS Provider', expiryDate: '2025-02-10', issuedDate: '2023-02-10' },
    },
    isTrainingFaculty: true,
    supervisor: 'Dr. Alan Grant (TCC)', // Display name
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'TrainingSiteCoordinator', // Training Faculty
    managedByInstructorId: tccUserId, // Managed by Dr. Alan Grant (TCC)
    uploadedDocuments: [
      { id: 'doc_001', name: 'Resume_EC.pdf', type: 'resume', uploadDate: '2023-01-10', instructorId: tscCarterId, fileUrl: '#', size: '256KB' },
      { id: 'doc_002', name: 'BLS_Card_EC.pdf', type: 'certification_card', uploadDate: '2023-06-22', instructorId: tscCarterId, fileUrl: '#', size: '128KB' },
    ]
  },
  {
    id: instructorLeeId,
    name: 'Johnathan Lee',
    instructorId: 'JL1002',
    status: 'Active',
    phoneNumber: '555-0102',
    mailingAddress: '456 Vital Ave, Medville, CA 90210',
    emailAddress: 'john.lee@example.com',
    certifications: {
      heartsaver: { name: 'Heartsaver First Aid CPR AED', expiryDate: '2024-11-01', issuedDate: '2022-11-01' },
      bls: { name: 'BLS Provider', expiryDate: '2025-01-25', issuedDate: '2023-01-25' },
    },
    isTrainingFaculty: false,
    supervisor: 'Dr. Emily Carter (TSC)', // Display name
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'Instructor',
    managedByInstructorId: tscCarterId, // Managed by Dr. Emily Carter (TSC)
     uploadedDocuments: [
      { id: 'doc_003', name: 'RenewalPacket_JL.pdf', type: 'renewal_packet', uploadDate: '2024-03-15', instructorId: instructorLeeId, fileUrl: '#', size: '512KB' },
    ]
  },
  {
    id: instructorRodriguezId,
    name: 'Maria Rodriguez',
    instructorId: 'MR1003',
    status: 'Inactive',
    phoneNumber: '555-0103',
    mailingAddress: '789 Care Blvd, Aidtown, FL 33001',
    emailAddress: 'maria.rodriguez@example.com',
    certifications: {
      bls: { name: 'BLS Provider', expiryDate: '2023-05-10', issuedDate: '2021-05-10' }, 
    },
    isTrainingFaculty: true,
    supervisor: 'Dr. Emily Carter (TSC)', // Display name
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'Instructor',
    managedByInstructorId: tscCarterId, // Managed by Dr. Emily Carter (TSC)
  },
];

export const mockCourses: Course[] = [
  {
    id: 'course_001',
    eCardCode: 'ECARD001',
    courseDate: '2024-07-15',
    studentFirstName: 'Alice',
    studentLastName: 'Smith',
    studentEmail: 'alice.smith@example.com',
    studentPhone: '555-0201',
    instructorId: instructorLeeId, 
    instructorName: 'Johnathan Lee',
    trainingLocationAddress: '10 Life Saving Dr, Wellness City, TX',
    courseType: 'BLS Provider', 
    description: 'Basic Life Support (BLS) training for healthcare professionals and first responders.',
  },
  {
    id: 'course_002',
    eCardCode: 'ECARD002',
    courseDate: '2024-07-20',
    studentFirstName: 'Bob',
    studentLastName: 'Johnson',
    studentEmail: 'bob.johnson@example.com',
    studentPhone: '555-0202',
    instructorId: instructorLeeId, 
    instructorName: 'Johnathan Lee',
    trainingLocationAddress: '20 Health First Rd, Medville, CA',
    courseType: 'Heartsaver First Aid CPR AED',
    description: 'Heartsaver courses provide essential CPR, AED, and First Aid skills to anyone.',
  },
  {
    id: 'course_003',
    eCardCode: 'ECARD003',
    courseDate: '2023-11-10', 
    studentFirstName: 'Carol',
    studentLastName: 'Williams',
    studentEmail: 'carol.w@example.com',
    studentPhone: '555-0203',
    instructorId: tscCarterId, 
    instructorName: 'Dr. Emily Carter (TSC)',
    trainingLocationAddress: '10 Life Saving Dr, Wellness City, TX',
    courseType: 'ACLS Provider',
    description: 'Advanced Cardiovascular Life Support (ACLS) for managing complex cardiac emergencies.',
  },
   {
    id: 'course_004',
    eCardCode: 'ECARD004',
    courseDate: '2024-08-01',
    studentFirstName: 'David',
    studentLastName: 'Brown',
    studentEmail: 'david.brown@example.com',
    studentPhone: '555-0204',
    instructorId: tscCarterId, 
    instructorName: 'Dr. Emily Carter (TSC)',
    trainingLocationAddress: 'Community Center, Wellness City, TX',
    courseType: 'BLS Provider',
    description: 'Comprehensive Basic Life Support (BLS) certification course.',
  },
];

export const mockCurriculum: CurriculumDocument[] = [
  {
    id: 'curr_f_001',
    name: 'BLS Provider Materials',
    type: 'folder',
    description: 'All materials for Basic Life Support providers.',
    children: [
      { id: 'curr_d_001', name: 'BLS Manual 2024.pdf', type: 'pdf', path: '#', size: '2.5MB', lastModified: '2024-01-15' },
      { id: 'curr_d_002', name: 'BLS Algorithm Chart.png', type: 'link', path: '#', size: '300KB', lastModified: '2024-01-10' },
      { id: 'curr_d_003', name: 'Skills Checklist.docx', type: 'doc', path: '#', size: '150KB', lastModified: '2023-12-01' },
    ],
  },
  {
    id: 'curr_f_002',
    name: 'ACLS Provider Materials',
    type: 'folder',
    description: 'Advanced Cardiovascular Life Support resources.',
    children: [
      { id: 'curr_d_004', name: 'ACLS Manual 2024.pdf', type: 'pdf', path: '#', size: '4.1MB', lastModified: '2024-02-01' },
      { id: 'curr_d_005', name: 'Megacode Scenarios.pdf', type: 'pdf', path: '#', size: '800KB', lastModified: '2024-02-15' },
    ],
  },
  {
    id: 'curr_f_003',
    name: 'Heartsaver Courses',
    type: 'folder',
    description: 'Materials for various Heartsaver programs.',
    children: [
       { id: 'curr_d_006', name: 'Heartsaver First Aid CPR AED Student Workbook.pdf', type: 'pdf', path: '#', size: '3.0MB', lastModified: '2023-11-20' },
    ]
  },
  { id: 'curr_d_007', name: 'General Instructor Guidelines.pdf', type: 'pdf', path: '#', size: '500KB', lastModified: '2023-10-01', description: 'Overall guidelines for all instructors.' },
];
// Ensure that when testing, the `currentUser.uid` in `AuthContext` corresponds to one of these IDs 
// and that their `UserProfile` in Firestore has the matching role and `managedByInstructorId`.
// For example, if testing as Dr. Emily Carter (TSC), her UID in Auth and Firestore should be `tsc_carter_001`,
// her role `TrainingSiteCoordinator`, and `managedByInstructorId` should be `tcc_user_001`.
