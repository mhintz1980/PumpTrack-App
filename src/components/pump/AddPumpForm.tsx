
"use client";

import React, { useEffect } from 'react';
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
import type { Pump } from '@/types';
import { PUMP_MODELS, CUSTOMER_NAMES } from '@/lib/constants';

const pumpFormSchemaBase = z.object({
  model: z.string().min(1, "Model is required"),
  customer: z.string().min(1, "Customer name is required"),
  poNumber: z.string().min(1, "PO number is required"),
  notes: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").int("Quantity must be an integer").default(1),
  serialNumber: z.string().optional(),
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
  onAddPump: (newPumpData: Omit<Pump, 'id' | 'currentStage'> & { quantity: number; serialNumber?: string }) => void;
}

export function AddPumpForm({ isOpen, onClose, onAddPump }: AddPumpFormProps) {
  const form = useForm<PumpFormValues>({
    resolver: zodResolver(pumpFormSchema),
    defaultValues: {
      model: '',
      serialNumber: 'MSP-JN-',
      customer: '',
      poNumber: '',
      notes: '',
      quantity: 1,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const quantity = form.watch("quantity");

  useEffect(() => {
    if (quantity === 1) {
      if (!form.getValues("serialNumber")?.startsWith("MSP-JN-")) {
        form.setValue("serialNumber", "MSP-JN-");
      }
    } else if (quantity > 1) {
      // Optionally clear or change placeholder for starting serial number
      // For now, let's allow user to manage if they started typing something
    }
  }, [quantity, form]);
  
  const handleClose = () => {
    form.reset({
      model: '',
      serialNumber: 'MSP-JN-',
      customer: '',
      poNumber: '',
      notes: '',
      quantity: 1,
    });
    onClose();
  };

  const onSubmit = (data: PumpFormValues) => {
    setIsSubmitting(true);
    // The serialNumber from form is the starting one if quantity > 1
    // or the specific one if quantity === 1
    onAddPump({ 
      model: data.model,
      customer: data.customer,
      poNumber: data.poNumber,
      notes: data.notes,
      quantity: data.quantity,
      serialNumber: data.serialNumber // Pass as is; handler logic will determine if it's a start S/N
    });
    setIsSubmitting(false);
    handleClose();
  };
  
  const pumpModelOptions = PUMP_MODELS.map(model => ({ label: model, value: model }));
  const customerOptions = CUSTOMER_NAMES.map(customer => ({ label: customer, value: customer }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
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
                      placeholder={quantity > 1 ? "e.g., MSP-JN-1001 (optional)" : "Enter last 4 digits (e.g., 1234)"} 
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
    </Dialog>
  );
}
