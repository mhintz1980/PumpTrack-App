
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage
import { Loader2, Send, User, Bot } from 'lucide-react';
import { answerPumpDataQuestion } from '@/ai/flows/answer-pump-data-question-flow';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AiQueryPage() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await answerPumpDataQuestion({ question: userMessage.text });
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: aiResponse.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not get a response from the AI. Please try again.',
      });
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: "Sorry, I encountered an error trying to process your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Query for the viewport element within the ScrollArea
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);
  
  // The main layout now provides the global header with the sidebar trigger.
  // This page's content will be rendered within the SidebarInset.
  // The h-[calc(100vh-var(--header-height)-env(safe-area-inset-bottom))] with --header-height
  // was specific to when this page had its own header concept. Now it will be part of the main scrollable area.

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-background">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-primary">A.I. Query</h1>
        <p className="text-muted-foreground">Ask questions about your pump data.</p>
      </header>

      <ScrollArea className="flex-grow mb-4 border rounded-lg p-4 bg-card" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-8 w-8 border border-primary/50">
                  <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 text-sm ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p className={`mt-1 text-xs ${message.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.sender === 'user' && (
                 <Avatar className="h-8 w-8 border">
                   <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                 </Avatar>
              )}
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user' && (
             <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border border-primary/50">
                  <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-lg p-3 text-sm bg-muted text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
             </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 border-t pt-4">
        <Input
          type="text"
          placeholder="Ask a question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
          className="flex-grow"
        />
        <Button onClick={handleSendMessage} disabled={isLoading} className="min-w-[80px]">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
          Send
        </Button>
      </div>
    </div>
  );
}
