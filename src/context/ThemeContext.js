import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const theme = {
  colors: {
    primary: '#00D4FF',      // Electric blue
    secondary: '#7C3AED',    // Electric purple
    accent: '#FF0080',       // Electric pink
    background: '#0a0a0a',   // Deep black
    surface: '#1a1a1a',      // Dark gray
    glass: 'rgba(255, 255, 255, 0.1)', // Glass effect
    text: '#ffffff',         // Pure white
    textSecondary: '#b0b0b0', // Light gray
    success: '#00FF88',      // Electric green
    warning: '#FFB800',      // Electric yellow
    error: '#FF4444',        // Electric red
    overlay: 'rgba(0, 0, 0, 0.8)',
    glow: 'rgba(0, 212, 255, 0.3)',
  },
  gradients: {
    primary: ['#00D4FF', '#7C3AED'],
    secondary: ['#FF0080', '#7C3AED'],
    accent: ['#00FF88', '#00D4FF'],
    background: ['#0a0a0a', '#1a1a1a', '#2a2a2a'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    round: 50,
  },
  shadows: {
    glow: {
      shadowColor: '#00D4FF',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 20,
    },
    purple: {
      shadowColor: '#7C3AED',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 20,
    },
    pink: {
      shadowColor: '#FF0080',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 20,
    },
  },
  animations: {
    fast: 150,
    medium: 300,
    slow: 500,
  },
};

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 