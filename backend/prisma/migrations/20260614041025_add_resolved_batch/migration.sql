-- CreateTable
CREATE TABLE "resolved_batches" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolved_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resolved_batches_customerId_createdAt_idx" ON "resolved_batches"("customerId", "createdAt");
