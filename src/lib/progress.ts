import { supabaseAdmin } from "@/lib/supabase";
import { OPERATIONS, Operation } from "@/lib/math";

// Check the last 3 *distinct days* of completed sessions for the student's
// current operation. If each of those 3 days had >= 80% correct, return true.
export async function checkUnlock(
  studentId: string,
  currentOperation: string
): Promise<boolean> {
  const { data: sessions } = await supabaseAdmin
    .from("sessions")
    .select("date, total, correct")
    .eq("student_id", studentId)
    .eq("operation", currentOperation)
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

  return days.every(
    ([, v]) => v.total > 0 && v.correct / v.total >= 0.8
  );
}

export function nextOperation(current: string): Operation | null {
  const idx = OPERATIONS.indexOf(current as Operation);
  if (idx === -1 || idx >= OPERATIONS.length - 1) return null;
  return OPERATIONS[idx + 1];
}

export function unlockedOperations(current: string): Operation[] {
  const idx = OPERATIONS.indexOf(current as Operation);
  if (idx === -1) return [OPERATIONS[0]];
  return OPERATIONS.slice(0, idx + 1);
}
