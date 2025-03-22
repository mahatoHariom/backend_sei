/*
  Warnings:

  - You are about to drop the column `active` on the `Carousel` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Carousel` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Carousel` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Carousel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Carousel" DROP COLUMN "active",
DROP COLUMN "description",
DROP COLUMN "link",
DROP COLUMN "title";
