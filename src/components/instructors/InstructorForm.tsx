import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Instructor, Certification } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const instructorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\S+$/, 'Phone number cannot contain spaces.'),
  mailingAddress: z.string().min(1, 'Mailing address is required'),
  emailAddress: z.string().email('Invalid email address'),
  certifications: z.object({
    heartsaver: z.object({ name: z.literal('Heartsaver'), issuedDate: z.string().optional(), expiryDate: z.string().optional() }).optional(),
    bls: z.object({ name: z.literal('BLS'), issuedDate: z.string().optional(), expiryDate: z.string().optional() }).optional(),
    acls: z.object({ name: z.literal('ACLS'), issuedDate: z.string().optional(), expiryDate: z.string().optional() }).optional(),
    pals: z.object({ name: z.literal('PALS'), issuedDate: z.string().optional(), expiryDate: z.string().optional() }).optional(),
  }).optional(),
  isTrainingFaculty: z.boolean(),
  supervisor: z.string().optional(),
});

type InstructorFormData = z.infer<typeof instructorSchema>;

interface InstructorFormProps {
  initialData?: Instructor;
  onSubmit: (data: Instructor) => void;
}

const certificationTypes: Array<keyof NonNullable<Instructor['certifications']>> = ['heartsaver', 'bls', 'acls', 'pals'];

export function InstructorForm({ initialData, onSubmit }: InstructorFormProps) {
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
      supervisor: initialData?.supervisor || '',
    },
  });

  const processSubmit = (data: InstructorFormData) => {
    const completeData: Instructor = {
      ...data,
      id: initialData?.id || `instr_${Date.now()}`, // Generate ID if new
      uploadedDocuments: initialData?.uploadedDocuments || [],
      profilePictureUrl: initialData?.profilePictureUrl || '',
    };
    onSubmit(completeData);
  };
  
  const watchedCerts = watch("certifications");

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
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
        <div>
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <div className="md:col-span-2">
          <Label htmlFor="emailAddress">Email Address</Label>
          <Input id="emailAddress" type="email" {...register('emailAddress')} />
          {errors.emailAddress && <p className="text-sm text-destructive mt-1">{errors.emailAddress.message}</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="mailingAddress">Mailing Address</Label>
          <Textarea id="mailingAddress" {...register('mailingAddress')} />
          {errors.mailingAddress && <p className="text-sm text-destructive mt-1">{errors.mailingAddress.message}</p>}
        </div>
      </div>

      <h3 className="text-lg font-medium font-headline border-b pb-2 mb-4">Certifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {certificationTypes.map((certType) => (
          <div key={certType} className="space-y-2 p-3 border rounded-md">
            <h4 className="font-semibold capitalize">{certType}</h4>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div>
          <Label htmlFor="supervisor">Supervisor</Label>
          <Input id="supervisor" {...register('supervisor')} />
          {errors.supervisor && <p className="text-sm text-destructive mt-1">{errors.supervisor.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          {initialData ? 'Save Changes' : 'Add Instructor'}
        </Button>
      </div>
    </form>
  );
}
