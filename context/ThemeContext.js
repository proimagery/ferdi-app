import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
const THEME_KEY = '@ferdi_dark_mode';

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
  inputBorder: '#c0c0c0',
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
  inputBackground: '#252525',
  inputBorder: '#404040',
  shadow: '#000000',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(value => {
      if (value !== null) {
        setIsDarkMode(value === 'true');
      }
    });
  }, []);

  const toggleTheme = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    AsyncStorage.setItem(THEME_KEY, String(newValue));
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
