import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { Illustration } from "@/components/Illustration";

function RoleCard({
  title,
  icon,
  description,
  base,
  accentColor,
}: {
  title: string;
  icon: ReactNode;
  description: string;
  base: string;
  accentColor: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accentColor}`}
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
      <header className="flex w-full flex-col items-center gap-6 rounded-3xl bg-cream px-10 py-12 border border-black/5 shadow-sm">
        <Image
          src="/logo.jpg"
          alt="Rondje Rekenen"
          width={375}
          height={225}
          className="w-64 sm:w-80"
          priority
        />
        <p className="max-w-sm text-center text-base text-dark/60">
          Reken je slimmer, rondje voor rondje.
        </p>
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
          icon={<Illustration name="teacher" size={56} />}
          description="Maak een klas aan, deel je klascode en volg de voortgang van je leerlingen per operatie."
          base="/leerkracht"
          accentColor="bg-[#FDF1EE]"
        />
        <RoleCard
          title="Ik ben leerling"
          icon={<Illustration name="student" size={56} />}
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
