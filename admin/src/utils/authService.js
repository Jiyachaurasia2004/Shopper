import { jwtDecode } from "jwt-decode";

/**
 * Clears old tokens that don't have a 'role' field.
 * This handles the migration from old token format to new format.
 * Returns true if a stale token was found and cleared.
 */
export const clearStaleToken = () => {
  const token = localStorage.getItem("auth-token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.role) {
      console.warn("Stale token detected (no role field) — clearing. Please log in again.");
      localStorage.removeItem("auth-token");
      return true; // stale token was cleared
    }
    return false;
  } catch {
    // Invalid token — clear it
    localStorage.removeItem("auth-token");
    return true;
  }
};

/**
 * Returns true if the current token belongs to an admin user.
 */
export const isAdmin = () => {
  const token = localStorage.getItem("auth-token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded JWT Token:", decoded);
    return decoded.role === "admin";
  } catch (error) {
    console.error("Auth Check — Token invalid or expired", error);
    return false;
  }
};

/**
 * Logs the user out and redirects to admin login.
 */
export const logout = (navigate) => {
  localStorage.removeItem("auth-token");
  if (navigate) {
    navigate("/admin-login");
  } else {
    window.location.replace("/admin-login");
  }
};

/**
 * Returns the raw auth token from localStorage.
 */
export const getAuthToken = () => {
  return localStorage.getItem("auth-token");
};
