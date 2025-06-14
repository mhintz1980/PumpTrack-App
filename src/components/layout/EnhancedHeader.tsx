
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings2, FilterX, SearchIcon } from 'lucide-react'; 
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
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface EnhancedHeaderProps {
  title: string;
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
  showControls?: boolean;
  rightContent?: React.ReactNode;
}

export function EnhancedHeader({
  title,
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
  showControls = true,
  rightContent,
}: EnhancedHeaderProps) {
  const activeFilterCount = Object.values(filters).filter(
    (value) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  ).length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <TooltipProvider>
      <div
        className="px-4 py-2 sticky top-0 z-20 bg-transparent flex items-center"
        style={{ height: 'var(--header-height-value)' }}
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isMobile && <SidebarTrigger className="h-7 w-7" />}
            <h1 className="text-xl sm:text-2xl font-bold text-glass-text-primary whitespace-nowrap">
              {title}
            </h1>
          </div>
          {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
        </div>
      </div>
      {showControls && (
        <div className="px-4 py-2">
          <div className="container mx-auto flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative min-w-[150px] sm:min-w-[200px] max-w-[300px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full h-9 text-sm bg-card/80 backdrop-blur-sm border-glass-border text-glass-text-primary placeholder:text-glass-text-muted focus:ring-glass-accent-purple"
                aria-label="Search all fields"
              />
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={activeFilterCount > 0 ? `Filters (${activeFilterCount} Applied), open menu` : 'Open filters menu'}
                        className="glass-button"
                      >
                        <Settings2 className="mr-1 sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilterCount > 0 && <span className="ml-1">({activeFilterCount})</span>}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="glass-tooltip">
                    <p>Open filters menu</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  className={cn('w-72 p-4', 'enhanced-header-filters')}
                  align="start"
                >
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
                      className="h-9 w-9 glass-button"
                      aria-label="Clear all filters"
                    >
                      <FilterX className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="glass-tooltip">
                    <p>Clear all filters</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}

