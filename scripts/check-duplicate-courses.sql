-- Run these in your PostgreSQL client (psql, pgAdmin, etc.) to check for duplicate courses.
-- Use double quotes for identifiers (Course, trackmanId) because Prisma creates them case-sensitive.

-- 1) Duplicate trackmanId (same Trackman ID more than once)
--    If this returns rows, you have duplicates; the unique constraint may have been added after bad data.
SELECT "trackmanId", COUNT(*) AS cnt
FROM "Course"
GROUP BY "trackmanId"
HAVING COUNT(*) > 1;

-- 2) Total rows vs distinct trackmanIds (should match if no duplicates)
SELECT
  COUNT(*) AS total_rows,
  COUNT(DISTINCT "trackmanId") AS distinct_trackman_ids,
  COUNT(*) - COUNT(DISTINCT "trackmanId") AS duplicate_count
FROM "Course";

-- 3) Same displayName multiple times (duplicate names)
SELECT "displayName", COUNT(*) AS cnt
FROM "Course"
GROUP BY "displayName"
HAVING COUNT(*) > 1
ORDER BY cnt DESC;

-- 4) DETAILED VIEW: For each duplicate displayName, show key columns so you can compare WHY they duplicated.
--    Compare trackmanId, courseLocation, latitude, longitude, syncNameLocationKey, syncFingerprint between rows.
SELECT
  "displayName",
  id,
  "trackmanId",
  "courseLocation",
  latitude,
  longitude,
  "syncNameLocationKey",
  "syncFingerprint",
  "numbersOfHoles",
  "syncedAt"
FROM "Course"
WHERE "displayName" IN (
  SELECT "displayName"
  FROM "Course"
  GROUP BY "displayName"
  HAVING COUNT(*) > 1
)
ORDER BY "displayName", id;