import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Chip, IconButton, Tooltip, Avatar,
    Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, Alert, Collapse, InputAdornment, Paper, LinearProgress,
    CircularProgress, Snackbar, Autocomplete, Fade, Skeleton, Stack,
    Switch, FormControlLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AdminCommissionService from '../../../services/admin/AdminCommissionService';
import { getUsersService } from '../../../services/admin/UserService';
import PageHeader from "@components/admin/PageHeader";

// Gradient card styles
const gradientCards = {
    commission: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: <PercentIcon sx={{ fontSize: 40, opacity: 0.3 }} />,
    },
    serviceFee: {
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        icon: <AttachMoneyIcon sx={{ fontSize: 40, opacity: 0.3 }} />,
    },
    subscription: {
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        icon: <CalendarTodayIcon sx={{ fontSize: 40, opacity: 0.3 }} />,
    },
    overrides: {
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        icon: <TuneIcon sx={{ fontSize: 40, opacity: 0.3 }} />,
    },
};

const CommissionDashboard = () => {
    const menu = "commissions";

    // State
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [globalSettings, setGlobalSettings] = useState(null);
    const [customCommissions, setCustomCommissions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    // Global settings edit state
    const [editingGlobal, setEditingGlobal] = useState(false);
    const [globalForm, setGlobalForm] = useState({});
    const [savingGlobal, setSavingGlobal] = useState(false);

    // Custom commission modal
    const [modal, setModal] = useState({ open: false, mode: 'create', commission: null });
    const [formData, setFormData] = useState({});
    const [savingCustom, setSavingCustom] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, commission: null });

    // User search for modal
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // User rates view modal
    const [userRatesModal, setUserRatesModal] = useState({ open: false, userId: null, rates: null, loading: false });

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Load data
    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        fetchCustomCommissions();
    }, [page, pageSize]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStatistics(),
                fetchGlobalSettings(),
                fetchCustomCommissions()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await AdminCommissionService.getStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchGlobalSettings = async () => {
        try {
            const settings = await AdminCommissionService.getGlobalSettings();
            setGlobalSettings(settings);
            setGlobalForm(settings);
        } catch (error) {
            console.error('Error fetching global settings:', error);
        }
    };

    const fetchCustomCommissions = async () => {
        try {
            const response = await AdminCommissionService.getAllCustomCommissions({
                limit: pageSize,
                offset: page * pageSize
            });
            setCustomCommissions(response.data || []);
            setTotalCount(response.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching custom commissions:', error);
        }
    };

    // Global settings handlers
    const handleGlobalEdit = () => {
        setGlobalForm({ ...globalSettings });
        setEditingGlobal(true);
    };

    const handleGlobalCancel = () => {
        setGlobalForm({ ...globalSettings });
        setEditingGlobal(false);
    };

    const handleGlobalSave = async () => {
        setSavingGlobal(true);
        try {
            const updated = await AdminCommissionService.updateGlobalSettings({
                temporary_commission_percentage: Number(globalForm.temporary_commission_percentage),
                service_fee: Number(globalForm.service_fee),
                monthly_subscription_fee: Number(globalForm.monthly_subscription_fee),
                // Cancellation fee settings
                cancellation_fee_enabled: globalForm.cancellation_fee_enabled,
                cancellation_fee_percentage: globalForm.cancellation_fee_percentage ? Number(globalForm.cancellation_fee_percentage) : undefined,
                cancellation_fee_minimum: globalForm.cancellation_fee_minimum ? Number(globalForm.cancellation_fee_minimum) : undefined,
                cancellation_fee_maximum: globalForm.cancellation_fee_maximum ? Number(globalForm.cancellation_fee_maximum) : undefined,
                cancellation_fee_hours_threshold: globalForm.cancellation_fee_hours_threshold ? Number(globalForm.cancellation_fee_hours_threshold) : undefined,
            });
            setGlobalSettings(updated);
            setEditingGlobal(false);
            setSnackbar({ open: true, message: 'Global settings updated successfully', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update settings', severity: 'error' });
        } finally {
            setSavingGlobal(false);
        }
    };

    // Fetch users for autocomplete
    const fetchUsers = async () => {
        if (users.length > 0) return;
        setUsersLoading(true);
        try {
            const usersList = await getUsersService({ filters: { role_id: 2 } });
            setUsers(usersList || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    // Custom commission handlers
    const handleOpenCreate = () => {
        setFormData({
            user_id: '',
            temporary_commission_percentage: '',
            service_fee_override: '',
            monthly_subscription_override: '',
            reason: '',
            valid_from: '',
            valid_until: ''
        });
        setSelectedUser(null);
        setModal({ open: true, mode: 'create', commission: null });
        fetchUsers();
    };

    const handleOpenEdit = (commission) => {
        setFormData({
            user_id: commission.user_id,
            temporary_commission_percentage: commission.temporary_commission_percentage ?? '',
            service_fee_override: commission.service_fee_override ?? '',
            monthly_subscription_override: commission.monthly_subscription_override ?? '',
            reason: commission.reason || '',
            valid_from: commission.valid_from ? commission.valid_from.split('T')[0] : '',
            valid_until: commission.valid_until ? commission.valid_until.split('T')[0] : ''
        });
        setSelectedUser({
            id: commission.user_id,
            email: commission.user?.email || `User #${commission.user_id}`,
            name: commission.user?.name || ''
        });
        setModal({ open: true, mode: 'edit', commission });
        fetchUsers();
    };

    const handleCloseModal = () => {
        setModal({ open: false, mode: 'create', commission: null });
        setFormData({});
        setSelectedUser(null);
    };

    const handleSaveCustom = async () => {
        setSavingCustom(true);
        try {
            const data = AdminCommissionService.prepareSubmissionData(formData);

            if (modal.mode === 'create') {
                await AdminCommissionService.createCustomCommission(data);
                setSnackbar({ open: true, message: 'Custom commission created successfully', severity: 'success' });
            } else {
                await AdminCommissionService.updateCustomCommission(modal.commission.id, data);
                setSnackbar({ open: true, message: 'Custom commission updated successfully', severity: 'success' });
            }

            handleCloseModal();
            fetchCustomCommissions();
            fetchStatistics();
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to save commission', severity: 'error' });
        } finally {
            setSavingCustom(false);
        }
    };

    const handleDelete = async () => {
        try {
            await AdminCommissionService.deleteCustomCommission(deleteConfirm.commission.id);
            setSnackbar({ open: true, message: 'Custom commission deleted', severity: 'success' });
            setDeleteConfirm({ open: false, commission: null });
            fetchCustomCommissions();
            fetchStatistics();
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete', severity: 'error' });
        }
    };

    const handleViewUserRates = async (userId) => {
        setUserRatesModal({ open: true, userId, rates: null, loading: true });
        try {
            const rates = await AdminCommissionService.getUserCommissionRates(userId);
            setUserRatesModal({ open: true, userId, rates, loading: false });
        } catch (error) {
            setUserRatesModal({ open: false, userId: null, rates: null, loading: false });
            setSnackbar({ open: true, message: 'Failed to load user rates', severity: 'error' });
        }
    };

    // DataGrid columns - clean aligned design
    const columns = [
        {
            field: 'user',
            headerName: 'User',
            width: 280,
            sortable: true,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            fontSize: 13,
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            flexShrink: 0,
                        }}
                    >
                        {params.row.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2, mb: 0 }} noWrap>
                            {params.row.user?.email || `User #${params.row.user_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }} noWrap>
                            {params.row.user?.name || 'No name'}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'temporary_commission_percentage',
            headerName: 'Commission',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    {params.value !== null && params.value !== undefined ? (
                        <Chip
                            label={`${params.value}%`}
                            size="small"
                            sx={{
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                bgcolor: 'rgba(102, 126, 234, 0.12)',
                                color: '#5a67d8',
                                minWidth: 60,
                            }}
                        />
                    ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 500 }}>—</Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'service_fee_override',
            headerName: 'Service Fee',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    {params.value !== null && params.value !== undefined ? (
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#059669' }}>
                            {AdminCommissionService.formatCurrency(params.value)}
                        </Typography>
                    ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 500 }}>—</Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'monthly_subscription_override',
            headerName: 'Subscription',
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    {params.value !== null && params.value !== undefined ? (
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#0284c7' }}>
                            {AdminCommissionService.formatCurrency(params.value)}
                        </Typography>
                    ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 500 }}>—</Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 110,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const badge = AdminCommissionService.getStatusBadge(params.row);
                const colorMap = {
                    success: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
                    info: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
                    default: { bg: '#f3f4f6', color: '#4b5563', border: '#d1d5db' },
                };
                const style = colorMap[badge.color] || colorMap.default;
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Chip
                            label={badge.label}
                            size="small"
                            sx={{
                                bgcolor: style.bg,
                                color: style.color,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                border: `1px solid ${style.border}`,
                                minWidth: 75,
                            }}
                        />
                    </Box>
                );
            }
        },
        {
            field: 'reason',
            headerName: 'Reason',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => (
                <Box sx={{ width: '100%', pl: 1 }}>
                    <Tooltip title={params.value || 'No reason specified'} arrow placement="top">
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{
                                color: params.value ? 'text.primary' : 'text.disabled',
                                fontStyle: params.value ? 'normal' : 'italic',
                                fontSize: '0.85rem',
                            }}
                        >
                            {params.value || 'Not specified'}
                        </Typography>
                    </Tooltip>
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 130,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, width: '100%' }}>
                    <Tooltip title="View effective rates" arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleViewUserRates(params.row.user_id)}
                            sx={{
                                color: '#0284c7',
                                '&:hover': { bgcolor: 'rgba(2, 132, 199, 0.1)' }
                            }}
                        >
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(params.row)}
                            sx={{
                                color: '#d97706',
                                '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.1)' }
                            }}
                        >
                            <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm({ open: true, commission: params.row })}
                            sx={{
                                color: '#dc2626',
                                '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.1)' }
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: 18 }} />
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
                    <Skeleton variant="text" width={100} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
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

    // Global Settings Card
    const renderGlobalSettings = () => (
        <Card sx={{ mb: 3, overflow: 'visible' }}>
            <Box
                sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'grey.50',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                        <SettingsIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>Global Commission Settings</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Default rates applied to all users without custom overrides
                        </Typography>
                    </Box>
                </Box>
                {!editingGlobal ? (
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleGlobalEdit}
                        size="small"
                    >
                        Edit Settings
                    </Button>
                ) : (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            startIcon={savingGlobal ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            onClick={handleGlobalSave}
                            disabled={savingGlobal}
                            size="small"
                        >
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={handleGlobalCancel}
                            disabled={savingGlobal}
                            size="small"
                        >
                            Cancel
                        </Button>
                    </Stack>
                )}
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Commission & Fees Section */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'grey.50' }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Direct Hire Commission"
                                        type="number"
                                        value={globalForm.temporary_commission_percentage || ''}
                                        onChange={(e) => setGlobalForm({ ...globalForm, temporary_commission_percentage: e.target.value })}
                                        disabled={!editingGlobal}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                                        }}
                                        helperText="Charged to publisher on direct hire"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Service Fee"
                                        type="number"
                                        value={globalForm.service_fee || ''}
                                        onChange={(e) => setGlobalForm({ ...globalForm, service_fee: e.target.value })}
                                        disabled={!editingGlobal}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                        helperText="Both users pay on non-direct hire"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Monthly Subscription"
                                        type="number"
                                        value={globalForm.monthly_subscription_fee || ''}
                                        onChange={(e) => setGlobalForm({ ...globalForm, monthly_subscription_fee: e.target.value })}
                                        disabled={!editingGlobal}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                        helperText="Agencies/headhunters (from 2nd contract)"
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Cancellation Fee Section */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Cancellation Fee Settings
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={globalForm.cancellation_fee_enabled ?? true}
                                            onChange={(e) => setGlobalForm({ ...globalForm, cancellation_fee_enabled: e.target.checked })}
                                            disabled={!editingGlobal}
                                            color="primary"
                                        />
                                    }
                                    label={globalForm.cancellation_fee_enabled ? "Enabled" : "Disabled"}
                                    sx={{ m: 0 }}
                                />
                            </Box>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Cancellation fees apply when users cancel/withdraw from booked contracts within the specified hours threshold before contract start.
                            </Alert>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Fee Percentage"
                                        type="number"
                                        value={globalForm.cancellation_fee_percentage || ''}
                                        onChange={(e) => setGlobalForm({ ...globalForm, cancellation_fee_percentage: e.target.value })}
                                        disabled={!editingGlobal || !globalForm.cancellation_fee_enabled}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                                        }}
                                        helperText="% of contract value"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Minimum Fee"
                                        type="number"
                                        value={globalForm.cancellation_fee_minimum || ''}
                                        onChange={(e) => setGlobalForm({ ...globalForm, cancellation_fee_minimum: e.target.value })}
                                        disabled={!editingGlobal || !globalForm.cancellation_fee_enabled}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                        helperText="Floor amount"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Maximum Fee"
                                        type="number"
                                        value={globalForm.cancellation_fee_maximum || ''}
                                        onChange={(e) => setGlobalForm({ ...globalForm, cancellation_fee_maximum: e.target.value })}
                                        disabled={!editingGlobal || !globalForm.cancellation_fee_enabled}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                        helperText="Cap amount"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Hours Threshold"
                                        type="number"
                                        value={globalForm.cancellation_fee_hours_threshold || ''}
                                        onChange={(e) => setGlobalForm({ ...globalForm, cancellation_fee_hours_threshold: e.target.value })}
                                        disabled={!editingGlobal || !globalForm.cancellation_fee_enabled}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">hours</InputAdornment>
                                        }}
                                        helperText="Before contract start"
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    // Custom Commissions Table
    const renderCustomCommissionsTable = () => (
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
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
                    bgcolor: 'white',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <PeopleOutlineIcon sx={{ fontSize: 22, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#1e293b', fontSize: '1.1rem' }}>
                            Custom User Overrides
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {totalCount} user{totalCount !== 1 ? 's' : ''} with custom rates
                        </Typography>
                    </Box>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
                        onClick={fetchCustomCommissions}
                        size="small"
                        sx={{
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                                borderColor: '#cbd5e1',
                                bgcolor: '#f8fafc',
                            }
                        }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        onClick={handleOpenCreate}
                        size="small"
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                boxShadow: '0 4px 8px rgba(102, 126, 234, 0.4)',
                            }
                        }}
                    >
                        Add Custom Rate
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ width: '100%', overflow: 'hidden' }}>
                {loading && <LinearProgress sx={{ height: 2 }} />}
                <DataGrid
                    rows={customCommissions}
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
                    slots={{
                        noRowsOverlay: () => (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 6 }}>
                                <TuneIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">No Custom Overrides</Typography>
                                <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                                    All users are using global commission rates
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenCreate}
                                    size="small"
                                >
                                    Add First Custom Rate
                                </Button>
                            </Box>
                        ),
                    }}
                    sx={{
                        border: 'none',
                        fontSize: '0.875rem',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            '&:focus, &:focus-within': {
                                outline: 'none',
                            },
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 600,
                            color: '#475569',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                        },
                        '& .MuiDataGrid-row': {
                            '&:hover': {
                                bgcolor: '#f8fafc',
                            },
                            '&:nth-of-type(even)': {
                                bgcolor: '#fafafa',
                            },
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            '&:focus, &:focus-within': {
                                outline: 'none',
                            },
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid #e2e8f0',
                            bgcolor: '#f8fafc',
                        },
                        '& .MuiTablePagination-root': {
                            color: '#64748b',
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            minHeight: 200,
                        },
                    }}
                />
            </Box>
        </Card>
    );

    // Create/Edit Modal
    const renderModal = () => (
        <Dialog
            open={modal.open}
            onClose={handleCloseModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: modal.mode === 'create' ? 'primary.main' : 'warning.main', width: 40, height: 40 }}>
                        {modal.mode === 'create' ? <AddIcon /> : <EditIcon />}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            {modal.mode === 'create' ? 'Create Custom Commission' : 'Edit Custom Commission'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {modal.mode === 'create' ? 'Set custom rates for a specific user' : 'Modify existing custom rates'}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {/* User Selection */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 18 }} /> Select User
                        </Typography>
                        <Autocomplete
                            fullWidth
                            options={users}
                            loading={usersLoading}
                            value={selectedUser}
                            disabled={modal.mode === 'edit'}
                            onChange={(event, newValue) => {
                                setSelectedUser(newValue);
                                setFormData({ ...formData, user_id: newValue?.id || '' });
                            }}
                            getOptionLabel={(option) => {
                                if (!option) return '';
                                const name = option.name || option.first_name || '';
                                return name ? `${option.email} (${name})` : option.email;
                            }}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            filterOptions={(options, { inputValue }) => {
                                const filterValue = inputValue.toLowerCase();
                                return options.filter(option =>
                                    option.email?.toLowerCase().includes(filterValue) ||
                                    option.name?.toLowerCase().includes(filterValue) ||
                                    option.first_name?.toLowerCase().includes(filterValue)
                                );
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search by email or name..."
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {usersLoading ? <CircularProgress size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                            {option.email?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2">{option.email}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.name || option.first_name || `ID: ${option.id}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </li>
                            )}
                        />
                    </Box>

                    {/* Rate Overrides */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PercentIcon sx={{ fontSize: 18 }} /> Rate Overrides
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Commission"
                                        type="number"
                                        value={formData.temporary_commission_percentage}
                                        onChange={(e) => setFormData({ ...formData, temporary_commission_percentage: e.target.value })}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                                        }}
                                        placeholder="Use global"
                                        helperText="Direct hire"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Service Fee"
                                        type="number"
                                        value={formData.service_fee_override}
                                        onChange={(e) => setFormData({ ...formData, service_fee_override: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                        placeholder="Use global"
                                        helperText="Non-direct hire"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Subscription"
                                        type="number"
                                        value={formData.monthly_subscription_override}
                                        onChange={(e) => setFormData({ ...formData, monthly_subscription_override: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                        placeholder="Use global"
                                        helperText="Monthly fee"
                                    />
                                </Grid>
                            </Grid>
                            <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mt: 2 }}>
                                Leave fields empty to use global rates.
                            </Alert>
                        </Paper>
                    </Box>

                    {/* Validity Period */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 18 }} /> Validity Period (Optional)
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Valid From"
                                        type="date"
                                        value={formData.valid_from || ''}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Valid Until"
                                        type="date"
                                        value={formData.valid_until || ''}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    {/* Reason */}
                    <TextField
                        fullWidth
                        label="Reason for Custom Rate"
                        multiline
                        rows={2}
                        value={formData.reason || ''}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="e.g., Negotiated rate for large volume client"
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleCloseModal} disabled={savingCustom} variant="outlined">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSaveCustom}
                    disabled={savingCustom || (modal.mode === 'create' && !selectedUser)}
                    startIcon={savingCustom ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{
                        minWidth: 120,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                        }
                    }}
                >
                    {modal.mode === 'create' ? 'Create' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    // User Rates Modal
    const renderUserRatesModal = () => (
        <Dialog
            open={userRatesModal.open}
            onClose={() => setUserRatesModal({ open: false, userId: null, rates: null, loading: false })}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                        <VisibilityIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>Effective Commission Rates</Typography>
                        <Typography variant="caption" color="text.secondary">
                            User #{userRatesModal.userId}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {userRatesModal.loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Loading rates...
                        </Typography>
                    </Box>
                ) : userRatesModal.rates ? (
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Alert
                            severity={userRatesModal.rates.source === 'custom' ? 'success' : 'info'}
                            icon={userRatesModal.rates.source === 'custom' ? <CheckCircleIcon /> : <InfoOutlinedIcon />}
                        >
                            <Typography variant="body2">
                                <strong>Rate Source:</strong> {AdminCommissionService.getSourceBadge(userRatesModal.rates.source).label}
                            </Typography>
                            {userRatesModal.rates.reason && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    <strong>Reason:</strong> {userRatesModal.rates.reason}
                                </Typography>
                            )}
                        </Alert>

                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                {Object.entries(userRatesModal.rates.rates || {}).map(([key, value]) => {
                                    if (value === null || value === undefined) return null;
                                    if (typeof value === 'object' && value !== null) {
                                        return (
                                            <Grid item xs={12} key={key}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Typography>
                                                <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: 'grey.50' }}>
                                                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', m: 0, whiteSpace: 'pre-wrap' }}>
                                                        {JSON.stringify(value, null, 2)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        );
                                    }
                                    return (
                                        <Grid item xs={6} key={key}>
                                            <Typography variant="caption" color="text.secondary">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                {typeof value === 'number'
                                                    ? (key.includes('percentage') ? `${value}%` : AdminCommissionService.formatCurrency(value))
                                                    : String(value)}
                                            </Typography>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Paper>
                    </Stack>
                ) : (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        No rate information available for this user.
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={() => setUserRatesModal({ open: false, userId: null, rates: null, loading: false })}
                    variant="outlined"
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Delete Confirmation Dialog
    const renderDeleteConfirm = () => (
        <Dialog
            open={deleteConfirm.open}
            onClose={() => setDeleteConfirm({ open: false, commission: null })}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40 }}>
                        <DeleteIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>Delete Custom Commission?</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">
                    Are you sure you want to delete the custom commission for{' '}
                    <strong>{deleteConfirm.commission?.user?.email || `User #${deleteConfirm.commission?.user_id}`}</strong>?
                </Typography>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    This user will revert to using global commission rates.
                </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={() => setDeleteConfirm({ open: false, commission: null })} variant="outlined">
                    Cancel
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Commission Management"
                subtitle="Configure global and custom commission rates"
                icon={<PercentIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: '/admin/dashboard' },
                    { label: 'Billing' },
                    { label: 'Commissions' },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                {/* Snackbar */}
                <Snackbar
                        open={snackbar.open}
                        autoHideDuration={4000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            severity={snackbar.severity}
                            onClose={() => setSnackbar({ ...snackbar, open: false })}
                            variant="filled"
                            sx={{ minWidth: 300 }}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>

                    {/* Statistics Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Direct Hire Commission"
                                value={`${globalSettings?.temporary_commission_percentage || 10}%`}
                                subtitle="Publisher pays on direct hire"
                                gradient={gradientCards.commission.background}
                                icon={gradientCards.commission.icon}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Service Fee"
                                value={AdminCommissionService.formatCurrency(globalSettings?.service_fee || 20)}
                                subtitle="Both users pay (non-direct)"
                                gradient={gradientCards.serviceFee.background}
                                icon={gradientCards.serviceFee.icon}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Monthly Subscription"
                                value={AdminCommissionService.formatCurrency(globalSettings?.monthly_subscription_fee || 300)}
                                subtitle="Agencies (from 2nd contract)"
                                gradient={gradientCards.subscription.background}
                                icon={gradientCards.subscription.icon}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Custom Overrides"
                                value={statistics?.custom_count || 0}
                                subtitle={`${statistics?.active_count || 0} currently active`}
                                gradient={gradientCards.overrides.background}
                                icon={gradientCards.overrides.icon}
                                loading={loading}
                            />
                        </Grid>
                    </Grid>

                    {/* Global Settings */}
                    {renderGlobalSettings()}

                    {/* Custom Commissions Table */}
                    {renderCustomCommissionsTable()}

                {/* Modals */}
                {renderModal()}
                {renderUserRatesModal()}
                {renderDeleteConfirm()}
            </Box>
        </Box>
    );
};

export default CommissionDashboard;
