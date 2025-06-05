
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Pump, StageId, ViewMode, Filters } from '@/types';
import { STAGES, POWDER_COATERS, PUMP_MODELS, CUSTOMER_NAMES, DEFAULT_POWDER_COAT_COLORS, PRIORITY_LEVELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { EnhancedHeader } from '@/components/layout/EnhancedHeader';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { AddPumpForm } from '@/components/pump/AddPumpForm';
import { PumpDetailsModal } from '@/components/pump/PumpDetailsModal';
import { MissingInfoModal } from '@/components/pump/MissingInfoModal';
import { GroupedPumpDetailsModal } from '@/components/pump/GroupedPumpDetailsModal';
import * as pumpService from '@/services/pumpService'; // Import pumpService

export default function HomePage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [filteredPumps, setFilteredPumps] = useState<Pump[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // For initial data load
  
  const [isAddPumpModalOpen, setIsAddPumpModalOpen] = useState(false);
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
    const fetchPumps = async () => {
      setIsLoading(true);
      try {
        // For now, pumpService.getAllPumps() will return mock data.
        // Later, this will fetch from the backend.
        const fetchedPumps = await pumpService.getAllPumps();
        setPumps(fetchedPumps);
      } catch (error) {
        console.error("Failed to fetch pumps:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load pump data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPumps();
  }, [toast]);

  useEffect(() => {
    let tempPumps = [...pumps];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempPumps = tempPumps.filter(pump =>
        Object.values(pump).some(val =>
          String(val).toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
    
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

  const handleAddPumps = useCallback(async (newPumpsData: Array<Omit<Pump, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const addedPumps: Pump[] = [];
    let success = true;
    for (const pumpData of newPumpsData) {
      try {
        const newPump = await pumpService.addPumpWithActivityLog(pumpData);
        addedPumps.push(newPump);
      } catch (error) {
        console.error("Error adding pump:", error);
        toast({ variant: "destructive", title: "Add Pump Failed", description: `Could not add pump ${pumpData.serialNumber || pumpData.model}.` });
        success = false;
        break; 
      }
    }

    if (success) {
      setPumps(prev => [...prev, ...addedPumps]);
      if (newPumpsData.length === 1) {
        toast({ title: "Pump Added", description: `${addedPumps[0].serialNumber || addedPumps[0].model} has been added.` });
      } else {
        toast({ title: `${newPumpsData.length} Pumps Added`, description: "Batch added successfully." });
      }
    }
    setIsAddPumpModalOpen(false);
  }, [toast]);

  const handleUpdatePump = useCallback(async (updatedPumpData: Pump) => {
    const originalPump = pumps.find(p => p.id === updatedPumpData.id);
    if (!originalPump) {
      toast({ variant: "destructive", title: "Update Error", description: "Original pump not found." });
      return;
    }
    try {
      const savedPump = await pumpService.updatePumpWithActivityLog(updatedPumpData.id, updatedPumpData, originalPump);
      setPumps(prev => prev.map(p => p.id === savedPump.id ? savedPump : p));
      toast({ title: "Pump Updated", description: `Details for ${savedPump.serialNumber || 'Pump'} saved.` });
    } catch (error) {
      console.error("Error updating pump:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not save pump details." });
    }
    setSelectedPumpIdsForDrag([]); 
    setIsPumpDetailsModalOpen(false);
    setSelectedPumpForDetails(null);
  }, [pumps, toast]);

  const handlePumpMove = useCallback(async (pumpId: string, newStageId: StageId) => {
    const pumpToMove = pumps.find(p => p.id === pumpId);
    if (!pumpToMove) return;

    if (newStageId === 'powder-coat' && (!pumpToMove.powderCoater || !pumpToMove.powderCoatColor)) {
      setMissingInfoPump(pumpToMove);
      setMissingInfoTargetStage(newStageId);
      setIsMissingInfoModalOpen(true);
    } else {
      try {
        const movedPump = await pumpService.movePumpStageWithActivityLog(pumpId, newStageId, pumpToMove);
        setPumps(prev => prev.map(p => p.id === pumpId ? movedPump : p));
        const stageTitle = STAGES.find(s => s.id === newStageId)?.title || newStageId;
        toast({ title: "Pump Moved", description: `${movedPump.serialNumber || 'Pump'} moved to ${stageTitle}.` });
      } catch (error) {
        console.error("Error moving pump:", error);
        toast({ variant: "destructive", title: "Move Failed", description: "Could not move pump." });
      }
    }
    setSelectedPumpIdsForDrag([]);
  }, [pumps, toast]);
  
  const handleMultiplePumpsMove = useCallback(async (pumpIdsToMove: string[], newStageId: StageId) => {
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
      }
    }

    if (powderCoatInfoMissing && newStageId === 'powder-coat' && firstMissingPumpForModal) {
        setMissingInfoPump(firstMissingPumpForModal); 
        setMissingInfoTargetStage(newStageId);
        setIsMissingInfoModalOpen(true);
        toast({
          variant: "destructive",
          title: "Move Halted",
          description: "One or more pumps require powder coat information. Please update the prompted pump or cancel the move.",
        });
        setSelectedPumpIdsForDrag([]); 
        return; 
    }
    
    const updatedPumpsPromises = pumpIdsToMove.map(async (pumpId) => {
      const pumpToMove = pumps.find(p => p.id === pumpId);
      if (pumpToMove) {
        try {
          return await pumpService.movePumpStageWithActivityLog(pumpId, newStageId, pumpToMove);
        } catch (error) {
          console.error(`Error moving pump ${pumpId}:`, error);
          toast({ variant: "destructive", title: "Move Failed", description: `Could not move pump ${pumpToMove.serialNumber || pumpId}.` });
          return pumpToMove; // Return original on error to avoid losing it from UI optimistically
        }
      }
      return null;
    });

    const results = (await Promise.all(updatedPumpsPromises)).filter((p): p is Pump => p !== null);
    
    setPumps(prev => {
      const newPumps = [...prev];
      results.forEach(movedPump => {
        const index = newPumps.findIndex(p => p.id === movedPump.id);
        if (index !== -1) {
          newPumps[index] = movedPump;
        }
      });
      return newPumps;
    });

    if (results.length > 0) {
      const stageTitle = STAGES.find(s => s.id === newStageId)?.title || newStageId;
      toast({ title: `${results.length} Pump(s) Moved`, description: `Moved to ${stageTitle}.` });
    }
    setSelectedPumpIdsForDrag([]);
  }, [pumps, toast]);

  const handleSaveMissingInfo = useCallback(async (pumpId: string, data: Partial<Pump>) => {
    const pumpToUpdate = pumps.find(p => p.id === pumpId);
    if (!pumpToUpdate || !missingInfoTargetStage) return;

    const updatesWithStage = { ...data, currentStage: missingInfoTargetStage };

    try {
      // Use updatePump for this as it's primarily an info update + a stage move
      // The log description in updatePump can be made more specific for this case if needed.
      const originalPumpForLog = { ...pumpToUpdate, currentStage: pumpToUpdate.currentStage }; // Log from original stage
      const savedPump = await pumpService.updatePumpWithActivityLog(pumpId, updatesWithStage, originalPumpForLog, 'STAGE_MOVED', `Pump ${pumpToUpdate.serialNumber || pumpToUpdate.model} updated with powder coat info and moved to ${missingInfoTargetStage}.`);
      
      setPumps(prev => prev.map(p => p.id === pumpId ? savedPump : p));
      const stageTitle = STAGES.find(s => s.id === missingInfoTargetStage)?.title || missingInfoTargetStage;
      toast({ title: "Info Saved & Pump Moved", description: `${savedPump.serialNumber || 'Pump'} updated and moved to ${stageTitle}.` });
    } catch (error) {
      console.error("Error saving missing info and moving pump:", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save info and move pump." });
    }
    
    setMissingInfoPump(null);
    setMissingInfoTargetStage(null);
    setIsMissingInfoModalOpen(false);
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p>Loading pump data...</p> {/* Replace with a proper loading spinner/skeleton later */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <EnhancedHeader
        title="PumpTrack Workflow"
        showAddPump={true} // Add Pump button is now controlled by showAddPump prop
        onAddPump={() => setIsAddPumpModalOpen(true)}
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

      <AddPumpForm
        isOpen={isAddPumpModalOpen}
        onClose={() => setIsAddPumpModalOpen(false)}
        onAddPump={handleAddPumps}
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
    
