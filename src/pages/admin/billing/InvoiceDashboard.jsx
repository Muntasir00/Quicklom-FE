import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Chip, IconButton, Tooltip, Avatar,
    LinearProgress, Grid, TextField, MenuItem, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Divider, Alert, Collapse, Menu
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import BlockIcon from '@mui/icons-material/Block';
import PaidIcon from '@mui/icons-material/Paid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AdminInvoiceService from '../../../services/admin/AdminInvoiceService';
import PageHeader from "@components/admin/PageHeader";

// Invoice type card config
const INVOICE_TYPE_CONFIG = {
    commission: { icon: '💰', label: 'Commission', color: '#4caf50', bgColor: '#e8f5e9' },
    monthly_subscription: { icon: '📅', label: 'Monthly', color: '#2196f3', bgColor: '#e3f2fd' },
    service_fee: { icon: '📄', label: 'Service Fee', color: '#ff9800', bgColor: '#fff3e0' },
    per_contract_fee: { icon: '📋', label: 'Per Contract', color: '#9c27b0', bgColor: '#f3e5f5' }
};

const InvoiceDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const menu = "billing";

    // State
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        payment_plan: '',
        invoice_type: '',
        search: '',
        date_from: '',
        date_to: '',
        overdue_only: false
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedInvoiceType, setSelectedInvoiceType] = useState(null);

    // Modal state
    const [detailsModal, setDetailsModal] = useState({ open: false, invoice: null, loading: false });
    const [actionMenu, setActionMenu] = useState({ anchorEl: null, invoice: null });
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const filterOptions = AdminInvoiceService.getFilterOptions();

    // Load data
    useEffect(() => {
        fetchStatistics();
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [page, pageSize, filters, selectedStatus, selectedInvoiceType]);

    // Check URL params for contract_id filter
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const contractId = searchParams.get('contract_id');
        if (contractId) {
            setFilters(prev => ({ ...prev, contract_id: contractId }));
        }
    }, [location.search]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                status: selectedStatus || filters.status,
                invoice_type: selectedInvoiceType || filters.invoice_type,
                limit: pageSize,
                offset: page * pageSize
            };
            const response = await AdminInvoiceService.getAllInvoices(params);
            setInvoices(response.data || []);
            setTotalCount(response.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await AdminInvoiceService.getInvoiceStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            status: '',
            payment_plan: '',
            invoice_type: '',
            search: '',
            date_from: '',
            date_to: '',
            overdue_only: false
        });
        setSelectedStatus(null);
        setSelectedInvoiceType(null);
        setPage(0);
    };

    const handleStatClick = (status) => {
        if (selectedStatus === status) {
            setSelectedStatus(null);
        } else {
            setSelectedStatus(status);
        }
        setPage(0);
    };

    const handleInvoiceTypeClick = (type) => {
        if (selectedInvoiceType === type) {
            setSelectedInvoiceType(null);
        } else {
            setSelectedInvoiceType(type);
        }
        setPage(0);
    };

    const handleViewDetails = async (invoiceId) => {
        setDetailsModal({ open: true, invoice: null, loading: true });
        try {
            const invoice = await AdminInvoiceService.getInvoiceDetails(invoiceId);
            setDetailsModal({ open: true, invoice, loading: false });
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            setDetailsModal({ open: false, invoice: null, loading: false });
        }
    };

    const handleAction = async (action, invoice) => {
        setActionMenu({ anchorEl: null, invoice: null });
        setActionLoading(true);
        try {
            let result;
            switch (action) {
                case 'reminder':
                    result = await AdminInvoiceService.sendReminder(invoice.id);
                    setSnackbar({ open: true, message: result.message || 'Reminder sent!', severity: 'success' });
                    break;
                case 'mark_paid':
                    result = await AdminInvoiceService.markAsPaid(invoice.id);
                    setSnackbar({ open: true, message: 'Invoice marked as paid', severity: 'success' });
                    fetchInvoices();
                    fetchStatistics();
                    break;
                case 'void':
                    result = await AdminInvoiceService.voidInvoice(invoice.id);
                    setSnackbar({ open: true, message: 'Invoice voided', severity: 'success' });
                    fetchInvoices();
                    fetchStatistics();
                    break;
                default:
                    break;
            }
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Action failed', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    // Due date status helper
    const getDueDateStatus = (invoice) => {
        if (invoice.status === 'PAID') return { label: 'Paid', color: '#4caf50', bgColor: '#e8f5e9', icon: '✓' };
        if (invoice.status === 'VOID') return { label: 'Voided', color: '#757575', bgColor: '#f5f5f5', icon: '—' };

        if (invoice.is_overdue) {
            const days = invoice.days_overdue || 0;
            return { label: `${days}d overdue`, color: '#d32f2f', bgColor: '#ffebee', icon: '⚠️' };
        }

        if (invoice.days_until_due !== null && invoice.days_until_due !== undefined) {
            if (invoice.days_until_due === 0) {
                return { label: 'Due Today', color: '#e65100', bgColor: '#fff3e0', icon: '⏰' };
            }
            if (invoice.days_until_due <= 3) {
                return { label: `Due in ${invoice.days_until_due}d`, color: '#f9a825', bgColor: '#fffde7', icon: '📅' };
            }
            return { label: `Due in ${invoice.days_until_due}d`, color: '#388e3c', bgColor: '#e8f5e9', icon: '📅' };
        }

        return { label: 'Open', color: '#ff9800', bgColor: '#fff3e0', icon: '○' };
    };

    // Format currency
    const formatCurrency = (cents) => AdminInvoiceService.formatCurrency(cents);
    const formatDate = (date) => AdminInvoiceService.formatDate(date);

    // Get age display
    const getAgeDisplay = (createdAt) => {
        if (!createdAt) return '';
        const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    };

    // Table columns
    const columns = [
        {
            field: 'invoice_number_display',
            headerName: 'Invoice #',
            flex: 1,
            minWidth: 140,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, lineHeight: 1.2 }}>
                    <span style={{ fontWeight: 700, color: '#1976d2', fontSize: '0.85rem' }}>
                        {params.value}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#888' }}>
                        {getAgeDisplay(params.row.created_at)}
                    </span>
                </Box>
            )
        },
        {
            field: 'invoice_type',
            headerName: 'Type',
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const typeInfo = AdminInvoiceService.getInvoiceTypeInfo(params.value);
                return (
                    <Chip
                        label={typeInfo.icon + ' ' + typeInfo.label}
                        size="small"
                        sx={{
                            bgcolor: typeInfo.bgColor,
                            color: typeInfo.color,
                            fontWeight: 600,
                            fontSize: '0.7rem'
                        }}
                    />
                );
            }
        },
        {
            field: 'user',
            headerName: 'User',
            flex: 1,
            minWidth: 180,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            {params.row.user?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {params.row.user?.email || 'N/A'}
                        </Typography>
                    </Box>
                    <Tooltip title="View Profile">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/users/${params.row.user?.id}/profile/view`);
                            }}
                            sx={{ color: '#1976d2', p: '4px' }}
                        >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        },
        {
            field: 'contract',
            headerName: 'Contract',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                params.row.contract?.id ? (
                    <Tooltip title={`View Contract #${params.row.contract.id}`}>
                        <Chip
                            label={`#${params.row.contract.id}`}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/contracts?id=${params.row.contract.id}`);
                            }}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#bbdefb' }
                            }}
                        />
                    </Tooltip>
                ) : <span style={{ color: '#999' }}>—</span>
            )
        },
        {
            field: 'amount_due',
            headerName: 'Amount',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700}>
                    {formatCurrency(params.value)}
                </Typography>
            )
        },
        {
            field: 'due_date',
            headerName: 'Due Date',
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const status = getDueDateStatus(params.row);
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, lineHeight: 1.2 }}>
                        <span style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                            {params.value ? formatDate(params.value) : '—'}
                        </span>
                        <Chip
                            label={status.icon + ' ' + status.label}
                            size="small"
                            sx={{
                                height: 16,
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                bgcolor: status.bgColor,
                                color: status.color,
                                '& .MuiChip-label': { px: 0.75, py: 0 }
                            }}
                        />
                    </Box>
                );
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 110,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const isOverdue = params.row.is_overdue;
                const status = isOverdue && params.value === 'OPEN' ? 'OVERDUE' : params.value;
                const colorMap = {
                    'OPEN': { bg: '#fff3e0', color: '#e65100' },
                    'PAID': { bg: '#e8f5e9', color: '#2e7d32' },
                    'OVERDUE': { bg: '#ffebee', color: '#c62828' },
                    'VOID': { bg: '#f5f5f5', color: '#757575' },
                    'DRAFT': { bg: '#e3f2fd', color: '#1565c0' },
                    'UNCOLLECTIBLE': { bg: '#ffebee', color: '#c62828' }
                };
                const colors = colorMap[status] || colorMap['OPEN'];
                return (
                    <Chip
                        label={status}
                        size="small"
                        sx={{
                            bgcolor: colors.bg,
                            color: colors.color,
                            fontWeight: 700,
                            fontSize: '0.7rem'
                        }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: '4px' }}>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => handleViewDetails(params.row.id)}
                            sx={{ color: '#1976d2' }}
                        >
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    {params.row.invoice_pdf_url && (
                        <Tooltip title="Download PDF">
                            <IconButton
                                size="small"
                                onClick={() => window.open(params.row.invoice_pdf_url, '_blank')}
                                sx={{ color: '#d32f2f' }}
                            >
                                <PictureAsPdfIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="More Actions">
                        <IconButton
                            size="small"
                            onClick={(e) => setActionMenu({ anchorEl: e.currentTarget, invoice: params.row })}
                            sx={{ color: '#757575' }}
                        >
                            <MoreVertIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Invoice Management"
                subtitle="Manage billing and invoices"
                icon={<ReceiptIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: '/admin/dashboard' },
                    { label: 'Billing' },
                    { label: 'Invoices' },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                {/* Snackbar */}
                <Collapse in={snackbar.open}>
                        <Alert
                            severity={snackbar.severity}
                            onClose={() => setSnackbar({ ...snackbar, open: false })}
                            sx={{ mb: 2 }}
                        >
                            {snackbar.message}
                        </Alert>
                    </Collapse>

                    {/* Global Stats Bar */}
                    {statistics?.overview && (
                        <Card sx={{ mb: 3, bgcolor: '#1976d2', color: 'white' }}>
                            <CardContent sx={{ py: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <ReceiptIcon sx={{ fontSize: 40 }} />
                                        <Box>
                                            <Typography variant="h4" fontWeight={700}>
                                                {statistics.overview.total_invoices}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Total Invoices
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={4} flexWrap="wrap">
                                        <Box textAlign="center" sx={{ cursor: 'pointer' }} onClick={() => handleStatClick('PAID')}>
                                            <Typography variant="h5" fontWeight={700}>
                                                {formatCurrency(statistics.overview.total_collected_cents)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.9 }}>Collected</Typography>
                                        </Box>
                                        <Box textAlign="center" sx={{ cursor: 'pointer' }} onClick={() => handleStatClick('OPEN')}>
                                            <Typography variant="h5" fontWeight={700}>
                                                {formatCurrency(statistics.overview.outstanding_amount_cents)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.9 }}>Outstanding</Typography>
                                        </Box>
                                        {statistics.this_month && (
                                            <Box textAlign="center">
                                                <Typography variant="h5" fontWeight={700}>
                                                    {formatCurrency(statistics.this_month.total_cents)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.9 }}>This Month</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Clickable Status Cards */}
                    {statistics?.overview && (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {[
                                { key: 'OPEN', label: 'Open', value: statistics.overview.open_invoices, icon: <AccessTimeIcon />, color: '#ff9800' },
                                { key: 'PAID', label: 'Paid', value: statistics.overview.paid_invoices, icon: <CheckCircleIcon />, color: '#4caf50' },
                                { key: 'OVERDUE', label: 'Overdue', value: statistics.overview.overdue_invoices, icon: <WarningAmberIcon />, color: '#d32f2f', amount: statistics.overview.overdue_amount_cents },
                                { key: 'VOID', label: 'Voided', value: statistics.overview.void_invoices, icon: <BlockIcon />, color: '#757575' }
                            ].map((stat) => (
                                <Grid item xs={6} md={3} key={stat.key}>
                                    <Card
                                        onClick={() => handleStatClick(stat.key)}
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: selectedStatus === stat.key ? `3px solid ${stat.color}` : '1px solid #e0e0e0',
                                            boxShadow: selectedStatus === stat.key ? `0 4px 20px ${stat.color}40` : 'none',
                                            '&:hover': { boxShadow: `0 4px 12px ${stat.color}30` }
                                        }}
                                    >
                                        <CardContent sx={{ py: 2 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {stat.label}
                                                    </Typography>
                                                    {stat.amount !== undefined && stat.amount > 0 && (
                                                        <Typography variant="caption" color="error.main" fontWeight={600}>
                                                            {formatCurrency(stat.amount)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color }}>
                                                    {stat.icon}
                                                </Avatar>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Invoice Type Cards */}
                    {statistics?.invoice_types && Object.keys(statistics.invoice_types).length > 0 && (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {Object.entries(INVOICE_TYPE_CONFIG).map(([key, config]) => {
                                const typeData = statistics.invoice_types[key] || { count: 0, total_amount_cents: 0 };
                                return (
                                    <Grid item xs={6} md={3} key={key}>
                                        <Card
                                            onClick={() => handleInvoiceTypeClick(key)}
                                            sx={{
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: selectedInvoiceType === key ? `3px solid ${config.color}` : '1px solid #e0e0e0',
                                                boxShadow: selectedInvoiceType === key ? `0 4px 20px ${config.color}40` : 'none',
                                                '&:hover': { boxShadow: `0 4px 12px ${config.color}30` }
                                            }}
                                        >
                                            <CardContent sx={{ py: 2 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="h5" fontWeight={700} sx={{ color: config.color }}>
                                                            {typeData.count}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {config.label}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatCurrency(typeData.total_amount_cents)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        width: 45, height: 45, borderRadius: 2,
                                                        bgcolor: config.bgColor,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 24
                                                    }}>
                                                        {config.icon}
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}

                    {/* Overdue Alert Banner */}
                    {statistics?.overview?.overdue_invoices > 0 && (
                        <Card sx={{ mb: 3, bgcolor: '#ffebee', border: '1px solid #ef9a9a' }}>
                            <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <WarningAmberIcon sx={{ color: '#c62828', fontSize: 28 }} />
                                    <Typography variant="subtitle1" fontWeight={700} color="#c62828">
                                        Attention Required
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={2} flex={1} flexWrap="wrap">
                                    <Chip
                                        label={`${statistics.overview.overdue_invoices} Overdue Invoice${statistics.overview.overdue_invoices > 1 ? 's' : ''}`}
                                        sx={{ bgcolor: '#c62828', color: 'white', fontWeight: 600 }}
                                    />
                                    <Chip
                                        label={`${formatCurrency(statistics.overview.overdue_amount_cents)} Outstanding`}
                                        sx={{ bgcolor: '#ffcdd2', color: '#c62828', fontWeight: 600 }}
                                    />
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    onClick={() => handleStatClick('OVERDUE')}
                                >
                                    View Overdue
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Filter Indicator */}
                    {(selectedStatus || selectedInvoiceType) && (
                        <Box mb={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="body2" color="text.secondary">Active filters:</Typography>
                            {selectedStatus && (
                                <Chip
                                    label={`Status: ${selectedStatus}`}
                                    onDelete={() => setSelectedStatus(null)}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                            {selectedInvoiceType && (
                                <Chip
                                    label={`Type: ${INVOICE_TYPE_CONFIG[selectedInvoiceType]?.label || selectedInvoiceType}`}
                                    onDelete={() => setSelectedInvoiceType(null)}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                        </Box>
                    )}

                    {/* Filters */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={showFilters ? 2 : 0}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <TextField
                                        size="small"
                                        placeholder="Search invoice #, user, email..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        sx={{ minWidth: 280 }}
                                    />
                                    <Button
                                        variant="outlined"
                                        startIcon={<FilterListIcon />}
                                        onClick={() => setShowFilters(!showFilters)}
                                        size="small"
                                    >
                                        {showFilters ? 'Hide Filters' : 'More Filters'}
                                    </Button>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Button
                                        variant="text"
                                        onClick={handleResetFilters}
                                        size="small"
                                    >
                                        Reset
                                    </Button>
                                    <IconButton onClick={() => { fetchInvoices(); fetchStatistics(); }}>
                                        <RefreshIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Collapse in={showFilters}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            label="Status"
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {filterOptions.statuses.map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            label="Payment Plan"
                                            value={filters.payment_plan}
                                            onChange={(e) => handleFilterChange('payment_plan', e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {filterOptions.paymentPlans.map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            label="Invoice Type"
                                            value={filters.invoice_type}
                                            onChange={(e) => handleFilterChange('invoice_type', e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {filterOptions.invoiceTypes.map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.icon} {opt.label}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            type="date"
                                            fullWidth
                                            size="small"
                                            label="From Date"
                                            value={filters.date_from}
                                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            type="date"
                                            fullWidth
                                            size="small"
                                            label="To Date"
                                            value={filters.date_to}
                                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>
                            </Collapse>
                        </CardContent>
                    </Card>

                    {/* Data Grid */}
                    <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Box sx={{
                            p: 2,
                            borderBottom: '2px solid #1976d2',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <ReceiptIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                                <Typography variant="h5" fontWeight={700} color="#333">
                                    Invoices
                                </Typography>
                                <Chip
                                    label={totalCount}
                                    size="small"
                                    sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700 }}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ width: '100%' }}>
                            {loading && <LinearProgress />}
                            <DataGrid
                                rows={invoices}
                                columns={columns}
                                rowCount={totalCount}
                                paginationMode="server"
                                paginationModel={{ page, pageSize }}
                                onPaginationModelChange={(model) => {
                                    setPage(model.page);
                                    setPageSize(model.pageSize);
                                }}
                                pageSizeOptions={[10, 25, 50, 100]}
                                disableRowSelectionOnClick
                                disableColumnMenu
                                autoHeight
                                getRowId={(row) => row.id}
                                rowHeight={70}
                                columnHeaderHeight={48}
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f7fa', borderBottom: '2px solid #e0e0e0' },
                                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: '0.85rem', color: '#333' },
                                    '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' },
                                    '& .MuiDataGrid-row:hover': { backgroundColor: '#f0f7ff' },
                                    '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: '#fafbfc' }
                                }}
                            />
                        </Box>
                </Card>
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenu.anchorEl}
                open={Boolean(actionMenu.anchorEl)}
                onClose={() => setActionMenu({ anchorEl: null, invoice: null })}
            >
                {actionMenu.invoice?.status === 'OPEN' && (
                    <MenuItem onClick={() => handleAction('reminder', actionMenu.invoice)} disabled={actionLoading}>
                        <SendIcon sx={{ mr: 1, fontSize: 18 }} /> Send Reminder
                    </MenuItem>
                )}
                {actionMenu.invoice?.status === 'OPEN' && (
                    <MenuItem onClick={() => handleAction('mark_paid', actionMenu.invoice)} disabled={actionLoading}>
                        <PaidIcon sx={{ mr: 1, fontSize: 18, color: '#4caf50' }} /> Mark as Paid
                    </MenuItem>
                )}
                {actionMenu.invoice?.status === 'OPEN' && (
                    <MenuItem onClick={() => handleAction('void', actionMenu.invoice)} disabled={actionLoading}>
                        <BlockIcon sx={{ mr: 1, fontSize: 18, color: '#d32f2f' }} /> Void Invoice
                    </MenuItem>
                )}
                {actionMenu.invoice?.hosted_invoice_url && (
                    <MenuItem onClick={() => window.open(actionMenu.invoice.hosted_invoice_url, '_blank')}>
                        <OpenInNewIcon sx={{ mr: 1, fontSize: 18 }} /> Open in Stripe
                    </MenuItem>
                )}
            </Menu>

            {/* Invoice Details Modal */}
            <Dialog
                open={detailsModal.open}
                onClose={() => setDetailsModal({ open: false, invoice: null, loading: false })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon />
                    Invoice Details
                    {detailsModal.invoice && (
                        <Chip
                            label={detailsModal.invoice.stripe_invoice_number || detailsModal.invoice.custom_invoice_number || detailsModal.invoice.stripe_invoice_id}
                            size="small"
                            sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                    )}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {detailsModal.loading ? (
                        <Box textAlign="center" py={4}>
                            <LinearProgress />
                            <Typography color="text.secondary" mt={2}>Loading invoice details...</Typography>
                        </Box>
                    ) : detailsModal.invoice && (
                        <Grid container spacing={3}>
                            {/* Invoice Info */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Invoice Information</Typography>
                                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <span>Invoice #:</span>
                                        <strong>{detailsModal.invoice.stripe_invoice_number || detailsModal.invoice.custom_invoice_number || detailsModal.invoice.stripe_invoice_id}</strong>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <span>Status:</span>
                                        <Chip label={detailsModal.invoice.status} size="small" color={
                                            detailsModal.invoice.status === 'PAID' ? 'success' :
                                            detailsModal.invoice.status === 'OPEN' ? 'warning' : 'default'
                                        } />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <span>Created:</span>
                                        <span>{formatDate(detailsModal.invoice.created_at)}</span>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <span>Payment Plan:</span>
                                        <span>{detailsModal.invoice.payment_plan}</span>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Financial */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Financial Details</Typography>
                                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <span>Amount Due:</span>
                                        <strong style={{ color: '#1976d2' }}>{formatCurrency(detailsModal.invoice.amount_due_cents)}</strong>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <span>Amount Paid:</span>
                                        <span style={{ color: '#4caf50' }}>{formatCurrency(detailsModal.invoice.amount_paid_cents)}</span>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <span>Remaining:</span>
                                        <span style={{ color: detailsModal.invoice.amount_remaining_cents > 0 ? '#d32f2f' : '#4caf50' }}>
                                            {formatCurrency(detailsModal.invoice.amount_remaining_cents)}
                                        </span>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <span>Tax:</span>
                                        <span>{formatCurrency(detailsModal.invoice.total_tax_cents)}</span>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* User */}
                            {detailsModal.invoice.user && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>User Information</Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <span>Name:</span>
                                            <strong>{detailsModal.invoice.user.name}</strong>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <span>Email:</span>
                                            <span>{detailsModal.invoice.user.email}</span>
                                        </Box>
                                        {detailsModal.invoice.user.practice_name && (
                                            <Box display="flex" justifyContent="space-between">
                                                <span>Practice:</span>
                                                <span>{detailsModal.invoice.user.practice_name}</span>
                                            </Box>
                                        )}
                                        <Button
                                            size="small"
                                            startIcon={<PersonIcon />}
                                            onClick={() => navigate(`/admin/users/${detailsModal.invoice.user.id}/profile/view`)}
                                            sx={{ mt: 1 }}
                                        >
                                            View Profile
                                        </Button>
                                    </Box>
                                </Grid>
                            )}

                            {/* Contract */}
                            {detailsModal.invoice.contract && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Contract Information</Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <span>Contract ID:</span>
                                            <Chip label={`#${detailsModal.invoice.contract.id}`} size="small" color="primary" />
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <span>Type:</span>
                                            <span>{detailsModal.invoice.contract.contract_type}</span>
                                        </Box>
                                        <Button
                                            size="small"
                                            startIcon={<AssignmentIcon />}
                                            onClick={() => navigate(`/admin/contracts?id=${detailsModal.invoice.contract.id}`)}
                                            sx={{ mt: 1 }}
                                        >
                                            View Contract
                                        </Button>
                                    </Box>
                                </Grid>
                            )}

                            {/* Line Items */}
                            {detailsModal.invoice.line_items?.length > 0 && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Line Items</Typography>
                                    <Box sx={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                    <th style={{ padding: 8, textAlign: 'left' }}>Description</th>
                                                    <th style={{ padding: 8, textAlign: 'right' }}>Qty</th>
                                                    <th style={{ padding: 8, textAlign: 'right' }}>Unit Price</th>
                                                    <th style={{ padding: 8, textAlign: 'right' }}>Amount</th>
                                                    <th style={{ padding: 8, textAlign: 'right' }}>Tax</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailsModal.invoice.line_items.map((item, idx) => {
                                                    const tax = (item.tax_gst || 0) + (item.tax_pst || 0) + (item.tax_hst || 0) + (item.tax_qst || 0);
                                                    return (
                                                        <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                            <td style={{ padding: 8 }}>{item.description}</td>
                                                            <td style={{ padding: 8, textAlign: 'right' }}>{item.quantity}</td>
                                                            <td style={{ padding: 8, textAlign: 'right' }}>CA${item.unit_price?.toFixed(2)}</td>
                                                            <td style={{ padding: 8, textAlign: 'right' }}>CA${item.amount?.toFixed(2)}</td>
                                                            <td style={{ padding: 8, textAlign: 'right' }}>CA${tax.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    {detailsModal.invoice?.invoice_pdf_url && (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={() => window.open(detailsModal.invoice.invoice_pdf_url, '_blank')}
                        >
                            Download PDF
                        </Button>
                    )}
                    <Button onClick={() => setDetailsModal({ open: false, invoice: null, loading: false })}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InvoiceDashboard;
