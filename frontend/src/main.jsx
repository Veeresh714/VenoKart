import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

// ReactDOM.createRoot attaches our React app to the <div id="root"> in
// index.html. This is the React 18 way of starting an app (replaced
// the older ReactDOM.render API).
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing using the browser's
        History API - lets us navigate between "pages" without full reloads. */}
    <BrowserRouter>
      {/* Providers are nested based on dependency: CartProvider calls
          useAuth() internally, so AuthProvider MUST wrap it. ThemeProvider
          is independent of the other two, so its position doesn't matter -
          it's placed outermost here just to keep theme concerns separate. */}
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
