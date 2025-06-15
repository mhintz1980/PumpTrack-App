
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
import type { Pump } from "@/types";
import { GripVertical, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  pump: Pump;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, pumpId: string) => void;
  onCardClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onOpenDetailsModal?: () => void;
  isDraggable?: boolean;
  isSelected?: boolean;
}

export const KanbanCard = React.memo(function KanbanCard({
  pump,
  onDragStart,
  onCardClick,
  onOpenDetailsModal,
  isDraggable = true,
  isSelected = false,
}: KanbanCardProps) {
  const displaySerialNumber = pump.serialNumber || "N/A";

  const handleEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenDetailsModal) {
      onOpenDetailsModal();
    }
  };

  const priorityClass = () => {
    switch (pump.priority) {
      case "high":
        return "border-orange-500";
      case "urgent":
        return "border-red-600";
      default:
        return "";
    }
  };

  return (
    <Card
      draggable={isDraggable}
      onDragStart={isDraggable ? (e) => onDragStart(e, pump.id) : undefined}
      onClick={onCardClick}
      className={cn(
        "glass-card group w-[12.75rem]", // Adjusted width
        pump.priority === "high" && "priority-high",
        pump.priority === "urgent" && "priority-urgent",
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
          {onOpenDetailsModal && (
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
                <TooltipContent sideOffset={8} className="glass-tooltip">
                  <p>View pump details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isDraggable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="cursor-grab glass-drag-handle"
                    aria-label="Drag pump"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className="glass-tooltip">
                  <p>Drag pump</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="glass-card-content" />
    </Card>
  );
});

