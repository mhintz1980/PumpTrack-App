
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { EnhancedHeader } from '@/components/layout/EnhancedHeader';
const KanbanBoard = dynamic(() =>
  import('@/components/kanban/KanbanBoard').then(m => m.KanbanBoard)
);
const PumpDetailsModal = dynamic(() =>
  import('@/components/pump/PumpDetailsModal').then(m => m.PumpDetailsModal)
);
const MissingInfoModal = dynamic(() =>
  import('@/components/pump/MissingInfoModal').then(m => m.MissingInfoModal)
);
const GroupedPumpDetailsModal = dynamic(() =>
  import('@/components/pump/GroupedPumpDetailsModal').then(m => m.GroupedPumpDetailsModal)
);
import { useHomePageLogic } from './useHomePageLogic';
// HexGlassBackground is no longer used

export default function HomePage() {
  const {
    pumps,
    filteredPumps,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    isLoading,
    selectedPumpForDetails,
    setSelectedPumpForDetails,
    isPumpDetailsModalOpen,
    setIsPumpDetailsModalOpen,
    missingInfoPump,
    setMissingInfoPump,
    missingInfoTargetStage,
    setMissingInfoTargetStage,
    isMissingInfoModalOpen,
    setIsMissingInfoModalOpen,
    selectedPumpIdsForDrag,
    setSelectedPumpIdsForDrag,
    selectedGroupForDetails,
    setSelectedGroupForDetails,
    isGroupDetailsModalOpen,
    setIsGroupDetailsModalOpen,
    explodedGroups,
    setExplodedGroups,
    columnViewModes,
    setColumnViewModes,
    handleUpdatePump,
    handlePumpMove,
    handleMultiplePumpsMove,
    handleSaveMissingInfo,
    handleOpenPumpDetailsModal,
    handlePumpCardClick,
    handleOpenGroupDetailsModal,
    handleToggleColumnViewMode,
    handleToggleExplodeGroup,
    allPumpModels,
    allCustomerNames,
    allPriorities,
    allPowderCoaters,
    allSerialNumbers,
    allPONumbers,
  } = useHomePageLogic();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading pump data...</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen glass-board-container"
      data-ai-hint="abstract background" // Retaining this for your image hint reminder
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
        className="flex-grow overflow-hidden"
        style={{ paddingTop: 'var(--header-height-value)' }}
      >
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
    
