
"use client";

import React from 'react';
import { SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import type { Filters } from '@/types';

interface PumpFilterControlsProps {
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
  availablePumpModels: string[];
  availablePowderCoaters: string[];
  availableCustomers: string[];
  availableSerialNumbers: string[];
  availablePONumbers: string[];
  availablePriorities: { label: string; value: string }[];
}

export function PumpFilterControls({
  filters,
  onFiltersChange,
  availablePumpModels,
  availablePowderCoaters,
  availableCustomers,
  availableSerialNumbers,
  availablePONumbers,
  availablePriorities,
}: PumpFilterControlsProps) {

  const handleComboboxChange = (name: keyof Filters, value: string | string[]) => {
    const newValues = Array.isArray(value) ? value : (value ? [value] : []);
    onFiltersChange({ 
      ...filters, 
      [name]: newValues.length === 0 ? undefined : newValues 
    });
  };

  const customerOptions = availableCustomers.map(c => ({ label: c, value: c }));
  const modelOptions = availablePumpModels.map(m => ({ label: m, value: m }));
  const powderCoaterOptions = availablePowderCoaters.map(pc => ({ label: pc, value: pc }));
  const serialNumberOptions = availableSerialNumbers.map(sn => ({ label: sn, value: sn}));
  const poNumberOptions = availablePONumbers.map(po => ({ label: po, value: po }));
  // availablePriorities is already in { label, value } format

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="serialNumberFilter" className="text-xs text-glass-text-primary">Serial Number</Label>
        <Combobox
          options={serialNumberOptions}
          value={filters.serialNumber || []}
          onChange={(value) => handleComboboxChange('serialNumber', value as string[])}
          placeholder="All Serial Numbers"
          searchPlaceholder="Search serial numbers..."
          emptyText="No serial number found."
          className="mt-1 h-8 text-sm"
          multiple={true}
        />
        {/* The Combobox component internally uses SelectContent, which needs styling. 
            While we can't directly style the SelectContent here without modifying the Combobox component itself,
            the styling was applied globally in src/app/globals.css and to the SelectContent component
            in src/components/ui/combobox.tsx.
        */}
      </div>
      <div>
        <Label htmlFor="customerFilter" className="text-xs text-glass-text-primary">Customer</Label>
        <Combobox
          options={customerOptions}
          value={filters.customer || []}

          onChange={(value) => handleComboboxChange('customer', value as string[])}
          placeholder="All Customers"
          searchPlaceholder="Search customers..."
          emptyText="No customer found."
          className="mt-1 h-8 text-sm"
          multiple={true}
        />
      </div>
      <div>
        <Label htmlFor="poNumberFilter" className="text-xs text-glass-text-primary">PO Number</Label>
        <Combobox
          options={poNumberOptions}
          value={filters.poNumber || []}

          onChange={(value) => handleComboboxChange('poNumber', value as string[])}
          placeholder="All PO Numbers"
          searchPlaceholder="Search PO numbers..."
          emptyText="No PO number found."
          className="mt-1 h-8 text-sm"
          multiple={true}
        />
      </div>
      <div>
        <Label htmlFor="modelFilter" className="text-xs text-glass-text-primary">Model</Label>
        <Combobox
          options={modelOptions}
          value={filters.model || []}

          onChange={(value) => handleComboboxChange('model', value as string[])}
          placeholder="All Models"
          searchPlaceholder="Search models..."
          emptyText="No model found."
          className="mt-1 h-8 text-sm"
          multiple={true}
        />
      </div>
      <div>
        <Label htmlFor="powderCoaterFilter" className="text-xs text-glass-text-primary">Powder Coater</Label>
        <Combobox
          options={powderCoaterOptions}
          value={filters.powderCoater || []}

          onChange={(value) => handleComboboxChange('powderCoater', value as string[])}
          placeholder="All Coaters"
          searchPlaceholder="Search coaters..."
          emptyText="No coater found."
          className="mt-1 h-8 text-sm"
          multiple={true}
        />
      </div>
      <div>
        <Label htmlFor="priorityFilter" className="text-xs text-glass-text-primary">Priority</Label>
        <Combobox
          options={availablePriorities}
          value={filters.priority || []}

          onChange={(value) => handleComboboxChange('priority', value as string[])}
          placeholder="All Priorities"
          searchPlaceholder="Search priorities..."
          emptyText="No priority found."
          className="mt-1 h-8 text-sm"
          multiple={true}
        />
      </div>
    </div>
  );
}
