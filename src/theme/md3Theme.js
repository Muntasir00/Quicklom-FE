/**
 * Material Design 3 Theme Configuration
 * Blue Professional Color Scheme for QuickLocum Admin
 */

import { createTheme } from '@mui/material/styles';

// MD3 Color Tokens
const md3Colors = {
    primary: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#64748b',
        light: '#94a3b8',
        dark: '#475569',
        contrastText: '#ffffff',
    },
    success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
    },
    warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff',
    },
    error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff',
    },
    info: {
        main: '#0ea5e9',
        light: '#38bdf8',
        dark: '#0284c7',
        contrastText: '#ffffff',
    },
    background: {
        default: '#f8fafc',
        paper: '#ffffff',
    },
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    action: {
        active: '#3b82f6',
        hover: 'rgba(59, 130, 246, 0.08)',
        selected: 'rgba(59, 130, 246, 0.12)',
        disabled: 'rgba(0, 0, 0, 0.26)',
        disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
};

// MD3 Shape Tokens
const md3Shape = {
    borderRadius: 12, // Default medium
    borderRadiusSm: 8,
    borderRadiusLg: 16,
    borderRadiusXl: 28,
};

// MD3 Elevation/Shadows
const md3Shadows = [
    'none',
    '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)', // elevation 1
    '0 4px 6px rgba(15, 23, 42, 0.07), 0 2px 4px rgba(15, 23, 42, 0.06)', // elevation 2
    '0 10px 15px rgba(15, 23, 42, 0.08), 0 4px 6px rgba(15, 23, 42, 0.05)', // elevation 3
    '0 20px 25px rgba(15, 23, 42, 0.10), 0 8px 10px rgba(15, 23, 42, 0.04)', // elevation 4
    '0 25px 50px rgba(15, 23, 42, 0.12)', // elevation 5
    ...Array(19).fill('0 25px 50px rgba(15, 23, 42, 0.12)'), // Fill remaining slots
];

// Create the MD3 Theme
export const md3Theme = createTheme({
    palette: md3Colors,
    shape: {
        borderRadius: md3Shape.borderRadius,
    },
    shadows: md3Shadows,
    typography: {
        fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '1.125rem',
            fontWeight: 600,
            lineHeight: 1.5,
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
        button: {
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
            textTransform: 'none',
        },
        caption: {
            fontSize: '0.75rem',
            lineHeight: 1.5,
        },
        overline: {
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            lineHeight: 1.5,
        },
    },
    components: {
        // App Bar
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: md3Colors.text.primary,
                    boxShadow: 'none',
                    borderBottom: '1px solid #e2e8f0',
                },
            },
        },

        // Cards
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: md3Shape.borderRadiusLg,
                    boxShadow: md3Shadows[1],
                    transition: 'box-shadow 250ms cubic-bezier(0.2, 0, 0, 1), transform 250ms cubic-bezier(0.2, 0, 0, 1)',
                    '&:hover': {
                        boxShadow: md3Shadows[2],
                    },
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: '20px 24px',
                    borderBottom: '1px solid #e2e8f0',
                },
                title: {
                    fontSize: '1.125rem',
                    fontWeight: 600,
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '24px',
                    '&:last-child': {
                        paddingBottom: '24px',
                    },
                },
            },
        },

        // Buttons
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 9999, // Full rounded (pill shape)
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '10px 24px',
                    transition: 'all 150ms cubic-bezier(0.2, 0, 0, 1)',
                },
                contained: {
                    boxShadow: md3Shadows[1],
                    '&:hover': {
                        boxShadow: md3Shadows[2],
                    },
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: md3Colors.primary.dark,
                    },
                },
                outlined: {
                    borderColor: '#cbd5e1',
                    '&:hover': {
                        backgroundColor: '#dbeafe',
                        borderColor: md3Colors.primary.main,
                    },
                },
                text: {
                    '&:hover': {
                        backgroundColor: '#dbeafe',
                    },
                },
                sizeSmall: {
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                },
                sizeLarge: {
                    padding: '14px 32px',
                    fontSize: '0.9375rem',
                },
            },
        },

        // Icon Buttons
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 9999,
                    transition: 'background-color 150ms cubic-bezier(0.2, 0, 0, 1)',
                    '&:hover': {
                        backgroundColor: '#f1f5f9',
                    },
                },
                colorPrimary: {
                    '&:hover': {
                        backgroundColor: '#dbeafe',
                    },
                },
            },
        },

        // Chips
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
                filled: {
                    backgroundColor: '#e2e8f0',
                },
                colorPrimary: {
                    backgroundColor: '#dbeafe',
                    color: '#1e3a5f',
                },
                colorSuccess: {
                    backgroundColor: '#d1fae5',
                    color: '#059669',
                },
                colorWarning: {
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                },
                colorError: {
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                },
            },
        },

        // Text Fields
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        transition: 'all 150ms cubic-bezier(0.2, 0, 0, 1)',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#94a3b8',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: md3Colors.primary.main,
                            borderWidth: 2,
                        },
                    },
                },
            },
        },

        // Select
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },

        // Menu
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    boxShadow: md3Shadows[3],
                    marginTop: 8,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 8px',
                    padding: '10px 12px',
                    transition: 'background-color 150ms cubic-bezier(0.2, 0, 0, 1)',
                    '&:hover': {
                        backgroundColor: '#f1f5f9',
                    },
                    '&.Mui-selected': {
                        backgroundColor: '#dbeafe',
                        '&:hover': {
                            backgroundColor: '#bfdbfe',
                        },
                    },
                },
            },
        },

        // Data Grid
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: 'none',
                    borderRadius: 16,
                    backgroundColor: '#ffffff',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f1f5f9',
                        borderRadius: '16px 16px 0 0',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    },
                    '& .MuiDataGrid-cell': {
                        borderColor: '#e2e8f0',
                        fontSize: '0.875rem',
                    },
                    '& .MuiDataGrid-row': {
                        transition: 'background-color 150ms cubic-bezier(0.2, 0, 0, 1)',
                        '&:hover': {
                            backgroundColor: '#f8fafc',
                        },
                        '&:nth-of-type(even)': {
                            backgroundColor: '#fafbfc',
                        },
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: '2px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0 0 16px 16px',
                    },
                },
            },
        },

        // Dialogs
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 28,
                    boxShadow: md3Shadows[5],
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    padding: '24px 24px 16px',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '0 24px',
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '16px 24px 24px',
                    gap: 8,
                },
            },
        },

        // Alerts
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
                standardSuccess: {
                    backgroundColor: '#d1fae5',
                    color: '#059669',
                },
                standardError: {
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                },
                standardWarning: {
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                },
                standardInfo: {
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                },
            },
        },

        // Tooltips
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#1e293b',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    padding: '8px 12px',
                },
            },
        },

        // Badges
        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontWeight: 600,
                },
            },
        },

        // Avatars
        MuiAvatar: {
            styleOverrides: {
                root: {
                    backgroundColor: md3Colors.primary.main,
                },
            },
        },

        // Tabs
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    minHeight: 48,
                    transition: 'color 150ms cubic-bezier(0.2, 0, 0, 1)',
                },
            },
        },

        // Steppers
        MuiStepper: {
            styleOverrides: {
                root: {
                    padding: '24px 0',
                },
            },
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    fontWeight: 500,
                },
            },
        },

        // Lists
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 0',
                    transition: 'background-color 150ms cubic-bezier(0.2, 0, 0, 1)',
                    '&:hover': {
                        backgroundColor: '#f1f5f9',
                    },
                    '&.Mui-selected': {
                        backgroundColor: '#dbeafe',
                        '&:hover': {
                            backgroundColor: '#bfdbfe',
                        },
                    },
                },
            },
        },

        // Paper
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: md3Shadows[1],
                },
                elevation2: {
                    boxShadow: md3Shadows[2],
                },
                elevation3: {
                    boxShadow: md3Shadows[3],
                },
                rounded: {
                    borderRadius: 16,
                },
            },
        },

        // Dividers
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: '#e2e8f0',
                },
            },
        },

        // Circular Progress
        MuiCircularProgress: {
            styleOverrides: {
                colorPrimary: {
                    color: md3Colors.primary.main,
                },
            },
        },

        // Linear Progress
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                },
                bar: {
                    borderRadius: 4,
                },
            },
        },

        // Snackbars
        MuiSnackbar: {
            styleOverrides: {
                root: {
                    '& .MuiSnackbarContent-root': {
                        borderRadius: 8,
                        backgroundColor: '#1e293b',
                    },
                },
            },
        },

        // Autocomplete
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    boxShadow: md3Shadows[3],
                },
                option: {
                    borderRadius: 8,
                    margin: '2px 8px',
                    '&:hover': {
                        backgroundColor: '#f1f5f9',
                    },
                    '&[aria-selected="true"]': {
                        backgroundColor: '#dbeafe',
                        '&:hover': {
                            backgroundColor: '#bfdbfe',
                        },
                    },
                },
            },
        },

        // Switches
        MuiSwitch: {
            styleOverrides: {
                root: {
                    padding: 8,
                },
                track: {
                    borderRadius: 22,
                    backgroundColor: '#cbd5e1',
                },
                thumb: {
                    boxShadow: md3Shadows[1],
                },
            },
        },

        // Checkboxes
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    transition: 'color 150ms cubic-bezier(0.2, 0, 0, 1)',
                },
            },
        },

        // Radio
        MuiRadio: {
            styleOverrides: {
                root: {
                    transition: 'color 150ms cubic-bezier(0.2, 0, 0, 1)',
                },
            },
        },
    },
});

export default md3Theme;
