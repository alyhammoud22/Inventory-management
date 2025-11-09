/*
  Warnings:

  - You are about to drop the column `price` on the `Products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Products" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE CASCADE ON UPDATE CASCADE;
