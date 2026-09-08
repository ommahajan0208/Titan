# backend/oracle/analysis.py
# OracleReport: reads generation series and produces regime analysis.
# Spec: Phase 7 / backend_spec.md section 9.7

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class OracleFinding:
    key: str
    detail: str


@dataclass
class OracleReport:
    regime: str
    arms_race: Dict[str, float]
    findings: List[OracleFinding]
    summary: str
    config_hash: str


class Oracle:
    """
    Reads the full generation series of a co-evolution run and produces
    an OracleReport with regime detection and findings.
    """

    def analyze(
        self,
        generation_series: List[Dict[str, Any]],
        run_id: str,
        config_hash: str = "demo",
    ) -> OracleReport:
        """
        Analyze generation series to produce Oracle findings.
        Regime is determined from the final ARI trend.
        """
        if not generation_series:
            return OracleReport(
                regime="stalemate",
                arms_race={"value": 0.0},
                findings=[OracleFinding(key="no_data", detail="No generations completed yet.")],
                summary=f"Run {run_id}: no data available.",
                config_hash=config_hash,
            )

        aris = [g.get("arms_race_index", 0.0) for g in generation_series]
        final_ari = aris[-1] if aris else 0.0
        regime = self._classify_regime(final_ari)

        findings = self._generate_findings(generation_series, regime)

        evasion_rates = [g.get("detection_rate_fixed_set", 0.9) for g in generation_series]
        mean_detection = sum(evasion_rates) / len(evasion_rates) if evasion_rates else 0.0

        summary = (
            f"Run {run_id}: {len(generation_series)} generations completed. "
            f"Regime: {regime.replace('_', ' ')}. "
            f"Mean detection rate: {mean_detection:.1%}. "
            f"Final ARI: {final_ari:+.4f}."
        )

        return OracleReport(
            regime=regime,
            arms_race={"value": round(final_ari, 4)},
            findings=findings,
            summary=summary,
            config_hash=config_hash,
        )

    def _classify_regime(self, ari: float) -> str:
        if ari > 0.15:
            return "blue_ascendant"
        if ari < -0.15:
            return "red_ascendant"
        if abs(ari) < 0.05:
            return "stalemate"
        return "contested"

    def _generate_findings(
        self,
        series: List[Dict[str, Any]],
        regime: str,
    ) -> List[OracleFinding]:
        findings = []

        if len(series) >= 3:
            early_ari = series[0].get("arms_race_index", 0.0)
            late_ari = series[-1].get("arms_race_index", 0.0)
            ari_trend = late_ari - early_ari

            if ari_trend > 0.05:
                findings.append(OracleFinding(
                    key="blue_improving",
                    detail=f"Blue team gaining ground across generations. ARI improved by {ari_trend:+.4f}.",
                ))
            elif ari_trend < -0.05:
                findings.append(OracleFinding(
                    key="red_improving",
                    detail=f"Red team pressure increasing across generations. ARI declined by {ari_trend:.4f}.",
                ))

        fprs = [g.get("false_positive_rate", 0.01) for g in series]
        if fprs:
            max_fpr = max(fprs)
            if max_fpr > 0.015:
                findings.append(OracleFinding(
                    key="fpr_spike",
                    detail=f"FPR spiked to {max_fpr:.2%} during the run. Blue policy required tightening.",
                ))

        novelty_sizes = [g.get("novelty_archive_size", 0) for g in series]
        if novelty_sizes and max(novelty_sizes) > 20:
            findings.append(OracleFinding(
                key="novelty_accumulation",
                detail=f"Novelty archive reached {max(novelty_sizes)} unique behavior descriptors, indicating Red team exploration.",
            ))

        if regime == "blue_ascendant":
            findings.append(OracleFinding(
                key="blue_holding",
                detail="Blue team maintaining detection advantage on fixed-set vectors throughout the run.",
            ))
        elif regime == "red_ascendant":
            findings.append(OracleFinding(
                key="red_evasion_success",
                detail="Red team achieving sustained evasion. Consider triggering adversarial retraining.",
            ))

        return findings
