import { supabaseAdmin } from "@/lib/supabase";
import { getUnlockThreshold } from "@/lib/math";

/**
 * Check whether the student has earned a level-up.
 * Returns true if the last 3 distinct calendar days at `level`
 * all meet the unlock threshold for that level.
 */
export async function checkUnlock(
  studentId: string,
  level: number
): Promise<boolean> {
  const threshold = getUnlockThreshold(level);

  const { data: sessions } = await supabaseAdmin
    .from("sessions")
    .select("date, total, correct")
    .eq("student_id", studentId)
    .eq("level", level)
    .eq("completed", true)
    .order("date", { ascending: false });

  if (!sessions || sessions.length === 0) return false;

  // aggregate per distinct day
  const byDay = new Map<string, { total: number; correct: number }>();
  for (const s of sessions) {
    const cur = byDay.get(s.date) || { total: 0, correct: 0 };
    cur.total += s.total;
    cur.correct += s.correct;
    byDay.set(s.date, cur);
  }

  const days = Array.from(byDay.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 3);

  if (days.length < 3) return false;

  return days.every(([, v]) => v.total > 0 && v.correct / v.total >= threshold);
}
