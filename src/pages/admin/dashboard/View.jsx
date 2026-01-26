import React from "react";
import { Link } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    IconButton,
    Tooltip,
    Chip,
} from "@mui/material";

// MUI Icons
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import BarChart from "@components/charts/BarChart";
import { useViewDashboard } from "@hooks/admin/dashboard/useViewDashboard";

// Stat Card Component
const StatCard = ({ title, value, icon, color, link, linkText = "View Details" }) => {
    const colorMap = {
        primary: { bg: '#dbeafe', icon: '#3b82f6', border: '#3b82f6' },
        success: { bg: '#d1fae5', icon: '#10b981', border: '#10b981' },
        warning: { bg: '#fef3c7', icon: '#f59e0b', border: '#f59e0b' },
        error: { bg: '#fee2e2', icon: '#ef4444', border: '#ef4444' },
        info: { bg: '#e0f2fe', icon: '#0ea5e9', border: '#0ea5e9' },
        purple: { bg: '#ede9fe', icon: '#8b5cf6', border: '#8b5cf6' },
    };

    const colors = colorMap[color] || colorMap.primary;

    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: 4,
                border: 'none',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
                '&:hover': {
                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)',
                    transform: 'translateY(-4px)',
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: colors.border,
                    borderRadius: '4px 0 0 4px',
                },
            }}
        >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            backgroundColor: colors.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {React.cloneElement(icon, { sx: { fontSize: 24, color: colors.icon } })}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: 32,
                                fontWeight: 700,
                                color: '#0f172a',
                                lineHeight: 1,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {value}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 14,
                                color: '#64748b',
                                fontWeight: 500,
                                mt: 0.5,
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                </Box>
                {link && (
                    <Box
                        component={Link}
                        to={link}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 2,
                            fontSize: 13,
                            fontWeight: 500,
                            color: colors.icon,
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        {linkText}
                        <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
    const {
        menu,
        userRole,
        roleStatistics,
        userStatistics,
        userRegistrationsStatistics,
        instituteCategoryStatistics,
        contractStatistics
    } = useViewDashboard();

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Page Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    px: 4,
                    py: 4,
                    borderRadius: '0 0 28px 28px',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    mb: 4,
                }}
            >
                {/* Background decoration */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
                        pointerEvents: 'none',
                    }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <DashboardRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
                            </Box>
                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 28,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {menu ?? "Dashboard"}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                                    Welcome back! Here's an overview of your platform.
                                </Typography>
                            </Box>
                        </Box>
                        <Tooltip title="Refresh Data">
                            <IconButton
                                sx={{
                                    color: '#fff',
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                                }}
                            >
                                <RefreshRoundedIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ px: 4, pb: 4 }}>
                {/* Institute Categories Stats */}
                {instituteCategoryStatistics && instituteCategoryStatistics.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                mb: 2,
                            }}
                        >
                            Institute Categories
                        </Typography>
                        <Grid container spacing={3}>
                            {instituteCategoryStatistics.map((category, index) => (
                                <Grid item xs={12} sm={6} md={3} key={category.category_id || index}>
                                    <StatCard
                                        title={category?.category_name ?? "Category"}
                                        value={category?.profile_count ?? 0}
                                        icon={<LocalHospitalRoundedIcon />}
                                        color={['primary', 'success', 'purple', 'info'][index % 4]}
                                        link={`/${userRole}/users`}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Users Stats */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            mb: 2,
                        }}
                    >
                        User Statistics
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Active Users"
                                value={userStatistics?.active_users ?? 0}
                                icon={<PeopleAltRoundedIcon />}
                                color="success"
                                link={`/${userRole}/users`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Pending Approval"
                                value={userStatistics?.pending_users ?? 0}
                                icon={<PersonAddRoundedIcon />}
                                color="warning"
                                link={`/${userRole}/users`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Contracts"
                                value={contractStatistics?.total_contracts ?? 0}
                                icon={<DescriptionRoundedIcon />}
                                color="primary"
                                link={`/${userRole}/contracts`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Open Contracts"
                                value={contractStatistics?.contract_status?.open ?? 0}
                                icon={<LockOpenRoundedIcon />}
                                color="info"
                                link={`/${userRole}/contracts`}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Contract Status Stats */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            mb: 2,
                        }}
                    >
                        Contract Status
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Closed Contracts"
                                value={contractStatistics?.contract_status?.closed ?? 0}
                                icon={<CheckCircleRoundedIcon />}
                                color="success"
                                link={`/${userRole}/contracts`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Cancelled Contracts"
                                value={contractStatistics?.contract_status?.cancelled ?? 0}
                                icon={<CancelRoundedIcon />}
                                color="error"
                                link={`/${userRole}/contracts`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Pending Contracts"
                                value={contractStatistics?.contract_status?.pending ?? 0}
                                icon={<HourglassEmptyRoundedIcon />}
                                color="warning"
                                link={`/${userRole}/contracts`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Booked Contracts"
                                value={contractStatistics?.contract_status?.booked ?? 0}
                                icon={<EventAvailableRoundedIcon />}
                                color="purple"
                                link={`/${userRole}/contracts`}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Chart Section */}
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                    }}
                >
                    <Box
                        sx={{
                            px: 3,
                            py: 2.5,
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    backgroundColor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <TrendingUpRoundedIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: 16,
                                        fontWeight: 600,
                                        color: '#0f172a',
                                    }}
                                >
                                    User Registrations
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                                    Monthly registration trends
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            label="Last 12 Months"
                            size="small"
                            sx={{
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                fontWeight: 500,
                                fontSize: 12,
                            }}
                        />
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ height: 300, display: 'flex' }}>
                            <BarChart userRegistrationsStatistics={userRegistrationsStatistics} />
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Dashboard;
