/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `bookmarks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_title_key" ON "bookmarks"("title");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
