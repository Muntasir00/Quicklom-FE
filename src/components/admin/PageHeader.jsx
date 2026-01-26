import React from "react";
import { Box, Typography, Button, IconButton, Tooltip, Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

/**
 * MD3 Page Header Component
 *
 * @param {string} title - Page title
 * @param {string} subtitle - Optional subtitle
 * @param {React.ReactNode} icon - Page icon component
 * @param {Array} breadcrumbs - Array of {label, path} objects
 * @param {string} actionLabel - Label for action button
 * @param {string} actionPath - Path for action button
 * @param {React.ReactNode} actionIcon - Icon for action button
 * @param {React.ReactNode} actions - Custom actions (replaces default button)
 */
const PageHeader = ({
    title,
    subtitle,
    icon,
    breadcrumbs = [],
    actionLabel,
    actionPath,
    actionIcon = <AddRoundedIcon />,
    actions,
}) => {
    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                px: 4,
                py: 3,
                borderRadius: '0 0 24px 24px',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                mb: 3,
            }}
        >
            {/* Background decoration */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -80,
                    right: -80,
                    width: 250,
                    height: 250,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                    <Breadcrumbs
                        separator={<NavigateNextRoundedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />}
                        sx={{ mb: 1.5 }}
                    >
                        {breadcrumbs.map((crumb, index) => (
                            <Typography
                                key={index}
                                component={crumb.path ? Link : 'span'}
                                to={crumb.path}
                                sx={{
                                    fontSize: 13,
                                    color: index === breadcrumbs.length - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                                    textDecoration: 'none',
                                    '&:hover': crumb.path ? { color: '#fff' } : {},
                                }}
                            >
                                {crumb.label}
                            </Typography>
                        ))}
                    </Breadcrumbs>
                )}

                {/* Title and Actions */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {icon && (
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2.5,
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {React.cloneElement(icon, { sx: { fontSize: 24, color: '#fff' } })}
                            </Box>
                        )}
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 24,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, mt: 0.25 }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Action Button */}
                    {actions ? (
                        actions
                    ) : actionLabel && actionPath ? (
                        <Button
                            component={Link}
                            to={actionPath}
                            variant="contained"
                            startIcon={actionIcon}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 25,
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                fontSize: 14,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {actionLabel}
                        </Button>
                    ) : null}
                </Box>
            </Box>
        </Box>
    );
};

export default PageHeader;
