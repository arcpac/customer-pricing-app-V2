import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Snapshot } from '../types.js';

const client = new S3Client({ region: process.env.AWS_REGION ?? 'ap-southeast-2' });
const Bucket = process.env.S3_BUCKET_NAME!;

export async function fetchSnapshot(s3Key: string): Promise<Snapshot> {
  const res = await client.send(new GetObjectCommand({ Bucket, Key: s3Key }));
  const body = await res.Body!.transformToString();
  return JSON.parse(body) as Snapshot;
}
