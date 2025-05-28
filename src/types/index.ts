
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
}

export interface Stage {
  id: StageId;
  title: string;
  icon: LucideIcon;
}

export type ViewMode = 'default' | 'condensed';

export interface Filters {
  serialNumber?: string;
  customer?: string;
  poNumber?: string;
  model?: string;
  powderCoater?: string;
  priority?: PriorityLevel;
}

