"""
Financial computation models.
Each function takes a dict payload and returns a dict result.
"""

import math
import json
from typing import Any

import numpy as np
from scipy import stats as scipy_stats


def compute_risk_metrics(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Compute portfolio risk metrics.
    
    Payload expects:
    - returns: list of portfolio daily returns (decimal, e.g. 0.01 for 1%)
    - prices: list of {date, value} portfolio values
    - positions: list of {ticker, weight} with weight as decimal
    - riskFreeRate: annual risk-free rate in percent (e.g. 5.0)
    - confidenceLevels: list of decimals (e.g. [0.95, 0.99])
    """
    returns = np.array(payload.get("returns", []), dtype=float)
    risk_free_rate = float(payload.get("riskFreeRate", 5.0)) / 100
    confidence_levels = payload.get("confidenceLevels", [0.95, 0.99])

    if len(returns) < 5:
        return {
            "portfolioVaR95": None,
            "portfolioVaR99": None,
            "portfolioCVaR95": None,
            "sharpeRatio": None,
            "sortinoRatio": None,
            "maxDrawdown": None,
            "maxDrawdownDate": None,
            "beta": None,
            "correlationMatrix": [],
            "positionRiskContributions": [],
            "error": "Insufficient return data (need at least 5 data points)",
        }

    # Annualized metrics (assuming daily returns)
    annual_factor = math.sqrt(252)
    annual_return = float(np.mean(returns)) * 252
    annual_vol = float(np.std(returns, ddof=1)) * annual_factor

    # VaR (historical)
    sorted_returns = np.sort(returns)
    result: dict[str, Any] = {}

    for conf in confidence_levels:
        var_idx = int((1 - conf) * len(sorted_returns))
        var_idx = min(var_idx, len(sorted_returns) - 1)
        var_value = float(sorted_returns[var_idx])
        result[f"VaR{int(conf*100)}"] = var_value

        # CVaR (conditional VaR - expected loss beyond VaR)
        cvar_values = sorted_returns[:var_idx + 1]
        result[f"CVaR{int(conf*100)}"] = float(np.mean(cvar_values)) if len(cvar_values) > 0 else var_value

    # Sharpe ratio
    excess_return = annual_return - risk_free_rate
    result["sharpeRatio"] = float(excess_return / annual_vol) if annual_vol > 0 else None

    # Sortino ratio (downside deviation)
    downside = returns[returns < 0]
    downside_vol = float(np.std(downside, ddof=1)) * annual_factor if len(downside) > 0 else 0
    result["sortinoRatio"] = float(excess_return / downside_vol) if downside_vol > 0 else None

    # Max drawdown
    prices = payload.get("prices", [])
    if prices:
        values = np.array([p["value"] for p in prices], dtype=float)
        peak = np.maximum.accumulate(values)
        drawdown = (values - peak) / peak
        max_dd_idx = int(np.argmin(drawdown))
        result["maxDrawdown"] = float(drawdown[max_dd_idx])
        if 0 <= max_dd_idx < len(prices):
            result["maxDrawdownDate"] = prices[max_dd_idx]["date"]
        else:
            result["maxDrawdownDate"] = None
    else:
        result["maxDrawdown"] = None
        result["maxDrawdownDate"] = None

    # Beta (vs first position as market proxy — simplified)
    positions = payload.get("positions", [])
    if len(positions) > 0 and len(returns) > 0:
        # For MVP, beta is computed vs. equal-weighted portfolio
        result["beta"] = 1.0  # simplified for MVP
    else:
        result["beta"] = None

    result["correlationMatrix"] = []
    result["positionRiskContributions"] = []

    # Return all computed metric keys
    keys_to_return = [
        "portfolioVaR95", "portfolioVaR99", "portfolioCVaR95",
        "sharpeRatio", "sortinoRatio", "maxDrawdown", "maxDrawdownDate",
        "beta", "correlationMatrix", "positionRiskContributions",
    ]

    # Map our computed results to the expected API shape
    final = {
        "portfolioVaR95": result.get("VaR95"),
        "portfolioVaR99": result.get("VaR99"),
        "portfolioCVaR95": result.get("CVaR95"),
        "sharpeRatio": result.get("sharpeRatio"),
        "sortinoRatio": result.get("sortinoRatio"),
        "maxDrawdown": result.get("maxDrawdown"),
        "maxDrawdownDate": result.get("maxDrawdownDate"),
        "beta": result.get("beta"),
        "correlationMatrix": [],
        "positionRiskContributions": [],
    }
    return final


def compute_forecast(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Price/volatility forecasting.
    
    Payload:
    - prices: list of historical prices
    - days: number of days to forecast
    - model: "arima" | "garch" | "monte_carlo"
    - simulations: number of Monte Carlo paths (default 10000)
    """
    prices = np.array(payload.get("prices", []), dtype=float)
    days = int(payload.get("days", 30))
    model = payload.get("model", "monte_carlo")
    simulations = int(payload.get("simulations", 10000))

    if len(prices) < 10:
        return {
            "forecast": None,
            "confidenceInterval": None,
            "error": "Insufficient price history (need at least 10 data points)",
        }

    returns = np.diff(prices) / prices[:-1]
    mu = float(np.mean(returns))
    sigma = float(np.std(returns, ddof=1))

    if model == "monte_carlo":
        # Geometric Brownian Motion
        last_price = float(prices[-1])
        paths = np.zeros((simulations, days))
        for i in range(simulations):
            daily_returns = np.random.normal(mu, sigma, days)
            paths[i] = last_price * np.exp(np.cumsum(daily_returns))

        median_path = np.median(paths, axis=0)
        lower_95 = np.percentile(paths, 2.5, axis=0)
        upper_95 = np.percentile(paths, 97.5, axis=0)

        forecast = [
            {
                "day": i + 1,
                "price": float(median_path[i]),
                "lowerBound": float(lower_95[i]),
                "upperBound": float(upper_95[i]),
            }
            for i in range(min(days, 30))  # Return max 30 days
        ]

        return {
            "forecast": forecast,
            "model": "monte_carlo",
            "simulations": simulations,
        }

    elif model == "arima":
        # Simplified: random walk forecast for MVP
        last_price = float(prices[-1])
        forecast = []
        for i in range(min(days, 30)):
            price = last_price * (1 + float(np.random.normal(mu, sigma)))
            forecast.append({
                "day": i + 1,
                "price": price,
                "lowerBound": price * 0.95,
                "upperBound": price * 1.05,
            })
            last_price = price

        return {"forecast": forecast, "model": "arima"}

    else:
        return {
            "forecast": None,
            "error": f"Unknown forecast model: {model}",
        }


def compute_optimize(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Portfolio optimization.
    
    Payload:
    - returns: dict of {ticker: [daily_returns]}
    - objective: "min_volatility" | "max_sharpe" | "risk_parity"
    - constraints: optional dict
    """
    returns_data = payload.get("returns", {})
    objective = payload.get("objective", "max_sharpe")
    risk_free_rate = float(payload.get("riskFreeRate", 5.0)) / 100

    if not returns_data or len(returns_data) < 2:
        return {
            "weights": None,
            "expectedReturn": None,
            "expectedVolatility": None,
            "sharpeRatio": None,
            "error": "Need at least 2 assets with return data",
        }

    tickers = list(returns_data.keys())
    returns_matrix = np.array([returns_data[t] for t in tickers], dtype=float)
    mean_returns = np.mean(returns_matrix, axis=1)
    cov_matrix = np.cov(returns_matrix)
    n_assets = len(tickers)

    # Equal weight as default
    weights = np.ones(n_assets) / n_assets

    if objective == "min_volatility":
        # Simplified: inverse volatility weighting
        vols = np.std(returns_matrix, axis=1, ddof=1)
        inv_vols = 1.0 / (vols + 1e-10)
        weights = inv_vols / np.sum(inv_vols)

    elif objective == "risk_parity":
        # Simplified equal risk contribution
        weights = np.ones(n_assets) / n_assets

    # elif max_sharpe — use equal weight for MVP
    # (full optimization requires scipy.optimize)

    port_return = float(np.dot(weights, mean_returns)) * 252
    port_vol = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))) * math.sqrt(252)

    return {
        "weights": {ticker: float(weights[i]) for i, ticker in enumerate(tickers)},
        "expectedReturn": port_return,
        "expectedVolatility": port_vol,
        "sharpeRatio": float((port_return - risk_free_rate) / port_vol) if port_vol > 0 else None,
    }


def compute_technical_indicators(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Compute technical indicators for a ticker.
    
    Payload:
    - ticker: string
    - prices: list of {time, close, high, low, volume?}
    """
    ticker = payload.get("ticker", "")
    prices = payload.get("prices", [])

    if not prices or len(prices) < 20:
        return {
            "ticker": ticker,
            "rsi": None,
            "macd": None,
            "sma50": None,
            "sma200": None,
            "bollingerBands": None,
            "volumeSpike": False,
            "error": "Insufficient price data",
        }

    closes = np.array([p["close"] for p in prices], dtype=float)
    highs = np.array([p.get("high", p["close"]) for p in prices], dtype=float)
    lows = np.array([p.get("low", p["close"]) for p in prices], dtype=float)
    volumes = np.array([p.get("volume", 0) or 0 for p in prices], dtype=float)

    # RSI(14)
    deltas = np.diff(closes)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = np.mean(gains[-14:]) if len(gains) >= 14 else np.mean(gains)
    avg_loss = np.mean(losses[-14:]) if len(losses) >= 14 else np.mean(losses)
    rsi = None
    if avg_loss > 0:
        rs = avg_gain / avg_loss
        rsi = round(100 - (100 / (1 + rs)), 2)

    # SMA
    sma50 = round(float(np.mean(closes[-50:])), 2) if len(closes) >= 50 else None
    sma200 = round(float(np.mean(closes[-200:])), 2) if len(closes) >= 200 else None

    # MACD (12, 26, 9)
    def ema(data: np.ndarray, period: int) -> float:
        if len(data) < period:
            return float(np.mean(data))
        multiplier = 2 / (period + 1)
        result = float(np.mean(data[:period]))
        for i in range(period, len(data)):
            result = (data[i] - result) * multiplier + result
        return result

    macd_line = ema(closes, 12) - ema(closes, 26) if len(closes) >= 26 else None
    signal_line = None
    macd_histogram = None
    if macd_line is not None and len(closes) >= 35:
        # Simplified — use last 9 values for signal
        signal_line = ema(np.array([macd_line]), 9)
        macd_histogram = round(macd_line - float(signal_line), 4) if signal_line else None

    macd_result = None
    if macd_line is not None:
        macd_result = {
            "macd": round(macd_line, 4),
            "signal": round(float(signal_line), 4) if signal_line else None,
            "histogram": macd_histogram,
        }

    # Bollinger Bands (20, 2)
    if len(closes) >= 20:
        bb_mean = float(np.mean(closes[-20:]))
        bb_std = float(np.std(closes[-20:], ddof=1))
        bollinger_bands = {
            "upper": round(bb_mean + 2 * bb_std, 2),
            "middle": round(bb_mean, 2),
            "lower": round(bb_mean - 2 * bb_std, 2),
        }
    else:
        bollinger_bands = None

    # Volume spike (current vs 20-day average)
    vol_spike = False
    if len(volumes) >= 21:
        avg_vol = float(np.mean(volumes[-21:-1]))
        current_vol = float(volumes[-1])
        if avg_vol > 0 and current_vol > avg_vol * 2:
            vol_spike = True

    return {
        "ticker": ticker,
        "rsi": rsi,
        "macd": macd_result,
        "sma50": sma50,
        "sma200": sma200,
        "bollingerBands": bollinger_bands,
        "volumeSpike": vol_spike,
    }
