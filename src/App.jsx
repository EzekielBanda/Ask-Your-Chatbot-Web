import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
 //HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import ChatWindow from "./Pages/ChatWindow";
import CompleteProfilePage from "./Pages/CompleteProfilePage";
import { logout } from "./services/authentication/LoginService";
// import { startGlobalChatPolling } from "./services/dataExtraction/chatPolling";

function AppContent() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Development mode: Set to false for production with real login
  const isDevelopment = false;

  // Restore user data from sessionStorage on app load
  useEffect(() => {
    const userName = sessionStorage.getItem("userName");
    const userId = sessionStorage.getItem("userId");
    const accessToken = sessionStorage.getItem("accessToken");
    const isProfileCompleted = sessionStorage.getItem("isProfileCompleted");

    if (userName && accessToken) {
      setUserData({
        userName,
        userId: userId || userName,
        avatar: userName.charAt(0).toUpperCase(),
        status: "active",
        isProfileCompleted: isProfileCompleted === "true",
      });
      
      if (isProfileCompleted === "true") {
        navigate("/chat");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (isDevelopment && !userData) {
      // Auto-login in development mode for testing
      const testUser = {
        userName: "Test User",
        userId: "test-123",
        avatar: "T",
        status: "active",
        isProfileCompleted: true,
      };
      setUserData(testUser);
      navigate("/chat");
    }
  }, [isDevelopment, userData, navigate]);



  const handleProfileComplete = (response) => {
    sessionStorage.setItem("isProfileCompleted", "true");
    setUserData((prev) => ({
      ...prev,
      isProfileCompleted: true,
    }));
  };

  const handleLogout = async () => {
    setUserData(null);
    await logout(navigate);
    navigate("/login");
  };

  //  useEffect(() => {
  //   const username = localStorage.getItem("userName");
  //   if (username) {
  //     startGlobalChatPolling(username, (messages) => {
  //       console.log("New messages from polling:", messages);
  //     });
  //   }
  // }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage onLogin={setUserData} />} />
          <Route
            path="/chat"
            element={
              userData?.isProfileCompleted ? (
                <ChatWindow userData={userData} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/complete-profile"
            element={
              <CompleteProfilePage onProfileComplete={handleProfileComplete} />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename="/nbs-legal-chatbot">
      <AppContent />
    </Router>
  );
}

export default App;
