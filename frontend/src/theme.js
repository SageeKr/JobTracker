// src/theme.js
import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#88AB8E',
      light: '#AFC8AD',
      dark: '#425F57',
      contrastText: '#F2F1EB',
    },
    secondary: {
      main: '#425F57',
      light: '#EEE7DA',
      dark: '#88AB8E',
      contrastText: '#F2F1EB',
    },
    background: {
      default: '#F2F1EB',
      paper: '#FAF9F6',
    },
    text: {
      primary: '#425F57',
      secondary: '#88AB8E',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      color: '#425F57',
    },
    h2: {
      fontWeight: 700,
      color: '#425F57',
    },
    body1: {
      fontWeight: 400,
      color: '#88AB8E',
    },
  },
});

export default theme;
