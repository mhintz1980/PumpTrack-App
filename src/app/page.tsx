
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { AddPumpForm } from '@/components/pump/AddPumpForm';
import { PumpDetailsModal } from '@/components/pump/PumpDetailsModal';
import { MissingInfoModal } from '@/components/pump/MissingInfoModal';
import type { Pump, StageId, ViewMode, Filters } from '@/types';
import { STAGES, POWDER_COATERS, PUMP_MODELS } from '@/lib/constants'; // Ensure PUMP_MODELS is exported
import { useToast } from '@/hooks/use-toast';

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID();

// Sample initial data
const initialPumps: Pump[] = [
  { id: generateId(), model: 'Model X100', serialNumber: 'SN001', customer: 'Customer A', poNumber: 'PO123', currentStage: 'open-jobs', notes: 'Initial inspection pending.' },
  { id: generateId(), model: 'Model Y200', serialNumber: 'SN002', customer: 'Customer B', poNumber: 'PO456', currentStage: 'assembly', notes: 'Waiting for part XYZ.' },
  { id: generateId(), model: 'Model Z300 Pro', serialNumber: 'SN003', customer: 'Customer C', poNumber: 'PO789', currentStage: 'testing', powderCoater: 'Acme Powder Coating', powderCoatColor: 'RAL 9005 (Jet Black)', notes: 'High pressure test passed.' },
  { id: generateId(), model: 'CompactFlow 50', serialNumber: 'SN004', customer: 'Customer A', poNumber: 'PO124', currentStage: 'powder-coat', powderCoater: 'Best Finishers Inc.', powderCoatColor: 'RAL 7035 (Light Grey)' },
];


export default function HomePage() {
  const [pumps, setPumps] = useState<Pump[]>(initialPumps);
  const [filteredPumps, setFilteredPumps] = useState<Pump[]>(initialPumps);
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [filters, setFilters] = useState<Filters>({});
  
  const [isAddPumpModalOpen, setIsAddPumpModalOpen] = useState(false);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);
  const [isPumpDetailsModalOpen, setIsPumpDetailsModalOpen] = useState(false);
  
  const [missingInfoPump, setMissingInfoPump] = useState<Pump | null>(null);
  const [missingInfoTargetStage, setMissingInfoTargetStage] = useState<StageId | null>(null);
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);

  const { toast } = useToast();

  // Filter pumps based on current filters
  useEffect(() => {
    let tempPumps = [...pumps];
    if (filters.serialNumber) {
      tempPumps = tempPumps.filter(p => p.serialNumber.toLowerCase().includes(filters.serialNumber!.toLowerCase()));
    }
    if (filters.customer) {
      tempPumps = tempPumps.filter(p => p.customer.toLowerCase().includes(filters.customer!.toLowerCase()));
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
    setFilteredPumps(tempPumps);
  }, [pumps, filters]);

  const handleAddPump = useCallback((newPumpData: Omit<Pump, 'id' | 'currentStage'>) => {
    const newPump: Pump = {
      ...newPumpData,
      id: generateId(),
      currentStage: 'open-jobs',
    };
    setPumps(prev => [newPump, ...prev]);
    toast({ title: "Pump Added", description: `${newPump.serialNumber} added to Open Jobs.` });
  }, [toast]);

  const handleUpdatePump = useCallback((updatedPump: Pump) => {
    setPumps(prev => prev.map(p => p.id === updatedPump.id ? updatedPump : p));
    toast({ title: "Pump Updated", description: `Details for ${updatedPump.serialNumber} saved.` });
  }, [toast]);

  const handlePumpMove = useCallback((pumpId: string, newStageId: StageId) => {
    const pumpToMove = pumps.find(p => p.id === pumpId);
    if (!pumpToMove) return;

    // Check for missing info for 'powder-coat' stage
    if (newStageId === 'powder-coat' && (!pumpToMove.powderCoater || !pumpToMove.powderCoatColor)) {
      setMissingInfoPump(pumpToMove);
      setMissingInfoTargetStage(newStageId);
      setIsMissingInfoModalOpen(true);
    } else {
      setPumps(prev => prev.map(p => p.id === pumpId ? { ...p, currentStage: newStageId } : p));
      const stageTitle = STAGES.find(s => s.id === newStageId)?.title || newStageId;
      toast({ title: "Pump Moved", description: `${pumpToMove.serialNumber} moved to ${stageTitle}.` });
    }
  }, [pumps, toast]);

  const handleSaveMissingInfo = useCallback((pumpId: string, data: Partial<Pump>) => {
    setPumps(prev => prev.map(p => p.id === pumpId ? { ...p, ...data, currentStage: missingInfoTargetStage! } : p));
    const pump = pumps.find(p => p.id === pumpId);
    if (pump && missingInfoTargetStage) {
       const stageTitle = STAGES.find(s => s.id === missingInfoTargetStage)?.title || missingInfoTargetStage;
       toast({ title: "Info Saved & Pump Moved", description: `${pump.serialNumber} updated and moved to ${stageTitle}.` });
    }
    setMissingInfoPump(null);
    setMissingInfoTargetStage(null);
  }, [pumps, missingInfoTargetStage, toast]);

  const handleCardClick = useCallback((pump: Pump) => {
    setSelectedPump(pump);
    setIsPumpDetailsModalOpen(true);
  }, []);

  const allPumpModels = Array.from(new Set(pumps.map(p => p.model).concat(PUMP_MODELS))).sort();
  const allPowderCoaters = Array.from(new Set(pumps.map(p => p.powderCoater).filter(Boolean).concat(POWDER_COATERS))).sort();


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
      />
      <main className="flex-grow overflow-hidden">
        <KanbanBoard
          pumps={filteredPumps}
          viewMode={viewMode}
          onPumpMove={handlePumpMove}
          onCardClick={handleCardClick}
        />
      </main>

      <AddPumpForm
        isOpen={isAddPumpModalOpen}
        onClose={() => setIsAddPumpModalOpen(false)}
        onAddPump={handleAddPump}
      />

      {selectedPump && (
        <PumpDetailsModal
          isOpen={isPumpDetailsModalOpen}
          onClose={() => { setIsPumpDetailsModalOpen(false); setSelectedPump(null); }}
          pump={selectedPump}
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
    </div>
  );
}

