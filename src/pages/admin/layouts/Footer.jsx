import React from "react";
import { Box, Typography, Divider } from "@mui/material";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: 2,
                px: 3,
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
            }}
        >
            <Typography
                sx={{
                    fontSize: 13,
                    color: '#64748b',
                }}
            >
                © {currentYear} QuickLocum. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                    sx={{
                        fontSize: 13,
                        color: '#94a3b8',
                    }}
                >
                    Version
                </Typography>
                <Box
                    sx={{
                        px: 1.5,
                        py: 0.25,
                        backgroundColor: '#f1f5f9',
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#3b82f6',
                        }}
                    >
                        1.0.0
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;
