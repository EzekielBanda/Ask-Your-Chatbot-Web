import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ConversationSidebar from "./ConversationSidebar";
import FileViewer from "./FileViewer";
import { newConnection } from "../services/chat/ConnectToSignalR";
import { sendTextMessage } from "../services/chat/SendTextMessage";

const CATEGORY_OPTIONS = [
  { id: 1, label: "Litigation (Court)", icon: "⚖️" },
  { id: 2, label: "Legal Advisory", icon: "📋" },
  { id: 3, label: "Legal Documentation", icon: "📄" },
  { id: 4, label: "Recoveries", icon: "💰" },
];

const TeamsLayout = ({ userData, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [displayedMessageCount, setDisplayedMessageCount] = useState(10);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);

  const [activeConversation, setActiveConversation] = useState(1);
  const [isViewingFile, setIsViewingFile] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({ label: "" }); // Will be set from first conversation
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [connection, setConnection] = useState(null);
  const messagesEndRef = useRef(null);
  const conversationsRef = useRef([]);
  const activeConversationRef = useRef(1);
  const selectedCategoryRef = useRef({ label: "" });

  // Mock user data
  const currentUser = userData || {
    userName: "You",
    userId: "user-123",
    avatar: "U",
    status: "active",
  };

  // Ensure userId exists
  if (!currentUser.userId) {
    currentUser.userId = currentUser.userName || "user-123";
  }

  const scrollToBottom = useCallback(() => {
    if (!isViewingFile) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [isViewingFile]);

  // Log user data once on mount
  useEffect(() => {
    console.log("Current user data:", currentUser);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load conversations and messages when user accesses the app
  useEffect(() => {
    const loadConversationsAndMessages = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/chat/history/${
            currentUser.userName
          }?page=1&size=100&_t=${Date.now()}`,
          {
            headers: { "Cache-Control": "no-cache" },
          },
        );
        const data = await response.json();
        const allMessages = data?.data?.items || [];
        console.log("API Response:", data);
        console.log("All messages:", allMessages);

        // Get unique categories from messages that have content
        const categories = [
          ...new Set(
            allMessages
              .filter((msg) => msg.queryCategory && msg.messageContent)
              .map((msg) => msg.queryCategory),
          ),
        ];
        console.log("Categories found:", categories);

        // Only create conversations for categories that have messages
        const generatedConversations = categories.map((category, index) => ({
          id: index + 1,
          title: category,
          category: category,
          unread: 0,
          timestamp: new Date().toISOString(),
          participants: ["You", "Legal Assistant"],
          isActive: index === 0, // First conversation is always active
        }));

        setConversations(generatedConversations);
        conversationsRef.current = generatedConversations;

        // Always set the first conversation as active (default)
        if (generatedConversations.length > 0) {
          const firstConversation = generatedConversations[0];
          setActiveConversation(firstConversation.id);
          activeConversationRef.current = firstConversation.id;
          setSelectedCategory({ label: firstConversation.category });
          selectedCategoryRef.current = { label: firstConversation.category };

          // Filter and format messages for the first conversation (show latest 10 user messages and their replies)
          const categoryMessages = allMessages.filter(
            (msg) =>
              msg.queryCategory === firstConversation.category &&
              msg.messageContent,
          );
          
          // Get latest 10 user messages (each user message may have a reply)
          const latestUserMessages = categoryMessages.slice(-10);
          console.log(
            "Category messages for",
            firstConversation.category,
            ":",
            categoryMessages,
          );

          if (latestUserMessages.length > 0) {
            const formattedMessages = [];
            console.log("Processing", latestUserMessages.length, "user messages");

            latestUserMessages.forEach((msg) => {
              // Add the user's message
              if (msg.messageContent) {
                formattedMessages.push({
                  id: msg.id || generateUniqueId(),
                  text: msg.messageContent,
                  sender: msg.senderName || "User",
                  senderAvatar: "U",
                  isUser: true,
                  time: msg.createdAt || new Date().toISOString(),
                  hasAttachment: !!msg.fileUrl,
                  attachment: msg.fileUrl
                    ? {
                        url: msg.fileUrl,
                        name: msg.fileName || "file",
                        type: msg.contentType || "",
                      }
                    : null,
                  status: "delivered",
                  isRead: msg.isRead,
                  readAt: msg.readAt,
                });
              }

              // Add the lawyer's reply if it exists
              if (msg.reply) {
                const replyTime = new Date(msg.replyAt);
                replyTime.setHours(replyTime.getHours());
                formattedMessages.push({
                  id: `${msg.id}-reply` || generateUniqueId(),
                  text: msg.reply,
                  sender: msg.replierName || "Legal Assistant",
                  senderAvatar: "LA",
                  isUser: false,
                  time: replyTime.toISOString(),
                  hasAttachment: !!msg.replyFileUrl,
                  attachment: msg.replyFileUrl
                    ? {
                        url: msg.replyFileUrl,
                        name: msg.replyFileName || "file",
                        type: msg.replyContentType || "",
                      }
                    : null,
                  status: "delivered",
                });
              }
            });

            // Sort messages by time and store all messages for this category
            const sortedMessages = formattedMessages.sort(
              (a, b) => new Date(a.time) - new Date(b.time),
            );
            setAllMessages(sortedMessages);
            setMessages(sortedMessages.slice(-displayedMessageCount));
            
            // Scroll to bottom to show latest messages
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            }, 100);
          }
        } else {
          // No conversations with messages, show default welcome
          setMessages([
            {
              id: generateUniqueId(),
              text: "Welcome! Start a new conversation by clicking the + button above.",
              sender: "Legal Assistant",
              senderAvatar: "LA",
              isUser: false,
              time: new Date().toISOString(),
              hasAttachment: false,
              attachment: null,
              status: "delivered",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load conversations and messages:", error);
        // Create default conversations if API fails
        const defaultConversations = CATEGORY_OPTIONS.map(
          (category, index) => ({
            id: index + 1,
            title: category.label,
            category: category.label,
            unread: 0,
            timestamp: new Date().toISOString(),
            participants: ["You", "Legal Assistant"],
            isActive: index === 0,
          }),
        );

        setConversations(defaultConversations);
        conversationsRef.current = defaultConversations;

        if (defaultConversations.length > 0) {
          const firstConversation = defaultConversations[0];
          setActiveConversation(firstConversation.id);
          activeConversationRef.current = firstConversation.id;
          setSelectedCategory({ label: firstConversation.category });
          selectedCategoryRef.current = { label: firstConversation.category };

          setMessages([
            {
              id: generateUniqueId(),
              text: `Welcome to ${firstConversation.category}! How can I assist you with your legal needs today?`,
              sender: "Legal Assistant",
              senderAvatar: "LA",
              isUser: false,
              time: new Date().toISOString(),
              hasAttachment: false,
              attachment: null,
              status: "delivered",
            },
          ]);
        }
      }
    };

    if (currentUser?.userName) {
      loadConversationsAndMessages();
    }
  }, [currentUser.userName]);

  // Keep refs in sync with state
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  // Setup SignalR connection and message handlers
  useEffect(() => {
    let mounted = true;
    let connectionTimeout;

    const setupConnection = async () => {
      try {
        console.log("[DEBUG] Setting up SignalR connection...");
        // Delay connection to avoid rapid reconnection attempts
        connectionTimeout = setTimeout(async () => {
          if (!mounted) return;

          console.log("Setting up SignalR with:", {
            userName: currentUser.userName,
            userId: currentUser.userId,
          });

          const messageCallback = (msgOrList, options = {}) => {
            console.log(
              "[DEBUG] TeamsLayout callback triggered with:",
              msgOrList,
              options,
            );
            if (!mounted) {
              console.log(
                "[DEBUG] Component unmounted, skipping message processing",
              );
              return;
            }
            console.log("[DEBUG] SignalR callback triggered with:", msgOrList);

            const processMessage = (msg) => {
              console.log("[DEBUG] ProcessMessage called with msg:", msg);
              console.log("[DEBUG] Reply text:", msg.reply);
              console.log("[DEBUG] Message content:", msg.messageContent);

              const replyText = msg.reply || msg.Reply || "";
              const messageContent =
                msg.messageContent || msg.MessageContent || "";

              // If has messageContent, process the user message
              if (messageContent) {
                console.log("[DEBUG] Processing user message:", messageContent);
                const userMessage = {
                  id: msg.id || msg.Id || generateUniqueId(),
                  text: messageContent,
                  sender: msg.senderName || "User",
                  senderAvatar: "U",
                  isUser: true,
                  time: new Date(
                    msg.createdAt || msg.CreatedAt || new Date(),
                  ).toISOString(),
                  hasAttachment: !!msg.fileUrl,
                  attachment: msg.fileUrl
                    ? {
                        url: msg.fileUrl,
                        name: msg.fileName || "file",
                        type: msg.contentType || "",
                      }
                    : null,
                  status: "delivered",
                  isRead: msg.isRead,
                  readAt: msg.readAt,
                  queryCategory: msg.queryCategory || msg.QueryCategory,
                };

                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.status !== "sending");
                  const existingIndex = filtered.findIndex(
                    (m) => m.id === userMessage.id,
                  );
                  if (existingIndex !== -1) {
                    const updated = [...filtered];
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      ...userMessage,
                    };
                    return updated;
                  }
                  return [...filtered, userMessage];
                });
              }

              // Process actual replies
              if (replyText) {
                console.log("[DEBUG] Processing reply:", replyText);

                const messageId = msg.replierId
                  ? `${msg.id || msg.Id}-reply`
                  : msg.id || msg.Id || generateUniqueId();

                const replyTime = new Date(
                  msg.replyAt || msg.ReplyAt || new Date(),
                );
                replyTime.setHours(replyTime.getHours());

                const message = {
                  id: messageId,
                  text: replyText,
                  sender:
                    msg.replierName || msg.ReplierName || "Legal Assistant",
                  senderAvatar: "LA",
                  isUser: false,
                  time: replyTime.toISOString(),
                  hasAttachment: !!msg.replyFileUrl,
                  attachment: msg.replyFileUrl
                    ? {
                        url: msg.replyFileUrl,
                        name: msg.replyFileName || "file",
                        type: msg.replyContentType || "",
                      }
                    : null,
                  status: "delivered",
                  queryCategory: msg.queryCategory || msg.QueryCategory,
                };

                console.log("[DEBUG] Adding reply message:", message);

                setMessages((prev) => {
                  const existingIndex = prev.findIndex(
                    (m) => m.id === message.id,
                  );
                  if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      ...message,
                    };
                    return updated;
                  }
                  return [...prev, message];
                });
                
                // Call handleRefresh immediately when reply arrives
                handleRefresh();
              }
            };

            // Handle array of messages or single message
            if (Array.isArray(msgOrList)) {
              msgOrList.forEach(processMessage);
            } else {
              processMessage(msgOrList);
            }
          };

          const conn = await newConnection(
            messageCallback,
            currentUser.userName,
            currentUser.userId,
            handleRefresh,
          );

          if (mounted) {
            setConnection(conn);
          }
        }, 1000);
      } catch (error) {
        console.error("Failed to setup SignalR connection:", error);
      }
    };

    if (currentUser?.userName && !connection) {
      setupConnection();
    }

    return () => {
      mounted = false;
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (connection?.stop) {
        connection.stop().catch(console.error);
      }
    };
  }, [currentUser.userName]);

  const handleFileView = (file) => {
    setCurrentFile(file);
    setIsViewingFile(true);
  };

  const handleBackToChat = () => {
    setIsViewingFile(false);
    setCurrentFile(null);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      sessionStorage.clear();
      setShowProfileMenu(false);
      navigate("/login");
    }
  };

  const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

  const handleRefresh = async () => {
    const activeConv = conversations.find((c) => c.id === activeConversation);
    if (!activeConv) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat/history/${
          currentUser.userName
        }?page=1&size=20&_t=${Date.now()}`,
        {
          headers: { "Cache-Control": "no-cache" },
        },
      );
      const data = await response.json();
      const allMessages = data?.data?.items || [];

      const categoryMessages = allMessages.filter(
        (msg) =>
          msg.queryCategory === activeConv.category && msg.messageContent,
      );

      if (categoryMessages.length > 0) {
        const formattedMessages = [];

        categoryMessages.forEach((msg) => {
          if (msg.messageContent) {
            formattedMessages.push({
              id: msg.id || generateUniqueId(),
              text: msg.messageContent,
              sender: msg.senderName || "User",
              senderAvatar: "U",
              isUser: true,
              time: msg.createdAt || new Date().toISOString(),
              hasAttachment: !!msg.fileUrl,
              attachment: msg.fileUrl
                ? {
                    url: msg.fileUrl,
                    name: msg.fileName || "file",
                    type: msg.contentType || "",
                  }
                : null,
              status: "delivered",
              isRead: msg.isRead,
              readAt: msg.readAt,
            });
          }

          if (msg.reply) {
            const replyTime = new Date(msg.replyAt);
            replyTime.setHours(replyTime.getHours());
            formattedMessages.push({
              id: `${msg.id}-reply` || generateUniqueId(),
              text: msg.reply,
              sender: msg.replierName || "Legal Assistant",
              senderAvatar: "LA",
              isUser: false,
              time: replyTime.toISOString(),
              hasAttachment: !!msg.replyFileUrl,
              attachment: msg.replyFileUrl
                ? {
                    url: msg.replyFileUrl,
                    name: msg.replyFileName || "file",
                    type: msg.replyContentType || "",
                  }
                : null,
              status: "delivered",
            });
          }
        });

        const sortedMessages = formattedMessages.sort(
          (a, b) => new Date(a.time) - new Date(b.time)
        );
        setAllMessages(sortedMessages);
        setMessages(sortedMessages.slice(-displayedMessageCount));
        console.log("Refreshed messages:", sortedMessages.length);
      }
    } catch (error) {
      console.error("Failed to refresh messages:", error);
    }
  };

  const handleSendMessage = async (text, extra = {}) => {
    if (!text.trim() && !extra.attachment) return;

    const activeConv = conversations.find((c) => c.id === activeConversation);
    const categoryLabel =
      activeConv?.category || selectedCategory?.label || "Legal Advisory";

    // Handle file upload if attachment exists
    if (extra.attachment) {
      const { uploadAndSendFile } =
        await import("../services/chat/UploadAndSendFiles");
      try {
        await uploadAndSendFile(
          extra.attachment,
          text,
          currentUser,
          setMessages,
          () => {},
          categoryLabel,
        );
        handleRefresh();
        return;
      } catch (err) {
        console.error("Error uploading file:", err);
        return;
      }
    }

    // Add optimistic message immediately
    const optimisticMessage = {
      id: generateUniqueId(),
      text: text,
      sender: currentUser.userName,
      senderAvatar: "U",
      isUser: true,
      time: new Date().toISOString(),
      hasAttachment: false,
      attachment: null,
      status: "sending",
      isRead: false,
      readAt: null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendTextMessage(
        text || "",
        currentUser.userName,
        categoryLabel,
        "", // receiverId not needed for new conversations
      );
      console.log("✅ Message sent successfully to category:", categoryLabel);

      // Update optimistic message status
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticMessage.id ? { ...m, status: "delivered" } : m,
        ),
      );

      handleRefresh();
    } catch (err) {
      console.error("Error sending message:", err);
      // Update optimistic message to failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticMessage.id ? { ...m, status: "failed" } : m,
        ),
      );
    }
  };

  const handleNewConversation = (category) => {
    // Check if conversation already exists for this category
    const existingConv = conversations.find(
      (c) => c.category === category.label,
    );
    if (existingConv) {
      handleSelectConversation(existingConv.id);
      setShowCategoryModal(false);
      return;
    }

    const newConversation = {
      id: conversations.length + 1,
      title: category.label,
      category: category.label,
      unread: 0,
      timestamp: new Date().toISOString(),
      participants: ["You", "Legal Assistant"],
      isActive: false,
    };
    setConversations((prev) => {
      const updated = [...prev, newConversation];
      conversationsRef.current = updated;
      return updated;
    });
    setActiveConversation(newConversation.id);
    activeConversationRef.current = newConversation.id;
    setMessages([
      {
        id: generateUniqueId(),
        text: `You've started a new conversation about "${category.label}". How can I assist you?`,
        sender: "Legal Assistant",
        senderAvatar: "LA",
        isUser: false,
        time: new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString(),
        hasAttachment: false,
        attachment: null,
        status: "delivered",
        isAutoGenerated: false,
      },
    ]);
    setSelectedCategory(category);
    selectedCategoryRef.current = category;
    setShowCategoryModal(false);
  };

  const handleLoadMore = () => {
    const newCount = displayedMessageCount + 10;
    setDisplayedMessageCount(newCount);
    setMessages(allMessages.slice(-newCount));
  };

  const handleSelectConversation = async (conversationId) => {
    setActiveConversation(conversationId);
    activeConversationRef.current = conversationId;

    // Clear unread count for this conversation
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread: 0 } : conv,
      );
      conversationsRef.current = updated;
      return updated;
    });

    const selectedConv = conversations.find((c) => c.id === conversationId);
    if (!selectedConv) return;

    if (connection) {
      try {
        // Assumes you pass the other participant's username
        const otherUsername = selectedConv.participants.find(
          (u) => u !== currentUser.userName,
        );
        await connection.invoke("MarkMessagesAsRead", otherUsername);
      } catch (err) {
        console.error("Failed to send read receipt:", err);
      }
    }

    if (selectedConv) {
      setSelectedCategory({ label: selectedConv.category });
      selectedCategoryRef.current = { label: selectedConv.category };

      try {
        const { fetchChatByCategory } =
          await import("../services/chat/GetChatByCategory");
        const categoryMessages = await fetchChatByCategory(
          currentUser.userName,
          selectedConv.category,
        );

        console.log("Category messages received:", categoryMessages);
        console.log("Category messages length:", categoryMessages.length);

        if (categoryMessages.length > 0) {
          const formattedMessages = [];

          categoryMessages.forEach((msg) => {
            // Add the user's message
            if (msg.messageContent) {
              formattedMessages.push({
                id: msg.id || generateUniqueId(),
                text: msg.messageContent,
                sender: msg.senderName || "User",
                senderAvatar: "U",
                isUser: true,
                time: msg.createdAt || new Date().toISOString(),
                hasAttachment: !!msg.fileUrl,
                attachment: msg.fileUrl
                  ? {
                      url: msg.fileUrl,
                      name: msg.fileName || "file",
                      type: msg.contentType || "",
                    }
                  : null,
                status: "delivered",
                isRead: msg.isRead,
                readAt: msg.readAt,
              });
            }

            if (msg.reply) {
              formattedMessages.push({
                id: `${msg.id}-reply` || generateUniqueId(),
                text: msg.reply,
                sender: msg.replierName || "Legal Assistant",
                senderAvatar: "LA",
                isUser: false,
                time: msg.replyAt || new Date().toISOString(),
                hasAttachment: !!msg.replyFileUrl,
                attachment: msg.replyFileUrl
                  ? {
                      url: msg.replyFileUrl,
                      name: msg.replyFileName || "file",
                      type: msg.replyContentType || "",
                    }
                  : null,
                status: "delivered",
              });
            }
          });

          console.log("Formatted messages:", formattedMessages);
          const sortedMessages = formattedMessages.sort(
            (a, b) => new Date(a.time) - new Date(b.time),
          );
          setAllMessages(sortedMessages);
          setMessages(sortedMessages.slice(-displayedMessageCount));
          setDisplayedMessageCount(10);
        } else {
          setMessages([
            {
              id: generateUniqueId(),
              text: `No messages found for ${selectedConv.category}. Start a conversation by sending a message.`,
              sender: "Legal Assistant",
              senderAvatar: "LA",
              isUser: false,
              time: new Date().toISOString(),
              hasAttachment: false,
              attachment: null,
              status: "delivered",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load category messages:", error);
        setMessages([
          {
            id: generateUniqueId(),
            text: `Welcome to ${selectedConv.category}. How can I assist you?`,
            sender: "Legal Assistant",
            senderAvatar: "LA",
            isUser: false,
            time: new Date().toISOString(),
            hasAttachment: false,
            attachment: null,
            status: "delivered",
          },
        ]);
      }
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Teams-style Sidebar */}
      <ConversationSidebar
        conversations={filteredConversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onNewChat={() => setShowCategoryModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentUser={currentUser}
        onRefresh={handleRefresh}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Teams-style Header */}
        <div className="flex items-center justify-between px-6 py-1 border-b border-gray-200 bg-red-600 text-white shadow-sm">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Conversation Info - Removed Logo */}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">
                {conversations.find((c) => c.id === activeConversation)
                  ?.title || "Ask Your Lawyer"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm opacity-90 truncate">
                  Online - Legal Assistant ready
                </p>
                <span className="text-sm opacity-75 ml-2">
                  {/* {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })} */}
                </span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4 ml-4 relative">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
              title="New chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
              title="Refresh messages"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8.002 8.002 0 0115.356 2M15.418 15h.582v5a8.001 8.001 0 01-15.356-2M4.582 15V15a8.002 8.002 0 0115.356-2"
                />
              </svg>
            </button>

            {/* User Avatar - Profile Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold hover:shadow-md hover:scale-105 transition-all cursor-pointer border-2 border-white/20"
                title="Profile menu"
              >
                {currentUser.avatar}
              </button>

              {/* Google-style Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl z-50 py-0 text-gray-900 border border-gray-200">
                  {/* Profile Info - Header Section */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {currentUser.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {currentUser.userName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {currentUser.userId || "user@example.com"}
                        </p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Active
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items - Settings and Logout on same line */}
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-2">
                    {/* Settings Button */}
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Settings</span>
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600 font-medium"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {isViewingFile ? (
            <FileViewer file={currentFile} onBackToChat={handleBackToChat} />
          ) : (
            <>
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                currentUser={currentUser}
                onFileView={handleFileView}
                hasMoreMessages={allMessages.length > displayedMessageCount}
                onLoadMore={handleLoadMore}
              />

              {!showCategoryModal && (
                <ChatInput
                  connection={connection}
                  userData={currentUser}
                  onSendMessage={handleSendMessage}
                  selectedCategory={selectedCategory}
                  currentUser={currentUser}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-indigo-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6h6m0 0V6m0 0h-6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">New Chat</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select a legal category to start
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleNewConversation(category)}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-indigo-100 hover:border-gray-200 hover:bg-red-600 hover:text-white transition-all hover:scale-105 hover:shadow-lg text-left group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-white">
                        {category.label}
                      </h3>
                      <p className="text-xs text-gray-500 group-hover:text-white/90 mt-1">
                        Get expert assistance in this area
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 hover:border-red-200 rounded-lg hover:bg-red-100 font-medium transition-all hover:scale-105 hover:shadow-lg"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsLayout;