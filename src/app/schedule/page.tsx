
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, Package, Clock, Users, FileText, GripVertical, XCircle, RotateCcw, SearchIcon, FilterX, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';
import type { Pump, PriorityLevel } from '@/types';
import { PUMP_MODELS, CUSTOMER_NAMES, PRIORITY_LEVELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface PlannablePump extends Pump {
  daysPerUnit: number;
}

interface ScheduledPump extends PlannablePump {
  scheduledOnDayIndex: number;
  instanceId: string;
}

interface ScheduleTimelineEntry extends ScheduledPump {
  startDay: number;
  endDay: number;
  duration: number;
}

interface ScheduleFilters {
  customer: string[];
  poNumber: string[];
  model: string[];
  priority: string[];
}

type DraggedItemData =
  | { type: 'plannable-single'; item: PlannablePump }
  | { type: 'plannable-batch'; items: PlannablePump[] }
  | { type: 'scheduled'; item: ScheduledPump };


const generateId = () => crypto.randomUUID();
const generateRandomSerialNumber = () => `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

const getDaysPerUnit = (model: string): number => {
  if (model.includes('DD4') || model.includes('RL200')) return 2;
  if (model.includes('DD6') || model.includes('RL300')) return 3;
  if (model.includes('HC150') || model.includes('DV6')) return 4;
  return 2;
};

export default function SchedulePage() {
  const { toast } = useToast();
  const [initialPumps, setInitialPumps] = useState<Pump[]>([]);
  const [plannableItems, setPlannableItems] = useState<PlannablePump[]>([]);
  const [scheduledItems, setScheduledItems] = useState<ScheduledPump[]>([]);

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [filters, setFilters] = useState<ScheduleFilters>({
    customer: [],
    poNumber: [],
    model: [],
    priority: [],
  });

  const [draggedItemData, setDraggedItemData] = useState<DraggedItemData | null>(null);
  const [selectedPlannableItemIds, setSelectedPlannableItemIds] = useState<string[]>([]);


  useEffect(() => {
    const now = new Date().toISOString();
    const samplePumps: Pump[] = [
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO-PLAN-001', currentStage: 'open-jobs', priority: 'high', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[1], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO-PLAN-002', currentStage: 'assembly', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[2], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO-PLAN-003', currentStage: 'fabrication', priority: 'urgent', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO-PLAN-004', currentStage: 'testing', powderCoater: 'Acme Powder Coating', powderCoatColor: 'RAL 9005', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[3], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[3], poNumber: 'PO-PLAN-005', currentStage: 'powder-coat', powderCoater: 'Best Finishers Inc.', powderCoatColor: 'RAL 7035', priority: 'high', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[4], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO-PLAN-006', currentStage: 'open-jobs', priority: 'normal', notes: 'Needs special part', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[1], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO-PLAN-001', currentStage: 'open-jobs', priority: 'high', createdAt: now, updatedAt: now },
    ];
    setInitialPumps(samplePumps);
  }, []);

  useEffect(() => {
    const nonShippedPumps = initialPumps.filter(p => p.currentStage !== 'shipped');
    const augmentedPumps: PlannablePump[] = nonShippedPumps
      .map(p => ({ ...p, daysPerUnit: getDaysPerUnit(p.model) }))
      .filter(p => !scheduledItems.some(sp => sp.id === p.id));
    setPlannableItems(augmentedPumps);
  }, [initialPumps, scheduledItems]);

  const filteredPlannableItems = useMemo(() => {
    let tempItems = [...plannableItems];

    if (globalSearchTerm) {
      const lowerSearchTerm = globalSearchTerm.toLowerCase();
      tempItems = tempItems.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(lowerSearchTerm)
        )
      );
    }

    return tempItems.filter(item =>
      (filters.customer.length === 0 || filters.customer.includes(item.customer)) &&
      (filters.poNumber.length === 0 || filters.poNumber.some(po => item.poNumber.toLowerCase().includes(po.toLowerCase()))) &&
      (filters.model.length === 0 || filters.model.includes(item.model)) &&
      (filters.priority.length === 0 || filters.priority.includes(item.priority || 'normal'))
    );
  }, [plannableItems, filters, globalSearchTerm]);

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay()); // Start from Sunday of the current week
    for (let i = 0; i < 42; i++) { // Display 6 weeks
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  const scheduleTimeline = useMemo(() => {
    const timeline: ScheduleTimelineEntry[] = [];
    scheduledItems.sort((a, b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex).forEach(item => {
      const startDay = item.scheduledOnDayIndex;
      const duration = item.daysPerUnit;

      timeline.push({
        ...item,
        startDay: startDay,
        endDay: startDay + duration - 1,
        duration,
      });
    });
    return timeline.sort((a, b) => a.startDay - b.startDay);
  }, [scheduledItems]);

  const totalScheduledDaysDuration = useMemo(() => {
    return scheduledItems.reduce((sum, item) => sum + item.daysPerUnit, 0);
  }, [scheduledItems]);

  const handleTogglePlannableItemSelect = useCallback((itemId: string) => {
    setSelectedPlannableItemIds(prevSelectedIds =>
      prevSelectedIds.includes(itemId)
        ? prevSelectedIds.filter(id => id !== itemId)
        : [...prevSelectedIds, itemId]
    );
  }, []);

  const handleToggleSelectAllPlannableItems = useCallback(() => {
    const allFilteredIds = filteredPlannableItems.map(item => item.id);
    const allCurrentlySelected = selectedPlannableItemIds.length > 0 && allFilteredIds.every(id => selectedPlannableItemIds.includes(id));

    if (allCurrentlySelected) {
      // Deselect all filtered items
      setSelectedPlannableItemIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered items (add to existing selection without removing others)
      setSelectedPlannableItemIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  }, [filteredPlannableItems, selectedPlannableItemIds]);


  const handleDragStartPlannableItem = useCallback((e: React.DragEvent, item: PlannablePump) => {
    // If the dragged item is selected and multiple items are selected, drag the batch
    if (selectedPlannableItemIds.includes(item.id) && selectedPlannableItemIds.length > 1) {
      const batchItemsToDrag = plannableItems.filter(p => selectedPlannableItemIds.includes(p.id));
      setDraggedItemData({ type: 'plannable-batch', items: batchItemsToDrag });
      e.dataTransfer.setData('application/pumptrack-item-ids', JSON.stringify(batchItemsToDrag.map(bi => bi.id)));
    } else {
      // Otherwise, drag the single item
      setDraggedItemData({ type: 'plannable-single', item });
      e.dataTransfer.setData('application/pumptrack-item-id', item.id);
      // Ensure only this item is 'selected' for the purpose of this drag if it wasn't part of a multi-select
      if (!selectedPlannableItemIds.includes(item.id)) {
          setSelectedPlannableItemIds([item.id]);
      }
    }
    e.dataTransfer.effectAllowed = 'move';
  }, [selectedPlannableItemIds, plannableItems]);


  const handleDragStartScheduledItem = useCallback((e: React.DragEvent, item: ScheduledPump) => {
    setDraggedItemData({ type: 'scheduled', item });
    e.dataTransfer.setData('application/pumptrack-instance-id', item.instanceId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropOnCalendar = useCallback((e: React.DragEvent<HTMLDivElement>, targetDayIndex: number) => {
    e.preventDefault();
    if (!draggedItemData) return;

    let itemsToSchedule: PlannablePump[] = [];
    let toastMessage = "";

    if (draggedItemData.type === 'plannable-single') {
      itemsToSchedule = [draggedItemData.item];
      toastMessage = `${draggedItemData.item.serialNumber || draggedItemData.item.model} added to schedule.`;
    } else if (draggedItemData.type === 'plannable-batch') {
      itemsToSchedule = draggedItemData.items;
      toastMessage = `${draggedItemData.items.length} pumps added to schedule.`;
    } else if (draggedItemData.type === 'scheduled') {
      const scheduledDraggedItem = draggedItemData.item;
      setScheduledItems(prev => prev.map(si =>
        si.instanceId === scheduledDraggedItem.instanceId
          ? { ...si, scheduledOnDayIndex: targetDayIndex }
          : si
      ).sort((a, b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex));
      toast({ title: "Schedule Updated", description: `Rescheduled ${scheduledDraggedItem.serialNumber || scheduledDraggedItem.model}.` });
      setDraggedItemData(null);
      return;
    }

    if (itemsToSchedule.length > 0) {
      const newScheduledItems: ScheduledPump[] = itemsToSchedule.map(item => ({
        ...item,
        scheduledOnDayIndex: targetDayIndex, // All items in batch start on the same target day for now
        instanceId: crypto.randomUUID(),
      }));

      setScheduledItems(prev => [...prev, ...newScheduledItems].sort((a, b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex));
      // Plannable items will be updated via useEffect dependency on scheduledItems
      toast({ title: "Pumps Scheduled", description: toastMessage });
      setSelectedPlannableItemIds([]); // Clear selection after scheduling
    }

    setDraggedItemData(null);
  }, [draggedItemData, toast, plannableItems]);


  const handleDropOnPlannableList = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItemData || draggedItemData.type !== 'scheduled') return;

    const scheduledDraggedItem = draggedItemData.item;
    setScheduledItems(prev => prev.filter(item => item.instanceId !== scheduledDraggedItem.instanceId));
    toast({ title: "Pump Unscheduled", description: `${scheduledDraggedItem.serialNumber || scheduledDraggedItem.model} removed from schedule.` });
    setDraggedItemData(null);
    setSelectedPlannableItemIds([]);
  }, [draggedItemData, toast]);

  const removeFromSchedule = useCallback((instanceIdToRemove: string) => {
    const itemToRemove = scheduledItems.find(si => si.instanceId === instanceIdToRemove);
    setScheduledItems(prev => prev.filter(item => item.instanceId !== instanceIdToRemove));
    if (itemToRemove) {
      toast({ title: "Pump Unscheduled", description: `${itemToRemove.serialNumber || itemToRemove.model} removed from schedule.` });
    }
    setSelectedPlannableItemIds([]);
  }, [scheduledItems, toast]);

  const resetSchedule = useCallback(() => {
    setScheduledItems([]);
    setSelectedPlannableItemIds([]);
    toast({ title: "Schedule Reset", description: "All pumps removed from schedule and returned to plannable list." });
  }, [toast]);

  const handleClearFilters = useCallback(() => {
    setGlobalSearchTerm('');
    setFilters({
      customer: [],
      poNumber: [],
      model: [],
      priority: [],
    });
    toast({ title: "Filters Cleared" });
  }, [toast]);

  const getPriorityBadgeVariant = (priority?: PriorityLevel): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      default: return 'outline';
    }
  };

  const modelColors = PUMP_MODELS.reduce((acc, model, index) => {
    const colorClasses = [
      'bg-sky-500/80 border-sky-600',
      'bg-emerald-500/80 border-emerald-600',
      'bg-amber-500/80 border-amber-600',
      'bg-rose-500/80 border-rose-600',
      'bg-indigo-500/80 border-indigo-600',
      'bg-pink-500/80 border-pink-600',
      'bg-teal-500/80 border-teal-600',
      'bg-cyan-500/80 border-cyan-600',
      'bg-lime-500/80 border-lime-600',
    ];
    acc[model] = colorClasses[index % colorClasses.length];
    return acc;
  }, {} as Record<string, string>);

  const getColorForModelOnCalendar = (model: string) => {
    return modelColors[model] || 'bg-muted/70 border-muted-foreground';
  };

  const availableCustomers = useMemo(() => [...new Set(initialPumps.map(p => p.customer))].map(c => ({ label: c, value: c })), [initialPumps]);
  const availableModels = useMemo(() => PUMP_MODELS.map(m => ({ label: m, value: m })), []);
  const availablePriorities = useMemo(() => PRIORITY_LEVELS.map(p => ({ label: p.label, value: p.value })), []);
  const availablePONumbers = useMemo(() => [...new Set(initialPumps.map(p => p.poNumber))].map(po => ({ label: po, value: po })), [initialPumps]);

  const totalPlannablePumps = plannableItems.length;
  const isAnyFilterActive = globalSearchTerm !== '' || Object.values(filters).some(f => f.length > 0);


  const PlannablePumpsTable = () => {
    const allFilteredVisibleSelected = filteredPlannableItems.length > 0 && filteredPlannableItems.every(item => selectedPlannableItemIds.includes(item.id));
    // For indeterminate state, we'd need a more complex Checkbox or an icon
    // For now, SelectAllCheckbox is checked if all visible are selected.
    
    return (
    <Card>
      <CardHeader>
        <CardTitle>Pumps to Schedule</CardTitle>
        <CardDescription>Drag pumps from this table to the calendar. Pumps not yet scheduled.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search all fields..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Combobox
            options={availableCustomers}
            value={filters.customer}
            onChange={(value) => setFilters(prev => ({ ...prev, customer: value as string[] }))}
            placeholder="Filter by Customer"
            searchPlaceholder="Search customers..."
            emptyText="No customer found."
            multiple
          />
          <Combobox
            options={availableModels}
            value={filters.model}
            onChange={(value) => setFilters(prev => ({ ...prev, model: value as string[] }))}
            placeholder="Filter by Model"
            searchPlaceholder="Search models..."
            emptyText="No model found."
            multiple
          />
          <Combobox
            options={availablePONumbers}
            value={filters.poNumber}
            onChange={(value) => setFilters(prev => ({ ...prev, poNumber: value as string[] }))}
            placeholder="Filter by PO Number"
            searchPlaceholder="Search POs..."
            emptyText="No PO found."
            multiple
            allowCustomValue 
          />
          <Combobox
            options={availablePriorities}
            value={filters.priority}
            onChange={(value) => setFilters(prev => ({ ...prev, priority: value as string[] }))}
            placeholder="Filter by Priority"
            searchPlaceholder="Search priorities..."
            emptyText="No priority found."
            multiple
          />
        </div>
        {isAnyFilterActive && (
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <FilterX className="mr-2 h-4 w-4" /> Clear All Filters
            </Button>
          </div>
        )}

        <ScrollArea
          className="h-[400px] border rounded-md"
          onDragOver={handleDragOver}
          onDrop={handleDropOnPlannableList}
        >
          <div className="p-1">
            {filteredPlannableItems.length === 0 ? (
              <p className="text-center p-4 text-muted-foreground">No plannable items match filters or all are scheduled.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted z-10">
                  <tr className="border-b">
                    <th className="p-2 w-10 text-center">
                      <Checkbox
                        id="select-all-plannable"
                        checked={allFilteredVisibleSelected}
                        onCheckedChange={handleToggleSelectAllPlannableItems}
                        aria-label="Select all plannable items"
                      />
                    </th>
                    <th className="p-1 w-8"></th>
                    <th className="text-left p-2 font-semibold">S/N</th>
                    <th className="text-left p-2 font-semibold">Customer</th>
                    <th className="text-left p-2 font-semibold">PO</th>
                    <th className="text-left p-2 font-semibold">Model</th>
                    <th className="text-right p-2 font-semibold">Days/Unit</th>
                    <th className="text-center p-2 font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlannableItems.map(item => (
                    <tr
                      key={item.id} 
                      className={cn(
                        "border-b hover:bg-secondary/30 cursor-grab",
                        selectedPlannableItemIds.includes(item.id) && "bg-primary/10"
                      )}
                      draggable
                      onDragStart={(e) => handleDragStartPlannableItem(e, item)}
                      onClick={() => handleTogglePlannableItemSelect(item.id)} // Allow clicking row to select
                    >
                      <td className="p-2 text-center">
                        <Checkbox
                          id={`select-item-${item.id}`}
                          checked={selectedPlannableItemIds.includes(item.id)}
                          onCheckedChange={() => handleTogglePlannableItemSelect(item.id)}
                          onClick={(e) => e.stopPropagation()} // Prevent row click from also firing
                          aria-label={`Select item ${item.serialNumber || item.model}`}
                        />
                      </td>
                      <td className="p-1 text-center text-muted-foreground"><GripVertical className="h-4 w-4 inline-block" /></td>
                      <td className="p-2">{item.serialNumber || 'N/A'}</td>
                      <td className="p-2">{item.customer}</td>
                      <td className="p-2">{item.poNumber}</td>
                      <td className="p-2">{item.model}</td>
                      <td className="p-2 text-right">{item.daysPerUnit}</td>
                      <td className="p-2 text-center">
                        <Badge variant={getPriorityBadgeVariant(item.priority)} className="text-xs">
                          {PRIORITY_LEVELS.find(p => p.value === item.priority)?.label || item.priority}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )};

  const CalendarView = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Production Schedule</CardTitle>
            <CardDescription>
              Total duration of scheduled items: {totalScheduledDaysDuration} days.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={resetSchedule} title="Clear all items from schedule">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-1 rounded-sm bg-muted/50">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 min-h-[300px]">
          {calendarDays.map((date, dayIndex) => {
            const dayString = date.toDateString();
            return (
              <div
                key={dayString}
                className={cn(
                  "h-32 border rounded-sm p-1 text-xs relative flex flex-col overflow-hidden bg-background hover:bg-muted/30",
                  date.getMonth() !== new Date().getMonth() && "bg-muted/20 text-muted-foreground/60"
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnCalendar(e, dayIndex)}
              >
                <div className={cn("font-medium pb-0.5 text-right", date.toDateString() === new Date().toDateString() && "text-primary font-bold")}>{date.getDate()}</div>
                <ScrollArea className="flex-grow space-y-0.5">
                  {scheduleTimeline
                    .filter(item => dayIndex >= item.startDay && dayIndex <= item.endDay)
                    .map(item => {
                      if (dayIndex === item.startDay) { 
                        return (
                          <div
                            key={item.instanceId} 
                            draggable
                            onDragStart={(e) => handleDragStartScheduledItem(e, item)}
                            title={`${item.model} - ${item.serialNumber || 'N/A'}\nCustomer: ${item.customer}\nPO: ${item.poNumber}\nDuration: ${item.duration} days`}
                            className={cn(
                              "text-[10px] p-1 rounded mb-0.5 cursor-grab text-primary-foreground leading-tight border",
                              getColorForModelOnCalendar(item.model),
                              "overflow-hidden" 
                            )}
                            style={{
                              height: `calc(${item.duration * 1.5}rem - 2px)`, 
                              minHeight: '1.4rem',
                              maxHeight: 'calc(100% - 1.25rem)',
                            }}
                          >
                            <p className="font-semibold truncate">{item.model}</p>
                            <p className="truncate text-xs">{item.serialNumber || 'N/A'}</p>
                            <p className="truncate text-[9px] opacity-80">{item.customer}</p>
                          </div>
                        );
                      } else { 
                        return null;
                      }
                    })}
                </ScrollArea>
              </div>
            );
          })}
        </div>

        {scheduledItems.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2 text-base">Currently Scheduled Items ({scheduledItems.length}):</h4>
            <ScrollArea className="h-[200px] border rounded-md p-2 space-y-2">
              {scheduledItems.map((item) => (
                <Card key={item.instanceId} className="p-2 shadow-sm bg-card hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{item.model} - {item.serialNumber || 'N/A'}</p>
                      <p className="text-[10px] text-muted-foreground">Cust: {item.customer} | PO: {item.poNumber} | Days: {item.daysPerUnit}</p>
                      <p className="text-[10px] text-muted-foreground">Scheduled on: {calendarDays[item.scheduledOnDayIndex]?.toLocaleDateString() || 'N/A'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive/80"
                      onClick={() => removeFromSchedule(item.instanceId)}
                      aria-label="Remove from schedule"
                    >
                      <XCircle size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-background text-foreground">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-primary">Production Planning & Schedule</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <Package size={16} />
            <span>Total Plannable Pumps: {totalPlannablePumps}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>Total Scheduled Duration: {totalScheduledDaysDuration} days</span>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-grow">
        <div className="space-y-6">
          <Separator className="my-6" />
          <section>
            <PlannablePumpsTable />
          </section>
          <Separator className="my-6" />
          <section>
            <CalendarView />
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

