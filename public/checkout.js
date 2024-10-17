// Hyper SDK initialization with the publishable key
const hyper = Hyper("pk_snd_3b33cd9404234113804aa1accaabe22f");

let globalClient = "";
let paymentSession = "";

// Initialize payment and set up event listeners
initializePayment();
addEventListeners();
checkStatus();

// Initialize the payment session and elements
async function initializePayment() {
  const clientSecret = await fetchClientSecret();
  globalClient = clientSecret;
  paymentSession = hyper.initPaymentSession({
    clientSecret: globalClient,
  });
}

// Fetch client secret from backend API
async function fetchClientSecret() {
  const response = await fetch("/create-payment-intent", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const { clientSecret } = await response.json();
  return clientSecret;
}

// Event listeners for form submission and button clicks
function addEventListeners() {
  document
    .querySelector("#show-last-used-button")
    .addEventListener("click", () =>
      handleButtonClick(showLastUsedPaymentMethod, "#show-last-used-spinner")
    );

  document
    .querySelector("#confirm-last-payment-button")
    .addEventListener("click", () =>
      handleButtonClick(confirmLastUsedPayment, "#confirm-last-payment-spinner")
    );
}

// Function to handle button click with loader
async function handleButtonClick(fn, spinnerSelector) {
  showLoader(spinnerSelector);
  await fn().finally(() => {
    hideLoader(spinnerSelector);
  });
}

// Show loader
function showLoader(selector) {
  console.log("show", selector);
  document.querySelector(selector).style.display = "inline-block";
}

// Hide loader
function hideLoader(selector) {
  console.log("hide", selector);
  document.querySelector(selector).style.display = "none";
}

// Show last used payment method
async function showLastUsedPaymentMethod() {
  const customerLastUsedPayment = await getCustomerLastUsedPaymentMethod();
  displayJSON("#payment-method-data", customerLastUsedPayment);
}

// Get the customer's last used payment method
async function getCustomerLastUsedPaymentMethod() {
  const paymentMethodSession =
    await paymentSession.getCustomerSavedPaymentMethods();
  return paymentMethodSession.getCustomerLastUsedPaymentMethodData();
}

// Display JSON data in a pre-formatted block
function displayJSON(selector, data) {
  const formattedJson = JSON.stringify(data, null, 4);
  document.querySelector(selector).innerHTML = `<pre>${escapeHTML(
    formattedJson
  )}</pre>`;
}

// Escape HTML entities to prevent HTML injection
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Confirm payment using the last used method
async function confirmLastUsedPayment() {
  const paymentMethodSession =
    await paymentSession.getCustomerSavedPaymentMethods();

  const { error, status } =
    await paymentMethodSession.confirmWithLastUsedPaymentMethod({
      confirmParams: { return_url: "http://localhost:4242/checkout.html" },
      redirect: "always",
    });

  handlePaymentConfirmation(error, status);
}

// Handle the result of the payment confirmation
function handlePaymentConfirmation(error, status) {
  if (error) {
    showMessage(error.message || "An unexpected error occurred.");
  } else if (status) {
    showMessage("Payment status: " + status);
  }
}

// Check the status of a payment intent
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );
  if (!clientSecret) return;

  globalClient = clientSecret;
  paymentSession = await hyper.initPaymentSession({
    clientSecret: globalClient,
  });
  const { paymentIntent } = await hyper.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// Display a message for a short duration
function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");
  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(() => {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}
