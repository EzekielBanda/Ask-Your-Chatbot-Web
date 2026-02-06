import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register Service Worker for PWA (if available)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/nbs-legal-chatbot/service-worker.js", { scope: "/nbs-legal-chatbot/" })
      .then((reg) => {
        console.log("Service worker registered.", reg);

        // Check for updates periodically
        setInterval(() => {
          reg.update().catch((err) => {
            console.warn("Service worker update check failed:", err);
          });
        }, 60000); // Check every minute
      })
      .catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
  });

  // Handle service worker updates
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("Service worker controller changed, app updated.");
    // Optionally reload the page to get the latest version
    window.location.reload();
  });
}
