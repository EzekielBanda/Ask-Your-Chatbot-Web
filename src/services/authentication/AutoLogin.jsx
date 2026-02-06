import { useEffect, useRef } from "react";
import axios from "axios";

const AutoLogin = ({ onSuccess, onError }) => {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    const attemptAutoLogin = async () => {
      const skipAutoLogin = sessionStorage.getItem("skipAutoLogin");
      if (skipAutoLogin) {
        sessionStorage.removeItem("skipAutoLogin");
        return;
      }

      try {
        const REFRESH_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`;
        const { data } = await axios.post(REFRESH_URL, {}, {
          withCredentials: true,
          headers: { "Content-Type": "application/json", accept: "*/*" },
        });

        const token = data.data?.accessToken || data.data?.AccessToken;
        if (token) {
          onSuccess(data);
        }
      } catch (err) {
        // Silent fail
      }
    };

    attemptAutoLogin();
  }, [onSuccess, onError]);

  return null;
};

export default AutoLogin;
