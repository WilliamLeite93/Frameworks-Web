ALTER TABLE "Summary" ADD COLUMN "reviewReminderAt" TIMESTAMP(3);

CREATE INDEX "Summary_reviewReminderAt_idx" ON "Summary"("reviewReminderAt");
