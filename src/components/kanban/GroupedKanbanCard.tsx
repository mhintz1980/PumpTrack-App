
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Pump } from '@/types';

interface GroupedKanbanCardProps {
  model: string;
  pumpsInGroup: Pump[];
  // onClickCustomer?: (customer: string, model: string) => void; // For future interaction
}

export function GroupedKanbanCard({ model, pumpsInGroup }: GroupedKanbanCardProps) {
  const totalQuantity = pumpsInGroup.length;

  const customerCounts = pumpsInGroup.reduce((acc, pump) => {
    acc[pump.customer] = (acc[pump.customer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
            className="text-xs h-auto py-1 px-2"
            // onClick={() => onClickCustomer?.(customer, model)} // Future interaction
          >
            <span className="mr-1">•</span> {customer}: {count}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
