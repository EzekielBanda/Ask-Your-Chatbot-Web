import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import AutoLogin from "../services/authentication/AutoLogin";
import legalImage from "../assets/legal.jpg";
import {
  loginUser,
  handleLoginResponse,
} from "../services/authentication/LoginService";

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginData = await loginUser(formData);
      handleLoginResponse(loginData, formData, navigate, onLogin);
    } catch (err) {
      setError(
        err.message || "Authentication failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLoginSuccess = useCallback(
    (data) => {
      handleLoginResponse(data, formData, navigate, onLogin);
    },
    [formData, navigate, onLogin],
  );

  const handleAutoLoginError = useCallback((err) => {
    console.error("Auto-login error:", err);
  }, []);

  return (
    <div
      className="flex items-center justify-center h-screen w-screen relative p-4 overflow-x-hidden"
      style={{
        WebkitAppRegion: "drag",
        backgroundImage: `url(${legalImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/30 z-0" />

      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden p-6 relative z-10">
        <AutoLogin
          onSuccess={handleAutoLoginSuccess}
          onError={handleAutoLoginError}
        />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">
            Ask Your Lawyer Chatbot
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Please Login to access legal support
          </p>
        </div>

        {error && (
          <div
            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
          aria-label="Login form"
        >
          <div style={{ WebkitAppRegion: "no-drag" }}>
            <label
              htmlFor="username-input"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username-input"
              name="userName"
              type="text"
              required
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              aria-required="true"
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <div style={{ WebkitAppRegion: "no-drag" }}>
            <label
              htmlFor="password-input"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password-input"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              aria-required="true"
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center text-sm"
            style={{ WebkitAppRegion: "no-drag" }}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-4 w-4 text-white animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
