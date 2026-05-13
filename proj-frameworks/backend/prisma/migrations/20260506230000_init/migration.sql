-- CreateEnum
CREATE TYPE "SummaryStatus" AS ENUM ('NOVO', 'EM_REVISAO', 'REVISADO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "goal" TEXT NOT NULL DEFAULT 'Vestibular',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" "SummaryStatus" NOT NULL DEFAULT 'NOVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummaryFile" (
    "id" SERIAL NOT NULL,
    "summaryId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedName" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SummaryFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Summary_ownerId_idx" ON "Summary"("ownerId");

-- CreateIndex
CREATE INDEX "Summary_subject_idx" ON "Summary"("subject");

-- CreateIndex
CREATE INDEX "Summary_status_idx" ON "Summary"("status");

-- CreateIndex
CREATE INDEX "Summary_createdAt_idx" ON "Summary"("createdAt");

-- CreateIndex
CREATE INDEX "SummaryFile_summaryId_idx" ON "SummaryFile"("summaryId");

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryFile" ADD CONSTRAINT "SummaryFile_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
