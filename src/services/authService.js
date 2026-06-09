import axios from "axios";

// Replace with your actual backend API URL
const API_URL = import.meta.env.VITE_API_URL || "https://api.example.com";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

/**
 * Service to handle local and SSO authentication logic, token storage, and user role management.
 */
export const authService = {
  /**
   * Log in user with local credentials (fallback login)
   * @param {string} email
   * @param {string} password
   * @param {boolean} rememberMe
   * @returns {Promise<object>} User data and role
   */
  login: async (email, password, rememberMe = false) => {
    const useMock = import.meta.env.VITE_USE_MOCK === "true";

    if (useMock) {
      // Simulate network request delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const normalizedEmail = email.toLowerCase().trim();
      let role = null;
      let name = "User";

      if (normalizedEmail === "admin@company.com" && password === "adminpass") {
        role = "Administrator";
        name = "Alex Administrator";
      } else if (
        normalizedEmail === "support@company.com" &&
        password === "supportpass"
      ) {
        role = "IT Support Engineer";
        name = "Sam Support";
      } else if (
        normalizedEmail === "lead@company.com" &&
        password === "leadpass"
      ) {
        role = "Team Lead";
        name = "Tanya Teamlead";
      } else if (
        normalizedEmail === "employee@company.com" &&
        password === "employeepass"
      ) {
        role = "Employee";
        name = "Emily Employee";
      }

      if (role) {
        const token = "mock-jwt-token-key-12345";
        const user = { id: "mock-user-id", email, name, role };

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, token);
        storage.setItem(USER_KEY, JSON.stringify(user));

        localStorage.setItem("is_authenticated", "true");
        localStorage.setItem("user_role", role);

        return { token, user };
      } else {
        throw new Error("Invalid email or password. Please try again.");
      }
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      // backend API returns response wrapped in ApiResponse structure
      const apiResponse = response.data;
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse?.message || "Authentication failed.");
      }

      const { token, user } = apiResponse.data;

      // Store token and user details
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, token);
      storage.setItem(USER_KEY, JSON.stringify(user));

      // Also write to localStorage for simpler protected route checks across tabs
      localStorage.setItem("is_authenticated", "true");
      localStorage.setItem("user_role", user.role);

      return { token, user };
    } catch (error) {
      if (error.response) {
        // Server responded with non-2xx status
        const apiResponse = error.response.data;
        const message = apiResponse?.message || "Authentication failed.";
        const errors =
          apiResponse?.errors && apiResponse.errors.length > 0
            ? apiResponse.errors.join(" ")
            : "";
        throw new Error(errors ? `${message} ${errors}` : message);
      } else if (error.request) {
        // No response received (network error)
        throw new Error(
          "Network error. Please make sure the backend API is running.",
        );
      } else {
        throw new Error(
          error.message || "An unexpected error occurred. Please try again.",
        );
      }
    }
  },

  /**
   * Save authentication info after a successful Microsoft SSO sign-in
   * @param {object} msalResponse
   */
  handleMsalLoginSuccess: async (msalResponse) => {
    try {
      // Typically, you would send the msalResponse.idToken to your backend API
      // to exchange it for a local JWT token and fetch user details/role.
      // Example:
      // const response = await axios.post(`${API_URL}/api/auth/msal-login`, { token: msalResponse.idToken });
      // const { token, user } = response.data;

      // For demonstration, we simulate backend exchange or decode claims
      const token = msalResponse.idToken || msalResponse.accessToken;
      const email = msalResponse.account?.username;
      const name = msalResponse.account?.name || msalResponse.account?.username;

      // Mock user extraction logic based on email rules or claim lookup
      // In real scenarios, roles come from the appRoles claim in the idToken or a database fetch
      let role = "Employee";
      if (email.toLowerCase().includes("admin")) {
        role = "Administrator";
      } else if (
        email.toLowerCase().includes("support") ||
        email.toLowerCase().includes("engineer")
      ) {
        role = "IT Support Engineer";
      } else if (
        email.toLowerCase().includes("lead") ||
        email.toLowerCase().includes("manager")
      ) {
        role = "Team Lead";
      }

      const user = {
        email,
        name,
        role,
        id: msalResponse.account?.localAccountId || "sso-user",
      };

      // Save token and user details in session storage
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));

      // Also update localStorage for persistence / protected routing
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem("is_authenticated", "true");
      localStorage.setItem("user_role", role);

      return { token, user };
    } catch (error) {
      console.error("Error handling MSAL login success:", error);
      throw new Error("Failed to process Microsoft login credentials.");
    }
  },

  /**
   * Check if user is currently authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  /**
   * Get current authenticated user details
   * @returns {object|null}
   */
  getCurrentUser: () => {
    const userStr =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Get current user's role
   * @returns {string|null}
   */
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user ? user.role : null;
  },

  /**
   * Log out the user and clear auth storage
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("is_authenticated");
    localStorage.removeItem("user_role");
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};
