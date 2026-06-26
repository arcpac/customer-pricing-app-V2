import 'dotenv/config';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: process.env.AWS_REGION ?? 'ap-southeast-2' });
const QueueUrl = process.env.SQS_QUEUE_URL!;

async function poll() {
  console.log('[ai-service] polling', QueueUrl);
  while (true) {
    const res = await sqs.send(new ReceiveMessageCommand({
      QueueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    }));
    for (const msg of res.Messages ?? []) {
      console.log('[ai-service] payload received:', msg.Body);
      await sqs.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: msg.ReceiptHandle! }));
      console.log('[ai-service] message deleted');
    }
  }
}

poll().catch(console.error);
