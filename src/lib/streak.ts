// Returns the most recent school day (Mon-Fri) strictly before `date`
export function prevSchoolDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  do {
    d.setUTCDate(d.getUTCDate() - 1);
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return d.toISOString().slice(0, 10);
}

// True if today is a school day (Mon-Fri)
export function isSchoolDay(dateStr: string): boolean {
  const day = new Date(dateStr + "T12:00:00Z").getUTCDay();
  return day >= 1 && day <= 5;
}

export type StreakUpdate = {
  streak: number;
  streak_updated_date: string;
  streak_lost: number;
};

// Compute new streak values after a session on `today`.
// Pass current values from the DB.
export function computeStreak(
  today: string,
  current: { streak: number; streak_updated_date: string | null; streak_lost: number }
): StreakUpdate {
  const { streak, streak_updated_date, streak_lost } = current;

  // Only count school days for the streak
  if (!isSchoolDay(today)) {
    return { streak, streak_updated_date: streak_updated_date ?? today, streak_lost };
  }

  // Already counted today
  if (streak_updated_date === today) {
    return { streak, streak_updated_date: today, streak_lost };
  }

  const prev = prevSchoolDay(today);

  if (!streak_updated_date || streak_updated_date < prev) {
    // Missed at least one school day — streak breaks
    return { streak: 1, streak_updated_date: today, streak_lost: streak };
  }

  // streak_updated_date === prev: consecutive school day
  return { streak: streak + 1, streak_updated_date: today, streak_lost };
}
