
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { mockInstructors } from '@/data/mockData';
import type { Instructor } from '@/types';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string; // Store sender ID to compare with current user and partner
  senderName: string;
  senderProfilePictureUrl?: string;
  timestamp: Date;
}

// Assume the "current logged-in user" is the first instructor from mockData for this prototype
const currentUser: Instructor = mockInstructors.length > 0 ? mockInstructors[0] : { id: 'tempUser', name: 'You', profilePictureUrl: 'https://placehold.co/40x40.png', emailAddress: '', instructorId: '', isTrainingFaculty: false, mailingAddress: '', phoneNumber: '', role: 'Instructor', status: 'Active', certifications: {} };

export default function ChatPage() {
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState<Instructor | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const partnerId = searchParams.get('with');
    if (partnerId) {
      const partner = mockInstructors.find(inst => inst.id === partnerId);
      setChatPartner(partner || null);
    } else {
      setChatPartner(null);
    }
  }, [searchParams]);

  const getChatKey = useCallback((userId1: string, userId2: string): string => {
    return [userId1, userId2].sort().join('_');
  }, []);

  const currentChatKey = useMemo(() => {
    if (currentUser && chatPartner) {
      return getChatKey(currentUser.id, chatPartner.id);
    }
    return null;
  }, [chatPartner, getChatKey]);

  const displayedMessages = useMemo(() => {
    return currentChatKey ? allMessages[currentChatKey] || [] : [];
  }, [currentChatKey, allMessages]);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentChatKey || !chatPartner) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: newMessage,
      senderId: currentUser.id,
      senderName: currentUser.name, // Will be displayed as "You" if senderId matches currentUser.id
      senderProfilePictureUrl: currentUser.profilePictureUrl,
      timestamp: new Date(),
    };

    setAllMessages(prevAllMessages => {
      const updatedChatMessages = [...(prevAllMessages[currentChatKey] || []), message];
      return {
        ...prevAllMessages,
        [currentChatKey]: updatedChatMessages,
      };
    });
    setNewMessage('');
  }, [newMessage, currentChatKey, chatPartner, currentUser]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [displayedMessages]);

  const pageTitle = chatPartner ? `Chat with ${chatPartner.name}` : "Instructor Chat";
  const pageDescription = chatPartner ? `One-on-one conversation with ${chatPartner.name}.` : "Select an instructor to start a chat.";

  return (
    <div>
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      />
      <Card className="flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-240px)]">
        <CardHeader>
          <CardTitle>
            {chatPartner ? `Conversation with ${chatPartner.name}` : "No Active Chat"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            {!chatPartner && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Please select an instructor from the instructors page to start a chat.</p>
              </div>
            )}
            {chatPartner && displayedMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
            )}
            {chatPartner && displayedMessages.length > 0 && (
              <div className="space-y-4">
                {displayedMessages.map((msg) => {
                  const isCurrentUserSender = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${
                        isCurrentUserSender ? 'justify-end' : ''
                      }`}
                    >
                      {!isCurrentUserSender && (
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={msg.senderProfilePictureUrl || `https://placehold.co/40x40.png?text=${msg.senderName.charAt(0)}`} alt={msg.senderName} data-ai-hint="avatar person" />
                          <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 text-sm shadow-sm ${
                          isCurrentUserSender
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="font-semibold mb-0.5">{isCurrentUserSender ? "You" : msg.senderName}</p>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${isCurrentUserSender ? 'text-primary-foreground/80' : 'text-muted-foreground/80'}`}>
                          {format(msg.timestamp, 'HH:mm')}
                        </p>
                      </div>
                      {isCurrentUserSender && (
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={msg.senderProfilePictureUrl || `https://placehold.co/40x40.png?text=${msg.senderName.charAt(0)}`} alt={msg.senderName} data-ai-hint="avatar person" />
                          <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder={chatPartner ? "Type your message..." : "Select a chat"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              aria-label="Chat message input"
              disabled={!chatPartner}
            />
            <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90" disabled={!chatPartner || newMessage.trim() === ''}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        <strong>Note:</strong> This chat is a prototype. Messages are not saved persistently and are only visible in your current browser session for active chats.
      </p>
    </div>
  );
}
