import Link from "next/link";
import Image from "next/image";
import { LevelOverzichtKnop } from "@/components/LevelOverzichtModal";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">

      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
        <span className="text-2xl font-extrabold text-dark">Rondje Rekenen</span>
        <div className="flex items-center gap-2">
          <Link href="/leerkracht?tab=login" className="rounded-full bg-coral px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90">
            Leerkracht
          </Link>
          <Link href="/leerling?tab=login" className="rounded-full bg-purple px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90">
            Leerling
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-4 sm:px-10">
        <div className="rounded-3xl bg-dark overflow-hidden">

          <div className="flex flex-col items-center gap-2 px-8 py-12 text-center sm:px-14">
            <p className="rounded-full bg-coral/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-coral">
              Gratis · Geen app · Direct starten
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              Elke dag een rondje rekenen.<br />
              <span className="text-coral">Klaar in 10 minuten.</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60">
              Dé tool voor het automatiseren van rekenen. Leerlingen oefenen dagelijks op eigen niveau en verdienen munten, bouwen een reeks op en klimmen door 600 levels.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/leerkracht?tab=register"
                className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
              >
                Begin nu gratis
              </Link>
              <Link
                href="/leerling?tab=login"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Ik ben leerling
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Level overzicht knop */}
      <section className="mx-auto max-w-5xl px-6 pb-8 sm:px-10 text-center">
        <LevelOverzichtKnop />
      </section>

      {/* Voordelen */}
      <section className="mx-auto max-w-5xl px-6 pb-8 sm:px-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: "10 minuten per dag", text: "Kort genoeg om vol te houden, lang genoeg om echt te oefenen." },
            { title: "Munten & levels", text: "Leerlingen worden gemotiveerd door beloningen en zichtbare voortgang." },
            { title: "Inzicht voor de leerkracht", text: "Zie wie er oefent, welke sommen moeilijk zijn en en wie extra hulp nodig heeft." },
          ].map(({ title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="font-bold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-dark/50">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rolkaarten */}
      <section className="mx-auto max-w-5xl px-6 pb-8 sm:px-10">
        <div className="grid gap-5 sm:grid-cols-2">

          {/* Leerkracht */}
          <div className="flex flex-col gap-5 rounded-3xl bg-coral p-8 text-white shadow-sm">
            <div className="flex gap-3">
              <Image src="/avatars/leerkracht-vrouw-pen.png" alt="Leerkracht" width={72} height={72} className="h-18 w-18 rounded-2xl object-contain bg-white/20 p-1" />
              <Image src="/avatars/leerkracht-man-boek.webp" alt="Leerkracht" width={72} height={72} className="h-18 w-18 rounded-2xl object-contain bg-white/20 p-1" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold">Ik ben leerkracht</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Maak een klas aan, deel je klascode en volg de voortgang van al je leerlingen. Zie welke sommen moeilijk zijn en wie er dagelijks oefent.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2 sm:flex-row">
              <Link href="/leerkracht?tab=login" className="flex-1 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-coral transition hover:bg-white/90">
                Inloggen
              </Link>
              <Link href="/leerkracht?tab=register" className="flex-1 rounded-full border-2 border-white px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                Registreren
              </Link>
            </div>
          </div>

          {/* Leerling */}
          <div className="flex flex-col gap-5 rounded-3xl bg-purple p-8 text-white shadow-sm">
            <div className="flex gap-3">
              <Image src="/avatars/leerling-jongen-1.png" alt="Leerling" width={72} height={72} className="h-18 w-18 rounded-2xl object-contain bg-white/20 p-1" />
              <Image src="/avatars/leerling-meisje-1.png" alt="Leerling" width={72} height={72} className="h-18 w-18 rounded-2xl object-contain bg-white/20 p-1" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold">Ik ben leerling</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Doe mee met de klascode van je leerkracht. Oefen elke dag je rondje, verdien munten en klim door de levels.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2 sm:flex-row">
              <Link href="/leerling?tab=login" className="flex-1 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-purple transition hover:bg-white/90">
                Inloggen
              </Link>
              <Link href="/leerling?tab=register" className="flex-1 rounded-full border-2 border-white px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                Registreren
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Bijdrage */}
      <section className="mx-auto max-w-5xl px-6 pb-8 sm:px-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            {/* Tekst links */}
            <div className="flex-1">
              <h2 className="text-xl font-extrabold">Rondje Rekenen is gratis</h2>
              <p className="mt-3 text-sm leading-relaxed text-dark/60">
                Rondje Rekenen is en blijft volledig gratis. Hosting en doorontwikkeling brengen wel kosten met zich mee. Wil je een steentje bijdragen? Doe dan een vrijwillige bijdrage via de QR.
              </p>
              <p className="mt-3 text-xs text-dark/40">Scan de QR-code om een vrijwillige bijdrage te doen via Tikkie.</p>
            </div>
            {/* QR rechts */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {/* Vervang onderstaande div door een <Image> met de echte Tikkie QR */}
              <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-cream text-center text-xs text-dark/30">
                QR code<br />volgt
              </div>
              <span className="text-xs text-dark/30">Tikkie</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="pb-8 text-center text-xs text-dark/30">
        Rondje Rekenen, dagelijks rekenen voor groep 4 t/m 8
      </footer>
    </div>
  );
}
