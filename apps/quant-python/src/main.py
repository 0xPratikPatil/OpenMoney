"""
OpenMoney Quant Engine — Python Microservice

FastAPI RPC-style service for heavy financial computations:
- Risk metrics (VaR, CVaR, Sharpe, Sortino, drawdown)
- Portfolio optimization (mean-variance, risk parity)
- Forecasting (ARIMA, GARCH, Monte Carlo)
- Technical indicators

Communication: JSON in / JSON out via POST /compute
"""

import time
import json
from typing import Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from . import models

app = FastAPI(title="OpenMoney Quant Engine", version="0.1.0")


class ComputeRequest(BaseModel):
    type: str  # "risk_metrics" | "forecast" | "optimize" | "technical_indicators"
    payload: dict[str, Any]


class ComputeResponse(BaseModel):
    success: bool
    data: dict[str, Any] = {}
    error: str | None = None
    computedAt: str = ""


COMPUTATION_TIMEOUT = 30  # seconds


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


@app.post("/compute", response_model=ComputeResponse)
async def compute(request: ComputeRequest):
    start_time = time.time()

    try:
        match request.type:
            case "risk_metrics":
                result = models.compute_risk_metrics(request.payload)
            case "forecast":
                result = models.compute_forecast(request.payload)
            case "optimize":
                result = models.compute_optimize(request.payload)
            case "technical_indicators":
                result = models.compute_technical_indicators(request.payload)
            case _:
                raise HTTPException(status_code=400, detail=f"Unknown computation type: {request.type}")

        elapsed = time.time() - start_time
        return ComputeResponse(
            success=True,
            data=result,
            computedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
    except HTTPException:
        raise
    except Exception as e:
        elapsed = time.time() - start_time
        return ComputeResponse(
            success=False,
            error=str(e),
            computedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
