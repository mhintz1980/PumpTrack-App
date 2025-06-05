
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, Package, Clock, Users, FileText, GripVertical, XCircle, RotateCcw } from 'lucide-react';
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


const generateId = () => crypto.randomUUID();
const generateRandomSerialNumber = () => `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

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

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({});

  const [isAddPumpModalOpen, setIsAddPumpModalOpen] = useState(false);

  const [draggedItemData, setDraggedItemData] = useState<DraggedItemData | null>(null);
  const [selectedPlannableItemIds, setSelectedPlannableItemIds] = useState<string[]>([]);

  const [selectedPumpForDetails, setSelectedPumpForDetails] = useState<PlannablePump | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);


  useEffect(() => {
    const now = new Date().toISOString();
    const samplePumps: Pump[] = [
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO-PLAN-001', currentStage: 'open-jobs', priority: 'high', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[1], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO-PLAN-002', currentStage: 'assembly', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[2], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO-PLAN-003', currentStage: 'fabrication', priority: 'urgent', createdAt: now, updatedAt: now },
    ];
    setInitialPumps(samplePumps);
  }, []);

  useEffect(() => {
    const nonShippedPumps = initialPumps.filter(p => p.currentStage !== 'shipped');
    const scheduledPumpOriginalIds = new Set(scheduledItems.map(si => si.id)); // Use original pump ID
    const augmentedPumps: PlannablePump[] = nonShippedPumps
      .filter(p => !scheduledPumpOriginalIds.has(p.id))
      .map(p => ({ ...p, daysPerUnit: getDaysPerUnit(p.model) }));
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
      return [item.id]; // Single click selects only this item
    });
  }, [setSelectedPlannableItemIds]);

  const handleDragStartPlannableItem = useCallback((e: React.DragEvent, item: PlannablePump) => {
    console.log('🔥 DRAG START - Plannable Item (SchedulePage):', item.id, item.model);
    e.stopPropagation();

    try {
      // Critical step: Set data for the drag operation.
      // 'text/plain' is a safe, universally supported type.
      e.dataTransfer.setData('text/plain', item.id);
      e.dataTransfer.effectAllowed = 'move';
      console.log('🔥 DataTransfer: setData("text/plain", "'+item.id+'") and effectAllowed="move" set.');

      // Update internal state to reflect what's being dragged.
      // For this debug step, we always treat it as a single item drag.
      setDraggedItemData({ type: 'plannable-single', item });
      // Ensure the dragged item is the only one marked as selected for clarity during this drag.
      setSelectedPlannableItemIds([item.id]);
      console.log('🔥 Internal State: draggedItemData set for single item, selectedPlannableItemIds updated.');
      
      // Visual feedback: Make the card being dragged semi-transparent.
      // e.currentTarget should be the <Card> element from SchedulePumpCard.
      const cardElement = e.currentTarget as HTMLElement;
      if (cardElement) {
        cardElement.style.opacity = '0.5';
        console.log('🔥 Visual Feedback: Opacity set to 0.5 for card ID:', item.id);
      } else {
        console.warn('🔥 Visual Feedback: Could not find cardElement (e.currentTarget) to set opacity.');
      }
      
      console.log('✅ Drag start for plannable item completed successfully:', item.id);

    } catch (error) {
      console.error('❌ ERROR in handleDragStartPlannableItem:', error);
      // If setData fails, the drag operation might not start or might behave unexpectedly.
      // No return here, let the browser handle the failed drag if it must.
    }
  }, [setDraggedItemData, setSelectedPlannableItemIds]);


  const handleDragStartScheduledItem = useCallback((e: React.DragEvent, item: ScheduledPump) => {
    console.log('🔥 DRAG START - Scheduled Item (SchedulePage):', item.instanceId, item.model);
    e.stopPropagation();
    
    try {
      e.dataTransfer.setData('application/pumptrack-instance-id', item.instanceId);
      e.dataTransfer.setData('text/plain', item.instanceId); // Also set text/plain for broader compatibility
      e.dataTransfer.effectAllowed = 'move';
      console.log('🔥 DataTransfer: setData for instanceId and text/plain, effectAllowed set.');

      setDraggedItemData({ type: 'scheduled', item });
      console.log('🔥 Internal State: draggedItemData set for scheduled item.');

      const targetElement = e.currentTarget as HTMLElement; // currentTarget should be the div from CalendarView
      if (targetElement) {
          targetElement.style.opacity = '0.5';
          console.log('🔥 Visual Feedback: Opacity set for scheduled item instance:', item.instanceId);
      } else {
          console.warn('🔥 Visual Feedback: Could not find targetElement for scheduled item instance:', item.instanceId);
      }
      console.log('✅ Drag start for scheduled item completed successfully:', item.instanceId);
    } catch (error) {
       console.error('❌ ERROR in handleDragStartScheduledItem:', error);
    }
  }, [setDraggedItemData]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    console.log('🏁 DRAG END (SchedulePage) - dropEffect:', e.dataTransfer.dropEffect);
    
    // Reset opacity for the original dragged element.
    // e.currentTarget here will be the element that had onDragStart (e.g., SchedulePumpCard or the scheduled item div).
    const draggedElement = e.currentTarget as HTMLElement;
    if (draggedElement) {
      draggedElement.style.opacity = '1';
      console.log('🏁 Visual Feedback: Opacity reset for element that was dragged.');
    } else {
        console.warn('🏁 Visual Feedback: Could not find e.currentTarget in handleDragEnd to reset opacity.');
    }

    // Clear the dragged item data.
    // Doing this synchronously is usually fine as drop handlers should have already processed.
    setDraggedItemData(null);
    console.log('🏁 Internal State: draggedItemData cleared.');
  }, [setDraggedItemData]);


  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move'; // Visual cue for the user
  }, []);

  const handleDropOnCalendar = useCallback((e: React.DragEvent<HTMLDivElement>, targetDayIndex: number) => {
    console.log('🟢 DROP ON CALENDAR - Day Index:', targetDayIndex);
    e.preventDefault();
    e.stopPropagation();
    
    const currentDraggedItem = draggedItemData; // Capture state at the moment of drop
    console.log('🟢 Captured draggedItemData for drop:', currentDraggedItem);

    if (!currentDraggedItem) {
      console.warn('🟢 Drop occurred but no draggedItemData was found. Drag might have been cleared prematurely or not set.');
      setDraggedItemData(null); // Defensive clear
      return;
    }

    // Remove hover styling from the drop target
    const dropTargetElement = e.currentTarget as HTMLElement;
    dropTargetElement.classList.remove('bg-primary/10', 'border-primary');

    if (currentDraggedItem.type === 'plannable-single') {
      const itemToSchedule = currentDraggedItem.item;
      console.log('🟢 Scheduling SINGLE plannable item:', itemToSchedule.id);

      setScheduledItems(prev => {
        // Remove if already scheduled (e.g. re-dragged), then add new instance
        const filteredPrev = prev.filter(si => si.id !== itemToSchedule.id);
        return [...filteredPrev, {
          ...itemToSchedule,
          scheduledOnDayIndex: targetDayIndex,
          instanceId: crypto.randomUUID(),
        }].sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex);
      });
      toast({ title: "Pump Scheduled", description: `${itemToSchedule.serialNumber || itemToSchedule.model} added to schedule.` });
      setSelectedPlannableItemIds([]); // Clear selection after scheduling

    } else if (currentDraggedItem.type === 'plannable-batch') {
      // This case is simplified for now, but the debug drag start only does single.
      // If batch logic is re-enabled, this part will need testing.
      const itemsToSchedule = currentDraggedItem.items;
      console.log('🟢 Scheduling BATCH of plannable items. Count:', itemsToSchedule.length);
      const newScheduledInstances: ScheduledPump[] = itemsToSchedule.map(item => ({
        ...item,
        scheduledOnDayIndex: targetDayIndex, // All start on the same day for now
        instanceId: crypto.randomUUID(),
      }));
      
      setScheduledItems(prev => {
        const newScheduledOriginalIds = new Set(newScheduledInstances.map(item => item.id));
        const filteredPrev = prev.filter(si => !newScheduledOriginalIds.has(si.id));
        return [...filteredPrev, ...newScheduledInstances]
          .sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex);
      });
      toast({ title: "Pumps Scheduled", description: `${itemsToSchedule.length} pumps added to schedule.` });
      setSelectedPlannableItemIds([]);

    } else if (currentDraggedItem.type === 'scheduled') {
      const itemToMove = currentDraggedItem.item;
      console.log('🟢 Moving SCHEDULED item instance:', itemToMove.instanceId, 'to day index:', targetDayIndex);
      setScheduledItems(prev => prev.map(si =>
        si.instanceId === itemToMove.instanceId
          ? { ...si, scheduledOnDayIndex: targetDayIndex }
          : si
      ).sort((a,b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex));
      toast({ title: "Schedule Updated", description: `Rescheduled ${itemToMove.serialNumber || itemToMove.model}.` });
    }
    
    console.log('🟢 Clearing draggedItemData after successful calendar drop processing.');
    setDraggedItemData(null); // Crucial to clear after processing
  }, [draggedItemData, toast, setScheduledItems, setSelectedPlannableItemIds, plannableItems]);


  const handleDropOnPlannableList = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    console.log('🟢 DROP ON PLANNABLE LIST');
    e.preventDefault();
    e.stopPropagation();
    
    const currentDraggedItem = draggedItemData; // Capture state
    console.log('🟢 Captured draggedItemData for plannable list drop:', currentDraggedItem);

    if (!currentDraggedItem || currentDraggedItem.type !== 'scheduled') {
      console.warn('🟢 Drop on plannable list but not a scheduled item, or no draggedItemData. Type:', currentDraggedItem?.type);
      setDraggedItemData(null); // Defensive clear
      return;
    }

    const itemToRemoveFromSchedule = currentDraggedItem.item;
    console.log('🟢 Removing scheduled item instance from schedule:', itemToRemoveFromSchedule.instanceId);
    setScheduledItems(prev => prev.filter(item => item.instanceId !== itemToRemoveFromSchedule.instanceId));
    toast({ title: "Pump Unscheduled", description: `${itemToRemoveFromSchedule.serialNumber || itemToRemoveFromSchedule.model} removed from schedule.` });
    
    setSelectedPlannableItemIds([]);
    console.log('🟢 Clearing draggedItemData after plannable list drop processing.');
    setDraggedItemData(null); // Crucial to clear
  }, [draggedItemData, toast, setScheduledItems, setSelectedPlannableItemIds]);

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
  }, [setSelectedPumpForDetails, setIsDetailsModalOpen]);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedPumpForDetails(null);
  }, [setIsDetailsModalOpen, setSelectedPumpForDetails]);

  const handleUpdatePump = useCallback((updatedPump: Pump) => {
    setInitialPumps(prev => prev.map(p => p.id === updatedPump.id ? updatedPump : p));
    // Also update in scheduledItems if it's there
    setScheduledItems(prevScheduled => prevScheduled.map(sp => 
        sp.id === updatedPump.id ? { ...sp, ...updatedPump, daysPerUnit: getDaysPerUnit(updatedPump.model) } : sp
    ));
    toast({ title: "Pump Updated", description: `${updatedPump.serialNumber || updatedPump.model} has been updated.` });
  }, [toast, setInitialPumps, setScheduledItems]);

  const handleAddPump = useCallback((newPumpData: Omit<Pump, 'id' | 'currentStage' | 'createdAt' | 'updatedAt'> & { quantity: number; serialNumber?: string; priority?: PriorityLevel }) => {
    const { quantity, serialNumber: startSerialNumberInput, priority, ...basePumpData } = newPumpData;
    const newPumps: Pump[] = [];
    let currentSerialNumberNumeric = -1;
    const startSerialNumber = startSerialNumberInput?.trim() === '' ? undefined : startSerialNumberInput;
    const now = new Date().toISOString();

    if (quantity > 1 && startSerialNumber && /^MSP-JN-\d{4}$/.test(startSerialNumber)) {
      currentSerialNumberNumeric = parseInt(startSerialNumber.substring(7), 10);
    }

    for (let i = 0; i < quantity; i++) {
      let pumpSerialNumber: string | undefined = undefined;
      if (quantity === 1 && startSerialNumber && /^MSP-JN-\d{4}$/.test(startSerialNumber)) {
        pumpSerialNumber = startSerialNumber;
      } else if (quantity > 1 && currentSerialNumberNumeric !== -1) {
        if (currentSerialNumberNumeric + i <= 9999) {
            pumpSerialNumber = `MSP-JN-${String(currentSerialNumberNumeric + i).padStart(4, '0')}`;
        }
      } else if (quantity === 1 && (!startSerialNumber || !/^MSP-JN-\d{4}$/.test(startSerialNumber))) {
        toast({ variant: "destructive", title: "Validation Error", description: "Serial number is required and must be valid for single pump addition." });
        return;
      }

      const newPump: Pump = {
        ...basePumpData,
        id: generateId(),
        serialNumber: pumpSerialNumber,
        currentStage: 'open-jobs',
        notes: basePumpData.notes || undefined,
        priority: priority || 'normal',
        createdAt: now,
        updatedAt: now,
      };
      newPumps.push(newPump);
    }
    
    setInitialPumps(prev => [...newPumps, ...prev]);
    if (newPumps.length === 1) {
      toast({ title: "Pump Added", description: `${newPumps[0].serialNumber || 'New Pump'} added to schedule planning.` });
    } else {
      toast({ title: `${newPumps.length} Pumps Added`, description: `Batch added to schedule planning.` });
    }
  }, [toast, setInitialPumps]);


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
      <CardHeader>
        <CardTitle>Pumps to Schedule</CardTitle>
        <CardDescription>Drag pumps from this list to the calendar. Use Ctrl/Meta+Click to select multiple.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea 
          className="h-[400px] border rounded-md p-2" // Added padding to ScrollArea
          onDrop={handleDropOnPlannableList}
          onDragOver={handleDragOver} // Add dragOver here too
        >
          {filteredPlannableItems.length === 0 ? (
            <p className="text-center p-4 text-muted-foreground">No plannable items match filters or all are scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-1"> {/* Added padding to grid */}
              {filteredPlannableItems.map(item => (
                <SchedulePumpCard
                  key={item.id}
                  pump={item}
                  isSelected={selectedPlannableItemIds.includes(item.id)}
                  onCardClick={handlePlannableItemClick}
                  onDragStart={(e) => handleDragStartPlannableItem(e, item)}
                  onDragEnd={handleDragEnd} // Pass the page's handleDragEnd
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
                  "h-32 border rounded-sm p-1 text-xs relative flex flex-col bg-background hover:bg-muted/30 transition-colors",
                  date.getMonth() !== new Date().getMonth() && "bg-muted/20 text-muted-foreground/60",
                  "min-h-[8rem]" // Ensure day cells have a minimum height
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnCalendar(e, dayIndex)}
                onDragEnter={(e) => { e.currentTarget.classList.add('bg-primary/10', 'border-primary'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('bg-primary/10', 'border-primary'); }}
              >
                <div className={cn("font-medium pb-0.5 text-right", date.toDateString() === new Date().toDateString() && "text-primary font-bold")}>{date.getDate()}</div>
                <ScrollArea className="flex-grow space-y-0.5 overflow-y-auto"> {/* Scroll for items within a day cell */}
                  {itemsStartingThisDay.map(item => (
                     <div
                        key={item.instanceId}
                        draggable={true}
                        onDragStart={(e) => handleDragStartScheduledItem(e, item)}
                        onDragEnd={handleDragEnd} // Pass the page's handleDragEnd
                        title={`${item.model} - ${item.serialNumber || 'N/A'}\nCustomer: ${item.customer}\nPO: ${item.poNumber}\nDuration: ${item.duration} days`}
                        className={cn(
                          "text-[10px] p-1 rounded mb-0.5 cursor-grab active:cursor-grabbing text-primary-foreground leading-tight border select-none",
                          getColorForModelOnCalendar(item.model),
                          "overflow-hidden transition-transform hover:scale-105"
                        )}
                        style={{ minHeight: '1.4rem' }} // Removed complex height, rely on content and cell min-height
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
        showAddPump={true}
        onAddPump={() => setIsAddPumpModalOpen(true)}
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

      <AddPumpForm isOpen={isAddPumpModalOpen} onClose={() => setIsAddPumpModalOpen(false)} onAddPump={handleAddPump} />
      <PumpDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} pump={selectedPumpForDetails} onUpdatePump={handleUpdatePump} />
    </div>
  );
}
    