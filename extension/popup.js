const API_URL = "https://vantaratravel.net/api/extension-analyze";

const AIRLINE_OPTIONS = [
  "Alaska Airlines",
  "American Airlines",
  "Delta Air Lines",
  "United Airlines",
  "JetBlue",
  "Southwest Airlines",
  "Air Canada",
  "Air France",
  "KLM",
  "British Airways",
  "Iberia",
  "Aer Lingus",
  "Lufthansa",
  "SWISS",
  "Austrian Airlines",
  "Turkish Airlines",
  "Emirates",
  "Qatar Airways",
  "Etihad Airways",
  "Singapore Airlines",
  "Cathay Pacific",
  "ANA",
  "Japan Airlines",
  "Virgin Atlantic",
  "Qantas",
];

const PROGRAM_OPTIONS = [
  "Mileage Plan",
  "AAdvantage",
  "SkyMiles",
  "MileagePlus",
  "TrueBlue",
  "Rapid Rewards",
  "Aeroplan",
  "Flying Blue",
  "Executive Club Avios",
  "Iberia Plus",
  "AerClub Avios",
  "LifeMiles",
  "Skywards",
  "Privilege Club Avios",
  "Etihad Guest",
  "KrisFlyer",
  "Asia Miles",
  "ANA Mileage Club",
  "Virgin Atlantic Flying Club",
  "Qantas Frequent Flyer",
];

const AIRPORT_OPTIONS = [
  "ATL", "AUS", "BNA", "BOS", "BWI", "CLT", "DCA", "DEN", "DFW", "EWR",
  "FLL", "HNL", "IAD", "IAH", "JFK", "LAS", "LAX", "LGA", "MCO", "MIA",
  "MSP", "ORD", "PDX", "PHL", "PHX", "SAN", "SEA", "SFO", "SJC", "SLC",
  "TPA", "CDG", "LHR", "AMS", "FCO", "MAD", "BCN", "DOH", "DXB", "IST",
  "NRT", "HND", "SIN", "ICN", "HKG",
];

const cardInput = document.getElementById("card");
const balanceInput = document.getElementById("balance");
const saveWalletButton = document.getElementById("saveWallet");
const walletStatus = document.getElementById("walletStatus");
const walletPreview = document.getElementById("walletPreview");
const walletForm = document.getElementById("walletForm");
const walletList = document.getElementById("walletList");
const editWalletButton = document.getElementById("editWallet");

const screenshotInput = document.getElementById("screenshot");
const fileLabel = document.getElementById("fileLabel");
const analyzeButton = document.getElementById("analyze");
const statusText = document.getElementById("status");
const resultBox = document.getElementById("result");

const overridePanel = document.getElementById("overridePanel");
const overrideAirline = document.getElementById("overrideAirline");
const overrideProgram = document.getElementById("overrideProgram");
const overrideOrigin = document.getElementById("overrideOrigin");
const overrideDestination = document.getElementById("overrideDestination");
const overrideDate = document.getElementById("overrideDate");
const overrideMiles = document.getElementById("overrideMiles");
const overrideTaxes = document.getElementById("overrideTaxes");
const overrideCashPrice = document.getElementById("overrideCashPrice");
const recalculateOverrideButton = document.getElementById("recalculateOverride");

const airlineOptionsList = document.getElementById("airlineOptions");
const programOptionsList = document.getElementById("programOptions");
const airportOptionsList = document.getElementById("airportOptions");

if (airlineOptionsList && programOptionsList && airportOptionsList) {
  airlineOptionsList.innerHTML = AIRLINE_OPTIONS.map(
    (item) => `<option value="${item}"></option>`
  ).join("");

  programOptionsList.innerHTML = PROGRAM_OPTIONS.map(
    (item) => `<option value="${item}"></option>`
  ).join("");

  airportOptionsList.innerHTML = AIRPORT_OPTIONS.map(
    (item) => `<option value="${item}"></option>`
  ).join("");
}

let selectedFile = null;

let latestAnalysisData = null;
let latestSelectedCashOption = null;

let savedWalletCards = [];

chrome.storage.local.get(["wallet", "walletCards"], (data) => {
  if (Array.isArray(data.walletCards)) {
    savedWalletCards = data.walletCards;
  } else if (data.wallet?.card) {
    savedWalletCards = [data.wallet];
  } else {
    savedWalletCards = [];
  }

  renderWallet();
});

editWalletButton.addEventListener("click", () => {
  walletForm.classList.toggle("hidden");
  editWalletButton.textContent = walletForm.classList.contains("hidden")
    ? "Add"
    : "Hide";
});

saveWalletButton.addEventListener("click", () => {
  const walletCard = {
    card: cardInput.value,
    balance: balanceInput.value,
  };

  savedWalletCards = [
    ...savedWalletCards.filter((item) => item.card !== walletCard.card),
    walletCard,
  ];

  chrome.storage.local.set(
    {
      walletCards: savedWalletCards,
      wallet: walletCard,
    },
    () => {
      walletStatus.textContent = "Card added.";
      balanceInput.value = "";
      walletForm.classList.add("hidden");
      editWalletButton.textContent = "Add";
      renderWallet();
    }
  );
});

screenshotInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];

  if (selectedFile) {
    fileLabel.textContent = selectedFile.name;
    statusText.textContent = "";
  }
});

analyzeButton.addEventListener("click", async () => {
  if (!selectedFile) {
  statusText.textContent = "Choose a screenshot first.";
  return;
}

  analyzeButton.disabled = true;
  statusText.textContent = "Analyzing screenshot...";
  resultBox.classList.add("hidden");
  resultBox.innerHTML = "";

  try {
    const formData = new FormData();
    formData.append("screenshot", selectedFile);
    const primaryWalletCard = getPrimaryWalletCard();

formData.append("card", primaryWalletCard.card);
formData.append("balance", primaryWalletCard.balance);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

let data;
try {
  data = JSON.parse(responseText);
} catch {
  throw new Error(responseText.slice(0, 120));
}

    if (!response.ok) {
      throw new Error(data.error || "Analyzer request failed.");
    }

    if (data.cashLookup?.needsSelection && data.cashLookup?.cashOptions?.length) {
  resultBox.innerHTML = `
    <strong>Select matching cash flight</strong>
    <p>Duffel found multiple comparable cash fares. Pick the flight that matches your screenshot.</p>

    <div class="flightOptions">
      ${data.cashLookup.cashOptions
        .map(
          (option, index) => `
            <button class="flightOption" data-index="${index}">
              <strong>${option.airline} ${option.flightNumber}</strong>
              <span>${formatTime(option.departureTime)} → ${formatTime(option.arrivalTime)}</span>
              <span>${option.origin} → ${option.destination} · ${option.stops}</span>
              <span>${formatMoney(option.cashPrice)}</span>
            </button>
          `
        )
        .join("")}
    </div>
  `;

  resultBox.classList.remove("hidden");

  document.querySelectorAll(".flightOption").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedIndex = Number(button.getAttribute("data-index"));
      const selectedOption = data.cashLookup.cashOptions[selectedIndex];

      data.cashPrice = Number(selectedOption.cashPrice);
      data.centsPerPoint =
        data.cashPrice > 0 && data.miles > 0
          ? ((data.cashPrice - data.taxes) / data.miles) * 100
          : null;

      data.redemptionScore = getSimpleRedemptionScore({
        miles: data.miles,
        taxes: data.taxes,
        cashPrice: data.cashPrice,
        cabin: data.cabin,
      });

      data.redemptionLabel =
  data.redemptionScore !== null
    ? getSimpleRedemptionLabel(data.redemptionScore)
    : null;

data.bookingDecision = getSimpleBookingDecision({
  redemptionScore: data.redemptionScore,
  canBook: data.wallet?.canBook,
  centsPerPoint: data.centsPerPoint,
});

latestAnalysisData = data;
latestSelectedCashOption = selectedOption;
populateOverridePanel(data);
const needsOverride =
  !data.origin ||
  !data.destination ||
  !data.departureDate ||
  !data.miles ||
  !data.airline;

if (needsOverride) {
  overridePanel.classList.remove("hidden");
}
resultBox.innerHTML = buildResultHtml(data, selectedOption);
    });
  });
} else {
  resultBox.innerHTML = buildResultHtml(data, null);
}
    latestAnalysisData = data;
latestSelectedCashOption = null;
populateOverridePanel(data);
overridePanel.classList.remove("hidden");

    resultBox.classList.remove("hidden");
    statusText.textContent = "Done.";
  } catch (error) {
    console.error(error);
    statusText.textContent = error.message || "Something went wrong.";
  } finally {
    analyzeButton.disabled = false;
  }
});

function formatNumber(value) {
  const number = Number(String(value || "").replace(/,/g, ""));
  if (!number) return "";
  return number.toLocaleString();
}

function formatMoney(value) {
  const number = Number(String(value || "").replace(/[$,]/g, ""));
  if (!number) return "";
  return `$${number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}
function getMissingFields(data) {
  const missing = [];

  if (!data.airline) missing.push("Airline");
  if (!data.program) missing.push("Program");
  if (!data.origin) missing.push("Origin airport");
  if (!data.destination) missing.push("Destination airport");
  if (!data.departureDate) missing.push("Departure date");
  if (!data.miles) missing.push("Miles price");
  if (!data.taxes && data.taxes !== 0) missing.push("Taxes");
  if (!data.cashPrice) missing.push("Cash fare");

  return missing;
}

function buildMissingFieldsHtml(data) {
  const missing = getMissingFields(data);

  if (!missing.length) return "";

  return `
    <div class="missingBox">
      <p class="kicker">Needs review</p>
      <p class="missingTitle">Vantara needs a few more details.</p>
      <ul>
        ${missing.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <p class="missingHint">Use the review fields below to correct or add these details.</p>
    </div>
  `;
}

function buildResultHtml(data, selectedCashOption) {
  const decisionLabel = data.bookingDecision?.label || "Analysis complete";
  const isGood =
    decisionLabel === "Book with points" ||
    decisionLabel === "Compare before booking";
  const isNeutral = decisionLabel === "Compare before booking";

  return `
    ${buildMissingFieldsHtml(data)}

    <div class="recommendation ${isGood ? "good" : ""} ${
    isNeutral ? "neutral" : ""
  }">
      <p class="kicker">Vantara recommendation</p>
      <h3 class="resultTitle">${decisionLabel}</h3>
      <p class="resultExplanation">${
        data.bookingDecision?.explanation || ""
      }</p>
    </div>

    <div class="metricGrid">
      <div class="metric">
        <p class="metricLabel">Redemption score</p>
        <p class="metricValue">${
          data.redemptionScore !== null && data.redemptionScore !== undefined
            ? `${data.redemptionScore}/100`
            : "Unknown"
        }</p>
      </div>

      <div class="metric">
        <p class="metricLabel">Value</p>
        <p class="metricValue">${
          data.centsPerPoint
            ? `${Number(data.centsPerPoint).toFixed(2)}¢ / point`
            : "Unknown"
        }</p>
      </div>

      <div class="metric">
        <p class="metricLabel">Cash fare</p>
        <p class="metricValue">${
          data.cashPrice ? formatMoney(data.cashPrice) : "Live fare unavailable"
        }</p>
      </div>

      <div class="metric">
        <p class="metricLabel">Bookability</p>
<p class="metricValue">${
  data.wallet?.canBook ? "Valid" : "Not ready"
}</p>
      </div>
    </div>

    <div class="pathBox">
      <p class="kicker">Best transfer path</p>
      <p><strong>${
        data.transfer
          ? `${data.transfer.card} → ${data.transfer.program}`
          : "No matching transfer path"
      }</strong></p>
      <p>${
        data.wallet?.requiredPoints
          ? `${formatNumber(data.wallet.requiredPoints)} transferable points needed.`
          : "Points needed unknown."
      }</p>
      <p>${
        data.wallet?.balance !== null && data.wallet?.balance !== undefined
          ? data.wallet.canBook
           ? "Your wallet can cover this booking path."
            : `Your wallet is short by ${formatNumber(data.wallet.shortage)} points.`
          : "Balance not entered."
      }</p>
    </div>

    <div class="detailsBox">
      <p class="kicker">Trip details</p>
      <p><strong>Route:</strong> ${data.origin || "?"} → ${
    data.destination || "?"
  }</p>
      <p><strong>Date:</strong> ${formatDate(data.departureDate) || "Unknown"}</p>
      <p><strong>Airline:</strong> ${data.airline || "Unknown"}</p>
      <p><strong>Program:</strong> ${data.program || "Unknown"}</p>
      <p><strong>Miles:</strong> ${formatNumber(data.miles) || "Unknown"}</p>
      <p><strong>Taxes:</strong> ${formatMoney(data.taxes) || "Unknown"}</p>
      ${
        selectedCashOption
          ? `<p><strong>Matched flight:</strong> ${selectedCashOption.airline} ${selectedCashOption.flightNumber}</p>`
          : ""
      }
    </div>
  `;
}

function formatTime(value) {
  if (!value) return "Time unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSimpleRedemptionScore({ miles, taxes, cashPrice, cabin }) {
  if (!miles || !cashPrice) return null;

  const cpp = ((cashPrice - taxes) / miles) * 100;

  let score = 0;

  if (cpp >= 4.0) score = 95;
  else if (cpp >= 3.0) score = 88;
  else if (cpp >= 2.5) score = 82;
  else if (cpp >= 2.0) score = 74;
  else if (cpp >= 1.7) score = 68;
  else if (cpp >= 1.5) score = 60;
else if (cpp >= 1.2) score = 45;
else if (cpp >= 0.9) score = 32;
  else score = 20;

  if (cabin === "Premium Economy") score += 3;
  if (cabin === "Business") score += 8;
  if (cabin === "First") score += 12;

  if (taxes <= 25) score += 4;
  else if (taxes <= 100) score += 1;
  else if (taxes > 250) score -= 8;
  else if (taxes > 100) score -= 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getSimpleRedemptionLabel(score) {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 45) return "Average";
  if (score >= 30) return "Weak";
  return "Poor";
}

function getSimpleBookingDecision({ redemptionScore, canBook, centsPerPoint }) {
  if (redemptionScore === null && centsPerPoint === null) {
    return {
      label: "Needs more data",
      explanation: "Add a cash price to judge redemption value more accurately.",
    };
  }

  if (!canBook) {
    return {
      label: "Do not transfer yet",
      explanation:
        "This award may be useful, but your wallet balance does not currently cover the best transfer path.",
    };
  }

  if ((redemptionScore || 0) >= 80) {
    return {
      label: "Book with points",
      explanation:
        "This looks like a strong redemption and your wallet appears positioned to book it.",
    };
  }

  if (centsPerPoint !== null && centsPerPoint < 1.5) {
    return {
      label: "Consider paying cash",
      explanation:
        "The redemption value looks weak compared with paying cash.",
    };
  }

  return {
    label: "Compare before booking",
    explanation:
      "This award may be reasonable, but compare cash price, alternate programs, and transfer risk before booking.",
  };
}

function renderWallet() {
  if (!savedWalletCards.length) {
    walletPreview.textContent = "No wallet saved yet";
    walletList.innerHTML = "";
    walletForm.classList.remove("hidden");
    editWalletButton.textContent = "Hide";
    return;
  }

  const totalPoints = savedWalletCards.reduce((sum, item) => {
    return sum + Number(String(item.balance || "").replace(/,/g, ""));
  }, 0);

  walletPreview.textContent = `${savedWalletCards.length} card${
    savedWalletCards.length === 1 ? "" : "s"
  } · ${formatNumber(totalPoints)} total points`;

  walletList.innerHTML = savedWalletCards
    .map(
      (item, index) => `
        <div class="walletRow">
          <div>
            <strong>${item.card}</strong>
            <span>${formatNumber(item.balance) || "0"} points</span>
          </div>

          <button class="removeWalletCard" data-index="${index}" type="button">
            Remove
          </button>
        </div>
      `
    )
    .join("");

  document.querySelectorAll(".removeWalletCard").forEach((button) => {
    button.addEventListener("click", () => {
      const indexToRemove = Number(button.getAttribute("data-index"));
      savedWalletCards = savedWalletCards.filter(
        (_, index) => index !== indexToRemove
      );

      const primary = getPrimaryWalletCard();

      chrome.storage.local.set(
        {
          walletCards: savedWalletCards,
          wallet: primary,
        },
        () => {
          renderWallet();
        }
      );
    });
  });

  walletForm.classList.add("hidden");
  editWalletButton.textContent = "Add";
}

function getPrimaryWalletCard() {
  if (!savedWalletCards.length) {
    return {
      card: cardInput.value || "Amex",
      balance: balanceInput.value || "",
    };
  }

  return [...savedWalletCards].sort((a, b) => {
    const aBalance = Number(String(a.balance || "").replace(/,/g, ""));
    const bBalance = Number(String(b.balance || "").replace(/,/g, ""));
    return bBalance - aBalance;
  })[0];
}

function populateOverridePanel(data) {

    if (
  !overrideAirline ||
  !overrideProgram ||
  !overrideOrigin ||
  !overrideDestination ||
  !overrideDate ||
  !overrideMiles ||
  !overrideTaxes ||
  !overrideCashPrice
) {
  return;
}
  overrideAirline.value = data.airline || "";
  overrideProgram.value = data.program || "";
  overrideOrigin.value = data.origin || "";
  overrideDestination.value = data.destination || "";
  overrideDate.value = data.departureDate || "";
  overrideMiles.value = data.miles || "";
  overrideTaxes.value = data.taxes || "";
overrideCashPrice.value = data.cashPrice || "";
overrideTaxes.placeholder = data.taxes ? "Ex: 5.60" : "Ex: 5.60";
overrideCashPrice.placeholder = data.cashPrice
  ? "Ex: 118.52"
  : "Cash fare not found";
}

if (recalculateOverrideButton) {
  recalculateOverrideButton.addEventListener("click", () => {
  if (!latestAnalysisData) return;

  const updated = {
    ...latestAnalysisData,
    airline: overrideAirline.value,
    program: overrideProgram.value,
    origin: overrideOrigin.value.toUpperCase(),
    destination: overrideDestination.value.toUpperCase(),
    departureDate: normalizeOverrideDate(overrideDate.value),
    miles: Number(String(overrideMiles.value || "").replace(/,/g, "")),
    taxes: Number(String(overrideTaxes.value || "").replace(/[$,]/g, "")),
    cashPrice: Number(String(overrideCashPrice.value || "").replace(/[$,]/g, "")),
  };

  updated.centsPerPoint =
    updated.cashPrice > 0 && updated.miles > 0
      ? ((updated.cashPrice - updated.taxes) / updated.miles) * 100
      : null;

  updated.redemptionScore = getSimpleRedemptionScore({
    miles: updated.miles,
    taxes: updated.taxes,
    cashPrice: updated.cashPrice,
    cabin: updated.cabin,
  });

  updated.redemptionLabel =
    updated.redemptionScore !== null
      ? getSimpleRedemptionLabel(updated.redemptionScore)
      : null;

  updated.bookingDecision = getSimpleBookingDecision({
    redemptionScore: updated.redemptionScore,
    canBook: updated.wallet?.canBook,
    centsPerPoint: updated.centsPerPoint,
  });

  latestAnalysisData = updated;
  resultBox.innerHTML = buildResultHtml(updated, latestSelectedCashOption);
  statusText.textContent = "Updated with overrides.";
});
}
function normalizeOverrideDate(value) {
  return value || "";
}