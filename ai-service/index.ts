import 'dotenv/config';
import { receiveMessages, deleteMessage } from './lib/sqs.js';
import { processMessage } from './lib/processor.js';
import type { SQSPayload } from './types.js';

async function poll() {
  console.log('[ai-service] waiting for messages...');
  while (true) {
    const messages = await receiveMessages();
    for (const msg of messages) {
      console.log('[ai-service] message received');
      const payload = JSON.parse(msg.Body!) as SQSPayload;
      await processMessage(payload);
      await deleteMessage(msg.ReceiptHandle!);
      console.log('[ai-service] message deleted');
    }
  }
}

poll().catch(console.error);
