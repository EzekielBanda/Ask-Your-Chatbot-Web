// import React, { useEffect, useRef } from "react";

// const ChatMessages = ({
//   messages,
//   isLoading,
//   messagesEndRef,
//   currentUser,
//   onFileView,
// }) => {
//   const messagesContainerRef = useRef(null);

//   const getUniqueMessages = () => {
//     const seen = new Set();
//     return messages.filter((msg) => {
//       const key = msg.id;
//       if (seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     });
//   };

//   const groupMessagesBySender = (msgs) => {
//     const grouped = [];
//     let currentGroup = null;

//     msgs.forEach((msg) => {
//       if (
//         !currentGroup ||
//         currentGroup.sender !== msg.sender ||
//         new Date(msg.time).getTime() -
//           new Date(
//             currentGroup.messages[currentGroup.messages.length - 1].time
//           ).getTime() >
//           300000
//       ) {
//         currentGroup = {
//           sender: msg.sender,
//           senderAvatar: msg.senderAvatar,
//           isUser: msg.isUser,
//           messages: [msg],
//         };
//         grouped.push(currentGroup);
//       } else {
//         currentGroup.messages.push(msg);
//       }
//     });

//     return grouped;
//   };

//   const groupMessagesByDate = (groups) => {
//     const result = [];
//     let currentDate = null;

//     groups.forEach((group) => {
//       const msgDate = new Date(group.messages[0].time).toDateString();
//       if (msgDate !== currentDate) {
//         currentDate = msgDate;
//         const today = new Date().toDateString();
//         const yesterday = new Date(Date.now() - 86400000).toDateString();
//         let dateLabel = msgDate === today ? "Today" : msgDate === yesterday ? "Yesterday" : new Date(group.messages[0].time).toLocaleDateString();
//         result.push({ type: "date", date: dateLabel });
//       }
//       result.push({ type: "group", ...group });
//     });

//     return result;
//   };

//   useEffect(() => {
//     if (messagesContainerRef.current) {
//       const container = messagesContainerRef.current;
//       const isNearBottom =
//         container.scrollHeight - container.scrollTop - container.clientHeight <
//         100;

//       if (isNearBottom) {
//         setTimeout(() => {
//           messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//         }, 100);
//       }
//     }
//   }, [messages, messagesEndRef]);

//   const uniqueMessages = getUniqueMessages().sort(
//     (a, b) => new Date(a.time) - new Date(b.time)
//   );
//   const groupedMessages = groupMessagesByDate(groupMessagesBySender(uniqueMessages));

//   const formatTime = (time) => {
//     try {
//       const date = new Date(time);
//       if (isNaN(date.getTime())) {
//         return "";
//       }
//       // Adjust from UTC-2 (server) to UTC+2 (local): add 4 hours
//       date.setHours(date.getHours() + 2);
//       return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
//     } catch (e) {
//       console.error("Error formatting time:", time, e);
//       return "";
//     }
//   };

//   return (
//     <div
//       ref={messagesContainerRef}
//       className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 scroll-smooth space-y-6"
//     >
//       {groupedMessages.length === 0 ? (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
//               <svg
//                 className="w-8 h-8 text-indigo-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900">
//               Start a conversation
//             </h3>
//             <p className="text-gray-500 mt-1">Your messages will appear here</p>
//           </div>
//         </div>
//       ) : (
//         <>
//           {groupedMessages.map((item, itemIndex) =>
//             item.type === "date" ? (
//               <div key={`date-${itemIndex}`} className="flex justify-center my-6">
//                 <span className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-full">{item.date}</span>
//               </div>
//             ) : (
//             <div
//               key={`group-${itemIndex}`}
//               className={`flex gap-4 ${item.isUser ? "flex-row-reverse" : ""}`}
//             >
//               {/* Avatar - Only show for non-user messages */}
//               {!item.isUser && (
//                 <div className="flex-shrink-0">
//                   <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gray-400">
//                     {item.senderAvatar || item.sender.charAt(0).toUpperCase()}
//                   </div>
//                 </div>
//               )}
//               {/* Spacer for user messages to align properly */}
//               {item.isUser && <div className="flex-shrink-0 w-9"></div>}

//               {/* Messages */}
//               <div
//                 className={`flex-1 min-w-0 ${
//                   item.isUser ? "flex flex-col items-end" : ""
//                 }`}
//               >
//                 {/* Sender info */}
//                 <div
//                   className={`flex items-center gap-2 mb-1 ${
//                     item.isUser ? "flex-row-reverse justify-end" : ""
//                   }`}
//                 >
//                   {!item.isUser && (
//                     <span className="text-sm font-semibold text-gray-900">
//                       {item.sender}
//                     </span>
//                   )}
//                 </div>

//                 {/* Message content */}
//                 <div className="space-y-2">
//                   {item.messages.map((msg) => (
//                     <div
//                       key={msg.id}
//                       className={`flex flex-col ${msg.isUser ? "items-end" : ""}`}
//                     >
//                       {/* Time above each message */}
//                       <span className={`text-xs text-gray-400 mb-1 ${msg.isUser ? "text-right" : "text-left"}`}>{formatTime(msg.time)}</span>
//                       <div
//                         className={`rounded-lg px-4 py-3 max-w-2xl w-fit ${
//                           msg.isUser
//                             ? "bg-indigo-600 text-white"
//                             : "bg-white text-gray-900 border border-gray-200"
//                         }`}
//                       >
//                         <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
//                           {msg.text}
//                         </p>

//                         {/* File attachment */}
//                         {msg.hasAttachment && msg.attachment && (
//                           <div
//                             onClick={() => onFileView(msg.attachment)}
//                             className={`mt-3 p-3 rounded-lg cursor-pointer transition-colors ${
//                               msg.isUser
//                                 ? "bg-white/20 hover:bg-white/30"
//                                 : "bg-gray-100 hover:bg-gray-200"
//                             }`}
//                           >
//                             <div className="flex items-center gap-2">
//                               <svg
//                                 className="w-5 h-5 flex-shrink-0"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   strokeWidth={2}
//                                   d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                                 />
//                               </svg>
//                               <span className="text-xs font-medium truncate">
//                                 {msg.attachment.name}
//                               </span>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {/* Message status - Below message on right end */}
//                       {msg.isUser && (
//                         <div className="flex items-center justify-end mt-1">
//                           {msg.status === "sending" && (
//                             <span className="text-xs text-gray-400">...</span>
//                           )}
//                           {/* Single tick for delivered/unread */}
//                           {(msg.status === "delivered" || msg.status === "sent") && !msg.isRead && !msg.readAt && (
//                             <svg
//                               className="w-4 h-4 text-gray-400"
//                               fill="currentColor"
//                               viewBox="0 0 20 20"
//                             >
//                               <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
//                             </svg>
//                           )}
//                           {/* Double tick for read */}
//                           {(msg.isRead || msg.readAt) && (
//                             <div className="flex items-center">
//                               <svg
//                                 className="w-4 h-4 text-blue-500"
//                                 fill="currentColor"
//                                 viewBox="0 0 20 20"
//                               >
//                                 <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
//                               </svg>
//                               <svg
//                                 className="w-4 h-4 text-blue-500 -ml-2"
//                                 fill="currentColor"
//                                 viewBox="0 0 20 20"
//                               >
//                                 <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
//                               </svg>
//                             </div>
//                           )}
//                           {msg.status === "failed" && (
//                             <span className="text-xs text-red-500">✕</span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             )
//           )}

//           {/* Typing Indicator */}
//           {isLoading && (
//             <div className="flex gap-4">
//               {/* Avatar */}
//               <div className="flex-shrink-0">
//                 <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gray-400">
//                   LA
//                 </div>
//               </div>

//               {/* Typing Indicator */}
//               <div className="flex-1 min-w-0">
//                 {/* Sender info */}
//                 <div className="flex items-center gap-2 mb-1">
//                   <span className="text-sm font-semibold text-gray-900">
//                     Legal Assistant
//                   </span>
//                 </div>

//                 {/* Typing dots */}
//                 <div className="rounded-lg px-4 py-3 bg-white text-gray-900 border border-gray-200 w-fit">
//                   <div className="typing-indicator text-gray-500">
//                     <div className="typing-dot"></div>
//                     <div className="typing-dot"></div>
//                     <div className="typing-dot"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} className="h-4" />
//         </>
//       )}
//     </div>
//   );
// };

// export default ChatMessages;

import React, { useEffect, useRef, useState } from "react";
import LoadMoreButton from "./LoadMoreButton";

const ChatMessages = ({
  messages,
  isLoading,
  messagesEndRef,
  currentUser,
  onFileView,
  hasMoreMessages,
  onLoadMore,
}) => {
  const messagesContainerRef = useRef(null);
  const [showLoadMore, setShowLoadMore] = useState(false);

  // Helper function to extract real filename
  const getRealFileName = (fileName) => {
    if (!fileName) return "Unknown file";
    const realName = fileName.includes("_")
      ? fileName.substring(fileName.indexOf("_") + 1)
      : fileName;
    // Remove file extension
    const lastDotIndex = realName.lastIndexOf('.');
    return lastDotIndex > 0 ? realName.substring(0, lastDotIndex) : realName;
  };

  // Remove duplicates
  const getUniqueMessages = () => {
    const seen = new Set();
    return messages.filter((msg) => {
      const key = msg.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Group messages by sender & time
  const groupMessagesBySender = (msgs) => {
    const grouped = [];
    let currentGroup = null;

    msgs.forEach((msg) => {
      if (
        !currentGroup ||
        currentGroup.sender !== msg.sender ||
        new Date(msg.time).getTime() -
          new Date(
            currentGroup.messages[currentGroup.messages.length - 1].time,
          ).getTime() >
          300000 // 5 minutes gap
      ) {
        currentGroup = {
          sender: msg.sender,
          senderAvatar: msg.senderAvatar,
          isUser: msg.isUser,
          messages: [msg],
        };
        grouped.push(currentGroup);
      } else {
        currentGroup.messages.push(msg);
      }
    });

    return grouped;
  };

  const groupMessagesByDate = (groups) => {
    const result = [];
    let currentDate = null;

    groups.forEach((group) => {
      const msgDate = new Date(group.messages[0].time).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let dateLabel =
          msgDate === today
            ? "Today"
            : msgDate === yesterday
              ? "Yesterday"
              : new Date(group.messages[0].time).toLocaleDateString();
        result.push({ type: "date", date: dateLabel });
      }
      result.push({ type: "group", ...group });
    });

    return result;
  };

  // Auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtTop = container.scrollTop <= 50;
      setShowLoadMore(isAtTop && hasMoreMessages);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      if (isNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [messages, messagesEndRef]);

  const uniqueMessages = getUniqueMessages().sort(
    (a, b) => new Date(a.time) - new Date(b.time),
  );
  const groupedMessages = groupMessagesByDate(
    groupMessagesBySender(uniqueMessages),
  );

  const formatTime = (time, isUser = false) => {
    try {
      const date = new Date(time);
      if (isNaN(date.getTime() - 2)) return "";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 scroll-smooth space-y-6"
    >
      {groupedMessages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Start a conversation
            </h3>
            <p className="text-gray-500 mt-1">Your messages will appear here</p>
          </div>
        </div>
      ) : (
        <>
          {/* Load More Button */}
          {showLoadMore && (
            <LoadMoreButton
              isLoading={isLoading}
              hasMoreMessages={hasMoreMessages}
              onLoadMore={onLoadMore}
            />
          )}

          {groupedMessages.map((item, itemIndex) =>
            item.type === "date" ? (
              <div
                key={`date-${itemIndex}`}
                className="flex justify-center my-6"
              >
                <span className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-full">
                  {item.date}
                </span>
              </div>
            ) : (
              <div
                key={`group-${itemIndex}`}
                className={`flex gap-4 ${item.isUser ? "flex-row-reverse" : ""}`}
              >
                {!item.isUser && (
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gray-400">
                      {item.senderAvatar || item.sender.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {item.isUser && <div className="flex-shrink-0 w-9"></div>}

                <div
                  className={`flex-1 min-w-0 ${
                    item.isUser ? "flex flex-col items-end" : ""
                  }`}
                >
                  <div className={`space-y-2`}>
                    {item.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.isUser ? "items-end" : ""}`}
                      >
                        <span
                          className={`text-xs text-gray-400 mb-1 ${
                            msg.isUser ? "text-right" : "text-left"
                          }`}
                        >
                          {formatTime(msg.time, msg.isUser)}
                        </span>

                        <div
                          className={`rounded-lg px-4 py-3 max-w-2xl w-fit ${
                            msg.isUser
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-900 border border-gray-200"
                          }`}
                        >
                          {msg.hasAttachment && msg.attachment && (
                            <div
                              className={`p-3 rounded-lg mb-3 ${
                                msg.isUser ? "bg-white/20" : "bg-gray-100"
                              }`}
                            >
                              {msg.attachment.type?.startsWith("audio/") ? (
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <audio controls className="flex-1 h-8">
                                    <source
                                      src={msg.attachment.url}
                                      type={msg.attachment.type}
                                    />
                                  </audio>
                                </div>
                              ) : msg.attachment.type?.startsWith("image/") ? (
                                <div
                                  onClick={() => onFileView(msg.attachment)}
                                  className="cursor-pointer transition-colors hover:bg-black/10 p-2 rounded"
                                >
                                  <div className="w-20 h-16 rounded overflow-hidden flex-shrink-0 mx-auto mb-2">
                                    <img
                                      src={msg.attachment.url}
                                      alt={msg.attachment.name}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                  <p className="text-xs text-center font-medium">
                                    {getRealFileName(msg.attachment.name)}
                                  </p>
                                </div>
                              ) : msg.attachment.type?.includes("pdf") ? (
                                <div
                                  onClick={() => onFileView(msg.attachment)}
                                  className="cursor-pointer transition-colors hover:bg-black/10 p-2 rounded"
                                >
                                  <div className="w-12 h-16 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold mx-auto mb-2">
                                    PDF
                                  </div>
                                  <p className="text-xs text-center font-medium">
                                    {getRealFileName(msg.attachment.name)}
                                  </p>
                                </div>
                              ) : msg.attachment.type?.includes("word") ||
                                msg.attachment.name?.endsWith(".docx") ||
                                msg.attachment.name?.endsWith(".doc") ? (
                                <div
                                  onClick={() => onFileView(msg.attachment)}
                                  className="cursor-pointer transition-colors hover:bg-black/10 p-2 rounded"
                                >
                                  <div className="w-12 h-16 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold mx-auto mb-2">
                                    DOC
                                  </div>
                                  <p className="text-xs text-center font-medium">
                                    {getRealFileName(msg.attachment.name)}
                                  </p>
                                </div>
                              ) : (
                                <div
                                  onClick={() => onFileView(msg.attachment)}
                                  className="cursor-pointer transition-colors hover:bg-black/10 p-2 rounded"
                                >
                                  <div className="w-12 h-16 bg-gray-500 rounded flex items-center justify-center text-white text-xs font-bold mx-auto mb-2">
                                    FILE
                                  </div>
                                  <p className="text-xs text-center font-medium">
                                    {getRealFileName(msg.attachment.name)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {msg.text && (
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.text}
                            </p>
                          )}
                        </div>

                        {/* Live read receipt */}
                        {msg.isUser && (
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            {msg.status === "sending" && (
                              <span className="text-xs text-gray-400">...</span>
                            )}
                            {(msg.status === "delivered" ||
                              msg.status === "sent") &&
                              !msg.isRead &&
                              !msg.readAt && (
                                <span className="text-xs text-gray-400">✓</span>
                              )}
                            {(msg.isRead || msg.readAt) && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-blue-500">
                                  ✓✓
                                </span>
                              </div>
                            )}
                            {msg.status === "failed" && (
                              <span className="text-xs text-red-500">✕</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gray-400">
                  LA
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    Legal Assistant
                  </span>
                </div>

                <div className="rounded-lg px-4 py-3 bg-white text-gray-900 border border-gray-200 w-fit">
                  <div className="typing-indicator text-gray-500">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </>
      )}
    </div>
  );
};

export default ChatMessages;
