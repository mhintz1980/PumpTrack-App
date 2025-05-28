
import type { LucideIcon } from 'lucide-react';

export type StageId =
  | 'open-jobs'
  | 'fabrication'
  | 'assembly'
  | 'testing'
  | 'powder-coat'
  | 'shipped';

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
}

export interface Stage {
  id: StageId;
  title: string;
  icon: LucideIcon;
}

export type ViewMode = 'default' | 'condensed'; // Updated

export interface Filters {
  serialNumber?: string;
  customer?: string;
  poNumber?: string;
  model?: string;
  powderCoater?: string;
}
