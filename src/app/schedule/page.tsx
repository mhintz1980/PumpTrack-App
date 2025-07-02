
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSWRConfig } from "swr";
import * as api from "@/services/api";
import {
  Calendar as CalendarIcon,
  Package,
  Clock,
  Users,
  FileText,
  GripVertical,
  XCircle,
  RotateCcw,
  PlusCircle,
  Layers,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Pump, PriorityLevel, Filters, ViewMode } from "@/types";
import {
  PUMP_MODELS,
  CUSTOMER_NAMES,
  PRIORITY_LEVELS,
  POWDER_COATERS,
} from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { SchedulePumpCard } from "@/components/schedule/SchedulePumpCard";
import { CalendarBlock } from "@/components/calendar/CalendarBlock";
import { KanbanBacklog } from "@/components/backlog/KanbanBacklog";
import dynamic from "next/dynamic";
import { EnhancedHeader } from "@/components/layout/EnhancedHeader";
const PumpDetailsModal = dynamic(() =>
  import("@/components/pump/PumpDetailsModal").then((m) => m.PumpDetailsModal),
);
const AddPumpForm = dynamic(() =>
  import("@/components/pump/AddPumpForm").then((m) => m.AddPumpForm),
);
import { GroupedKanbanCard } from "@/components/kanban/GroupedKanbanCard";
import * as pumpService from "@/services/pumpService";

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
  lane: number;
}

type Lane = Array<Omit<ScheduleTimelineEntry, 'lane'>>;

type DraggedItemType = "plannable-single" | "plannable-batch" | "scheduled";

const assignLanesToScheduledItems = (items: ScheduledPump[]): ScheduleTimelineEntry[] => {
  if (!items || items.length === 0) return [];

  const sortedItems = [...items].sort((a, b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex);
  const lanes: Lane[] = [];

  const itemEntries = sortedItems.map(item => ({
    ...item,
    startDay: item.scheduledOnDayIndex,
    duration: Math.ceil(item.daysPerUnit),
    endDay: item.scheduledOnDayIndex + Math.ceil(item.daysPerUnit) - 1,
  }));

  const fullTimelineEntries: ScheduleTimelineEntry[] = [];

  itemEntries.forEach(item => {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const lastItemInLane = lanes[i][lanes[i].length - 1];
      if (item.startDay > lastItemInLane.endDay) {
        lanes[i].push(item);
        fullTimelineEntries.push({ ...item, lane: i });
        placed = true;
        break;
      }
    }
    if (!placed) {
      const newLaneIndex = lanes.length;
      lanes.push([item]);
      fullTimelineEntries.push({ ...item, lane: newLaneIndex });
    }
  });

  return fullTimelineEntries;
};

export default function SchedulePage() {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const [initialPumps, setInitialPumps] = useState<Pump[]>([]);
  const [plannableItems, setPlannableItems] = useState<PlannablePump[]>([]);
  const [scheduledItems, setScheduledItems] = useState<ScheduledPump[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({});

  const [isAddPumpModalOpen, setIsAddPumpModalOpen] = useState(false);

  const [selectedPlannableItemIds, setSelectedPlannableItemIds] = useState<
    string[]
  >([]);

  const [selectedPumpForDetails, setSelectedPumpForDetails] =
    useState<Pump | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [clientRenderInfo, setClientRenderInfo] = useState<{
    todayString: string;
    currentMonth: number;
    todayEpoch: number;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    setClientRenderInfo({
      todayString: now.toDateString(),
      currentMonth: now.getMonth(),
      todayEpoch: new Date(now.toDateString()).getTime(), // Store epoch of today for consistent month comparison
    });
  }, []);

useEffect(() => {
  const fetchPumps = async () => {
    setIsLoading(true);
    try {
      const fetchedPumps = await pumpService.getAllPumps();
      setInitialPumps(fetchedPumps);

      // DEV ONLY: Seed Firestore with all demo pump IDs for drag-and-drop!
      if (process.env.NODE_ENV === "development") {
        fetch('/api/seed-pumps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pumpIds: fetchedPumps.map(p => p.id) }),
        })
        .then(res => res.json())
        .then(data => {
          if (!data.ok) {
            console.warn('Pump seeding failed:', data);
          }
        })
        .catch(err => {
          console.warn('Pump seeding error:', err);
        });
      }
    } catch (error) {
      console.error("Failed to fetch pumps for schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load pump data for scheduling.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  fetchPumps();
}, [toast]);


  useEffect(() => {
    const scheduledPumpOriginalIds = new Set(scheduledItems.map((si) => si.id));
    const availableForPlanning = initialPumps.filter(
      (p) =>
        p.currentStage !== "shipped" && !scheduledPumpOriginalIds.has(p.id),
    );
    const augmentedPumps: PlannablePump[] = availableForPlanning.map((p) => ({
      ...p,
      daysPerUnit:
        p.estimatedBuildTimeDays !== undefined ? p.estimatedBuildTimeDays : 1.5,
    }));
    setPlannableItems(augmentedPumps);
  }, [initialPumps, scheduledItems]);

  const filteredPlannableItems = useMemo(() => {
    let tempItems = [...plannableItems];

    if (globalSearchTerm) {
      const lowerSearchTerm = globalSearchTerm.toLowerCase();
      tempItems = tempItems.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(lowerSearchTerm),
        ),
      );
    }

    if (filters.serialNumber && filters.serialNumber.length > 0) {
      tempItems = tempItems.filter(
        (p) =>
          p.serialNumber &&
          filters.serialNumber!.some((sn) =>
            p.serialNumber!.toLowerCase().includes(sn.toLowerCase()),
          ),
      );
    }
    if (filters.customer && filters.customer.length > 0) {
      tempItems = tempItems.filter((p) =>
        filters.customer!.includes(p.customer),
      );
    }
    if (filters.poNumber && filters.poNumber.length > 0) {
      tempItems = tempItems.filter(
        (p) =>
          p.poNumber &&
          filters.poNumber!.some((po) =>
            p.poNumber.toLowerCase().includes(po.toLowerCase()),
          ),
      );
    }
    if (filters.model && filters.model.length > 0) {
      tempItems = tempItems.filter((p) => filters.model!.includes(p.model));
    }
    if (filters.powderCoater && filters.powderCoater.length > 0) {
      tempItems = tempItems.filter(
        (p) => p.powderCoater && filters.powderCoater!.includes(p.powderCoater),
      );
    }
    if (filters.priority && filters.priority.length > 0) {
      tempItems = tempItems.filter((p) =>
        filters.priority!.includes(p.priority || "normal"),
      );
    }

    return tempItems;
  }, [plannableItems, filters, globalSearchTerm]);

  const calendarDays = useMemo(() => {
    const days = [];
    const todayForGrid = clientRenderInfo
      ? new Date(clientRenderInfo.todayEpoch)
      : new Date();

    const startDate = new Date(todayForGrid);
    startDate.setDate(todayForGrid.getDate() - todayForGrid.getDay()); 
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }, [clientRenderInfo]); 

  const scheduleTimeline = useMemo(() => {
    return assignLanesToScheduledItems(scheduledItems);
  }, [scheduledItems]);
  
  const totalScheduledDaysDuration = useMemo(() => {
    return scheduledItems.reduce((sum, item) => sum + item.daysPerUnit, 0);
  }, [scheduledItems]);

  const ScheduleDayCell = ({
    date,
    dayIndex,
  }: {
    date: Date;
    dayIndex: number;
  }) => {
    const [{ isOver }, drop] = useDrop<PlannablePump, void, { isOver: boolean }>(
      {
        accept: "pump",
        drop: (dragged) => {
          const start = calendarDays[dayIndex];
          const end = new Date(start);
          end.setDate(start.getDate() + Math.ceil(dragged.daysPerUnit) - 1);

          const previous = scheduledItems;
          setScheduledItems((prev) => {
            const filteredPrev = prev.filter((si) => si.id !== dragged.id);
            return [
              ...filteredPrev,
              {
                ...dragged,
                scheduledOnDayIndex: dayIndex,
                instanceId: crypto.randomUUID(),
              },
            ].sort((a, b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex);
          });

          (async () => {
            try {
              await api.schedulePump(dragged.id, {
                start: start.toISOString(),
                end: end.toISOString(),
              });
              mutate("/api/schedule");
              setSelectedPlannableItemIds([]);
            } catch (error) {
              console.error("Failed to schedule pump:", error);
              setScheduledItems(previous);
              toast({
                variant: "destructive",
                title: "Schedule Failed",
                description: "Could not schedule pump. Please try again.",
              });
            }
          })();
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      },
    );

    const isTodayClient =
      clientRenderInfo && date.toDateString() === clientRenderInfo.todayString;
    const isDifferentMonthClient =
      clientRenderInfo && date.getMonth() !== clientRenderInfo.currentMonth;

    return (
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        key={date.toISOString()}
        className={cn(
          "border rounded-sm p-1 text-xs relative flex flex-col bg-background/40 hover:bg-background/60 transition-colors",
          isDifferentMonthClient && "bg-muted/20 text-muted-foreground/60",
          "min-h-[8rem]",
          isOver && "bg-primary/10 border-primary",
        )}
      >
        <div
          className={cn(
            "font-medium pb-0.5 text-right",
            isTodayClient && "text-primary font-bold",
          )}
        >
          {date.getDate()}
        </div>
      </div>
    );
  };

  const handlePlannableItemClick = useCallback(
    (item: PlannablePump, event: React.MouseEvent) => {
      setSelectedPlannableItemIds((prevSelectedIds) => {
        if (event.ctrlKey || event.metaKey) {
          return prevSelectedIds.includes(item.id)
            ? prevSelectedIds.filter((id) => id !== item.id)
            : [...prevSelectedIds, item.id];
        }
        return prevSelectedIds.includes(item.id) && prevSelectedIds.length === 1
          ? []
          : [item.id];
      });
    },
    [],
  );

  const removeFromSchedule = useCallback(
    (instanceIdToRemove: string) => {
      const itemToRemove = scheduledItems.find(
        (si) => si.instanceId === instanceIdToRemove,
      );
      setScheduledItems((prev) =>
        prev.filter((item) => item.instanceId !== instanceIdToRemove),
      );
      if (itemToRemove) {
        toast({
          title: "Pump Unscheduled",
          description: `${itemToRemove.serialNumber || itemToRemove.model} removed from schedule.`,
        });
      }
      setSelectedPlannableItemIds([]);
    },
    [scheduledItems, toast],
  );

  const resetSchedule = useCallback(() => {
    setScheduledItems([]);
    setSelectedPlannableItemIds([]);
    toast({
      title: "Schedule Reset",
      description:
        "All pumps removed from schedule and returned to plannable list.",
    });
  }, [toast],
  );

  const handleOpenDetailsModal = useCallback((pump: Pump) => {
    setSelectedPumpForDetails(pump);
    setIsDetailsModalOpen(true);
  }, []);

  const handleOpenGroupDetailsModal = useCallback(
    (model: string, pumpsInGroup: Pump[]) => {
      if (pumpsInGroup.length > 0) {
        const plannableEquivalent = plannableItems.find(
          (pi) => pi.id === pumpsInGroup[0].id,
        );
        if (plannableEquivalent) handleOpenDetailsModal(plannableEquivalent);
      }
    },
    [plannableItems, handleOpenDetailsModal],
  );

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedPumpForDetails(null);
  }, []);

  const handleUpdatePump = useCallback(
    async (updatedPump: Pump) => {
      const originalPump = initialPumps.find((p) => p.id === updatedPump.id);
      if (!originalPump) {
        toast({
          variant: "destructive",
          title: "Update Error",
          description: "Original pump not found in initial list.",
        });
        return;
      }
      try {
        const savedPump = await pumpService.updatePumpWithActivityLog(
          updatedPump.id,
          updatedPump,
          originalPump,
        );
        setInitialPumps((prev) =>
          prev.map((p) => (p.id === savedPump.id ? savedPump : p)),
        );

        setScheduledItems((prevScheduled) =>
          prevScheduled.map((sp) =>
            sp.id === savedPump.id
              ? {
                  ...sp,
                  ...savedPump,
                  daysPerUnit:
                    savedPump.estimatedBuildTimeDays !== undefined
                      ? savedPump.estimatedBuildTimeDays
                      : 1.5,
                }
              : sp,
          ),
        );
        toast({
          title: "Pump Updated",
          description: `${savedPump.serialNumber || savedPump.model} has been updated.`,
        });
      } catch (error) {
        console.error("Error updating pump on schedule page:", error);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not save pump details.",
        });
      }
    },
    [toast, initialPumps],
  );

  const handleAddPumps = useCallback(
    async (
      newPumpsData: Array<Omit<Pump, "id" | "createdAt" | "updatedAt">>,
    ) => {
      setIsLoading(true);
      try {
        const addedPumpsPromises = newPumpsData.map((pumpData) =>
          pumpService.addPumpWithActivityLog(pumpData),
        );
        const successfullyAddedPumps = await Promise.all(addedPumpsPromises);

        setInitialPumps((prev) => [...successfullyAddedPumps, ...prev]);

        if (successfullyAddedPumps.length === 1) {
          toast({
            title: "Pump Added",
            description: `${successfullyAddedPumps[0].serialNumber || "New Pump"} added to schedule planning.`,
          });
        } else if (successfullyAddedPumps.length > 1) {
          toast({
            title: `${successfullyAddedPumps.length} Pumps Added`,
            description: `Batch added to schedule planning.`,
          });
        }
      } catch (error) {
        console.error("Error adding pumps:", error);
        toast({
          variant: "destructive",
          title: "Add Failed",
          description: "Could not add new pump(s).",
        });
      } finally {
        setIsLoading(false);
        setIsAddPumpModalOpen(false);
      }
    },
    [toast],
  );

  const modelColors = PUMP_MODELS.reduce(
    (acc, model, index) => {
      const colorClasses = [
        "bg-sky-500/80 border-sky-600",
        "bg-emerald-500/80 border-emerald-600",
        "bg-amber-500/80 border-amber-600",
        "bg-rose-500/80 border-rose-600",
        "bg-indigo-500/80 border-indigo-600",
        "bg-pink-500/80 border-pink-600",
        "bg-teal-500/80 border-teal-600",
        "bg-cyan-500/80 border-cyan-600",
        "bg-lime-500/80 border-lime-600",
      ];
      acc[model] = colorClasses[index % colorClasses.length];
      return acc;
    },
    {} as Record<string, string>,
  );

  const getColorForModelOnCalendar = (model: string) =>
    modelColors[model] || "bg-muted/70 border-muted-foreground";

  const allPumpModels = PUMP_MODELS;
  const allCustomerNames = CUSTOMER_NAMES;
  const allPriorities = PRIORITY_LEVELS;
  const powderCoatersInPumps = initialPumps
    .map((p) => p.powderCoater)
    .filter((pc): pc is string => typeof pc === "string" && pc.length > 0);
  const allPowderCoaters = Array.from(
    new Set(powderCoatersInPumps.concat(POWDER_COATERS)),
  ).sort();
  const allSerialNumbers = Array.from(
    new Set(
      initialPumps
        .map((p) => p.serialNumber)
        .filter((sn): sn is string => !!sn),
    ),
  ).sort();
  const allPONumbers = Array.from(
    new Set(
      initialPumps
        .map((p) => p.poNumber)
        .filter(
          Boolean as unknown as (value: string | undefined) => value is string,
        ),
    ),
  ).sort();
  const totalPlannablePumps = filteredPlannableItems.length;

  const PlannablePumpsTable = () => (
    <Card className="bg-glass-surface text-glass-text border border-glass-border backdrop-blur-md backdrop-saturate-150 shadow-glass-lg">
      <CardHeader>
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <CardTitle>Pumps to Schedule</CardTitle>
            <Button
              onClick={() => setIsAddPumpModalOpen(true)}
              size="sm"
              className="shrink-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Pump(s)
            </Button>
          </div>
          <CardDescription className="text-sm text-muted-foreground text-left">
            Drag pumps from this list to the calendar. Use Ctrl/Meta+Click to
            select multiple.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] border rounded-md p-2 glass-scrollbar">
          {isLoading ? (
            <p className="text-center p-4 text-muted-foreground">
              Loading plannable pumps...
            </p>
          ) : filteredPlannableItems.length === 0 ? (
            <p className="text-center p-4 text-muted-foreground">
              No plannable items match filters or all are scheduled.
            </p>
          ) : (
            <KanbanBacklog
              pumps={filteredPlannableItems}
              selectedPumpIds={selectedPlannableItemIds}
              onCardClick={handlePlannableItemClick}
              onOpenDetailsModal={handleOpenDetailsModal}
            />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const CalendarView = () => (
    <Card className="bg-glass-surface text-glass-text border border-glass-border backdrop-blur-md backdrop-saturate-150 shadow-glass-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Production Schedule</CardTitle>
            <CardDescription>
              Total duration of scheduled items: {totalScheduledDaysDuration}{" "}
              days.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSchedule}
            title="Clear all items from schedule"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-1 rounded-sm bg-muted/50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[minmax(8rem,auto)] gap-1 relative">
          {calendarDays.map((date, dayIndex) => (
            <ScheduleDayCell
              key={date.toISOString()}
              date={date}
              dayIndex={dayIndex}
            />
          ))}
          {scheduleTimeline.map((entry) => {
            const startDayOfWeek = entry.startDay % 7;
            const startWeek = Math.floor(entry.startDay / 7);

            const blockStyle: React.CSSProperties = {
              position: 'absolute',
              top: `calc(${startWeek} * (8rem + 4px) + 2rem + ${entry.lane * 1.75}rem)`, // 8rem row, 4px gap, 2rem date header, 1.75rem per lane
              left: `calc(${startDayOfWeek} * (100% / 7) + 2px)`,
              width: `calc(${entry.duration} * (100% / 7) - 4px)`,
              height: `1.5rem`, // 24px
              zIndex: 10 + entry.lane,
            };

            return (
              <CalendarBlock
                key={entry.instanceId}
                pump={entry}
                colorClass={getColorForModelOnCalendar(entry.model)}
                style={blockStyle}
              />
            );
          })}
        </div>
        {scheduledItems.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2 text-base">
              Currently Scheduled Items ({scheduledItems.length}):
            </h4>
            <ScrollArea className="h-[200px] border rounded-md p-2 space-y-2 glass-scrollbar">
              {scheduledItems
                .sort((a, b) => a.scheduledOnDayIndex - b.scheduledOnDayIndex)
                .map((item) => (
                  <Card
                    key={item.instanceId}
                    className="p-2 shadow-sm glass-card hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">
                          {item.model} - {item.serialNumber || "N/A"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Cust: {item.customer} | PO: {item.poNumber} | Schedule
                          Block: {item.daysPerUnit} days
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Scheduled on:{" "}
                          {calendarDays[
                            item.scheduledOnDayIndex
                          ]?.toLocaleDateString() || "N/A"}
                        </p>
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
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        <EnhancedHeader
          title="Production Planning & Schedule"
          searchTerm={globalSearchTerm}
          onSearchChange={setGlobalSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          availablePumpModels={allPumpModels}
          availablePowderCoaters={allPowderCoaters}
          availableCustomers={allCustomerNames}
          availableSerialNumbers={allSerialNumbers}
          availablePONumbers={allPONumbers}
          availablePriorities={allPriorities.map((p) => ({
            label: p.label,
            value: p.value,
          }))}
        />

        <main className="flex-grow overflow-hidden p-4 md:p-6 bg-glass-surface text-glass-text border border-glass-border backdrop-blur-md backdrop-saturate-150">
          <div className="mb-6">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package size={16} />
                <span>Plannable Pumps: {totalPlannablePumps}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>
                  Scheduled Duration: {totalScheduledDaysDuration} days
                </span>
              </div>
            </div>
          </div>
          <div className="flex-grow overflow-auto space-y-6">
            <section>
              <PlannablePumpsTable />
            </section>
            <Separator className="my-4" />
            <section>
              <CalendarView />
            </section>
          </div>
        </main>

        <AddPumpForm
          isOpen={isAddPumpModalOpen}
          onClose={() => setIsAddPumpModalOpen(false)}
          onAddPump={handleAddPumps}
        />

        <PumpDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          pump={selectedPumpForDetails}
          onUpdatePump={handleUpdatePump}
        />
      </div>
    </DndProvider>
  );
}
