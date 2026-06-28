import { createTheme } from '@mui/material/styles';
import ral from './palette';

const theme = createTheme({
  palette: {
    primary: {
      main: ral.primary,
      light: ral.primaryLight,
      dark: ral.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: ral.accent,
      light: ral.accentLight,
      dark: ral.accentDark,
      contrastText: '#FFFFFF',
    },
    background: {
      default: ral.bgDefault,
      paper: ral.bgPaper,
    },
    text: {
      primary: ral.textPrimary,
      secondary: ral.textSecondary,
    },
    success: { main: ral.success },
    warning: { main: ral.warning },
    error: { main: ral.error },
    info: { main: ral.info },
  },
  typography: {
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: { borderColor: ral.border },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, backgroundColor: '#F0F4F8' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default theme;
