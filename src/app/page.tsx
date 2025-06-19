
"use client";

import React from 'react'; // React import is often implicit in Next.js but good for clarity
import { useHomePageLogic } from '@/app/useHomePageLogic';
import { EnhancedHeader } from '@/components/layout/EnhancedHeader';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { PumpDetailsModal } from '@/components/pump/PumpDetailsModal';
import { MissingInfoModal } from '@/components/pump/MissingInfoModal';
import { GroupedPumpDetailsModal } from '@/components/pump/GroupedPumpDetailsModal';
import { Loader2 } from 'lucide-react'; // For loading indicator



export default function HomePage() {
  const {
    filteredPumps,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    isLoading,
    selectedPumpForDetails,
    isPumpDetailsModalOpen,
    setIsPumpDetailsModalOpen,
    missingInfoPump,
    isMissingInfoModalOpen,
    setIsMissingInfoModalOpen,
    missingInfoTargetStage,
    selectedGroupForDetails,
    isGroupDetailsModalOpen,
    setIsGroupDetailsModalOpen,
    handleUpdatePump,
    handlePumpMove,
    handleSaveMissingInfo,
    handleOpenPumpDetailsModal,
    allPumpModels,
    allCustomerNames,
    allPriorities,
    allPowderCoaters,
    allSerialNumbers,
    allPONumbers,
    columnViewModes,
    onToggleColumnViewMode,
    onMultiplePumpsMove,
    onOpenGroupDetailsModal,
    selectedPumpIdsForDrag,
    onPumpCardClick
  } = useHomePageLogic();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100"
        data-ai-hint="abstract background"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-xl text-glass-text-primary font-semibold">Loading Pump Data...</p>
      </div>
    );
  }

  return (
    <div
      className="kanban-page flex flex-col min-h-screen"
      data-ai-hint="abstract background"
    >
      <EnhancedHeader
        title="PumpTrack Workflow"
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
      <main
        className="flex-grow overflow-hidden" // Ensure main content can scroll if KanbanBoard overflows
        style={{ paddingTop: 'var(--header-height-value)' }} // Account for fixed header height
      >
        <KanbanBoard
          pumps={filteredPumps} // Use filteredPumps for the board
          columnViewModes={columnViewModes}
          onToggleColumnViewMode={onToggleColumnViewMode}
          onPumpMove={handlePumpMove}
          onMultiplePumpsMove={onMultiplePumpsMove}
          onOpenPumpDetailsModal={handleOpenPumpDetailsModal}
          onOpenGroupDetailsModal={onOpenGroupDetailsModal}
          selectedPumpIdsForDrag={selectedPumpIdsForDrag}
          onPumpCardClick={onPumpCardClick}
        />
      </main>

      {/* Modals */}
      {selectedPumpForDetails && (
        <PumpDetailsModal
          isOpen={isPumpDetailsModalOpen}
          onClose={() => setIsPumpDetailsModalOpen(false)}
          pump={selectedPumpForDetails}
          onUpdatePump={handleUpdatePump}
        />
      )}

      {missingInfoPump && missingInfoTargetStage && (
        <MissingInfoModal
          isOpen={isMissingInfoModalOpen}
          onClose={() => setIsMissingInfoModalOpen(false)}
          pump={missingInfoPump}
          targetStageId={missingInfoTargetStage}
          onSave={handleSaveMissingInfo}
        />
      )}

      {selectedGroupForDetails && (
        <GroupedPumpDetailsModal
          isOpen={isGroupDetailsModalOpen}
          onClose={() => setIsGroupDetailsModalOpen(false)}
          modelName={selectedGroupForDetails.model}
          pumpsInGroup={selectedGroupForDetails.pumps}
          onOpenIndividualPumpDetails={handleOpenPumpDetailsModal}
        />
      )}
    </div>
  );
}
