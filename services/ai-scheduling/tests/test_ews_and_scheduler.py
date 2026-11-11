from app.ews import compute_student_risk


def test_ews_critical_and_low():
    low = compute_student_risk(absent_days=0, late_days=1, total_days=20, current_avg_grade=85.0, previous_avg_grade=84.0)
    assert low.risk_level == "LOW"
    assert low.attendance_risk_score < 40

    critical = compute_student_risk(absent_days=6, late_days=4, total_days=20, current_avg_grade=55.0, previous_avg_grade=78.0)
    assert critical.risk_level == "CRITICAL"
    assert critical.attendance_risk_score >= 70
    assert critical.academic_drop_score >= 70
