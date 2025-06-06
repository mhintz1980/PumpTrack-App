
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
import type { Pump, StageId, PriorityLevel } from '@/types';
import { STAGES, POWDER_COATERS, PUMP_MODELS, DEFAULT_POWDER_COAT_COLORS, CUSTOMER_NAMES, PRIORITY_LEVELS } from '@/lib/constants';
import { AiActions } from '@/components/AiActions';
import { ScrollArea } from '@/components/ui/scroll-area';

const pumpDetailsSchema = z.object({
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().optional().refine(val => {
    if (val === undefined || val.trim() === '') return true;
    return /^MSP-JN-\d{4}$/.test(val);
  }, { message: "Serial number must be in MSP-JN-XXXX format if provided." }),
  customer: z.string().min(1, "Customer name is required"),
  poNumber: z.string().min(1, "PO number is required"),
  powderCoater: z.string().optional(),
  powderCoatColor: z.string().optional(),
  priority: z.enum(PRIORITY_LEVELS.map(p => p.value) as [PriorityLevel, ...PriorityLevel[]]).default('normal'),
  estimatedBuildTimeDays: z.coerce.number().min(0.1, "Build time must be a positive number.").optional().nullable(),
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
        serialNumber: pump.serialNumber || '',
        customer: pump.customer,
        poNumber: pump.poNumber,
        powderCoater: pump.powderCoater || '',
        powderCoatColor: pump.powderCoatColor || '',
        priority: pump.priority || 'normal',
        estimatedBuildTimeDays: pump.estimatedBuildTimeDays === undefined ? null : pump.estimatedBuildTimeDays,
        notes: pump.notes || '',
      });
    }
  }, [pump, form, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pump) return null;

  const onSubmit = (data: PumpDetailsFormValues) => {
    setIsSubmitting(true);
    const updatedPumpData: Pump = {
      ...pump,
      ...data,
      serialNumber: data.serialNumber?.trim() === '' ? undefined : data.serialNumber,
      powderCoater: data.powderCoater?.trim() === '' ? undefined : data.powderCoater,
      powderCoatColor: data.powderCoatColor?.trim() === '' ? undefined : data.powderCoatColor,
      priority: data.priority,
      estimatedBuildTimeDays: data.estimatedBuildTimeDays === null ? undefined : data.estimatedBuildTimeDays,
      notes: data.notes?.trim() === '' ? undefined : data.notes,
    };
    onUpdatePump(updatedPumpData);
    setIsSubmitting(false);
    onClose();
  };

  const currentStageDetails = STAGES.find(s => s.id === pump.currentStage);
  // Always show Powder Coater and Powder Coat Color fields for layout consistency
  const showPowderCoatFields = true; 

  const pumpModelOptions = PUMP_MODELS.map(m => ({ label: m, value: m }));
  const customerOptions = CUSTOMER_NAMES.map(c => ({ label: c, value: c }));
  const powderCoaterOptions = POWDER_COATERS.map(pc => ({ label: pc, value: pc }));
  const powderCoatColorOptions = DEFAULT_POWDER_COAT_COLORS.map(color => ({ label: color, value: color }));
  const priorityOptions = PRIORITY_LEVELS.map(p => ({ label: p.label, value: p.value }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {if (!open) onClose()}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pump Details: {pump.serialNumber || pump.model || 'N/A'}</DialogTitle>
          <DialogDescription>
            Currently in stage: <span className="font-semibold text-primary">{currentStageDetails?.title || pump.currentStage}</span>.
            View or edit pump information below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow my-4"> 
          <Form {...form}>
            <form id="pumpDetailsForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-1 py-2"> 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                        <Input {...field} value={field.value || ''} placeholder="MSP-JN-XXXX or leave blank" disabled={isSubmitting} />
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
                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Priority</FormLabel>
                        <Combobox
                          options={priorityOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select priority"
                          searchPlaceholder="Search priorities..."
                          emptyText="No priority found."
                          disabled={isSubmitting}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="estimatedBuildTimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Build Time (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.5"
                          {...field}
                          value={field.value === null || field.value === undefined ? '' : String(field.value)}
                          onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Powder Coater and Color fields will always be rendered now */}
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
                            emptyText="No color found. Type to add."
                            allowCustomValue={true}
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
                      <Textarea placeholder="Add any relevant notes for this pump..." {...field} value={field.value || ''} rows={3} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AiActions pump={pump} />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Close
            </Button>
          </DialogClose>
          <Button type="submit" form="pumpDetailsForm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
