
import type { Instructor, Course, CurriculumDocument, PersonalDocument, UserRole } from '@/types';

// Let's define a Training Center Coordinator
const trainingCenterCoordinatorId = 'instr_tcc_001';

export const mockInstructors: Instructor[] = [
  {
    id: trainingCenterCoordinatorId,
    name: 'Dr. Alan Grant (TCC)',
    instructorId: 'AG0000',
    status: 'Active',
    phoneNumber: '555-0000',
    mailingAddress: '1 EMskillz HQ, Innovation Park, USA',
    emailAddress: 'alan.grant.tcc@example.com',
    certifications: {
      bls: { name: 'BLS', expiryDate: '2026-01-01', issuedDate: '2024-01-01', isCurrent: true },
      acls: { name: 'ACLS', expiryDate: '2026-01-01', issuedDate: '2024-01-01', isCurrent: true },
    },
    isTrainingFaculty: true,
    supervisor: 'EMskillz LLC Board', // Ultimate supervisor
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'TrainingCenterCoordinator',
    // managedByInstructorId: undefined, // TCC is top-level
    uploadedDocuments: [
       { id: 'doc_tcc_001', name: 'TCC_Credentials.pdf', type: 'other', uploadDate: '2024-01-05', instructorId: trainingCenterCoordinatorId, fileUrl: '#', size: '300KB' },
    ]
  },
  {
    id: 'instr_001',
    name: 'Dr. Emily Carter (TSC)',
    instructorId: 'EC1001',
    status: 'Active',
    phoneNumber: '555-0101',
    mailingAddress: '123 Health St, Wellness City, TX 77001',
    emailAddress: 'emily.carter.tsc@example.com',
    certifications: {
      heartsaver: { name: 'Heartsaver', expiryDate: '2025-08-15', issuedDate: '2023-08-15', isCurrent: true },
      bls: { name: 'BLS', expiryDate: '2025-06-20', issuedDate: '2023-06-20', isCurrent: true },
      acls: { name: 'ACLS', expiryDate: '2024-12-01', issuedDate: '2022-12-01', isCurrent: true },
      pals: { name: 'PALS', expiryDate: '2025-02-10', issuedDate: '2023-02-10', isCurrent: true },
    },
    isTrainingFaculty: true,
    supervisor: 'Dr. Alan Grant (TCC)', // Supervised by TCC
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'TrainingSiteCoordinator',
    managedByInstructorId: trainingCenterCoordinatorId, // Managed by the TCC
    uploadedDocuments: [
      { id: 'doc_001', name: 'Resume_EC.pdf', type: 'resume', uploadDate: '2023-01-10', instructorId: 'instr_001', fileUrl: '#', size: '256KB' },
      { id: 'doc_002', name: 'BLS_Card_EC.pdf', type: 'certification_card', uploadDate: '2023-06-22', instructorId: 'instr_001', fileUrl: '#', size: '128KB' },
    ]
  },
  {
    id: 'instr_002',
    name: 'Johnathan Lee',
    instructorId: 'JL1002',
    status: 'Active',
    phoneNumber: '555-0102',
    mailingAddress: '456 Vital Ave, Medville, CA 90210',
    emailAddress: 'john.lee@example.com',
    certifications: {
      heartsaver: { name: 'Heartsaver', expiryDate: '2024-11-01', issuedDate: '2022-11-01', isCurrent: true },
      bls: { name: 'BLS', expiryDate: '2025-01-25', issuedDate: '2023-01-25', isCurrent: true },
    },
    isTrainingFaculty: false,
    supervisor: 'Dr. Emily Carter (TSC)', // Supervised by TSC
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'Instructor',
    managedByInstructorId: 'instr_001', // Managed by Dr. Emily Carter (TSC)
     uploadedDocuments: [
      { id: 'doc_003', name: 'RenewalPacket_JL.pdf', type: 'renewal_packet', uploadDate: '2024-03-15', instructorId: 'instr_002', fileUrl: '#', size: '512KB' },
    ]
  },
  {
    id: 'instr_003',
    name: 'Maria Rodriguez',
    instructorId: 'MR1003',
    status: 'Inactive',
    phoneNumber: '555-0103',
    mailingAddress: '789 Care Blvd, Aidtown, FL 33001',
    emailAddress: 'maria.rodriguez@example.com',
    certifications: {
      bls: { name: 'BLS', expiryDate: '2023-05-10', issuedDate: '2021-05-10', isCurrent: false }, // Expired
    },
    isTrainingFaculty: true,
    supervisor: 'Dr. Emily Carter (TSC)', // Also supervised by TSC
    profilePictureUrl: 'https://placehold.co/100x100.png',
    role: 'Instructor',
    managedByInstructorId: 'instr_001', // Managed by Dr. Emily Carter (TSC)
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
    instructorId: 'instr_002', // Johnathan Lee (Instructor)
    instructorName: 'Johnathan Lee',
    trainingLocationAddress: '10 Life Saving Dr, Wellness City, TX',
    courseType: 'BLS',
  },
  {
    id: 'course_002',
    eCardCode: 'ECARD002',
    courseDate: '2024-07-20',
    studentFirstName: 'Bob',
    studentLastName: 'Johnson',
    studentEmail: 'bob.johnson@example.com',
    studentPhone: '555-0202',
    instructorId: 'instr_002', // Johnathan Lee (Instructor)
    instructorName: 'Johnathan Lee',
    trainingLocationAddress: '20 Health First Rd, Medville, CA',
    courseType: 'Heartsaver',
  },
  {
    id: 'course_003',
    eCardCode: 'ECARD003',
    courseDate: '2023-11-10', // Past course
    studentFirstName: 'Carol',
    studentLastName: 'Williams',
    studentEmail: 'carol.w@example.com',
    studentPhone: '555-0203',
    instructorId: 'instr_001', // Dr. Emily Carter (TSC)
    instructorName: 'Dr. Emily Carter (TSC)',
    trainingLocationAddress: '10 Life Saving Dr, Wellness City, TX',
    courseType: 'ACLS',
  },
   {
    id: 'course_004',
    eCardCode: 'ECARD004',
    courseDate: '2024-08-01',
    studentFirstName: 'David',
    studentLastName: 'Brown',
    studentEmail: 'david.brown@example.com',
    studentPhone: '555-0204',
    instructorId: 'instr_001', // Dr. Emily Carter (TSC)
    instructorName: 'Dr. Emily Carter (TSC)',
    trainingLocationAddress: 'Community Center, Wellness City, TX',
    courseType: 'BLS',
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
