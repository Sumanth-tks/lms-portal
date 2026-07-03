-- CreateEnum
CREATE TYPE "CodeReviewStatus" AS ENUM ('PENDING', 'REVIEWED');

-- CreateTable
CREATE TABLE "github_links" (
    "id" TEXT NOT NULL,
    "intern_id" TEXT NOT NULL,
    "repo_url" TEXT NOT NULL,
    "repo_name" TEXT NOT NULL,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commit_logs" (
    "id" TEXT NOT NULL,
    "intern_id" TEXT NOT NULL,
    "github_link_id" TEXT NOT NULL,
    "commit_hash" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "files_changed" INTEGER NOT NULL DEFAULT 0,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_reviews" (
    "id" TEXT NOT NULL,
    "commit_log_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "comments_json" JSONB,
    "status" "CodeReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "github_links_intern_id_repo_url_key" ON "github_links"("intern_id", "repo_url");

-- CreateIndex
CREATE UNIQUE INDEX "commit_logs_github_link_id_commit_hash_key" ON "commit_logs"("github_link_id", "commit_hash");

-- AddForeignKey
ALTER TABLE "github_links" ADD CONSTRAINT "github_links_intern_id_fkey" FOREIGN KEY ("intern_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commit_logs" ADD CONSTRAINT "commit_logs_intern_id_fkey" FOREIGN KEY ("intern_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commit_logs" ADD CONSTRAINT "commit_logs_github_link_id_fkey" FOREIGN KEY ("github_link_id") REFERENCES "github_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_reviews" ADD CONSTRAINT "code_reviews_commit_log_id_fkey" FOREIGN KEY ("commit_log_id") REFERENCES "commit_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_reviews" ADD CONSTRAINT "code_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
