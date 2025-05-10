/**
 * Color palette for the Chess application
 * These colors provide good contrast while maintaining a cohesive design
 */

// Light mode colors
export const lightColors = {
  // Primary colors
  primary: '#1976d2',
  primaryLight: '#4791db',
  primaryDark: '#115293',
  
  // Secondary colors
  secondary: '#7b1fa2',
  secondaryLight: '#9c27b0',
  secondaryDark: '#4a148c',
  
  // Accent colors
  accent: '#ff9800',
  accentLight: '#ffb74d',
  accentDark: '#f57c00',
  
  // Game-related colors
  white: '#f5f5f5',
  whitePieces: '#ffffff',
  blackPieces: '#212121',
  validMoves: 'rgba(25, 118, 210, 0.4)',
  checkHighlight: 'rgba(255, 82, 82, 0.6)',
  selectedSquare: 'rgba(252, 224, 91, 0.7)',
  
  // Background colors
  background: '#ffffff',
  surfacePrimary: '#f5f7fa',
  surfaceSecondary: '#e9ecef',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#9e9e9e',
  
  // Status colors
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  draw: '#ff9800',
  
  // Border colors
  border: '#e0e0e0',
  divider: '#eeeeee'
};

// Dark mode colors
export const darkColors = {
  // Primary colors
  primary: '#90caf9',
  primaryLight: '#bbdefb',
  primaryDark: '#2196f3',
  
  // Secondary colors
  secondary: '#ce93d8',
  secondaryLight: '#e1bee7',
  secondaryDark: '#9c27b0',
  
  // Accent colors
  accent: '#ffb74d',
  accentLight: '#ffe0b2',
  accentDark: '#ff9800',
  
  // Game-related colors
  white: '#424242',
  whitePieces: '#ffffff',
  blackPieces: '#212121',
  validMoves: 'rgba(144, 202, 249, 0.5)',
  checkHighlight: 'rgba(255, 82, 82, 0.6)',
  selectedSquare: 'rgba(252, 224, 91, 0.5)',
  
  // Background colors
  background: '#121212',
  surfacePrimary: '#1e1e1e',
  surfaceSecondary: '#2c2c2c',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#b0bec5',
  textDisabled: '#757575',
  
  // Status colors
  success: '#66bb6a',
  error: '#f44336',
  warning: '#ffa726',
  info: '#29b6f6',
  draw: '#ffa726',
  
  // Border colors
  border: '#424242',
  divider: '#424242'
};

// Common styles for buttons, cards, etc.
export const commonStyles = {
  buttonRadius: '4px',
  cardRadius: '8px',
  transition: '0.3s ease-in-out',
  boxShadowLight: '0 2px 4px rgba(0,0,0,0.1)',
  boxShadowMedium: '0 4px 8px rgba(0,0,0,0.1)',
  boxShadowHeavy: '0 8px 16px rgba(0,0,0,0.1)',
  fontPrimary: "'Roboto', 'Segoe UI', sans-serif",
  fontSecondary: "'Open Sans', 'Helvetica', sans-serif",
};

// Get colors based on theme
export const getColors = (isDarkMode) => isDarkMode ? darkColors : lightColors;
