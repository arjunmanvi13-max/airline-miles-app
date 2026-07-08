const VANTARA_API_URL = "https://vantaratravel.net/api/analyze-structured-award";

const VANTARA_PANEL_ID = "vantara-panel";
const VANTARA_CARD_BUTTON_CLASS = "vantara-card-button";

const AIRLINE_BY_CODE = {
  AA: "American Airlines",
  AS: "Alaska Airlines",
  B6: "JetBlue",
  DL: "Delta Air Lines",
  UA: "United Airlines",
  WN: "Southwest Airlines",
  BA: "British Airways",
  VS: "Virgin Atlantic",
  AC: "Air Canada",
  QR: "Qatar Airways",
  EK: "Emirates",
  TK: "Turkish Airlines",
  SQ: "Singapore Airlines",
  CX: "Cathay Pacific",
  JL: "Japan Airlines",
  NH: "ANA",
  QF: "Qantas",
};

function addOpenCardHint(card) {
  if (card.querySelector(".vantara-open-hint")) return;
  if (card.querySelector(`.${VANTARA_CARD_BUTTON_CLASS}`)) return;

  const infoButton = card.querySelector('button, [role="button"]');
  const actions = card.querySelector(".trip-actions");

  if (actions) return;

  const hint = document.createElement("div");
  hint.className = "vantara-open-hint";
  hint.textContent = "Open card to analyze with Vantara";

  hint.style.position = "absolute";
  hint.style.right = "12px";
  hint.style.top = "50%";
  hint.style.transform = "translateY(-50%)";
  hint.style.border = "1px solid rgba(216, 180, 254, 0.45)";
  hint.style.background = "rgba(88, 28, 135, 0.35)";
  hint.style.color = "#f3e8ff";
  hint.style.padding = "7px 10px";
  hint.style.borderRadius = "999px";
  hint.style.fontSize = "12px";
  hint.style.fontWeight = "800";
  hint.style.pointerEvents = "none";
  hint.style.whiteSpace = "nowrap";

  card.style.position = "relative";
  card.appendChild(hint);
}

function addSummaryRowHints() {
  document.querySelectorAll("tbody tr").forEach((row) => {
    if (row.querySelector(".vantara-summary-hint")) return;

    const infoButton = row.querySelector("button");
    if (!infoButton) return;

    const lastCell = row.querySelector("td:last-child");
    if (!lastCell) return;

    const hint = document.createElement("div");
    hint.className = "vantara-summary-hint";
    hint.textContent = "Open card to analyze";

    hint.style.marginTop = "6px";
    hint.style.color = "#d8b4fe";
    hint.style.fontSize = "11px";
    hint.style.fontWeight = "800";
    hint.style.whiteSpace = "nowrap";
    hint.style.textAlign = "center";

    lastCell.appendChild(hint);
  });
}

function addButtonsToTripCards() {
  document.querySelectorAll(".trip-card").forEach((card) => {
    addOpenCardHint(card);
    if (card.querySelector(`.${VANTARA_CARD_BUTTON_CLASS}`)) return;

    const actions = card.querySelector(".trip-actions");
    if (!actions) return;

    const button = document.createElement("button");
    button.className = VANTARA_CARD_BUTTON_CLASS;
    button.type = "button";
    button.textContent = "✦ Vantara";

    button.style.border = "1px solid rgba(216, 180, 254, 0.65)";
    button.style.background = "rgba(88, 28, 135, 0.92)";
    button.style.color = "white";
    button.style.padding = "7px 11px";
    button.style.borderRadius = "8px";
    button.style.fontWeight = "800";
    button.style.fontSize = "13px";
    button.style.cursor = "pointer";
    button.style.marginLeft = "8px";
    button.style.whiteSpace = "nowrap";

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const award = extractSeatsAeroAward(card);
      openVantaraPanel(award);
      analyzeStructuredAward(award);
    });

    actions.appendChild(button);
  });
}

function extractSeatsAeroAward(card) {
  const pageContext = extractSeatsAeroPageContext();

  const flightNumber =
    card.querySelector(".flight-number-text")?.innerText?.trim() || "";

  const airlineCode = inferAirlineCode(card, flightNumber);
  const airline = AIRLINE_BY_CODE[airlineCode] || pageContext.program || "";

  const routeTimes = Array.from(card.querySelectorAll(".route-time")).map(
    (item) => item.innerText.trim()
  );

  const airportCodes = Array.from(
    card.querySelectorAll(".airport-code-wrapper")
  )
    .map((item) => item.childNodes?.[0]?.textContent?.trim())
    .filter(Boolean);

  const origin = airportCodes[0] || pageContext.origin || "";
  const destination = airportCodes[1] || pageContext.destination || "";

  const pointsText =
    card.querySelector(".trip-right .points")?.innerText ||
    card.querySelector(".trip-middle-right .points")?.innerText ||
    card.querySelector(".points")?.innerText ||
    "";

  const taxesText =
    card.querySelector(".trip-right .taxes")?.innerText ||
    card.querySelector(".trip-middle-right .taxes")?.innerText ||
    card.querySelector(".taxes")?.innerText ||
    "";

  const stopText =
    card.querySelector(".stop-indicator")?.innerText?.trim() || "";

  const fareClass =
    card.querySelector(".fare-class")?.innerText?.trim() || "";

  return {
    source: "seats.aero",
    airline,
    program: pageContext.program,
    origin,
    destination,
    route: origin && destination ? `${origin} → ${destination}` : "",
    departureDate: pageContext.departureDate,
    cabin: pageContext.cabin,
    miles: normalizeSeatsAeroPoints(pointsText),
    taxes: normalizeMoney(taxesText),
    cashPrice: "",
    flightNumber,
    departureTime: routeTimes[0] || "",
    arrivalTime: routeTimes[1] || "",
    isNonstop: /direct|nonstop/i.test(stopText),
    stops: stopText || "",
    fareClass,
    rawText: card.innerText,
  };
}

function extractSeatsAeroPageContext() {
  const bodyText = document.body.innerText;

  const dateInput =
    document.querySelector('input[type="date"]')?.value ||
    findDateFromText(bodyText);

  const origin =
    getSelectedAirportFromLabel("Origin Airports") ||
    findRouteAirportFromHeader(bodyText, "origin");

  const destination =
    getSelectedAirportFromLabel("Destination Airports") ||
    findRouteAirportFromHeader(bodyText, "destination");

  const program = findVisibleProgram() || "";

  const cabin =
    getActiveCabinFromTabs() ||
    inferCabinFromUrl() ||
    "Economy";

  return {
    origin,
    destination,
    departureDate: normalizeDate(dateInput),
    program,
    cabin,
  };
}

function getSelectedAirportFromLabel(labelText) {
  const labels = Array.from(document.querySelectorAll("label, div, span"));

  const label = labels.find((item) =>
    item.innerText?.trim()?.includes(labelText)
  );

  if (!label) return "";

  const container = label.closest("div");
  const text = container?.innerText || "";
  const codes = text.match(/\b[A-Z]{3}\b/g);

  return codes?.[0] || "";
}

function findRouteAirportFromHeader(text, side) {
  const match = text.match(/\b([A-Z]{3})\s*→\s*([A-Z]{3})\b/);
  if (!match) return "";

  return side === "origin" ? match[1] : match[2];
}

function findVisibleProgram() {
  const text = document.body.innerText;

  const knownPrograms = [
    "Alaska Atmos Rewards",
    "Alaska Mileage Plan",
    "Mileage Plan",
    "American AAdvantage",
    "AAdvantage",
    "United MileagePlus",
    "MileagePlus",
    "Delta SkyMiles",
    "SkyMiles",
    "JetBlue TrueBlue",
    "TrueBlue",
    "Virgin Atlantic Flying Club",
    "Flying Club",
    "Air Canada Aeroplan",
    "Aeroplan",
    "British Airways Executive Club",
    "Executive Club",
  ];

  return knownPrograms.find((program) => text.includes(program)) || "";
}

function getActiveCabinFromTabs() {
  const activeTab =
    document.querySelector('[role="tab"][aria-selected="true"]') ||
    document.querySelector('[data-state="active"][role="tab"]');

  const text = activeTab?.innerText?.trim();

  if (!text) return "";

  if (/premium/i.test(text)) return "Premium Economy";
  if (/business/i.test(text)) return "Business";
  if (/first/i.test(text)) return "First";
  if (/economy/i.test(text)) return "Economy";

  return "";
}

function inferCabinFromUrl() {
  const url = window.location.href.toLowerCase();

  if (url.includes("business")) return "Business";
  if (url.includes("first")) return "First";
  if (url.includes("premium")) return "Premium Economy";
  if (url.includes("economy")) return "Economy";

  return "";
}

function inferAirlineCode(card, flightNumber) {
  const cleanFlight = String(flightNumber || "")
    .trim()
    .toUpperCase()
    .replace(/\s/g, "");

  const prefix = cleanFlight.match(/^[A-Z]{2}/)?.[0];

  if (prefix) return prefix;

  const logoSrc = card.querySelector(".carrier-logo")?.getAttribute("src") || "";
  const logoMatch = logoSrc.match(/\/([A-Z0-9]{2})\.png/i);

  return logoMatch?.[1]?.toUpperCase() || "";
}

function normalizeSeatsAeroPoints(value) {
  const raw = String(value || "").toLowerCase().replace(/,/g, "").trim();

  const kMatch = raw.match(/([\d.]+)\s*k/);
  if (kMatch) return String(Math.round(Number(kMatch[1]) * 1000));

  const numberMatch = raw.match(/\d+/);
  return numberMatch ? numberMatch[0] : "";
}

function normalizeMoney(value) {
  const match = String(value || "").match(/[\d,.]+/);
  return match ? match[0].replace(/,/g, "") : "";
}

function normalizeDate(value) {
  const raw = String(value || "").trim();

  if (!raw) return "";

  const yyyyMmDdMatch = raw.match(/\d{4}-\d{2}-\d{2}/);
  if (yyyyMmDdMatch) return yyyyMmDdMatch[0];

  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(parsed.getDate()).padStart(2, "0")}`;
  }

  return "";
}

function findDateFromText(text) {
  const match =
    text.match(/[A-Z][a-z]{2},\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/) ||
    text.match(/\d{4}-\d{2}-\d{2}/);

  return match?.[0] || "";
}

function openVantaraPanel(award) {
  const existing = document.getElementById(VANTARA_PANEL_ID);
  if (existing) existing.remove();

  const panel = document.createElement("div");
  panel.id = VANTARA_PANEL_ID;

  panel.style.position = "fixed";
  panel.style.right = "18px";
  panel.style.bottom = "78px";
  panel.style.width = "390px";
  panel.style.maxHeight = "72vh";
  panel.style.overflow = "auto";
  panel.style.zIndex = "999999";
  panel.style.background = "#05060a";
  panel.style.color = "white";
  panel.style.border = "1px solid rgba(216, 180, 254, 0.35)";
  panel.style.boxShadow = "0 24px 80px rgba(0,0,0,0.6)";
  panel.style.borderRadius = "16px";
  panel.style.padding = "18px";
  panel.style.fontFamily =
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  panel.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
      <div>
        <p style="margin:0;color:#d8b4fe;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;">Vantara</p>
        <h2 style="margin:8px 0 4px;font-size:22px;color:white;">Analyzing award</h2>
        <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.45;">
          ${escapeHtml(award.origin || "?")} → ${escapeHtml(award.destination || "?")} · ${escapeHtml(award.miles ? Number(award.miles).toLocaleString() + " miles" : "Miles unknown")}
        </p>
      </div>

      <button id="vantara-close-panel" style="border:1px solid rgba(255,255,255,0.12);background:#111;color:white;padding:6px 9px;border-radius:8px;cursor:pointer;">×</button>
    </div>

    <div id="vantara-panel-content" style="margin-top:14px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;">
      <p style="margin:0 0 8px;color:#c084fc;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Working</p>
      <h3 style="margin:0;color:white;font-size:22px;">Finding cash fare...</h3>
      <p style="margin:10px 0 0;color:#cbd5e1;font-size:13px;line-height:1.45;">
        Vantara is comparing this award against live cash pricing and your wallet.
      </p>
    </div>

    <p id="vantara-panel-status" style="margin:10px 0 0;color:#94a3b8;font-size:12px;">
      Reading selected Seats.aero award...
    </p>
  `;

  document.body.appendChild(panel);

  document.getElementById("vantara-close-panel").addEventListener("click", () => {
    panel.remove();
  });
}

function buildDetectedAwardHtml(award) {
  return `
    <div style="margin-top:14px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);padding:12px;border-radius:12px;">
      <p style="margin:0 0 8px;color:#c084fc;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Detected award</p>
      ${detailRow("Route", `${award.origin || "?"} → ${award.destination || "?"}`)}
      ${detailRow("Date", award.departureDate || "Not found")}
      ${detailRow("Airline", award.airline || "Not found")}
      ${detailRow("Program", award.program || "Not found")}
      ${detailRow("Cabin", award.cabin || "Not found")}
      ${detailRow("Miles", award.miles ? Number(award.miles).toLocaleString() : "Not found")}
      ${detailRow("Taxes", award.taxes ? `$${award.taxes}` : "Not found")}
      ${detailRow("Flight", award.flightNumber || "Not found")}
      ${detailRow("Times", `${award.departureTime || "?"} → ${award.arrivalTime || "?"}`)}
      ${detailRow("Stops", award.stops || "Unknown")}
    </div>
  `;
}

function getChromeStorage(keys) {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve({});
      return;
    }

    chrome.storage.local.get(keys, (data) => {
      resolve(data || {});
    });
  });
}

async function analyzeStructuredAward(award) {
  const status = document.getElementById("vantara-panel-status");
  const content = document.getElementById("vantara-panel-content");

  try {
    const storageData = await getChromeStorage([
      "wallet",
      "walletCards",
      "bookingBasics",
    ]);

    const primaryWallet = getPrimaryWalletCardFromStorage(storageData);
    const bookingBasics = storageData.bookingBasics || {};

    status.textContent = "Finding comparable cash fare...";

    const response = await fetch(VANTARA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...award,
        card: primaryWallet.card,
        balance: primaryWallet.balance,
        passengers: bookingBasics.passengers || 1,
        cabin: award.cabin || bookingBasics.cabin || "Economy",
      }),
    });

    status.textContent = "Calculating redemption value...";

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(responseText.slice(0, 120));
    }

    if (!response.ok) {
      throw new Error(result.error || "Vantara analysis failed.");
    }

    content.innerHTML = buildAnalysisHtml(result);
    status.textContent = "Analysis complete.";
  } catch (error) {
    console.error(error);

    content.innerHTML = `
      <div style="margin-top:14px;border:1px solid rgba(248,113,113,0.35);background:rgba(127,29,29,0.18);padding:14px;border-radius:12px;">
        <p style="margin:0 0 8px;color:#c084fc;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Vantara error</p>
        <h3 style="margin:0;color:white;font-size:22px;">Could not analyze this award</h3>
        <p style="margin:10px 0 0;color:#cbd5e1;font-size:13px;line-height:1.45;">
          ${escapeHtml(error.message || "Something went wrong.")}
        </p>
      </div>
    `;

    status.textContent = "Analysis failed.";
  }
}

function getPrimaryWalletCardFromStorage(data) {
  const cards = Array.isArray(data.walletCards)
    ? data.walletCards
    : data.wallet?.card
    ? [data.wallet]
    : [];

  if (!cards.length) {
  return {
    card: "Amex",
    balance: "",
    missingWallet: true,
  };
}

  return [...cards].sort((a, b) => {
    const aBalance = Number(String(a.balance || "").replace(/,/g, ""));
    const bBalance = Number(String(b.balance || "").replace(/,/g, ""));
    return bBalance - aBalance;
  })[0];
}

function buildAnalysisHtml(data) {
  const label = data.bookingDecision?.label || "Analysis complete";
  const explanation = data.bookingDecision?.explanation || "";

  const isGood = label === "Book with points";
  const isNeutral = label === "Compare before booking";

  const border = isGood
    ? "rgba(74,222,128,0.35)"
    : isNeutral
    ? "rgba(251,191,36,0.35)"
    : "rgba(248,113,113,0.35)";

  const background = isGood
    ? "rgba(20,83,45,0.18)"
    : isNeutral
    ? "rgba(120,53,15,0.18)"
    : "rgba(127,29,29,0.18)";

  const walletWarning =
  !data.wallet?.balance
    ? `
      <div style="margin-top:14px;border:1px solid rgba(251,191,36,0.35);background:rgba(120,53,15,0.18);padding:13px;border-radius:12px;">
        <p style="margin:0 0 8px;color:#fbbf24;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Wallet not configured</p>
        <p style="margin:0;color:#fde68a;font-size:13px;line-height:1.45;">
          Add your transferable points wallet in the Vantara extension popup to see accurate bookability and transfer-path recommendations.
        </p>
      </div>
    `
    : "";

return `
    ${walletWarning}

    <div style="margin-top:14px;border:1px solid ${border};background:${background};padding:14px;border-radius:12px;">
      <p style="margin:0 0 8px;color:#c084fc;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Vantara recommendation</p>
      <h3 style="margin:0;color:white;font-size:24px;line-height:1.15;">${escapeHtml(label)}</h3>
      <p style="margin:10px 0 0;color:#cbd5e1;font-size:13px;line-height:1.45;">${escapeHtml(explanation)}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;">
      ${metricBox("Score", data.redemptionScore !== null && data.redemptionScore !== undefined ? `${data.redemptionScore}/100` : "Unknown")}
      ${metricBox("Value", data.centsPerPoint ? `${Number(data.centsPerPoint).toFixed(2)}¢ / point` : "Unknown")}
      ${metricBox("Cash fare", data.cashPrice ? `$${Number(data.cashPrice).toFixed(2)}` : "Unavailable")}
      ${metricBox("Bookability", data.wallet?.canBook ? "Valid" : "Not ready")}
    </div>

    <div style="margin-top:12px;border:1px solid rgba(216,180,254,0.25);background:rgba(88,28,135,0.18);padding:13px;border-radius:12px;">
      <p style="margin:0 0 8px;color:#c084fc;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Best transfer path</p>
      <p style="margin:7px 0;color:white;font-weight:800;">
        ${data.transfer ? `${escapeHtml(data.transfer.card)} → ${escapeHtml(data.transfer.program)}` : "No matching transfer path"}
      </p>
      <p style="margin:7px 0;color:#cbd5e1;">
        ${data.wallet?.requiredPoints ? `${Number(data.wallet.requiredPoints).toLocaleString()} transferable points needed.` : "Points needed unknown."}
      </p>
      <p style="margin:7px 0;color:#cbd5e1;">
        ${data.wallet?.canBook ? "Your wallet can cover this booking path." : data.wallet?.shortage ? `Your wallet is short by ${Number(data.wallet.shortage).toLocaleString()} points.` : "Wallet balance not entered."}
      </p>
    </div>

    <div style="margin-top:12px;border:1px solid rgba(216,180,254,0.25);background:rgba(88,28,135,0.18);padding:13px;border-radius:12px;">
      <p style="margin:0 0 8px;color:#c084fc;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Trip details</p>
      ${detailRow("Route", `${data.origin || "?"} → ${data.destination || "?"}`)}
      ${detailRow("Date", data.departureDate || "Unknown")}
      ${detailRow("Airline", data.airline || "Unknown")}
      ${detailRow("Program", data.program || "Unknown")}
      ${detailRow("Cabin", data.cabin || "Unknown")}
      ${detailRow("Miles", data.miles ? Number(data.miles).toLocaleString() : "Unknown")}
      ${detailRow("Taxes", data.taxes ? `$${data.taxes}` : "Unknown")}
      ${detailRow("Cash lookup", data.cashLookup?.confidence || "Unknown")}
    </div>
  `;
}

function metricBox(label, value) {
  return `
    <div style="border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);padding:12px;border-radius:12px;">
      <p style="margin:0;color:#64748b;font-size:11px;">${escapeHtml(label)}</p>
      <p style="margin:6px 0 0;color:white;font-size:18px;font-weight:800;">${escapeHtml(value)}</p>
    </div>
  `;
}

function detailRow(label, value) {
  return `
    <p style="margin:7px 0;color:#cbd5e1;font-size:13px;">
      <strong style="color:white;">${escapeHtml(label)}:</strong>
      ${escapeHtml(value)}
    </p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

addSummaryRowHints();
addButtonsToTripCards();

const observer = new MutationObserver(() => {
  addSummaryRowHints();
  addButtonsToTripCards();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});