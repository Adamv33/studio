
import React, { Suspense } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p className="text-lg text-muted-foreground">Loading Chat...</p></div>}>
      <ChatInterface />
    </Suspense>
  );
}
