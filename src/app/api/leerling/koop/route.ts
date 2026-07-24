import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Prices per category
const PRICES: Record<string, number> = {
  color: 50,
  pattern: 100,
  image: 150,
};

export async function POST(req: Request) {
  const { studentId, background, category } = await req.json() as {
    studentId: string;
    background: string;
    category: "color" | "pattern" | "image";
  };

  if (!studentId || !background || !category) {
    return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });
  }

  const price = PRICES[category];
  if (!price) return NextResponse.json({ error: "Onbekende categorie." }, { status: 400 });

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("coins, background, owned_backgrounds")
    .eq("id", studentId)
    .single();

  if (!student) return NextResponse.json({ error: "Leerling niet gevonden." }, { status: 404 });

  const owned: string[] = student.owned_backgrounds ?? [];
  const alreadyOwned = owned.includes(background);

  if (!alreadyOwned) {
    if (student.coins < price) {
      return NextResponse.json({ error: "Niet genoeg munten." }, { status: 402 });
    }
    const newCoins = student.coins - price;
    const newOwned = [...owned, background];
    await supabaseAdmin
      .from("students")
      .update({ coins: newCoins, background, owned_backgrounds: newOwned })
      .eq("id", studentId);
    return NextResponse.json({ coins: newCoins, background, ownedBackgrounds: newOwned });
  }

  // Already owned — just switch active background, no charge
  await supabaseAdmin
    .from("students")
    .update({ background })
    .eq("id", studentId);

  return NextResponse.json({ coins: student.coins, background, ownedBackgrounds: owned });
}
