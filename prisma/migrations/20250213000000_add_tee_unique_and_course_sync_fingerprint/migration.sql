-- Tee: unique on (courseId, teeIndex) for upsert by position
CREATE UNIQUE INDEX "Tee_courseId_teeIndex_key" ON "Tee"("courseId", "teeIndex");

-- Course: sync fingerprint columns for dedupe
ALTER TABLE "Course" ADD COLUMN "syncFingerprint" TEXT;
ALTER TABLE "Course" ADD COLUMN "syncNameLocationKey" TEXT;
CREATE UNIQUE INDEX "Course_syncFingerprint_key" ON "Course"("syncFingerprint");
CREATE INDEX "Course_syncNameLocationKey_idx" ON "Course"("syncNameLocationKey");

-- Backfill syncNameLocationKey for existing rows (same formula as app: trim, lower, collapse spaces)
UPDATE "Course"
SET "syncNameLocationKey" = LOWER(TRIM(REGEXP_REPLACE(COALESCE("displayName", ''), '\s+', ' ', 'g')))
  || '|'
  || LOWER(TRIM(REGEXP_REPLACE(COALESCE("courseLocation", ''), '\s+', ' ', 'g')))
WHERE "syncNameLocationKey" IS NULL;
