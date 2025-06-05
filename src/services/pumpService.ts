
// Placeholder for pump service that will interact with a backend (e.g., Firebase Firestore)

import type { Pump, ActivityLogEntry, StageId, ActivityLogType } from '@/types';
import { PUMP_MODELS, CUSTOMER_NAMES, POWDER_COATERS, DEFAULT_POWDER_COAT_COLORS, STAGES } from '@/lib/constants';

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
  const samplePumps: Pump[] = [];
  const now = new Date().toISOString();

  const stageDistribution: Record<StageId, number> = {
    'open-jobs': 12,
    'fabrication': 4,
    'powder-coat': 6,
    'assembly': 3,
    'testing': 2,
    'shipped': 0,
  };

  let serialCounter = 1000;
  let poCounter = 100;

  const stagesRequiringPowderCoatInfo: StageId[] = ['powder-coat', 'assembly', 'testing'];

  // Create 3 pumps for each model
  for (let i = 0; i < 3; i++) {
    for (const model of PUMP_MODELS) {
      const pump: Partial<Pump> = {
        id: crypto.randomUUID(),
        model: model,
        serialNumber: `MSP-JN-${String(serialCounter++).padStart(4, '0')}`,
        customer: CUSTOMER_NAMES[samplePumps.length % CUSTOMER_NAMES.length],
        poNumber: `PO-${String(poCounter++).padStart(5, '0')}`,
        estimatedBuildTimeDays: 1.5 + (Math.random() * 2), // Small variation
        priority: ['normal', 'high', 'urgent'][samplePumps.length % 3] as Pump['priority'],
        createdAt: now,
        updatedAt: now,
      };

      // Assign stage based on distribution
      let assignedStage = false;
      for (const stage of STAGES) { // Iterate in defined order
        const stageId = stage.id;
        if (stageDistribution[stageId] > 0) {
          const pumpsInThisStage = samplePumps.filter(p => p.currentStage === stageId).length;
          if (pumpsInThisStage < stageDistribution[stageId]) {
            pump.currentStage = stageId;
            
            if (stagesRequiringPowderCoatInfo.includes(stageId)) {
              pump.powderCoater = POWDER_COATERS[samplePumps.length % POWDER_COATERS.length];
              pump.powderCoatColor = DEFAULT_POWDER_COAT_COLORS[samplePumps.length % DEFAULT_POWDER_COAT_COLORS.length];
            }
            assignedStage = true;
            break;
          }
        }
      }
      // Fallback if distribution logic has issues (e.g. exact counts not met, though it should)
      if (!assignedStage) {
        pump.currentStage = 'open-jobs';
      }
      
      samplePumps.push(pump as Pump);
    }
  }
  
  // Shuffle pumps to better distribute models across stages rather than clustering them
  // This is a simple shuffle, good enough for sample data
  for (let i = samplePumps.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [samplePumps[i], samplePumps[j]] = [samplePumps[j], samplePumps[i]];
  }

  // Re-assign stages based on target counts after shuffling models
  const currentStageCounts: Record<StageId, number> = {
    'open-jobs': 0, 'fabrication': 0, 'powder-coat': 0, 
    'assembly': 0, 'testing': 0, 'shipped': 0,
  };

  const finalPumps: Pump[] = [];
  for (const p of samplePumps) {
      let assigned = false;
      for (const stageObj of STAGES) {
          const stageId = stageObj.id;
          if (currentStageCounts[stageId] < stageDistribution[stageId]) {
              p.currentStage = stageId;
              // Ensure powder coat info if needed for the new stage
              if (stagesRequiringPowderCoatInfo.includes(stageId) && (!p.powderCoater || !p.powderCoatColor)) {
                p.powderCoater = POWDER_COATERS[finalPumps.length % POWDER_COATERS.length];
                p.powderCoatColor = DEFAULT_POWDER_COAT_COLORS[finalPumps.length % DEFAULT_POWDER_COAT_COLORS.length];
              } else if (!stagesRequiringPowderCoatInfo.includes(stageId)) {
                // Optionally clear powder coat info if moved to a stage before it
                // p.powderCoater = undefined;
                // p.powderCoatColor = undefined;
              }
              currentStageCounts[stageId]++;
              finalPumps.push(p);
              assigned = true;
              break;
          }
      }
      if (!assigned && finalPumps.length < PUMP_MODELS.length * 3) { // Safety net
          p.currentStage = 'open-jobs';
          currentStageCounts['open-jobs']++;
          finalPumps.push(p);
      }
  }


  // console.log(`Generated ${finalPumps.length} sample pumps.`);
  // console.log("Final stage counts:", currentStageCounts);
  // finalPumps.forEach(p => console.log(`Model: ${p.model}, Stage: ${p.currentStage}, SN: ${p.serialNumber}`));

  return Promise.resolve(finalPumps.slice(0, PUMP_MODELS.length * 3)); // Ensure exact count
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
