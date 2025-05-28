
import type { LucideIcon } from 'lucide-react';
import type { PRIORITY_LEVELS } from '@/lib/constants';

export type StageId =
  | 'open-jobs'
  | 'fabrication'
  | 'assembly'
  | 'testing'
  | 'powder-coat'
  | 'shipped';

export type PriorityLevel = typeof PRIORITY_LEVELS[number]['value'];

export interface Pump {
  id: string;
  model: string;
  serialNumber?: string;
  customer: string;
  poNumber: string;
  currentStage: StageId;
  powderCoater?: string;
  powderCoatColor?: string;
  notes?: string;
  priority?: PriorityLevel;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PumpMovement {
  id: string;
  pumpId: string;
  fromStage: StageId | null; // Null if it's the initial creation
  toStage: StageId;
  movedAt: string; // ISO date string
}

export interface Stage {
  id: StageId;
  title: string;
  icon: LucideIcon;
}

export type ViewMode = 'default' | 'condensed';

export interface Filters {
  serialNumber?: string[];
  customer?: string[];
  poNumber?: string[];
  model?: string[];
  powderCoater?: string[];
  priority?: string[];
}
