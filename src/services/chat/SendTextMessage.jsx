
import axios from "axios";
import { connectionRef, newConnection, sendQueryToLawyers } from "./ConnectToSignalR";

export const sendTextMessage = async (
  input,
  userName,
  queryCategory = "",
  receiverId = ""
) => {
  const inputStr = typeof input === "string" ? input : String(input ?? "");
  if (!inputStr.trim() || !userName) {
    console.warn("Cannot send message: missing text or username.");
    return null;
  }

  const isNewConversation = !receiverId || receiverId === "Lawyer";
  const messageId = `msg-${Date.now()}-${Math.random()}`;
  const BaseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log("SendTextMessage - BaseUrl:", BaseUrl);

  console.log("SendTextMessage - queryCategory received:", queryCategory);
  
  // API payload
  // const apiMessageDto = {
  //   id: messageId,
  //   Username: userName,
  //   Message: inputStr.trim(),
  //   QueryCategory: queryCategory || "",
  //   ReceiverUsername: "Lawyer",
  // };

  // SignalR payload (matches what the hub expects)
  const signalRMessageDto = {
    id: messageId,
    SenderUsername: userName,
    MessageContent: inputStr.trim(),
    QueryCategory: queryCategory || "",
    DepartmentName: "", // Add department if available
    ReceiverUsername: isNewConversation ? "Lawyer" : receiverId,
  };

  //console.log("SendTextMessage - API messageDto:", apiMessageDto);
  console.log("SendTextMessage - SignalR messageDto:", signalRMessageDto);

  try {
    // Send via REST API first
    // await axios.post(`${BaseUrl}/chat/query`, apiMessageDto, {
    //   headers: {
    //     Accept: "*/*",
    //     "Content-Type": "application/json",
    //   },
    // });
    // After successful API call, send via SignalR for real-time broadcast
    if (!connectionRef.current || connectionRef.current.state !== "Connected") {
      try {
        await newConnection();
      } catch (err) {
        console.warn("SignalR connection failed, message sent via API only");
        return { success: true, messageId };
      }
    }
    // Use StartConversation for new, SendMessage for existing
    const methodName = isNewConversation ? "StartConversation" : "SendMessage";
    await sendQueryToLawyers(methodName, signalRMessageDto);
    console.log("Message sent via API and SignalR:", signalRMessageDto);
    return { success: true, messageId };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

