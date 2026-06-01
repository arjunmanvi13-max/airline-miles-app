import { cardEcosystems, transferPartners } from "@/app/data";

type PointBalances = Record<string, string>;

const formatPointInput = (value: string) => {
  const digitsOnly = value.replace(/[^\d]/g, "");

  if (!digitsOnly) return "";

  return Number(digitsOnly).toLocaleString();
};

const ecosystemDescriptions: Record<string, string> = {
  Amex: "Premium transfer ecosystem with strong airline partners for international redemptions.",
  Chase: "Flexible travel rewards with useful airline and hotel transfer paths.",
  "Capital One": "Broad partner access with strong international airline coverage.",
  Bilt: "Rent-powered rewards with unusually strong travel transfer value.",
  Citi: "Useful airline partner network for advanced transfer strategies.",
  "Wells Fargo": "Growing transfer ecosystem with practical airline partners.",
};

export default function WalletScreen({
  selectedCards,
  pointBalances,
  expandedCardDatabases,
  onToggleCard,
  onToggleCardDatabase,
  onUpdatePointBalance,
  onSaveProfile,
  onBackToSearch,
}: {
  selectedCards: string[];
  pointBalances: PointBalances;
  expandedCardDatabases: string[];
  onToggleCard: (card: string) => void;
  onToggleCardDatabase: (cardName: string) => void;
  onUpdatePointBalance: (card: string, value: string) => void;
  onSaveProfile: () => void;
  onBackToSearch: () => void;
}) {
  return (
    <div className="overflow-hidden border border-white/10 bg-[#090B12]/95 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] md:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.38em] text-purple-300">
            Points wallet
          </p>

          <h2 className="mt-3 text-4xl font-serif font-normal tracking-tight text-white md:text-5xl">
            Build your travel wallet.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Select the transferable points ecosystems you use. Vantara will use
            this to prioritize booking strategies, transfer paths, and options
            you can actually book.
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
          {selectedCards.length} ecosystem
          {selectedCards.length === 1 ? "" : "s"} selected
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {cardEcosystems.map((ecosystem) => {
          const isSelected = selectedCards.includes(ecosystem.name);
          const isExpanded = expandedCardDatabases.includes(ecosystem.name);
          const balance = pointBalances[ecosystem.name] || "";
          const transferCount = transferPartners.filter(
            (partner) => partner.card === ecosystem.name
          ).length;

          return (
            <div
              key={ecosystem.name}
              className={`group border p-5 transition-all duration-300 ${
                isSelected
                  ? "border-purple-300/50 bg-purple-500/10 shadow-[0_0_38px_rgba(168,85,247,0.14)]"
                  : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleCard(ecosystem.name)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {"logoPath" in ecosystem && ecosystem.logoPath && (
                      <div className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white">
                        <img
                          src={ecosystem.logoPath}
                          alt=""
                          className="h-9 w-9 object-contain"
                        />
                      </div>
                    )}

                    <div>
                      <p className="text-xl font-semibold tracking-tight text-white">
                        {ecosystem.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {ecosystem.pointsName}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`border px-3 py-1 text-xs font-semibold ${
                      isSelected
                        ? "border-purple-300/50 bg-purple-500/20 text-purple-100"
                        : "border-white/10 bg-white/[0.06] text-slate-300"
                    }`}
                  >
                    {isSelected ? "Selected" : "Add"}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-300">
                  {ecosystemDescriptions[ecosystem.name] ||
                    "Transferable points ecosystem for award travel bookings."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ecosystem.cards.slice(0, 3).map((card) => (
                    <span
                      key={card}
                      className="border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300"
                    >
                      {card}
                    </span>
                  ))}

                  {ecosystem.cards.length > 3 && (
                    <span className="border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-500">
                      +{ecosystem.cards.length - 3} more
                    </span>
                  )}
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ${
                  isSelected
                    ? "mt-5 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border border-white/10 bg-black/25 p-4">
                    <label className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Points balance
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={balance}
                      onChange={(e) =>
                        onUpdatePointBalance(
                          ecosystem.name,
                          formatPointInput(e.target.value)
                        )
                      }
                      placeholder={`Enter ${ecosystem.name} balance`}
                      style={{
  backgroundColor: "#111111",
  color: "white",
}}
className="mt-3 w-full border border-white/10 p-4 text-lg font-semibold placeholder:text-slate-500 outline-none focus:border-purple-300"
                    />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-xs text-slate-500">
                          Transfer partners
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {transferCount}
                        </p>
                      </div>

                      <div className="border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-xs text-slate-500">
                          Wallet status
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {balance ? "Balance added" : "No balance yet"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleCardDatabase(ecosystem.name)}
                      className="mt-4 w-full border border-white/10 bg-white/[0.05] p-3 font-semibold text-slate-200 hover:bg-white/[0.09]"
                    >
                      {isExpanded
                        ? "Hide transfer database"
                        : "View transfer database"}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 max-h-72 overflow-y-auto border border-white/10 bg-slate-950/70 p-3">
                        <p className="mb-3 font-semibold text-white">
                          {ecosystem.name} transfer partners
                        </p>

                        <div className="space-y-2">
                          {transferPartners
                            .filter(
                              (partner) => partner.card === ecosystem.name
                            )
                            .sort((a, b) =>
                              a.program.localeCompare(b.program)
                            )
                            .map((partner) => (
                              <div
                                key={`${partner.card}-${partner.program}-${partner.airlineMatch}`}
                                className="border border-white/10 bg-white/[0.035] p-3"
                              >
                                <p className="font-semibold text-white">
                                  {partner.program}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Airline match: {partner.airlineMatch}
                                </p>

                                <p className="mt-2 text-sm text-slate-300">
                                  1,000 {partner.card} points ={" "}
                                  {(1000 * partner.ratio).toLocaleString()}{" "}
                                  partner points
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          onClick={onSaveProfile}
          className="w-full border border-purple-300/50 bg-purple-500/15 p-4 font-semibold text-purple-100 transition hover:bg-purple-500/25"
        >
          Save Wallet
        </button>

        <button
          onClick={onBackToSearch}
          className="w-full border border-white/10 bg-white/[0.05] p-4 font-semibold text-white transition hover:bg-white/[0.09]"
        >
          Continue to Search
        </button>
      </div>
    </div>
  );
}