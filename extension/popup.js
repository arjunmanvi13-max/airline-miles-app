const PROGRAM_LABELS = {
  Amex: "Amex Membership Rewards",
  Chase: "Chase Ultimate Rewards",
  "Capital One": "Capital One Miles",
  Bilt: "Bilt Rewards",
  Citi: "Citi ThankYou Points",
  "Wells Fargo": "Wells Fargo Rewards",
};

const cardInput = document.getElementById("card");
const balanceInput = document.getElementById("balance");
const saveWalletButton = document.getElementById("saveWallet");
const walletStatus = document.getElementById("walletStatus");
const walletPreview = document.getElementById("walletPreview");
const walletForm = document.getElementById("walletForm");
const walletList = document.getElementById("walletList");
const editWalletButton = document.getElementById("editWallet");

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
      walletStatus.textContent = "Wallet source saved.";
      balanceInput.value = "";
      walletForm.classList.add("hidden");
      editWalletButton.textContent = "Add";
      renderWallet();
    }
  );
});

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

  walletPreview.textContent = `${savedWalletCards.length} source${
    savedWalletCards.length === 1 ? "" : "s"
  } · ${formatNumber(totalPoints)} total points`;

  walletList.innerHTML = savedWalletCards
    .map(
      (item, index) => `
        <div class="walletRow">
          <div>
            <strong>${PROGRAM_LABELS[item.card] || item.card}</strong>
            <span>${formatNumber(item.balance) || "Balance not entered"}</span>
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

      chrome.storage.local.set(
        {
          walletCards: savedWalletCards,
          wallet: savedWalletCards[0] || null,
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

function formatNumber(value) {
  const number = Number(String(value || "").replace(/,/g, ""));
  if (!number) return "";
  return number.toLocaleString();
}