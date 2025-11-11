from __future__ import annotations

from collections.abc import Callable, Iterable
from typing import Any, List

import pytest

from .test_data import Case

CaseHandler = Callable[..., None]


def build_case_params(
    cases: Iterable[Case],
    config: dict[str, dict[str, Any]],
) -> List[pytest.ParameterSet]:
    params: List[pytest.ParameterSet] = []
    for case in cases:
        entry = config.get(case.case_id, {})
        handler: CaseHandler | None = entry.get("handler")
        skip_reason: str | None = entry.get("skip_reason")
        marks = list(entry.get("marks", []))

        if skip_reason:
            marks.append(pytest.mark.skip(reason=skip_reason))
        elif handler is None:
            marks.append(
                pytest.mark.skip(
                    reason=f"Chưa tự động hóa {case.case_id}: {case.title}",
                )
            )

        should_mark_xfail = (
            handler is not None
            and not skip_reason
            and case.status == "F"
            and case.bug_id
        )
        if should_mark_xfail:
            reason = entry.get("xfail_reason") or f"{case.bug_id}: {case.bug_note or case.actual}"
            marks.append(pytest.mark.xfail(reason=reason, strict=entry.get("xfail_strict", False)))

        params.append(pytest.param(case, handler, id=case.case_id, marks=marks))
    return params
