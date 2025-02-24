-- CreateEnum
CREATE TYPE "ErrorSeverity" AS ENUM ('fatal', 'error', 'warning', 'info');
CREATE TYPE "AggregationPeriod" AS ENUM ('hourly', 'daily', 'weekly', 'monthly');

-- CreateTable
CREATE TABLE "ErrorRecord" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" "ErrorSeverity" NOT NULL,
  "timestamp" BIGINT NOT NULL,
  "context" JSONB NOT NULL DEFAULT '{}',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "stackTrace" TEXT,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" BIGINT,
  "resolvedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ErrorRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorAggregation" (
  "id" TEXT NOT NULL,
  "period" "AggregationPeriod" NOT NULL,
  "startTime" BIGINT NOT NULL,
  "endTime" BIGINT NOT NULL,
  "totalErrors" INTEGER NOT NULL,
  "bySeverity" JSONB NOT NULL,
  "byCode" JSONB NOT NULL,
  "errorRate" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ErrorAggregation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorRecord_code_idx" ON "ErrorRecord"("code");
CREATE INDEX "ErrorRecord_severity_idx" ON "ErrorRecord"("severity");
CREATE INDEX "ErrorRecord_timestamp_idx" ON "ErrorRecord"("timestamp");
CREATE INDEX "ErrorRecord_resolved_idx" ON "ErrorRecord"("resolved");

-- CreateIndex
CREATE INDEX "ErrorAggregation_period_startTime_idx" ON "ErrorAggregation"("period", "startTime");

-- AddFunctions
CREATE OR REPLACE FUNCTION update_error_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AddTriggers
CREATE TRIGGER error_record_updated_at
  BEFORE UPDATE ON "ErrorRecord"
  FOR EACH ROW
  EXECUTE FUNCTION update_error_updated_at();