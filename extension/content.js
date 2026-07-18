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

const VANTARA_POINTS_YEAH_BUTTON_CLASS = "vantara-pointsyeah-button";
const VANTARA_POINTS_YEAH_CARD_ATTRIBUTE = "data-vantara-pointsyeah-card";

const VANTARA_ROAME_BUTTON_CLASS = "vantara-roame-button";
const VANTARA_ROAME_READY_ATTRIBUTE = "data-vantara-roame-ready";

const VANTARA_POINT_ME_BUTTON_CLASS = "vantara-point-me-button";

const VANTARA_AWARDTOOL_BUTTON_CLASS = "vantara-awardtool-button";

let activeAwardToolSession = null;

let activeRoameManualSession = null;

let activePointMeButton = null;


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

function isPointsYeahPage() {
  return window.location.hostname.includes("pointsyeah.com");
}

function addButtonsToPointsYeahCards() {
  if (!isPointsYeahPage()) return;

  // Remove accidental duplicates left from earlier runs.
  document
    .querySelectorAll(`.${VANTARA_POINTS_YEAH_BUTTON_CLASS}`)
    .forEach((button) => {
      const container = button.parentElement;

      if (!container) return;

      const buttons = Array.from(
        container.querySelectorAll(`.${VANTARA_POINTS_YEAH_BUTTON_CLASS}`)
      );

      buttons.slice(1).forEach((duplicate) => duplicate.remove());
    });

  const viewDetailButtons = Array.from(
    document.querySelectorAll("button")
  ).filter((button) => button.innerText?.trim() === "View Detail");

  viewDetailButtons.forEach((viewDetailButton) => {
    if (viewDetailButton.dataset.vantaraReady === "true") return;

    const card = findPointsYeahCardFromViewButton(viewDetailButton);
    if (!card) return;

    const buttonContainer = viewDetailButton.parentElement;
    if (!buttonContainer) return;

    if (
      buttonContainer.querySelector(
        `.${VANTARA_POINTS_YEAH_BUTTON_CLASS}`
      )
    ) {
      viewDetailButton.dataset.vantaraReady = "true";
      return;
    }

    viewDetailButton.dataset.vantaraReady = "true";

    const button = document.createElement("button");

    button.type = "button";
    button.className = VANTARA_POINTS_YEAH_BUTTON_CLASS;
    button.textContent = "✦ Vantara";
    button.setAttribute(
      "aria-label",
      "Analyze this award with Vantara"
    );

    Object.assign(button.style, {
      height: "30px",
      border: "1px solid rgba(126, 34, 206, 0.7)",
      background:
        "linear-gradient(135deg, rgb(42, 18, 72), rgb(91, 33, 182))",
      color: "white",
      padding: "0 12px",
      borderRadius: "999px",
      fontWeight: "800",
      fontSize: "12px",
      lineHeight: "1",
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 8px 20px rgba(88, 28, 135, 0.22)",
      flexShrink: "0",
    });

    button.addEventListener("mouseenter", () => {
      button.style.filter = "brightness(1.12)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.filter = "none";
    });

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const award = extractPointsYeahAward(card);

      openVantaraPanel(award);
      await analyzeStructuredAward(award);
    });

    buttonContainer.style.display = "flex";
buttonContainer.style.flexDirection = "column";
buttonContainer.style.alignItems = "stretch";
buttonContainer.style.gap = "6px";

viewDetailButton.style.width = "100%";
button.style.width = "100%";
button.style.marginLeft = "0";

buttonContainer.appendChild(button);
  });
}

function findPointsYeahCardFromViewButton(viewDetailButton) {
  let current = viewDetailButton.parentElement;

  for (let level = 0; level < 10 && current; level += 1) {
    const text = current.innerText || "";

    const hasLiveResult = text.includes("Live Result");
    const hasFlightTime =
      /\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)/i.test(
        text
      );
    const hasPoints = /\d[\d,]*\s*pts/i.test(text);
    const hasViewDetail = text.includes("View Detail");

    if (
      hasLiveResult &&
      hasFlightTime &&
      hasPoints &&
      hasViewDetail &&
      text.length < 3000
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function findPointsYeahCardRoot(element) {
  let current = element;

  for (let level = 0; level < 6 && current; level += 1) {
    const text = current.innerText || "";

    const liveResultCount = (text.match(/Live Result/g) || []).length;
    const viewDetailCount = (text.match(/View Detail/g) || []).length;

    if (
      liveResultCount === 1 &&
      viewDetailCount === 1 &&
      text.length > 100 &&
      text.length < 2500
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return element;
}

function extractPointsYeahAward(card) {
  const text = card.innerText || "";

  const date = extractPointsYeahDate(text);
  const times = extractPointsYeahTimes(text);
  const route = extractPointsYeahRoute(text);
  const airlineData = extractPointsYeahAirline(card, text);
  const cabin = extractPointsYeahCabin(text);
  const stops = extractPointsYeahStops(text);
  const programData = extractPointsYeahProgram(card, text);
  const awardPrice = extractPointsYeahAwardPrice(card, text);

  return {
    source: "pointsyeah",
    airline: airlineData.airline,
    program: programData.program,
    origin: route.origin,
    destination: route.destination,
    route:
      route.origin && route.destination
        ? `${route.origin} → ${route.destination}`
        : "",
    departureDate: date,
    cabin,
    miles: awardPrice.miles,
    taxes: awardPrice.taxes,
    cashPrice: "",
    flightNumber: airlineData.flightNumber,
    departureTime: times.departureTime,
    arrivalTime: times.arrivalTime,
    isNonstop: stops.isNonstop,
    stops: stops.label,
    passengers: 1,
    transferBanks: programData.transferBanks,
    rawText: text,
  };
}

function extractPointsYeahDate(text) {
  const headerDate = document.body.innerText.match(
    /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}\b/
  );

  if (headerDate) {
    return normalizeDate(headerDate[0]);
  }

  const shortDate = text.match(/\b(\d{1,2})\/(\d{1,2})\b/);

  if (shortDate) {
    const month = shortDate[1].padStart(2, "0");
    const day = shortDate[2].padStart(2, "0");

    return `2026-${month}-${day}`;
  }

  return "";
}

function extractPointsYeahTimes(text) {
  const match = text.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i
  );

  return {
    departureTime: match?.[1] || "",
    arrivalTime: match?.[2] || "",
  };
}

function extractPointsYeahRoute(text) {
  const routeMatches = Array.from(
    text.matchAll(/\b([A-Z]{3})\s*-\s*([A-Z]{3})(?:\s*-\s*([A-Z]{3}))?/g)
  );

  if (!routeMatches.length) {
    return {
      origin: "",
      destination: "",
    };
  }

  const route = routeMatches.find((match) => match[3]) || routeMatches[0];

  return {
    origin: route[1] || "",
    destination: route[3] || route[2] || "",
  };
}

function extractPointsYeahAirline(card, text) {
  const flightMatch = text.match(
    /([A-Za-z][A-Za-z .'-]+)\s*-\s*([A-Z0-9]{2,3}\d{1,4})/
  );

  if (flightMatch) {
    return {
      airline: flightMatch[1].trim(),
      flightNumber: flightMatch[2].trim(),
    };
  }

  const airlineImage = Array.from(card.querySelectorAll("img")).find((image) =>
    /airlines/i.test(image.getAttribute("src") || "")
  );

  const imageSrc = airlineImage?.getAttribute("src") || "";
  const airlineCodeMatch = imageSrc.match(/airlines%2F([a-z0-9]{2,3})\.png/i);

  const airlineCode = airlineCodeMatch?.[1]?.toUpperCase() || "";

  return {
    airline: AIRLINE_BY_CODE[airlineCode] || "",
    flightNumber: "",
  };
}

function extractPointsYeahCabin(text) {
  if (/\bFirst\b/i.test(text)) return "First";
  if (/\bBusiness\b/i.test(text)) return "Business";
  if (/\bPremium Economy\b/i.test(text)) return "Premium Economy";
  if (/\bEconomy\b/i.test(text)) return "Economy";

  return "Economy";
}

function extractPointsYeahStops(text) {
  const stopMatch = text.match(
    /\b(\d+)\s+stop(?:s)?\b|\bnonstop\b|\bdirect\b/i
  );

  if (!stopMatch) {
    return {
      isNonstop: false,
      label: "Unknown",
    };
  }

  const label = stopMatch[0];

  return {
    isNonstop: /nonstop|direct/i.test(label) || /^0\s+stop/i.test(label),
    label,
  };
}

function extractPointsYeahProgram(card, text) {
  const programImages = Array.from(card.querySelectorAll("img")).filter(
    (image) => /programs/i.test(image.getAttribute("src") || "")
  );

  const programImage = programImages[0];
  const programSrc = programImage?.getAttribute("src") || "";

  let program = "";

  if (/programs\/ey\.png/i.test(programSrc)) {
    program = "Etihad Guest";
  } else {
    const programCodeMatch = programSrc.match(/programs\/([^/?]+)\./i);
    program = programCodeMatch?.[1]
      ? decodeURIComponent(programCodeMatch[1])
      : "";
  }

  const transferBanks = Array.from(card.querySelectorAll("img"))
    .map((image) => image.getAttribute("alt") || "")
    .filter(Boolean)
    .filter((alt) =>
      /Capital One|American Exp|Membership Rewards|Citi|ThankYou|Chase|Bilt|Wells Fargo/i.test(
        alt
      )
    );

  if (!program) {
    const knownPrograms = [
      "Etihad Guest",
      "Aeroplan",
      "Flying Blue",
      "AAdvantage",
      "MileagePlus",
      "Mileage Plan",
      "Executive Club",
      "Virgin Atlantic Flying Club",
      "Qatar Privilege Club",
      "KrisFlyer",
      "Asia Miles",
    ];

    program = knownPrograms.find((item) => text.includes(item)) || "";
  }

  return {
    program,
    transferBanks: [...new Set(transferBanks)],
  };
}

function extractPointsYeahAwardPrice(card, text) {
  const candidates = Array.from(card.querySelectorAll("div, span"))
    .map((element) => element.innerText?.trim() || "")
    .filter((value) => /^\d[\d,]*(?:\.\d+)?\s*pts/i.test(value));

  const mileageCandidates = candidates
    .map((value) => {
      const match = value.match(/^([\d,.]+)\s*pts/i);
      return match ? Number(match[1].replace(/,/g, "")) : 0;
    })
    .filter((value) => value > 0);

  const miles =
    mileageCandidates.length > 0
      ? String(Math.min(...mileageCandidates))
      : "";

  const taxMatches = Array.from(
    text.matchAll(/\$([\d,.]+)\s*(?:tax|USD)?/gi)
  )
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);

  const taxes =
    taxMatches.length > 0 ? String(Math.min(...taxMatches)) : "";

  return {
    miles,
    taxes,
  };
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

if (existing) {
  closeActiveRoameManualSession();
  resetActivePointMeButton();
  existing.remove();
}

if (existing) {
  closeActiveRoameManualSession();
  resetActivePointMeButton();
  closeActiveAwardToolSession();
  existing.remove();
}

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

  document
  .getElementById("vantara-close-panel")
  .addEventListener("click", () => {
    closeActiveRoameManualSession();
    resetActivePointMeButton();
    closeActiveAwardToolSession();
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

  const tone = data.bookingDecision?.tone || "neutral";

const border =
  tone === "strong"
    ? "rgba(74,222,128,0.38)"
    : tone === "wallet"
    ? "rgba(250,204,21,0.46)"
    : tone === "warning"
    ? "rgba(251,191,36,0.42)"
    : tone === "bad"
    ? "rgba(248,113,113,0.40)"
    : "rgba(192,132,252,0.30)";

const background =
  tone === "strong"
    ? "rgba(20,83,45,0.20)"
    : tone === "wallet"
    ? "rgba(113,63,18,0.22)"
    : tone === "warning"
    ? "rgba(120,53,15,0.20)"
    : tone === "bad"
    ? "rgba(127,29,29,0.20)"
    : "rgba(88,28,135,0.16)";

  const walletWarning =
  !data.wallet?.balance
    ? `
      <div style="margin-top:14px;border:1px solid rgba(251,191,36,0.35);background:rgba(120,53,15,0.18);padding:13px;border-radius:12px;">
        <p style="margin:0 0 8px;color:#fbbf24;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Wallet optional</p>
        <p style="margin:0;color:#fde68a;font-size:13px;line-height:1.45;">
          Vantara can still evaluate this redemption without a wallet. Add your transferable points and optional balances for personalized bookability and transfer-path recommendations.
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
      ${pointValueMetricBox(data.centsPerPoint)}
      ${metricBox("Cash fare", data.cashPrice ? `$${Number(data.cashPrice).toFixed(2)}` : "Unavailable")}
      ${metricBox(
  "Bookability",
  data.wallet?.balance === null ||
    data.wallet?.balance === undefined
    ? "Wallet not entered"
    : data.wallet?.canBook
    ? "Ready"
    : "More points needed"
)}
    </div>

    <div style="margin-top:12px;border:1px solid rgba(216,180,254,0.25);background:rgba(88,28,135,0.18);padding:13px;border-radius:12px;">
      <p style="margin:0 0 8px;color:#c084fc;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;">Best transfer path</p>
      <p style="margin:7px 0;color:white;font-weight:800;">
        ${
  data.transfer
    ? `${escapeHtml(data.transfer.card)} → ${escapeHtml(
        data.transfer.program
      )}`
    : data.wallet?.balance === null ||
      data.wallet?.balance === undefined
    ? "Add wallet for personalized path"
    : "No matching transfer path"
}
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

function getPointValueColors(centsPerPoint) {
  const value = Number(centsPerPoint);

  if (!Number.isFinite(value) || value <= 0) {
    return {
      border: "rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.03)",
      valueColor: "white",
    };
  }

  if (value >= 2.0) {
    return {
      border: "rgba(74,222,128,0.38)",
      background: "rgba(20,83,45,0.20)",
      valueColor: "#86efac",
    };
  }

  if (value >= 1.5) {
    return {
      border: "rgba(96,165,250,0.38)",
      background: "rgba(30,64,175,0.18)",
      valueColor: "#93c5fd",
    };
  }

  if (value >= 1.1) {
    return {
      border: "rgba(250,204,21,0.42)",
      background: "rgba(113,63,18,0.20)",
      valueColor: "#fde047",
    };
  }

  return {
    border: "rgba(248,113,113,0.40)",
    background: "rgba(127,29,29,0.20)",
    valueColor: "#fca5a5",
  };
}

function pointValueMetricBox(centsPerPoint) {
  const colors = getPointValueColors(centsPerPoint);

  const displayValue =
    Number(centsPerPoint) > 0
      ? `${Number(centsPerPoint).toFixed(2)}¢ / point`
      : "Unknown";

  return `
    <div style="
      border:1px solid ${colors.border};
      background:${colors.background};
      padding:12px;
      border-radius:12px;
    ">
      <p style="margin:0;color:#64748b;font-size:11px;">
        Value
      </p>

      <p style="
        margin:6px 0 0;
        color:${colors.valueColor};
        font-size:18px;
        font-weight:800;
      ">
        ${escapeHtml(displayValue)}
      </p>
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

function isRoamePage() {
  return window.location.hostname.includes("roame.travel");
}


function findRoameExpandButton(card) {
  const buttons = Array.from(
    card.querySelectorAll('button, [role="button"], div.cursor-pointer')
  );

  return (
    buttons.find((element) => {
      const svg = element.querySelector("svg");
      const rect = element.getBoundingClientRect();

      return (
        svg &&
        rect.width >= 24 &&
        rect.width <= 60 &&
        rect.height >= 24 &&
        rect.height <= 60
      );
    }) || null
  );
}

function extractRoameAirline(card, text) {
  const knownAirlines = [
    "JetBlue",
    "American Airlines",
    "Delta Air Lines",
    "United Airlines",
    "Alaska Airlines",
    "Southwest Airlines",
    "Air Canada",
    "British Airways",
    "Virgin Atlantic",
    "Swiss International Air Lines",
    "Lufthansa",
    "Singapore Airlines",
    "Qatar Airways",
    "Emirates",
    "Etihad Airways",
    "Air India",
  ];

  const textMatch = knownAirlines.find((airline) =>
    text.toLowerCase().includes(airline.toLowerCase())
  );

  if (textMatch) return textMatch;

  const imageSources = Array.from(card.querySelectorAll("img")).map(
    (image) =>
      `${image.getAttribute("src") || ""} ${
        image.getAttribute("alt") || ""
      }`.toLowerCase()
  );

  if (imageSources.some((value) => value.includes("jetblue"))) {
    return "JetBlue";
  }

  if (imageSources.some((value) => value.includes("united"))) {
    return "United Airlines";
  }

  if (imageSources.some((value) => value.includes("american"))) {
    return "American Airlines";
  }

  if (imageSources.some((value) => value.includes("delta"))) {
    return "Delta Air Lines";
  }

  if (imageSources.some((value) => value.includes("alaska"))) {
    return "Alaska Airlines";
  }

  return "";
}
function extractRoameRoute(text) {
  const codes = Array.from(text.matchAll(/\b[A-Z]{3}\b/g)).map(
    (match) => match[0]
  );

  const uniqueCodes = [...new Set(codes)];

  return {
    origin: uniqueCodes[0] || "",
    destination: uniqueCodes[uniqueCodes.length - 1] || "",
  };
}

function extractRoameTimes(text) {
  const match = text.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i
  );

  return {
    departureTime: match?.[1] || "",
    arrivalTime: match?.[2] || "",
  };
}


function extractRoameProgram(card, text) {
  const imageData = Array.from(card.querySelectorAll("img"))
    .map(
      (image) =>
        `${image.getAttribute("src") || ""} ${
          image.getAttribute("alt") || ""
        }`
    )
    .join(" ")
    .toLowerCase();

  if (
    imageData.includes("trueblue") ||
    imageData.includes("jetblue")
  ) {
    return "TrueBlue";
  }

  if (
    imageData.includes("unitedmileageplus") ||
    imageData.includes("mileageplus")
  ) {
    return "MileagePlus";
  }

  if (imageData.includes("aeroplan")) {
    return "Aeroplan";
  }

  if (imageData.includes("flyingblue")) {
    return "Flying Blue";
  }

  if (imageData.includes("aadvantage")) {
    return "AAdvantage";
  }

  if (imageData.includes("mileageplan")) {
    return "Mileage Plan";
  }

  if (
    imageData.includes("executiveclub") ||
    imageData.includes("avios")
  ) {
    return "Executive Club Avios";
  }

  if (imageData.includes("krisflyer")) {
    return "KrisFlyer";
  }

  const knownPrograms = [
    "JetBlue TrueBlue",
    "TrueBlue",
    "MileagePlus",
    "Aeroplan",
    "Flying Blue",
    "AAdvantage",
    "Mileage Plan",
    "Executive Club",
    "KrisFlyer",
    "Asia Miles",
    "Etihad Guest",
    "Privilege Club",
  ];

  const match = knownPrograms.find((program) =>
    text.toLowerCase().includes(program.toLowerCase())
  );

  return match || "";
}

function extractRoameCabin(text) {
  if (/\bFirst\b/i.test(text)) return "First";
  if (/\bBusiness\b/i.test(text)) return "Business";
  if (/\bPremium Economy\b/i.test(text)) return "Premium Economy";
  if (/\bEconomy\b/i.test(text)) return "Economy";

  return "Economy";
}





function extractRoameAwardPrice(text) {
  const pointsMatch = text.match(/\b([\d,]+)\s*pts\b/i);
  const taxesMatch = text.match(/\+\s*\$([\d,.]+)/);

  return {
    miles: pointsMatch ? pointsMatch[1].replace(/,/g, "") : "",
    taxes: taxesMatch ? taxesMatch[1].replace(/,/g, "") : "",
  };
}

function extractRoameStops(text) {
  const match = text.match(
    /\b(\d+)\s*stop(?:s)?\b|\bnonstop\b|\bdirect\b/i
  );

  const label = match?.[0] || "Unknown";

  return {
    label,
    isNonstop:
      /nonstop|direct/i.test(label) || /^0\s+stop/i.test(label),
  };
}

function extractRoameDate(text) {
  const cardDate = text.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/
  );

  const pageText = document.body.innerText;

  const fullDate = pageText.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/
  );

  if (fullDate) {
    return normalizeDate(fullDate[0]);
  }

  if (cardDate) {
    return normalizeDate(`${cardDate[0]}, 2026`);
  }

  return "";
}

function extractRoameTransferBanks(card) {
  const imageSources = Array.from(card.querySelectorAll("img")).map(
    (image) => image.getAttribute("src") || ""
  );

  const banks = [];

  if (imageSources.some((src) => /chase/i.test(src))) {
    banks.push("Chase");
  }

  if (imageSources.some((src) => /bilt/i.test(src))) {
    banks.push("Bilt");
  }

  if (imageSources.some((src) => /amex|americanexpress/i.test(src))) {
    banks.push("Amex");
  }

  if (imageSources.some((src) => /capital.?one/i.test(src))) {
    banks.push("Capital One");
  }

  if (imageSources.some((src) => /citi/i.test(src))) {
    banks.push("Citi");
  }

  if (imageSources.some((src) => /wells.?fargo/i.test(src))) {
    banks.push("Wells Fargo");
  }

  return banks;
}

function extractRoameAward(card, expandedDetails = null) {
  const cardText = card.innerText || "";
  const detailsText = expandedDetails?.innerText || "";

  const combinedText = `${cardText}\n${detailsText}`;

  const route = extractRoameRoute(cardText);
  const times = extractRoameExpandedTimes(detailsText) || extractRoameTimes(cardText);
  const awardPrice = extractRoameAwardPrice(combinedText);
  const stops = extractRoameStops(cardText);

  return {
    source: "roame",

    airline:
      extractRoameExpandedAirline(detailsText) ||
      extractRoameAirline(card, cardText),

    program: extractRoameProgram(card, combinedText),

    origin: route.origin,
    destination: route.destination,
    route:
      route.origin && route.destination
        ? `${route.origin} → ${route.destination}`
        : "",

    departureDate:
      extractRoameExpandedDate(detailsText) ||
      extractRoameDate(cardText),

    cabin:
      extractRoameExpandedCabin(detailsText) ||
      extractRoameCabin(cardText),

    miles: awardPrice.miles,
    taxes: awardPrice.taxes,
    cashPrice: "",

    flightNumber: extractRoameFlightNumber(detailsText),

    departureTime: times.departureTime,
    arrivalTime: times.arrivalTime,

    isNonstop: stops.isNonstop,
    stops: stops.label,

    passengers: 1,
    transferBanks: extractRoameTransferBanks(card),

    rawText: combinedText,
  };
}

function extractRoameFlightNumber(detailsText) {
  const detailLine = detailsText
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /\b[A-Z0-9]{2}\d{1,4}\b/.test(line));

  if (!detailLine) return "";

  const match = detailLine.match(/\b([A-Z0-9]{2}\d{1,4})\b/);

  return match?.[1] || "";
}

function extractRoameExpandedAirline(detailsText) {
  const detailLine = detailsText
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /\b[A-Z0-9]{2}\d{1,4}\b/.test(line));

  if (!detailLine) return "";

  return detailLine.split("·")[0]?.trim() || "";
}

function extractRoameExpandedCabin(detailsText) {
  if (/\bFirst\b/i.test(detailsText)) return "First";
  if (/\bBusiness\b/i.test(detailsText)) return "Business";
  if (/\bPremium Economy\b/i.test(detailsText)) {
    return "Premium Economy";
  }
  if (/\bEconomy\b/i.test(detailsText)) return "Economy";

  return "";
}

function extractRoameExpandedTimes(detailsText) {
  const matches = Array.from(
    detailsText.matchAll(/\b(\d{1,2}:\d{2}\s*(?:AM|PM))\b/gi)
  ).map((match) => match[1]);

  if (matches.length < 2) return null;

  return {
    departureTime: matches[0],
    arrivalTime: matches[1],
  };
}

function extractRoameExpandedDate(detailsText) {
  const match = detailsText.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/
  );

  return match ? normalizeDate(match[0]) : "";
}
function isRoamePage() {
  return window.location.hostname.includes("roame.travel");
}

function findRoameCollapseButton(expandedCard) {
  let current = expandedCard;

  for (let level = 0; level < 8 && current; level += 1) {
    const candidates = Array.from(
      current.querySelectorAll("div.cursor-pointer")
    );

    const collapseButton = candidates.find((element) => {
      const svg = element.querySelector(":scope > svg");
      const path = svg?.querySelector("path");

      return (
        path?.getAttribute("d") === "M4 6L8 10L12 6" &&
        element.className.includes("-rotate-180")
      );
    });

    if (collapseButton) return collapseButton;

    current = current.parentElement;
  }

  return null;
}

function closeActiveRoameManualSession() {
  if (!activeRoameManualSession) return;

  const { button, collapseButton } = activeRoameManualSession;

  if (collapseButton && document.body.contains(collapseButton)) {
    collapseButton.click();
  }

  if (button && document.body.contains(button)) {
    button.disabled = false;
    button.textContent = "✦ Analyze with Vantara";
    button.style.cursor = "pointer";
    button.style.filter = "none";
    button.style.transform = "translateY(0)";
  }

  activeRoameManualSession = null;
}

function addButtonsToExpandedRoameCards() {
  if (!isRoamePage()) return;

  const flightDetailHeadings = Array.from(
    document.querySelectorAll("div, h1, h2, h3")
  ).filter((element) => element.textContent?.trim() === "Flight Details");

  flightDetailHeadings.forEach((heading) => {
    const expandedCard = findExpandedRoameCardFromHeading(heading);
    if (!expandedCard) return;

    if (expandedCard.dataset.vantaraExpandedReady === "true") return;

    const headingRow = heading.parentElement;
    if (!headingRow) return;

    expandedCard.dataset.vantaraExpandedReady = "true";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "vantara-roame-expanded-button";
    button.textContent = "✦ Analyze with Vantara";

    Object.assign(button.style, {
      height: "38px",
      border: "1px solid rgba(126, 34, 206, 0.75)",
      background:
        "linear-gradient(135deg, rgb(42, 18, 72), rgb(91, 33, 182))",
      color: "white",
      padding: "0 16px",
      borderRadius: "9px",
      fontWeight: "800",
      fontSize: "13px",
      lineHeight: "1",
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 8px 22px rgba(88, 28, 135, 0.28)",
      transition:
        "filter 160ms ease, transform 160ms ease, box-shadow 160ms ease",
      marginLeft: "auto",
    });

    button.addEventListener("mouseenter", () => {
      if (button.disabled) return;

      button.style.filter = "brightness(1.12)";
      button.style.transform = "translateY(-1px)";
      button.style.boxShadow = "0 10px 26px rgba(88, 28, 135, 0.36)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.filter = "none";
      button.style.transform = "translateY(0)";
      button.style.boxShadow = "0 8px 22px rgba(88, 28, 135, 0.28)";
    });

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (button.disabled) return;

      button.disabled = true;
      button.textContent = "✦ Analyzing...";
      button.style.cursor = "wait";

      try {
        const award = extractExpandedRoameAwardForAnalysis(expandedCard);

        activeRoameManualSession = {
  expandedCard,
  button,
  collapseButton: findRoameCollapseButton(expandedCard),
};

openVantaraPanel(award);
await analyzeStructuredAward(award);

if (document.body.contains(button)) {
  button.textContent = "✓ Analysis open";
  button.style.cursor = "default";
}
      } catch (error) {
        console.error("Roame analysis failed:", error);

        button.disabled = false;
        button.textContent = "✦ Analyze with Vantara";
        button.style.cursor = "pointer";
      }
    });

    headingRow.style.display = "flex";
    headingRow.style.alignItems = "center";
    headingRow.style.gap = "12px";

    headingRow.appendChild(button);
  });
}

function extractExpandedRoameCabin(expandedCard) {
  const lines = (expandedCard.innerText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const flightLineIndex = lines.findIndex((line) =>
    /\b[A-Z0-9]{2}\d{1,4}\b/.test(line)
  );

  if (flightLineIndex === -1) return "Economy";

  const nearbyLines = lines
    .slice(flightLineIndex + 1, flightLineIndex + 5)
    .join(" ");

  if (/\bPremium Economy\b/i.test(nearbyLines)) {
    return "Premium Economy";
  }

  if (/\bBusiness\b/i.test(nearbyLines)) {
    return "Business";
  }

  if (/\bFirst\b/i.test(nearbyLines)) {
    return "First";
  }

  if (/\bEconomy\b/i.test(nearbyLines)) {
    return "Economy";
  }

  return "Economy";
}

function findExpandedRoameCardFromHeading(heading) {
  let current = heading.parentElement;

  for (let level = 0; level < 8 && current; level += 1) {
    const text = current.innerText || "";

    const hasFlightDetails = text.includes("Flight Details");
    const hasDeparture = text.includes("Departure");
    const hasBookingOptions = text.includes("Options to book");
    const hasFlightNumber = /\b[A-Z0-9]{2}\d{1,4}\b/.test(text);
    const hasPoints = /\b\d[\d,]*\s*pts\b/i.test(text);

    if (
      hasFlightDetails &&
      hasDeparture &&
      hasBookingOptions &&
      hasFlightNumber &&
      hasPoints
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}
function addRoameExpandHints() {
  if (!isRoamePage()) return;

  const possibleExpandButtons = Array.from(
    document.querySelectorAll("div.cursor-pointer")
  ).filter((element) => {
    const svg = element.querySelector(":scope > svg");
    const path = svg?.querySelector("path");

    if (path?.getAttribute("d") !== "M4 6L8 10L12 6") {
      return false;
    }

    const row = findRoameSummaryRow(element);
    return Boolean(row);
  });

  function findRoameCollapseButton(expandedCard) {
  let current = expandedCard;

  for (let level = 0; level < 6 && current; level += 1) {
    const candidates = Array.from(
      current.querySelectorAll("div.cursor-pointer")
    );

    const collapseButton = candidates.find((element) => {
      const svg = element.querySelector(":scope > svg");
      const path = svg?.querySelector("path");

      return (
        path?.getAttribute("d") === "M4 6L8 10L12 6" &&
        element.className.includes("-rotate-180")
      );
    });

    if (collapseButton) return collapseButton;

    current = current.parentElement;
  }

  return null;
}

function closeActiveRoameManualSession() {
  if (!activeRoameManualSession) return;

  const { button, collapseButton } = activeRoameManualSession;

  if (collapseButton && document.body.contains(collapseButton)) {
    collapseButton.click();
  }

  if (button && document.body.contains(button)) {
    button.disabled = false;
    button.textContent = "✦ Analyze with Vantara";
    button.style.cursor = "pointer";
    button.style.filter = "none";
    button.style.transform = "translateY(0)";
  }

  activeRoameManualSession = null;
}

  possibleExpandButtons.forEach((expandButton) => {
    if (expandButton.dataset.vantaraHintReady === "true") return;

    const row = findRoameSummaryRow(expandButton);
    if (!row) return;

    expandButton.dataset.vantaraHintReady = "true";

    Object.assign(expandButton.style, {
      position: "relative",
      borderColor: "rgb(126, 34, 206)",
      boxShadow: "0 0 0 4px rgba(126, 34, 206, 0.16)",
    });

    const hint = document.createElement("span");
    hint.className = "vantara-roame-expand-hint";
    hint.textContent = "Open to analyze";

    Object.assign(hint.style, {
      position: "absolute",
      right: "38px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "rgb(91, 33, 182)",
      background: "rgba(245, 243, 255, 0.96)",
      border: "1px solid rgba(126, 34, 206, 0.28)",
      borderRadius: "999px",
      padding: "5px 9px",
      fontSize: "11px",
      fontWeight: "800",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      boxShadow: "0 6px 18px rgba(88, 28, 135, 0.14)",
    });

    expandButton.appendChild(hint);
  });
}

function findRoameSummaryRow(expandButton) {
  let current = expandButton.parentElement;

  for (let level = 0; level < 9 && current; level += 1) {
    const text = current.innerText || "";

    const pointCount = (
      text.match(/\b\d[\d,]*\s*pts\b/gi) || []
    ).length;

    const timeCount = (
      text.match(
        /\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)/gi
      ) || []
    ).length;

    if (
      pointCount === 1 &&
      timeCount === 1 &&
      /\+\s*\$[\d,.]+/.test(text)
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function extractExpandedRoameAwardForAnalysis(expandedCard) {
  const text = expandedCard.innerText || "";

  const route = extractExpandedRoameRoute(text);
  const times = extractExpandedRoameTimes(text);
  const airlineData = extractExpandedRoameAirlineAndFlight(text);
  const awardPrice = extractRoameAwardPrice(text);
  const stops = extractExpandedRoameStops(text);


  return {
    source: "roame",

    airline: airlineData.airline,
    program: extractRoameProgram(expandedCard, text),

    origin: route.origin,
    destination: route.destination,
    route:
      route.origin && route.destination
        ? `${route.origin} → ${route.destination}`
        : "",

    departureDate: extractExpandedRoameDate(text),
    cabin: extractExpandedRoameCabin(expandedCard),

    miles: awardPrice.miles,
    taxes: awardPrice.taxes,
    cashPrice: "",

    flightNumber: airlineData.flightNumber,

    departureTime: times.departureTime,
    arrivalTime: times.arrivalTime,

    isNonstop: stops.isNonstop,
    stops: stops.label,

    passengers: 1,
    transferBanks: extractRoameTransferBanks(expandedCard),

    rawText: text,
  };
}

function extractExpandedRoameAirlineAndFlight(text) {
  const detailLine = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /\b[A-Z0-9]{2}\d{1,4}\b/.test(line));

  if (!detailLine) {
    return {
      airline: "",
      flightNumber: "",
    };
  }

  const flightMatch = detailLine.match(/\b([A-Z0-9]{2}\d{1,4})\b/);

  return {
    airline: detailLine.split("·")[0]?.trim() || "",
    flightNumber: flightMatch?.[1] || "",
  };
}

function extractExpandedRoameRoute(text) {
  const airportMatches = Array.from(
    text.matchAll(/\(([A-Z]{3})\)/g)
  ).map((match) => match[1]);

  return {
    origin: airportMatches[0] || "",
    destination: airportMatches[airportMatches.length - 1] || "",
  };
}

function extractExpandedRoameTimes(text) {
  const matches = Array.from(
    text.matchAll(/\b(\d{1,2}:\d{2}\s*(?:AM|PM))\b/gi)
  ).map((match) => match[1]);

  return {
    departureTime: matches[0] || "",
    arrivalTime: matches[1] || "",
  };
}

function extractExpandedRoameDate(text) {
  const match = text.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/
  );

  return match ? normalizeDate(match[0]) : "";
}

function extractExpandedRoameStops(text) {
  const travelTimeCount = (
    text.match(/Travel time:/gi) || []
  ).length;

  if (travelTimeCount <= 1) {
    return {
      isNonstop: true,
      label: "Nonstop",
    };
  }

  return {
    isNonstop: false,
    label: `${travelTimeCount - 1} stop${
      travelTimeCount - 1 === 1 ? "" : "s"
    }`,
  };
}

function isPointMePage() {
  return window.location.hostname === "point.me" ||
    window.location.hostname === "www.point.me";
}

function addButtonsToPointMeResults() {
  if (!isPointMePage()) return;

  const resultButtons = Array.from(
    document.querySelectorAll(
      'button[data-testid="flight-search-route-card"], button:has([data-testid="flight-detail-display"])'
    )
  );

  resultButtons.forEach((resultCard) => {
    if (resultCard.dataset.vantaraReady === "true") return;

    if (
      resultCard.parentElement?.querySelector(
        `.${VANTARA_POINT_ME_BUTTON_CLASS}`
      )
    ) {
      resultCard.dataset.vantaraReady = "true";
      return;
    }

    resultCard.dataset.vantaraReady = "true";

    const wrapper = document.createElement("div");

    Object.assign(wrapper.style, {
      display: "flex",
      justifyContent: "flex-end",
      padding: "0 10px 10px",
      marginTop: "-4px",
    });

    const button = document.createElement("button");

    button.type = "button";
    button.className = VANTARA_POINT_ME_BUTTON_CLASS;
    button.textContent = "✦ Analyze with Vantara";

    Object.assign(button.style, {
      height: "36px",
      border: "1px solid rgba(126, 34, 206, 0.75)",
      background:
        "linear-gradient(135deg, rgb(42, 18, 72), rgb(91, 33, 182))",
      color: "white",
      padding: "0 15px",
      borderRadius: "9px",
      fontWeight: "800",
      fontSize: "12px",
      lineHeight: "1",
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 8px 20px rgba(88, 28, 135, 0.22)",
      transition:
        "filter 160ms ease, transform 160ms ease, box-shadow 160ms ease",
    });

    button.addEventListener("mouseenter", () => {
      if (button.disabled) return;

      button.style.filter = "brightness(1.12)";
      button.style.transform = "translateY(-1px)";
      button.style.boxShadow = "0 10px 24px rgba(88, 28, 135, 0.32)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.filter = "none";
      button.style.transform = "translateY(0)";
      button.style.boxShadow = "0 8px 20px rgba(88, 28, 135, 0.22)";
    });

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (button.disabled) return;

      button.disabled = true;
      button.textContent = "✦ Analyzing...";
      button.style.cursor = "wait";

      try {
        const award = extractPointMeAward(resultCard);

        activePointMeButton = button;

openVantaraPanel(award);
await analyzeStructuredAward(award);

if (document.body.contains(button)) {
  button.textContent = "✓ Analysis open";
  button.style.cursor = "default";
}
      } catch (error) {
  console.error("Point.me analysis failed:", error);

  button.disabled = false;
  button.textContent = "✦ Analyze with Vantara";
  button.style.cursor = "pointer";
  button.style.filter = "none";
  button.style.transform = "translateY(0)";

  activePointMeButton = null;
}
    });

    wrapper.appendChild(button);

    resultCard.insertAdjacentElement("afterend", wrapper);
  });
}

function extractPointMeAward(resultCard) {
  const text = resultCard.innerText || "";

  const route = extractPointMeRoute(text);
  const times = extractPointMeTimes(text);
  const airlineAndCabin = extractPointMeAirlineAndCabin(resultCard, text);
  const transferProgram = extractPointMeProgram(resultCard);
  const transferBanks = extractPointMeTransferBanks(resultCard);

  return {
    source: "point.me",

    airline: airlineAndCabin.airline,
    program: transferProgram,

    origin: route.origin,
    destination: route.destination,
    route:
      route.origin && route.destination
        ? `${route.origin} → ${route.destination}`
        : "",

    departureDate: extractPointMeDate(),
    cabin: airlineAndCabin.cabin,

    miles: extractPointMeTransferPrice(text),
    taxes: extractPointMeTaxes(text),
    cashPrice: extractPointMeCashPrice(text),

    flightNumber: "",

    departureTime: times.departureTime,
    arrivalTime: times.arrivalTime,

    isNonstop: /\bnonstop\b/i.test(text),
    stops: extractPointMeStops(text),

    passengers: extractPointMePassengers(),

    transferBanks,
    rawText: text,
  };
}

function resetActivePointMeButton() {
  if (!activePointMeButton) return;

  if (document.body.contains(activePointMeButton)) {
    activePointMeButton.disabled = false;
    activePointMeButton.textContent = "✦ Analyze with Vantara";
    activePointMeButton.style.cursor = "pointer";
    activePointMeButton.style.filter = "none";
    activePointMeButton.style.transform = "translateY(0)";
  }

  activePointMeButton = null;
}

function extractPointMeRoute(text) {
  const match = text.match(/\b([A-Z]{3})\s*(?:→|->|›)\s*([A-Z]{3})\b/);

  if (match) {
    return {
      origin: match[1],
      destination: match[2],
    };
  }

  const codes = text.match(/\b[A-Z]{3}\b/g) || [];

  return {
    origin: codes[0] || "",
    destination: codes[1] || "",
  };
}

function extractPointMeTimes(text) {
  const match = text.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i
  );

  return {
    departureTime: match?.[1] || "",
    arrivalTime: match?.[2] || "",
  };
}

function extractPointMeAirlineAndCabin(resultCard, text) {
  const airlineImage = resultCard.querySelector(
    '[data-testid="flight-detail-display"] img'
  );

  const airline =
    airlineImage?.getAttribute("alt")?.trim() ||
    text.split("\n").find((line) => /JetBlue|United|American|Delta|Alaska/i.test(line)) ||
    "";

  let cabin = "Economy";

  if (/\bPremium Economy\b/i.test(text)) {
    cabin = "Premium Economy";
  } else if (/\bBusiness\b/i.test(text)) {
    cabin = "Business";
  } else if (/\bFirst\b/i.test(text)) {
    cabin = "First";
  } else if (/\bEconomy\b/i.test(text)) {
    cabin = "Economy";
  }

  return {
    airline,
    cabin,
  };
}

function extractPointMeCashPrice(text) {
  const cashMatch = text.match(/\$([\d,.]+)\s*Cash Price/i);

  if (cashMatch) {
    return cashMatch[1].replace(/,/g, "");
  }

  const fallback = text.match(/\$([\d,.]+)/);

  return fallback ? fallback[1].replace(/,/g, "") : "";
}

function extractPointMeTransferPrice(text) {
  const transferMatch = text.match(
    /Transfer Price[\s\S]*?([\d,]+)\s*pts/i
  );

  if (transferMatch) {
    return transferMatch[1].replace(/,/g, "");
  }

  const pointMatches = Array.from(
    text.matchAll(/([\d,]+)\s*pts/gi)
  ).map((match) => Number(match[1].replace(/,/g, "")));

  if (!pointMatches.length) return "";

  return String(Math.min(...pointMatches));
}

function extractPointMeTaxes(text) {
  const match = text.match(/\+\$([\d,.]+)\s*tax(?:es)?/i);

  return match ? match[1].replace(/,/g, "") : "";
}

function extractPointMeProgram(resultCard) {
  const programImage = resultCard.querySelector(
    '[data-cy="programImage"] img'
  );

  return programImage?.getAttribute("alt")?.trim() || "";
}

function extractPointMeTransferBanks(resultCard) {
  const bankImages = Array.from(
    resultCard.querySelectorAll('img[src*="bank-logos"]')
  );

  return [
    ...new Set(
      bankImages
        .map((image) => image.getAttribute("alt")?.trim())
        .filter(Boolean)
        .map(normalizePointMeBankName)
    ),
  ];
}

function normalizePointMeBankName(value) {
  const raw = String(value || "").toLowerCase();

  if (raw.includes("chase")) return "Chase";
  if (raw.includes("american express") || raw.includes("amex")) return "Amex";
  if (raw.includes("capital one")) return "Capital One";
  if (raw.includes("citi")) return "Citi";
  if (raw.includes("bilt")) return "Bilt";
  if (raw.includes("wells fargo")) return "Wells Fargo";

  return value;
}

function extractPointMeStops(text) {
  if (/\bnonstop\b/i.test(text)) return "Nonstop";

  const match = text.match(/\b(\d+)\s*stop(?:s)?\b/i);

  return match ? match[0] : "Unknown";
}

function extractPointMeDate() {
  const url = new URL(window.location.href);

  const rawDate =
    url.searchParams.get("departureDate") ||
    url.searchParams.get("date") ||
    "";

  return normalizeDate(rawDate);
}

function extractPointMePassengers() {
  const url = new URL(window.location.href);
  const passengers = Number(url.searchParams.get("passengers") || 1);

  return Number.isFinite(passengers) && passengers > 0
    ? passengers
    : 1;
}

function isAwardToolPage() {
  return window.location.hostname.includes("awardtool.com");
}

function initializeAwardToolIntegration() {
  if (!isAwardToolPage()) return;

  addAwardToolExpandHints();
  addButtonsToExpandedAwardToolCards();
}

function getAwardToolAccordions() {
  return Array.from(
    document.querySelectorAll(".MuiAccordion-root")
  ).filter((accordion) => {
    const text = accordion.innerText || "";

    return (
      /\b[A-Z]{3}\b/.test(text) &&
      /\b\d+(?:\.\d+)?\s*K\b/i.test(text) &&
      accordion.querySelector(
        'button[aria-label="expand"] [data-testid="ExpandMoreIcon"]'
      )
    );
  });
}

function getAwardToolExpandButton(accordion) {
  return (
    accordion.querySelector(
      'button[aria-label="expand"]:has([data-testid="ExpandMoreIcon"])'
    ) || null
  );
}

function addAwardToolExpandHints() {
  getAwardToolAccordions().forEach((accordion) => {
    const expandButton = getAwardToolExpandButton(accordion);
    if (!expandButton) return;

    if (expandButton.dataset.vantaraHintReady === "true") return;

    expandButton.dataset.vantaraHintReady = "true";
    expandButton.style.position = "relative";
    expandButton.style.border = "1px solid rgba(168, 85, 247, 0.8)";
    expandButton.style.boxShadow =
      "0 0 0 4px rgba(168, 85, 247, 0.14)";
    expandButton.style.borderRadius = "999px";

    const hint = document.createElement("span");

    hint.className = "vantara-awardtool-expand-hint";
    hint.textContent = "Open to analyze";

    Object.assign(hint.style, {
      position: "absolute",
      right: "42px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: "30",
      color: "#6d28d9",
      background: "rgba(250, 245, 255, 0.98)",
      border: "1px solid rgba(126, 34, 206, 0.3)",
      borderRadius: "999px",
      padding: "5px 9px",
      fontSize: "11px",
      fontWeight: "800",
      lineHeight: "1",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      boxShadow: "0 6px 18px rgba(88, 28, 135, 0.14)",
    });

    expandButton.appendChild(hint);
  });
}

function addButtonsToExpandedAwardToolCards() {
  getAwardToolAccordions().forEach((accordion) => {
    const expanded =
      accordion.classList.contains("Mui-expanded") ||
      accordion.querySelector(
        ".MuiCollapse-root.MuiCollapse-entered"
      );

    if (!expanded) return;

    const details = accordion.querySelector(
      ".MuiAccordionDetails-root"
    );

    if (!details) return;

    if (
      details.querySelector(
        `.${VANTARA_AWARDTOOL_BUTTON_CLASS}`
      )
    ) {
      return;
    }

    const buttonRow = document.createElement("div");

    Object.assign(buttonRow.style, {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      marginBottom: "14px",
    });

    const button = document.createElement("button");

    button.type = "button";
    button.className = VANTARA_AWARDTOOL_BUTTON_CLASS;
    button.textContent = "✦ Analyze with Vantara";

    Object.assign(button.style, {
      height: "38px",
      border: "1px solid rgba(192, 132, 252, 0.85)",
      background:
        "linear-gradient(135deg, rgb(42, 18, 72), rgb(91, 33, 182))",
      color: "white",
      padding: "0 16px",
      borderRadius: "9px",
      fontWeight: "800",
      fontSize: "13px",
      lineHeight: "1",
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 8px 22px rgba(88, 28, 135, 0.28)",
      transition:
        "filter 160ms ease, transform 160ms ease, box-shadow 160ms ease",
    });

    button.addEventListener("mouseenter", () => {
      if (button.disabled) return;

      button.style.filter = "brightness(1.12)";
      button.style.transform = "translateY(-1px)";
      button.style.boxShadow =
        "0 10px 26px rgba(88, 28, 135, 0.36)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.filter = "none";
      button.style.transform = "translateY(0)";
      button.style.boxShadow =
        "0 8px 22px rgba(88, 28, 135, 0.28)";
    });

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (button.disabled) return;

      button.disabled = true;
      button.textContent = "✦ Analyzing...";
      button.style.cursor = "wait";

      try {
        const award = extractAwardToolAward(accordion);

        activeAwardToolSession = {
          accordion,
          button,
          expandButton: getAwardToolExpandButton(accordion),
        };

        openVantaraPanel(award);
        await analyzeStructuredAward(award);

        if (document.body.contains(button)) {
          button.textContent = "✓ Analysis open";
          button.style.cursor = "default";
        }
      } catch (error) {
        console.error("AwardTool analysis failed:", error);

        resetAwardToolButton(button);
        activeAwardToolSession = null;
      }
    });

    buttonRow.appendChild(button);
    details.prepend(buttonRow);
  });
}

function extractAwardToolAward(accordion) {
  const text = accordion.innerText || "";

  const details =
    accordion.querySelector(".MuiAccordionDetails-root") ||
    accordion;

  const detailsText = details.innerText || "";

  const route = extractAwardToolRoute(accordion, detailsText);
  const times = extractAwardToolTimes(detailsText);
  const airlineData =
    extractAwardToolAirlineAndFlight(detailsText, accordion);

  const selectedCabin = extractAwardToolCabinAndPrice(accordion);

  return {
    source: "awardtool",

    airline: airlineData.airline,
    program: extractAwardToolProgram(accordion),

    origin: route.origin,
    destination: route.destination,
    route:
      route.origin && route.destination
        ? `${route.origin} → ${route.destination}`
        : "",

    departureDate: extractAwardToolDate(text),
    cabin: selectedCabin.cabin,

    miles: selectedCabin.miles,
    taxes: selectedCabin.taxes,
    cashPrice: "",

    flightNumber: airlineData.flightNumber,

    departureTime: times.departureTime,
    arrivalTime: times.arrivalTime,

    isNonstop: /\bNonstop\b/i.test(text),
    stops: /\bNonstop\b/i.test(text)
      ? "Nonstop"
      : extractAwardToolStops(text),

    passengers: 1,
    transferBanks: extractAwardToolTransferBanks(accordion),

    rawText: text,
  };
}

function extractAwardToolRoute(accordion, detailsText) {
  const ariaCodes = Array.from(
    accordion.querySelectorAll("[aria-label]")
  )
    .map((element) => ({
      label: element.getAttribute("aria-label") || "",
      text: element.textContent?.trim() || "",
    }))
    .filter((item) => /^[A-Z]{3}$/.test(item.text));

  if (ariaCodes.length >= 2) {
    return {
      origin: ariaCodes[0].text,
      destination: ariaCodes[1].text,
    };
  }

  const detailCodes = Array.from(
    detailsText.matchAll(/\(([A-Z]{3})\)/g)
  ).map((match) => match[1]);

  return {
    origin: detailCodes[0] || "",
    destination:
      detailCodes[detailCodes.length - 1] || "",
  };
}

function extractAwardToolTimes(detailsText) {
  const matches = Array.from(
    detailsText.matchAll(
      /\b(\d{1,2}:\d{2}\s*(?:AM|PM)?)\b/gi
    )
  ).map((match) => match[1].replace(/\s+/g, " ").trim());

  return {
    departureTime: matches[0] || "",
    arrivalTime: matches[1] || "",
  };
}

function extractAwardToolAirlineAndFlight(
  detailsText,
  accordion
) {
  const detailLine = detailsText
    .split("\n")
    .map((line) => line.trim())
    .find((line) =>
      /\b[A-Z0-9]{2}\d{1,4}\b/.test(line)
    );

  const flightNumber =
    detailLine?.match(/\b([A-Z0-9]{2}\d{1,4})\b/)?.[1] ||
    "";

  let airline =
    detailLine?.split("·")?.[0]?.trim() || "";

  if (!airline) {
    const airlineLogo = accordion.querySelector(
      'div[aria-label] img[src*="airline_"]'
    );

    airline =
      airlineLogo?.parentElement?.getAttribute("aria-label") ||
      "";
  }

  return {
    airline,
    flightNumber,
  };
}

function extractAwardToolCabinAndPrice(accordion) {
  const pageText = document.body.innerText || "";

  const cabinHeaders = [
    "Economy",
    "Prem Econ",
    "Premium Economy",
    "Business",
    "First",
  ];

  const summary =
    accordion.querySelector(
      ".MuiAccordionSummary-root"
    ) || accordion;

  const priceTexts = Array.from(
    summary.querySelectorAll("p")
  )
    .map((element) => element.textContent?.trim() || "")
    .filter((value) =>
      /^\d+(?:\.\d+)?\s*K$/i.test(value)
    );

  const taxTexts = Array.from(
    summary.querySelectorAll("p")
  )
    .map((element) => element.textContent?.trim() || "")
    .filter((value) => /^\+\s*\$[\d,.]+$/.test(value));

  let cabin = "Economy";

  if (pageText.includes("Business(")) {
    const businessPrice = priceTexts[1];

    if (
      businessPrice &&
      summary.innerText.includes("100% Premium")
    ) {
      // Do not automatically choose business merely because it exists.
      // Default to the lowest visible economy award.
      cabin = "Economy";
    }
  }

  const miles = normalizeAwardToolPoints(
    priceTexts[0] || ""
  );

  const taxes = normalizeMoney(
    taxTexts[0] || ""
  );

  return {
    cabin,
    miles,
    taxes,
  };
}

function normalizeAwardToolPoints(value) {
  const raw = String(value || "")
    .replace(/,/g, "")
    .trim()
    .toLowerCase();

  const kMatch = raw.match(/([\d.]+)\s*k/);

  if (kMatch) {
    return String(
      Math.round(Number(kMatch[1]) * 1000)
    );
  }

  const number = raw.match(/\d+/);

  return number?.[0] || "";
}

function extractAwardToolProgram(accordion) {
  const programImage = accordion.querySelector(
    'img[src*="card_"]'
  );

  const src =
    programImage?.getAttribute("src") || "";

  if (/card_B6/i.test(src)) return "TrueBlue";
  if (/card_UA/i.test(src)) return "MileagePlus";
  if (/card_AA/i.test(src)) return "AAdvantage";
  if (/card_AS/i.test(src)) return "Mileage Plan";
  if (/card_AC/i.test(src)) return "Aeroplan";
  if (/card_BA/i.test(src)) return "Executive Club";
  if (/card_VS/i.test(src)) return "Flying Club";
  if (/card_AF/i.test(src)) return "Flying Blue";

  return "";
}

function extractAwardToolTransferBanks(accordion) {
  const sources = Array.from(
    accordion.querySelectorAll(
      'img[src*="bank_img"]'
    )
  ).map((image) =>
    (image.getAttribute("src") || "").toLowerCase()
  );

  const banks = [];

  if (sources.some((src) => src.includes("amex"))) {
    banks.push("Amex");
  }

  if (sources.some((src) => src.includes("chase"))) {
    banks.push("Chase");
  }

  if (sources.some((src) => src.includes("citi"))) {
    banks.push("Citi");
  }

  if (
    sources.some((src) => src.includes("capital"))
  ) {
    banks.push("Capital One");
  }

  if (sources.some((src) => src.includes("bilt"))) {
    banks.push("Bilt");
  }

  if (
    sources.some((src) => src.includes("wells"))
  ) {
    banks.push("Wells Fargo");
  }

  return banks;
}

function extractAwardToolDate(text) {
  const dateMatch = text.match(
    /\b(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)?\s*(\d{2})\/(\d{2})\b/
  );

  if (!dateMatch) return "";

  const year =
    new URL(window.location.href).searchParams.get(
      "year"
    ) || "2026";

  return `${year}-${dateMatch[1]}-${dateMatch[2]}`;
}

function extractAwardToolStops(text) {
  const match = text.match(/\b(\d+)\s*stop(?:s)?\b/i);

  return match?.[0] || "Unknown";
}

function resetAwardToolButton(button) {
  if (!button || !document.body.contains(button)) return;

  button.disabled = false;
  button.textContent = "✦ Analyze with Vantara";
  button.style.cursor = "pointer";
  button.style.filter = "none";
  button.style.transform = "translateY(0)";
}

function closeActiveAwardToolSession() {
  if (!activeAwardToolSession) return;

  const { button, expandButton } =
    activeAwardToolSession;

  if (
    expandButton &&
    document.body.contains(expandButton) &&
    expandButton.closest(".MuiAccordion-root")
      ?.classList.contains("Mui-expanded")
  ) {
    expandButton.click();
  }

  resetAwardToolButton(button);
  activeAwardToolSession = null;
}

function initializeVantaraForCurrentSite() {
  if (window.location.hostname.includes("seats.aero")) {
    if (typeof addSummaryRowHints === "function") {
      addSummaryRowHints();
    }

    addButtonsToTripCards();
  }

  if (isPointsYeahPage()) {
    addButtonsToPointsYeahCards();
  }

  if (isRoamePage()) {
  addRoameExpandHints();
  addButtonsToExpandedRoameCards();
}

if (isPointMePage()) {
  addButtonsToPointMeResults();
}

if (isAwardToolPage()) {
  initializeAwardToolIntegration();
}
}

initializeVantaraForCurrentSite();

let mutationTimer = null;

const observer = new MutationObserver(() => {
  window.clearTimeout(mutationTimer);

  mutationTimer = window.setTimeout(() => {
    initializeVantaraForCurrentSite();
  }, 150);
});


observer.observe(document.body, {
  childList: true,
  subtree: true,
});