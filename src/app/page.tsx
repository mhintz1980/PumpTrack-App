
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Pump, StageId, ViewMode, Filters, PriorityLevel } from '@/types';
import { STAGES, POWDER_COATERS, PUMP_MODELS, CUSTOMER_NAMES, DEFAULT_POWDER_COAT_COLORS, PRIORITY_LEVELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { EnhancedHeader } from '@/components/layout/EnhancedHeader';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { PumpDetailsModal } from '@/components/pump/PumpDetailsModal';
import { MissingInfoModal } from '@/components/pump/MissingInfoModal';
import { GroupedPumpDetailsModal } from '@/components/pump/GroupedPumpDetailsModal';

const generateId = () => crypto.randomUUID();

const generateRandomSerialNumber = () => `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

export default function HomePage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [filteredPumps, setFilteredPumps] = useState<Pump[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPumpForDetails, setSelectedPumpForDetails] = useState<Pump | null>(null);
  const [isPumpDetailsModalOpen, setIsPumpDetailsModalOpen] = useState(false);
  
  const [missingInfoPump, setMissingInfoPump] = useState<Pump | null>(null);
  const [missingInfoTargetStage, setMissingInfoTargetStage] = useState<StageId | null>(null);
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);

  const [selectedPumpIdsForDrag, setSelectedPumpIdsForDrag] = useState<string[]>([]);

  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState<{ model: string; pumps: Pump[] } | null>(null);
  const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] = useState(false);

  const [explodedGroups, setExplodedGroups] = useState<Record<StageId, Set<string>>>({});
  const [columnViewModes, setColumnViewModes] = useState<Record<StageId, ViewMode>>(() =>
    STAGES.reduce((acc, stage) => ({ ...acc, [stage.id]: 'default' }), {} as Record<StageId, ViewMode>)
  );

  const { toast } = useToast();
  
  useEffect(() => {
    const now = new Date().toISOString();
    const initialSamplePumps: Pump[] = [
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO123', currentStage: 'open-jobs', notes: 'Initial inspection pending.', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[1], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO456', currentStage: 'assembly', notes: 'Waiting for part XYZ.', priority: 'high', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO788', currentStage: 'open-jobs', notes: 'Urgent.', priority: 'urgent', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[2], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO789', currentStage: 'testing', powderCoater: POWDER_COATERS[0], powderCoatColor: DEFAULT_POWDER_COAT_COLORS[0], notes: 'High pressure test passed.', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[3], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[3], poNumber: 'PO124', currentStage: 'powder-coat', powderCoater: POWDER_COATERS[1], powderCoatColor: DEFAULT_POWDER_COAT_COLORS[1], priority: 'high', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO101', currentStage: 'open-jobs', notes: 'Needs quick turnaround', priority: 'urgent', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[4], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[4], poNumber: 'PO567', currentStage: 'fabrication', priority: 'normal', createdAt: now, updatedAt: now },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO202', currentStage: 'open-jobs', priority: 'normal', createdAt: now, updatedAt: now },
    ];
    setPumps(initialSamplePumps);
  }, []);

  useEffect(() => {
    let tempPumps = [...pumps];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempPumps = tempPumps.filter(pump =>
        Object.values(pump).some(val =>
          String(val).toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
    
    // Apply other filters
    if (filters.serialNumber && filters.serialNumber.length > 0) {
      tempPumps = tempPumps.filter(p => p.serialNumber && filters.serialNumber!.some(sn => p.serialNumber!.toLowerCase().includes(sn.toLowerCase())));
    }
    if (filters.customer && filters.customer.length > 0) {
      tempPumps = tempPumps.filter(p => filters.customer!.includes(p.customer));
    }
    if (filters.poNumber && filters.poNumber.length > 0) {
      tempPumps = tempPumps.filter(p => p.poNumber && filters.poNumber!.some(po => p.poNumber.toLowerCase().includes(po.toLowerCase())));
    }
    if (filters.model && filters.model.length > 0) {
      tempPumps = tempPumps.filter(p => filters.model!.includes(p.model));
    }
    if (filters.powderCoater && filters.powderCoater.length > 0) {
      tempPumps = tempPumps.filter(p => p.powderCoater && filters.powderCoater!.includes(p.powderCoater));
    }
    if (filters.priority && filters.priority.length > 0) {
      tempPumps = tempPumps.filter(p => filters.priority!.includes(p.priority || 'normal'));
    }
    setFilteredPumps(tempPumps);
  }, [pumps, filters, searchTerm]);


  const handleUpdatePump = useCallback((updatedPump: Pump) => {
    const now = new Date().toISOString();
    setPumps(prev => prev.map(p => p.id === updatedPump.id ? {...updatedPump, updatedAt: now } : p));
    setSelectedPumpIdsForDrag([]); 
    toast({ title: "Pump Updated", description: `Details for ${updatedPump.serialNumber || 'Pump'} saved.` });
  }, [toast]);

  const handlePumpMove = useCallback((pumpId: string, newStageId: StageId) => {
    const pumpToMove = pumps.find(p => p.id === pumpId);
    if (!pumpToMove) return;
    const now = new Date().toISOString();

    if (newStageId === 'powder-coat' && (!pumpToMove.powderCoater || !pumpToMove.powderCoatColor)) {
      setMissingInfoPump(pumpToMove);
      setMissingInfoTargetStage(newStageId);
      setIsMissingInfoModalOpen(true);
    } else {
      setPumps(prev => prev.map(p => p.id === pumpId ? { ...p, currentStage: newStageId, updatedAt: now } : p));
      const stageTitle = STAGES.find(s => s.id === newStageId)?.title || newStageId;
      toast({ title: "Pump Moved", description: `${pumpToMove.serialNumber || 'Pump'} moved to ${stageTitle}.` });
    }
    setSelectedPumpIdsForDrag([]);
  }, [pumps, toast]);
  
  const handleMultiplePumpsMove = useCallback((pumpIdsToMove: string[], newStageId: StageId) => {
    let powderCoatInfoMissing = false;
    let firstMissingPumpForModal: Pump | null = null;
    const now = new Date().toISOString();

    for (const pumpId of pumpIdsToMove) {
      const pump = pumps.find(p => p.id === pumpId);
      if (pump) {
        if (newStageId === 'powder-coat' && (!pump.powderCoater || !pump.powderCoatColor)) {
          powderCoatInfoMissing = true;
          if (!firstMissingPumpForModal) { 
            firstMissingPumpForModal = pump;
          }
        }
      }
    }

    if (powderCoatInfoMissing && newStageId === 'powder-coat' && firstMissingPumpForModal) {
        setMissingInfoPump(firstMissingPumpForModal); 
        setMissingInfoTargetStage(newStageId);
        setIsMissingInfoModalOpen(true);
        // Do not proceed with the move for any pumps if one is missing info for powder coat
        toast({
          variant: "destructive",
          title: "Move Halted",
          description: "One or more pumps require powder coat information. Please update the prompted pump or cancel the move.",
        });
        setSelectedPumpIdsForDrag([]); 
        return; 
    }
    
    setPumps(prev => 
      prev.map(p => 
        pumpIdsToMove.includes(p.id) ? { ...p, currentStage: newStageId, updatedAt: now } : p
      )
    );
    const stageTitle = STAGES.find(s => s.id === newStageId)?.title || newStageId;
    toast({ title: `${pumpIdsToMove.length} Pump(s) Moved`, description: `Moved to ${stageTitle}.` });
    setSelectedPumpIdsForDrag([]);
  }, [pumps, toast]);


  const handleSaveMissingInfo = useCallback((pumpId: string, data: Partial<Pump>) => {
    const now = new Date().toISOString();
    setPumps(prev => prev.map(p => p.id === pumpId ? { ...p, ...data, currentStage: missingInfoTargetStage!, updatedAt: now } : p));
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
        if (prevSelectedIds.length > 0 && firstSelectedPump && firstSelectedPump.currentStage !== clickedPump.currentStage) {
          return [clickedPump.id]; 
        }

        if (prevSelectedIds.includes(clickedPump.id)) {
          return prevSelectedIds.filter(id => id !== clickedPump.id);
        } else {
          return [...prevSelectedIds, clickedPump.id];
        }
      });
    } else {
      setSelectedPumpIdsForDrag([clickedPump.id]);
    }
  }, [pumps]);

  const handleOpenGroupDetailsModal = useCallback((model: string, pumpsInGroup: Pump[]) => {
    setSelectedGroupForDetails({ model, pumps: pumpsInGroup });
    setIsGroupDetailsModalOpen(true);
  }, []);

  const handleToggleColumnViewMode = useCallback((stageId: StageId) => {
    setColumnViewModes(prevModes => {
        const newMode = prevModes[stageId] === 'default' ? 'condensed' : 'default';
        const updatedModes = { ...prevModes, [stageId]: newMode };

        if (newMode === 'default') { 
            setExplodedGroups(prevExploded => {
                const currentExplodedForStage = prevExploded[stageId] || new Set();
                if (currentExplodedForStage.size > 0) { 
                    return {
                        ...prevExploded,
                        [stageId]: new Set<string>(), 
                    };
                }
                return prevExploded; 
            });
        }
        return updatedModes;
    });
  }, []);

  const handleToggleExplodeGroup = useCallback((stageId: StageId, model: string) => {
    setExplodedGroups(prev => {
      const newExplodedForStage = new Set(prev[stageId] || []);
      if (newExplodedForStage.has(model)) {
        newExplodedForStage.delete(model);
      } else {
        newExplodedForStage.add(model);
      }
      return {
        ...prev,
        [stageId]: newExplodedForStage,
      };
    });
  }, []);

  const allPumpModels = PUMP_MODELS;
  const allCustomerNames = CUSTOMER_NAMES;
  const allPriorities = PRIORITY_LEVELS;

  const powderCoatersInPumps = pumps
    .map(p => p.powderCoater)
    .filter((pc): pc is string => typeof pc === 'string' && pc.length > 0);
  const allPowderCoaters = Array.from(new Set(powderCoatersInPumps.concat(POWDER_COATERS))).sort();

  const allSerialNumbers = Array.from(new Set(pumps.map(p => p.serialNumber).filter((sn): sn is string => !!sn))).sort();
  const allPONumbers = Array.from(new Set(pumps.map(p => p.poNumber).filter(Boolean as unknown as (value: string | undefined) => value is string))).sort();


  return (
    <div className="flex flex-col h-full">
      <EnhancedHeader
        title="PumpTrack Workflow"
        showAddPump={false}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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
          columnViewModes={columnViewModes}
          onToggleColumnViewMode={handleToggleColumnViewMode}
          onPumpMove={handlePumpMove}
          onMultiplePumpsMove={handleMultiplePumpsMove}
          onOpenPumpDetailsModal={handleOpenPumpDetailsModal}
          onOpenGroupDetailsModal={handleOpenGroupDetailsModal}
          selectedPumpIdsForDrag={selectedPumpIdsForDrag}
          onPumpCardClick={handlePumpCardClick}
          explodedGroups={explodedGroups}
          onToggleExplodeGroup={handleToggleExplodeGroup}
        />
      </main>

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
    
