"use client";

import { useEffect, useRef, useState } from "react";

import { DemoFrame } from "./DemoFrame";
import styles from "./Demos.module.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** 2026년 4월 — 1일이 수요일이라 앞에 빈칸 둘 */
const LEADING_BLANKS = 2;
const DAYS_IN_MONTH = 30;
const pad = (day: number) => String(day).padStart(2, "0");

/**
 * 원문 CSS 를 그대로 쓴다. 칠하는 일은 전부 선택자가 하고, JS 는 체크를 두 개로 유지하고 클래스만 붙인다.
 * 이 데모 안에서만 적용되도록 앞에 [data-date-demo] 를 붙였다.
 */
const RANGE_CSS = `@layer base, range;
@layer base {
  [data-date-demo] .date {
    position: relative;
    border-radius: 6px;
    background: var(--blog-bg);
  }
}
/* 칸 바탕 < 구간 < 선택된 날짜 순서를 명시도 대신 레이어로 정한다. 구간 규칙은 명시도가 높아 그냥 두면 끝 날짜까지 덮는다 */
@layer range {
  [data-date-demo].isRangeSelected {
    :nth-child(1 of :has(:checked)) ~ :not(:nth-child(2 of :has(:checked)) ~ .date) {
      background-color: rgba(217, 119, 87, 0.22);
    }
  }
}
[data-date-demo] .date:has(:checked) {
  background: var(--blog-accent);
  color: var(--blog-on-accent);
  font-weight: 700;
}`;

/** 화면에 보여 줄 핵심 규칙(원문 그대로) */
const SHOWN_CSS = `.isRangeSelected {
  :nth-child(1 of :has(:checked)) ~ :not(:nth-child(2 of :has(:checked)) ~ .date) {
    background-color: rgb(228 239 253);
  }
}`;

/** 원문 JS — 체크가 셋이 되면 누른 위치에 따라 하나를 풀어 둘로 유지한다(label 로 감싸 closest 로 바꿈) */
function keepTwoChecked(calendar: HTMLElement, target: HTMLElement) {
  const dates = Array.from(calendar.getElementsByClassName("date"));
  if (!calendar.querySelector(":checked")) {
    calendar.classList.remove("isRangeSelected");
    return;
  }
  calendar.classList.toggle("isRangeSelected", Boolean(calendar.querySelector(":nth-child(2 of :has(:checked))")));
  if (!calendar.querySelector(":nth-child(3 of :has(:checked))")) return;

  const nth = (n: number) => calendar.querySelector(`:nth-child(${n} of :has(:checked))`);
  const uncheck = (n: number) => {
    const input = calendar.querySelector<HTMLInputElement>(`:nth-child(${n} of :has(:checked)) input`);
    if (input) input.checked = false;
  };
  switch (dates.indexOf(target.closest(".date")!)) {
    case dates.indexOf(nth(1)!):
      uncheck(2);
      break;
    case dates.indexOf(nth(2)!):
      uncheck(3);
      break;
    case dates.indexOf(nth(3)!):
      uncheck(2);
      break;
  }
}

/** :has() · :nth-child(of) · 형제 결합자로 칠하는 실제 달력 */
export function DateRangeDemo() {
  const calendarRef = useRef<HTMLUListElement>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const supportsSelectors = typeof CSS !== "undefined" && CSS.supports("selector(:nth-child(1 of :has(:checked)))");

  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;
    const onChange = (event: Event) => {
      keepTwoChecked(calendar, event.target as HTMLElement);
      setChecked(Array.from(calendar.querySelectorAll<HTMLInputElement>(":checked"), (input) => input.value));
    };
    calendar.addEventListener("change", onChange);
    return () => calendar.removeEventListener("change", onChange);
  }, []);

  const clear = () => {
    const calendar = calendarRef.current;
    if (!calendar) return;
    calendar.querySelectorAll<HTMLInputElement>(":checked").forEach((input) => (input.checked = false));
    calendar.classList.remove("isRangeSelected");
    setChecked([]);
  };

  const status = (() => {
    if (checked.length === 0) return "시작일을 고르세요";
    if (checked.length === 1) return `시작 04.${checked[0]} — 종료일을 고르세요`;
    return `04.${checked[0]} → 04.${checked[1]}`;
  })();

  return (
    <DemoFrame title="2026년 4월, 두 날짜를 눌러 기간 선택" hint="세 번째로 누르면 가까운 끝이 옮겨 갑니다">
      <style>{RANGE_CSS}</style>
      <div className={styles.controls}>
        <span className={styles.readout}>
          <strong>{status}</strong>
        </span>
        <button type="button" className={styles.button} onClick={clear} style={{ marginLeft: "auto" }}>
          초기화
        </button>
      </div>
      {!supportsSelectors && (
        <p className={styles.readout}>이 브라우저는 :nth-child(… of :has()) 를 지원하지 않아 칠해지지 않습니다.</p>
      )}
      <ul ref={calendarRef} data-date-demo className="calendar" style={calendarStyle}>
        {WEEKDAYS.map((day) => (
          <li key={day} className="day" style={dayStyle}>
            {day}
          </li>
        ))}
        {Array.from({ length: LEADING_BLANKS }, (_, index) => (
          <li key={`blank-${index}`} className="day" aria-hidden />
        ))}
        {Array.from({ length: DAYS_IN_MONTH }, (_, index) => {
          const day = pad(index + 1);
          return (
            <li key={day} className="date">
              <label style={labelStyle}>
                {day}
                <input type="checkbox" value={day} style={checkboxStyle} aria-label={`4월 ${index + 1}일`} />
              </label>
            </li>
          );
        })}
      </ul>
      <pre className={styles.code}>{SHOWN_CSS}</pre>
    </DemoFrame>
  );
}

/* 달력 칸의 바탕색은 RANGE_CSS 에 둔다 — 인라인 style 로 주면 칠하는 선택자보다 우선해 아무것도 칠해지지 않는다 */
const calendarStyle = {
  listStyle: "none",
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 4,
  fontFamily: "var(--blog-mono)",
  fontSize: 13,
} as const;
const dayStyle = { padding: "4px 0", textAlign: "center", color: "var(--blog-faint)", fontSize: 11 } as const;
const labelStyle = { display: "block", padding: "10px 0", textAlign: "center", cursor: "pointer" } as const;
const checkboxStyle = { position: "absolute", inset: 0, opacity: 0, cursor: "pointer", margin: 0 } as const;
