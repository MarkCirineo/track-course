-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "trackmanId" TEXT NOT NULL,
    "dbId" TEXT,
    "createdAt" TIMESTAMP(3),
    "description" TEXT,
    "displayName" TEXT NOT NULL,
    "numbersOfHoles" INTEGER,
    "courseLocation" TEXT,
    "difficulty" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googleMapUrl" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tee" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teeIndex" INTEGER NOT NULL,
    "par" INTEGER,
    "courseDistance" INTEGER,
    "courseRating" DOUBLE PRECISION,
    "slope" INTEGER,
    "gender" TEXT,
    "kind" TEXT,
    "name" TEXT,

    CONSTRAINT "Tee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_trackmanId_key" ON "Course"("trackmanId");

-- CreateIndex
CREATE INDEX "Course_displayName_idx" ON "Course"("displayName");

-- CreateIndex
CREATE INDEX "Tee_courseId_idx" ON "Tee"("courseId");

-- CreateIndex
CREATE INDEX "Tee_courseRating_slope_idx" ON "Tee"("courseRating", "slope");

-- CreateIndex
CREATE INDEX "Tee_gender_idx" ON "Tee"("gender");

-- CreateTable
CREATE TABLE "Hole" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT,
    "holeIndex" INTEGER NOT NULL,

    CONSTRAINT "Hole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoleTee" (
    "id" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "teeId" TEXT NOT NULL,
    "distance" INTEGER,
    "strokeIndex" INTEGER,
    "par" INTEGER,

    CONSTRAINT "HoleTee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hole_courseId_holeIndex_key" ON "Hole"("courseId", "holeIndex");

-- CreateIndex
CREATE INDEX "Hole_courseId_idx" ON "Hole"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "HoleTee_holeId_teeId_key" ON "HoleTee"("holeId", "teeId");

-- CreateIndex
CREATE INDEX "HoleTee_holeId_idx" ON "HoleTee"("holeId");

-- CreateIndex
CREATE INDEX "HoleTee_teeId_idx" ON "HoleTee"("teeId");

-- AddForeignKey
ALTER TABLE "Tee" ADD CONSTRAINT "Tee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hole" ADD CONSTRAINT "Hole_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleTee" ADD CONSTRAINT "HoleTee_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleTee" ADD CONSTRAINT "HoleTee_teeId_fkey" FOREIGN KEY ("teeId") REFERENCES "Tee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
