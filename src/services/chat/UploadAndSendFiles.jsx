// import axios from "axios";
// import { sendQueryToLawyers } from "./ConnectToSignalR";
// export const uploadAndSendFile = async (
//   selectedFile,
//   newMessage,
//   userData,
//   setMessages,
//   setIsUploading,
//   queryCategory
// ) => {
//   const userName = userData.userName;
//
//   if (!selectedFile || !userName) return;
//
//   const tempMessageId = `temp-${Date.now()}`;
//
//   // Add temp message to UI immediately
//   setMessages((prev) => [
//     ...prev,
//     {
//       id: tempMessageId,
//       text: newMessage || "Uploading file...",
//       sender: "You",
//       isUser: true,
//       time: new Date().toISOString(),
//       hasAttachment: true,
//       file: {
//         name: selectedFile.name,
//         type: selectedFile.type,
//         url: URL.createObjectURL(selectedFile),
//       },
//       status: "pending",
//     },
//   ]);
//
//   try {
//     const formData = new FormData();
//     formData.append("file", selectedFile);
//
//     // 1. Upload file
//     const uploadResponse = await axios.post(
//       `${import.meta.env.VITE_UPLOAD_FILE}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           // Add if needed: Authorization: `Bearer ${userData.token}`
//         },
//       }
//     );
//
//     const { fileName, fileUrl, contentType } = uploadResponse.data;
//
//     // 2. Send message via SignalR to group of lawyers
//     // Validate required fields
//     const senderId = userData.userId || userName;
//     if (!senderId) {
//       alert("Cannot send file: No valid sender ID or username found. Please refresh or contact support.");
//       setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
//       setIsUploading(false);
//       return;
//     }
//     // Allow file messages with empty text
//     const messageDto = {
//       SenderId: senderId,
//       MessageContent: newMessage ? newMessage : "", // always include, even if empty
//       CreatedAt: new Date().toISOString(),
//       FileName: fileName,
//       FileUrl: fileUrl,
//       ContentType: contentType,
//       QueryCategory: queryCategory || "",
//       DepartmentName: userData.departmentName || "",
//     };
//     await sendQueryToLawyers("SendQueryToLawyers", messageDto);
//
//     await axios.post(
//       `${import.meta.env.VITE_SEND_FILE}`,
//       messageDto,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//
//     // Update the temporary message with success status
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.id === tempMessageId
//           ? {
//               ...msg,
//               id: Date.now(),
//               text: newMessage || "",
//               file: {
//                 name: selectedFile.name,
//                 type: contentType,
//                 url: fileUrl,
//               },
//               status: "sent",
//             }
//           : msg
//       )
//     );
//   } catch (error) {
//     // Error handling
//     if (error.response) {
//       console.error("Error sending file (response):", error.response.data);
//       console.error("Status:", error.response.status);
//       console.error("Headers:", error.response.headers);
//     } else if (error.request) {
//       console.error("Error sending file (no response):", error.request);
//     } else {
//       console.error("Error sending file (setup):", error.message);
//     }
//
//     // Use last request payload for debugging
//     console.error("Payload sent:", || {});
//     console.error("Endpoint:", `${import.meta.env.VITE_SEND_FILE}`);
//
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.id === tempMessageId ? { ...msg, status: "failed" } : msg
//       )
//     );
//     alert("Failed to send file. Please try again.");
//   } finally {
//     setIsUploading(false);
//   }
// };

import axios from "axios";
import { sendFileQueryToLawyers, connectionRef } from "./ConnectToSignalR";
import * as signalR from "@microsoft/signalr";

export const uploadAndSendFile = async (
  selectedFile,
  newMessage,
  userData,
  setMessages,
  setIsUploading,
  queryCategory
) => {
  const userName = userData.userName;

  if (!selectedFile || !userName) return;

  const tempMessageId = `temp-${Date.now()}`;

  // Add temp message to UI immediately
  setMessages((prev) => [
    ...prev,
    {
      id: tempMessageId,
      text: newMessage || "Uploading file...",
      sender: userName,
      senderAvatar: "U",
      isUser: true,
      time: new Date().toISOString(),
      hasAttachment: true,
      attachment: {
        name: selectedFile.name,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile),
        size: selectedFile.size,
      },
      status: "sending",
    },
  ]);

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    // 1. Upload file
    const uploadResponse = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/file/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { fileName, fileUrl, contentType } = uploadResponse.data;

    const safeMessageContent =
      newMessage && newMessage.trim() !== "" ? newMessage : "File attached";
    const messageDto = {
      senderUsername: userName,
      receiverUsername: "Lawyer",
      messageContent: safeMessageContent,
      fileName: fileName,
      fileUrl: fileUrl,
      contentType: contentType,
      queryCategory: queryCategory || "",
      createdAt: new Date().toISOString(),
    };

    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        await sendFileQueryToLawyers(messageDto);
      } catch (signalRError) {
        console.error("SignalR error:", signalRError);
      }
    }

    // Update the temporary message with success status
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempMessageId
          ? {
              ...msg,
              id: Date.now(),
              text: safeMessageContent,
              attachment: {
                name: selectedFile.name,
                type: contentType,
                url: fileUrl,
                size: selectedFile.size,
              },
              status: "delivered",
            }
          : msg
      )
    );
  } catch (error) {
    console.error("Error sending file:", error);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempMessageId ? { ...msg, status: "failed" } : msg
      )
    );
    alert("Failed to send file. Please try again.");
  } finally {
    if (setIsUploading) setIsUploading(false);
  }
};
