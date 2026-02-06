import * as signalR from "@microsoft/signalr";

const RAW_REQUEST_URL = import.meta.env.VITE_SIGNAL_R_CONNECTION;

export const connectionRef = { current: null };

const playNotificationSound = () => {
  try {
    const audio = new Audio("ms-winsoundevent:Notification.Default");
    audio.play().catch(() => {
      const fallback = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0vBSh+zPDajzsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z24k2Bxdju+zooVARC0yl4fG5ZRwFNo3V7859LwUofsz",
      );
      fallback.play().catch(() => {});
    });
  } catch (err) {
    console.warn("Notification sound error:", err);
  }
};

const showNotification = (title, body, sender) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "chat-reply",
      requireInteraction: false,
      silent: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

export const newConnection = async (
  onReceiveMessage,
  usernameArg,
  userIdArg,
  handleRefresh,
) => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  const userName = usernameArg || sessionStorage.getItem("userName");
  const userId = userIdArg || sessionStorage.getItem("userId") || userName;
  if (!userName) {
    console.error("❌ User username not found for SignalR connection.");
    return null;
  }

  let baseUrl =
    typeof RAW_REQUEST_URL === "string" ? RAW_REQUEST_URL.trim() : "";

  if (!baseUrl) {
    console.error(
      "❌ SignalR hub URL is not configured. Please set VITE_SIGNAL_R_CONNECTION or VITE_SIGNAL_R in your environment.",
    );
    return null;
  }

  const urlWithQuery = `${baseUrl}?username=${encodeURIComponent(userName)}`;

  console.log("🔌 Attempting SignalR connection to:", urlWithQuery);
  console.log("🔌 Base URL from env:", baseUrl);

  // Stop previous connection if exists
  if (connectionRef.current) {
    try {
      // Clear online status interval
      if (connectionRef.current._onlineStatusInterval) {
        clearInterval(connectionRef.current._onlineStatusInterval);
      }
      await connectionRef.current.stop();
      console.log("🛑 Previous SignalR connection stopped.");
    } catch (err) {
      console.error("Error stopping previous SignalR connection:", err);
    }
  }

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(urlWithQuery, {
      skipNegotiation: false,
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 0, 1000, 3000, 5000, 10000])
    .build();

  connectionRef.current = connection;

  try {
    await connection.start();
    console.log("✅ SignalR Connected (Chatbot) to:", urlWithQuery);

    // 🔔 Broadcast online status immediately after connection
    try {
      // Try with parameters first
      await connection.invoke("NotifyUserOnline", {
        userId,
        userName,
        status: "Online",
      });
      console.log("📡 Broadcasted online status via NotifyUserOnline", {
        userId,
        userName,
        status: "Online",
      });
    } catch (notifyErr) {
      try {
        // Fallback: try without parameters
        await connection.invoke("NotifyUserOnline");
        console.log(
          "📡 Broadcasted online status via NotifyUserOnline (no params)",
        );
      } catch (fallbackErr) {
        console.warn("⚠️ Failed to notify online status:", fallbackErr.message);
      }
    }

    // 🔔 Continuously broadcast online status every 10 seconds
    const onlineStatusInterval = setInterval(async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Connected) {
          try {
            await connection.invoke("NotifyUserOnline", {
              userId,
              userName,
              status: "Online",
            });
            console.log("📡 Periodic online status broadcast", {
              userId,
              userName,
              status: "Online",
            });
          } catch (paramErr) {
            await connection.invoke("NotifyUserOnline");
            console.log("📡 Periodic online status broadcast (no params)");
          }
        }
      } catch (err) {
        console.warn(
          "⚠️ Failed periodic online status broadcast:",
          err.message,
        );
      }
    }, 10000);

    connection._onlineStatusInterval = onlineStatusInterval;

    // Listen for new single messages
    connection.on("ReceiveNewMessage", (messageDto) => {
      try {
        console.log("📩 Received new message:", messageDto);
        onReceiveMessage && onReceiveMessage(messageDto);
        handleRefresh && handleRefresh();
      } catch (cbErr) {
        console.error("Error in ReceiveNewMessage callback:", cbErr);
      }
    });

    connection.on("MessagesRead", ({ reader, at }) => {
      console.log("Read receipt received from:", reader, at);
    });

    // Listen for message updates
    connection.on("ReplyToFileMessage", (messageDto) => {
      try {
        console.log("🔄 Received message update:", messageDto);
        onReceiveMessage && onReceiveMessage(messageDto);
      } catch (cbErr) {
        console.error("Error in ReplyToFileMessage callback:", cbErr);
      }
    });

    connection.on("ReceiveMessageList", (messages) => {
      try {
        console.log("📜 Received message list:", messages);
        onReceiveMessage && onReceiveMessage(messages, { isList: true });
      } catch (cbErr) {
        console.error("Error in ReceiveMessageList callback:", cbErr);
      }
    });

    connection.on("ReceiveReply", (reply) => {
      try {
        console.log("📜 Received message history:", reply);
        onReceiveMessage && onReceiveMessage(reply, { isReply: false });
        handleRefresh && handleRefresh();
      } catch (cbErr) {
        console.error("Error in ReceiveMessageHistory callback:", cbErr);
      }
    });

    // Lawyer reply handler
    connection.on("ReceiveNewReply", (reply) => {
      try {
        console.log("📩 Received reply:", reply);
        console.log("[DEBUG] About to call onReceiveMessage with reply");
        playNotificationSound();
        const sender = reply.sender || reply.userName || "Lawyer";
        const message = reply.message || reply.text || "You have a new reply";
        showNotification(sender, message, sender);
        onReceiveMessage && onReceiveMessage(reply, { isReply: true });
        handleRefresh && handleRefresh();
        console.log("[DEBUG] Called onReceiveMessage with reply");
      } catch (cbErr) {
        console.error("Error in ReceiveReply callback:", cbErr);
      }
    });

    // Auto-message handler
    connection.on("ReceiveAutoMessage", (autoMessage) => {
      try {
        console.log("🤖 Received auto-message:", autoMessage);
        onReceiveMessage &&
          onReceiveMessage(autoMessage, { isAutoMessage: true });
      } catch (cbErr) {
        console.error("Error in ReceiveAutoMessage callback:", cbErr);
      }
    });

    connection.on("OverrideAutoMessage", (overrideData) => {
      try {
        console.log("🔄 Override auto-message:", overrideData);
        onReceiveMessage &&
          onReceiveMessage(overrideData, { isOverride: true });
      } catch (cbErr) {
        console.error("Error in OverrideAutoMessage callback:", cbErr);
      }
    });

    // User status change handler (case variations)
    connection.on("UserStatusChanged", (statusData) => {
      try {
        console.log("🟢 User status changed:", statusData);
      } catch (cbErr) {
        console.error("Error in UserStatusChanged callback:", cbErr);
      }
    });



    // Message list handler (case variations)
    connection.on("receivemessagelist", (messages) => {
      try {
        console.log("📜 Received message list (lowercase):", messages);
        onReceiveMessage && onReceiveMessage(messages, { isList: true });
      } catch (cbErr) {
        console.error("Error in receivemessagelist callback:", cbErr);
      }
    });

    // Generic message handler for any other message types
    connection.on("ReceiveMessage", (messageDto) => {
      try {
        console.log("📨 Received generic message:", messageDto);
        onReceiveMessage && onReceiveMessage(messageDto);
        handleRefresh && handleRefresh();
      } catch (cbErr) {
        console.error("Error in ReceiveMessage callback:", cbErr);
      }
    });

    return connection;
  } catch (err) {
    console.error("❌ SignalR Connection Error (Chatbot): ", err);
    connectionRef.current = null;
    throw err;
  }
};

export const sendQueryToLawyers = async (methodName, messageDto) => {
  if (
    connectionRef.current &&
    connectionRef.current.state === signalR.HubConnectionState.Connected
  ) {
    try {
      await connectionRef.current.invoke(methodName, messageDto);
      console.log(`📤 Sent via SignalR (${methodName}):`, messageDto);
      return true;
    } catch (e) {
      console.error(`❌ Error invoking ${methodName}:`, e);
      throw e;
    }
  } else {
    console.warn("⚠️ SignalR connection not active. Cannot send message.");
    throw new Error("SignalR connection not active.");
  }
};

export const sendAudioQueryToLawyers = async (messageDto) => {
  if (
    !connectionRef.current ||
    connectionRef.current.state !== signalR.HubConnectionState.Connected
  ) {
    throw new Error("⚠️ [Chatbot] SignalR not connected.");
  }

  try {
    await connectionRef.current.invoke("SendMessage", messageDto);
    console.log("📤 [Chatbot] Sent audio query:", messageDto);
    return true;
  } catch (e) {
    console.error("❌ [Chatbot] Error sending audio query:", e);
    throw e;
  }
};

export const sendFileQueryToLawyers = async (messageDto) => {
  if (
    !connectionRef.current ||
    connectionRef.current.state !== signalR.HubConnectionState.Connected
  ) {
    throw new Error("⚠️ [Chatbot] SignalR not connected.");
  }

  try {
    await connectionRef.current.invoke("SendMessage", messageDto);
    console.log("📤 [Chatbot] Sent File query:", messageDto);
    return true;
  } catch (e) {
    console.error("❌ [Chatbot] Error sending File query:", e);
    throw e;
  }
};
