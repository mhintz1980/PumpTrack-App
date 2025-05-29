
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings2, FilterX } from 'lucide-react';
import type { Filters } from '@/types';
import { PumpFilterControls } from '@/components/pump/PumpFilterControls';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  onAddPump: () => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availablePumpModels: string[];
  availablePowderCoaters: string[];
  availableCustomers: string[];
  availableSerialNumbers: string[];
  availablePONumbers: string[];
  availablePriorities: { label: string; value: string }[];
}

export function Header({
  onAddPump,
  filters,
  onFiltersChange,
  availablePumpModels,
  availablePowderCoaters,
  availableCustomers,
  availableSerialNumbers,
  availablePONumbers,
  availablePriorities,
}: HeaderProps) {
  const activeFilterCount = Object.values(filters).filter(
    (value) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  ).length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClearFilters = () => {
    onFiltersChange({});
    // setIsMenuOpen(false); // Optionally close menu after clearing filters
  };

  return (
    <TooltipProvider>
      {/* This header is specific to the Kanban page, rendered below the global header but sticky within its scroll container */}
      <div className="bg-card p-4 shadow-md sticky top-0 z-20">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">PumpTrack Workflow</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={activeFilterCount > 0 ? `Filters (${activeFilterCount} Applied), open menu` : "Open filters menu"}
                    >
                      <Settings2 className="mr-2 h-4 w-4" />
                      {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open filters menu</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent className="w-72 p-4" align="end">
                <DropdownMenuLabel>Filter Pumps</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <PumpFilterControls
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  availablePumpModels={availablePumpModels}
                  availablePowderCoaters={availablePowderCoaters}
                  availableCustomers={availableCustomers}
                  availableSerialNumbers={availableSerialNumbers}
                  availablePONumbers={availablePONumbers}
                  availablePriorities={availablePriorities}
                />
              </DropdownMenuContent>
            </DropdownMenu>

            {activeFilterCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearFilters}
                    className="h-9 w-9"
                    aria-label="Clear all filters"
                  >
                    <FilterX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all filters</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onAddPump} size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Pump
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add new pump(s)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
