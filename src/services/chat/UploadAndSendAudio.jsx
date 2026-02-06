// import axios from "axios";
// import { sendQueryToLawyers, connectionRef, newConnection } from "./ConnectToSignalR";
//
// export const uploadAndSendAudio = async (
//   selectedFile,
//   messageContent,
//   userData,
//   setMessages,
//   setIsUploading,
//   queryCategory
// ) => {
//   const UPLOAD_AUDIO_REQUEST_URL = import.meta.env.VITE_UPLOAD_AUDIO;
//   const SEND_AUDIO_REQUEST_URL = import.meta.env.VITE_SEND_FILE;
//   const userName = userData.userName;
//
//   if (!selectedFile || !userName) {
//     console.warn("Missing audio file or username for audio upload.");
//     throw new Error("Audio file and username are required");
//   }
//
//   const tempMessageId = `temp-${Date.now()}`;
//
//   // Add temporary message to UI
//   setMessages((prev) => [
//     ...prev,
//     {
//       id: tempMessageId,
//       text: messageContent || "Uploading audio...",
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
//     // First, upload the audio file
//     const formData = new FormData();
//     formData.append("audio", selectedFile);
//
//     const uploadResponse = await axios.post(
//       UPLOAD_AUDIO_REQUEST_URL,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//
//     const { fileName, fileUrl, contentType } = uploadResponse.data;
//
//     // Ensure ReceiverUsername is valid
//     const receiverUsername = userData.lawyerUserName || userData.lawyerId;
//     if (!receiverUsername || receiverUsername === "Lawyer") {
//       alert("Cannot send audio: No valid lawyer username found. Please refresh or contact support.");
//       setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
//       setIsUploading(false);
//       throw new Error("No valid lawyer username found.");
//     }
//     // Create SendMessageRequest DTO for SignalR
//     const sendMessageRequest = {
//       SenderUsername: userName,
//       ReceiverUsername: receiverUsername,
//       MessageContent: messageContent || "",
//       QueryCategory: queryCategory || "",
//       FileName: fileName,
//       FileUrl: fileUrl,
//       ContentType: contentType,
//       DepartmentName: userData.departmentName || "",
//     };
//
//     // Ensure SignalR connection is active before sending
//     if (!connectionRef.current || connectionRef.current.state !== "Connected") {
//       try {
//         await newConnection(); // Attempt to reconnect
//       } catch (err) {
//         alert("Unable to connect to chat server. Please check your connection and try again.");
//         setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
//         setIsUploading(false);
//         throw new Error("SignalR connection not active.");
//       }
//     }
//     // Send via SignalR (use SendMessage method)
//     await sendQueryToLawyers("SendMessage", sendMessageRequest);
//
//     // Send via REST API
//     await axios.post(
//       SEND_AUDIO_REQUEST_URL,
//       sendMessageRequest,
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
//               text: messageContent || "",
//               hasAttachment: true,
//               attachment: {
//                 name: fileName,
//                 fileName: fileName,
//                 type: contentType,
//                 contentType: contentType,
//                 url: fileUrl,
//                 fileUrl: fileUrl,
//                 size: selectedFile.size,
//               },
//               file: {
//                 name: fileName,
//                 fileName: fileName,
//                 type: contentType,
//                 contentType: contentType,
//                 url: fileUrl,
//                 fileUrl: fileUrl,
//                 size: selectedFile.size,
//               },
//               status: "sent",
//             }
//           : msg
//       )
//     );
//
//     return {
//       id: Date.now(),
//       fileName,
//       fileUrl,
//       contentType,
//     };
//   } catch (error) {
//     console.error("Error sending audio file:", error);
//
//     // Remove temporary message on error
//     setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
//
//     // Show a visible error message
//     alert(
//       error?.response?.data?.message ||
//         error?.message ||
//         "Failed to send audio. Please check your connection and try again."
//     );
//     // Re-throw error so calling code can handle it
//     throw error;
//   }
// };

// import axios from "axios";
// import {
//   sendQueryToLawyers,
//   connectionRef,
//   newConnection,
// } from "./ConnectToSignalR";

// export const uploadAndSendAudio = async (
//   selectedFile,
//   messageContent,
//   userData,
//   setMessages,
//   setIsUploading,
//   queryCategory
// ) => {
//   const UPLOAD_AUDIO_REQUEST_URL = import.meta.env.VITE_UPLOAD_AUDIO;
//   const SEND_AUDIO_REQUEST_URL = import.meta.env.VITE_SEND_FILE;
//   const userName = userData.userName;

//   if (!selectedFile || !userName) {
//     console.warn("Missing audio file or username for audio upload.");
//     throw new Error("Audio file and username are required");
//   }

//   const tempMessageId = `temp-${Date.now()}`;

//   // Add temporary message to UI
//   setMessages((prev) => [
//     ...prev,
//     {
//       id: tempMessageId,
//       text: messageContent || "Uploading audio...",
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

//   try {
//     // First, upload the audio file
//     const formData = new FormData();
//     formData.append("audio", selectedFile);

//     const uploadResponse = await axios.post(
//       UPLOAD_AUDIO_REQUEST_URL,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     const { fileName, fileUrl, contentType } = uploadResponse.data;

//     // Create SendMessageRequest DTO for SignalR (match backend)
//     const sendMessageRequest = {
//       SenderUsername: userName,
//       ReceiverUsername: userData.lawyerUserName || "Lawyer", // adjust as needed
//       MessageContent: messageContent || "",
//       FileName: fileName,
//       FileUrl: fileUrl,
//       ContentType: contentType,
//       QueryCategory: queryCategory || "",
//       DepartmentName: userData.departmentName || "",
//     };

//     // Ensure SignalR connection is active before sending
//     if (!connectionRef.current || connectionRef.current.state !== "Connected") {
//       try {
//         await newConnection(); // Attempt to reconnect
//       } catch (err) {
//         alert(
//           "Unable to connect to chat server. Please check your connection and try again."
//         );
//         setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
//         setIsUploading(false);
//         throw new Error("SignalR connection not active.");
//       }
//     }
//     // Send via SignalR (use SendMessage method)
//     await sendQueryToLawyers("SendMessage", sendMessageRequest);

//     // Send via REST API
//     await axios.post(SEND_AUDIO_REQUEST_URL, sendMessageRequest, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     // Update the temporary message with success status
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.id === tempMessageId
//           ? {
//               ...msg,
//               id: Date.now(),
//               text: messageContent || "",
//               hasAttachment: true,
//               attachment: {
//                 name: fileName,
//                 fileName: fileName,
//                 type: contentType,
//                 contentType: contentType,
//                 url: fileUrl,
//                 fileUrl: fileUrl,
//                 size: selectedFile.size,
//               },
//               file: {
//                 name: fileName,
//                 fileName: fileName,
//                 type: contentType,
//                 contentType: contentType,
//                 url: fileUrl,
//                 fileUrl: fileUrl,
//                 size: selectedFile.size,
//               },
//               status: "sent",
//             }
//           : msg
//       )
//     );

//     return {
//       id: Date.now(),
//       fileName,
//       fileUrl,
//       contentType,
//     };
//   } catch (error) {
//     console.error("Error sending audio file:", error);
//     setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
//     alert(
//       error?.response?.data?.message ||
//         error?.message ||
//         "Failed to send audio. Please check your connection and try again."
//     );
//     throw error;
//   }
// };

import axios from "axios";
import { sendAudioQueryToLawyers, connectionRef } from "./ConnectToSignalR";
import * as signalR from "@microsoft/signalr";

export const uploadAndSendAudio = async (
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
      text: newMessage || "Uploading audio...",
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
    formData.append("audio", selectedFile);

    // 1. Upload audio file
    const uploadResponse = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/file/upload-audio`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { fileName, fileUrl, contentType } = uploadResponse.data;

    const safeMessageContent =
      newMessage && newMessage.trim() !== "" ? newMessage : "Audio message";
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

    try {
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        await sendAudioQueryToLawyers(messageDto);
      }
    } catch (signalRError) {
      console.error("SignalR error:", signalRError);
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
    console.error("Error sending audio file:", error);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempMessageId ? { ...msg, status: "failed" } : msg
      )
    );
    alert("Failed to send audio. Please try again.");
  } finally {
    if (setIsUploading) setIsUploading(false);
  }
};
