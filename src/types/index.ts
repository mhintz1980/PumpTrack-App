
import type { LucideIcon } from 'lucide-react';

export type StageId =
  | 'open-jobs'
  | 'fabrication' // Was 'parts-staged'
  | 'assembly'
  | 'testing'
  | 'powder-coat'
  // | 'final-qc' // Removed
  // | 'ready-to-ship' // Removed
  | 'shipped';

export interface Pump {
  id: string;
  model: string;
  serialNumber?: string; // Made optional
  customer: string;
  poNumber: string;
  currentStage: StageId;
  powderCoater?: string;
  powderCoatColor?: string;
  notes?: string;
}

export interface Stage {
  id: StageId;
  title: string;
  icon: LucideIcon;
}

export type ViewMode = 'detailed' | 'condensed';

export interface Filters {
  serialNumber?: string;
  customer?: string;
  poNumber?: string;
  model?: string;
  powderCoater?: string;
}
