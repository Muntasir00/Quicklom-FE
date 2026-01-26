import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Typography,
    Avatar,
    Divider,
    IconButton,
    Tooltip,
} from "@mui/material";

// MUI Icons
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import HealingRoundedIcon from "@mui/icons-material/HealingRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const isActive = (path) => currentPath === path || currentPath.startsWith(path + '/');

    // Check if any item in a section is active
    const isSectionActive = (items) => items.some(item => isActive(item.path));

    const menuSections = [
        {
            id: 'main',
            title: null,
            items: [
                { path: '/admin/dashboard', icon: <DashboardRoundedIcon />, label: 'Dashboard' },
                { path: '/admin/account', icon: <AccountCircleRoundedIcon />, label: 'Account' },
            ]
        },
        {
            id: 'contracts',
            title: 'Contracts',
            icon: <DescriptionRoundedIcon />,
            items: [
                { path: '/admin/contracts', icon: <DescriptionRoundedIcon />, label: 'All Contracts' },
                { path: '/admin/upcoming-contracts', icon: <EventNoteRoundedIcon />, label: 'Upcoming' },
                { path: '/admin/agreements', icon: <HandshakeRoundedIcon />, label: 'Agreements' },
            ]
        },
        {
            id: 'billing',
            title: 'Billing',
            icon: <ReceiptLongRoundedIcon />,
            items: [
                { path: '/admin/billing/invoices', icon: <ReceiptLongRoundedIcon />, label: 'Invoices' },
                { path: '/admin/billing/commissions', icon: <PercentRoundedIcon />, label: 'Commissions' },
                { path: '/admin/cancellations', icon: <CancelRoundedIcon />, label: 'Cancellations' },
            ]
        },
        {
            id: 'users',
            title: 'Users & Access',
            icon: <GroupRoundedIcon />,
            items: [
                { path: '/admin/users', icon: <GroupRoundedIcon />, label: 'All Users' },
                { path: '/admin/roles', icon: <BadgeRoundedIcon />, label: 'Roles' },
                { path: '/admin/permissions', icon: <VpnKeyRoundedIcon />, label: 'Permissions' },
            ]
        },
        {
            id: 'configuration',
            title: 'Configuration',
            icon: <CategoryRoundedIcon />,
            items: [
                { path: '/admin/professional-categories', icon: <CategoryRoundedIcon />, label: 'Prof. Categories' },
                { path: '/admin/professional-roles', icon: <MedicalServicesRoundedIcon />, label: 'Prof. Roles' },
                { path: '/admin/institute-categories', icon: <LocalHospitalRoundedIcon />, label: 'Inst. Categories' },
                { path: '/admin/institute-specialties', icon: <HealingRoundedIcon />, label: 'Inst. Specialties' },
                { path: '/admin/position-soughts', icon: <WorkRoundedIcon />, label: 'Positions' },
                { path: '/admin/contract-types', icon: <ArticleRoundedIcon />, label: 'Contract Types' },
                { path: '/admin/insurance-companies', icon: <VerifiedUserRoundedIcon />, label: 'Insurance' },
            ]
        },
        {
            id: 'communication',
            title: 'Communication',
            icon: <MailRoundedIcon />,
            items: [
                { path: '/admin/messaging', icon: <MailRoundedIcon />, label: 'Messages' },
                { path: '/admin/notifications', icon: <NotificationsRoundedIcon />, label: 'Notifications' },
            ]
        },
        {
            id: 'system',
            title: 'System',
            icon: <HistoryRoundedIcon />,
            items: [
                { path: '/admin/action-logs', icon: <HistoryRoundedIcon />, label: 'Action Logs' },
            ]
        },
    ];

    return (
        <Box
            component="aside"
            sx={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: 280,
                backgroundColor: '#ffffff',
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1030,
                overflow: 'hidden',
            }}
        >
            {/* Brand Header */}
            <Box
                sx={{
                    p: 2.5,
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 16,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    }}
                >
                    QL
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: '#0f172a',
                        fontSize: 18,
                        letterSpacing: '-0.02em',
                    }}
                >
                    Quick<span style={{ color: '#3b82f6' }}>Locum</span>
                </Typography>
            </Box>

            {/* Navigation */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    py: 1.5,
                    px: 1.5,
                    '&::-webkit-scrollbar': {
                        width: 4,
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#e2e8f0',
                        borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#cbd5e1',
                    },
                }}
            >
                {menuSections.map((section) => (
                    <Box key={section.id} sx={{ mb: 0.5 }}>
                        {section.title ? (
                            <>
                                {/* Collapsible Section Header */}
                                <ListItemButton
                                    onClick={() => toggleSection(section.id)}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1,
                                        px: 1.5,
                                        mb: 0.5,
                                        '&:hover': {
                                            backgroundColor: '#f1f5f9',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 32,
                                            color: isSectionActive(section.items) ? '#3b82f6' : '#64748b',
                                        }}
                                    >
                                        {section.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={section.title}
                                        primaryTypographyProps={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#64748b',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}
                                    />
                                    {collapsedSections[section.id] ? (
                                        <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                                    ) : (
                                        <ExpandLessRoundedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                                    )}
                                </ListItemButton>

                                {/* Collapsible Items */}
                                <Collapse in={!collapsedSections[section.id]} timeout="auto">
                                    <List disablePadding>
                                        {section.items.map((item) => (
                                            <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                                                <ListItemButton
                                                    component={Link}
                                                    to={item.path}
                                                    selected={isActive(item.path)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        py: 1,
                                                        px: 1.5,
                                                        pl: 2,
                                                        position: 'relative',
                                                        '&:hover': {
                                                            backgroundColor: '#f1f5f9',
                                                        },
                                                        '&.Mui-selected': {
                                                            backgroundColor: '#dbeafe',
                                                            '&:hover': {
                                                                backgroundColor: '#bfdbfe',
                                                            },
                                                            '&::before': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                left: 0,
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                width: 4,
                                                                height: 24,
                                                                backgroundColor: '#3b82f6',
                                                                borderRadius: '0 4px 4px 0',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            minWidth: 32,
                                                            color: isActive(item.path) ? '#3b82f6' : '#64748b',
                                                        }}
                                                    >
                                                        {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.label}
                                                        primaryTypographyProps={{
                                                            fontSize: 14,
                                                            fontWeight: isActive(item.path) ? 600 : 500,
                                                            color: isActive(item.path) ? '#1e3a5f' : '#475569',
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </>
                        ) : (
                            /* Main items without header */
                            <List disablePadding>
                                {section.items.map((item) => (
                                    <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                                        <ListItemButton
                                            component={Link}
                                            to={item.path}
                                            selected={isActive(item.path)}
                                            sx={{
                                                borderRadius: 2,
                                                py: 1.25,
                                                px: 1.5,
                                                position: 'relative',
                                                '&:hover': {
                                                    backgroundColor: '#f1f5f9',
                                                },
                                                '&.Mui-selected': {
                                                    backgroundColor: '#dbeafe',
                                                    '&:hover': {
                                                        backgroundColor: '#bfdbfe',
                                                    },
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: 4,
                                                        height: 28,
                                                        backgroundColor: '#3b82f6',
                                                        borderRadius: '0 4px 4px 0',
                                                    },
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 36,
                                                    color: isActive(item.path) ? '#3b82f6' : '#64748b',
                                                }}
                                            >
                                                {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: 15,
                                                    fontWeight: isActive(item.path) ? 600 : 500,
                                                    color: isActive(item.path) ? '#1e3a5f' : '#0f172a',
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                ))}
            </Box>

            {/* Footer - User Info */}
            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid #e2e8f0',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        backgroundColor: '#f1f5f9',
                        borderRadius: 2,
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
                        <AdminPanelSettingsRoundedIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            Administrator
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 12,
                                color: '#64748b',
                            }}
                        >
                            Super Admin
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;
