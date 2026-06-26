/*
  Warnings:

  - Added the required column `resolvedCount` to the `resolved_batches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCount` to the `resolved_batches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resolved_batches" ADD COLUMN     "resolvedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sqsSentAt" TIMESTAMP(3),
ADD COLUMN     "sqsStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "totalCount" INTEGER NOT NULL DEFAULT 0;
