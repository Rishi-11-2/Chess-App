import React, { createContext, useState, useEffect } from 'react';
import { getColors, commonStyles } from '../theme/colors';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored != null) setDarkMode(JSON.parse(stored));
  }, []);

  // Save theme and update body class
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = getColors(true).background;
      document.body.style.color = getColors(true).textPrimary;
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = getColors(false).background;
      document.body.style.color = getColors(false).textPrimary;
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  // Get theme colors based on current mode
  const colors = getColors(darkMode);

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      colors, 
      styles: commonStyles 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
