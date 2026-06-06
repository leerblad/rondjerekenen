import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { studentId, itemId, equip } = await req.json();
  if (!studentId || !itemId) {
    return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });
  }

  const { data: item } = await supabaseAdmin
    .from("shop_items")
    .select("id, cost, category, asset_key")
    .eq("id", itemId)
    .maybeSingle();
  if (!item) {
    return NextResponse.json({ error: "Item bestaat niet." }, { status: 404 });
  }

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("coins, avatar_outfit")
    .eq("id", studentId)
    .maybeSingle();
  if (!student) {
    return NextResponse.json({ error: "Leerling niet gevonden." }, { status: 404 });
  }

  const outfit = (student.avatar_outfit as Record<string, string>) || {};

  // already owned?
  const { data: existing } = await supabaseAdmin
    .from("student_items")
    .select("item_id")
    .eq("student_id", studentId)
    .eq("item_id", itemId)
    .maybeSingle();

  let coins = student.coins;

  if (!existing) {
    if (student.coins < item.cost) {
      return NextResponse.json(
        { error: "Niet genoeg munten." },
        { status: 400 }
      );
    }
    coins = student.coins - item.cost;
    await supabaseAdmin
      .from("student_items")
      .insert({ student_id: studentId, item_id: itemId });
  }

  // equip (toggle into outfit by category) when buying or when explicitly equipping
  if (existing || equip !== false) {
    outfit[item.category] = item.asset_key;
  }

  await supabaseAdmin
    .from("students")
    .update({ coins, avatar_outfit: outfit })
    .eq("id", studentId);

  return NextResponse.json({ coins, equipped: outfit, ownedItemId: itemId });
}
