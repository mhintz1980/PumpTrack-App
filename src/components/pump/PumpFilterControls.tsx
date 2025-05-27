
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Filters } from '@/types';

interface PumpFilterControlsProps {
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
  availablePumpModels: string[];
  availablePowderCoaters: string[];
}

export function PumpFilterControls({
  filters,
  onFiltersChange,
  availablePumpModels,
  availablePowderCoaters,
}: PumpFilterControlsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [name]: value === 'all' ? undefined : value });
  };

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
        <Input
          id="customerFilter"
          name="customer"
          value={filters.customer || ''}
          onChange={handleInputChange}
          placeholder="Filter by Customer..."
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
        <Select
          name="model"
          value={filters.model || 'all'}
          onValueChange={(value) => handleSelectChange('model', value)}
        >
          <SelectTrigger className="mt-1 h-8 text-sm">
            <SelectValue placeholder="Filter by Model..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            {availablePumpModels.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="powderCoaterFilter" className="text-xs">Powder Coater</Label>
        <Select
          name="powderCoater"
          value={filters.powderCoater || 'all'}
          onValueChange={(value) => handleSelectChange('powderCoater', value)}
        >
          <SelectTrigger className="mt-1 h-8 text-sm">
            <SelectValue placeholder="Filter by Powder Coater..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coaters</SelectItem>
            {availablePowderCoaters.map((coater) => (
              <SelectItem key={coater} value={coater}>
                {coater}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
