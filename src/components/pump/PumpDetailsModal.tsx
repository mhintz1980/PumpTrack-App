
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
import { Combobox } from '@/components/ui/combobox';
import type { Pump, StageId } from '@/types';
import { STAGES, POWDER_COATERS, PUMP_MODELS, DEFAULT_POWDER_COAT_COLORS, CUSTOMER_NAMES } from '@/lib/constants';
import { AiActions } from '@/components/AiActions';
import { ScrollArea } from '@/components/ui/scroll-area';

const pumpDetailsSchema = z.object({
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().regex(/^MSP-JN-\d{4}$/, "Serial number must be in MSP-JN-XXXX format (e.g., MSP-JN-1234)"),
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
      powderCoater: data.powderCoater || undefined, 
      powderCoatColor: data.powderCoatColor || undefined,
      notes: data.notes || undefined,
    };
    onUpdatePump(updatedPumpData);
    setIsSubmitting(false);
    onClose();
  };
  
  const currentStageDetails = STAGES.find(s => s.id === pump.currentStage);
  const relevantStagesForPowderCoatFields: StageId[] = ['fabrication', 'assembly', 'powder-coat', 'testing'];
  const showPowderCoatFields = relevantStagesForPowderCoatFields.includes(pump.currentStage);

  const pumpModelOptions = PUMP_MODELS.map(m => ({ label: m, value: m }));
  const customerOptions = CUSTOMER_NAMES.map(c => ({ label: c, value: c }));
  const powderCoaterOptions = POWDER_COATERS.map(pc => ({ label: pc, value: pc }));
  const powderCoatColorOptions = DEFAULT_POWDER_COAT_COLORS.map(color => ({ label: color, value: color }));

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
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pump Model</FormLabel>
                      <Combobox
                        options={pumpModelOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a model"
                        searchPlaceholder="Search models..."
                        emptyText="No model found."
                        disabled={isSubmitting}
                      />
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
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Customer Name</FormLabel>
                      <Combobox
                        options={customerOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a customer"
                        searchPlaceholder="Search customers..."
                        emptyText="No customer found."
                        disabled={isSubmitting}
                      />
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
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {showPowderCoatFields && (
                  <>
                    <FormField
                      control={form.control}
                      name="powderCoater"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Powder Coater</FormLabel>
                          <Combobox
                            options={powderCoaterOptions}
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Select a powder coater"
                            searchPlaceholder="Search coaters..."
                            emptyText="No coater found."
                            disabled={isSubmitting}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="powderCoatColor"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Powder Coat Color</FormLabel>
                          <Combobox
                            options={powderCoatColorOptions}
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Select or type color"
                            searchPlaceholder="Search colors..."
                            emptyText="No color found. Type to add custom."
                            disabled={isSubmitting}
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
                      <Textarea placeholder="Add any relevant notes for this pump..." {...field} rows={3} disabled={isSubmitting}/>
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
