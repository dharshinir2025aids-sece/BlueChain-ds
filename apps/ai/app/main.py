"""
BlueChain MRV — AI service (Phase 1 foundation).
Endpoints are stubs; ML logic arrives in Phase 7.
"""

from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ai_host: str = "0.0.0.0"
    ai_port: int = 8000
    ai_cors_origins: str = "http://localhost:3000,http://localhost:4000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

app = FastAPI(
    title="BlueChain MRV AI",
    description="AI assist service for blue carbon MRV (Phase 1 stub)",
    version="0.1.0",
)

origins = [o.strip() for o in settings.ai_cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    service: str
    status: str
    version: str
    timestamp: str


class ScoreRequest(BaseModel):
    observation_id: str | None = None
    metrics: dict = Field(default_factory=dict)


class ScoreResponse(BaseModel):
    score: float
    risk_level: str
    flags: list[str]
    estimate_tco2e: float | None = None
    explanation: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        service="bluechain-ai",
        status="ok",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/v1/vision/quality", response_model=ScoreResponse)
def vision_quality(_body: ScoreRequest) -> ScoreResponse:
    return ScoreResponse(
        score=0.0,
        risk_level="unknown",
        flags=["phase1_stub"],
        explanation="Vision quality scoring is not implemented in Phase 1.",
    )


@app.post("/v1/vision/duplicate", response_model=ScoreResponse)
def vision_duplicate(_body: ScoreRequest) -> ScoreResponse:
    return ScoreResponse(
        score=0.0,
        risk_level="unknown",
        flags=["phase1_stub"],
        explanation="Duplicate detection is not implemented in Phase 1.",
    )


@app.post("/v1/mrv/estimate", response_model=ScoreResponse)
def mrv_estimate(_body: ScoreRequest) -> ScoreResponse:
    return ScoreResponse(
        score=0.0,
        risk_level="unknown",
        flags=["phase1_stub"],
        estimate_tco2e=None,
        explanation="Sequestration estimation is not implemented in Phase 1.",
    )


@app.post("/v1/mrv/anomaly", response_model=ScoreResponse)
def mrv_anomaly(_body: ScoreRequest) -> ScoreResponse:
    return ScoreResponse(
        score=0.0,
        risk_level="unknown",
        flags=["phase1_stub"],
        explanation="Anomaly detection is not implemented in Phase 1.",
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.ai_host,
        port=settings.ai_port,
        reload=True,
    )
