
import type { Stage } from '@/types';
import {
  ListTodo,
  Hammer,
  Wrench,
  TestTube2,
  SprayCan,
  Truck,
} from 'lucide-react';

export const STAGES: Stage[] = [
  { id: 'open-jobs', title: 'Open Jobs', icon: ListTodo },
  { id: 'fabrication', title: 'Fabrication', icon: Hammer },
  { id: 'powder-coat', title: 'Powder Coat', icon: SprayCan },
  { id: 'assembly', title: 'Assembly', icon: Wrench },
  { id: 'testing', title: 'Testing', icon: TestTube2 },
  { id: 'shipped', title: 'Shipped', icon: Truck },
];

export const POWDER_COATERS: string[] = [
  'Acme Powder Coating',
  'Best Finishers Inc.',
  'ColorWorks Pro',
  'Durable Coats LLC',
];

export const PUMP_MODELS: string[] = [
  'DD4SE',
  'DD6',
  'DD6-SAFE',
  'DV6',
  'RL200',
  'RL200-SAFE',
  'RL300',
  'RL300-SAFE',
  'HC150-SAFE',
];

export const CUSTOMER_NAMES: string[] = [
  'United Rentals',
  'Herc',
  'Sunbelt Rentals',
  'Rain for Rent',
  'Ring Power',
];

export const DEFAULT_POWDER_COAT_COLORS: string[] = [
  'RAL 9005 (Jet Black)',
  'RAL 7035 (Light Grey)',
  'RAL 5015 (Sky Blue)',
  'RAL 3020 (Traffic Red)',
  'RAL 6018 (Yellow Green)',
];

export const PRIORITY_LEVELS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;
