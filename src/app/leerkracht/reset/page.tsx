import Link from "next/link";

export default function ResetPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/leerkracht" className="mb-6 text-sm text-dark/50 hover:text-coral">
        ← Terug naar inloggen
      </Link>
      <h1 className="mb-4 text-3xl font-extrabold">Wachtwoord vergeten?</h1>
      <p className="text-dark/70 leading-relaxed">
        Neem contact op met de beheerder van Rondje Rekenen om je wachtwoord te laten resetten.
      </p>
    </main>
  );
}
