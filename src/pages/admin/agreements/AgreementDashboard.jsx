import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, CardContent, Box, Typography, Chip, IconButton, Tooltip,
    TextField, MenuItem, Button, Collapse, Avatar, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider, Alert,
    Stepper, Step, StepLabel, StepConnector
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ClearIcon from '@mui/icons-material/Clear';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DrawIcon from '@mui/icons-material/Draw';

import PageHeader from "@components/admin/PageHeader";
import AdminAgreementService from '../../../services/admin/AdminAgreementService';

// Industry configuration
const INDUSTRIES = [
    { key: "dental", name: "Dental Care", icon: "🦷", color: "#00BCD4" },
    { key: "pharmacy", name: "Pharmacy", icon: "💊", color: "#4CAF50" },
    { key: "general", name: "General Medicine", icon: "🏥", color: "#2196F3" },
    { key: "nursing", name: "Nursing & Home Care", icon: "🏠", color: "#9C27B0" },
];

// Custom Step Connector for signature progress
const SignatureConnector = styled(StepConnector)(({ theme }) => ({
    '& .MuiStepConnector-line': {
        borderColor: '#e0e0e0',
        borderTopWidth: 3,
    },
    '&.Mui-active .MuiStepConnector-line': {
        borderColor: '#4caf50',
    },
    '&.Mui-completed .MuiStepConnector-line': {
        borderColor: '#4caf50',
    },
}));

// Helper to calculate days ago
const getDaysAgo = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Helper to get age display
const getAgeDisplay = (dateString) => {
    const days = getDaysAgo(dateString);
    if (days === null) return "N/A";
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
};

// Helper to check if agreement is stale (pending > 7 days)
const isStale = (agreement) => {
    if (agreement.status === 'fully_signed') return false;
    const days = getDaysAgo(agreement.created_at);
    return days !== null && days > 7;
};

// Helper to get waiting time for pending signature
const getWaitingTime = (agreement) => {
    if (agreement.status === 'fully_signed') return null;

    // If pending client signature, calculate from agency signed date or created date
    if (agreement.status === 'pending_client' && agreement.agency_signed_at) {
        return getDaysAgo(agreement.agency_signed_at);
    }

    // If pending agency signature, calculate from created date
    return getDaysAgo(agreement.created_at);
};

const AdminAgreementDashboard = () => {
    const navigate = useNavigate();

    // State
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [error, setError] = useState(null);

    // Modals
    const [detailsModal, setDetailsModal] = useState({ open: false, agreement: null, loading: false });

    // Filters
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [selectedStat, setSelectedStat] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        date_from: '',
        date_to: '',
        stale_only: false
    });

    // Pagination
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [totalCount, setTotalCount] = useState(0);

    // Fetch data
    const fetchAgreements = async () => {
        try {
            setLoading(true);
            const params = {
                limit: paginationModel.pageSize,
                offset: paginationModel.page * paginationModel.pageSize,
                ...filters,
                ...(selectedIndustry && { industry: selectedIndustry }),
                ...(selectedStat && { status: selectedStat })
            };
            const response = await AdminAgreementService.getAllAgreements(params);
            setAgreements(response.data || []);
            setTotalCount(response.pagination?.total || 0);
            setError(null);
        } catch (err) {
            setError('Failed to load agreements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await AdminAgreementService.getAgreementStatistics();
            setStatistics(stats);
        } catch (err) {
            console.error('Failed to load statistics:', err);
        }
    };

    useEffect(() => {
        document.title = "Agreement Management | Quicklocum";
        fetchStatistics();
    }, []);

    useEffect(() => {
        fetchAgreements();
    }, [paginationModel, filters, selectedIndustry, selectedStat]);

    // Handlers
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            search: '',
            date_from: '',
            date_to: '',
            stale_only: false
        });
        setSelectedIndustry(null);
        setSelectedStat(null);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const handleIndustryClick = (industryKey) => {
        setSelectedIndustry(selectedIndustry === industryKey ? null : industryKey);
        setSelectedStat(null);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const handleStatClick = (statKey) => {
        if (statKey === selectedStat) {
            setSelectedStat(null);
        } else {
            setSelectedStat(statKey);
            setSelectedIndustry(null);
        }
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const handleViewDetails = async (agreement) => {
        setDetailsModal({ open: true, agreement, loading: true });
        try {
            const details = await AdminAgreementService.getAgreementDetails(agreement.id);
            setDetailsModal(prev => ({ ...prev, agreement: details, loading: false }));
        } catch (err) {
            console.error('Failed to load agreement details:', err);
            setDetailsModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handlePreviewAgreement = async (agreementId) => {
        try {
            await AdminAgreementService.previewAgreement(agreementId);
        } catch (err) {
            console.error('Failed to preview agreement:', err);
        }
    };

    const handleDownloadPDF = async (agreementId, agreementNumber) => {
        try {
            const blob = await AdminAgreementService.downloadAgreementPDF(agreementId, true);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${agreementNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to download agreement PDF');
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'fully_signed': 'success',
            'pending_client': 'warning',
            'pending_agency': 'info',
            'draft': 'default'
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'fully_signed': 'Fully Signed',
            'pending_client': 'Pending Client',
            'pending_agency': 'Pending Agency',
            'draft': 'Draft'
        };
        return labels[status] || status;
    };

    // Calculate stale counts
    const getStaleCount = () => {
        return agreements.filter(a => isStale(a)).length;
    };

    const staleCount = getStaleCount();

    // Get signature step for progress indicator
    const getSignatureStep = (agreement) => {
        if (agreement.status === 'fully_signed') return 3;
        if (agreement.status === 'pending_client' && agreement.agency_signed) return 2;
        if (agreement.status === 'pending_agency') return 1;
        return 0;
    };

    // Table columns
    const columns = [
        {
            field: "agreement_number",
            headerName: "Agreement #",
            minWidth: 160,
            flex: 0.8,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, lineHeight: 1.2 }}>
                    <span style={{ fontWeight: 700, color: '#1976d2', fontSize: '0.875rem' }}>
                        {params.value}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#888' }}>
                        {getAgeDisplay(params.row.created_at)}
                    </span>
                </Box>
            )
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const stale = isStale(params.row);
                const waitingDays = getWaitingTime(params.row);
                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <Chip
                            label={getStatusLabel(params.value)}
                            color={getStatusColor(params.value)}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                        {stale && waitingDays > 0 && (
                            <Tooltip title={`Waiting ${waitingDays} days for signature`}>
                                <Chip
                                    icon={<HourglassEmptyIcon sx={{ fontSize: '12px !important' }} />}
                                    label={`${waitingDays}d`}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        height: 18,
                                        fontSize: '0.65rem',
                                        bgcolor: '#ffebee',
                                        color: '#d32f2f',
                                        '& .MuiChip-icon': { color: '#d32f2f' }
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        },
        {
            field: "signature_progress",
            headerName: "Progress",
            minWidth: 160,
            flex: 0.8,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => {
                const step = getSignatureStep(params.row);
                return (
                    <Box sx={{ width: '100%', px: 1 }}>
                        <Stepper
                            activeStep={step}
                            connector={<SignatureConnector />}
                            sx={{ '& .MuiStepLabel-root': { p: 0 } }}
                        >
                            <Step completed={step >= 1}>
                                <Tooltip title="Draft Created">
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <DescriptionIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: step >= 1 ? '#4caf50' : '#bdbdbd'
                                                }}
                                            />
                                        )}
                                    />
                                </Tooltip>
                            </Step>
                            <Step completed={step >= 2}>
                                <Tooltip title="Agency Signed">
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <DrawIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: step >= 2 ? '#4caf50' : '#bdbdbd'
                                                }}
                                            />
                                        )}
                                    />
                                </Tooltip>
                            </Step>
                            <Step completed={step >= 3}>
                                <Tooltip title="Client Signed">
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <CheckCircleIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: step >= 3 ? '#4caf50' : '#bdbdbd'
                                                }}
                                            />
                                        )}
                                    />
                                </Tooltip>
                            </Step>
                        </Stepper>
                    </Box>
                );
            }
        },
        {
            field: "agency",
            headerName: "Agency",
            minWidth: 180,
            flex: 1,
            headerAlign: 'center',
            align: 'left',
            renderCell: (params) => {
                if (!params.row.agency) return <span style={{ color: '#999' }}>N/A</span>;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#2196f3', fontSize: 12 }}>
                            <BusinessIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Tooltip title={params.row.agency.name}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                    {params.row.agency.name}
                                </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {params.row.agency.email}
                            </Typography>
                        </Box>
                        <Tooltip title="View Profile">
                            <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/users/${params.row.agency.id}/profile/view`)}
                                sx={{ color: '#1976d2', p: '2px' }}
                            >
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            }
        },
        {
            field: "client",
            headerName: "Client",
            minWidth: 180,
            flex: 1,
            headerAlign: 'center',
            align: 'left',
            renderCell: (params) => {
                if (!params.row.client) return <span style={{ color: '#999' }}>N/A</span>;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#4caf50', fontSize: 12 }}>
                            <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Tooltip title={params.row.client.name}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                    {params.row.client.name}
                                </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {params.row.client.email}
                            </Typography>
                        </Box>
                        <Tooltip title="View Profile">
                            <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/users/${params.row.client.id}/profile/view`)}
                                sx={{ color: '#1976d2', p: '2px' }}
                            >
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            }
        },
        {
            field: "contract",
            headerName: "Contract",
            minWidth: 160,
            flex: 0.8,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                if (!params.row.contract) return <span style={{ color: '#999' }}>N/A</span>;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title={params.row.contract.contract_type || 'View Contract'}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                                {params.row.contract.contract_type || `#${params.row.contract.id}`}
                            </Typography>
                        </Tooltip>
                        <Tooltip title="View Contract">
                            <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/contracts?id=${params.row.contract.id}`)}
                                sx={{ color: '#ff9800', p: '2px' }}
                            >
                                <AssignmentIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 130,
            flex: 0.6,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => handleViewDetails(params.row)}
                            sx={{ color: '#4caf50' }}
                        >
                            <VisibilityIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview Agreement">
                        <IconButton
                            size="small"
                            onClick={() => handlePreviewAgreement(params.row.id)}
                            sx={{ color: '#2196f3' }}
                        >
                            <DescriptionIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                        <IconButton
                            size="small"
                            onClick={() => handleDownloadPDF(params.row.id, params.row.agreement_number)}
                            sx={{ color: '#ff9800' }}
                        >
                            <DownloadIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Agreement Management"
                subtitle="Monitor and manage all agreements"
                icon={<DescriptionIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: '/admin/dashboard' },
                    { label: 'Agreements' },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                {/* Error Alert */}
                {error && (
                        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Statistics Cards - Clickable */}
                    {statistics && (
                        <div className="row mb-3">
                            {[
                                { key: null, label: "Total Agreements", value: statistics.total_agreements, color: "#1976d2", icon: <DescriptionIcon /> },
                                { key: "fully_signed", label: "Fully Signed", value: statistics.fully_signed, color: "#4caf50", icon: <CheckCircleIcon /> },
                                { key: "pending_client", label: "Pending Client", value: statistics.pending_client, color: "#ff9800", icon: <ScheduleIcon /> },
                                { key: "pending_agency", label: "Pending Agency", value: statistics.pending_agency, color: "#2196f3", icon: <HourglassEmptyIcon /> },
                            ].map((stat, idx) => (
                                <div className="col-lg-3 col-md-6 col-6" key={idx}>
                                    <Card
                                        onClick={() => stat.key && handleStatClick(stat.key)}
                                        sx={{
                                            cursor: stat.key ? 'pointer' : 'default',
                                            border: selectedStat === stat.key ? `3px solid ${stat.color}` : '1px solid #e0e0e0',
                                            boxShadow: selectedStat === stat.key ? `0 4px 20px ${stat.color}40` : '0 2px 8px rgba(0,0,0,0.08)',
                                            transition: 'all 0.2s',
                                            '&:hover': stat.key ? {
                                                boxShadow: `0 4px 20px ${stat.color}30`,
                                                transform: 'scale(1.02)'
                                            } : {}
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {stat.label}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ color: stat.color, opacity: 0.7 }}>
                                                    {React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Industry Cards */}
                    <div className="row mb-3">
                        {INDUSTRIES.map((industry, idx) => (
                            <div className="col-md-3 col-6" key={idx}>
                                <Card
                                    onClick={() => handleIndustryClick(industry.key)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: selectedIndustry === industry.key ? `3px solid ${industry.color}` : '1px solid #e0e0e0',
                                        boxShadow: selectedIndustry === industry.key ? `0 4px 20px ${industry.color}40` : '0 2px 8px rgba(0,0,0,0.08)',
                                        '&:hover': {
                                            boxShadow: `0 4px 20px ${industry.color}30`,
                                            transform: 'scale(1.02)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {industry.name}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: `${industry.color}15`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 22
                                                }}
                                            >
                                                {industry.icon}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Stale Agreements Alert Banner */}
                    {staleCount > 0 && !selectedStat && (
                        <Card sx={{ mb: 3, bgcolor: '#fff3e0', border: '1px solid #ffb74d' }}>
                            <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <WarningAmberIcon sx={{ color: '#e65100', fontSize: 28 }} />
                                    <Typography variant="subtitle1" fontWeight={700} color="#e65100">
                                        Attention Required
                                    </Typography>
                                </Box>
                                <Chip
                                    icon={<HourglassEmptyIcon sx={{ fontSize: '16px !important' }} />}
                                    label={`${staleCount} agreement${staleCount > 1 ? 's' : ''} pending signature for over 7 days`}
                                    sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 600 }}
                                />
                                <Box flex={1} />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="warning"
                                    onClick={() => handleFilterChange('stale_only', true)}
                                >
                                    Show Stale Only
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Filter Indicators */}
                    {(selectedIndustry || selectedStat || filters.stale_only) && (
                        <Box mb={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="body2" color="text.secondary">
                                Active filters:
                            </Typography>
                            {selectedIndustry && (
                                <Chip
                                    label={INDUSTRIES.find(i => i.key === selectedIndustry)?.name || selectedIndustry}
                                    onDelete={() => setSelectedIndustry(null)}
                                    sx={{
                                        bgcolor: INDUSTRIES.find(i => i.key === selectedIndustry)?.color || '#1976d2',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            )}
                            {selectedStat && (
                                <Chip
                                    label={getStatusLabel(selectedStat)}
                                    onDelete={() => setSelectedStat(null)}
                                    color={getStatusColor(selectedStat)}
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                            {filters.stale_only && (
                                <Chip
                                    label="Stale Only (>7 days)"
                                    onDelete={() => handleFilterChange('stale_only', false)}
                                    sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 600 }}
                                />
                            )}
                        </Box>
                    )}

                    {/* Filters Card */}
                    <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                bgcolor: '#fafafa',
                                borderBottom: filtersExpanded ? '1px solid #e0e0e0' : 'none',
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                            onClick={() => setFiltersExpanded(!filtersExpanded)}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <FilterListIcon sx={{ color: '#1976d2' }} />
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Filters</span>
                            </Box>
                            <IconButton size="small">
                                {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>

                        <Collapse in={filtersExpanded}>
                            <CardContent>
                                <div className="row">
                                    <div className="col-md-2">
                                        <TextField
                                            fullWidth
                                            size="small"
                                            select
                                            label="Status"
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <MenuItem value="">All Statuses</MenuItem>
                                            <MenuItem value="fully_signed">Fully Signed</MenuItem>
                                            <MenuItem value="pending_client">Pending Client</MenuItem>
                                            <MenuItem value="pending_agency">Pending Agency</MenuItem>
                                            <MenuItem value="draft">Draft</MenuItem>
                                        </TextField>
                                    </div>
                                    <div className="col-md-3">
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Search"
                                            placeholder="Agreement #, name, email..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="From Date"
                                            type="date"
                                            value={filters.date_from}
                                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="To Date"
                                            type="date"
                                            value={filters.date_to}
                                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <Box display="flex" gap={1} height="100%" alignItems="flex-start">
                                            <Button
                                                variant={filters.stale_only ? "contained" : "outlined"}
                                                color="warning"
                                                size="small"
                                                onClick={() => handleFilterChange('stale_only', !filters.stale_only)}
                                                startIcon={<HourglassEmptyIcon />}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Stale Only
                                            </Button>
                                            <Tooltip title="Clear Filters">
                                                <IconButton onClick={handleClearFilters} color="secondary">
                                                    <ClearIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Refresh">
                                                <IconButton onClick={fetchAgreements} color="primary">
                                                    <RefreshIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </div>
                                </div>
                            </CardContent>
                        </Collapse>
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
                                <DescriptionIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                                <Typography variant="h5" fontWeight={700} color="#333">
                                    Agreements
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
                                rows={agreements}
                                columns={columns}
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                pageSizeOptions={[10, 25, 50, 100]}
                                rowCount={totalCount}
                                paginationMode="server"
                                disableRowSelectionOnClick
                                disableColumnMenu
                                autoHeight
                                getRowId={(row) => row.id}
                                rowHeight={75}
                                columnHeaderHeight={48}
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f5f7fa',
                                        borderBottom: '2px solid #e0e0e0',
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid #f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                    },
                                    '& .MuiDataGrid-row:nth-of-type(even)': {
                                        backgroundColor: '#fafbfc',
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: '#f0f7ff',
                                    },
                                }}
                            />
                        </Box>
                    </Card>
            </Box>

            {/* Agreement Details Modal */}
            <Dialog
                open={detailsModal.open}
                onClose={() => setDetailsModal({ open: false, agreement: null, loading: false })}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <DescriptionIcon />
                        Agreement Details - {detailsModal.agreement?.agreement_number}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {detailsModal.loading ? (
                        <Box textAlign="center" py={5}>
                            <LinearProgress />
                            <Typography variant="body1" color="text.secondary" mt={2}>
                                Loading agreement details...
                            </Typography>
                        </Box>
                    ) : detailsModal.agreement ? (
                        <>
                            {/* Status and Progress */}
                            <Box mb={3}>
                                <Typography variant="h6" fontWeight={600} mb={2}>Status & Progress</Typography>
                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                    <Chip
                                        label={getStatusLabel(detailsModal.agreement.status)}
                                        color={getStatusColor(detailsModal.agreement.status)}
                                        sx={{ fontWeight: 600 }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Created {getAgeDisplay(detailsModal.agreement.created_at)}
                                    </Typography>
                                </Box>
                                <Stepper activeStep={getSignatureStep(detailsModal.agreement)} sx={{ mb: 2 }}>
                                    <Step completed={getSignatureStep(detailsModal.agreement) >= 1}>
                                        <StepLabel>Draft Created</StepLabel>
                                    </Step>
                                    <Step completed={getSignatureStep(detailsModal.agreement) >= 2}>
                                        <StepLabel>Agency Signed</StepLabel>
                                    </Step>
                                    <Step completed={getSignatureStep(detailsModal.agreement) >= 3}>
                                        <StepLabel>Client Signed</StepLabel>
                                    </Step>
                                </Stepper>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Parties */}
                            <div className="row">
                                <div className="col-md-6">
                                    <Card sx={{ bgcolor: detailsModal.agreement.agency_signed ? '#e8f5e9' : '#fff3e0', mb: 2 }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                {detailsModal.agreement.agency_signed ? (
                                                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                                ) : (
                                                    <ScheduleIcon sx={{ color: '#ff9800' }} />
                                                )}
                                                <Typography variant="h6" fontWeight={600}>Agency</Typography>
                                            </Box>
                                            {detailsModal.agreement.agency ? (
                                                <>
                                                    <Typography variant="body1" fontWeight={600}>
                                                        {detailsModal.agreement.agency.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                                        {detailsModal.agreement.agency.email}
                                                    </Typography>
                                                    {detailsModal.agreement.agency_signed ? (
                                                        <Box>
                                                            <Chip label="Signed" color="success" size="small" sx={{ mb: 1 }} />
                                                            <Typography variant="caption" display="block">
                                                                By: {detailsModal.agreement.agency_signed_name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {detailsModal.agreement.agency_signed_at && new Date(detailsModal.agreement.agency_signed_at).toLocaleString()}
                                                            </Typography>
                                                            {detailsModal.agreement.agency_ip && (
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    IP: {detailsModal.agreement.agency_ip}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Chip label="Pending Signature" color="warning" size="small" />
                                                    )}
                                                </>
                                            ) : (
                                                <Typography color="text.secondary">N/A</Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="col-md-6">
                                    <Card sx={{ bgcolor: detailsModal.agreement.client_signed ? '#e8f5e9' : '#fff3e0', mb: 2 }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                {detailsModal.agreement.client_signed ? (
                                                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                                ) : (
                                                    <ScheduleIcon sx={{ color: '#ff9800' }} />
                                                )}
                                                <Typography variant="h6" fontWeight={600}>Client</Typography>
                                            </Box>
                                            {detailsModal.agreement.client ? (
                                                <>
                                                    <Typography variant="body1" fontWeight={600}>
                                                        {detailsModal.agreement.client.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                                        {detailsModal.agreement.client.email}
                                                    </Typography>
                                                    {detailsModal.agreement.client_signed ? (
                                                        <Box>
                                                            <Chip label="Signed" color="success" size="small" sx={{ mb: 1 }} />
                                                            <Typography variant="caption" display="block">
                                                                By: {detailsModal.agreement.client_signed_name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {detailsModal.agreement.client_signed_at && new Date(detailsModal.agreement.client_signed_at).toLocaleString()}
                                                            </Typography>
                                                            {detailsModal.agreement.client_ip && (
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    IP: {detailsModal.agreement.client_ip}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Chip label="Pending Signature" color="warning" size="small" />
                                                    )}
                                                </>
                                            ) : (
                                                <Typography color="text.secondary">N/A</Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Contract Info */}
                            {detailsModal.agreement.contract && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" fontWeight={600} mb={2}>Related Contract</Typography>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body1">
                                            {detailsModal.agreement.contract.contract_type || `Contract #${detailsModal.agreement.contract.id}`}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AssignmentIcon />}
                                            onClick={() => navigate(`/admin/contracts?id=${detailsModal.agreement.contract.id}`)}
                                        >
                                            View Contract
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </>
                    ) : (
                        <Box textAlign="center" py={5}>
                            <Typography color="text.secondary">Failed to load agreement details</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsModal({ open: false, agreement: null, loading: false })}>
                        Close
                    </Button>
                    {detailsModal.agreement && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<DescriptionIcon />}
                                onClick={() => handlePreviewAgreement(detailsModal.agreement.id)}
                            >
                                Preview
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadPDF(detailsModal.agreement.id, detailsModal.agreement.agreement_number)}
                            >
                                Download PDF
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminAgreementDashboard;
