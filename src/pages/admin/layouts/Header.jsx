import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Box,
    Typography,
    Divider,
    Avatar,
    ListItemIcon,
    ListItemText,
    InputBase,
    Tooltip,
    Paper,
} from "@mui/material";

// MUI Icons
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import CircleIcon from "@mui/icons-material/Circle";

import { logoutService } from '../../../services/admin/AuthService';
import { useHeader } from "@hooks/admin/layouts/useHeader";

const Header = () => {
    const {
        navigate,
        menu,
        SESSION,
        notificationStatistics,
        notifications,
        format,
    } = useHeader();

    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [profileAnchor, setProfileAnchor] = useState(null);

    const handleNotificationOpen = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleProfileOpen = (event) => {
        setProfileAnchor(event.currentTarget);
    };

    const handleProfileClose = () => {
        setProfileAnchor(null);
    };

    const handleLogout = async () => {
        handleProfileClose();
        const status = await logoutService();
        if (status === true) {
            navigate("/admin/login");
        }
    };

    const unreadCount = notificationStatistics?.total_notifications || 0;

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                color: '#0f172a',
            }}
        >
            <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: 64 }}>
                {/* Left Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Mobile Menu Toggle - Hidden for now as sidebar is fixed */}
                    <IconButton
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            color: '#64748b',
                            '&:hover': { backgroundColor: '#f1f5f9' },
                        }}
                    >
                        <MenuRoundedIcon />
                    </IconButton>

                    {/* Search Bar */}
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#f1f5f9',
                            borderRadius: 25,
                            px: 2,
                            py: 0.75,
                            width: { xs: 180, sm: 280, md: 320 },
                            transition: 'all 0.2s ease',
                            '&:focus-within': {
                                backgroundColor: '#ffffff',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                                outline: '2px solid #3b82f6',
                            },
                        }}
                    >
                        <SearchRoundedIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
                        <InputBase
                            placeholder="Search..."
                            sx={{
                                flex: 1,
                                fontSize: 14,
                                '& input': {
                                    padding: 0,
                                },
                                '& input::placeholder': {
                                    color: '#94a3b8',
                                    opacity: 1,
                                },
                            }}
                        />
                    </Paper>
                </Box>

                {/* Spacer */}
                <Box sx={{ flex: 1 }} />

                {/* Right Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton
                            onClick={handleNotificationOpen}
                            sx={{
                                color: '#64748b',
                                '&:hover': { backgroundColor: '#f1f5f9' },
                            }}
                        >
                            <Badge
                                badgeContent={unreadCount}
                                color="primary"
                                max={99}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        fontSize: 11,
                                        fontWeight: 600,
                                        minWidth: 18,
                                        height: 18,
                                    },
                                }}
                            >
                                <NotificationsRoundedIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* Notifications Menu */}
                    <Menu
                        anchorEl={notificationAnchor}
                        open={Boolean(notificationAnchor)}
                        onClose={handleNotificationClose}
                        PaperProps={{
                            sx: {
                                width: 360,
                                maxHeight: 440,
                                mt: 1,
                                borderRadius: 3,
                                boxShadow: '0 10px 40px rgba(15, 23, 42, 0.12)',
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {/* Header */}
                        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
                                Notifications
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontSize: 13 }}>
                                {unreadCount} new notifications
                            </Typography>
                        </Box>

                        {/* Notifications List */}
                        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                            {Array.isArray(notifications) && notifications.length > 0 ? (
                                notifications.slice(-5).map((notification, index) => (
                                    <MenuItem
                                        key={notification.id || index}
                                        component={Link}
                                        to={
                                            notification?.data?.affected_entity && notification?.data?.affected_entity_id
                                                ? `/${SESSION.USER_ROLE}/${notification?.data?.affected_entity}?affected_entity_id=${notification?.data?.affected_entity_id || ""}`
                                                : `/${SESSION.USER_ROLE}/notifications`
                                        }
                                        onClick={handleNotificationClose}
                                        sx={{
                                            py: 1.5,
                                            px: 2.5,
                                            borderBottom: '1px solid #f1f5f9',
                                            '&:last-child': { borderBottom: 'none' },
                                            '&:hover': { backgroundColor: '#f8fafc' },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    backgroundColor: '#dbeafe',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <NotificationsNoneRoundedIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        color: '#0f172a',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {notification?.title
                                                        ? notification.title.split(" ").slice(0, 4).join(" ") +
                                                          (notification.title.split(" ").length > 4 ? "..." : "")
                                                        : "New Notification"}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: 12,
                                                        color: '#64748b',
                                                        mt: 0.25,
                                                    }}
                                                >
                                                    {notification?.created_at ? format(notification.created_at) : "Just now"}
                                                </Typography>
                                            </Box>
                                            <CircleIcon sx={{ fontSize: 8, color: '#3b82f6', mt: 0.5 }} />
                                        </Box>
                                    </MenuItem>
                                ))
                            ) : (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <NotificationsNoneRoundedIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 1 }} />
                                    <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
                                        No notifications yet
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Footer */}
                        <Divider />
                        <MenuItem
                            component={Link}
                            to={`/${SESSION.USER_ROLE}/notifications`}
                            onClick={handleNotificationClose}
                            sx={{
                                py: 1.5,
                                justifyContent: 'center',
                                color: '#3b82f6',
                                fontWeight: 500,
                                fontSize: 14,
                                '&:hover': { backgroundColor: '#dbeafe' },
                            }}
                        >
                            View All Notifications
                        </MenuItem>
                    </Menu>

                    {/* Divider */}
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 32, alignSelf: 'center' }} />

                    {/* Profile */}
                    <Tooltip title="Account">
                        <IconButton
                            onClick={handleProfileOpen}
                            sx={{
                                p: 0.5,
                                '&:hover': { backgroundColor: 'transparent' },
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    backgroundColor: '#3b82f6',
                                    fontSize: 14,
                                    fontWeight: 600,
                                }}
                            >
                                A
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    {/* Profile Menu */}
                    <Menu
                        anchorEl={profileAnchor}
                        open={Boolean(profileAnchor)}
                        onClose={handleProfileClose}
                        PaperProps={{
                            sx: {
                                width: 220,
                                mt: 1,
                                borderRadius: 3,
                                boxShadow: '0 10px 40px rgba(15, 23, 42, 0.12)',
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                                Administrator
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                                Super Admin
                            </Typography>
                        </Box>

                        <MenuItem
                            component={Link}
                            to="/admin/account"
                            onClick={handleProfileClose}
                            sx={{ py: 1.25, px: 2, mt: 0.5 }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <PersonRoundedIcon sx={{ fontSize: 20, color: '#64748b' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="My Account"
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                            />
                        </MenuItem>

                        <MenuItem
                            component={Link}
                            to="/admin/account"
                            onClick={handleProfileClose}
                            sx={{ py: 1.25, px: 2 }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <SettingsRoundedIcon sx={{ fontSize: 20, color: '#64748b' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Settings"
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                            />
                        </MenuItem>

                        <Divider sx={{ my: 0.5 }} />

                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                py: 1.25,
                                px: 2,
                                mb: 0.5,
                                color: '#ef4444',
                                '&:hover': { backgroundColor: '#fee2e2' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <PowerSettingsNewRoundedIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Logout"
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                            />
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
