import axios from "axios";

export const fetchChatByCategory = async (userName, category) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  if (!BASE_URL) {
    console.error("API base URL not configured");
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/chat/history/${userName}`, {
      params: {
        page: 1,
        size: 50,
        _t: Date.now() // Cache busting
      },
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
    });

    const messages = response.data?.data?.items || response.data?.items || response.data || [];
    
    console.log("Raw messages from API:", messages);
    console.log("Filtering by category:", category);
    
    // Filter messages by category if category is provided
    if (category && Array.isArray(messages)) {
      const filtered = messages.filter(msg => {
        console.log(`Comparing: '${msg.queryCategory}' === '${category}'`);
        return msg.queryCategory === category;
      });
      console.log("Filtered result:", filtered);
      return filtered;
    }
    
    return messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};