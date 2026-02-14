-- Remove duplicate courses: keep ONE row per (displayName, courseLocation), delete the rest.
-- Uses the same grouping as "same logical course" (name + location). Keeps the row with smallest id.
-- WARNING: Deleting a Course CASCADE-deletes its Tees, Holes, Bookmarks, CoursePlays, Favorites.
-- Run in psql or pgAdmin. Use double quotes for identifiers.

-- 1) PREVIEW: how many rows will be deleted
WITH ranked AS (
  SELECT id, "displayName", "courseLocation",
         ROW_NUMBER() OVER (PARTITION BY "displayName", "courseLocation" ORDER BY id) AS rn
  FROM "Course"
)
SELECT COUNT(*) AS rows_to_delete
FROM ranked
WHERE rn > 1;

-- 2) PREVIEW: list of duplicate groups (displayName, courseLocation, count)
SELECT "displayName", "courseLocation", COUNT(*) AS cnt
FROM "Course"
GROUP BY "displayName", "courseLocation"
HAVING COUNT(*) > 1
ORDER BY cnt DESC;

-- 3) DELETE duplicates (keeps first id per group, removes the rest)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "displayName", "courseLocation" ORDER BY id) AS rn
  FROM "Course"
)
DELETE FROM "Course"
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
