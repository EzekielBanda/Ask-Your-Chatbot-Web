// import { useEffect, useRef, useState, useCallback } from "react";
// import ChatMessages from "../components/ChatMessages";
// import ChatInput from "../components/ChatInput";
// import FileViewer from "../components/FileViewer";
// import { fetchChatHistory } from "../services/dataExtraction/GetChatHistory";
// import { newConnection } from "../services/chat/ConnectToSignalR";

// const CATEGORY_OPTIONS = [
//   "Litigation ( Court)",
//   "Legal Advisory",
//   "Legal Documentation",
//   "Recoveries",
// ];

// const ChatWindow = ({ userData }) => {
//   const [messages, setMessages] = useState([]);
//   const [allMessages, setAllMessages] = useState({});
//   const [connection, setConnection] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [hasMoreMessages, setHasMoreMessages] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isViewingFile, setIsViewingFile] = useState(false);
//   const [currentFile, setCurrentFile] = useState(null);
//   const [showCategoryModal, setShowCategoryModal] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const messagesEndRef = useRef(null);
//   const isElectron = typeof window !== "undefined" && !!window.electronAPI;

//   // Scroll to bottom when messages update
//   const scrollToBottom = useCallback(() => {
//     if (!isViewingFile) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [isViewingFile]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   const handleFileView = (file) => {
//     setCurrentFile(file);
//     setIsViewingFile(true);
//   };

//   const handleBackToChat = () => {
//     setIsViewingFile(false);
//     setCurrentFile(null);
//   };

//   // Add or update message
//   const addOrUpdateMessage = useCallback(
//     (incoming, userName) => {
//       setAllMessages((prev) => {
//         const userMessages = prev[userName] || [];
//         const existingIndex = userMessages.findIndex(
//           (m) => m.id === incoming.id
//         );
//         let updatedMessages;
//         if (existingIndex !== -1) {
//           updatedMessages = [...userMessages];
//           updatedMessages[existingIndex] = {
//             ...userMessages[existingIndex],
//             ...incoming,
//           };
//         } else {
//           updatedMessages = [...userMessages, incoming];
//         }
//         return { ...prev, [userName]: updatedMessages };
//       });

//       if (userName === userData.userName) {
//         setMessages((prev) => {
//           const existingIndex = prev.findIndex((m) => m.id === incoming.id);
//           if (existingIndex !== -1) {
//             const updated = [...prev];
//             updated[existingIndex] = { ...updated[existingIndex], ...incoming };
//             return updated;
//           }
//           return [...prev, incoming];
//         });
//       }
//     },
//     [userData.userName]
//   );

//   // Helpers
//   const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

//   const setupSignalRConnection = useCallback(
//     async (onMessageCallback) => {
//       try {
//         const conn = await newConnection(onMessageCallback, userData.userName);
//         // Optional debug handlers
//         if (conn && conn.on) {
//           conn.on("ReceiveReply", (msg) => console.log("🔄 ReceiveReply", msg));
//           conn.on("ReplyToFileMessage", (msg) =>
//             console.log("📂 ReplyToFileMessage", msg)
//           );
//         }
//         return conn;
//       } catch (err) {
//         console.error("❌ SignalR setup failed:", err);
//         return null;
//       }
//     },
//     [userData.userName]
//   );

//   // Load initial chat and setup SignalR
//   useEffect(() => {
//     let mounted = true;

//     const loadInitialData = async () => {
//       setIsLoading(true);
//       try {
//         const initialMessages = await fetchChatHistory(
//           userData.userName,
//           1,
//           20
//         );
//         const sortedMessages = (initialMessages || []).sort(
//           (a, b) => new Date(a.time || 0) - new Date(b.time || 0)
//         );
//         if (!mounted) return;
//         setAllMessages((prev) => ({
//           ...prev,
//           [userData.userName]: sortedMessages,
//         }));
//         setMessages(sortedMessages);
//         setHasMoreMessages(sortedMessages.length >= 20);

//         const conn = await setupSignalRConnection((msgOrList) => {
//           const handleIncoming = (msg) => {
//             const message = {
//               id: msg.id || msg.Id || generateUniqueId(),
//               text:
//                 msg.MessageContent ||
//                 msg.reply ||
//                 msg.Reply ||
//                 msg.text ||
//                 msg.content ||
//                 "",
//               sender:
//                 msg.replierName ||
//                 msg.ReplierName ||
//                 msg.SenderName ||
//                 msg.sender ||
//                 msg.Username ||
//                 "Lawyer",
//               isUser:
//                 msg.senderId === userData.userId ||
//                 msg.SenderId === userData.userId ||
//                 false,
//               time: new Date(
//                 msg.replyAt ||
//                   msg.ReplyAt ||
//                   msg.createdAt ||
//                   msg.time ||
//                   new Date()
//               ).toISOString(),
//               hasAttachment: !!msg.ReplyFileUrl || !!msg.FileUrl || !!msg.file,
//               attachment:
//                 msg.ReplyFileUrl || msg.FileUrl || msg.file
//                   ? {
//                       url: msg.ReplyFileUrl || msg.FileUrl || msg.file,
//                       name: msg.ReplyFileName || msg.FileName || "file",
//                       type:
//                         msg.replyContentType ||
//                         msg.contentType ||
//                         msg.ContentType ||
//                         "",
//                     }
//                   : null,
//               status: msg.Status || msg.messageStatus || "sent",
//             };

//             setMessages((prev) => {
//               if (prev.some((m) => m.id === message.id)) return prev;
//               const updated = [...prev, message];
//               updated.sort((a, b) => new Date(a.time) - new Date(b.time));
//               return updated;
//             });

//             addOrUpdateMessage(message, userData.userName);
//             // Optional: notify electron
//             if (isElectron && window.electronAPI?.notifyNewMessage)
//               window.electronAPI.notifyNewMessage();
//           };

//           if (Array.isArray(msgOrList)) msgOrList.forEach(handleIncoming);
//           else handleIncoming(msgOrList);
//         });

//         if (mounted) setConnection(conn);
//       } catch (error) {
//         console.error("Initialization error:", error);
//         if (!mounted) return;
//         setMessages([
//           {
//             id: "default-error",
//             text: "Welcome! This is your lawyer. How may I help you?",
//             sender: "Lawyer",
//             isUser: false,
//             time: new Date().toISOString(),
//             hasAttachment: false,
//             attachment: null,
//           },
//         ]);
//         setHasMoreMessages(false);
//       } finally {
//         if (mounted) setIsLoading(false);
//       }
//     };

//     if (userData?.userName) loadInitialData();

//     return () => {
//       mounted = false;
//       if (connection?.stop) connection.stop().catch((e) => console.error(e));
//     };
//   }, [userData.userName, setupSignalRConnection]);

//   // Load more messages (older)
//   const loadMoreMessages = async () => {
//     if (isLoading || !hasMoreMessages) return;
//     setIsLoading(true);
//     try {
//       const nextPage = currentPage + 1;
//       const newMessages = await fetchChatHistory(
//         userData.userName,
//         nextPage,
//         20
//       );
//       const sortedNewMessages = (newMessages || []).sort(
//         (a, b) => new Date(a.time) - new Date(b.time)
//       );
//       setAllMessages((prev) => ({
//         ...prev,
//         [userData.userName]: [
//           ...sortedNewMessages,
//           ...(prev[userData.userName] || []),
//         ],
//       }));
//       setMessages((prev) => {
//         // prepend older messages
//         const merged = [...sortedNewMessages, ...prev];
//         // dedupe by id
//         const seen = new Set();
//         return merged.filter((m) => {
//           if (!m || !m.id) return false;
//           if (seen.has(m.id)) return false;
//           seen.add(m.id);
//           return true;
//         });
//       });
//       setCurrentPage(nextPage);
//       setHasMoreMessages(sortedNewMessages.length > 0);
//     } catch (err) {
//       console.error("Error loading more messages:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // UI handlers
//   const handleAddChat = () => setShowCategoryModal(true);
//   const handleRefresh = async () => {
//     setIsLoading(true);
//     try {
//       const fresh = await fetchChatHistory(userData.userName, 1, 20);
//       const sorted = (fresh || []).sort(
//         (a, b) => new Date(a.time || 0) - new Date(b.time || 0)
//       );
//       setMessages(sorted);
//       setAllMessages((prev) => ({ ...prev, [userData.userName]: sorted }));
//       setCurrentPage(1);
//       setHasMoreMessages(sorted.length >= 20);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleMinimize = () => {
//     if (isElectron && window.electronAPI?.minimize)
//       window.electronAPI.minimize();
//   };
//   const handleClose = () => {
//     if (isElectron && window.electronAPI?.close) window.electronAPI.close();
//   };

//   const handleSendMessage = async (text, extra = {}) => {
//     const msg = {
//       id: generateUniqueId(),
//       text,
//       sender: userData.userName,
//       isUser: true,
//       time: new Date().toISOString(),
//       hasAttachment: !!extra.attachment,
//       attachment: extra.attachment || null,
//       status: "sending",
//     };
//     setMessages((prev) => [...prev, msg]);

//     // try to send via connection if available
//     try {
//       if (connection && connection.invoke) {
//         // this depends on your server contract; adjust as needed
//         await connection.invoke("SendMessage", {
//           content: text,
//           to: userData.userName,
//           category: selectedCategory,
//         });
//       }
//       // mark sent
//       setMessages((prev) =>
//         prev.map((m) => (m.id === msg.id ? { ...m, status: "sent" } : m))
//       );
//     } catch (err) {
//       console.error("Send failed", err);
//       setMessages((prev) =>
//         prev.map((m) => (m.id === msg.id ? { ...m, status: "failed" } : m))
//       );
//     }
//   };

//   const handleCategorySelect = (cat) => {
//     setSelectedCategory(cat);
//     setShowCategoryModal(false);
//   };

//   return (
//     <div className="flex flex-col h-screen w-full bg-white">
//       {/* Header - full width Teams style */}
//       <div className="flex items-center justify-between px-6 py-3 border-b bg-indigo-600 text-white">
//         <div className="flex items-center gap-4 min-w-0">
//           <div className="h-10 w-10 rounded-md bg-indigo-700 flex items-center justify-center text-white font-semibold">
//             AL
//           </div>
//           <div className="min-w-0">
//             <h1 className="text-lg font-semibold truncate">Legal Assistance</h1>
//             <p className="text-sm opacity-90 mt-0.5 truncate">
//               Connected with your lawyer
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleAddChat}
//             className="w-8 h-8 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 transition-colors"
//             title="Start New Chat"
//           >
//             <span className="text-white text-lg font-bold">+</span>
//           </button>
//           <button
//             onClick={handleRefresh}
//             className="w-8 h-8 flex items-center justify-center rounded bg-indigo-500 hover:bg-indigo-600 transition-colors"
//             title="Refresh Chat"
//           >
//             <span className="text-white text-sm">⟳</span>
//           </button>
//           {isElectron && (
//             <>
//               <button
//                 onClick={handleMinimize}
//                 className="w-8 h-8 flex items-center justify-center rounded hover:bg-indigo-500 transition-colors"
//                 title="Minimize"
//               >
//                 −
//               </button>
//               <button
//                 onClick={handleClose}
//                 className="w-8 h-8 flex items-center justify-center rounded hover:bg-indigo-500 transition-colors"
//                 title="Close"
//               >
//                 ×
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Main content area - full height. Messages take center column, input sticks to bottom */}
//       <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <div className="flex-1 overflow-auto bg-gray-50">
//             {isViewingFile ? (
//               <FileViewer file={currentFile} onBackToChat={handleBackToChat} />
//             ) : (
//               <div className="h-full flex flex-col">
//                 <ChatMessages
//                   messages={messages}
//                   isLoading={isLoading}
//                   hasMoreMessages={hasMoreMessages}
//                   onLoadMore={loadMoreMessages}
//                   messagesEndRef={messagesEndRef}
//                   currentUser={userData.userName}
//                   onFileView={handleFileView}
//                 />
//               </div>
//             )}
//           </div>

//           {!isViewingFile && !showCategoryModal && (
//             <div className="border-t bg-white">
//               <ChatInput
//                 connection={connection}
//                 userData={userData}
//                 onSendMessage={handleSendMessage}
//                 setMessages={setMessages}
//                 selectedCategory={selectedCategory}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Category Selection Modal (global) */}
//       {showCategoryModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-full">
//             <h2 className="text-lg font-semibold mb-4">
//               Select Query Category
//             </h2>
//             <div className="mb-4">
//               <select
//                 className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//               >
//                 <option value="" disabled>
//                   Select a category...
//                 </option>
//                 {CATEGORY_OPTIONS.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex justify-end gap-2">
//               <button
//                 className="px-4 py-2 bg-indigo-600 text-white rounded"
//                 disabled={!selectedCategory}
//                 onClick={() => handleCategorySelect(selectedCategory)}
//               >
//                 OK
//               </button>
//               <button
//                 className="px-4 py-2 bg-gray-200 rounded"
//                 onClick={() => setShowCategoryModal(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;

import TeamsLayout from "../components/TeamsLayout";

const ChatWindow = ({ userData, onLogout }) => {
  return <TeamsLayout userData={userData} onLogout={onLogout} />;
};

export default ChatWindow;
