export interface SQSPayload {
  batchId: string;
  customerId: string;
  s3Key: string;
  resolvedCount: number;
  totalCount: number;
  timestamp: string;
  previousSnapshotKey: string | null;
}

export interface Snapshot {
  id: string;
  customerId: string;
  createdAt: string;
  results: unknown[];
}
