// Ścieżka: src/services/analytics.js
import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
  if (MEASUREMENT_ID) {
    ReactGA.initialize(MEASUREMENT_ID);
    console.log("Analityka GA4 zainicjalizowana.");
  } else {
    console.warn("Brak identyfikatora GA4. Zdarzenia nie będą wysyłane.");
  }
};

export const trackEvent = (category, action, label = null, value = null) => {
  if (MEASUREMENT_ID) {
    ReactGA.event({
      category: category,
      action: action,
      label: label,
      value: value,
    });
  }
};