import React, { useState, useEffect } from "react";

const TestDarkMode = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="h-screen bg-white dark:bg-black text-black dark:text-white">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 bg-gray-300 dark:bg-gray-700 rounded"
      >
        Toggle Theme
      </button>
    </div>
  );
};

export default TestDarkMode;