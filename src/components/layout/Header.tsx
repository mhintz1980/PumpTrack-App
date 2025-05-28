
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings2 } from 'lucide-react';
import type { ViewMode, Filters } from '@/types';
import { PumpFilterControls } from '@/components/pump/PumpFilterControls';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onAddPump: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availablePumpModels: string[];
  availablePowderCoaters: string[];
}

export function Header({
  onAddPump,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  availablePumpModels,
  availablePowderCoaters,
}: HeaderProps) {
  const activeFilterCount = Object.values(filters).filter(value => value !== undefined && value !== '').length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // This handler is for the Button's onClick.
  // It will clear filters if any are active.
  // The DropdownMenu's onOpenChange will handle toggling isMenuOpen.
  const handleButtonClick = () => {
    if (activeFilterCount > 0) {
      onFiltersChange({}); // Clear filters
    }
  };

  return (
    <header className="bg-card p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <svg width="32" height="32" viewBox="0 0 100 100" className="text-primary">
            <path fill="currentColor" d="M87.7,43.1a6.4,6.4,0,0,0-11.3,0L64,58.2V26.3a6.4,6.4,0,0,0-12.8,0V58.2L38.7,43.1a6.4,6.4,0,0,0-11.3,0L12.3,58.2a6.4,6.4,0,0,0,0,11.3l19.1,19.1a6.4,6.4,0,0,0,11.3,0L55.5,75.8a6.4,6.4,0,0,0,0-11.3L40.4,51.7l9.6-9.6V73.7a6.4,6.4,0,0,0,12.8,0V42.1l9.6,9.6L57.2,64.5a6.4,6.4,0,0,0,0,11.3l12.8,12.8a6.4,6.4,0,0,0,11.3,0l19.1-19.1a6.4,6.4,0,0,0,0-11.3ZM50,12.5a6.3,6.3,0,1,0,6.3,6.2A6.2,6.2,0,0,0,50,12.5Z"/>
          </svg>
          <h1 className="text-2xl font-bold text-primary">PumpTrack</h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleButtonClick} // Use the simplified handler
                aria-label={activeFilterCount > 0 ? `Clear ${activeFilterCount} filters and toggle menu` : "Open filters menu"}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {activeFilterCount > 0 ? `Filters (${activeFilterCount} Applied)` : "Filters"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-4" align="end">
              <DropdownMenuLabel>Filter Pumps</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <PumpFilterControls
                filters={filters}
                onFiltersChange={(newFilters) => {
                  onFiltersChange(newFilters);
                }}
                availablePumpModels={availablePumpModels}
                availablePowderCoaters={availablePowderCoaters}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center space-x-2">
            <Switch
              id="view-mode-toggle"
              checked={viewMode === 'condensed'}
              onCheckedChange={(checked) =>
                onViewModeChange(checked ? 'condensed' : 'detailed')
              }
              aria-label="Toggle view mode"
            />
            <Label htmlFor="view-mode-toggle" className="text-sm">
              Condensed View
            </Label>
          </div>
          <Button onClick={onAddPump} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Pump
          </Button>
        </div>
      </div>
    </header>
  );
}
