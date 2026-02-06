// import { fetchChatHistory } from "/";

// let intervalId = null;
// let subscribers = [];

// // Start polling globally
// export const startGlobalChatPolling = (username, page = 1, size = 40) => {
//   if (intervalId) return; // already running

//   const loadHistory = async () => {
//     try {
//       const history = await fetchChatHistory(username, page, size);
//       // notify all subscribers
//       subscribers.forEach((cb) => cb(history));
//     } catch (err) {
//       console.error("Polling error:", err);
//     }
//   };

//   // first fetch immediately
//   loadHistory();

//   // poll every 5s
//   intervalId = setInterval(loadHistory, 5000);
// };

// // Stop polling
// export const stopGlobalChatPolling = () => {
//   if (intervalId) {
//     clearInterval(intervalId);
//     intervalId = null;
//   }
// };

// // Subscribe to updates
// export const subscribeToChatHistory = (callback) => {
//   subscribers.push(callback);
//   return () => {
//     subscribers = subscribers.filter((cb) => cb !== callback);
//   };
// };


import { fetchChatHistory } from "fetchChatHistory";

let intervalId = null
let subscribers = [];

/**
 * Starts global polling of chat history every 5 seconds.
 * @param {string} username - The username whose history to fetch.
 * @param {number} page - Page number (default 1).
 * @param {number} size - Page size (default 40).
 */
export const startGlobalChatPolling = (username, page = 1, size = 40) => {
  if (intervalId) return; // Already running

  const loadHistory = async () => {
    try {
      const history = await fetchChatHistory(username, page, size);
      // Notify all subscribers with latest history
      subscribers.forEach((cb) => cb(history));
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  // Fetch immediately
  loadHistory();

  // Poll every 5 seconds
  intervalId = setInterval(loadHistory, 5000);
};

/**
 * Stops global polling.
 */
export const stopGlobalChatPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

/**
 * Subscribe to chat history updates.
 * Returns unsubscribe function.
 */
export const subscribeToChatHistory = (callback) => {
  subscribers.push(callback);

  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback);
  };
};

