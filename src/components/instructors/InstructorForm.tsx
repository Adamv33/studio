
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Instructor, Certification, PersonalDocument, UserRole, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Image from 'next/image';

const userRolesList: UserRole[] = ['Instructor', 'TrainingSiteCoordinator', 'TrainingCenterCoordinator', 'Admin'];

const instructorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\S+$/, 'Phone number cannot contain spaces.'),
  mailingAddress: z.string().min(1, 'Mailing address is required'),
  emailAddress: z.string().email('Invalid email address'),
  certifications: z.object({
    heartsaver: z.object({ name: z.string(), issuedDate: z.string().optional(), expiryDate: z.string().optional() }).optional(),
    bls: z.object({ name: z.string(), issuedDate: z.string().optional(), expiryDate: z.string().optional() }).optional(),
    acls: z.object({ name: z.string(), issuedDate: z.string().optional(), expiryDate: z.string().optional() }).optional(),
    pals: z.object({ name: z.string(), issuedDate: z.string().optional(), expiryDate: z.string().optional() }).optional(),
  }).optional(),
  isTrainingFaculty: z.boolean(),
  supervisor: z.string().optional(), // This field will represent the selected supervisor's name from dropdown
  profilePictureUrl: z.string().optional(),
  role: z.custom<UserRole>().default('Instructor'), // Role with default
  managedByInstructorId: z.string().optional(), // Hidden field, set programmatically
});

type InstructorFormData = z.infer<typeof instructorSchema>;

interface InstructorFormProps {
  initialData?: Instructor;
  onSubmit: (data: Instructor) => void;
  potentialSupervisors: Array<{ id: string; name: string; role: UserProfile['role'] }>; // Added role here
  currentUserProfile: UserProfile | null; // For permission checks
}

const certificationTypes: Array<keyof NonNullable<Instructor['certifications']>> = ['heartsaver', 'bls', 'acls', 'pals'];
const NO_SUPERVISOR_VALUE = "_none_"; 

export function InstructorForm({ initialData, onSubmit, potentialSupervisors, currentUserProfile }: InstructorFormProps) {
  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      name: initialData?.name || '',
      instructorId: initialData?.instructorId || '',
      status: initialData?.status || 'Pending',
      phoneNumber: initialData?.phoneNumber || '',
      mailingAddress: initialData?.mailingAddress || '',
      emailAddress: initialData?.emailAddress || '',
      certifications: { 
        heartsaver: initialData?.certifications?.heartsaver || { name: 'Heartsaver' },
        bls: initialData?.certifications?.bls || { name: 'BLS' },
        acls: initialData?.certifications?.acls || { name: 'ACLS' },
        pals: initialData?.certifications?.pals || { name: 'PALS' },
      },
      isTrainingFaculty: initialData?.isTrainingFaculty || false,
      supervisor: initialData?.supervisor || '', // Supervisor name for display/selection
      profilePictureUrl: initialData?.profilePictureUrl || '',
      role: initialData?.role || 'Instructor',
      managedByInstructorId: initialData?.managedByInstructorId || '',
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.profilePictureUrl || null);

  const canEditRole = currentUserProfile?.role === 'Admin' || currentUserProfile?.role === 'TrainingCenterCoordinator';
  const canSelectSupervisor = currentUserProfile?.role === 'Admin' || (currentUserProfile?.role === 'TrainingCenterCoordinator' && potentialSupervisors.length > 0);


  useEffect(() => {
    if (initialData?.profilePictureUrl) {
      setImagePreview(initialData.profilePictureUrl);
      setValue('profilePictureUrl', initialData.profilePictureUrl);
    }
    // Set initial managedByInstructorId from initialData if editing
    if (initialData?.managedByInstructorId) {
      setValue('managedByInstructorId', initialData.managedByInstructorId);
      // Try to set supervisor display name based on managedByInstructorId
      const supervisorName = potentialSupervisors.find(s => s.id === initialData.managedByInstructorId)?.name ||
                             (initialData.supervisor); // Fallback to existing supervisor name if not in list
      setValue('supervisor', supervisorName || '');
    }


  }, [initialData, setValue, potentialSupervisors]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview); 
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setImagePreview(newPreviewUrl);
      setValue('profilePictureUrl', newPreviewUrl, { shouldValidate: true });
    }
  };

  const processSubmit = (data: InstructorFormData) => {
    let finalManagedById = data.managedByInstructorId;
    
    // If a supervisor name was selected from dropdown, find its ID
    if (data.supervisor && data.supervisor !== NO_SUPERVISOR_VALUE) {
        const selectedSupervisor = potentialSupervisors.find(s => s.name === data.supervisor);
        if (selectedSupervisor) {
            finalManagedById = selectedSupervisor.id;
        }
    } else if (data.supervisor === NO_SUPERVISOR_VALUE) {
        finalManagedById = undefined; // Explicitly no supervisor
    }
    // If creating new and current user is TSC, they become the manager
    else if (!initialData && currentUserProfile?.role === 'TrainingSiteCoordinator') {
        finalManagedById = currentUserProfile.uid; // CORRECTED: was .id
    } 
    // If creating new and current user is TCC, and no supervisor selected, TCC becomes manager
    else if (!initialData && currentUserProfile?.role === 'TrainingCenterCoordinator' && !finalManagedById) {
       finalManagedById = currentUserProfile.uid; // CORRECTED: was .id (implicitly, if currentUserProfile was used directly)
    }


    const completeData: Instructor = {
      ...initialData, 
      ...data, 
      supervisor: data.supervisor === NO_SUPERVISOR_VALUE ? '' : data.supervisor, // Keep display name if provided
      managedByInstructorId: finalManagedById,
      id: initialData?.id || `instr_${Date.now()}`,
      profilePictureUrl: imagePreview || data.profilePictureUrl || '', 
      uploadedDocuments: initialData?.uploadedDocuments || [],
      certifications: data.certifications || initialData?.certifications || {
        heartsaver: { name: 'Heartsaver' },
        bls: { name: 'BLS' },
        acls: { name: 'ACLS' },
        pals: { name: 'PALS' },
      },
      role: data.role || initialData?.role || 'Instructor',
    };
    onSubmit(completeData);
  };
  
  const watchedCerts = watch("certifications");

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
            <Label htmlFor="profilePictureFile">Profile Picture</Label>
            {imagePreview && (
                <Image
                src={imagePreview}
                alt="Profile Preview"
                width={120}
                height={120}
                className="rounded-lg border object-cover shadow-sm mb-2"
                data-ai-hint="profile avatar"
                unoptimized={imagePreview.startsWith('blob:')}
                />
            )}
            <Input id="profilePictureFile" type="file" accept="image/*" onChange={handleImageChange} />
            {errors.profilePictureUrl && <p className="text-sm text-destructive mt-1">{errors.profilePictureUrl.message}</p>}
        </div>
        <div className="md:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="instructorId">Instructor ID</Label>
              <Input id="instructorId" {...register('instructorId')} />
              {errors.instructorId && <p className="text-sm text-destructive mt-1">{errors.instructorId.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
              {errors.phoneNumber && <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <Label htmlFor="emailAddress">Email Address</Label>
            <Input id="emailAddress" type="email" {...register('emailAddress')} />
            {errors.emailAddress && <p className="text-sm text-destructive mt-1">{errors.emailAddress.message}</p>}
        </div>
        <div>
            <Label htmlFor="mailingAddress">Mailing Address</Label>
            <Textarea id="mailingAddress" {...register('mailingAddress')} />
            {errors.mailingAddress && <p className="text-sm text-destructive mt-1">{errors.mailingAddress.message}</p>}
        </div>
      </div>

       <div>
          <Label htmlFor="role">Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || 'Instructor'} disabled={!canEditRole && !!initialData /* Can only edit role if Admin/TCC, or if new instructor */}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {userRolesList.map(roleItem => (
                    <SelectItem key={roleItem} value={roleItem} disabled={roleItem === 'Admin' && currentUserProfile?.role !== 'Admin'}>
                      {roleItem.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
        </div>
      
      {canSelectSupervisor && (
        <div>
          <Label htmlFor="supervisor">Assign Supervisor (Managed By)</Label>
          <Controller
            name="supervisor" // This field now stores the supervisor's name for selection
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                    field.onChange(value); // Store name
                    const selectedSup = potentialSupervisors.find(s => s.name === value);
                    setValue('managedByInstructorId', selectedSup ? selectedSup.id : (value === NO_SUPERVISOR_VALUE ? undefined : ''));
                }}
                value={field.value === '' ? NO_SUPERVISOR_VALUE : field.value}
                disabled={!canSelectSupervisor && !!initialData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SUPERVISOR_VALUE}>None (Directly managed by Admin/System or current TCC)</SelectItem>
                  {potentialSupervisors.map(sup => (
                    <SelectItem key={sup.id} value={sup.name}>{sup.name} ({sup.role.replace(/([A-Z])/g, ' $1').trim()})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.supervisor && <p className="text-sm text-destructive mt-1">{errors.supervisor.message}</p>}
        </div>
      )}
      <input type="hidden" {...register('managedByInstructorId')} />


      <h3 className="text-lg font-medium font-headline border-b pb-2 mb-4">Certifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {certificationTypes.map((certType) => (
          <div key={certType} className="space-y-2 p-3 border rounded-md">
            <h4 className="font-semibold capitalize">{watchedCerts?.[certType]?.name || certType.charAt(0).toUpperCase() + certType.slice(1)}</h4>
            <Controller
                name={`certifications.${certType}.name`}
                control={control}
                defaultValue={certType.charAt(0).toUpperCase() + certType.slice(1)}
                render={({ field }) => <input type="hidden" {...field} />}
            />
            <div>
              <Label htmlFor={`${certType}IssuedDate`}>Issued Date</Label>
              <Controller
                name={`certifications.${certType}.issuedDate`}
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div>
              <Label htmlFor={`${certType}ExpiryDate`}>Expiry Date</Label>
               <Controller
                name={`certifications.${certType}.expiryDate`}
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2">
        <Controller
            name="isTrainingFaculty"
            control={control}
            render={({ field }) => (
              <Switch
                id="isTrainingFaculty"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        <Label htmlFor="isTrainingFaculty">Is Training Faculty</Label>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          {initialData ? 'Save Changes' : 'Add Instructor'}
        </Button>
      </div>
    </form>
  );
}
