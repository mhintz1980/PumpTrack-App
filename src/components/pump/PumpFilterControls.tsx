
"use client";

import React from 'react';
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

  const handleComboboxChange = (name: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [name]: value === '' ? undefined : value });
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
        <Label htmlFor="serialNumberFilter" className="text-xs">Serial Number</Label>
        <Combobox
          options={serialNumberOptions}
          value={filters.serialNumber || ''}
          onChange={(value) => handleComboboxChange('serialNumber', value)}
          placeholder="All Serial Numbers"
          searchPlaceholder="Search serial numbers..."
          emptyText="No serial number found."
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="customerFilter" className="text-xs">Customer</Label>
        <Combobox
          options={customerOptions}
          value={filters.customer || ''}
          onChange={(value) => handleComboboxChange('customer', value)}
          placeholder="All Customers"
          searchPlaceholder="Search customers..."
          emptyText="No customer found."
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="poNumberFilter" className="text-xs">PO Number</Label>
        <Combobox
          options={poNumberOptions}
          value={filters.poNumber || ''}
          onChange={(value) => handleComboboxChange('poNumber', value)}
          placeholder="All PO Numbers"
          searchPlaceholder="Search PO numbers..."
          emptyText="No PO number found."
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="modelFilter" className="text-xs">Model</Label>
        <Combobox
          options={modelOptions}
          value={filters.model || ''}
          onChange={(value) => handleComboboxChange('model', value)}
          placeholder="All Models"
          searchPlaceholder="Search models..."
          emptyText="No model found."
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="powderCoaterFilter" className="text-xs">Powder Coater</Label>
        <Combobox
          options={powderCoaterOptions}
          value={filters.powderCoater || ''}
          onChange={(value) => handleComboboxChange('powderCoater', value)}
          placeholder="All Coaters"
          searchPlaceholder="Search coaters..."
          emptyText="No coater found."
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="priorityFilter" className="text-xs">Priority</Label>
        <Combobox
          options={availablePriorities}
          value={filters.priority || ''}
          onChange={(value) => handleComboboxChange('priority', value as Filters['priority'])}
          placeholder="All Priorities"
          searchPlaceholder="Search priorities..."
          emptyText="No priority found."
          className="mt-1 h-8 text-sm"
        />
      </div>
    </div>
  );
}
