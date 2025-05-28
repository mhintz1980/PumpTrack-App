
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers } from 'lucide-react';
import type { Pump } from '@/types';

interface GroupedKanbanCardProps {
  model: string;
  pumpsInGroup: Pump[];
  onDragStartCustomerGroup: (event: React.DragEvent<HTMLButtonElement>, pumpsToDrag: Pump[]) => void;
  onOpenGroupDetailsModal?: (model: string, pumpsInGroup: Pump[]) => void;
  onToggleExplode?: () => void;
}

export function GroupedKanbanCard({ 
  model, 
  pumpsInGroup, 
  onDragStartCustomerGroup,
  onOpenGroupDetailsModal,
  onToggleExplode,
}: GroupedKanbanCardProps) {
  const totalQuantity = pumpsInGroup.length;

  const customerCounts = pumpsInGroup.reduce((acc, pump) => {
    acc[pump.customer] = (acc[pump.customer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, customer: string) => {
    const pumpsForThisCustomerAndModel = pumpsInGroup.filter(p => p.customer === customer);
    onDragStartCustomerGroup(e, pumpsForThisCustomerAndModel);
  };

  const handleDoubleClick = () => {
    if (onOpenGroupDetailsModal) {
      onOpenGroupDetailsModal(model, pumpsInGroup);
    }
  };

  const handleExplodeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (onToggleExplode) {
      onToggleExplode();
    }
  };

  return (
    <Card 
      className="mb-3 shadow-md bg-card cursor-pointer"
      onDoubleClick={handleDoubleClick}
      aria-label={`Grouped pumps for model ${model}, total ${totalQuantity}. Double-click to see details.`}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          {model} (Total: {totalQuantity})
        </CardTitle>
        {onToggleExplode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={handleExplodeClick}
                  aria-label="Show individual pumps"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show individual pumps</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-0 flex flex-wrap gap-2">
        {Object.entries(customerCounts).map(([customer, count]) => (
          <Button
            key={customer}
            variant="secondary"
            size="sm"
            className="text-xs h-auto py-1 px-2 cursor-grab"
            draggable={true}
            onDragStart={(e) => handleDragStart(e, customer)}
            aria-label={`Drag ${count} ${model} pumps for customer ${customer}`}
          >
            <span className="mr-1">•</span> {customer}: {count}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
