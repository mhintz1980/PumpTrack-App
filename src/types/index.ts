
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
  id: string; // Unique identifier for the pump
  model: string;
  serialNumber?: string;
  customer: string;
  poNumber: string;
  currentStage: StageId;
  powderCoater?: string;
  powderCoatColor?: string;
  notes?: string;
  priority?: PriorityLevel;
  durationDays?: number; // New field for editable duration
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

// New type for Activity Log Entries
export type ActivityLogType =
  | 'PUMP_CREATED'
  | 'PUMP_UPDATED'
  | 'STAGE_MOVED'
  | 'NOTE_ADDED'
  | 'NOTE_UPDATED'
  | 'PRIORITY_CHANGED'
  | 'DETAILS_EDITED' // Generic for other field changes
  | 'PUMP_ARCHIVED'
  | 'PUMP_DELETED';

export interface ActivityLogEntry {
  id: string; // Unique ID for the log entry
  pumpId: string; // ID of the pump this log refers to
  timestamp: string; // ISO date string of when the activity occurred
  type: ActivityLogType; // The type of activity
  description: string; // Human-readable description of the change
  details?: Record<string, any>; // Optional field for specific changed values, e.g., { fromStage: 'A', toStage: 'B', field: 'serialNumber', oldValue: 'X', newValue: 'Y' }
  userId?: string; // Optional: ID of the user who performed the action (for future use with authentication)
}
