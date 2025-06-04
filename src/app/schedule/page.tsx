
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Pump, StageId, PriorityLevel } from '@/types';
import { PUMP_MODELS, CUSTOMER_NAMES, PRIORITY_LEVELS, STAGES, DEFAULT_POWDER_COAT_COLORS, POWDER_COATERS } from '@/lib/constants'; // Added POWDER_COATERS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Temporary utility functions - ideally from a shared lib or service
const generateId = () => crypto.randomUUID();
const generateRandomSerialNumber = () => `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

export default function SchedulePage() {
  const [allPumps, setAllPumps] = useState<Pump[]>([]);

  useEffect(() => {
    const now = new Date().toISOString();
    // Same sample data generation as HomePage for consistency during development
    const initialSamplePumps: Pump[] = [
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO123', currentStage: 'open-jobs', notes: 'Initial inspection pending.', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[1], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO456', currentStage: 'assembly', notes: 'Waiting for part XYZ.', priority: 'high', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO788', currentStage: 'open-jobs', notes: 'Urgent.', priority: 'urgent', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[2], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO789', currentStage: 'testing', powderCoater: POWDER_COATERS[0], powderCoatColor: DEFAULT_POWDER_COAT_COLORS[0], notes: 'High pressure test passed.', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[3], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[3], poNumber: 'PO124', currentStage: 'powder-coat', powderCoater: POWDER_COATERS[1], powderCoatColor: DEFAULT_POWDER_COAT_COLORS[1], priority: 'high', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO101', currentStage: 'open-jobs', notes: 'Needs quick turnaround', priority: 'urgent', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[4], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[4], poNumber: 'PO567', currentStage: 'fabrication', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO202', currentStage: 'open-jobs', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[1], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[3], poNumber: 'PO333', currentStage: 'shipped', notes: 'Delivered.', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[2], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO444', currentStage: 'shipped', notes: 'Delivered.', priority: 'normal', createdAt: now, updatedAt: now },
    ];
    setAllPumps(initialSamplePumps);
  }, []);

  const plannablePumps = useMemo(() => {
    return allPumps.filter(pump => pump.currentStage !== 'shipped');
  }, [allPumps]);

  const summaryStats = useMemo(() => {
    const totalPumpsLeft = plannablePumps.length;

    const pumpsPerModel = plannablePumps.reduce((acc, pump) => {
      acc[pump.model] = (acc[pump.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pumpsPerCustomer = plannablePumps.reduce((acc, pump) => {
      acc[pump.customer] = (acc[pump.customer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pumpsPerPO = plannablePumps.reduce((acc, pump) => {
      acc[pump.poNumber] = (acc[pump.poNumber] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalPumpsLeft, pumpsPerModel, pumpsPerCustomer, pumpsPerPO };
  }, [plannablePumps]);


  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-background text-foreground">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-primary">Production Planning & Schedule</h1>
        <p className="text-muted-foreground mt-1">
          View outstanding pumps and plan production schedules.
        </p>
      </header>

      <ScrollArea className="flex-grow">
        <div className="space-y-6">
          {/* Summary Section */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Summary Counts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Pumps Left</CardTitle>
                  <CardDescription>Excluding shipped pumps</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-accent">{summaryStats.totalPumpsLeft}</p>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-1 lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pumps Left by Model</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-4 gap-y-2">
                  {Object.entries(summaryStats.pumpsPerModel).length > 0 ? (
                    Object.entries(summaryStats.pumpsPerModel).map(([model, count]) => (
                      <div key={model} className="flex items-center">
                        <span className="text-sm font-medium mr-2">{model}:</span>
                        <Badge variant="secondary" className="text-sm">{count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No pumps to plan.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pumps Left by Customer</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-4 gap-y-2">
                  {Object.entries(summaryStats.pumpsPerCustomer).length > 0 ? (
                    Object.entries(summaryStats.pumpsPerCustomer).map(([customer, count]) => (
                     <div key={customer} className="flex items-center">
                        <span className="text-sm font-medium mr-2">{customer}:</span>
                        <Badge variant="outline" className="text-sm">{count}</Badge>
                      </div>
                    ))
                  ) : (
                     <p className="text-sm text-muted-foreground">No pumps to plan.</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pumps Left by Purchase Order</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-4 gap-y-2">
                  {Object.entries(summaryStats.pumpsPerPO).length > 0 ? (
                    Object.entries(summaryStats.pumpsPerPO).map(([po, count]) => (
                      <div key={po} className="flex items-center">
                        <span className="text-sm font-medium mr-2">{po}:</span>
                        <Badge variant="outline" className="text-sm">{count}</Badge>
                      </div>
                    ))
                  ): (
                     <p className="text-sm text-muted-foreground">No pumps to plan.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-6" />

          {/* Placeholder for Pivot Table / Slicer Combo */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Pump Data Explorer</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Pivot table and slicer functionality will be implemented here.
                  For now, you can view the list of plannable pumps below.
                </p>
              </CardContent>
            </Card>
             <div className="mt-4 space-y-2">
                {plannablePumps.map(pump => (
                    <Card key={pump.id} className="p-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{pump.model} - {pump.customer}</p>
                                <p className="text-xs text-muted-foreground">
                                    S/N: {pump.serialNumber || 'N/A'} | PO: {pump.poNumber} | Stage: {STAGES.find(s=>s.id === pump.currentStage)?.title} | Priority: {pump.priority}
                                </p>
                            </div>
                            {/* Add scheduling button/checkbox here later */}
                        </div>
                    </Card>
                ))}
            </div>
          </section>

          <Separator className="my-6" />

          {/* Placeholder for Calendar */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Production Calendar</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Interactive scheduling calendar will be implemented here.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

    