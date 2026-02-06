// ⚠️ DEPRECATED: Credential storage is disabled for security
// Credentials should NEVER be stored on the client
// This module is kept for compatibility but now uses empty storage

const KEY = "userCredentials";

export function setCredentials(credentials) {
  // ⚠️ SECURITY: Do not store credentials
  console.warn(
    "⚠️ setCredentials is deprecated. Credentials should not be stored on the client.",
  );
  return false;
}

export function getCredentials() {
  // ⚠️ SECURITY: Credentials are not stored
  console.warn(
    "⚠️ getCredentials is deprecated. Credentials should not be stored on the client.",
  );
  return null;
}

export function clearCredentials() {
  // Clear any legacy stored credentials
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    return true;
  } catch (e) {
    console.warn("clearCredentials failed:", e);
    return false;
  }
}
