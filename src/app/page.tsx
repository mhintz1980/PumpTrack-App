
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { AddPumpForm } from '@/components/pump/AddPumpForm';
import { PumpDetailsModal } from '@/components/pump/PumpDetailsModal';
import { MissingInfoModal } from '@/components/pump/MissingInfoModal';
import type { Pump, StageId, ViewMode, Filters } from '@/types';
import { STAGES, POWDER_COATERS, PUMP_MODELS, CUSTOMER_NAMES, DEFAULT_POWDER_COAT_COLORS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID();

// Helper to generate random serial numbers for initial sample data
const generateRandomSerialNumber = () => `MSP-JN-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;


export default function HomePage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [filteredPumps, setFilteredPumps] = useState<Pump[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [filters, setFilters] = useState<Filters>({});
  
  const [isAddPumpModalOpen, setIsAddPumpModalOpen] = useState(false);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);
  const [isPumpDetailsModalOpen, setIsPumpDetailsModalOpen] = useState(false);
  
  const [missingInfoPump, setMissingInfoPump] = useState<Pump | null>(null);
  const [missingInfoTargetStage, setMissingInfoTargetStage] = useState<StageId | null>(null);
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);

  const { toast } = useToast();
  
  useEffect(() => {
    // Client-side only effect to set initial pumps
    const initialSamplePumps: Pump[] = [
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO123', currentStage: 'open-jobs', notes: 'Initial inspection pending.' },
      { id: generateId(), model: PUMP_MODELS[1], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO456', currentStage: 'assembly', notes: 'Waiting for part XYZ.' },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[0], poNumber: 'PO788', currentStage: 'open-jobs', notes: 'Urgent.' },
      { id: generateId(), model: PUMP_MODELS[2], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO789', currentStage: 'testing', powderCoater: POWDER_COATERS[0], powderCoatColor: DEFAULT_POWDER_COAT_COLORS[0], notes: 'High pressure test passed.' },
      { id: generateId(), model: PUMP_MODELS[3], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[3], poNumber: 'PO124', currentStage: 'powder-coat', powderCoater: POWDER_COATERS[1], powderCoatColor: DEFAULT_POWDER_COAT_COLORS[1] },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[1], poNumber: 'PO101', currentStage: 'open-jobs', notes: 'Needs quick turnaround' },
      { id: generateId(), model: PUMP_MODELS[4], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[4], poNumber: 'PO567', currentStage: 'fabrication' },
      { id: generateId(), model: PUMP_MODELS[0], serialNumber: generateRandomSerialNumber(), customer: CUSTOMER_NAMES[2], poNumber: 'PO202', currentStage: 'open-jobs' },
    ];
    setPumps(initialSamplePumps);
  }, []);


  // Filter pumps based on current filters
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
    setFilteredPumps(tempPumps);
  }, [pumps, filters]);

  const handleAddPump = useCallback((newPumpData: Omit<Pump, 'id' | 'currentStage'> & { quantity: number; serialNumber?: string }) => {
    const { quantity, serialNumber: startSerialNumber, ...basePumpData } = newPumpData;
    const newPumps: Pump[] = [];
    let currentSerialNumberNumeric = -1;

    if (quantity > 1 && startSerialNumber && /^MSP-JN-\d{4}$/.test(startSerialNumber)) {
      currentSerialNumberNumeric = parseInt(startSerialNumber.substring(7), 10);
    }

    for (let i = 0; i < quantity; i++) {
      let pumpSerialNumber: string | undefined = undefined;
      if (quantity === 1 && startSerialNumber && /^MSP-JN-\d{4}$/.test(startSerialNumber)) {
        pumpSerialNumber = startSerialNumber;
      } else if (quantity > 1 && currentSerialNumberNumeric !== -1) {
        if (currentSerialNumberNumeric + i <= 9999) { // Basic check for serial number limit
            pumpSerialNumber = `MSP-JN-${String(currentSerialNumberNumeric + i).padStart(4, '0')}`;
        }
      } else if (quantity > 1 && !startSerialNumber) {
        pumpSerialNumber = undefined;
      } else if (quantity === 1 && (!startSerialNumber || !/^MSP-JN-\d{4}$/.test(startSerialNumber))) {
         // This case should be caught by form validation making serialNumber required and valid if quantity is 1
        console.error("Serial number is required and must be valid for single pump addition.");
        return; // Or handle error appropriately
      }


      const newPump: Pump = {
        ...basePumpData,
        id: generateId(),
        serialNumber: pumpSerialNumber,
        currentStage: 'open-jobs',
        notes: basePumpData.notes || undefined,
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
  }, [pumps, toast]);
  
  const handleMultiplePumpsMove = useCallback((pumpIdsToMove: string[], newStageId: StageId) => {
    const pumpsToActuallyMove: Pump[] = [];
    let powderCoatInfoMissing = false;

    for (const pumpId of pumpIdsToMove) {
      const pump = pumps.find(p => p.id === pumpId);
      if (pump) {
        if (newStageId === 'powder-coat' && (!pump.powderCoater || !pump.powderCoatColor)) {
          powderCoatInfoMissing = true;
          // For simplicity, we'll only set the first missing pump for the modal, 
          // but the move will be blocked for all if any are missing.
          if (!missingInfoPump) { 
            setMissingInfoPump(pump);
            setMissingInfoTargetStage(newStageId);
          }
        }
        pumpsToActuallyMove.push(pump);
      }
    }

    if (powderCoatInfoMissing && newStageId === 'powder-coat') {
      toast({
        variant: "destructive",
        title: "Move Aborted",
        description: "One or more pumps require powder coat information before moving to Powder Coat. Please update them individually.",
      });
      // Optionally open modal for the first identified missing pump, but actual move is blocked
      // setIsMissingInfoModalOpen(true); 
      return; 
    }
    
    setPumps(prev => 
      prev.map(p => 
        pumpIdsToMove.includes(p.id) ? { ...p, currentStage: newStageId } : p
      )
    );
    const stageTitle = STAGES.find(s => s.id === newStageId)?.title || newStageId;
    toast({ title: `${pumpIdsToMove.length} Pump(s) Moved`, description: `Moved to ${stageTitle}.` });

  }, [pumps, toast, missingInfoPump]);


  const handleSaveMissingInfo = useCallback((pumpId: string, data: Partial<Pump>) => {
    setPumps(prev => prev.map(p => p.id === pumpId ? { ...p, ...data, currentStage: missingInfoTargetStage! } : p));
    const pump = pumps.find(p => p.id === pumpId); // Find the updated pump
    if (pump && missingInfoTargetStage) {
       const stageTitle = STAGES.find(s => s.id === missingInfoTargetStage)?.title || missingInfoTargetStage;
       toast({ title: "Info Saved & Pump Moved", description: `${pump.serialNumber || 'Pump'} updated and moved to ${stageTitle}.` });
    }
    setMissingInfoPump(null);
    setMissingInfoTargetStage(null);
  }, [pumps, missingInfoTargetStage, toast]); // Added pumps to dependency array

  const handleCardClick = useCallback((pump: Pump) => {
    setSelectedPump(pump);
    setIsPumpDetailsModalOpen(true);
  }, []);

  const allPumpModels = PUMP_MODELS; // Directly use the constant
  
  const powderCoatersInPumps = pumps
    .map(p => p.powderCoater)
    .filter((pc): pc is string => typeof pc === 'string' && pc.length > 0);
  const allPowderCoaters = Array.from(new Set(powderCoatersInPumps.concat(POWDER_COATERS))).sort();
  
  const allCustomerNames = CUSTOMER_NAMES; // Directly use the constant
  
  const allSerialNumbers = Array.from(new Set(pumps.map(p => p.serialNumber).filter((sn): sn is string => !!sn))).sort();
  const allPONumbers = Array.from(new Set(pumps.map(p => p.poNumber))).sort();


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
      />
      <main className="flex-grow overflow-hidden">
        <KanbanBoard
          pumps={filteredPumps}
          viewMode={viewMode}
          onPumpMove={handlePumpMove}
          onMultiplePumpsMove={handleMultiplePumpsMove}
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
