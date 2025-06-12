
"use client";

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Pump, PriorityLevel } from '@/types';
import { PUMP_MODELS, CUSTOMER_NAMES, PRIORITY_LEVELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const pumpFormSchemaBase = z.object({
  model: z.string().min(1, "Model is required"),
  customer: z.string().min(1, "Customer name is required"),
  poNumber: z.string().min(1, "PO number is required"),
  notes: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").int("Quantity must be an integer").default(1),
  serialNumber: z.string().optional(),
  priority: z.enum(PRIORITY_LEVELS.map(p => p.value) as [PriorityLevel, ...PriorityLevel[]]).default('normal'),
});

const pumpFormSchema = pumpFormSchemaBase.superRefine((data, ctx) => {
  if (data.quantity === 1) {
    if (!data.serialNumber || data.serialNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Serial number is required when quantity is 1.",
        path: ["serialNumber"],
      });
    } else if (!/^MSP-JN-\d{4}$/.test(data.serialNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Serial number must be in MSP-JN-XXXX format (e.g., MSP-JN-1234).",
        path: ["serialNumber"],
      });
    }
  } else if (data.quantity > 1 && data.serialNumber && data.serialNumber.trim() !== '') {
    if (!/^MSP-JN-\d{4}$/.test(data.serialNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Starting serial number must be in MSP-JN-XXXX format if provided.",
        path: ["serialNumber"],
      });
    }
  }
});


type PumpFormValues = z.infer<typeof pumpFormSchema>;

interface AddPumpFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPump: (newPumpsData: Array<Omit<Pump, 'id' | 'createdAt' | 'updatedAt'>>) => void;
}

export function AddPumpForm({ isOpen, onClose, onAddPump }: AddPumpFormProps) {
  const form = useForm<PumpFormValues>({
    resolver: zodResolver(pumpFormSchema),
    defaultValues: {
      model: '',
      serialNumber: '',
      customer: '',
      poNumber: '',
      notes: '',
      quantity: 1,
      priority: 'normal',
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const quantity = form.watch("quantity");

  const handleClose = () => {
    form.reset({
      model: '',
      serialNumber: '',
      customer: '',
      poNumber: '',
      notes: '',
      quantity: 1,
      priority: 'normal',
    });
    onClose();
  };

  const onSubmit = (data: PumpFormValues) => {
    setIsSubmitting(true);

    const newPumpsToCreate: Array<Omit<Pump, 'id' | 'createdAt' | 'updatedAt'>> = [];
    let currentSerialNumberNumeric = -1;
    const startSerialNumber = data.serialNumber?.trim() === '' ? undefined : data.serialNumber;

    if (data.quantity > 1 && startSerialNumber && /^MSP-JN-\d{4}$/.test(startSerialNumber)) {
      currentSerialNumberNumeric = parseInt(startSerialNumber.substring(7), 10);
    }

    for (let i = 0; i < data.quantity; i++) {
      let pumpSerialNumber: string | undefined = undefined;
      if (data.quantity === 1 && startSerialNumber && /^MSP-JN-\d{4}$/.test(startSerialNumber)) {
        pumpSerialNumber = startSerialNumber;
      } else if (data.quantity > 1 && currentSerialNumberNumeric !== -1) {
         if (currentSerialNumberNumeric + i <= 9999) {
            pumpSerialNumber = `MSP-JN-${String(currentSerialNumberNumeric + i).padStart(4, '0')}`;
        }
      }

      const pumpData: Omit<Pump, 'id' | 'createdAt' | 'updatedAt'> = {
        model: data.model,
        customer: data.customer,
        poNumber: data.poNumber,
        serialNumber: pumpSerialNumber,
        currentStage: 'open-jobs', 
        notes: data.notes || undefined,
        priority: data.priority || 'normal',
        estimatedBuildTimeDays: 1.5, 
      };
      newPumpsToCreate.push(pumpData);
    }

    onAddPump(newPumpsToCreate);
    setIsSubmitting(false);
    handleClose();
  };

  const pumpModelOptions = PUMP_MODELS.map(model => ({ label: model, value: model }));
  const customerOptions = CUSTOMER_NAMES.map(customer => ({ label: customer, value: customer }));
  const priorityOptions = PRIORITY_LEVELS.map(p => ({ label: p.label, value: p.value }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className={cn(
          "sm:max-w-md"
          // The "glass-dialog-theme" class is now applied by default from DialogContent component
          )}>
          <DialogHeader>
            <DialogTitle>Add New Pump(s)</DialogTitle>
            <DialogDescription>
              Enter details for the new pump(s). They will be added to 'Open Jobs'.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
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
                      <Input placeholder="e.g., PO-67890" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field}
                             onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)}
                             disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{quantity > 1 ? "Starting Serial Number (Optional)" : "Serial Number"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          quantity > 1
                            ? "MSP-JN-XXXX (e.g., MSP-JN-1001)"
                            : "MSP-JN-XXXX (e.g., MSP-JN-1234)"
                        }
                        {...field}
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any relevant notes for this pump..."
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (quantity > 1 ? 'Adding Pumps...' : 'Adding Pump...') : (quantity > 1 ? `Add ${quantity} Pumps` : 'Add Pump')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
