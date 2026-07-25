import Link from "next/link";
import Image from "next/image";

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

          {/* Top: avatars + tagline */}
          <div className="flex flex-col items-center gap-2 px-8 pt-10 text-center sm:px-14">
            <p className="rounded-full bg-coral/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-coral">
              Gratis · Geen app · Direct starten
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              Rekenen dat kinderen{" "}
              <span className="text-coral">wíllen</span> doen.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60">
              Tien minuten per dag, op eigen niveau. Leerlingen verdienen munten, bouwen een reeks op en klimmen door 140 levels — plus, min, keer en delen.
            </p>
          </div>

          {/* Avatars facing each other */}
          <div className="relative mt-6 flex items-end justify-center gap-0">
            {/* Leerkracht — gespiegeld zodat ze naar rechts kijkt */}
            <div className="relative" style={{ transform: "scaleX(-1)" }}>
              <Image
                src="/avatars/leerkracht-vrouw-pen.png"
                alt="Leerkracht"
                width={160}
                height={160}
                className="object-contain drop-shadow-xl"
              />
            </div>

            {/* Midden tekst */}
            <div className="relative z-10 -mx-4 mb-8 flex flex-col items-center gap-3">
              <div className="rounded-2xl bg-white/10 px-5 py-3 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold text-white/60">Al in gebruik bij</p>
                <p className="text-lg font-extrabold text-white">groep 4 t/m 8</p>
              </div>
              <Link
                href="/leerkracht?tab=register"
                className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
              >
                Begin nu gratis →
              </Link>
            </div>

            {/* Leerling */}
            <Image
              src="/avatars/leerling-jongen-1.png"
              alt="Leerling"
              width={130}
              height={130}
              className="object-contain drop-shadow-xl"
            />
          </div>

        </div>
      </section>

      {/* Voordelen */}
      <section className="mx-auto max-w-5xl px-6 pb-8 sm:px-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "⏱", title: "10 minuten per dag", text: "Kort genoeg om vol te houden, lang genoeg om echt te oefenen." },
            { icon: "🪙", title: "Munten & levels", text: "Leerlingen worden gemotiveerd door beloningen en zichtbare voortgang." },
            { icon: "📊", title: "Inzicht voor de leerkracht", text: "Zie wie er oefent, welke sommen moeilijk zijn en wie een steuntje nodig heeft." },
          ].map(({ icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-2xl">{icon}</p>
              <p className="mt-2 font-bold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-dark/50">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rolkaarten */}
      <section className="mx-auto max-w-5xl px-6 pb-20 sm:px-10">
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

      <footer className="pb-8 text-center text-xs text-dark/30">
        Rondje Rekenen — dagelijks rekenen voor groep 4 t/m 8
      </footer>
    </div>
  );
}
