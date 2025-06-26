import React, { useState, useEffect } from "react";
import { Aurora } from "./aurora"; // Adjust path if needed

const DemoAurora = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Example color stops for light and dark themes
  const lightThemeColors = ["#11b53f", "#16c946", "#0d8a2f"]; // Your green theme
  const darkThemeColors = ["#0d8a2f", "#1f2937", "#11b53f"]; // Dark green variations

  const [auroraColors, setAuroraColors] = useState(darkThemeColors);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');

    // Default to dark mode if no preference is stored
    if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
      setAuroraColors(lightThemeColors);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
      setAuroraColors(darkThemeColors);
      localStorage.setItem('theme', 'dark'); // Set dark as default
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setAuroraColors(darkThemeColors);
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setAuroraColors(lightThemeColors);
      }
      return newMode;
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center
                   bg-slate-100 dark:bg-slate-950
                   py-10 px-4 relative overflow-hidden transition-colors duration-300">

      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={auroraColors}
          blend={0.6} // More intense blend for dark theme
          amplitude={1.0} // More dynamic amplitude
          speed={0.2} // Slightly faster speed
        />
      </div>

      {/* Demo content */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Aurora Background Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Beautiful animated background for your Pneuma BookStore
        </p>
        <button
          onClick={toggleDarkMode}
          className="px-6 py-3 bg-white/20 backdrop-blur-sm text-gray-900 dark:text-white
                     rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
        >
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>
    </div>
  );
};

export { DemoAurora };
