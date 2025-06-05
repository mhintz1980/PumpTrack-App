"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Settings2, FilterX, SearchIcon } from 'lucide-react';
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
import { SidebarTrigger } from '@/components/ui/sidebar';

interface EnhancedHeaderProps {
  title: string;
  showAddPump?: boolean;
  onAddPump?: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availablePumpModels: string[];
  availablePowderCoaters: string[];
  availableCustomers: string[];
  availableSerialNumbers: string[];
  availablePONumbers: string[];
  availablePriorities: { label: string; value: string }[];
}

export function EnhancedHeader({
  title,
  showAddPump = false,
  onAddPump,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  availablePumpModels,
  availablePowderCoaters,
  availableCustomers,
  availableSerialNumbers,
  availablePONumbers,
  availablePriorities,
}: EnhancedHeaderProps) {
  const activeFilterCount = Object.values(filters).filter(
    (value) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  ).length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <TooltipProvider>
      <div className="bg-card p-4 shadow-md sticky top-0 z-20">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left side: Sidebar trigger and title */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-7 w-7" />
            <h1 className="text-2xl font-bold text-primary whitespace-nowrap">{title}</h1>
          </div>
          
          {/* Right side: Search, filters, and optional add pump */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {/* Search Bar */}
            <div className="relative min-w-[200px] max-w-[300px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search all fields..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filters Dropdown */}
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

            {/* Clear Filters Button */}
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

            {/* Add Pump Button (conditional) */}
            {showAddPump && onAddPump && (
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
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}