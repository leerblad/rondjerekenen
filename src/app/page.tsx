import Link from "next/link";

function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg"
      ? { grid: "w-32 h-32", cell: "text-4xl rounded-2xl", gap: "gap-2" }
      : size === "sm"
        ? { grid: "w-14 h-14", cell: "text-lg rounded-xl", gap: "gap-1" }
        : { grid: "w-20 h-20", cell: "text-2xl rounded-xl", gap: "gap-1.5" };

  return (
    <div className={`grid grid-cols-2 ${dims.grid} ${dims.gap}`}>
      <div
        className={`flex items-center justify-center bg-coral text-white font-extrabold ${dims.cell}`}
      >
        ○
      </div>
      <div
        className={`flex items-center justify-center bg-yellow text-dark font-extrabold ${dims.cell}`}
      >
        +
      </div>
      <div
        className={`flex items-center justify-center bg-purple text-white font-extrabold ${dims.cell}`}
      >
        =
      </div>
      <div
        className={`flex items-center justify-center bg-green text-white font-extrabold ${dims.cell}`}
      >
        ●
      </div>
    </div>
  );
}

function RoleCard({
  title,
  icon,
  description,
  base,
  accentColor,
}: {
  title: string;
  icon: string;
  description: string;
  base: string;
  accentColor: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${accentColor}`}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-dark">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-dark/60">
          {description}
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
        <Link
          href={`${base}?tab=login`}
          className="flex-1 rounded-full bg-coral px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          Inloggen
        </Link>
        <Link
          href={`${base}?tab=register`}
          className="flex-1 rounded-full border-2 border-coral px-5 py-3 text-center text-sm font-semibold text-coral transition hover:bg-coral/5"
        >
          Registreren
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center px-6 py-12">
      {/* Hero */}
      <header className="flex w-full items-center justify-between gap-8 rounded-3xl bg-dark px-10 py-14">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Dagelijks rekenen
          </p>
          <h1 className="text-5xl font-extrabold uppercase leading-none tracking-wide text-coral sm:text-6xl">
            Rondje<br />Rekenen
          </h1>
          <p className="max-w-sm text-base font-light text-white/60">
            Reken je slimmer, rondje voor rondje.
          </p>
        </div>
        <div className="hidden sm:block">
          <LogoMark size="lg" />
        </div>
      </header>

      {/* Uitleg */}
      <p className="mt-10 max-w-xl text-center text-sm leading-relaxed text-dark/60">
        Elke dag tien minuten rekenen voor groep 4 t/m 8. Oefen optellen,
        aftrekken, vermenigvuldigen en delen — verdien munten en pas je avatar
        aan. Leerkrachten volgen de voortgang van de hele klas.
      </p>

      {/* Rolkaarten */}
      <section className="mt-8 grid w-full gap-5 sm:grid-cols-2">
        <RoleCard
          title="Ik ben leerkracht"
          icon="🧑‍🏫"
          description="Maak een klas aan, deel je klascode en volg de voortgang van je leerlingen per operatie."
          base="/leerkracht"
          accentColor="bg-[#FDF1EE]"
        />
        <RoleCard
          title="Ik ben leerling"
          icon="🧒"
          description="Doe mee met je klascode, oefen elke dag je ronde en verdien munten voor je avatar."
          base="/leerling"
          accentColor="bg-[#F0EEF9]"
        />
      </section>

      <footer className="mt-12 text-xs text-dark/30">
        Rondje Rekenen — groep 4 t/m 8
      </footer>
    </main>
  );
}
