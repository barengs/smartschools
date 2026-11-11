from __future__ import annotations

from dataclasses import dataclass
from ortools.sat.python import cp_model


@dataclass(frozen=True)
class TeachingAssignment:
    classroom_id: str
    subject_id: str
    teacher_id: str
    weekly_hours: int
    requires_lab: bool = False
    lab_room_code: str | None = None


@dataclass(frozen=True)
class TimeSlot:
    day_of_week: int  # 1 (Monday) .. 5 (Friday)
    slot_index: int
    start_time: str
    end_time: str


@dataclass(frozen=True)
class ScheduledLesson:
    classroom_id: str
    subject_id: str
    teacher_id: str
    room_code: str | None
    day_of_week: int
    start_time: str
    end_time: str


DEFAULT_SLOTS: list[TimeSlot] = [
    TimeSlot(day, idx, f"{7 + idx:02d}:00:00", f"{8 + idx:02d}:00:00")
    for day in range(1, 6)
    for idx in range(0, 6)
]


def solve_timetable(
    assignments: list[TeachingAssignment],
    slots: list[TimeSlot] | None = None,
    teacher_unavailable: dict[str, set[tuple[int, int]]] | None = None,
) -> list[ScheduledLesson]:
    """Generate a 100% conflict-free timetable using Google OR-Tools CP-SAT."""
    slot_pool = slots or DEFAULT_SLOTS
    unavailable = teacher_unavailable or {}

    model = cp_model.CpModel()
    x: dict[tuple[int, int], cp_model.IntVar] = {}

    for a_idx, a in enumerate(assignments):
        blocked = unavailable.get(a.teacher_id, set())
        for s_idx, slot in enumerate(slot_pool):
            var = model.NewBoolVar(f"x_{a_idx}_{s_idx}")
            if (slot.day_of_week, slot.slot_index) in blocked:
                model.Add(var == 0)
            x[(a_idx, s_idx)] = var

    # Hard constraint 1: Exact weekly hours per assignment
    for a_idx, a in enumerate(assignments):
        model.Add(sum(x[(a_idx, s_idx)] for s_idx in range(len(slot_pool))) == a.weekly_hours)

    # Hard constraint 2: No classroom overlap in the same slot
    by_classroom: dict[str, list[int]] = {}
    by_teacher: dict[str, list[int]] = {}
    by_lab: dict[str, list[int]] = {}
    for a_idx, a in enumerate(assignments):
        by_classroom.setdefault(a.classroom_id, []).append(a_idx)
        by_teacher.setdefault(a.teacher_id, []).append(a_idx)
        if a.requires_lab and a.lab_room_code:
            by_lab.setdefault(a.lab_room_code, []).append(a_idx)

    for s_idx in range(len(slot_pool)):
        for group in by_classroom.values():
            model.Add(sum(x[(a_idx, s_idx)] for a_idx in group) <= 1)
        for group in by_teacher.values():
            model.Add(sum(x[(a_idx, s_idx)] for a_idx in group) <= 1)
        for group in by_lab.values():
            model.Add(sum(x[(a_idx, s_idx)] for a_idx in group) <= 1)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 15.0
    status = solver.Solve(model)
    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        raise ValueError("No conflict-free timetable satisfies all constraints")

    results: list[ScheduledLesson] = []
    for a_idx, a in enumerate(assignments):
        for s_idx, slot in enumerate(slot_pool):
            if solver.Value(x[(a_idx, s_idx)]) == 1:
                results.append(
                    ScheduledLesson(
                        classroom_id=a.classroom_id,
                        subject_id=a.subject_id,
                        teacher_id=a.teacher_id,
                        room_code=a.lab_room_code if a.requires_lab else None,
                        day_of_week=slot.day_of_week,
                        start_time=slot.start_time,
                        end_time=slot.end_time,
                    )
                )
    return results
