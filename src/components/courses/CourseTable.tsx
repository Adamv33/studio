
import React from 'react';
import { Course } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CourseTableProps {
  courses: Course[];
  onDeleteCourse: (id: string) => void;
}

export function CourseTable({ courses, onDeleteCourse }: CourseTableProps) {
  if (courses.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No courses recorded yet.</p>;
  }

  return (
    <TooltipProvider>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>eCard Code</TableHead>
              <TableHead>Course Date</TableHead>
              <TableHead>Course Type</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.eCardCode}</TableCell>
                <TableCell>{format(new Date(course.courseDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell><Badge variant="secondary">{course.courseType}</Badge></TableCell>
                <TableCell>{course.studentFirstName} {course.studentLastName}</TableCell>
                <TableCell>{course.instructorName || 'N/A'}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={course.trainingLocationAddress}>{course.trainingLocationAddress}</TableCell>
                <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">
                   {course.description ? (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">{course.description}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="max-w-xs whitespace-normal">
                        <p>{course.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete this course record.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteCourse(course.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </TooltipProvider>
  );
}

