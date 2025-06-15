
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Pump } from "@/types";

interface PlannablePump extends Pump {
  daysPerUnit: number;
}

interface SchedulePumpCardProps {
  pump: PlannablePump;
  isSelected: boolean;
  onCardClick: (pump: PlannablePump, event: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, pump: PlannablePump) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onOpenDetailsModal: (pump: PlannablePump) => void;
}

export const SchedulePumpCard = React.memo(function SchedulePumpCard({
  pump,
  isSelected,
  onCardClick,
  onDragStart,
  onDragEnd,
  onOpenDetailsModal,
}: SchedulePumpCardProps) {
  const displaySerialNumber = pump.serialNumber || "N/A";

  const handleEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetailsModal(pump);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-drag-handle]")) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onCardClick(pump, e);
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, pump);
  };

  const handleDragEndInternal = (e: React.DragEvent) => {
    const targetElement = e.currentTarget as HTMLElement;
    if (targetElement) {
      targetElement.style.opacity = "1";
    }
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const priorityClass = () => {
    switch (pump.priority) {
      case "high":
        return "priority-high";
      case "urgent":
        return "priority-urgent";
      default:
        return "";
    }
  };

  return (
    <Card
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndInternal}
      onClick={handleCardClick}
      className={cn(
        "glass-card group w-[16rem] cursor-grab active:cursor-grabbing select-none",
        priorityClass(),
        isSelected && "selected",
      )}
      aria-label={`Pump Model: ${pump.model}, Customer: ${pump.customer}, S/N: ${displaySerialNumber}, Priority: ${pump.priority || "normal"}`}
    >
      <CardHeader className="glass-card-header">
        <div className="flex-grow pr-2 space-y-0.5">
          <CardTitle className="glass-card-title">
            {pump.model}
          </CardTitle>
          <p className="glass-card-description">
            {pump.customer}
          </p>
          <p className="glass-card-description">
            S/N: {displaySerialNumber}
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass-button h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={handleEyeClick}
                  aria-label="View pump details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="glass-button">
                <p>View pump details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="cursor-grab glass-drag-handle"
                  aria-label="Drag pump"
                  data-drag-handle="true"
                >
                  <GripVertical className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="glass-button">
                <p>Drag pump</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="glass-card-content" />
    </Card>
  );
});

