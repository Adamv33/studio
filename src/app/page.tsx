'use client';
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Users, BookOpen, BarChart3, FolderKanban, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const dashboardItems = [
  {
    title: 'Manage Instructors',
    description: 'View, add, and edit instructor profiles and certifications.',
    href: '/instructors',
    icon: Users,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'team meeting',
  },
  {
    title: 'Track Courses',
    description: 'Input and manage data for all instructor-led courses.',
    href: '/courses',
    icon: BookOpen,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'classroom lecture',
  },
  {
    title: 'View Statistics',
    description: 'Analyze course data and instructor performance metrics.',
    href: '/courses/stats',
    icon: BarChart3,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'data analytics',
  },
  {
    title: 'Access Curriculum',
    description: 'Find and download necessary curriculum and training materials.',
    href: '/curriculum',
    icon: FolderKanban,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'books library',
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Welcome to InstructPoint"
        description="Your central platform for managing instructors, courses, and educational materials."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {dashboardItems.map((item) => (
          <Card key={item.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0">
               <Image 
                src={item.image} 
                alt={item.title} 
                width={600} 
                height={300} 
                className="w-full h-48 object-cover" 
                data-ai-hint={item.aiHint}
              />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <item.icon className="w-7 h-7 text-primary mr-3" />
                <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
              </div>
              <CardDescription className="mb-4 text-base">{item.description}</CardDescription>
              <Link href={item.href} passHref>
                <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
                  Go to {item.title.split(' ')[1]} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Quick Reminders</CardTitle>
          <CardDescription>Stay on top of important tasks and deadlines.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> Review instructor John Doe's expiring BLS certification (Next month).</li>
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> 5 new course completion forms to process.</li>
            <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-accent" /> Update ACLS curriculum with latest 2024 guidelines.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
