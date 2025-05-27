import type { Stage } from '@/types';
import {
  ListTodo,
  Archive,
  Wrench,
  TestTube2,
  SprayCan,
  CheckCircle2,
  Package,
  Truck,
} from 'lucide-react';

export const STAGES: Stage[] = [
  { id: 'open-jobs', title: 'Open Jobs', icon: ListTodo },
  { id: 'parts-staged', title: 'Parts Staged', icon: Archive },
  { id: 'assembly', title: 'Assembly', icon: Wrench },
  { id: 'testing', title: 'Testing', icon: TestTube2 },
  { id: 'powder-coat', title: 'Powder Coat', icon: SprayCan },
  { id: 'final-qc', title: 'Final QC', icon: CheckCircle2 },
  { id: 'ready-to-ship', title: 'Ready to Ship', icon: Package },
  { id: 'shipped', title: 'Shipped', icon: Truck },
];

export const POWDER_COATERS: string[] = [
  'Acme Powder Coating',
  'Best Finishers Inc.',
  'ColorWorks Pro',
  'Durable Coats LLC',
];

export const PUMP_MODELS: string[] = [
  'Model X100',
  'Model Y200',
  'Model Z300 Pro',
  'CompactFlow 50',
  'HeavyDuty 5000',
];

export const DEFAULT_POWDER_COAT_COLORS: string[] = [
  'RAL 9005 (Jet Black)',
  'RAL 7035 (Light Grey)',
  'RAL 5015 (Sky Blue)',
  'RAL 3020 (Traffic Red)',
  'RAL 6018 (Yellow Green)',
];
