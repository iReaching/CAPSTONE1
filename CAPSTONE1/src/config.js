const isDev = window.location.port === "5173";

// In dev, PHP runs on Apache at localhost without port. In prod, use the same origin plus Vite base path.
export const BASE_URL = isDev
  ? "http://localhost/vitecap1/CAPSTONE1/php/"
  : `${window.location.origin}${import.meta.env.BASE_URL}php/`;

// GCASH recipient configuration (static)
export const GCASH_RECIPIENT = {
  name: "Chateau Valenzuela Condominium",
  mobile: "09XXXXXXXXX", // replace with the condo's GCASH number
  qrUrl: `${import.meta.env.BASE_URL}assets/gcash-qr.png`, // place an image at public/assets/gcash-qr.png
};

export default BASE_URL;
