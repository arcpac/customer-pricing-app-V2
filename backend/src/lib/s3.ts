import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'ap-southeast-2' });
const BUCKET = 's3-resolved-pricing';

export async function getJson(key: string): Promise<unknown> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const body = await res.Body?.transformToString();
  return JSON.parse(body!);
}

export async function checkS3Connection(): Promise<boolean> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
    return true;
  } catch {
    return false;
  }
}

export async function putJson(key: string, body: unknown) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(body),
      ContentType: 'application/json',
    }),
  );
}
