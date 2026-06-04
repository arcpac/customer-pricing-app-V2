-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_memberships" (
    "customerId" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,

    CONSTRAINT "customer_group_memberships_pkey" PRIMARY KEY ("customerId","customerGroupId")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerScope" TEXT NOT NULL,
    "customerId" TEXT,
    "customerGroupId" TEXT,
    "adjustmentType" TEXT NOT NULL,
    "adjustmentDirection" TEXT NOT NULL,
    "adjustmentValue" DECIMAL(10,4) NOT NULL,
    "productScope" TEXT NOT NULL,
    "productFilter" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_profile_items" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "adjustedPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pricing_profile_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_audit_logs" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolved_price_logs" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "resolvedPrice" DECIMAL(10,2),
    "sourceProfileId" TEXT,
    "matchScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolved_price_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_groups_name_key" ON "customer_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_profile_items_profileId_productId_key" ON "pricing_profile_items"("profileId", "productId");

-- AddForeignKey
ALTER TABLE "customer_group_memberships" ADD CONSTRAINT "customer_group_memberships_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_memberships" ADD CONSTRAINT "customer_group_memberships_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_profiles" ADD CONSTRAINT "pricing_profiles_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_profiles" ADD CONSTRAINT "pricing_profiles_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_profile_items" ADD CONSTRAINT "pricing_profile_items_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pricing_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_profile_items" ADD CONSTRAINT "pricing_profile_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_audit_logs" ADD CONSTRAINT "profile_audit_logs_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pricing_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
