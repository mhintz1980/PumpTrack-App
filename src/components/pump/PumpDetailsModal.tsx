
"use client";

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Pump } from '@/types';
import { STAGES, POWDER_COATERS, PUMP_MODELS, DEFAULT_POWDER_COAT_COLORS } from '@/lib/constants';
import { AiActions } from '@/components/AiActions';
import { ScrollArea } from '@/components/ui/scroll-area';

const pumpDetailsSchema = z.object({
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  customer: z.string().min(1, "Customer name is required"),
  poNumber: z.string().min(1, "PO number is required"),
  powderCoater: z.string().optional(),
  powderCoatColor: z.string().optional(),
  notes: z.string().optional(),
});

type PumpDetailsFormValues = z.infer<typeof pumpDetailsSchema>;

interface PumpDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pump: Pump | null;
  onUpdatePump: (updatedPump: Pump) => void;
}

export function PumpDetailsModal({ isOpen, onClose, pump, onUpdatePump }: PumpDetailsModalProps) {
  const form = useForm<PumpDetailsFormValues>({
    resolver: zodResolver(pumpDetailsSchema),
  });

  useEffect(() => {
    if (pump) {
      form.reset({
        model: pump.model,
        serialNumber: pump.serialNumber,
        customer: pump.customer,
        poNumber: pump.poNumber,
        powderCoater: pump.powderCoater || '',
        powderCoatColor: pump.powderCoatColor || '',
        notes: pump.notes || '',
      });
    }
  }, [pump, form]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pump) return null;

  const onSubmit = (data: PumpDetailsFormValues) => {
    setIsSubmitting(true);
    const updatedPumpData = {
      ...pump,
      ...data,
      powderCoater: data.powderCoater || undefined, // ensure undefined if empty
      powderCoatColor: data.powderCoatColor || undefined,
      notes: data.notes || undefined,
    };
    onUpdatePump(updatedPumpData);
    setIsSubmitting(false);
    onClose();
  };
  
  const currentStageDetails = STAGES.find(s => s.id === pump.currentStage);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pump Details: {pump.serialNumber}</DialogTitle>
          <DialogDescription>
            Currently in stage: <span className="font-semibold text-primary">{currentStageDetails?.title || pump.currentStage}</span>.
            View or edit pump information below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6"> {/* Added pr for scrollbar space */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pump Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PUMP_MODELS.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {(pump.currentStage === 'powder-coat' || pump.currentStage === 'assembly' || pump.currentStage === 'final-qc' || pump.currentStage === 'ready-to-ship') && (
                  <>
                    <FormField
                      control={form.control}
                      name="powderCoater"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Powder Coater</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a powder coater" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {POWDER_COATERS.map(coater => (
                                <SelectItem key={coater} value={coater}>{coater}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="powderCoatColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Powder Coat Color</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                               <SelectTrigger>
                                <SelectValue placeholder="Select or type color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEFAULT_POWDER_COAT_COLORS.map(color => (
                                <SelectItem key={color} value={color}>{color}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input 
                            placeholder="Or type custom color" 
                            onChange={(e) => field.onChange(e.target.value)} 
                            value={field.value || ''}
                            className="mt-2"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any relevant notes for this pump..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <AiActions pump={pump} />

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Close
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
