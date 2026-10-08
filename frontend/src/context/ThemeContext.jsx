import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Lazy init: check localStorage first (user's saved preference), then
  // fall back to the OS-level preference via a media query, then default
  // to light. This means first-time visitors on a dark-mode OS/browser
  // automatically see a dark UI, without us asking them to choose.
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;

    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  // Whenever "theme" changes, two things need to happen:
  // 1. Persist the choice so it survives a page refresh.
  // 2. Set the "data-bs-theme" attribute on <html> - this is the exact
  //    hook Bootstrap 5.3+ looks for to automatically re-color EVERY
  //    Bootstrap component (cards, navbars, forms, tables...) for dark
  //    mode, without us manually re-styling each one.
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
