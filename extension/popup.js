const PROGRAM_LABELS = {
  Amex: "Amex Membership Rewards",
  Chase: "Chase Ultimate Rewards",
  "Capital One": "Capital One Miles",
  Bilt: "Bilt Rewards",
  Citi: "Citi ThankYou Points",
  "Wells Fargo": "Wells Fargo Rewards",
};

const programInput = document.getElementById("card");
const balanceInput = document.getElementById("balance");
const saveWalletButton = document.getElementById("saveWallet");
const walletStatus = document.getElementById("walletStatus");
const walletPreview = document.getElementById("walletPreview");
const walletForm = document.getElementById("walletForm");
const walletList = document.getElementById("walletList");
const editWalletButton = document.getElementById("editWallet");

let savedWalletPrograms = [];

chrome.storage.local.get(["wallet", "walletCards"], (data) => {
  if (Array.isArray(data.walletCards)) {
    savedWalletPrograms = data.walletCards;
  } else if (data.wallet?.card) {
    savedWalletPrograms = [data.wallet];
  } else {
    savedWalletPrograms = [];
  }

  renderWallet();
});

editWalletButton.addEventListener("click", () => {
  const isCurrentlyHidden = walletForm.classList.contains("hidden");

  if (isCurrentlyHidden) {
    walletForm.classList.remove("hidden");
    editWalletButton.textContent = "Hide";
    walletStatus.textContent = "";
    return;
  }

  walletForm.classList.add("hidden");
  editWalletButton.textContent = "Add program";
  walletStatus.textContent = "";
});

saveWalletButton.addEventListener("click", () => {
  const walletProgram = {
    card: programInput.value,
    balance: balanceInput.value.trim(),
  };

  savedWalletPrograms = [
    ...savedWalletPrograms.filter(
      (item) => item.card !== walletProgram.card
    ),
    walletProgram,
  ];

  chrome.storage.local.set(
    {
      walletCards: savedWalletPrograms,

      // Preserve this value for compatibility with any existing analysis
      // logic that still reads the older single-wallet storage field.
      wallet: walletProgram,
    },
    () => {
      walletStatus.textContent = "Program added to your wallet.";
      balanceInput.value = "";

      renderWallet();
    }
  );
});

function renderWallet() {
  if (!savedWalletPrograms.length) {
    walletPreview.textContent = "No programs added yet";
    walletList.innerHTML = "";

    walletForm.classList.remove("hidden");
    editWalletButton.textContent = "Hide";

    return;
  }

  const totalPoints = savedWalletPrograms.reduce((sum, item) => {
    return sum + parsePointsBalance(item.balance);
  }, 0);

  const programCount = savedWalletPrograms.length;
  const programLabel = programCount === 1 ? "program" : "programs";

  if (totalPoints > 0) {
    walletPreview.textContent =
      `${programCount} ${programLabel} · ` +
      `${totalPoints.toLocaleString()} total points`;
  } else {
    walletPreview.textContent = `${programCount} ${programLabel} added`;
  }

  walletList.innerHTML = savedWalletPrograms
    .map((item, index) => {
      const formattedBalance = formatNumber(item.balance);

      return `
        <div class="walletRow">
          <div>
            <strong>${PROGRAM_LABELS[item.card] || item.card}</strong>
            <span>
              ${
                formattedBalance
                  ? `${formattedBalance} points`
                  : "Balance not entered"
              }
            </span>
          </div>

          <button
            class="removeWalletCard"
            data-index="${index}"
            type="button"
            aria-label="Remove ${PROGRAM_LABELS[item.card] || item.card}"
          >
            Remove
          </button>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".removeWalletCard").forEach((button) => {
    button.addEventListener("click", () => {
      const indexToRemove = Number(button.dataset.index);

      savedWalletPrograms = savedWalletPrograms.filter(
        (_, index) => index !== indexToRemove
      );

      chrome.storage.local.set(
        {
          walletCards: savedWalletPrograms,
          wallet: savedWalletPrograms[0] || null,
        },
        () => {
          walletStatus.textContent = "";
          renderWallet();
        }
      );
    });
  });

  walletForm.classList.add("hidden");
  editWalletButton.textContent = "Add program";
}

function parsePointsBalance(value) {
  const normalizedValue = String(value || "").replace(/,/g, "").trim();
  const number = Number(normalizedValue);

  return Number.isFinite(number) && number > 0 ? number : 0;
}

function formatNumber(value) {
  const number = parsePointsBalance(value);

  if (!number) {
    return "";
  }

  return number.toLocaleString();
}