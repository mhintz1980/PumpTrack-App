
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, Package, Clock, Users, FileText, GripVertical, XCircle, RotateCcw, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Pump, PriorityLevel, Filters } from '@/types';
import { PUMP_MODELS, CUSTOMER_NAMES, PRIORITY_LEVELS, POWDER_COATERS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { SchedulePumpCard } from '@/components/schedule/SchedulePumpCard';
import { PumpDetailsModal } from '@/components/pump/PumpDetailsModal';
import { EnhancedHeader } from '@/components/layout/EnhancedHeader';
import { AddPumpForm } from '@/components/pump/AddPumpForm';
import * as pumpService from '@/services/pumpService'; // Import pumpService

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

type DraggedItemType = 'plannable-single' | 'plannable-batch' | 'scheduled';

interface DraggedPlannableSingle {
  type: 'plannable-single';
  item: PlannablePump;
}
interface DraggedPlannableBatch {
  type: 'plannable-batch';
  items: PlannablePump[];
}
interface DraggedScheduled {
  type: 'scheduled';
  item: ScheduledPump;
}
type DraggedItemData = DraggedPlannableSingle | DraggedPlannableBatch | DraggedScheduled;


const getDaysPerUnit = (model: string): number => {
  if (model.includes('DD4') || model.includes('RL200')) return 2;
  if (model.includes('DD6') || model.includes('RL300')) return 3;
  if (model.includes('HC150') || model.includes('DV6')) return 4;
  return 2; // Default
};

export default function SchedulePage() {
  const { toast } = useToast();
  const [initialPumps, setInitialPumps] = useState<Pump[]>([]);
  const [plannableItems, setPlannableItems] = useState<PlannablePump[]>([]);
  const [scheduledItems, setScheduledItems] = useState<ScheduledPump[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({});

  const [isAddPumpModalOpen, setIsAddPumpModalOpen] = useState(false);

  const [draggedItemData, setDraggedItemData] = useState<DraggedItemData | null>(null);
  const [selectedPlannableItemIds, setSelectedPlannableItemIds] = useState<string[]>([]);

  const [selectedPumpForDetails, setSelectedPumpForDetails] = useState<PlannablePump | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPumps = async () => {
      setIsLoading(true);
      try {
        // For now, we use pumpService.getAllPumps which might return sample data or empty array
        // In future, this could fetch pumps that are specifically 'open-jobs' or not yet 'shipped'
        // or all pumps and then filter client-side.
        const fetchedPumps = await pumpService.getAllPumps(); 
        // If getAllPumps returns empty (as it does by default), let's add some sample data for schedule page.
        if (fetchedPumps.length === 0) {
            const now = new Date().toISOString();
            const samplePumpsForSchedule: Pump[] = [
              { id: crypto.randomUUID(), model: PUMP_MODELS[0], serialNumber: `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`, customer: CUSTOMER_NAMES[0], poNumber: 'PO-PLAN-001', currentStage: 'open-jobs', priority: 'high', createdAt: now, updatedAt: now },
              { id: crypto.randomUUID(), model: PUMP_MODELS[1], serialNumber: `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`, customer: CUSTOMER_NAMES[1], poNumber: 'PO-PLAN-002', currentStage: 'assembly', priority: 'normal', createdAt: now, updatedAt: now },
              { id: crypto.randomUUID(), model: PUMP_MODELS[2], serialNumber: `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`, customer: CUSTOMER_NAMES[0], poNumber: 'PO-PLAN-003', currentStage: 'fabrication', priority: 'urgent', createdAt: now, updatedAt: now },
            ];
            setInitialPumps(samplePumpsForSchedule);
        } else {
            setInitialPumps(fetchedPumps);
        }
      } catch (error) {
        console.error("Failed to fetch pumps for schedule:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load pump data for scheduling." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPumps();
  }, [toast]);


  useEffect(() => {
    // Filter out pumps that are 'shipped' or already on the schedule from initialPumps
    const scheduledPumpOriginalIds = new Set(scheduledItems.map(si => si.id));
    const availableForPlanning = initialPumps.filter(p => 
        p.currentStage !== 'shipped' && 
        !scheduledPumpOriginalIds.has(p.id)
    );
    const augmentedPumps: PlannablePump[] = availableForPlanning.map(p => ({ 
      ...p, 
      daysPerUnit: getDaysPerUnit(p.model) 
    }));
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

    if (filters.serialNumber && filters.serialNumber.length > 0) {
      tempItems = tempItems.filter(p => p.serialNumber && filters.serialNumber!.some(sn => p.serialNumber!.toLowerCase().includes(sn.toLowerCase())));
    }
    if (filters.customer && filters.customer.length > 0) {
      tempItems = tempItems.filter(p => filters.customer!.includes(p.customer));
    }
    if (filters.poNumber && filters.poNumber.length > 0) {
      tempItems = tempItems.filter(p => p.poNumber && filters.poNumber!.some(po => p.poNumber.toLowerCase().includes(po.toLowerCase())));
    }
    if (filters.model && filters.model.length > 0) {
      tempItems = tempItems.filter(p => filters.model!.includes(p.model));
    }
    if (filters.powderCoater && filters.powderCoater.length > 0) {
      tempItems = tempItems.filter(p => p.powderCoater && filters.powderCoater!.includes(p.powderCoater));
    }
    if (filters.priority && filters.priority.length > 0) {
      tempItems = tempItems.filter(p => filters.priority!.includes(p.priority || 'normal'));
    }

    return tempItems;
  }, [plannableItems, filters, globalSearchTerm]);

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay()); 
    for (let i = 0; i < 42; i++) { 
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

  const handlePlannableItemClick = useCallback((item: PlannablePump, event: React.MouseEvent) => {
    setSelectedPlannableItemIds(prevSelectedIds => {
      if (event.ctrlKey || event.metaKey) {
        return prevSelectedIds.includes(item.id)
          ? prevSelectedIds.filter(id => id !== item.id)
          : [...prevSelectedIds, item.id];
      }
      return prevSelectedIds.includes(item.id) && prevSelectedIds.length === 1 ? [] : [item.id];
    });
  }, []);


  const handleDragStartPlannableItem = useCallback((e: React.DragEvent, item: PlannablePump) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
    
    setTimeout(() => {
      if (selectedPlannableItemIds.includes(item.id) && selectedPlannableItemIds.length > 1) {
        const batchItems = plannableItems.filter(p => selectedPlannableItemIds.includes(p.id));
        setDraggedItemData({ type: 'plannable-batch', items: batchItems });
      } else {
        setDraggedItemData({ type: 'plannable-single', item });
        setSelectedPlannableItemIds([item.id]); // Ensure single dragged item is also "selected" for consistency
      }
    }, 0);
  }, [selectedPlannableItemIds, plannableItems]);


  const handleDragStartScheduledItem = useCallback((e: React.DragEvent, item: ScheduledPump) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/pumptrack-instance-id', item.instanceId);
    e.dataTransfer.setData('text/plain', item.instanceId); 
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
    
    setTimeout(() => {
      setDraggedItemData({ type: 'scheduled', item });
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const draggedDOMElement = e.currentTarget as HTMLElement;
    if (draggedDOMElement) {
      draggedDOMElement.style.opacity = '1';
    }
    if (draggedItemData) {
        setDraggedItemData(null);
    }
  }, [draggedItemData]);


  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move'; 
  }, []);

  const handleDropOnCalendar = useCallback((e: React.DragEvent<HTMLDivElement>, targetDayIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentDraggedItem = draggedItemData; 
    if (!currentDraggedItem) {
      // Fallback for safety, though setTimeout should make draggedItemData reliable
      const idFromDataTransfer = e.dataTransfer.getData('text/plain');
      const itemToScheduleFromPlannable = plannableItems.find(p => p.id === idFromDataTransfer);
      if (idFromDataTransfer && itemToScheduleFromPlannable) {
         setScheduledItems(prev => {
            const filteredPrev = prev.filter(si => si.id !== itemToScheduleFromPlannable.id);
            return [...filteredPrev, {
              ...itemToScheduleFromPlannable,
              scheduledOnDayIndex: targetDayIndex,
              instanceId: crypto.randomUUID(),
            }].sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex);
          });
          toast({ title: "Pump Scheduled (Fallback)", description: `${itemToScheduleFromPlannable.serialNumber || itemToScheduleFromPlannable.model} added to schedule.` });
          setSelectedPlannableItemIds([]); 
          setDraggedItemData(null);
          return;
      } else {
          const scheduledItemInstanceId = e.dataTransfer.getData('application/pumptrack-instance-id');
          const itemToMoveFromScheduled = scheduledItems.find(si => si.instanceId === scheduledItemInstanceId);
          if (scheduledItemInstanceId && itemToMoveFromScheduled) {
             setScheduledItems(prev => prev.map(si =>
                si.instanceId === itemToMoveFromScheduled.instanceId
                ? { ...si, scheduledOnDayIndex: targetDayIndex }
                : si
            ).sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex));
            toast({ title: "Schedule Updated (Fallback)", description: `Rescheduled ${itemToMoveFromScheduled.serialNumber || itemToMoveFromScheduled.model}.` });
            setDraggedItemData(null);
            return;
          }
      }
      setDraggedItemData(null); 
      return;
    }
    
    const dropTargetElement = e.currentTarget as HTMLElement;
    dropTargetElement.classList.remove('bg-primary/10', 'border-primary');

    if (currentDraggedItem.type === 'plannable-single') {
      const itemToSchedule = currentDraggedItem.item;
      setScheduledItems(prev => {
        const filteredPrev = prev.filter(si => si.id !== itemToSchedule.id); // Avoid duplicates of original pump ID
        return [...filteredPrev, {
          ...itemToSchedule,
          scheduledOnDayIndex: targetDayIndex,
          instanceId: crypto.randomUUID(),
        }].sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex);
      });
      toast({ title: "Pump Scheduled", description: `${itemToSchedule.serialNumber || itemToSchedule.model} added to schedule.` });
    } else if (currentDraggedItem.type === 'plannable-batch') {
      const itemsToSchedule = currentDraggedItem.items;
      const newScheduledInstances: ScheduledPump[] = itemsToSchedule.map(item => ({
        ...item,
        scheduledOnDayIndex: targetDayIndex, 
        instanceId: crypto.randomUUID(),
      }));
      
      setScheduledItems(prev => {
        const newScheduledOriginalIds = new Set(newScheduledInstances.map(item => item.id));
        const filteredPrev = prev.filter(si => !newScheduledOriginalIds.has(si.id));
        return [...filteredPrev, ...newScheduledInstances]
          .sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex);
      });
      toast({ title: "Pumps Scheduled", description: `${itemsToSchedule.length} pumps added to schedule.` });
    } else if (currentDraggedItem.type === 'scheduled') {
      const itemToMove = currentDraggedItem.item;
      setScheduledItems(prev => prev.map(si =>
        si.instanceId === itemToMove.instanceId
          ? { ...si, scheduledOnDayIndex: targetDayIndex }
          : si
      ).sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex));
      toast({ title: "Schedule Updated", description: `Rescheduled ${itemToMove.serialNumber || itemToMove.model}.` });
    }
    
    setSelectedPlannableItemIds([]);
    setDraggedItemData(null); 
  }, [draggedItemData, toast, setScheduledItems, setSelectedPlannableItemIds, plannableItems, scheduledItems]);


  const handleDropOnPlannableList = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentDraggedItem = draggedItemData; 
    if (!currentDraggedItem) {
      const instanceIdFromDataTransfer = e.dataTransfer.getData('application/pumptrack-instance-id') || e.dataTransfer.getData('text/plain');
      const itemToRemoveFromSchedule = scheduledItems.find(si => si.instanceId === instanceIdFromDataTransfer);
      if (itemToRemoveFromSchedule) {
        setScheduledItems(prev => prev.filter(item => item.instanceId !== itemToRemoveFromSchedule.instanceId));
        toast({ title: "Pump Unscheduled (Fallback)", description: `${itemToRemoveFromSchedule.serialNumber || itemToRemoveFromSchedule.model} removed from schedule.` });
        setSelectedPlannableItemIds([]);
        setDraggedItemData(null);
        return;
      }
      setDraggedItemData(null);
      return;
    }


    if (currentDraggedItem.type !== 'scheduled') {
      setDraggedItemData(null); 
      return;
    }

    const itemToRemoveFromSchedule = currentDraggedItem.item;
    setScheduledItems(prev => prev.filter(item => item.instanceId !== itemToRemoveFromSchedule.instanceId));
    toast({ title: "Pump Unscheduled", description: `${itemToRemoveFromSchedule.serialNumber || itemToRemoveFromSchedule.model} removed from schedule.` });
    
    setSelectedPlannableItemIds([]);
    setDraggedItemData(null); 
  }, [draggedItemData, toast, setScheduledItems, setSelectedPlannableItemIds, scheduledItems]);

  const removeFromSchedule = useCallback((instanceIdToRemove: string) => {
    const itemToRemove = scheduledItems.find(si => si.instanceId === instanceIdToRemove);
    setScheduledItems(prev => prev.filter(item => item.instanceId !== instanceIdToRemove));
    if (itemToRemove) {
      toast({ title: "Pump Unscheduled", description: `${itemToRemove.serialNumber || itemToRemove.model} removed from schedule.` });
    }
    setSelectedPlannableItemIds([]);
  }, [scheduledItems, toast, setScheduledItems, setSelectedPlannableItemIds]);

  const resetSchedule = useCallback(() => {
    setScheduledItems([]);
    setSelectedPlannableItemIds([]);
    toast({ title: "Schedule Reset", description: "All pumps removed from schedule and returned to plannable list." });
  }, [toast, setScheduledItems, setSelectedPlannableItemIds]);


  const handleOpenDetailsModal = useCallback((pump: PlannablePump) => {
    setSelectedPumpForDetails(pump);
    setIsDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedPumpForDetails(null);
  }, []);

  const handleUpdatePump = useCallback(async (updatedPump: Pump) => {
    const originalPump = initialPumps.find(p => p.id === updatedPump.id);
    if (!originalPump) {
        toast({ variant: "destructive", title: "Update Error", description: "Original pump not found in initial list."});
        return;
    }
    try {
        // Simulate saving to backend
        const savedPump = await pumpService.updatePumpWithActivityLog(updatedPump.id, updatedPump, originalPump);
        setInitialPumps(prev => prev.map(p => p.id === savedPump.id ? savedPump : p));
        setScheduledItems(prevScheduled => prevScheduled.map(sp => 
            sp.id === savedPump.id ? { ...sp, ...savedPump, daysPerUnit: getDaysPerUnit(savedPump.model) } : sp
        ));
        toast({ title: "Pump Updated", description: `${savedPump.serialNumber || savedPump.model} has been updated.` });
    } catch (error) {
        console.error("Error updating pump on schedule page:", error);
        toast({ variant: "destructive", title: "Update Failed", description: "Could not save pump details."});
    }
  }, [toast, initialPumps]);

  const handleAddPumps = useCallback(async (newPumpsData: Array<Omit<Pump, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setIsLoading(true);
    try {
      const addedPumpsPromises = newPumpsData.map(pumpData => pumpService.addPumpWithActivityLog(pumpData));
      const successfullyAddedPumps = await Promise.all(addedPumpsPromises);
      
      setInitialPumps(prev => [...successfullyAddedPumps, ...prev]);
      
      if (successfullyAddedPumps.length === 1) {
        toast({ title: "Pump Added", description: `${successfullyAddedPumps[0].serialNumber || 'New Pump'} added to schedule planning.` });
      } else if (successfullyAddedPumps.length > 1) {
        toast({ title: `${successfullyAddedPumps.length} Pumps Added`, description: `Batch added to schedule planning.` });
      }
    } catch (error) {
      console.error("Error adding pumps:", error);
      toast({ variant: "destructive", title: "Add Failed", description: "Could not add new pump(s)." });
    } finally {
      setIsLoading(false);
      setIsAddPumpModalOpen(false); 
    }
  }, [toast]);


  const modelColors = PUMP_MODELS.reduce((acc, model, index) => {
    const colorClasses = [
      'bg-sky-500/80 border-sky-600', 'bg-emerald-500/80 border-emerald-600',
      'bg-amber-500/80 border-amber-600', 'bg-rose-500/80 border-rose-600',
      'bg-indigo-500/80 border-indigo-600', 'bg-pink-500/80 border-pink-600',
      'bg-teal-500/80 border-teal-600', 'bg-cyan-500/80 border-cyan-600',
      'bg-lime-500/80 border-lime-600',
    ];
    acc[model] = colorClasses[index % colorClasses.length];
    return acc;
  }, {} as Record<string, string>);

  const getColorForModelOnCalendar = (model: string) => modelColors[model] || 'bg-muted/70 border-muted-foreground';
  
  const allPumpModels = PUMP_MODELS;
  const allCustomerNames = CUSTOMER_NAMES;
  const allPriorities = PRIORITY_LEVELS;
  const powderCoatersInPumps = initialPumps.map(p => p.powderCoater).filter((pc): pc is string => typeof pc === 'string' && pc.length > 0);
  const allPowderCoaters = Array.from(new Set(powderCoatersInPumps.concat(POWDER_COATERS))).sort();
  const allSerialNumbers = Array.from(new Set(initialPumps.map(p => p.serialNumber).filter((sn): sn is string => !!sn))).sort();
  const allPONumbers = Array.from(new Set(initialPumps.map(p => p.poNumber).filter(Boolean as unknown as (value: string | undefined) => value is string))).sort();
  const totalPlannablePumps = filteredPlannableItems.length;


  const PlannablePumpsTable = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pumps to Schedule</CardTitle>
          <CardDescription>Drag pumps from this list to the calendar. Use Ctrl/Meta+Click to select multiple.</CardDescription>
        </div>
        <Button onClick={() => setIsAddPumpModalOpen(true)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Pump(s)
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea 
          className="h-[400px] border rounded-md p-2"
          onDrop={handleDropOnPlannableList}
          onDragOver={handleDragOver}
        >
          {isLoading ? (
             <p className="text-center p-4 text-muted-foreground">Loading plannable pumps...</p>
          ) : filteredPlannableItems.length === 0 ? (
            <p className="text-center p-4 text-muted-foreground">No plannable items match filters or all are scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
              {filteredPlannableItems.map(item => (
                <SchedulePumpCard
                  key={item.id}
                  pump={item}
                  isSelected={selectedPlannableItemIds.includes(item.id)}
                  onCardClick={handlePlannableItemClick}
                  onDragStart={(e) => handleDragStartPlannableItem(e, item)}
                  onDragEnd={handleDragEnd} 
                  onOpenDetailsModal={() => handleOpenDetailsModal(item)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const CalendarView = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Production Schedule</CardTitle>
            <CardDescription>Total duration of scheduled items: {totalScheduledDaysDuration} days.</CardDescription>
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
            const itemsStartingThisDay = scheduleTimeline
              .filter(item => item.startDay === dayIndex)
              .sort((a,b) => (a.priority === 'urgent' ? -1 : b.priority === 'urgent' ? 1 : 0));
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "border rounded-sm p-1 text-xs relative flex flex-col bg-background hover:bg-muted/30 transition-colors",
                  date.getMonth() !== new Date().getMonth() && "bg-muted/20 text-muted-foreground/60",
                  "min-h-[8rem]" 
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnCalendar(e, dayIndex)}
                onDragEnter={(e) => { e.currentTarget.classList.add('bg-primary/10', 'border-primary'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('bg-primary/10', 'border-primary'); }}
              >
                <div className={cn("font-medium pb-0.5 text-right", date.toDateString() === new Date().toDateString() && "text-primary font-bold")}>{date.getDate()}</div>
                <ScrollArea className="flex-grow space-y-0.5 overflow-y-auto"> 
                  {itemsStartingThisDay.map(item => (
                     <div
                        key={item.instanceId}
                        draggable={true}
                        onDragStart={(e) => handleDragStartScheduledItem(e, item)}
                        onDragEnd={handleDragEnd} 
                        title={`${item.model} - ${item.serialNumber || 'N/A'}\nCustomer: ${item.customer}\nPO: ${item.poNumber}\nDuration: ${item.duration} days`}
                        className={cn(
                          "text-[10px] p-1 rounded mb-0.5 cursor-grab active:cursor-grabbing text-primary-foreground leading-tight border select-none",
                          getColorForModelOnCalendar(item.model),
                          "overflow-hidden transition-transform hover:scale-105"
                        )}
                        style={{ minHeight: '1.4rem' }} 
                      >
                        <p className="font-semibold truncate">{item.model}</p>
                        <p className="truncate text-xs">{item.serialNumber || 'N/A'}</p>
                        <p className="truncate text-[9px] opacity-80">{item.customer}</p>
                      </div>
                  ))}
                </ScrollArea>
              </div>
            );
          })}
        </div>
        {scheduledItems.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2 text-base">Currently Scheduled Items ({scheduledItems.length}):</h4>
            <ScrollArea className="h-[200px] border rounded-md p-2 space-y-2">
              {scheduledItems.sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex).map((item) => (
                <Card key={item.instanceId} className="p-2 shadow-sm bg-card hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{item.model} - {item.serialNumber || 'N/A'}</p>
                      <p className="text-[10px] text-muted-foreground">Cust: {item.customer} | PO: {item.poNumber} | Days: {item.daysPerUnit}</p>
                      <p className="text-[10px] text-muted-foreground">Scheduled on: {calendarDays[item.scheduledOnDayIndex]?.toLocaleDateString() || 'N/A'}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80" onClick={() => removeFromSchedule(item.instanceId)} aria-label="Remove from schedule">
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
    <div className="flex flex-col h-full">
      <EnhancedHeader
        title="Production Planning & Schedule"
        // showAddPump and onAddPump props removed
        searchTerm={globalSearchTerm}
        onSearchChange={setGlobalSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        availablePumpModels={allPumpModels}
        availablePowderCoaters={allPowderCoaters}
        availableCustomers={allCustomerNames}
        availableSerialNumbers={allSerialNumbers}
        availablePONumbers={allPONumbers}
        availablePriorities={allPriorities.map(p => ({label: p.label, value: p.value}))}
      />
      
      <main className="flex-grow overflow-hidden p-4 md:p-6 bg-background text-foreground">
        <div className="mb-6">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><Package size={16} /><span>Plannable Pumps: {totalPlannablePumps}</span></div>
            <div className="flex items-center gap-1"><Clock size={16} /><span>Scheduled Duration: {totalScheduledDaysDuration} days</span></div>
          </div>
        </div>
        <div className="flex-grow overflow-auto space-y-6">
            <section><PlannablePumpsTable /></section>
            <Separator className="my-4" />
            <section><CalendarView /></section>
        </div>
      </main>

      <AddPumpForm isOpen={isAddPumpModalOpen} onClose={() => setIsAddPumpModalOpen(false)} onAddPump={handleAddPumps} />
      <PumpDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} pump={selectedPumpForDetails} onUpdatePump={handleUpdatePump} />
    </div>
  );
}
    
