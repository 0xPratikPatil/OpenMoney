-- Create market_data table for time-series price storage
CREATE TABLE "market_data" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "ticker" TEXT NOT NULL,
    "open" DECIMAL(18,4) NOT NULL,
    "high" DECIMAL(18,4) NOT NULL,
    "low" DECIMAL(18,4) NOT NULL,
    "close" DECIMAL(18,4) NOT NULL,
    "volume" BIGINT,
    "vwap" DECIMAL(18,4),
    "interval" TEXT NOT NULL DEFAULT '1d',
    "source" TEXT NOT NULL,

    CONSTRAINT "market_data_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "market_data_time_ticker_interval_key" ON "market_data"("time", "ticker", "interval");
CREATE INDEX "market_data_ticker_time_idx" ON "market_data"("ticker", "time");
CREATE INDEX "market_data_time_idx" ON "market_data"("time");

-- Convert to TimescaleDB hypertable (requires TimescaleDB extension)
DO $$
BEGIN
    PERFORM create_hypertable('market_data', 'time', if_not_exists => TRUE);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TimescaleDB not available, table created as standard Postgres table';
END $$;
