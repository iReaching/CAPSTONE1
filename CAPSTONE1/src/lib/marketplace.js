const STRUCTURE_VERSION = "v1";

export function buildMarketplaceDescription({
  overview = "",
  purchaseInstructions = "",
  purchaseLocation = "",
  contactInfo = "",
  pickupWindow = "",
  pickupDate = ""
} = {}) {
  const payload = {
    version: STRUCTURE_VERSION,
    overview: overview.trim(),
    purchaseInstructions: purchaseInstructions.trim(),
    purchaseLocation: purchaseLocation.trim(),
    contactInfo: contactInfo.trim(),
    pickupWindow: pickupWindow.trim(),
    pickupDate: pickupDate
      ? (() => {
          try {
            return new Date(pickupDate).toISOString();
          } catch {
            return String(pickupDate).trim();
          }
        })()
      : ""
  };

  return JSON.stringify(payload);
}

export function parseMarketplaceDescription(raw) {
  if (raw == null) {
    return {
      overview: "",
      purchaseInstructions: "",
      purchaseLocation: "",
      contactInfo: "",
      pickupWindow: "",
      pickupDate: "",
      raw: "",
      structured: false
    };
  }

  const parseObject = (value, original) => ({
    overview: (value.overview || value.description || "").trim(),
    purchaseInstructions: (value.purchaseInstructions || value.howToBuy || "").trim(),
    purchaseLocation: (value.purchaseLocation || value.whereToBuy || value.location || "").trim(),
    contactInfo: (value.contactInfo || value.contact || value.contactDetails || "").trim(),
    pickupWindow: (value.pickupWindow || value.pickupSchedule || "").trim(),
    pickupDate: (value.pickupDate || value.preferredSchedule || "").trim(),
    raw: original,
    structured: true
  });

  if (typeof raw === "object") {
    return parseObject(raw, raw);
  }

  const stringValue = typeof raw === "string" ? raw : String(raw);

  try {
    const parsed = JSON.parse(stringValue);
    if (parsed && typeof parsed === "object") {
      return parseObject(parsed, stringValue);
    }
  } catch (error) {
    // Treat as plain text below.
  }

  return {
    overview: stringValue,
    purchaseInstructions: "",
    purchaseLocation: "",
    contactInfo: "",
    pickupWindow: "",
    pickupDate: "",
    raw: stringValue,
    structured: false
  };
}
