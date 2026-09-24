// Ścieżka: src/services/analytics.ts
import ReactGA from "react-ga4";

const MEASUREMENT_ID: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
  if (MEASUREMENT_ID) {
    ReactGA.initialize(MEASUREMENT_ID);
    console.log("Analityka GA4 zainicjalizowana.");
  } else {
    console.warn("Brak identyfikatora GA4. Zdarzenia nie będą wysyłane.");
  }
};

export const trackEvent = (category: string, action: string, label?: string | null, value?: number | null) => {
  if (MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label: label ?? undefined,
      value: value ?? undefined,
    });
  }
};
