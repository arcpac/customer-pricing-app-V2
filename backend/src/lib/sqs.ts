import { SQSClient, SendMessageCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: process.env.AWS_REGION ?? 'ap-southeast-2' });

export async function checkSqsConnection(): Promise<boolean> {
  try {
    await sqs.send(new GetQueueAttributesCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      AttributeNames: ['QueueArn'],
    }));
    return true;
  } catch {
    return false;
  }
}

export async function sendWithRetry(
  payload: {
    batchId: string;
    customerId: string;
    s3Key: string;
    resolvedCount: number;
    totalCount: number;
    timestamp: string;
  },
  maxAttempts = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await sqs.send(new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL!,
        MessageBody: JSON.stringify(payload),
      }));
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await new Promise(res => setTimeout(res, 200 * attempt));
    }
  }
}
