-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_plays" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "tee_id" TEXT NOT NULL,
    "holes_played" TEXT NOT NULL,
    "overall_score" INTEGER,
    "note" TEXT,
    "played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_plays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_play_hole_scores" (
    "id" TEXT NOT NULL,
    "course_play_id" TEXT NOT NULL,
    "hole_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "course_play_hole_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_course_id_key" ON "bookmarks"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "bookmarks_course_id_idx" ON "bookmarks"("course_id");

-- CreateIndex
CREATE INDEX "course_plays_user_id_idx" ON "course_plays"("user_id");

-- CreateIndex
CREATE INDEX "course_plays_user_id_course_id_idx" ON "course_plays"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_play_hole_scores_course_play_id_hole_id_key" ON "course_play_hole_scores"("course_play_id", "hole_id");

-- CreateIndex
CREATE INDEX "course_play_hole_scores_course_play_id_idx" ON "course_play_hole_scores"("course_play_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_course_id_key" ON "favorites"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "favorites_user_id_idx" ON "favorites"("user_id");

-- CreateIndex
CREATE INDEX "favorites_course_id_idx" ON "favorites"("course_id");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_plays" ADD CONSTRAINT "course_plays_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_plays" ADD CONSTRAINT "course_plays_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_plays" ADD CONSTRAINT "course_plays_tee_id_fkey" FOREIGN KEY ("tee_id") REFERENCES "Tee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_play_hole_scores" ADD CONSTRAINT "course_play_hole_scores_course_play_id_fkey" FOREIGN KEY ("course_play_id") REFERENCES "course_plays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_play_hole_scores" ADD CONSTRAINT "course_play_hole_scores_hole_id_fkey" FOREIGN KEY ("hole_id") REFERENCES "Hole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
