import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, type Message } from '@aws-sdk/client-sqs';

const client = new SQSClient({ region: process.env.AWS_REGION ?? 'ap-southeast-2' });
const QueueUrl = process.env.SQS_QUEUE_URL!;

export async function receiveMessages(): Promise<Message[]> {
  const res = await client.send(new ReceiveMessageCommand({
    QueueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  }));
  return res.Messages ?? [];
}

export async function deleteMessage(receiptHandle: string): Promise<void> {
  await client.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: receiptHandle }));
}
