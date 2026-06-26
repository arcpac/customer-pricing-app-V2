import { fetchSnapshot } from './s3.js';
import type { SQSPayload, Snapshot } from '../types.js';

function simulateAI(current: Snapshot, previous: Snapshot): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('[ai-service] AI processing complete');
      console.log('[ai-service] previous snapshot:', JSON.stringify(previous, null, 2));
      console.log('[ai-service] current snapshot:', JSON.stringify(current, null, 2));
      resolve();
    }, 2000);
  });
}

export async function processMessage(payload: SQSPayload): Promise<void> {
  console.log('[ai-service] processing message for customer:', payload.customerId);

  const current = await fetchSnapshot(payload.s3Key);

  const previousKey = payload.previousSnapshotKey;
  if (!previousKey) {
    console.log('[ai-service] no previous snapshot — full stop');
    return;
  }

  const previous = await fetchSnapshot(previousKey);
  await simulateAI(current, previous);
}
