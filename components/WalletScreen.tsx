import { cardEcosystems, transferPartners } from "@/app/data";


type PointBalances = Record<string, string>;

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
    <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900">My Wallet</h2>

      <p className="text-sm text-slate-500 mt-1">
        Select your transferable points ecosystems and enter optional balances.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
        {cardEcosystems.map((ecosystem) => (
          <div
            key={ecosystem.name}
            className="border border-slate-300 rounded-xl p-4 text-sm"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCards.includes(ecosystem.name)}
                onChange={() => onToggleCard(ecosystem.name)}
              />

              <div className="flex items-center gap-2">
  {"logoPath" in ecosystem && ecosystem.logoPath && (
    <img
  src={ecosystem.logoPath}
  alt=""
  className="h-7 w-7 object-contain shrink-0"
/>
  )}

  <span className="font-semibold text-slate-900">
    {ecosystem.name}
  </span>
</div>

              <span className="text-xs text-green-700 font-semibold">
                transfer data
              </span>
            </label>

            <p className="text-xs text-slate-500 mt-1">
              {ecosystem.pointsName}
            </p>

            <p className="text-xs text-slate-600 mt-2">
              Cards: {ecosystem.cards.join(", ")}
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={pointBalances[ecosystem.name] || ""}
              onChange={(e) =>
                onUpdatePointBalance(ecosystem.name, e.target.value)
              }
              placeholder={`Optional ${ecosystem.name} balance`}
              className="border border-slate-300 p-3 rounded-xl w-full mt-3"
            />

            <button
              type="button"
              onClick={() => onToggleCardDatabase(ecosystem.name)}
              className="mt-3 w-full border border-slate-300 rounded-xl p-3 font-semibold hover:bg-slate-50"
            >
              {expandedCardDatabases.includes(ecosystem.name)
                ? "Hide transfer database"
                : "View transfer database"}
            </button>

            {expandedCardDatabases.includes(ecosystem.name) && (
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="font-semibold text-slate-900 mb-2">
                  {ecosystem.name} transfer partners
                </p>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {transferPartners
                    .filter((partner) => partner.card === ecosystem.name)
                    .sort((a, b) => a.program.localeCompare(b.program))
                    .map((partner) => (
                      <div
                        key={`${partner.card}-${partner.program}-${partner.airlineMatch}`}
                        className="bg-white border border-slate-200 rounded-lg p-3"
                      >
                        <p className="font-semibold text-slate-900">
                          {partner.program}
                        </p>

                        <p className="text-xs text-slate-500">
                          Airline match: {partner.airlineMatch}
                        </p>

                        <p className="text-sm text-slate-700 mt-1">
                          Ratio: 1,000 {partner.card} points ={" "}
                          {(1000 * partner.ratio).toLocaleString()} partner
                          points
                        </p>

                        <p className="text-xs text-green-700 font-semibold mt-1">
                          {partner.dataStatus} transfer data
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        <button
          onClick={onSaveProfile}
          className="w-full bg-slate-900 text-white font-semibold p-4 rounded-xl"
        >
          Save Wallet
        </button>

        <button
          onClick={onBackToSearch}
          className="w-full bg-white border border-slate-300 font-semibold p-4 rounded-xl"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
}