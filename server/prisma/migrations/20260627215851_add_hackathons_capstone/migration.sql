-- CreateEnum
CREATE TYPE "CapstonePhase" AS ENUM ('STATEMENT', 'SOLUTION', 'DEPLOYMENT', 'DOCUMENTATION', 'PRESENTATION', 'EVALUATION');

-- CreateTable
CREATE TABLE "hackathons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "day_number" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "rubric_json" JSONB,
    "max_score" INTEGER NOT NULL,
    "is_team" BOOLEAN NOT NULL DEFAULT false,
    "batch_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_submissions" (
    "id" TEXT NOT NULL,
    "hackathon_id" TEXT NOT NULL,
    "intern_id" TEXT NOT NULL,
    "repo_url" TEXT,
    "demo_url" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "judged_by" TEXT,

    CONSTRAINT "hackathon_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capstone_projects" (
    "id" TEXT NOT NULL,
    "intern_id" TEXT NOT NULL,
    "mentor_id" TEXT,
    "problem_statement" TEXT,
    "phase" "CapstonePhase" NOT NULL DEFAULT 'STATEMENT',
    "repo_url" TEXT,
    "deployed_url" TEXT,
    "final_score" DOUBLE PRECISION,
    "feedback_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capstone_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_submissions_hackathon_id_intern_id_key" ON "hackathon_submissions"("hackathon_id", "intern_id");

-- CreateIndex
CREATE UNIQUE INDEX "capstone_projects_intern_id_key" ON "capstone_projects"("intern_id");

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_intern_id_fkey" FOREIGN KEY ("intern_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_judged_by_fkey" FOREIGN KEY ("judged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capstone_projects" ADD CONSTRAINT "capstone_projects_intern_id_fkey" FOREIGN KEY ("intern_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capstone_projects" ADD CONSTRAINT "capstone_projects_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
