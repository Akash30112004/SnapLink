// Theme configuration for SnapLink
export const theme = {
  colors: {
    primary: {
      50: '#e6f2ed',
      100: '#cce5db',
      200: '#99cbb7',
      300: '#66b193',
      400: '#33976f',
      500: '#013220', // Main dark green
      600: '#012819',
      700: '#011e13',
      800: '#01140c',
      900: '#000a06',
      950: '#000503',
    },
    light: {
      bg: '#ffffff',
      card: '#f8f9fa',
      hover: '#e9ecef',
      border: '#dee2e6',
      text: '#212529',
      muted: '#6c757d',
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.35)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  }
};

export default theme;
