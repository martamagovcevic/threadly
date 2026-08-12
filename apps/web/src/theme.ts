import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e6b5e' },
    secondary: { main: '#a35b1a' },
    background: { default: '#f7f4ef' },
  },
  typography: {
    fontFamily: ['Georgia', '"Times New Roman"', 'serif'].join(','),
    h1: { fontFamily: 'Georgia, serif' },
    h2: { fontFamily: 'Georgia, serif' },
    h3: { fontFamily: 'Georgia, serif' },
  },
  shape: {
    borderRadius: 8,
  },
})
