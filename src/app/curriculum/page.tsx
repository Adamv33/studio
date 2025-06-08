
'use client';
import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockCurriculum } from '@/data/mockData';
import type { CurriculumDocument } from '@/types';
import { Input } from '@/components/ui/input';
import { Search, Folder, FileText, Link as LinkIcon, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';

const DocumentIcon: React.FC<{ type: CurriculumDocument['type'] }> = memo(({ type }) => {
  switch (type) {
    case 'folder': return <Folder className="h-5 w-5 text-yellow-500" />;
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'doc': return <FileText className="h-5 w-5 text-blue-500" />;
    case 'video': return <FileText className="h-5 w-5 text-purple-500" />;
    case 'link': return <LinkIcon className="h-5 w-5 text-green-500" />;
    default: return <FileText className="h-5 w-5 text-gray-500" />;
  }
});
DocumentIcon.displayName = 'DocumentIcon';

const CurriculumItemDisplay: React.FC<{ item: CurriculumDocument, level?: number }> = memo(({ item, level = 0 }) => {
  const isFolder = item.type === 'folder' && item.children && item.children.length > 0;

  if (isFolder) {
    return (
      <AccordionItem value={item.id} className="border-b-0">
        <AccordionTrigger className={`hover:no-underline py-2 px-3 rounded-md hover:bg-muted/50 ${level > 0 ? 'ml-' + (level * 4) : ''}`}>
          <div className="flex items-center gap-3">
            <DocumentIcon type={item.type} />
            <span className="font-medium text-sm">{item.name}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0 pb-1">
          {item.description && <p className={`text-xs text-muted-foreground mb-1 ${level > 0 ? 'ml-' + ((level * 4)+6) : 'ml-6'}`}>{item.description}</p>}
          <div className="space-y-1 pl-4 border-l ml-3">
            {item.children?.map(child => <CurriculumItemDisplay key={child.id} item={child} level={level + 1} />)}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 ${level > 0 ? 'ml-' + (level * 4) : ''}`}>
      <div className="flex items-center gap-3">
        <DocumentIcon type={item.type} />
        <div>
           <span className="font-medium text-sm">{item.name}</span>
           {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
        </div>
      </div>
      {item.path && (
        <Button variant="ghost" size="sm" asChild>
          <a href={item.path} target="_blank" rel="noopener noreferrer" download={item.type !== 'link'}>
            <Download className="h-4 w-4 mr-1" /> Download
          </a>
        </Button>
      )}
    </div>
  );
});
CurriculumItemDisplay.displayName = 'CurriculumItemDisplay';


export default function CurriculumPage() {
  const [curriculum, setCurriculum] = useState<CurriculumDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurriculum(mockCurriculum);
  }, []);

  const filterCurriculumRecursive = useCallback((items: CurriculumDocument[], term: string): CurriculumDocument[] => {
    if (!term) return items;
    return items.reduce((acc, item) => {
      const nameMatch = item.name.toLowerCase().includes(term.toLowerCase());
      const descMatch = item.description?.toLowerCase().includes(term.toLowerCase());
      if (item.type === 'folder' && item.children) {
        const filteredChildren = filterCurriculumRecursive(item.children, term);
        if (filteredChildren.length > 0 || nameMatch || descMatch) {
          acc.push({ ...item, children: filteredChildren.length > 0 ? filteredChildren : (nameMatch || descMatch ? [] : undefined) });
        }
      } else if (nameMatch || descMatch) {
        acc.push(item);
      }
      return acc;
    }, [] as CurriculumDocument[]);
  }, []);


  const filteredCurriculum = useMemo(() => {
    return filterCurriculumRecursive(curriculum, searchTerm);
  }, [curriculum, searchTerm, filterCurriculumRecursive]);

  return (
    <div>
      <PageHeader
        title="Curriculum Repository"
        description="Access and download curriculum, guidelines, and training materials."
      />
      <Card>
        <CardHeader>
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search curriculum by name or description..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCurriculum.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {filteredCurriculum.map(item => (
                <CurriculumItemDisplay key={item.id} item={item} />
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-8">No curriculum materials found matching your search.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
