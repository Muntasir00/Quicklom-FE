import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Chip, IconButton, Tooltip, Avatar,
    Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    MenuItem, Select, FormControl, InputLabel, Paper, LinearProgress,
    CircularProgress, Snackbar, Alert, Stack, Skeleton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArticleIcon from '@mui/icons-material/Article';
import AdminCancellationService from '../../../services/admin/AdminCancellationService';
import PageHeader from "@components/admin/PageHeader";

// Gradient styles for stat cards
const gradientCards = {
    total: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: <CancelIcon sx={{ fontSize: 40, opacity: 0.3 }} />,
    },
    monthly: {
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        icon: <CalendarTodayIcon sx={{ fontSize: 40, opacity: 0.3 }} />,
    },
    contracts: {
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        icon: <BusinessIcon sx={{ fontSize: 40, opacity: 0.3 }} />,
    },
    withdrawals: {
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        icon: <WorkIcon sx={{ fontSize: 40, opacity: 0.3 }} />,
    },
};

// User type capabilities - who can do what
const userTypeCapabilities = {
    Professional: {
        label: 'Professionals',
        canCancel: false,
        canWithdraw: true,
        description: 'Can withdraw from contract applications',
        color: '#6366f1',
        bgColor: '#eef2ff',
    },
    Agency: {
        label: 'Agencies',
        canCancel: true,
        canWithdraw: true,
        description: 'Can cancel contracts & withdraw applications',
        color: '#8b5cf6',
        bgColor: '#f5f3ff',
    },
    Headhunter: {
        label: 'Headhunters',
        canCancel: true,
        canWithdraw: true,
        description: 'Can cancel contracts & withdraw applications',
        color: '#a855f7',
        bgColor: '#faf5ff',
    },
    Clinic: {
        label: 'Clinics',
        canCancel: true,
        canWithdraw: false,
        description: 'Can cancel published contracts',
        color: '#ec4899',
        bgColor: '#fdf2f8',
    },
    Pharmacy: {
        label: 'Pharmacies',
        canCancel: true,
        canWithdraw: false,
        description: 'Can cancel published contracts',
        color: '#f43f5e',
        bgColor: '#fff1f2',
    },
};

const CancellationDashboard = () => {
    const menu = "cancellations";
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [userTypeStats, setUserTypeStats] = useState({});
    const [trends, setTrends] = useState([]);
    const [topCancellers, setTopCancellers] = useState([]);
    const [cancellations, setCancellations] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'withdrawals', 'cancellations'

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    // Filters
    const [filters, setFilters] = useState({
        cancellation_type: '',
        user_type: '',
        month: '',
        year: new Date().getFullYear()
    });

    // User detail modal
    const [userModal, setUserModal] = useState({ open: false, userId: null, data: null, loading: false });

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        fetchCancellations();
    }, [page, pageSize, filters, activeTab]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStatistics(),
                fetchTrends(),
                fetchTopCancellers(),
                fetchCancellations()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await AdminCancellationService.getStatistics();
            setStatistics(stats);
            // Use user_type_stats from backend
            if (stats?.user_type_stats) {
                setUserTypeStats(stats.user_type_stats);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchTrends = async () => {
        try {
            const data = await AdminCancellationService.getTrends(6);
            setTrends(data);
        } catch (error) {
            console.error('Error fetching trends:', error);
        }
    };

    const fetchTopCancellers = async () => {
        try {
            const data = await AdminCancellationService.getTopCancellers(5, 'month');
            setTopCancellers(data);
        } catch (error) {
            console.error('Error fetching top cancellers:', error);
        }
    };

    const fetchCancellations = async () => {
        try {
            // Apply tab filter
            const tabFilter = activeTab === 'withdrawals' ? 'application_withdrawal'
                            : activeTab === 'cancellations' ? 'contract_cancellation'
                            : filters.cancellation_type;

            const response = await AdminCancellationService.getAllCancellations({
                ...filters,
                cancellation_type: tabFilter,
                limit: pageSize,
                offset: page * pageSize
            });
            setCancellations(response.data || []);
            setTotalCount(response.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching cancellations:', error);
        }
    };

    const handleViewUser = async (userId) => {
        setUserModal({ open: true, userId, data: null, loading: true });
        try {
            const data = await AdminCancellationService.getUserHistory(userId);
            setUserModal({ open: true, userId, data, loading: false });
        } catch (error) {
            setUserModal({ open: false, userId: null, data: null, loading: false });
            setSnackbar({ open: true, message: 'Failed to load user history', severity: 'error' });
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const clearFilters = () => {
        setFilters({
            cancellation_type: '',
            user_type: '',
            month: '',
            year: new Date().getFullYear()
        });
        setPage(0);
    };

    // Navigation handlers
    const goToContract = (contractId) => {
        navigate(`/admin/contracts?id=${contractId}`);
    };

    const goToUser = (userId) => {
        navigate(`/admin/users/${userId}/profile/view`);
    };

    // DataGrid columns
    const columns = [
        {
            field: 'user',
            headerName: 'User',
            width: 220,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            fontSize: 13,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        {params.row.user_email?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }} noWrap>
                            {params.row.user_email || `User #${params.row.user_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }} noWrap>
                            {params.row.user_name || 'No name'}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'user_type',
            headerName: 'User Type',
            width: 110,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const badge = AdminCancellationService.getUserTypeBadge(params.value);
                return (
                    <Chip
                        label={params.value}
                        size="small"
                        sx={{
                            bgcolor: badge.bg,
                            color: badge.color,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                        }}
                    />
                );
            }
        },
        {
            field: 'cancellation_type',
            headerName: 'Type',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const badge = AdminCancellationService.getTypeBadge(params.value);
                return (
                    <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                            bgcolor: badge.bg,
                            color: badge.textColor,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                        }}
                    />
                );
            }
        },
        {
            field: 'contract_id',
            headerName: 'Contract ID',
            width: 110,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                params.value ? (
                    <Chip
                        label={`#${params.value}`}
                        size="small"
                        onClick={() => goToContract(params.value)}
                        sx={{
                            bgcolor: '#e0e7ff',
                            color: '#4338ca',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#c7d2fe' }
                        }}
                    />
                ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
                )
            )
        },
        {
            field: 'contract_title',
            headerName: 'Contract Type',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Typography variant="body2" noWrap sx={{ color: params.value ? 'text.primary' : 'text.disabled' }}>
                    {params.value || 'N/A'}
                </Typography>
            )
        },
        {
            field: 'reason',
            headerName: 'Reason',
            width: 150,
            renderCell: (params) => (
                <Tooltip title={params.value || 'No reason provided'} arrow>
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{
                            color: params.value ? 'text.primary' : 'text.disabled',
                            fontStyle: params.value ? 'normal' : 'italic',
                            fontSize: '0.8rem'
                        }}
                    >
                        {params.value || 'Not specified'}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'cancelled_at',
            headerName: 'Date',
            width: 140,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {AdminCancellationService.formatDate(params.value)}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View user profile" arrow>
                        <IconButton
                            size="small"
                            onClick={() => goToUser(params.row.user_id)}
                            sx={{ color: '#7c3aed', '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.1)' } }}
                        >
                            <PersonIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    {params.row.contract_id && (
                        <Tooltip title="View in All Contracts" arrow>
                            <IconButton
                                size="small"
                                onClick={() => goToContract(params.row.contract_id)}
                                sx={{ color: '#4338ca', '&:hover': { bgcolor: 'rgba(67, 56, 202, 0.1)' } }}
                            >
                                <ArticleIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="View cancellation history" arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleViewUser(params.row.user_id)}
                            sx={{ color: '#0284c7', '&:hover': { bgcolor: 'rgba(2, 132, 199, 0.1)' } }}
                        >
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    // Stat Card Component
    const StatCard = ({ title, value, subtitle, gradient, icon, loading: isLoading }) => (
        <Card
            sx={{
                height: '100%',
                background: gradient,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px -10px rgba(0,0,0,0.3)',
                },
            }}
        >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                    {title}
                </Typography>
                {isLoading ? (
                    <Skeleton variant="text" width={80} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                ) : (
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                        {value}
                    </Typography>
                )}
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {subtitle}
                </Typography>
            </CardContent>
            <Box sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
                {icon}
            </Box>
        </Card>
    );

    // Trends Chart (simple bar visualization)
    const renderTrends = () => (
        <Card sx={{ height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>Monthly Trends</Typography>
            </Box>
            <CardContent>
                {trends.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Typography color="text.secondary">No trend data available</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {trends.map((t, idx) => {
                            const maxTotal = Math.max(...trends.map(x => x.total), 1);
                            const percentage = (t.total / maxTotal) * 100;
                            return (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" fontWeight={500}>{t.label}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t.total} ({t.contract_cancellations}C / {t.application_withdrawals}W)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5, height: 8 }}>
                                        <Box
                                            sx={{
                                                width: `${(t.contract_cancellations / maxTotal) * 100}%`,
                                                bgcolor: '#ef4444',
                                                borderRadius: 1,
                                                transition: 'width 0.3s'
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: `${(t.application_withdrawals / maxTotal) * 100}%`,
                                                bgcolor: '#f59e0b',
                                                borderRadius: 1,
                                                transition: 'width 0.3s'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            );
                        })}
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">Cancellations</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: '#f59e0b', borderRadius: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">Withdrawals</Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    // Top Cancellers
    const renderTopCancellers = () => (
        <Card sx={{ height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>Top Cancellers (This Month)</Typography>
                {statistics?.warning_users > 0 && (
                    <Chip
                        icon={<WarningAmberIcon />}
                        label={`${statistics.warning_users} at warning`}
                        size="small"
                        color="warning"
                    />
                )}
            </Box>
            <CardContent sx={{ p: 0 }}>
                {topCancellers.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Typography color="text.secondary">No cancellations this month</Typography>
                    </Box>
                ) : (
                    <Box>
                        {topCancellers.map((user, idx) => (
                            <Box
                                key={user.user_id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    borderBottom: idx < topCancellers.length - 1 ? '1px solid' : 'none',
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            bgcolor: user.cancellation_count >= 3 ? 'error.main' : 'primary.main',
                                            fontSize: 14
                                        }}
                                    >
                                        {user.email?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{user.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user.user_type}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" fontWeight={700} color={user.cancellation_count >= 3 ? 'error.main' : 'text.primary'}>
                                        {user.cancellation_count}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user.contract_cancellations}C / {user.application_withdrawals}W
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    // User History Modal
    const renderUserModal = () => (
        <Dialog
            open={userModal.open}
            onClose={() => setUserModal({ open: false, userId: null, data: null, loading: false })}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>User Cancellation History</Typography>
                        {userModal.data?.user && (
                            <Typography variant="caption" color="text.secondary">
                                {userModal.data.user.email}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {userModal.loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : userModal.data ? (
                    <Stack spacing={2}>
                        {/* Summary */}
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">This Month</Typography>
                                    <Typography variant="h5" fontWeight={700} color={userModal.data.counts.monthly_count >= 3 ? 'error.main' : 'text.primary'}>
                                        {userModal.data.counts.monthly_count}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Total</Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        {userModal.data.counts.total_count}
                                    </Typography>
                                </Grid>
                            </Grid>
                            {userModal.data.status === 'warning' && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    User has reached warning threshold ({userModal.data.thresholds.monthly_warning}+ this month)
                                </Alert>
                            )}
                        </Paper>

                        {/* History */}
                        <Typography variant="subtitle2" fontWeight={600}>Recent Activity</Typography>
                        {userModal.data.history.length === 0 ? (
                            <Typography color="text.secondary">No cancellation history</Typography>
                        ) : (
                            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {userModal.data.history.map((item) => (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            p: 1.5,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Chip
                                                label={AdminCancellationService.getTypeBadge(item.cancellation_type).label}
                                                size="small"
                                                sx={{
                                                    bgcolor: AdminCancellationService.getTypeBadge(item.cancellation_type).bg,
                                                    color: AdminCancellationService.getTypeBadge(item.cancellation_type).textColor,
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {AdminCancellationService.formatDate(item.cancelled_at)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            {item.contract_title || 'Unknown Contract'}
                                        </Typography>
                                        {item.reason && (
                                            <Typography variant="caption" color="text.secondary">
                                                Reason: {item.reason}
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Stack>
                ) : (
                    <Alert severity="error">Failed to load user data</Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 2 }}>
                {userModal.data?.user && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        onClick={() => {
                            setUserModal({ open: false, userId: null, data: null, loading: false });
                            goToUser(userModal.data.user.id);
                        }}
                    >
                        View Full Profile
                    </Button>
                )}
                <Button onClick={() => setUserModal({ open: false, userId: null, data: null, loading: false })}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Cancellation Tracking"
                subtitle="Monitor cancellations and withdrawals"
                icon={<CancelIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: '/admin/dashboard' },
                    { label: 'Cancellations' },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                <Snackbar
                        open={snackbar.open}
                        autoHideDuration={4000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
                            {snackbar.message}
                        </Alert>
                    </Snackbar>

                    {/* Statistics Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatCard
                                title="Overall Total"
                                value={statistics?.total_cancellations || 0}
                                subtitle="All time (all types)"
                                gradient={gradientCards.total.background}
                                icon={gradientCards.total.icon}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatCard
                                title="This Month"
                                value={statistics?.monthly_cancellations || 0}
                                subtitle={`${statistics?.users_with_cancellations || 0} users involved`}
                                gradient={gradientCards.monthly.background}
                                icon={gradientCards.monthly.icon}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatCard
                                title="Total Withdrawals"
                                value={statistics?.application_withdrawals || 0}
                                subtitle="Applications withdrawn"
                                gradient={gradientCards.withdrawals.background}
                                icon={gradientCards.withdrawals.icon}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatCard
                                title="Total Cancellations"
                                value={statistics?.contract_cancellations || 0}
                                subtitle="Contracts cancelled"
                                gradient={gradientCards.contracts.background}
                                icon={gradientCards.contracts.icon}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatCard
                                title="At Warning"
                                value={statistics?.warning_users || 0}
                                subtitle="3+ this month"
                                gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                icon={<WarningAmberIcon sx={{ fontSize: 40, opacity: 0.3 }} />}
                                loading={loading}
                            />
                        </Grid>
                    </Grid>

                    {/* User Type Breakdown */}
                    <Card sx={{ mb: 3, overflow: 'visible' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight={600}>Breakdown by User Type</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Who can do what: Professionals withdraw applications, Clinics/Pharmacies cancel contracts, Agencies/Headhunters can do both
                            </Typography>
                        </Box>
                        <CardContent>
                            <Grid container spacing={2}>
                                {Object.entries(userTypeCapabilities).map(([type, config]) => {
                                    const stats = userTypeStats[type] || { cancellations: 0, withdrawals: 0, total: 0 };
                                    return (
                                        <Grid item xs={12} sm={6} md={4} lg={2.4} key={type}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    borderColor: config.color,
                                                    borderWidth: 2,
                                                    bgcolor: config.bgColor,
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: `0 8px 20px ${config.color}30`,
                                                    },
                                                }}
                                                onClick={() => handleFilterChange('user_type', type)}
                                            >
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: config.color, mb: 1 }}>
                                                    {config.label}
                                                </Typography>
                                                <Typography variant="h4" fontWeight={800} sx={{ color: config.color, mb: 0.5 }}>
                                                    {stats.total}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {config.canWithdraw && (
                                                        <Chip
                                                            label={`${stats.withdrawals} W`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#fef3c7',
                                                                color: '#92400e',
                                                                fontWeight: 600,
                                                                fontSize: '0.65rem',
                                                                height: 20,
                                                            }}
                                                        />
                                                    )}
                                                    {config.canCancel && (
                                                        <Chip
                                                            label={`${stats.cancellations} C`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#fee2e2',
                                                                color: '#991b1b',
                                                                fontWeight: 600,
                                                                fontSize: '0.65rem',
                                                                height: 20,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, fontSize: '0.65rem' }}>
                                                    {config.description}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                            <Box sx={{ display: 'flex', gap: 3, mt: 2, justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 12, height: 12, bgcolor: '#fee2e2', border: '1px solid #991b1b', borderRadius: 0.5 }} />
                                    <Typography variant="caption" color="text.secondary">C = Contract Cancellations</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 12, height: 12, bgcolor: '#fef3c7', border: '1px solid #92400e', borderRadius: 0.5 }} />
                                    <Typography variant="caption" color="text.secondary">W = Application Withdrawals</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Trends and Top Cancellers */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={7}>
                            {renderTrends()}
                        </Grid>
                        <Grid item xs={12} md={5}>
                            {renderTopCancellers()}
                        </Grid>
                    </Grid>

                    {/* Cancellations Table */}
                    <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        {/* Quick Filter Tabs */}
                        <Box sx={{ display: 'flex', borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                            <Button
                                onClick={() => { setActiveTab('all'); setPage(0); }}
                                sx={{
                                    flex: 1,
                                    py: 1.5,
                                    borderRadius: 0,
                                    borderBottom: activeTab === 'all' ? '3px solid #667eea' : '3px solid transparent',
                                    bgcolor: activeTab === 'all' ? 'white' : 'transparent',
                                    color: activeTab === 'all' ? '#667eea' : '#64748b',
                                    fontWeight: activeTab === 'all' ? 700 : 500,
                                    '&:hover': { bgcolor: activeTab === 'all' ? 'white' : '#f1f5f9' },
                                }}
                            >
                                <CancelIcon sx={{ mr: 1, fontSize: 18 }} />
                                All ({statistics?.total_cancellations || 0})
                            </Button>
                            <Button
                                onClick={() => { setActiveTab('withdrawals'); setPage(0); }}
                                sx={{
                                    flex: 1,
                                    py: 1.5,
                                    borderRadius: 0,
                                    borderBottom: activeTab === 'withdrawals' ? '3px solid #f59e0b' : '3px solid transparent',
                                    bgcolor: activeTab === 'withdrawals' ? 'white' : 'transparent',
                                    color: activeTab === 'withdrawals' ? '#f59e0b' : '#64748b',
                                    fontWeight: activeTab === 'withdrawals' ? 700 : 500,
                                    '&:hover': { bgcolor: activeTab === 'withdrawals' ? 'white' : '#f1f5f9' },
                                }}
                            >
                                <WorkIcon sx={{ mr: 1, fontSize: 18 }} />
                                Withdrawals ({statistics?.application_withdrawals || 0})
                            </Button>
                            <Button
                                onClick={() => { setActiveTab('cancellations'); setPage(0); }}
                                sx={{
                                    flex: 1,
                                    py: 1.5,
                                    borderRadius: 0,
                                    borderBottom: activeTab === 'cancellations' ? '3px solid #ef4444' : '3px solid transparent',
                                    bgcolor: activeTab === 'cancellations' ? 'white' : 'transparent',
                                    color: activeTab === 'cancellations' ? '#ef4444' : '#64748b',
                                    fontWeight: activeTab === 'cancellations' ? 700 : 500,
                                    '&:hover': { bgcolor: activeTab === 'cancellations' ? 'white' : '#f1f5f9' },
                                }}
                            >
                                <BusinessIcon sx={{ mr: 1, fontSize: 18 }} />
                                Cancellations ({statistics?.contract_cancellations || 0})
                            </Button>
                        </Box>

                        <Box
                            sx={{
                                px: 3,
                                py: 2,
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        background: activeTab === 'withdrawals' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                                  : activeTab === 'cancellations' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {activeTab === 'withdrawals' ? <WorkIcon sx={{ fontSize: 22, color: 'white' }} />
                                     : activeTab === 'cancellations' ? <BusinessIcon sx={{ fontSize: 22, color: 'white' }} />
                                     : <CancelIcon sx={{ fontSize: 22, color: 'white' }} />}
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1e293b', fontSize: '1.1rem' }}>
                                        {activeTab === 'withdrawals' ? 'Application Withdrawals'
                                         : activeTab === 'cancellations' ? 'Contract Cancellations'
                                         : 'All Records'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                        {totalCount} records
                                        {activeTab === 'withdrawals' && ' • By Professionals, Agencies, Headhunters'}
                                        {activeTab === 'cancellations' && ' • By Agencies, Headhunters, Clinics, Pharmacies'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Filters */}
                            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        value={filters.cancellation_type}
                                        label="Type"
                                        onChange={(e) => handleFilterChange('cancellation_type', e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="contract_cancellation">Contract</MenuItem>
                                        <MenuItem value="application_withdrawal">Withdrawal</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                    <InputLabel>User Type</InputLabel>
                                    <Select
                                        value={filters.user_type}
                                        label="User Type"
                                        onChange={(e) => handleFilterChange('user_type', e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="Professional">Professional</MenuItem>
                                        <MenuItem value="Clinic">Clinic</MenuItem>
                                        <MenuItem value="Pharmacy">Pharmacy</MenuItem>
                                        <MenuItem value="Agency">Agency</MenuItem>
                                        <MenuItem value="Headhunter">Headhunter</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <InputLabel>Month</InputLabel>
                                    <Select
                                        value={filters.month}
                                        label="Month"
                                        onChange={(e) => handleFilterChange('month', e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {[...Array(12)].map((_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>
                                                {new Date(2000, i).toLocaleString('default', { month: 'short' })}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={clearFilters}
                                    startIcon={<FilterListIcon />}
                                    sx={{ borderColor: '#e2e8f0', color: '#64748b' }}
                                >
                                    Clear
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={fetchAll}
                                    startIcon={<RefreshIcon />}
                                    sx={{ borderColor: '#e2e8f0', color: '#64748b' }}
                                >
                                    Refresh
                                </Button>
                            </Stack>
                        </Box>

                        <Box sx={{ width: '100%', overflow: 'hidden' }}>
                            {loading && <LinearProgress sx={{ height: 2 }} />}
                            <DataGrid
                                rows={cancellations}
                                columns={columns}
                                loading={loading}
                                rowCount={totalCount}
                                paginationMode="server"
                                paginationModel={{ page, pageSize }}
                                onPaginationModelChange={(model) => {
                                    setPage(model.page);
                                    setPageSize(model.pageSize);
                                }}
                                pageSizeOptions={[10, 25, 50]}
                                disableRowSelectionOnClick
                                autoHeight
                                getRowHeight={() => 56}
                                sx={{
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    '& .MuiDataGrid-columnHeaders': {
                                        bgcolor: '#f8fafc',
                                        borderBottom: '1px solid #e2e8f0',
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 600,
                                        color: '#475569',
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                    },
                                    '& .MuiDataGrid-row': {
                                        '&:hover': { bgcolor: '#f8fafc' },
                                        '&:nth-of-type(even)': { bgcolor: '#fafafa' },
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid #f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                    },
                                }}
                            />
                        </Box>
                </Card>

                {renderUserModal()}
            </Box>
        </Box>
    );
};

export default CancellationDashboard;
