
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Calendar, Package, Clock, Filter, Users, FileText, Play, Pause, GripVertical, XCircle } from 'lucide-react'; // Added more icons
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; // For conditional class names
import { Label } from "@/components/ui/label";

// Sample data - replace with your actual data source and align with Pump type later
const sampleData = [
  { id: 1, customer: 'AcmeCorp', po: 'PO-2024-001', model: 'Pump-X100', quantity: 5, remaining: 3, daysPerUnit: 2, priority: 'High' },
  { id: 2, customer: 'TechFlow', po: 'PO-2024-002', model: 'Pump-X200', quantity: 8, remaining: 8, daysPerUnit: 3, priority: 'Medium' },
  { id: 3, customer: 'FluidDyn', po: 'PO-2024-003', model: 'Pump-X100', quantity: 12, remaining: 10, daysPerUnit: 2, priority: 'Low' },
  { id: 4, customer: 'AcmeCorp', po: 'PO-2024-004', model: 'Pump-X300', quantity: 6, remaining: 6, daysPerUnit: 4, priority: 'High' },
  { id: 5, customer: 'HydroTech', po: 'PO-2024-005', model: 'Pump-X200', quantity: 4, remaining: 2, daysPerUnit: 3, priority: 'Medium' },
];

// Define types for the data for better type safety
interface ScheduleItemData {
  id: number;
  customer: string;
  po: string;
  model: string;
  quantity: number;
  remaining: number;
  daysPerUnit: number;
  priority: 'High' | 'Medium' | 'Low';
}

interface ScheduledItem extends ScheduleItemData {
  scheduledOnDayIndex: number; // Which day index on the calendar it's initially scheduled for
  instanceId: string; // Unique ID for this specific scheduled instance
}

interface ScheduleTimelineEntry extends ScheduledItem {
  startDay: number;
  endDay: number;
  duration: number;
}


export default function SchedulePage() {
  const [plannableItems, setPlannableItems] = useState<ScheduleItemData[]>(sampleData);
  const [schedule, setSchedule] = useState<ScheduledItem[]>([]);
  const [filters, setFilters] = useState({ customer: '', po: '', model: '' });
  const [draggedItem, setDraggedItem] = useState<ScheduleItemData | null>(null);
  const [draggedInstanceId, setDraggedInstanceId] = useState<string | null>(null);


  // Calculate totals and summaries
  const totals = {
    remaining: plannableItems.reduce((sum, item) => sum + item.remaining, 0),
    byModel: plannableItems.reduce((acc, item) => {
      acc[item.model] = (acc[item.model] || 0) + item.remaining;
      return acc;
    }, {} as Record<string, number>),
    byCustomer: plannableItems.reduce((acc, item) => {
      acc[item.customer] = (acc[item.customer] || 0) + item.remaining;
      return acc;
    }, {} as Record<string, number>),
    byPO: plannableItems.reduce((acc, item) => {
      acc[item.po] = (acc[item.po] || 0) + item.remaining;
      return acc;
    }, {} as Record<string, number>)
  };

  const filteredPlannableItems = plannableItems.filter(item => 
    item.remaining > 0 && // Only show items with remaining quantity
    (!filters.customer || item.customer.toLowerCase().includes(filters.customer.toLowerCase())) &&
    (!filters.po || item.po.toLowerCase().includes(filters.po.toLowerCase())) &&
    (!filters.model || item.model.toLowerCase().includes(filters.model.toLowerCase()))
  );

  const generateCalendarDays = (numDays = 60) => {
    const days = [];
    const today = new Date();
    // Start from the beginning of the current week (Sunday)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < numDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const calendarDays = generateCalendarDays(42); // Show 6 weeks

  const scheduleTimeline = useMemo(() => {
    let currentDayOffset = 0;
    const timeline: ScheduleTimelineEntry[] = [];
    const dayMap = new Map<number, number>(); // dayIndex -> count of items on this day

    schedule.forEach(item => {
      const duration = item.daysPerUnit; // Each scheduled item is 1 unit for 'daysPerUnit' duration
      
      let startDay = item.scheduledOnDayIndex;
      
      // Adjust start day if the original slot is taken by a longer task
      // or if there are too many tasks on that day.
      // This is a simple stacking logic. More complex logic might be needed.
      while(true) {
          const itemsOnStartDay = schedule.filter(s => s.scheduledOnDayIndex === startDay).length;
          const tasksEndingOnStartDay = timeline.filter(t => t.endDay === startDay -1).length;

          if (itemsOnStartDay < 3 && tasksEndingOnStartDay < 3) { // Allow up to 3 items to start on the same day visually
              break;
          }
          startDay++; // Push to next day if current day is "full"
      }
      
      const effectiveStartDay = item.scheduledOnDayIndex + (dayMap.get(item.scheduledOnDayIndex) || 0);
      dayMap.set(item.scheduledOnDayIndex, (dayMap.get(item.scheduledOnDayIndex) || 0) + duration);


      timeline.push({
        ...item,
        startDay: effectiveStartDay,
        endDay: effectiveStartDay + duration - 1,
        duration,
      });
    });
    return timeline.sort((a,b) => a.startDay - b.startDay); // Ensure sorted by start day
  }, [schedule]);


  const totalScheduleDays = scheduleTimeline.length > 0 ? 
    Math.max(0, ...scheduleTimeline.map(item => item.endDay)) + 1 : 0;

  const handleDragStartPlannableItem = (e: React.DragEvent<HTMLTableRowElement>, item: ScheduleItemData) => {
    setDraggedItem(item);
    setDraggedInstanceId(null);
    e.dataTransfer.effectAllowed = 'copy'; // Changed to copy as we are creating a new schedule entry
    e.dataTransfer.setData('application/pumptrack-item-id', item.id.toString());
  };
  
  const handleDragStartScheduledItem = (e: React.DragEvent<HTMLDivElement>, itemInstanceId: string) => {
    const itemToDrag = schedule.find(s => s.instanceId === itemInstanceId);
    if (itemToDrag) {
      setDraggedItem(itemToDrag); // The full item data
      setDraggedInstanceId(itemInstanceId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/pumptrack-instance-id', itemInstanceId);
    }
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedInstanceId ? 'move' : 'copy';
  };

  const handleDropOnCalendar = (e: React.DragEvent<HTMLDivElement>, targetDayIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedInstanceId) { // Moving an existing scheduled item
        setSchedule(prev => prev.map(si => 
            si.instanceId === draggedInstanceId 
            ? { ...si, scheduledOnDayIndex: targetDayIndex } 
            : si
        ));
    } else if (draggedItem.remaining > 0) { // Scheduling a new item from the plannable list
      const newItemInstance: ScheduledItem = { 
        ...draggedItem, 
        scheduledOnDayIndex: targetDayIndex,
        instanceId: crypto.randomUUID() // Create a unique ID for this instance
      };
      setSchedule(prev => [...prev, newItemInstance]);
      
      setPlannableItems(prev => prev.map(item => 
        item.id === draggedItem.id 
          ? { ...item, remaining: Math.max(0, item.remaining - 1) } // Decrement remaining from source
          : item
      ));
    }
    
    setDraggedItem(null);
    setDraggedInstanceId(null);
  };
  
  const handleDropOnPlannableList = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItem || !draggedInstanceId) return; // Only handle drops of existing scheduled items

    // Remove from schedule
    setSchedule(prev => prev.filter(item => item.instanceId !== draggedInstanceId));
    
    // Restore remaining quantity in plannableItems
    setPlannableItems(prev => prev.map(item => 
      item.id === draggedItem.id 
        ? { ...item, remaining: item.remaining + 1 }
        : item
    ));
    setDraggedItem(null);
    setDraggedInstanceId(null);
  };


  const removeFromSchedule = (itemInstanceIdToRemove: string) => {
    const itemToRemove = schedule.find(s => s.instanceId === itemInstanceIdToRemove);
    if (!itemToRemove) return;

    setSchedule(prev => prev.filter((item) => item.instanceId !== itemInstanceIdToRemove));
    
    setPlannableItems(prev => prev.map(item => 
      item.id === itemToRemove.id 
        ? { ...item, remaining: item.remaining + 1 }
        : item
    ));
  };

  const getPriorityBadgeVariant = (priority: ScheduleItemData['priority']): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default'; // Using default as yellow/amber
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getColorForModelOnCalendar = (model: string) => {
    const colors: Record<string, string> = {
      'Pump-X100': 'bg-primary/70 border-primary',
      'Pump-X200': 'bg-accent/70 border-accent', // Using accent for the green
      'Pump-X300': 'bg-purple-500/70 border-purple-500' // A placeholder, can map to another theme color
    };
    return colors[model] || 'bg-muted/70 border-muted-foreground';
  };


  const PivotTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Plannable Pumps</CardTitle>
        <CardDescription>Drag pumps from this table to the calendar to schedule them. Remaining {'>'} 0.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="customerFilter" className="text-xs">Customer</Label>
            <Input 
              id="customerFilter"
              placeholder="Filter by Customer"
              value={filters.customer} 
              onChange={(e) => setFilters(prev => ({...prev, customer: e.target.value}))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="poFilter" className="text-xs">Purchase Order</Label>
            <Input 
              id="poFilter"
              placeholder="Filter by PO"
              value={filters.po} 
              onChange={(e) => setFilters(prev => ({...prev, po: e.target.value}))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="modelFilter" className="text-xs">Model</Label>
            <Input
              id="modelFilter" 
              placeholder="Filter by Model"
              value={filters.model} 
              onChange={(e) => setFilters(prev => ({...prev, model: e.target.value}))}
              className="mt-1"
            />
          </div>
        </div>
        
        <ScrollArea className="h-[300px] border rounded-md">
          <div 
            className="p-1"
            onDragOver={handleDragOver}
            onDrop={handleDropOnPlannableList} // Allow dropping scheduled items back
          >
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted z-10">
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Customer</th>
                  <th className="text-left p-2 font-semibold">PO</th>
                  <th className="text-left p-2 font-semibold">Model</th>
                  <th className="text-right p-2 font-semibold">Total Qty</th>
                  <th className="text-right p-2 font-semibold">Remaining</th>
                  <th className="text-right p-2 font-semibold">Days/Unit</th>
                  <th className="text-center p-2 font-semibold">Priority</th>
                  <th className="p-1 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlannableItems.map(item => (
                  <tr 
                    key={item.id} 
                    className="border-b hover:bg-secondary/30 cursor-grab"
                    draggable={item.remaining > 0}
                    onDragStart={(e) => handleDragStartPlannableItem(e, item)}
                  >
                    <td className="p-2">{item.customer}</td>
                    <td className="p-2">{item.po}</td>
                    <td className="p-2">{item.model}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right font-semibold">{item.remaining}</td>
                    <td className="p-2 text-right">{item.daysPerUnit}</td>
                    <td className="p-2 text-center">
                      <Badge variant={getPriorityBadgeVariant(item.priority)} className="text-xs">
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="p-1 text-center">
                        {item.remaining > 0 && <GripVertical className="h-4 w-4 text-muted-foreground" />}
                    </td>
                  </tr>
                ))}
                {filteredPlannableItems.length === 0 && (
                    <tr><td colSpan={8} className="text-center p-4 text-muted-foreground">No plannable items match filters or all scheduled.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const CalendarView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Production Schedule</CardTitle>
        <CardDescription>
          Total scheduled days: {totalScheduleDays}. Drag items from the table or rearrange on the calendar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-1 rounded-sm bg-muted/50">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, dayIndex) => {
            const dayString = date.toDateString();
            // Find items that START on this day
            const itemsStartingThisDay = scheduleTimeline.filter(item => item.startDay === dayIndex);

            return (
              <div
                key={dayString}
                className={cn(
                  "h-28 border rounded-sm p-1 text-xs relative flex flex-col overflow-hidden bg-background hover:bg-muted/30",
                  date.getMonth() !== new Date().getMonth() && "bg-muted/20 text-muted-foreground/60" // Dim days not in current month (approx)
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnCalendar(e, dayIndex)}
              >
                <div className={cn("font-medium pb-0.5", date.toDateString() === new Date().toDateString() && "text-primary font-bold")}>{date.getDate()}</div>
                <ScrollArea className="flex-grow space-y-0.5">
                  {scheduleTimeline.map(item => {
                    // Check if the item spans across this dayIndex
                    if (dayIndex >= item.startDay && dayIndex <= item.endDay) {
                      // Only render the "main" card on its startDay to avoid duplication across spanned days
                      if (dayIndex === item.startDay) {
                        return (
                          <div
                            key={item.instanceId}
                            draggable
                            onDragStart={(e) => handleDragStartScheduledItem(e, item.instanceId)}
                            title={`${item.model} - ${item.customer} (PO: ${item.po})\nDuration: ${item.duration} days`}
                            className={cn(
                              "text-[10px] p-1 rounded mb-0.5 cursor-grab text-primary-foreground leading-tight",
                              getColorForModelOnCalendar(item.model),
                              `row-span-${item.duration}` // This won't work directly, visual representation is tricky
                            )}
                            style={{ minHeight: `${item.duration * 0.5}rem` }} // Very basic height hint
                          >
                            <p className="font-semibold truncate">{item.model}</p>
                            <p className="truncate">{item.customer}</p>
                          </div>
                        );
                      } else if (dayIndex > item.startDay && dayIndex <= item.endDay) {
                        // For subsequent days of a multi-day task, show a placeholder
                         return (
                           <div
                             key={`${item.instanceId}-span-${dayIndex}`}
                             className={cn("text-[10px] p-1 rounded-sm mb-0.5 opacity-60", getColorForModelOnCalendar(item.model))}
                             style={{ minHeight: `0.5rem`}}
                           ></div>
                         );
                      }
                    }
                    return null;
                  })}
                </ScrollArea>
              </div>
            );
          })}
        </div>
        
        {schedule.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2 text-base">Currently Scheduled Items:</h4>
            <ScrollArea className="h-[200px] border rounded-md p-2 space-y-2">
              {schedule.map((item) => (
                <Card key={item.instanceId} className="p-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold">{item.customer} - {item.model}</p>
                        <p className="text-[10px] text-muted-foreground">PO: {item.po} | Days: {item.daysPerUnit} | Scheduled on: {calendarDays[item.scheduledOnDayIndex]?.toLocaleDateString()}</p>
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
            <span>Total Pumps Remaining: {totals.remaining}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>Total Scheduled Days: {totalScheduleDays}</span>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-grow">
        <div className="space-y-6">
          {/* Summary Cards */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Summary Counts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><Users size={16} /> Pumps by Customer</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {Object.entries(totals.byCustomer).length > 0 ? (
                        Object.entries(totals.byCustomer).map(([customer, count]) => (
                        <div key={customer} className="flex justify-between text-sm py-0.5">
                            <span>{customer}</span>
                            <Badge variant="secondary" className="text-xs">{count}</Badge>
                        </div>
                        ))
                    ) : <p className="text-sm text-muted-foreground">N/A</p>}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><Package size={16}/> Pumps by Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {Object.entries(totals.byModel).length > 0 ? (
                        Object.entries(totals.byModel).map(([model, count]) => (
                        <div key={model} className="flex justify-between text-sm py-0.5">
                            <span>{model}</span>
                            <Badge variant="secondary" className="text-xs">{count}</Badge>
                        </div>
                        ))
                    ) : <p className="text-sm text-muted-foreground">N/A</p>}
                    </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><FileText size={16}/> Pumps by Purchase Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ScrollArea className="h-[100px]">
                    {Object.entries(totals.byPO).length > 0 ? (
                        Object.entries(totals.byPO).map(([po, count]) => (
                        <div key={po} className="flex justify-between text-sm py-0.5">
                            <span>{po}</span>
                            <Badge variant="outline" className="text-xs">{count}</Badge>
                        </div>
                        ))
                    ) : <p className="text-sm text-muted-foreground">N/A</p>}
                    </ScrollArea>
                    </CardContent>
                </Card>
            </div>
          </section>

          <Separator className="my-6" />

          <section>
            <PivotTable />
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

