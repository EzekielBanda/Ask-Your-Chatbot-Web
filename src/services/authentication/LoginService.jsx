import axios from "axios";

// export const loginUser = async (credentials) => {
//   const LOG_IN_REQUEST_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/login`;
//   const { data } = await axios.post(LOG_IN_REQUEST_URL, {
//     email: credentials.userName,
//     password: credentials.password,
//   }, {
//     withCredentials: true,
//     headers: {
//       "Content-Type": "application/json",
//       accept: "*/*",
//     },
//   });
//   return data;
// };

//BYPASS: Return mock login data for testing without real backend call
export const loginUser = async (credentials) => {
	console.log("Bypassing actual login request...");
	return {
		data: {
			userName: credentials.userName,
			role: "User",
			isProfileCompleted: true,
		},
	};
};

export const handleLoginResponse = (
  loginData,
  credentials,
  navigate,
  onLogin
) => {
  const userData = loginData.data || loginData;
  let userName = userData.username || userData.Username;
  const role = userData.role || userData.Role;
  const isProfileCompleted = userData.isProfileCompleted ?? userData.IsProfileCompleted;
  const accessToken = userData.accessToken || userData.AccessToken;

  if (accessToken) {
    sessionStorage.setItem("accessToken", accessToken);
    
    // Extract username from JWT if not in response
    if (!userName) {
      try {
        const token = accessToken.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        userName = payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      } catch (e) {
        userName = sessionStorage.getItem("userName");
      }
    }
  }

  if (role && role !== "User") {
    throw new Error("Access restricted to regular users only");
  }

  const finalUserName = userName || sessionStorage.getItem("userName");
  if (finalUserName) {
    sessionStorage.setItem("userName", finalUserName);
    sessionStorage.setItem("userId", userData.userId || finalUserName);

    const profileCompleted = isProfileCompleted !== false && isProfileCompleted !== undefined;
    const userObject = {
      userName: finalUserName,
      userId: userData.userId || credentials?.userName || finalUserName,
      avatar: userData.avatar || finalUserName.charAt(0).toUpperCase(),
      status: "active",
      isProfileCompleted: profileCompleted,
      role: role || "User",
    };

    // Store profile completion status in sessionStorage
    sessionStorage.setItem("isProfileCompleted", profileCompleted.toString());

    onLogin(userObject);
    
    if (profileCompleted || isProfileCompleted === undefined) {
      navigate("/chat");
    } else {
      navigate("/complete-profile", { state: { userName: finalUserName } });
    }
  }
};

/**
 * Refresh access token using the refresh token stored in HTTP-only cookie
 * The refresh token is automatically sent by the browser with credentials: "include"
 */
export const refreshAccessToken = async () => {
  const REFRESH_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`;

  try {
    const { data } = await axios.post(REFRESH_URL, {}, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    if (data.data?.accessToken) {
      sessionStorage.setItem("accessToken", data.data.accessToken);
      return data.data.accessToken;
    }

    throw new Error("No access token in refresh response");
  } catch (error) {
    console.error("Token refresh error:", error);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userId");
    throw error;
  }
};

/**
 * Revoke the refresh token (logout)
 */
export const revokeRefreshToken = async () => {
  const REVOKE_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/revoke`;

  try {
    const accessToken = sessionStorage.getItem("accessToken");

    await axios.post(REVOKE_URL, {}, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken || "",
        accept: "*/*",
      },
    });
  } catch (error) {
    console.error("Token revoke error:", error);
  }
};


export const logout = async (navigate) => {
  // TODO: Uncomment once backend revoke endpoint is fixed
  // try {
  //   const REVOKE_URL = `${import.meta.env.VITE_API_BASE_URL}/v1/auth/revoke`;
  //   const accessToken = sessionStorage.getItem("accessToken");
  //   await axios.post(REVOKE_URL, {}, {
  //     withCredentials: true,
  //     headers: { "Content-Type": "application/json", Authorization: accessToken || "" },
  //   });
  // } catch (err) {
  //   console.error("Logout error:", err);
  // }
  
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem("skipAutoLogin", "true");
  navigate("/");
};

/**
 * Setup axios interceptor or fetch wrapper for automatic token refresh
 * Call this once on app initialization
 */
export const setupTokenRefreshInterceptor = (fetchFn) => {
  return async (url, options = {}) => {
    let response = await fetchFn(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        Authorization: sessionStorage.getItem("accessToken") || "",
      },
    });

    // If 401 Unauthorized, try to refresh token
    if (response.status === 401) {
      try {
        await refreshAccessToken();
        // Retry request with new token
        response = await fetchFn(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options.headers,
            Authorization: sessionStorage.getItem("accessToken") || "",
          },
        });
      } catch (error) {
        console.error("Failed to refresh token, please login again");
        // Redirect to login
        window.location.href = "/";
      }
    }

    return response;
  };
};
