import axios from "axios";

// Create a pre-configured Axios instance. Every request made with "api"
// automatically uses this baseURL, so components just write api.get("/products")
// instead of the full URL every time.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// --------------------------------------------------------------
// REQUEST INTERCEPTOR
// --------------------------------------------------------------
// This function runs BEFORE every single request sent through "api".
// We use it to automatically attach the JWT token (if the user is
// logged in) to the Authorization header - so we never have to
// remember to do this manually in every component.
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --------------------------------------------------------------
// RESPONSE INTERCEPTOR
// --------------------------------------------------------------
// This runs after every response. If the backend ever responds with
// 401 (Unauthorized) - meaning our token expired or is invalid - we
// automatically log the user out and send them to the login page,
// instead of leaving them stuck on a broken page.
api.interceptors.response.use(
  (response) => response, // pass successful responses through unchanged
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo");
      // Avoid an infinite redirect loop if we're already on the login page.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // Re-throw so the calling component's try/catch (or .catch()) still runs.
    return Promise.reject(error);
  }
);

export default api;
