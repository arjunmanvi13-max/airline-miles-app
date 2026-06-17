export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#05060A] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.35em] text-purple-300">
          Vantara
        </p>

        <h1 className="mt-4 text-4xl font-serif font-normal">
          Privacy Policy
        </h1>

        <p className="mt-4 text-slate-400">
          Last updated: June 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-white">
              What Vantara does
            </h2>
            <p className="mt-2">
              Vantara helps users analyze award flight screenshots before
              transferring credit card points. The extension extracts flight
              details, estimates cash fare comparisons, and provides a
              redemption-value recommendation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Information processed
            </h2>
            <p className="mt-2">
              When you upload a screenshot, Vantara sends that screenshot to
              Vantara&apos;s API so flight details can be extracted. The
              screenshot may be processed by OpenAI for image and text analysis.
              Extracted flight details such as route, date, airline, cabin,
              miles, taxes, and fare information may be used to generate the
              analysis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Cash fare lookup
            </h2>
            <p className="mt-2">
              To compare an award redemption against a cash fare, Vantara may
              send extracted flight details such as origin, destination,
              departure date, cabin, passenger count, airline, and flight number
              to Duffel&apos;s flight offer API.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Wallet information
            </h2>
            <p className="mt-2">
              Wallet information you enter in the Chrome extension, such as card
              ecosystem and points balance, is stored locally in Chrome storage
              on your device. Vantara uses this information to estimate whether
              your entered wallet can cover a booking path.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Data selling
            </h2>
            <p className="mt-2">
              Vantara does not sell user data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Contact
            </h2>
            <p className="mt-2">
              For privacy questions, contact the Vantara team through the
              website where this policy is published.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}