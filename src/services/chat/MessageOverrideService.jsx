// MessageOverrideService.jsx - Handles message override functionality
import { sendQueryToLawyers } from "./ConnectToSignalR";

export const overrideAutoMessage = async (autoMessageId, realMessageDto) => {
  try {
    const overrideData = {
      autoMessageId,
      realMessage: realMessageDto,
      timestamp: new Date().toISOString()
    };

    // Send override command via SignalR
    await sendQueryToLawyers("OverrideAutoMessage", overrideData);
    
    console.log("🔄 Message override sent:", overrideData);
    return true;
  } catch (error) {
    console.error("❌ Failed to override auto-message:", error);
    throw error;
  }
};

export const sendLawyerReply = async (messageDto, originalMessageId = null) => {
  try {
    const replyDto = {
      ...messageDto,
      originalMessageId,
      timestamp: new Date().toISOString(),
      isLawyerReply: true
    };

    // Send lawyer reply via SignalR
    await sendQueryToLawyers("SendLawyerReply", replyDto);
    
    console.log("📤 Lawyer reply sent:", replyDto);
    return true;
  } catch (error) {
    console.error("❌ Failed to send lawyer reply:", error);
    throw error;
  }
};