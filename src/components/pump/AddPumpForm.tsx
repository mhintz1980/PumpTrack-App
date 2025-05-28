
"use client";

import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Pump } from '@/types';
import { PUMP_MODELS, CUSTOMER_NAMES } from '@/lib/constants';

const pumpFormSchema = z.object({
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().regex(/^MSP-JN-\d{4}$/, "Serial number must be in MSP-JN-XXXX format (e.g., MSP-JN-1234)"),
  customer: z.string().min(1, "Customer name is required"),
  poNumber: z.string().min(1, "PO number is required"),
});

type PumpFormValues = z.infer<typeof pumpFormSchema>;

interface AddPumpFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPump: (newPump: Omit<Pump, 'id' | 'currentStage'>) => void;
}

export function AddPumpForm({ isOpen, onClose, onAddPump }: AddPumpFormProps) {
  const form = useForm<PumpFormValues>({
    resolver: zodResolver(pumpFormSchema),
    defaultValues: {
      model: '',
      serialNumber: 'MSP-JN-', 
      customer: '',
      poNumber: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (data: PumpFormValues) => {
    setIsSubmitting(true);
    onAddPump(data);
    form.reset({ 
        model: '', 
        serialNumber: 'MSP-JN-', 
        customer: '', 
        poNumber: '' 
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        form.reset({ model: '', serialNumber: 'MSP-JN-', customer: '', poNumber: '' });
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Pump</DialogTitle>
          <DialogDescription>
            Enter the details for the new pump. It will be added to 'Open Jobs'.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                    <Input placeholder="Enter last 4 digits (e.g., 1234)" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CUSTOMER_NAMES.map(customer => (
                        <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="e.g., PO-67890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                onClose();
                form.reset({ model: '', serialNumber: 'MSP-JN-', customer: '', poNumber: '' });
              }} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Pump'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
