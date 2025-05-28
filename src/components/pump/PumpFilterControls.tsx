
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import type { Filters } from '@/types';

interface PumpFilterControlsProps {
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
  availablePumpModels: string[];
  availablePowderCoaters: string[];
  availableCustomers: string[];
}

export function PumpFilterControls({
  filters,
  onFiltersChange,
  availablePumpModels,
  availablePowderCoaters,
  availableCustomers,
}: PumpFilterControlsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, [e.target.name]: e.target.value === '' ? undefined : e.target.value });
  };

  const handleComboboxChange = (name: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [name]: value === '' ? undefined : value });
  };

  const customerOptions = availableCustomers.map(c => ({ label: c, value: c }));
  const modelOptions = availablePumpModels.map(m => ({ label: m, value: m }));
  const powderCoaterOptions = availablePowderCoaters.map(pc => ({ label: pc, value: pc }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="serialNumberFilter" className="text-xs">Serial Number</Label>
        <Input
          id="serialNumberFilter"
          name="serialNumber"
          value={filters.serialNumber || ''}
          onChange={handleInputChange}
          placeholder="Filter by Serial..."
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
        <Input
          id="poNumberFilter"
          name="poNumber"
          value={filters.poNumber || ''}
          onChange={handleInputChange}
          placeholder="Filter by PO Number..."
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
    </div>
  );
}
