import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instructor } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, UserCheck, UserX, UserClock, Edit3, Trash2, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface InstructorCardProps {
  instructor: Instructor;
  onDelete: (id: string) => void;
}

const StatusIcon = ({ status }: { status: Instructor['status'] }) => {
  if (status === 'Active') return <UserCheck className="h-4 w-4 text-green-500" />;
  if (status === 'Inactive') return <UserX className="h-4 w-4 text-red-500" />;
  if (status === 'Pending') return <UserClock className="h-4 w-4 text-yellow-500" />;
  return null;
};

export function InstructorCard({ instructor, onDelete }: InstructorCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <Image
          src={instructor.profilePictureUrl || 'https://placehold.co/80x80.png'}
          alt={instructor.name}
          width={80}
          height={80}
          className="rounded-full border object-cover"
          data-ai-hint="profile avatar"
        />
        <div className="flex-1">
          <CardTitle className="text-lg font-headline">{instructor.name}</CardTitle>
          <CardDescription className="text-sm">ID: {instructor.instructorId}</CardDescription>
          <Badge 
            variant={instructor.status === 'Active' ? 'default' : instructor.status === 'Pending' ? 'secondary': 'destructive'} 
            className="mt-1 text-xs py-0.5 px-2 capitalize"
          >
            <StatusIcon status={instructor.status} /> <span className="ml-1">{instructor.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-2 flex-grow">
        <div className="flex items-center text-muted-foreground">
          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{instructor.emailAddress}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{instructor.phoneNumber}</span>
        </div>
        {instructor.isTrainingFaculty && (
           <Badge variant="outline" className="text-xs">Training Faculty</Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the instructor
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(instructor.id)} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Link href={`/instructors/${instructor.id}`} passHref>
          <Button variant="outline" size="sm">
            View Profile <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
