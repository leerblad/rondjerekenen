import Link from "next/link";
import Image from "next/image";
import { Illustration } from "@/components/Illustration";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">

      {/* Nav */}
      <nav className="flex items-center px-6 py-4 sm:px-10">
        <Image
          src="/Rekenenlogo.jpg"
          alt="Rondje Rekenen"
          width={120}
          height={48}
          className="h-12 w-auto object-contain"
          priority
        />
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:px-10">
        <div className="rounded-3xl bg-dark px-8 py-14 sm:px-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Voor groep 4 t/m 8
          </p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight text-white sm:text-6xl">
            Rekenen oefenen{" "}
            <span className="text-coral">zonder gedoe.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Elke dag tien minuten sommen maken — plus, min, keer en deel.
            Leerlingen verdienen munten en passen hun avatar aan.
            Leerkrachten zien live wie er oefent en welke sommen moeilijk zijn.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white">⏱ Tijdgestuurd per groep</span>
            <span className="rounded-full bg-yellow px-4 py-2 text-sm font-semibold text-dark">🪙 Munten verdienen</span>
            <span className="rounded-full bg-purple px-4 py-2 text-sm font-semibold text-white">📊 Voortgang per leerling</span>
            <span className="rounded-full bg-green px-4 py-2 text-sm font-semibold text-white">🔓 Operaties ontgrendelen</span>
          </div>
        </div>
      </section>

      {/* Rolkaarten */}
      <section className="mx-auto max-w-5xl px-6 pb-20 sm:px-10">
        <h2 className="mb-6 text-center text-2xl font-bold text-dark">
          Voor wie ben jij?
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">

          {/* Leerkracht */}
          <div className="flex flex-col gap-5 rounded-3xl bg-coral p-8 text-white shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Illustration name="teacher" size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold">Ik ben leerkracht</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Maak een klas aan, deel je klascode en volg de voortgang van al je leerlingen. Zie welke sommen moeilijk zijn en pas het groepsniveau per leerling aan.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2 sm:flex-row">
              <Link
                href="/leerkracht?tab=login"
                className="flex-1 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-coral transition hover:bg-white/90"
              >
                Inloggen
              </Link>
              <Link
                href="/leerkracht?tab=register"
                className="flex-1 rounded-full border-2 border-white px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Registreren
              </Link>
            </div>
          </div>

          {/* Leerling */}
          <div className="flex flex-col gap-5 rounded-3xl bg-purple p-8 text-white shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Illustration name="student" size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold">Ik ben leerling</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Doe mee met de klascode van je leerkracht. Oefen elke dag je rondje, verdien munten en pas je avatar aan in de winkel.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2 sm:flex-row">
              <Link
                href="/leerling?tab=login"
                className="flex-1 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-purple transition hover:bg-white/90"
              >
                Inloggen
              </Link>
              <Link
                href="/leerling?tab=register"
                className="flex-1 rounded-full border-2 border-white px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Registreren
              </Link>
            </div>
          </div>

        </div>
      </section>

      <footer className="pb-8 text-center text-xs text-dark/30">
        Rondje Rekenen — dagelijks rekenen voor groep 4 t/m 8
      </footer>
    </div>
  );
}
