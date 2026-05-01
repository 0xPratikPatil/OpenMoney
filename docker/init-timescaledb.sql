-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Market data hypertable (raw OHLCV data from ingestion pipeline)
CREATE TABLE IF NOT EXISTS market_data (
    time        TIMESTAMPTZ       NOT NULL,
    ticker      TEXT              NOT NULL,
    open        DOUBLE PRECISION  NOT NULL,
    high        DOUBLE PRECISION  NOT NULL,
    low         DOUBLE PRECISION  NOT NULL,
    close       DOUBLE PRECISION  NOT NULL,
    volume      DOUBLE PRECISION,
    vwap        DOUBLE PRECISION,
    interval    TEXT              NOT NULL,
    source      TEXT              NOT NULL,
    created_at  TIMESTAMPTZ       DEFAULT NOW()
);

-- Convert to hypertable partitioned by time
SELECT create_hypertable('market_data', 'time',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_market_data_ticker_time
    ON market_data (ticker, time DESC);

CREATE INDEX IF NOT EXISTS idx_market_data_ticker_interval_time
    ON market_data (ticker, interval, time DESC);

CREATE INDEX IF NOT EXISTS idx_market_data_time
    ON market_data (time DESC);

-- Enable compression for older data (saves ~90% disk space)
ALTER TABLE market_data SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'ticker',
    timescaledb.compress_orderby = 'time DESC'
);

-- Auto-compress data older than 6 months
SELECT add_compression_policy('market_data', INTERVAL '6 months', if_not_exists => TRUE);

-- Drop raw tick data older than 1 week (we keep aggregated data)
SELECT add_retention_policy('market_data', INTERVAL '1 week', if_not_exists => TRUE);

-- Continuous aggregate: 1-minute OHLCV
CREATE MATERIALIZED VIEW IF NOT EXISTS market_data_1m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket,
    ticker,
    FIRST(open, time) AS open,
    MAX(high) AS high,
    MIN(low) AS low,
    LAST(close, time) AS close,
    SUM(volume) AS volume
FROM market_data
WHERE interval = 'tick'
GROUP BY bucket, ticker;

-- Continuous aggregate: 1-hour OHLCV
CREATE MATERIALIZED VIEW IF NOT EXISTS market_data_1h
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    ticker,
    FIRST(open, time) AS open,
    MAX(high) AS high,
    MIN(low) AS low,
    LAST(close, time) AS close,
    SUM(volume) AS volume
FROM market_data
WHERE interval IN ('tick', '1m')
GROUP BY bucket, ticker;

-- Continuous aggregate: daily OHLCV
CREATE MATERIALIZED VIEW IF NOT EXISTS market_data_1d
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS bucket,
    ticker,
    FIRST(open, time) AS open,
    MAX(high) AS high,
    MIN(low) AS low,
    LAST(close, time) AS close,
    SUM(volume) AS volume
FROM market_data
WHERE interval IN ('tick', '1m', '1h')
GROUP BY bucket, ticker;
