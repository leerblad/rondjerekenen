export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-dark">
      <a href="/" className="text-sm text-dark/50 hover:text-coral">← Home</a>

      <h1 className="mt-6 text-3xl font-extrabold">Privacybeleid</h1>
      <p className="mt-2 text-sm text-dark/40">Laatst bijgewerkt: augustus 2025</p>

      <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-dark/70">

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">1. Wie zijn wij?</h2>
          <p>
            Rondje Rekenen is een gratis online oefentool voor rekenen, bedoeld voor leerlingen in groep 4 t/m 8 van het basisonderwijs. De tool wordt beheerd door een individuele ontwikkelaar en is niet commercieel.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">2. Welke gegevens verzamelen we?</h2>
          <p className="mb-2">We verzamelen zo min mogelijk gegevens:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Leerkrachten:</strong> naam, e-mailadres en een zelfgekozen wachtwoord.</li>
            <li><strong>Leerlingen:</strong> een zelfgekozen bijnaam en een wachtwoord. Geen echte naam, geen geboortedatum, geen e-mailadres.</li>
            <li><strong>Oefensessies:</strong> per sessie slaan we op hoeveel sommen er goed en fout waren, op welke datum en op welk level. Dit is nodig om voortgang bij te houden.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">3. Waarvoor gebruiken we de gegevens?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Om leerlingen in te laten loggen en hun voortgang bij te houden.</li>
            <li>Om leerkrachten inzicht te geven in de voortgang van hun klas.</li>
            <li>Om de tool te verbeteren op basis van algemene gebruikspatronen.</li>
          </ul>
          <p className="mt-2">We gebruiken de gegevens <strong>nooit</strong> voor advertenties, profilering of commerciële doeleinden.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">4. E-mailadressen van leerkrachten</h2>
          <p>
            Het e-mailadres van een leerkracht wordt uitsluitend gebruikt voor het herstellen van een vergeten wachtwoord en voor directe communicatie vanuit Rondje Rekenen. Het e-mailadres wordt <strong>nooit gedeeld met derden</strong>, niet openbaar gemaakt en niet gebruikt voor nieuwsbrieven of reclame.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">5. Gegevens van leerlingen</h2>
          <p>
            Leerlingen registreren zich alleen met een bijnaam. Er is geen koppeling met een echte naam of persoonlijk gegeven. Leerkrachten zien de voortgang van hun eigen leerlingen. Leerlingen van andere klassen zijn niet zichtbaar.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">6. Waar worden gegevens opgeslagen?</h2>
          <p>
            Alle gegevens worden opgeslagen in een beveiligde database via Supabase, een Europese clouddienst. Gegevens worden niet buiten Europa verwerkt.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">7. Hoe lang bewaren we gegevens?</h2>
          <p>
            Gegevens worden bewaard zolang een leerkracht of leerling een actief account heeft. Op verzoek verwijderen we een account en alle bijbehorende gegevens. Stuur hiervoor een bericht via het contactformulier in de leerkrachtportal.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">8. Cookies</h2>
          <p>
            Rondje Rekenen gebruikt geen tracking-cookies en geen advertentiecookies. We slaan enkel een inlogsessie op in de browser zodat je ingelogd blijft. Dit is strikt functioneel.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">9. Rechten</h2>
          <p>
            Je hebt het recht om je gegevens in te zien, te corrigeren of te laten verwijderen. Neem hiervoor contact op via het contactformulier in de leerkrachtportal of stuur een e-mail naar de beheerder.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-dark">10. Vragen?</h2>
          <p>
            Heb je vragen over dit privacybeleid? Stuur een bericht via het contactformulier in de leerkrachtportal. We reageren zo snel mogelijk.
          </p>
        </section>

      </div>
    </main>
  );
}
