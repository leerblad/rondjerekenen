import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const { data: items } = await supabaseAdmin
    .from("shop_items")
    .select("id, name, category, cost, asset_key")
    .order("cost");

  let owned: string[] = [];
  let coins = 0;
  let equipped: Record<string, string> = {};

  if (studentId) {
    const { data: si } = await supabaseAdmin
      .from("student_items")
      .select("item_id")
      .eq("student_id", studentId);
    owned = (si || []).map((x) => x.item_id);

    const { data: student } = await supabaseAdmin
      .from("students")
      .select("coins, avatar_outfit")
      .eq("id", studentId)
      .maybeSingle();
    coins = student?.coins ?? 0;
    equipped = (student?.avatar_outfit as Record<string, string>) || {};
  }

  return NextResponse.json({ items: items || [], owned, coins, equipped });
}
