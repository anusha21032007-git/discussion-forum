import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Load saved theme on first render
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
  }, []);

  // Apply theme to document and persist it
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
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