/**
 * Finds courses in the DB that are NOT in the current Trackman API response, by displayName + courseLocation.
 * After removing duplicates by (displayName, courseLocation), any remaining extras are courses whose
 * name+location doesn't appear in the API (true orphans).
 * Run: npm run orphans   or   npm run orphans:delete (to also print DELETE SQL)
 */

import "dotenv/config";
import { getCoursesList } from "../src/lib/trackman-api";
import { db } from "../src/lib/db";

function normalize(s: string | null | undefined): string {
  if (s == null || s === "") return "";
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function nameLocationKey(displayName: string | null, courseLocation: string | null): string {
  return `${normalize(displayName ?? "")}|${normalize(courseLocation ?? "")}`;
}

async function main() {
  const wantDelete = process.argv.includes("--delete");

  console.log("Fetching current course list from Trackman API...");
  const items = await getCoursesList(0, 8000);
  const apiNameLocationKeys = new Set(
    items.map((i) => nameLocationKey(i.displayName, i.courseLocation ?? null))
  );
  console.log(`API returned ${items.length} courses (${apiNameLocationKeys.size} unique name+location keys).\n`);

  const allCourses = await db.course.findMany({
    select: { id: true, trackmanId: true, displayName: true, courseLocation: true },
  });

  const orphans = allCourses.filter(
    (c) => !apiNameLocationKeys.has(nameLocationKey(c.displayName, c.courseLocation))
  );
  console.log(`DB has ${allCourses.length} courses.`);
  console.log(
    `${orphans.length} course(s) in DB have a displayName+courseLocation that is NOT in the current API response (orphans):\n`
  );

  if (orphans.length === 0) {
    console.log("None. DB is in sync with the API.");
    process.exit(0);
    return;
  }

  orphans.forEach((c, i) => {
    console.log(
      `${i + 1}. id=${c.id} trackmanId=${c.trackmanId} | ${c.displayName} | ${c.courseLocation ?? "(no location)"}`
    );
  });

  if (wantDelete && orphans.length > 0) {
    const ids = orphans.map((c) => c.id);
    console.log("\n--- SQL to delete these orphan courses (run in psql/pgAdmin) ---");
    console.log(
      `DELETE FROM "Course" WHERE id IN (\n  '${ids.join("',\n  '")}'\n);`
    );
    console.log("---");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
