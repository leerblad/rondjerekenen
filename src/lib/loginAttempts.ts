import { supabaseAdmin } from "@/lib/supabase";

const MAX_ATTEMPTS = 5;
const BLOCK_MINUTES = 120; // 2 uur

export type AttemptResult =
  | { allowed: true }
  | { allowed: false; minutesLeft: number };

/**
 * Check of een identifier (naam/e-mail) geblokkeerd is.
 * Geeft { allowed: true } als inloggen mag, anders { allowed: false, minutesLeft }.
 */
export async function checkLoginAllowed(identifier: string): Promise<AttemptResult> {
  const { data } = await supabaseAdmin
    .from("login_attempts")
    .select("attempts, blocked_until")
    .eq("identifier", identifier)
    .maybeSingle();

  if (!data) return { allowed: true };

  if (data.blocked_until) {
    const blockedUntil = new Date(data.blocked_until);
    if (blockedUntil > new Date()) {
      const minutesLeft = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
      return { allowed: false, minutesLeft };
    }
    // Blok verlopen — reset
    await supabaseAdmin
      .from("login_attempts")
      .update({ attempts: 0, blocked_until: null, updated_at: new Date().toISOString() })
      .eq("identifier", identifier);
  }

  return { allowed: true };
}

/**
 * Registreer een mislukte inlogpoging.
 * Geeft true terug als de account nu geblokkeerd is (net bereikt).
 */
export async function recordFailedAttempt(identifier: string, context: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("login_attempts")
    .select("id, attempts")
    .eq("identifier", identifier)
    .maybeSingle();

  const newAttempts = (data?.attempts ?? 0) + 1;
  const justBlocked = newAttempts >= MAX_ATTEMPTS;
  const blockedUntil = justBlocked
    ? new Date(Date.now() + BLOCK_MINUTES * 60 * 1000).toISOString()
    : null;

  if (data) {
    await supabaseAdmin
      .from("login_attempts")
      .update({ attempts: newAttempts, blocked_until: blockedUntil, updated_at: new Date().toISOString() })
      .eq("identifier", identifier);
  } else {
    await supabaseAdmin
      .from("login_attempts")
      .insert({ identifier, attempts: newAttempts, blocked_until: blockedUntil, updated_at: new Date().toISOString() });
  }

  if (justBlocked) {
    // Stuur melding naar admin
    await supabaseAdmin.from("contact_messages").insert({
      teacher_id: null,
      teacher_name: "⚠ Systeem",
      subject: "Inlogpoging geblokkeerd",
      message: `${MAX_ATTEMPTS} mislukte inlogpogingen voor "${identifier}" (${context}).\n\nAccount geblokkeerd voor ${BLOCK_MINUTES} minuten.`,
      sent_at: new Date().toISOString(),
      read: false,
    });
  }

  return justBlocked;
}

/**
 * Reset pogingen na succesvolle inlog.
 */
export async function resetAttempts(identifier: string): Promise<void> {
  await supabaseAdmin
    .from("login_attempts")
    .delete()
    .eq("identifier", identifier);
}
