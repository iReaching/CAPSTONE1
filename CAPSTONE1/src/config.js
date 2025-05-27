const isLocalhost = window.location.hostname === "localhost" || window.location.port === "5173";

export const BASE_URL = isLocalhost
  ? "http://localhost/vitecap1/capstone1/php/"     // for dev
  : `${window.location.origin}/capstone1/php/`; // for live

  export default BASE_URL;