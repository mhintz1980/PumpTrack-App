import type { Pump } from "@/types";

export const samplePumps: Pump[] = [
  {
    id: "pump-1",
    model: "Model A",
    customer: "Customer",
    poNumber: "PO-1",
    currentStage: "open-jobs",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const getAllPumps = jest.fn(async () => samplePumps);

export const addPumpWithActivityLog = jest.fn();
export const updatePumpWithActivityLog = jest.fn();
export const movePumpStageWithActivityLog = jest.fn();
export const getPumpActivityLog = jest.fn();
export const addNoteToPumpWithActivityLog = jest.fn();
