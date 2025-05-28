
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Pump } from '@/types';

interface GroupedKanbanCardProps {
  model: string;
  pumpsInGroup: Pump[];
  onDragStartCustomerGroup: (event: React.DragEvent<HTMLButtonElement>, pumpsToDrag: Pump[]) => void;
}

export function GroupedKanbanCard({ model, pumpsInGroup, onDragStartCustomerGroup }: GroupedKanbanCardProps) {
  const totalQuantity = pumpsInGroup.length;

  const customerCounts = pumpsInGroup.reduce((acc, pump) => {
    acc[pump.customer] = (acc[pump.customer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, customer: string) => {
    const pumpsForThisCustomerAndModel = pumpsInGroup.filter(p => p.customer === customer);
    onDragStartCustomerGroup(e, pumpsForThisCustomerAndModel);
  };

  return (
    <Card className="mb-3 shadow-md bg-card">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-semibold">
          {model} (Total: {totalQuantity})
        </CardTitle>
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
