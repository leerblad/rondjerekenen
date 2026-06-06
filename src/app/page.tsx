import Link from "next/link";

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-8 w-8 rounded-full bg-coral" />
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow text-2xl font-extrabold text-dark">
        +
      </span>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-purple text-2xl font-extrabold text-white">
        =
      </span>
      <span className="h-8 w-8 rounded-full bg-green" />
    </div>
  );
}

function RoleCard({
  title,
  emoji,
  description,
  base,
}: {
  title: string;
  emoji: string;
  description: string;
  base: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
      <div className="text-5xl">{emoji}</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm text-dark/60">{description}</p>
      <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
        <Link
          href={`${base}?tab=login`}
          className="flex-1 rounded-full bg-coral px-5 py-3 text-center font-semibold text-white transition hover:opacity-90"
        >
          Inloggen
        </Link>
        <Link
          href={`${base}?tab=register`}
          className="flex-1 rounded-full border-2 border-coral px-5 py-3 text-center font-semibold text-coral transition hover:bg-coral/5"
        >
          Registreren
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 py-12">
      <header className="flex w-full flex-col items-center gap-6 rounded-3xl bg-dark px-8 py-14 text-center text-white">
        <LogoMark />
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          RONDJE REKENEN
        </h1>
        <p className="max-w-xl text-base text-white/70 sm:text-lg">
          Elke dag tien minuten rekenen voor groep 4 tot en met 8. Oefen plus,
          min, keer en deel, verdien munten en pimp je eigen avatar. Leerkrachten
          volgen makkelijk de voortgang van de hele klas.
        </p>
      </header>

      <section className="mt-10 grid w-full gap-6 sm:grid-cols-2">
        <RoleCard
          title="Ik ben leerkracht"
          emoji="🧑‍🏫"
          description="Maak een klas aan, deel je klascode en volg de voortgang van je leerlingen."
          base="/leerkracht"
        />
        <RoleCard
          title="Ik ben leerling"
          emoji="🧒"
          description="Doe mee met je klascode, oefen elke dag en verdien munten voor je avatar."
          base="/leerling"
        />
      </section>

      <footer className="mt-12 text-xs text-dark/40">
        Rondje Rekenen — dagelijks rekenen oefenen
      </footer>
    </main>
  );
}
