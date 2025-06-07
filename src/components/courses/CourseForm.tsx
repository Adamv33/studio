import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Course, Instructor } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DialogFooter, DialogClose } from "@/components/ui/dialog"


const courseSchema = z.object({
  eCardCode: z.string().min(1, 'eCard Code is required'),
  courseDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  studentFirstName: z.string().min(1, 'Student first name is required'),
  studentLastName: z.string().min(1, 'Student last name is required'),
  studentEmail: z.string().email('Invalid email address'),
  studentPhone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\S+$/, 'Phone number cannot contain spaces.'),
  instructorId: z.string().min(1, 'Instructor is required'),
  trainingLocationAddress: z.string().min(1, 'Training location address is required'),
  courseType: z.enum(['Heartsaver', 'BLS', 'ACLS', 'PALS', 'Other']),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  instructors: Instructor[];
  onSubmit: (data: Course) => void;
  initialData?: Course;
}

export function CourseForm({ instructors, onSubmit, initialData }: CourseFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData ? {
        ...initialData,
        courseDate: initialData.courseDate ? format(new Date(initialData.courseDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    } : {
      eCardCode: '',
      courseDate: format(new Date(), "yyyy-MM-dd"),
      studentFirstName: '',
      studentLastName: '',
      studentEmail: '',
      studentPhone: '',
      instructorId: instructors.length > 0 ? instructors[0].id : '',
      trainingLocationAddress: '',
      courseType: 'BLS',
    },
  });

  const processSubmit = (data: CourseFormData) => {
    const courseData: Course = {
      ...data,
      id: initialData?.id || `course_${Date.now()}`,
    };
    onSubmit(courseData);
    if (!initialData) { // Reset form only if it's a new course entry
        reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="eCardCode">eCard Code</Label>
          <Input id="eCardCode" {...register('eCardCode')} />
          {errors.eCardCode && <p className="text-sm text-destructive mt-1">{errors.eCardCode.message}</p>}
        </div>
         <div>
          <Label htmlFor="courseDate">Course Date</Label>
          <Controller
            name="courseDate"
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
                    selected={field.value ? new Date(field.value) : new Date()}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.courseDate && <p className="text-sm text-destructive mt-1">{errors.courseDate.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="studentFirstName">Student First Name</Label>
          <Input id="studentFirstName" {...register('studentFirstName')} />
          {errors.studentFirstName && <p className="text-sm text-destructive mt-1">{errors.studentFirstName.message}</p>}
        </div>
        <div>
          <Label htmlFor="studentLastName">Student Last Name</Label>
          <Input id="studentLastName" {...register('studentLastName')} />
          {errors.studentLastName && <p className="text-sm text-destructive mt-1">{errors.studentLastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="studentEmail">Student Email</Label>
          <Input id="studentEmail" type="email" {...register('studentEmail')} />
          {errors.studentEmail && <p className="text-sm text-destructive mt-1">{errors.studentEmail.message}</p>}
        </div>
        <div>
          <Label htmlFor="studentPhone">Student Phone</Label>
          <Input id="studentPhone" type="tel" {...register('studentPhone')} />
          {errors.studentPhone && <p className="text-sm text-destructive mt-1">{errors.studentPhone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instructorId">Instructor</Label>
          <Controller
            name="instructorId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map(instructor => (
                    <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.instructorId && <p className="text-sm text-destructive mt-1">{errors.instructorId.message}</p>}
        </div>
         <div>
          <Label htmlFor="courseType">Course Type</Label>
          <Controller
            name="courseType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent>
                  {['Heartsaver', 'BLS', 'ACLS', 'PALS', 'Other'].map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.courseType && <p className="text-sm text-destructive mt-1">{errors.courseType.message}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="trainingLocationAddress">Training Location Address</Label>
        <Textarea id="trainingLocationAddress" {...register('trainingLocationAddress')} />
        {errors.trainingLocationAddress && <p className="text-sm text-destructive mt-1">{errors.trainingLocationAddress.message}</p>}
      </div>

      <DialogFooter className="pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          {initialData ? 'Save Changes' : 'Add Course'}
        </Button>
      </DialogFooter>
    </form>
  );
}
