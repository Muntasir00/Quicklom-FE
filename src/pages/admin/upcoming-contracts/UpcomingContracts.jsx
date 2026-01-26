import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, CardContent, Box, Typography, Chip, IconButton, Tooltip,
    TextField, MenuItem, Button, Collapse, Avatar, Badge, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/Event';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';

import PageHeader from "@components/admin/PageHeader";
import AdminUpcomingContractsService from '../../../services/admin/AdminUpcomingContractsService';

// Industry configuration
const INDUSTRIES = [
    { key: "dental", name: "Dental Care", icon: "🦷", color: "#00BCD4" },
    { key: "pharmacy", name: "Pharmacy", icon: "💊", color: "#4CAF50" },
    { key: "general", name: "General Medicine", icon: "🏥", color: "#2196F3" },
    { key: "nursing", name: "Nursing & Home Care", icon: "🏠", color: "#9C27B0" },
];

// Urgency options
const URGENCY_OPTIONS = [
    { value: "in_progress", label: "In Progress", color: "#d32f2f" },
    { value: "starting_today", label: "Starting Today", color: "#d32f2f" },
    { value: "starting_tomorrow", label: "Starting Tomorrow", color: "#e65100" },
    { value: "starting_soon", label: "Within 3 Days", color: "#e65100" },
    { value: "this_week", label: "This Week", color: "#f9a825" },
    { value: "upcoming", label: "7+ Days", color: "#388e3c" },
];

// Timing status helper
const getTimingStatus = (startDate, endDate) => {
    if (!startDate) return null;

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    if (end) end.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24));

    if (end && end < now) {
        return { key: "ended", label: "Ended", color: "#757575", bgColor: "#f5f5f5", icon: "⚫" };
    }
    if (start <= now && (!end || end >= now)) {
        return { key: "in_progress", label: "In Progress", color: "#d32f2f", bgColor: "#ffebee", icon: "🔴" };
    }
    if (diffDays === 0) {
        return { key: "today", label: "Starts Today!", color: "#d32f2f", bgColor: "#ffebee", icon: "🔴" };
    }
    if (diffDays === 1) {
        return { key: "tomorrow", label: "Tomorrow", color: "#e65100", bgColor: "#fff3e0", icon: "🟠" };
    }
    if (diffDays > 0 && diffDays <= 3) {
        return { key: "soon", label: `${diffDays} days`, color: "#e65100", bgColor: "#fff3e0", icon: "🟠" };
    }
    if (diffDays > 3 && diffDays <= 7) {
        return { key: "this_week", label: `${diffDays} days`, color: "#f9a825", bgColor: "#fffde7", icon: "🟡" };
    }
    return { key: "upcoming", label: `${diffDays} days`, color: "#388e3c", bgColor: "#e8f5e9", icon: "🟢" };
};

const AdminUpcomingContracts = () => {
    const navigate = useNavigate();

    // State
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [error, setError] = useState(null);

    // Modals
    const [viewModal, setViewModal] = useState({ open: false, contract: null });
    const [applicantsModal, setApplicantsModal] = useState({ open: false, contract: null, data: null, loading: false });
    const [agreementModal, setAgreementModal] = useState({ open: false, contract: null, data: null, loading: false });

    // Filters
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [selectedStat, setSelectedStat] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        urgency: '',
        date_from: '',
        date_to: '',
        sort_by: 'priority',
        sort_order: 'asc',
        include_in_progress: true
    });

    // Pagination
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [totalCount, setTotalCount] = useState(0);

    // Fetch data
    const fetchContracts = async () => {
        try {
            setLoading(true);
            // Determine if selectedStat is a status or urgency filter
            const isUrgencyStat = selectedStat === 'urgent';
            const params = {
                limit: paginationModel.pageSize,
                offset: paginationModel.page * paginationModel.pageSize,
                ...filters,
                ...(selectedIndustry && { industry: selectedIndustry }),
                ...(selectedStat && !isUrgencyStat && { status: selectedStat }),
                ...(selectedStat && isUrgencyStat && { urgency: selectedStat })
            };
            const response = await AdminUpcomingContractsService.getUpcomingContracts(params);
            setContracts(response.data || []);
            setTotalCount(response.pagination?.total || 0);
            setError(null);
        } catch (err) {
            setError('Failed to load contracts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await AdminUpcomingContractsService.getStatistics();
            setStatistics(stats);
        } catch (err) {
            console.error('Failed to load statistics:', err);
        }
    };

    useEffect(() => {
        document.title = "Upcoming Contracts | Quicklocum";
        fetchStatistics();
    }, []);

    useEffect(() => {
        fetchContracts();
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
            urgency: '',
            date_from: '',
            date_to: '',
            sort_by: 'priority',
            sort_order: 'asc',
            include_in_progress: true
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

    const handleViewApplicants = async (contract) => {
        setApplicantsModal({ open: true, contract, data: null, loading: true });
        try {
            const data = await AdminUpcomingContractsService.getContractApplicants(contract.id);
            setApplicantsModal(prev => ({ ...prev, data, loading: false }));
        } catch (err) {
            console.error('Failed to load applicants:', err);
            setApplicantsModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleViewAgreement = async (contract) => {
        setAgreementModal({ open: true, contract, data: null, loading: true });
        try {
            const data = await AdminUpcomingContractsService.getContractAgreement(contract.id);
            setAgreementModal(prev => ({ ...prev, data, loading: false }));
        } catch (err) {
            console.error('Failed to load agreement:', err);
            setAgreementModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDownloadAgreement = async (agreementId) => {
        try {
            const response = await AdminUpcomingContractsService.downloadAgreementPDF(agreementId);
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `agreement_${agreementId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading agreement:', error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'booked': 'success',
            'pending_signature': 'warning',
            'open': 'info',
            'pending': 'default'
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'booked': 'Booked',
            'pending_signature': 'Pending Signature',
            'open': 'Open',
            'pending': 'Pending'
        };
        return labels[status] || status;
    };

    // Calculate urgent counts from current contracts
    const getUrgentCounts = () => {
        let inProgress = 0, today = 0, tomorrow = 0, soon = 0;
        contracts.forEach(c => {
            const timing = getTimingStatus(c.start_date, c.end_date);
            if (timing?.key === 'in_progress') inProgress++;
            else if (timing?.key === 'today') today++;
            else if (timing?.key === 'tomorrow') tomorrow++;
            else if (timing?.key === 'soon') soon++;
        });
        return { inProgress, today, tomorrow, soon };
    };

    const urgentCounts = getUrgentCounts();
    const hasUrgentItems = urgentCounts.inProgress > 0 || urgentCounts.today > 0 || urgentCounts.tomorrow > 0 || urgentCounts.soon > 0;

    // Table columns
    const columns = [
        {
            field: "id",
            headerName: "ID",
            width: 70,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <span style={{ fontWeight: 600, color: '#666' }}>#{params.value}</span>
            )
        },
        {
            field: "timing",
            headerName: "Timing",
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const timing = getTimingStatus(params.row.start_date, params.row.end_date);
                if (!timing) return "-";
                return (
                    <Chip
                        label={timing.icon + " " + timing.label}
                        size="small"
                        sx={{
                            bgcolor: timing.bgColor,
                            color: timing.color,
                            fontWeight: 600,
                            fontSize: '0.7rem'
                        }}
                    />
                );
            }
        },
        {
            field: "status",
            headerName: "Status",
            width: 140,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={getStatusLabel(params.value)}
                    color={getStatusColor(params.value)}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                />
            )
        },
        {
            field: "contract_type",
            headerName: "Contract Type",
            flex: 1,
            minWidth: 180,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Tooltip title={params.row.contract_type?.name || "-"}>
                    <span style={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        {params.row.contract_type?.name || "-"}
                    </span>
                </Tooltip>
            )
        },
        {
            field: "publisher",
            headerName: "Publisher",
            width: 200,
            headerAlign: 'center',
            align: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Tooltip title={params.row.publisher?.name || "N/A"}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                {params.row.publisher?.name || "N/A"}
                            </Typography>
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {params.row.publisher?.email || "N/A"}
                        </Typography>
                    </Box>
                    <Tooltip title="View Profile">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/users/${params.row.publisher?.id}/profile/view`)}
                            sx={{ color: '#1976d2', p: '4px' }}
                        >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        },
        {
            field: "service_provider",
            headerName: "Service Provider",
            width: 200,
            headerAlign: 'center',
            align: 'left',
            renderCell: (params) => {
                if (!params.row.service_provider) {
                    return (
                        <Chip
                            label="Not Assigned"
                            size="small"
                            variant="outlined"
                            color="warning"
                            sx={{ fontSize: '0.7rem' }}
                        />
                    );
                }
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Tooltip title={params.row.service_provider?.name || "N/A"}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                    {params.row.service_provider?.name || "N/A"}
                                </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {params.row.service_provider?.type || "Professional"}
                            </Typography>
                        </Box>
                        <Tooltip title="View Profile">
                            <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/users/${params.row.service_provider?.id}/profile/view`)}
                                sx={{ color: '#1976d2', p: '4px' }}
                            >
                                <OpenInNewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            }
        },
        {
            field: "start_date",
            headerName: "Start",
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Typography variant="body2" fontSize="0.8rem">
                    {formatDate(params.value)}
                </Typography>
            )
        },
        {
            field: "applications",
            headerName: "Apps",
            width: 80,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Tooltip title={`${params.row.application_count || 0} applicants`}>
                    <Chip
                        icon={<PeopleIcon sx={{ fontSize: '14px !important' }} />}
                        label={params.row.application_count || 0}
                        size="small"
                        color={params.row.application_count > 0 ? "primary" : "default"}
                        variant={params.row.application_count > 0 ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => handleViewApplicants(params.row)}
                    />
                </Tooltip>
            )
        },
        {
            field: "agreement",
            headerName: "Agreement",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                if (!params.row.has_agreement) {
                    return (
                        <Tooltip title="No agreement">
                            <CancelIcon sx={{ color: '#bdbdbd', fontSize: 20 }} />
                        </Tooltip>
                    );
                }
                const status = params.row.agreement_status;
                let icon, color, tooltip;
                if (status === 'fully_signed') {
                    icon = <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
                    tooltip = "Fully Signed";
                } else if (status === 'pending_client') {
                    icon = <ScheduleIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
                    tooltip = "Pending Client Signature";
                } else if (status === 'pending_agency') {
                    icon = <ScheduleIcon sx={{ color: '#2196f3', fontSize: 20 }} />;
                    tooltip = "Pending Agency Signature";
                } else {
                    icon = <DescriptionIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />;
                    tooltip = status || "Agreement exists";
                }
                return (
                    <Tooltip title={tooltip}>
                        <IconButton size="small" onClick={() => handleViewAgreement(params.row)}>
                            {icon}
                        </IconButton>
                    </Tooltip>
                );
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 140,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => setViewModal({ open: true, contract: params.row })}
                            sx={{ color: '#4caf50' }}
                        >
                            <VisibilityIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="View Applicants">
                        <IconButton
                            size="small"
                            onClick={() => handleViewApplicants(params.row)}
                            sx={{ color: '#2196f3' }}
                        >
                            <PeopleIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Contract">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/contracts/${params.row.id}/edit`)}
                            sx={{ color: '#ff9800' }}
                        >
                            <EditIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Upcoming Contracts"
                subtitle="View and manage upcoming contracts"
                icon={<CalendarTodayIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: '/admin/dashboard' },
                    { label: 'Contracts' },
                    { label: 'Upcoming' },
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
                                { key: null, label: "Total Upcoming", value: statistics.total_upcoming, color: "#1976d2", icon: <CalendarTodayIcon /> },
                                { key: "urgent", label: "Urgent (<7 days)", value: statistics.urgent, color: "#d32f2f", icon: <WarningAmberIcon /> },
                                { key: "booked", label: "Booked", value: statistics.booked, color: "#4caf50", icon: <CheckCircleIcon /> },
                                { key: "pending_signature", label: "Pending Signature", value: statistics.pending_signature, color: "#ff9800", icon: <DescriptionIcon /> },
                                { key: "open", label: "Open", value: statistics.open, color: "#2196f3", icon: <AssignmentIcon /> },
                                { key: "pending", label: "Pending", value: statistics.pending, color: "#757575", icon: <ScheduleIcon /> },
                            ].map((stat, idx) => (
                                <div className="col-lg-2 col-md-4 col-6" key={idx}>
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

                    {/* Urgent Alert Banner */}
                    {hasUrgentItems && !selectedStat && !selectedIndustry && (
                        <Card sx={{ mb: 3, bgcolor: '#fff3e0', border: '1px solid #ffb74d' }}>
                            <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <WarningAmberIcon sx={{ color: '#e65100', fontSize: 28 }} />
                                    <Typography variant="subtitle1" fontWeight={700} color="#e65100">
                                        Attention Required
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={2} flexWrap="wrap" flex={1}>
                                    {urgentCounts.inProgress > 0 && (
                                        <Chip
                                            icon={<PlayArrowIcon sx={{ fontSize: '16px !important' }} />}
                                            label={`${urgentCounts.inProgress} In Progress`}
                                            sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 600 }}
                                        />
                                    )}
                                    {urgentCounts.today > 0 && (
                                        <Chip
                                            icon={<AccessTimeIcon sx={{ fontSize: '16px !important' }} />}
                                            label={`${urgentCounts.today} Starting Today`}
                                            sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 600 }}
                                        />
                                    )}
                                    {urgentCounts.tomorrow > 0 && (
                                        <Chip
                                            icon={<EventIcon sx={{ fontSize: '16px !important' }} />}
                                            label={`${urgentCounts.tomorrow} Starting Tomorrow`}
                                            sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                                        />
                                    )}
                                    {urgentCounts.soon > 0 && (
                                        <Chip
                                            icon={<CalendarTodayIcon sx={{ fontSize: '16px !important' }} />}
                                            label={`${urgentCounts.soon} Within 3 Days`}
                                            sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                                        />
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Filter Indicators */}
                    {(selectedIndustry || selectedStat) && (
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
                                    label={selectedStat === 'urgent' ? 'Urgent (<7 days)' : getStatusLabel(selectedStat)}
                                    onDelete={() => setSelectedStat(null)}
                                    color="primary"
                                    sx={{ fontWeight: 600 }}
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
                                            label="Urgency"
                                            value={filters.urgency}
                                            onChange={(e) => handleFilterChange('urgency', e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {URGENCY_OPTIONS.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.color }} />
                                                        {opt.label}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </div>
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
                                            <MenuItem value="booked">Booked</MenuItem>
                                            <MenuItem value="pending_signature">Pending Signature</MenuItem>
                                            <MenuItem value="open">Open</MenuItem>
                                            <MenuItem value="pending">Pending</MenuItem>
                                        </TextField>
                                    </div>
                                    <div className="col-md-3">
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Search"
                                            placeholder="Publisher, type..."
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
                                    <div className="col-md-1">
                                        <Box display="flex" gap={1} height="100%">
                                            <Tooltip title="Clear Filters">
                                                <IconButton onClick={handleClearFilters} color="secondary">
                                                    <ClearIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Refresh">
                                                <IconButton onClick={fetchContracts} color="primary">
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
                                <CalendarTodayIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                                <Typography variant="h5" fontWeight={700} color="#333">
                                    Upcoming Contracts
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
                                rows={contracts}
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
                                rowHeight={70}
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

            {/* View Contract Modal */}
            <Dialog
                open={viewModal.open}
                onClose={() => setViewModal({ open: false, contract: null })}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <AssignmentIcon />
                        Contract Details #{viewModal.contract?.id}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {viewModal.contract && (
                        <div className="row">
                            <div className="col-md-6">
                                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                <Chip
                                    label={getStatusLabel(viewModal.contract.status)}
                                    color={getStatusColor(viewModal.contract.status)}
                                    size="small"
                                    sx={{ mb: 2 }}
                                />

                                <Typography variant="subtitle2" color="text.secondary">Contract Type</Typography>
                                <Typography variant="body1" fontWeight={600} mb={2}>
                                    {viewModal.contract.contract_type?.name || "N/A"}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                                <Typography variant="body1" mb={2}>
                                    {formatDate(viewModal.contract.start_date)}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                                <Typography variant="body1" mb={2}>
                                    {formatDate(viewModal.contract.end_date)}
                                </Typography>
                            </div>
                            <div className="col-md-6">
                                <Typography variant="subtitle2" color="text.secondary">Publisher</Typography>
                                <Box mb={2}>
                                    <Typography variant="body1" fontWeight={600}>
                                        {viewModal.contract.publisher?.name || "N/A"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {viewModal.contract.publisher?.email || "N/A"}
                                    </Typography>
                                </Box>

                                <Typography variant="subtitle2" color="text.secondary">Service Provider</Typography>
                                <Box mb={2}>
                                    {viewModal.contract.service_provider ? (
                                        <>
                                            <Typography variant="body1" fontWeight={600}>
                                                {viewModal.contract.service_provider.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {viewModal.contract.service_provider.email}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Chip label="Not Assigned" size="small" color="warning" variant="outlined" />
                                    )}
                                </Box>

                                <Typography variant="subtitle2" color="text.secondary">Applications</Typography>
                                <Chip
                                    icon={<PeopleIcon />}
                                    label={viewModal.contract.application_count || 0}
                                    color="primary"
                                    size="small"
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewModal({ open: false, contract: null })}>
                        Close
                    </Button>
                    {viewModal.contract && (
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/admin/contracts/${viewModal.contract.id}/edit`)}
                        >
                            Edit Contract
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Applicants Modal */}
            <Dialog
                open={applicantsModal.open}
                onClose={() => setApplicantsModal({ open: false, contract: null, data: null, loading: false })}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PeopleIcon />
                        Applicants - Contract #{applicantsModal.contract?.id}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {applicantsModal.loading ? (
                        <Box textAlign="center" py={5}>
                            <LinearProgress />
                            <Typography variant="body1" color="text.secondary" mt={2}>
                                Loading applicants...
                            </Typography>
                        </Box>
                    ) : applicantsModal.data?.applicants?.length > 0 ? (
                        <>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Total Applicants: <strong>{applicantsModal.data.total_applicants}</strong>
                            </Alert>
                            {applicantsModal.data.applicants.map((applicant, idx) => (
                                <Card key={idx} sx={{ mb: 2, border: applicant.status === 'accepted' ? '2px solid #4caf50' : '1px solid #e0e0e0' }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ bgcolor: applicant.status === 'accepted' ? '#4caf50' : '#1976d2' }}>
                                                    {applicant.user?.type === 'Professional' ? <PersonIcon /> : <BusinessIcon />}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {applicant.user?.name || "N/A"}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {applicant.user?.email}
                                                    </Typography>
                                                    <Box display="flex" gap={1} mt={1}>
                                                        <Chip
                                                            label={applicant.user?.type || "Professional"}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            label={applicant.status}
                                                            size="small"
                                                            color={applicant.status === 'accepted' ? 'success' : applicant.status === 'pending' ? 'warning' : 'error'}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Tooltip title="View Profile">
                                                <IconButton
                                                    onClick={() => navigate(`/admin/users/${applicant.user?.id}/profile/view`)}
                                                    sx={{ color: '#1976d2' }}
                                                >
                                                    <OpenInNewIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    ) : (
                        <Box textAlign="center" py={5}>
                            <PeopleIcon sx={{ fontSize: 60, color: '#e0e0e0' }} />
                            <Typography variant="h6" color="text.secondary" mt={2}>
                                No applicants yet
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApplicantsModal({ open: false, contract: null, data: null, loading: false })}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Agreement Modal */}
            <Dialog
                open={agreementModal.open}
                onClose={() => setAgreementModal({ open: false, contract: null, data: null, loading: false })}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <DescriptionIcon />
                        Agreement - Contract #{agreementModal.contract?.id}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {agreementModal.loading ? (
                        <Box textAlign="center" py={5}>
                            <LinearProgress />
                            <Typography variant="body1" color="text.secondary" mt={2}>
                                Loading agreement...
                            </Typography>
                        </Box>
                    ) : agreementModal.data ? (
                        <>
                            <div className="row">
                                <div className="col-md-6">
                                    <Typography variant="subtitle2" color="text.secondary">Agreement Number</Typography>
                                    <Typography variant="body1" fontWeight={600} mb={2}>
                                        {agreementModal.data.agreement_number}
                                    </Typography>

                                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                    <Chip
                                        label={agreementModal.data.status}
                                        color={agreementModal.data.status === 'fully_signed' ? 'success' : 'warning'}
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                                    <Typography variant="body1" mb={2}>
                                        {agreementModal.data.created_at ? new Date(agreementModal.data.created_at).toLocaleString() : 'N/A'}
                                    </Typography>
                                </div>
                            </div>

                            <Divider sx={{ my: 2 }} />

                            {/* Signature Status */}
                            <Typography variant="h6" fontWeight={600} mb={2}>Signatures</Typography>
                            <div className="row">
                                <div className="col-md-6">
                                    <Card sx={{ bgcolor: agreementModal.data.agency_signed ? '#e8f5e9' : '#fff3e0' }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                {agreementModal.data.agency_signed ? (
                                                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                                ) : (
                                                    <ScheduleIcon sx={{ color: '#ff9800' }} />
                                                )}
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    Agency Signature
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2">
                                                {agreementModal.data.agency?.name || 'N/A'}
                                            </Typography>
                                            {agreementModal.data.agency_signed ? (
                                                <Typography variant="caption" color="text.secondary">
                                                    Signed by {agreementModal.data.agency_signed_name} on {new Date(agreementModal.data.agency_signed_at).toLocaleString()}
                                                </Typography>
                                            ) : (
                                                <Chip label="Pending" size="small" color="warning" sx={{ mt: 1 }} />
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="col-md-6">
                                    <Card sx={{ bgcolor: agreementModal.data.client_signed ? '#e8f5e9' : '#fff3e0' }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                {agreementModal.data.client_signed ? (
                                                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                                ) : (
                                                    <ScheduleIcon sx={{ color: '#ff9800' }} />
                                                )}
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    Client Signature
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2">
                                                {agreementModal.data.client?.name || 'N/A'}
                                            </Typography>
                                            {agreementModal.data.client_signed ? (
                                                <Typography variant="caption" color="text.secondary">
                                                    Signed by {agreementModal.data.client_signed_name} on {new Date(agreementModal.data.client_signed_at).toLocaleString()}
                                                </Typography>
                                            ) : (
                                                <Chip label="Pending" size="small" color="warning" sx={{ mt: 1 }} />
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Box textAlign="center" py={5}>
                            <DescriptionIcon sx={{ fontSize: 60, color: '#e0e0e0' }} />
                            <Typography variant="h6" color="text.secondary" mt={2}>
                                Failed to load agreement
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAgreementModal({ open: false, contract: null, data: null, loading: false })}>
                        Close
                    </Button>
                    {agreementModal.data && (
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadAgreement(agreementModal.data.id)}
                        >
                            Download PDF
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminUpcomingContracts;
