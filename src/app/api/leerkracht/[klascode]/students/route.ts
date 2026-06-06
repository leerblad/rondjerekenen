import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ klascode: string }> }
) {
  const { klascode } = await params;
  const code = klascode.toUpperCase();
  const today = new Date().toISOString().slice(0, 10);

  const { data: students } = await supabaseAdmin
    .from("students")
    .select("id, nickname, grade, coins, current_operation")
    .eq("class_code", code)
    .order("nickname");

  if (!students) return NextResponse.json({ students: [] });

  const enriched = await Promise.all(
    students.map(async (s) => {
      const { data: sessions } = await supabaseAdmin
        .from("sessions")
        .select("date, total, correct, operation, completed")
        .eq("student_id", s.id)
        .eq("completed", true)
        .order("date", { ascending: false });

      const doneToday = (sessions || []).some((x) => x.date === today);

      // streak of consecutive days ending today/yesterday
      const days = Array.from(
        new Set((sessions || []).map((x) => x.date))
      ).sort((a, b) => (a < b ? 1 : -1));
      let streak = 0;
      const cursor = new Date(today);
      // allow streak to count from today or yesterday
      if (days[0] && days[0] !== today) cursor.setDate(cursor.getDate() - 1);
      for (const d of days) {
        const want = cursor.toISOString().slice(0, 10);
        if (d === want) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else if (d < want) {
          break;
        }
      }

      return {
        id: s.id,
        nickname: s.nickname,
        grade: s.grade,
        coins: s.coins,
        currentOperation: s.current_operation,
        doneToday,
        streak,
      };
    })
  );

  return NextResponse.json({ students: enriched });
}
