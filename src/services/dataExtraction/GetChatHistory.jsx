import axios from "axios";
export const fetchChatHistory = async (username, page = 1, size = 40) => {
  const GET_CHAT_HISTORY_REQUEST_URL = import.meta.env.VITE_CHAT_HISTORY;

  try {
    const response = await axios.get(
      `${GET_CHAT_HISTORY_REQUEST_URL}/${username}?page=${page}&size=${size}`,
      {
        headers: { accept: "*/*" },
      }
    );

    if (response.data?.statusCode === 200) {
      return processChatMessages(response.data.data, username);
    }
    throw new Error("Invalid response structure");
  } catch (error) {
    console.error("Failed to fetch chat history:", error);

    return [
      {
        id: "default-welcome",
        text: "Welcome! Start your conversation here.",
        sender: "System",
        isUser: false,
        time: new Date().toISOString(),
        hasAttachment: false,
        status: "sent",
      },
    ];
  }
};

const getReplyAttachmentData = (item) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://nbsdevtest:83";
  // File attachment
  if (item.replyFileName && item.replyFileUrl && item.replyContentType) {
    const url = item.replyFileUrl.startsWith("/")
      ? `${baseUrl}${item.replyFileUrl}`
      : item.replyFileUrl;
    return {
      name: item.replyFileName,
      url,
      type: item.replyContentType,
      icon: getFileIcon(item.replyContentType),
      isImage: item.replyContentType.startsWith("image"),
      isAudio: item.replyContentType.startsWith("audio"),
      isDocument:
        !item.replyContentType.startsWith("image") &&
        !item.replyContentType.startsWith("audio"),
    };
  }
  // Audio attachment (if present)
  if (item.audioUrl && item.audioContentType) {
    const url = item.audioUrl.startsWith("/")
      ? `${baseUrl}${item.audioUrl}`
      : item.audioUrl;
    return {
      name: item.audioUrl.split("/").pop(),
      url,
      type: item.audioContentType,
      icon: getFileIcon(item.audioContentType),
      isImage: false,
      isAudio: true,
      isDocument: false,
    };
  }
  return null;
};

const processChatMessages = (data, currentUsername) => {
  if (!data?.items || !Array.isArray(data.items)) return [];

  return data.items.flatMap((item) => {
    const isCurrentUser = item.username === currentUsername;
    const baseMessage = {
      id: item.id,
      text: item.messageContent || "",
      sender: {
        id: item.senderId,
        name: isCurrentUser ? "You" : item.senderName,
        username: item.username,
      },
      receiver: {
        id: item.receiverId,
        name: item.receiverName,
      },
      isCurrentUser,
      time: item.createdAt,
      formattedTime: formatTime(item.createdAt),
      formattedDate: formatDate(item.createdAt),
      hasAttachment: !!item.fileName,
      attachment: getAttachmentData(item),
      status: getStatus(item.status),
      isRead: item.isRead,
      readAt: item.readAt,
      meta: { unreadCount: item.unreadCount || 0, raw: item },
    };

    const replyMessage =
      item.reply || item.replyFileName || item.audioUrl
        ? {
            id: `${item.id}-reply`,
            text: item.reply,
            sender: {
              id: item.replierId,
              name: item.replierName,
            },
            receiver: {
              id: item.senderId,
              name: item.senderName,
            },
            isCurrentUser: false,
            time: item.replyAt,
            formattedTime: formatTime(item.replyAt),
            formattedDate: formatDate(item.replyAt),
            hasAttachment: !!item.replyFileName || !!item.audioUrl,
            attachment: getReplyAttachmentData(item),
            status: "sent",
            isRead: true,
            readAt: item.replyAt,
            meta: { replyTo: item.id },
          }
        : null;
    if (replyMessage) {
      baseMessage.reply = replyMessage;
    }

    return [baseMessage];
  });
};

const getAttachmentData = (item) => {
  if (!item.fileName) return null;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://nbsdevtest:83";
  const url = item.fileUrl?.startsWith("/")
    ? `${baseUrl}${item.fileUrl}`
    : item.fileUrl;

  return {
    name: item.fileName,
    url,
    type: item.contentType,
    icon: getFileIcon(item.contentType),
    isImage: item.contentType?.startsWith("image"),
    isAudio: item.contentType?.startsWith("audio"),
    isDocument:
      !item.contentType?.startsWith("image") &&
      !item.contentType?.startsWith("audio"),
  };
};

const getStatus = (status) => {
  const statusMap = {
    0: "pending",
    1: "sent",
    2: "delivered",
    3: "read",
  };
  return statusMap[status] || "unknown";
};

const formatTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString();
  } catch {
    return "";
  }
};

const getFileIcon = (contentType) => {
  const icons = {
    image: "🖼️",
    audio: "🔊",
    "application/pdf": "📄",
    "application/msword": "📝",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "📝",
    default: "📎",
  };

  if (!contentType) return icons.default;
  if (contentType.startsWith("image")) return icons.image;
  if (contentType.startsWith("audio")) return icons.audio;
  return icons[contentType] || icons.default;
};

export default {
  fetchChatHistory,
  processChatMessages,
};
