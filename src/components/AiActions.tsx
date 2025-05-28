
"use client";

import React, { useState } from 'react';
import type { Pump } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, ListChecks, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import AI functions
import { suggestNextSteps, type SuggestNextStepsOutput } from '@/ai/flows/suggest-next-steps';
import { createTestingChecklist, type CreateTestingChecklistOutput } from '@/ai/flows/create-testing-checklist';
import { draftEmailToVendor, type DraftEmailToVendorOutput } from '@/ai/flows/draft-email-to-vendor';

interface AiActionsProps {
  pump: Pump;
}

type AiResult =
  | { type: 'nextSteps'; data: SuggestNextStepsOutput }
  | { type: 'checklist'; data: CreateTestingChecklistOutput }
  | { type: 'email'; data: DraftEmailToVendorOutput }
  | { type: 'error'; message: string };

export function AiActions({ pump }: AiActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null); // 'nextSteps', 'checklist', 'email'
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const { toast } = useToast();

  const pumpSerialNumberText = pump.serialNumber || 'N/A';

  const handleSuggestNextSteps = async () => {
    setIsLoading('nextSteps');
    setAiResult(null);
    try {
      const result = await suggestNextSteps({
        stage: pump.currentStage,
        pumpDetails: `Model: ${pump.model}, SN: ${pumpSerialNumberText}, Customer: ${pump.customer}, PO: ${pump.poNumber}`,
      });
      setAiResult({ type: 'nextSteps', data: result });
    } catch (error) {
      console.error("Error suggesting next steps:", error);
      setAiResult({ type: 'error', message: 'Failed to suggest next steps.' });
      toast({ variant: "destructive", title: "AI Error", description: "Could not suggest next steps." });
    }
    setIsLoading(null);
  };

  const handleCreateTestingChecklist = async () => {
    if (!pump.serialNumber) {
      toast({ variant: "destructive", title: "Missing Info", description: "Serial number is required to create a testing checklist." });
      return;
    }
    setIsLoading('checklist');
    setAiResult(null);
    try {
      const result = await createTestingChecklist({
        pumpModel: pump.model,
        customer: pump.customer,
        serialNumber: pump.serialNumber, // SN must exist here
        poNumber: pump.poNumber,
      });
      setAiResult({ type: 'checklist', data: result });
    } catch (error) {
      console.error("Error creating testing checklist:", error);
      setAiResult({ type: 'error', message: 'Failed to create testing checklist.' });
      toast({ variant: "destructive", title: "AI Error", description: "Could not create testing checklist." });
    }
    setIsLoading(null);
  };

  const handleDraftEmailToVendor = async () => {
    if (!pump.powderCoater || !pump.powderCoatColor) {
      toast({ variant: "destructive", title: "Missing Info", description: "Powder coater and color are required to draft email." });
      return;
    }
    if (!pump.serialNumber) {
      toast({ variant: "destructive", title: "Missing Info", description: "Serial number is required to draft email to vendor." });
      return;
    }
    setIsLoading('email');
    setAiResult(null);
    try {
      const result = await draftEmailToVendor({
        vendorName: pump.powderCoater,
        pumpModel: pump.model,
        pumpSerialNumber: pump.serialNumber, // SN must exist here
        pumpPONumber: pump.poNumber,
        customerName: pump.customer,
        powderCoatColor: pump.powderCoatColor,
      });
      setAiResult({ type: 'email', data: result });
    } catch (error) {
      console.error("Error drafting email:", error);
      setAiResult({ type: 'error', message: 'Failed to draft email.' });
      toast({ variant: "destructive", title: "AI Error", description: "Could not draft email." });
    }
    setIsLoading(null);
  };

  const renderResult = () => {
    if (!aiResult) return null;

    switch (aiResult.type) {
      case 'nextSteps':
        return (
          <CardContent>
            <p className="font-medium mb-2">Suggested Next Steps:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {aiResult.data.nextSteps.map((step, index) => <li key={index}>{step}</li>)}
            </ul>
          </CardContent>
        );
      case 'checklist':
        return (
          <CardContent>
            <p className="font-medium mb-2">Testing Checklist (for S/N: {pump.serialNumber}):</p>
            <ul className="list-decimal pl-5 space-y-1 text-sm">
              {aiResult.data.checklist.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </CardContent>
        );
      case 'email':
        return (
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-1">Email draft for S/N: {pump.serialNumber}</p>
            <div>
              <Label htmlFor="emailSubject" className="text-xs font-medium">Subject</Label>
              <Input id="emailSubject" readOnly value={aiResult.data.emailSubject} className="mt-1"/>
            </div>
            <div>
              <Label htmlFor="emailBody" className="text-xs font-medium">Body</Label>
              <Textarea id="emailBody" readOnly value={aiResult.data.emailBody} rows={8} className="mt-1" />
            </div>
          </CardContent>
        );
      case 'error':
        return <CardContent><p className="text-destructive">{aiResult.message}</p></CardContent>;
      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      <h4 className="text-md font-semibold mb-3 text-foreground">AI Assistant</h4>
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSuggestNextSteps} disabled={!!isLoading} variant="outline" size="sm">
                {isLoading === 'nextSteps' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Next Steps
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Suggest Next Steps</p>
            </TooltipContent>
          </Tooltip>
          
          {pump.currentStage === 'testing' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCreateTestingChecklist} disabled={!!isLoading || !pump.serialNumber} variant="outline" size="sm">
                  {isLoading === 'checklist' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListChecks className="mr-2 h-4 w-4" />}
                  Testing Checklist
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create Testing Checklist</p>
              </TooltipContent>
            </Tooltip>
          )}
          {(pump.currentStage === 'powder-coat' || pump.currentStage === 'assembly') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleDraftEmailToVendor} disabled={!!isLoading || !pump.powderCoater || !pump.powderCoatColor || !pump.serialNumber} variant="outline" size="sm">
                  {isLoading === 'email' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Draft Email
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Draft Email to Vendor</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
      {aiResult && (
        <Card className="mt-4 bg-muted/50">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm">AI Output</CardTitle>
          </CardHeader>
          {renderResult()}
        </Card>
      )}
    </div>
  );
}
