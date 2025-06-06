
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
  onDragEnd?: (event: React.DragEvent<HTMLButtonElement>) => void; // Added onDragEnd prop
  onOpenGroupDetailsModal?: (model: string, pumpsInGroup: Pump[]) => void;
  onToggleExplode?: () => void;
}

export function GroupedKanbanCard({ 
  model, 
  pumpsInGroup, 
  onDragStartCustomerGroup,
  onDragEnd, // Consuming onDragEnd
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
      className="glass-card w-[16.75rem] group"
      onDoubleClick={handleDoubleClick}
      aria-label={`Grouped pumps for model ${model}, total ${totalQuantity}. Double-click to see details.`}
    >
      <CardHeader className="glass-card-header">
        <CardTitle className="glass-card-title text-base">
          {model} (Total: {totalQuantity})
        </CardTitle>
        {onToggleExplode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass-button h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={handleExplodeClick}
                  aria-label="Show individual pumps"
                >
                  <Layers className="h-4 w-4" style={{color: 'var(--glass-accent-blue)'}} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="glass-button">
                <p>Show individual pumps</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="glass-card-content flex flex-wrap gap-2">
        {Object.entries(customerCounts).map(([customer, count]) => (
          <Button
            key={customer}
            variant="secondary"
            size="sm"
            className="glass-button text-xs h-auto py-1 px-2 cursor-grab active:cursor-grabbing"
            style={{
              background: 'var(--glass-surface-active)',
              color: 'var(--glass-text-primary)',
              border: '1px solid var(--glass-border)'
            }}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, customer)}
            onDragEnd={onDragEnd}
            aria-label={`Drag ${count} ${model} pumps for customer ${customer}`}
          >
            <span className="mr-1" style={{color: 'var(--glass-accent-blue)'}}>•</span> {customer}: {count}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

