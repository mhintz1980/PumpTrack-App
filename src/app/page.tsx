
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { AddPumpForm } from '@/components/pump/AddPumpForm';
import { PumpDetailsModal } from '@/components/pump/PumpDetailsModal';
import { MissingInfoModal } from '@/components/pump/MissingInfoModal';
import { GroupedPumpDetailsModal } from '@/components/pump/GroupedPumpDetailsModal';
import type { Pump, StageId, ViewMode, Filters, PriorityLevel } from '@/types';
import { STAGES, POWDER_COATERS, PUMP_MODELS, CUSTOMER_NAMES, DEFAULT_POWDER_COAT_COLORS, PRIORITY_LEVELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const generateId = () => crypto.randomUUID();

const generateRandomSerialNumber = () => `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

export default function HomePage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [filteredPumps, setFilteredPumps] = useState<Pump[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [filters, setFilters] = useState<Filters>({});
  
  const [isAddPumpModalOpen, setIsAddPumpModalOpen] = useState(false);
  const [selectedPumpForDetails, setSelectedPumpForDetails] = useState<Pump | null>(null);
  const [isPumpDetailsModalOpen, setIsPumpDetailsModalOpen] = useState(false);
  
  const [missingInfoPump, setMissingInfoPump] = useState<Pump | null>(null);
  const [missingInfoTargetStage, setMissingInfoTargetStage] = useState<StageId | null>(null);
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);

  const [selectedPumpIdsForDrag, setSelectedPumpIdsForDrag] = useState<string[]>([]);

  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState<{ model: string; pumps: Pump[] } | null>(null);
  const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] = useState(false);


  const { toast } = useToast();
  
  useEffect(() => {
    const initialSamplePumps: Pump[] = [
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO123', currentStage: 'open-jobs', notes: 'Initial inspection pending.', priority: 'normal' },
      { id: generateId(), model: PUMP_MODELS[1], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO456', currentStage: 'assembly', notes: 'Waiting for part XYZ.', priority: 'high' },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO788', currentStage: 'open-jobs', notes: 'Urgent.', priority: 'urgent' },
      { id: generateId(), model: PUMP_MODELS[2], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO789', currentStage: 'testing', powderCoater: POWDER_COATERS[0], powderCoatColor: DEFAULT_POWDER_COAT_COLORS[0], notes: 'High pressure test passed.', priority: 'normal' },
      { id: generateId(), model: PUMP_MODELS[3], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[3], poNumber: 'PO124', currentStage: 'powder-coat', powderCoater: POWDER_COATERS[1], powderCoatColor: DEFAULT_POWDER_COAT_COLORS[1], priority: 'high' },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO101', currentStage: 'open-jobs', notes: 'Needs quick turnaround', priority: 'urgent' },
      { id: generateId(), model: PUMP_MODELS[4], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[4], poNumber: 'PO567', currentStage: 'fabrication', priority: 'normal' },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO202', currentStage: 'open-jobs', priority: 'normal' },
    ];
    setPumps(initialSamplePumps);
  }, []);

  useEffect(() => {
    let tempPumps = [...pumps];
    if (filters.serialNumber) {
      tempPumps = tempPumps.filter(p => p.serialNumber?.toLowerCase().includes(filters.serialNumber!.toLowerCase()));
    }
    if (filters.customer) {
      tempPumps = tempPumps.filter(p => p.customer === filters.customer);
    }
    if (filters.poNumber) {
      tempPumps = tempPumps.filter(p => p.poNumber.toLowerCase().includes(filters.poNumber!.toLowerCase()));
    }
    if (filters.model) {
      tempPumps = tempPumps.filter(p => p.model === filters.model);
    }
    if (filters.powderCoater) {
      tempPumps = tempPumps.filter(p => p.powderCoater === filters.powderCoater);
    }
    if (filters.priority) {
      tempPumps = tempPumps.filter(p => (p.priority || 'normal') === filters.priority);
    }
    setFilteredPumps(tempPumps);
  }, [pumps, filters]);

  const handleAddPump = useCallback((newPumpData: Omit<Pump, 'id' | 'currentStage'> & { quantity: number; serialNumber?: string; priority?: PriorityLevel }) => {
    const { quantity, serialNumber: startSerialNumberInput, priority, ...basePumpData } = newPumpData;
    const newPumps: Pump[] = [];
    let currentSerialNumberNumeric = -1;
    const startSerialNumber = startSerialNumberInput?.trim() === '' ? undefined : startSerialNumberInput;


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
      } else if (quantity > 1 && !startSerialNumber) {
        // Serial number remains undefined for batch add without starting SN
      } else if (quantity === 1 && (!startSerialNumber || !/^MSP-JN-\d{4}$/.test(startSerialNumber))) {
        // This case should be caught by form validation, but as a safeguard:
        console.error("Serial number is required and must be valid for single pump addition.");
        toast({ variant: "destructive", title: "Validation Error", description: "Serial number is required for single pump addition." });
        return; 
      }

      const newPump: Pump = {
        ...basePumpData,
        id: generateId(),
        serialNumber: pumpSerialNumber,
        currentStage: 'open-jobs',
        notes: basePumpData.notes || undefined,
        priority: priority || 'normal',
      };
      newPumps.push(newPump);
    }
    
    setPumps(prev => [...newPumps, ...prev]);
    if (newPumps.length === 1) {
      toast({ title: "Pump Added", description: `${newPumps[0].serialNumber || 'New Pump'} added to Open Jobs.` });
    } else {
      toast({ title: `${newPumps.length} Pumps Added`, description: `Batch added to Open Jobs.` });
    }
  }, [toast]);

  const handleUpdatePump = useCallback((updatedPump: Pump) => {
    setPumps(prev => prev.map(p => p.id === updatedPump.id ? updatedPump : p));
    setSelectedPumpIdsForDrag([]);
    toast({ title: "Pump Updated", description: `Details for ${updatedPump.serialNumber || 'Pump'} saved.` });
  }, [toast]);

  const handlePumpMove = useCallback((pumpId: string, newStageId: StageId) => {
    const pumpToMove = pumps.find(p => p.id === pumpId);
    if (!pumpToMove) return;

    if (newStageId === 'powder-coat' && (!pumpToMove.powderCoater || !pumpToMove.powderCoatColor)) {
      setMissingInfoPump(pumpToMove);
      setMissingInfoTargetStage(newStageId);
      setIsMissingInfoModalOpen(true);
    } else {
      setPumps(prev => prev.map(p => p.id === pumpId ? { ...p, currentStage: newStageId } : p));
      const stageTitle = STAGES.find(s => s.id === newStageId)?.title || newStageId;
      toast({ title: "Pump Moved", description: `${pumpToMove.serialNumber || 'Pump'} moved to ${stageTitle}.` });
    }
    setSelectedPumpIdsForDrag([]);
  }, [pumps, toast]);
  
  const handleMultiplePumpsMove = useCallback((pumpIdsToMove: string[], newStageId: StageId) => {
    const pumpsToActuallyMove: Pump[] = [];
    let powderCoatInfoMissing = false;
    let firstMissingPumpForModal: Pump | null = null;

    for (const pumpId of pumpIdsToMove) {
      const pump = pumps.find(p => p.id === pumpId);
      if (pump) {
        if (newStageId === 'powder-coat' && (!pump.powderCoater || !pump.powderCoatColor)) {
          powderCoatInfoMissing = true;
          if (!firstMissingPumpForModal) { 
            firstMissingPumpForModal = pump;
          }
        }
        pumpsToActuallyMove.push(pump);
      }
    }

    if (powderCoatInfoMissing && newStageId === 'powder-coat') {
      if (firstMissingPumpForModal) {
        setMissingInfoPump(firstMissingPumpForModal);
        setMissingInfoTargetStage(newStageId);
        setIsMissingInfoModalOpen(true);
      }
      // Do not move any pumps if any are missing info for powder coat stage
      toast({
        variant: "destructive",
        title: "Move Aborted",
        description: "One or more pumps require powder coat information. Please update them or resolve via the prompted modal.",
      });
      return; 
    }
    
    setPumps(prev => 
      prev.map(p => 
        pumpIdsToMove.includes(p.id) ? { ...p, currentStage: newStageId } : p
      )
    );
    const stageTitle = STAGES.find(s => s.id === newStageId)?.title || newStageId;
    toast({ title: `${pumpIdsToMove.length} Pump(s) Moved`, description: `Moved to ${stageTitle}.` });
    setSelectedPumpIdsForDrag([]);
  }, [pumps, toast]);


  const handleSaveMissingInfo = useCallback((pumpId: string, data: Partial<Pump>) => {
    setPumps(prev => prev.map(p => p.id === pumpId ? { ...p, ...data, currentStage: missingInfoTargetStage! } : p));
    const pump = pumps.find(p => p.id === pumpId); 
    if (pump && missingInfoTargetStage) {
       const stageTitle = STAGES.find(s => s.id === missingInfoTargetStage)?.title || missingInfoTargetStage;
       toast({ title: "Info Saved & Pump Moved", description: `${pump.serialNumber || 'Pump'} updated and moved to ${stageTitle}.` });
    }
    setMissingInfoPump(null);
    setMissingInfoTargetStage(null);
    setSelectedPumpIdsForDrag([]);
  }, [pumps, missingInfoTargetStage, toast]);

  const handleOpenPumpDetailsModal = useCallback((pump: Pump) => {
    setSelectedPumpForDetails(pump);
    setIsPumpDetailsModalOpen(true);
  }, []);

  const handlePumpCardClick = useCallback((clickedPump: Pump, event: React.MouseEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      setSelectedPumpIdsForDrag(prevSelectedIds => {
        const firstSelectedPump = pumps.find(p => p.id === prevSelectedIds[0]);
        // Allow selection across different stages when using CTRL/Meta
        if (prevSelectedIds.includes(clickedPump.id)) {
          return prevSelectedIds.filter(id => id !== clickedPump.id);
        } else {
          // If the new click is on a card from a different stage than the currently selected ones,
          // OR if no cards are selected yet, start a new selection group.
          if (prevSelectedIds.length === 0 || (firstSelectedPump && firstSelectedPump.currentStage !== clickedPump.currentStage)) {
            return [clickedPump.id];
          }
          return [...prevSelectedIds, clickedPump.id];
        }
      });
    } else {
      // Normal click without CTRL/Meta always starts a new selection with just the clicked card
      setSelectedPumpIdsForDrag([clickedPump.id]);
    }
  }, [pumps]);

  const handleOpenGroupDetailsModal = useCallback((model: string, pumpsInGroup: Pump[]) => {
    setSelectedGroupForDetails({ model, pumps: pumpsInGroup });
    setIsGroupDetailsModalOpen(true);
  }, []);


  const allPumpModels = PUMP_MODELS;
  
  const powderCoatersInPumps = pumps
    .map(p => p.powderCoater)
    .filter((pc): pc is string => typeof pc === 'string' && pc.length > 0);
  const allPowderCoaters = Array.from(new Set(powderCoatersInPumps.concat(POWDER_COATERS))).sort();
  
  const allCustomerNames = CUSTOMER_NAMES;
  
  const allSerialNumbers = Array.from(new Set(pumps.map(p => p.serialNumber).filter((sn): sn is string => !!sn))).sort();
  const allPONumbers = Array.from(new Set(pumps.map(p => p.poNumber))).sort();
  const allPriorities = PRIORITY_LEVELS;


  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        onAddPump={() => setIsAddPumpModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
        availablePumpModels={allPumpModels}
        availablePowderCoaters={allPowderCoaters}
        availableCustomers={allCustomerNames}
        availableSerialNumbers={allSerialNumbers}
        availablePONumbers={allPONumbers}
        availablePriorities={allPriorities.map(p => ({label: p.label, value: p.value}))}
      />
      <main className="flex-grow overflow-hidden">
        <KanbanBoard
          pumps={filteredPumps}
          viewMode={viewMode}
          onPumpMove={handlePumpMove}
          onMultiplePumpsMove={handleMultiplePumpsMove}
          onOpenPumpDetailsModal={handleOpenPumpDetailsModal}
          onOpenGroupDetailsModal={handleOpenGroupDetailsModal}
          selectedPumpIdsForDrag={selectedPumpIdsForDrag}
          onPumpCardClick={handlePumpCardClick}
        />
      </main>

      <AddPumpForm
        isOpen={isAddPumpModalOpen}
        onClose={() => setIsAddPumpModalOpen(false)}
        onAddPump={handleAddPump}
      />

      {selectedPumpForDetails && (
        <PumpDetailsModal
          isOpen={isPumpDetailsModalOpen}
          onClose={() => { setIsPumpDetailsModalOpen(false); setSelectedPumpForDetails(null); }}
          pump={selectedPumpForDetails}
          onUpdatePump={handleUpdatePump}
        />
      )}

      {missingInfoPump && (
        <MissingInfoModal
          isOpen={isMissingInfoModalOpen}
          onClose={() => { setIsMissingInfoModalOpen(false); setMissingInfoPump(null); setMissingInfoTargetStage(null);}}
          pump={missingInfoPump}
          targetStageId={missingInfoTargetStage}
          onSave={handleSaveMissingInfo}
        />
      )}

      {selectedGroupForDetails && (
        <GroupedPumpDetailsModal
          isOpen={isGroupDetailsModalOpen}
          onClose={() => {
            setIsGroupDetailsModalOpen(false);
            setSelectedGroupForDetails(null);
          }}
          modelName={selectedGroupForDetails.model}
          pumpsInGroup={selectedGroupForDetails.pumps}
          onOpenIndividualPumpDetails={handleOpenPumpDetailsModal}
        />
      )}
    </div>
  );
}
