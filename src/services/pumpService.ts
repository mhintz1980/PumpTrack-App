
// Placeholder for pump service that will interact with a backend (e.g., Firebase Firestore)

import type { Pump, ActivityLogEntry, StageId, ActivityLogType } from '@/types';

/**
 * Simulates saving a new pump and logging its creation.
 * In a real implementation, this would interact with a database.
 */
export async function addPumpWithActivityLog(pumpData: Omit<Pump, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pump> {
  console.log('[PumpService] Adding pump:', pumpData);
  const newPump: Pump = {
    ...pumpData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  // Simulate logging
  const logEntry: ActivityLogEntry = {
    id: crypto.randomUUID(),
    pumpId: newPump.id,
    timestamp: newPump.createdAt,
    type: 'PUMP_CREATED',
    description: `Pump ${newPump.serialNumber || newPump.model} created for customer ${newPump.customer}.`,
    details: { pumpData: newPump }
  };
  console.log('[PumpService] Logging activity:', logEntry);
  // In a real app: await db.collection('pumps').doc(newPump.id).set(newPump);
  //                 await db.collection('activityLogs').add(logEntry);
  return newPump;
}

/**
 * Simulates updating an existing pump and logging the update.
 */
export async function updatePumpWithActivityLog(
  pumpId: string,
  updates: Partial<Omit<Pump, 'id' | 'createdAt' | 'updatedAt'>>,
  originalPump: Pump, // Needed to compare for specific change description
  activityType: ActivityLogType = 'PUMP_UPDATED',
  activityDescription?: string
): Promise<Pump> {
  console.log(`[PumpService] Updating pump ${pumpId} with:`, updates);
  
  const updatedPump: Pump = {
    ...originalPump,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  let desc = activityDescription;
  if (!desc) {
    // Generate a generic description if not provided
    const changedFields = Object.keys(updates).join(', ');
    desc = `Pump ${originalPump.serialNumber || originalPump.model} updated. Fields changed: ${changedFields}.`;
  }

  const logEntry: ActivityLogEntry = {
    id: crypto.randomUUID(),
    pumpId: pumpId,
    timestamp: updatedPump.updatedAt,
    type: activityType,
    description: desc,
    details: { updates, originalValues: originalPump } // Log what was changed
  };
  console.log('[PumpService] Logging activity:', logEntry);
  // In a real app: await db.collection('pumps').doc(pumpId).update(updatedPump);
  //                 await db.collection('activityLogs').add(logEntry);
  return updatedPump;
}

/**
 * Simulates moving a pump to a new stage and logging the movement.
 */
export async function movePumpStageWithActivityLog(
  pumpId: string,
  newStageId: StageId,
  originalPump: Pump
): Promise<Pump> {
  console.log(`[PumpService] Moving pump ${pumpId} to stage: ${newStageId}`);
  const updatedPump: Pump = {
    ...originalPump,
    currentStage: newStageId,
    updatedAt: new Date().toISOString(),
  };

  const logEntry: ActivityLogEntry = {
    id: crypto.randomUUID(),
    pumpId: pumpId,
    timestamp: updatedPump.updatedAt,
    type: 'STAGE_MOVED',
    description: `Pump ${originalPump.serialNumber || originalPump.model} moved from ${originalPump.currentStage} to ${newStageId}.`,
    details: { fromStage: originalPump.currentStage, toStage: newStageId }
  };
  console.log('[PumpService] Logging activity:', logEntry);
  // In a real app: await db.collection('pumps').doc(pumpId).update(updatedPump);
  //                 await db.collection('activityLogs').add(logEntry);
  return updatedPump;
}

/**
 * Simulates fetching all pumps.
 */
export async function getAllPumps(): Promise<Pump[]> {
  console.log('[PumpService] Fetching all pumps...');
  // In a real app: const snapshot = await db.collection('pumps').get();
  //                 return snapshot.docs.map(doc => doc.data() as Pump);
  // For now, return an empty array or mock data if needed for testing.
  return []; 
}

/**
 * Simulates fetching the activity log for a specific pump.
 */
export async function getPumpActivityLog(pumpId: string): Promise<ActivityLogEntry[]> {
  console.log(`[PumpService] Fetching activity log for pump ${pumpId}...`);
  // In a real app: const snapshot = await db.collection('activityLogs').where('pumpId', '==', pumpId).orderBy('timestamp', 'desc').get();
  //                 return snapshot.docs.map(doc => doc.data() as ActivityLogEntry);
  // For now, return an empty array.
  return [];
}

// Example of how you might add a note and log it specifically
export async function addNoteToPumpWithActivityLog(
  pumpId: string,
  note: string,
  originalPump: Pump
): Promise<Pump> {
  const newNotes = originalPump.notes ? `${originalPump.notes}\n${note}` : note;
  return updatePumpWithActivityLog(
    pumpId,
    { notes: newNotes },
    originalPump,
    'NOTE_ADDED',
    `Note added to pump ${originalPump.serialNumber || originalPump.model}: "${note}"`
  );
}
