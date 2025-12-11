import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const lightTheme = {
  background: '#ffffff',
  cardBackground: '#f5f5f5',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e0e0e0',
  primary: '#4ade80',
  primaryDark: '#22c55e',
  secondary: '#60a5fa',
  danger: '#ef4444',
  warning: '#fbbf24',
  purple: '#a78bfa',
  pink: '#f472b6',
  orange: '#fb923c',
  inputBackground: '#ffffff',
  inputBorder: '#e0e0e0',
  shadow: '#000000',
};

export const darkTheme = {
  background: '#0a0a0a',
  cardBackground: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#888888',
  border: '#2a2a2a',
  primary: '#4ade80',
  primaryDark: '#22c55e',
  secondary: '#60a5fa',
  danger: '#ef4444',
  warning: '#fbbf24',
  purple: '#a78bfa',
  pink: '#f472b6',
  orange: '#fb923c',
  inputBackground: '#1a1a1a',
  inputBorder: '#2a2a2a',
  shadow: '#000000',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
