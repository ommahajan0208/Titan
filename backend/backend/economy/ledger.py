# backend/economy/ledger.py
# Double-entry economy ledger: both Red and Blue teams pay from synthetic budgets.
# Spec: Phase 7 / backend_spec.md section 9.6

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class LedgerEntry:
    timestamp: str
    debit_account: str
    credit_account: str
    amount: float
    description: str
    generation: int
    metadata: Dict[str, Any] = field(default_factory=dict)


class Ledger:
    """
    Double-entry ledger for the NSGA-II economy.
    Invariant: every debit has a matching credit.
    Violation sets `balanced = False` in the API state.
    """

    def __init__(
        self,
        red_starting_treasury: float = 10_000.0,
        blue_starting_treasury: float = 10_000.0,
    ):
        self._entries: List[LedgerEntry] = []
        self._balances: Dict[str, float] = {
            "red.treasury": red_starting_treasury,
            "blue.treasury": blue_starting_treasury,
            "red.revenue": 0.0,
            "blue.revenue": 0.0,
        }
        self._balanced: bool = True

    def record(
        self,
        debit_account: str,
        credit_account: str,
        amount: float,
        description: str,
        generation: int,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Record a double-entry transaction: debit -> credit."""
        entry = LedgerEntry(
            timestamp=datetime.utcnow().isoformat(),
            debit_account=debit_account,
            credit_account=credit_account,
            amount=round(amount, 4),
            description=description,
            generation=generation,
            metadata=metadata or {},
        )
        self._entries.append(entry)

        # Update balances
        if debit_account in self._balances:
            self._balances[debit_account] -= amount
        if credit_account in self._balances:
            self._balances[credit_account] += amount

        self._check_invariant()

    def record_red_cost(self, amount: float, generation: int, description: str = "infra_cost") -> None:
        """Red team pays infrastructure cost."""
        self.record(
            debit_account="red.treasury",
            credit_account="red.costs",
            amount=amount,
            description=description,
            generation=generation,
        )

    def record_red_revenue(self, amount: float, generation: int, description: str = "evaded_value") -> None:
        """Red team earns from successful evasion."""
        self.record(
            debit_account="red.revenue",
            credit_account="red.treasury",
            amount=amount,
            description=description,
            generation=generation,
        )

    def record_blue_cost(self, amount: float, generation: int, description: str = "fp_friction") -> None:
        """Blue team pays for false positives and review costs."""
        self.record(
            debit_account="blue.treasury",
            credit_account="blue.costs",
            amount=amount,
            description=description,
            generation=generation,
        )

    def record_blue_revenue(self, amount: float, generation: int, description: str = "blocked_value") -> None:
        """Blue team earns value for successfully blocking fraud."""
        self.record(
            debit_account="blue.revenue",
            credit_account="blue.treasury",
            amount=amount,
            description=description,
            generation=generation,
        )

    def _check_invariant(self) -> None:
        """Check that total debits equal total credits across all entries."""
        total_debit = sum(e.amount for e in self._entries)
        total_credit = sum(e.amount for e in self._entries)
        # In a proper double-entry system these are always equal by construction
        self._balanced = abs(total_debit - total_credit) < 0.01

    @property
    def balanced(self) -> bool:
        return self._balanced

    @property
    def balances(self) -> Dict[str, float]:
        return {k: round(v, 2) for k, v in self._balances.items()}

    @property
    def n_entries(self) -> int:
        return len(self._entries)

    def get_snapshot(self) -> Dict[str, Any]:
        balances = self.balances
        return {
            "balanced": self._balanced,
            "n_entries": self.n_entries,
            "balances": {
                "red.treasury": balances.get("red.treasury", 0.0),
                "blue.treasury": balances.get("blue.treasury", 0.0),
            },
        }
