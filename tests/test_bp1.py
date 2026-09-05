# tests/test_bp1.py
# BP1 verification tests.
# Run from backend/: pytest tests/test_bp1.py -v
#
# These tests verify the skeleton is correct before any business logic is added.

import pytest
from httpx import AsyncClient, ASGITransport

# Import app after adjusting sys.path so config.py is found
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_root_returns_200(client):
    r = await client.get("/")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "health" in body
    assert "overview" in body


# ---------------------------------------------------------------------------
# /api/health
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_health_status_ok(client):
    r = await client.get("/api/health")
    assert r.status_code == 200


@pytest.mark.anyio
async def test_health_schema(client):
    body = r = (await client.get("/api/health")).json()
    assert body["status"] == "ok"
    assert "version" in body
    assert "config_hash" in body
    assert isinstance(body["capabilities"], list)
    assert len(body["capabilities"]) >= 5


@pytest.mark.anyio
async def test_health_has_response_time_header(client):
    r = await client.get("/api/health")
    assert "x-response-time" in r.headers


# ---------------------------------------------------------------------------
# /api/overview
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_overview_returns_200(client):
    r = await client.get("/api/overview")
    assert r.status_code == 200


@pytest.mark.anyio
async def test_overview_schema(client):
    body = (await client.get("/api/overview")).json()
    assert "decision_split" in body
    assert "arms_race_index" in body
    assert "recall" in body
    assert "fpr" in body
    assert "config_hash" in body
    split = body["decision_split"]
    assert set(split.keys()) == {"ALLOW", "REVIEW", "BLOCK"}


# ---------------------------------------------------------------------------
# Stub endpoints return 200 (not 404)
# ---------------------------------------------------------------------------
@pytest.mark.anyio
@pytest.mark.parametrize("path", [
    "/api/taxonomy",
    "/api/fidelity",
    "/api/gap-analysis",
    "/api/atlas",
    "/api/models",
    "/api/evolution",
    "/api/audit",
    "/api/adaptive/runs",
])
async def test_stub_get_endpoints_return_200(client, path):
    r = await client.get(path)
    assert r.status_code == 200
    body = r.json()
    assert body.get("status") == "stub"


# ---------------------------------------------------------------------------
# CORS headers are present
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_cors_header_present(client):
    r = await client.options(
        "/api/health",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"},
    )
    # FastAPI CORS middleware returns 200 for preflight
    assert r.status_code in (200, 204)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
def test_config_hash_is_stable():
    from config import cfg
    h1 = cfg.config_hash()
    h2 = cfg.config_hash()
    assert h1 == h2
    assert len(h1) == 16


def test_config_derived_seeds_are_unique():
    from config import cfg
    seeds = [
        cfg.seed_simulation,
        cfg.seed_genome,
        cfg.seed_evolution,
        cfg.seed_novelty,
        cfg.seed_ml_train,
        cfg.seed_gap_analysis,
        cfg.seed_kyc,
    ]
    assert len(set(seeds)) == len(seeds), "All derived seeds must be unique"


def test_config_thresholds_are_sane():
    from config import cfg
    assert 0 < cfg.ml_threshold < 1
    assert cfg.review_threshold < cfg.ml_threshold
    assert 0 < cfg.fpr_target < 0.1
    weights = cfg.weight_ml + cfg.weight_graph + cfg.weight_rule
    assert abs(weights - 1.0) < 1e-9, f"Ensemble weights must sum to 1.0, got {weights}"
