
"use client";

import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Pump, StageId } from '@/types';
import { POWDER_COATERS, DEFAULT_POWDER_COAT_COLORS } from '@/lib/constants';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

const missingInfoSchema = z.object({
  powderCoater: z.string().min(1, "Powder coater is required."),
  powderCoatColor: z.string().min(1, "Powder coat color is required."),
});

type MissingInfoFormValues = z.infer<typeof missingInfoSchema>;

interface MissingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pump: Pump | null;
  targetStageId: StageId | null;
  onSave: (pumpId: string, data: Partial<Pump>) => void;
}

export function MissingInfoModal({ isOpen, onClose, pump, targetStageId, onSave }: MissingInfoModalProps) {
  const form = useForm<MissingInfoFormValues>({
    resolver: zodResolver(missingInfoSchema),
    defaultValues: {
      powderCoater: '',
      powderCoatColor: '',
    },
  });

  useEffect(() => {
    if (pump) {
      form.reset({
        powderCoater: pump.powderCoater || '',
        powderCoatColor: pump.powderCoatColor || '',
      });
    }
  }, [pump, form]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pump || targetStageId !== 'powder-coat') {
    return null; 
  }

  const onSubmit = (data: MissingInfoFormValues) => {
    setIsSubmitting(true);
    if (pump) {
      onSave(pump.id, { powderCoater: data.powderCoater, powderCoatColor: data.powderCoatColor });
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className={cn(
          "sm:max-w-[425px]"
          // The "glass-dialog-theme" class is now applied by default from DialogContent component
          )}>
          <DialogHeader>
            <DialogTitle>Missing Information</DialogTitle>
            <DialogDescription>
              Please provide the powder coater and color for pump {pump.serialNumber} before moving to 'Powder Coat'.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="powderCoater"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Powder Coater</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select or type a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEFAULT_POWDER_COAT_COLORS.map(color => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="Or type custom color (e.g. RAL code)" 
                      onChange={(e) => field.onChange(e.target.value)} 
                      value={field.value}
                      className="mt-2"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save and Continue'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
