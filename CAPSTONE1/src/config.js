const isDev = window.location.port === "5173";

// In dev, PHP runs on Apache at localhost without port. In prod, use the same origin plus Vite base path.
export const BASE_URL = isDev
  ? "http://localhost/vitecap1/CAPSTONE1/php/"
  : `${window.location.origin}${import.meta.env.BASE_URL}php/`;

export default BASE_URL;
