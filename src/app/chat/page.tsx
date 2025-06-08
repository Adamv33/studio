
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { mockInstructors } from '@/data/mockData';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  senderProfilePictureUrl?: string;
  timestamp: Date;
}

const currentMockUser = mockInstructors.length > 0 ? mockInstructors[0] : { id: 'tempUser', name: 'You', profilePictureUrl: 'https://placehold.co/40x40.png' };

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: newMessage,
      senderName: currentMockUser.name,
      senderProfilePictureUrl: currentMockUser.profilePictureUrl,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage('');
  }, [newMessage]); 

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);
  
  useEffect(() => {
    setMessages([
        { 
            id: 'msg_0', 
            text: 'Hello everyone! Welcome to the chat.', 
            senderName: mockInstructors.length > 1 ? mockInstructors[1].name : "Instructor B", 
            senderProfilePictureUrl: mockInstructors.length > 1 ? mockInstructors[1].profilePictureUrl : 'https://placehold.co/40x40.png', 
            timestamp: new Date(Date.now() - 1000 * 60 * 5)
        },
        { 
            id: 'msg_1', 
            text: 'Has anyone seen the latest ACLS updates?', 
            senderName: mockInstructors.length > 0 ? mockInstructors[0].name : "Instructor A",
            senderProfilePictureUrl: mockInstructors.length > 0 ? mockInstructors[0].profilePictureUrl : 'https://placehold.co/40x40.png',
            timestamp: new Date(Date.now() - 1000 * 60 * 2)
        },
    ]);
  }, []);


  return (
    <div>
      <PageHeader
        title="Instructor Chat"
        description="Communicate with other instructors."
      />
      <Card className="flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-240px)]">
        <CardHeader>
          <CardTitle>General Discussion Room</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.senderName === currentMockUser.name ? 'justify-end' : ''
                  }`}
                >
                  {msg.senderName !== currentMockUser.name && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={msg.senderProfilePictureUrl || `https://placehold.co/40x40.png?text=${msg.senderName.charAt(0)}`} alt={msg.senderName} data-ai-hint="avatar person" />
                      <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 text-sm shadow-sm ${
                      msg.senderName === currentMockUser.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="font-semibold mb-0.5">{msg.senderName === currentMockUser.name ? "You" : msg.senderName}</p>
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.senderName === currentMockUser.name ? 'text-primary-foreground/80' : 'text-muted-foreground/80'}`}>
                      {format(msg.timestamp, 'HH:mm')}
                    </p>
                  </div>
                  {msg.senderName === currentMockUser.name && (
                     <Avatar className="h-8 w-8 border">
                      <AvatarImage src={msg.senderProfilePictureUrl || `https://placehold.co/40x40.png?text=${msg.senderName.charAt(0)}`} alt={msg.senderName} data-ai-hint="avatar person" />
                      <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              aria-label="Chat message input"
            />
            <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        <strong>Note:</strong> This chat is a prototype. Messages are not saved and are only visible in your current browser session.
        Full privacy features for instructor profiles (like seeing only your own card) would require a user authentication system.
      </p>
    </div>
  );
}
