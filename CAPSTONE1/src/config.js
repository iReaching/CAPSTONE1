const isDev = window.location.port === "5173";
const ensureTrailingSlash = (value) =>
  value.endsWith("/") ? value : `${value}/`;

const customPhpBase = import.meta.env.VITE_PHP_BASE_URL;

// In dev, PHP runs on Apache at localhost without port. In prod, use the same origin plus Vite base path.
export const BASE_URL = customPhpBase
  ? ensureTrailingSlash(customPhpBase)
  : isDev
    ? "http://localhost/vitecap1/CAPSTONE1/php/"
    : `${window.location.origin}${import.meta.env.BASE_URL}php/`;

// GCASH recipient configuration (static)
export const GCASH_RECIPIENT = {
  name: "Chateau Valenzuela Condominium",
  mobile: "09XXXXXXXXX", // replace with the condo's GCASH number
  qrUrl: `${import.meta.env.BASE_URL}assets/gcash-qr.png`, // place an image at public/assets/gcash-qr.png
};

// GCASH payment integration mode
// mock: legacy internal simulator
// gcash_sandbox: call the official GCash sandbox API via the new PHP endpoints
export const GCASH_PAYMENT_MODE =
  import.meta.env.VITE_GCASH_PAYMENT_MODE || "mock";

// Backend endpoints for the sandbox integration
export const GCASH_CHECKOUT_ENDPOINT =
  import.meta.env.VITE_GCASH_CHECKOUT_ENDPOINT ||
  `${BASE_URL}create_gcash_checkout.php`;
export const GCASH_STATUS_ENDPOINT =
  import.meta.env.VITE_GCASH_STATUS_ENDPOINT ||
  `${BASE_URL}gcash_transaction_status.php`;


export default BASE_URL;
