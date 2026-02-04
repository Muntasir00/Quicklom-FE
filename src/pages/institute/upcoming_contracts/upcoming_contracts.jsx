import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUpcomingContractsService } from "@services/institute/UpcomingContractsService";
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Alert,
    Stack,
    Divider,
    TextField,
    MenuItem,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Collapse,
    Tooltip,
    Avatar,
    Badge,
    LinearProgress
} from "@mui/material";
import {
    Search,
    FilterList,
    Close,
    CalendarToday,
    Person,
    CheckCircle,
    Warning,
    Edit,
    Visibility,
    ExpandMore,
    ExpandLess,
    Cancel,
    AccessTime,
    LocationOn,
    TrendingUp,
    Assignment,
    Schedule,
    Group,
    AttachMoney,
    EventNote,
    OpenInNew,
    Description,
    Work
} from "@mui/icons-material";
import CancelConfirmationModal from "@components/modals/CancelConfirmationModal";
import { cancelContractService } from "@services/institute/ContractCancellationService";

const InstituteUpcomingContracts = () => {
    const [loading, setLoading] = useState(true);
    const [contractsData, setContractsData] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [contractToCancel, setContractToCancel] = useState(null);

    // Filters
    const [searchText, setSearchText] = useState("");
    const [filterUrgency, setFilterUrgency] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterProfessional, setFilterProfessional] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // Expandable sections
    const [expandedSections, setExpandedSections] = useState({
        pending_signature: true,
        unassigned: true,
        imminent: true,
        this_week: false,
        this_month: false,
        future: false
    });

    useEffect(() => {
        fetchUpcomingContracts();
        const interval = setInterval(fetchUpcomingContracts, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchUpcomingContracts = async () => {
        try {
            const data = await getUpcomingContractsService();
            setContractsData(data);
        } catch (error) {
            console.error('Error fetching upcoming contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleOpenCancelModal = (contract) => {
        setContractToCancel(contract);
        setShowCancelModal(true);
        setShowDetailsModal(false); // Close details modal if open
    };

    const handleCancelContract = async (contractId, reason) => {
        const result = await cancelContractService(contractId, reason);
        if (result?.status) {
            // Refresh the contracts list
            await fetchUpcomingContracts();
            setShowCancelModal(false);
            setContractToCancel(null);
        }
        return result;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysText = (days) => {
        if (days === null || days === undefined) return '';
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days < 0) return `${Math.abs(days)}d ago`;
        return `${days} days`;
    };

    const getUrgencyChip = (urgency) => {
        const config = {
            critical: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Critical', icon: '!!' },
            high: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'High', icon: '!' },
            medium: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Medium', icon: '' },
            normal: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Normal', icon: '' }
        };
        const { bg, color, border, label, icon } = config[urgency] || config.normal;
        return (
            <Chip
                label={icon ? `${icon} ${label}` : label}
                size="small"
                sx={{
                    backgroundColor: bg,
                    color: color,
                    border: `1px solid ${border}`,
                    fontWeight: 600,
                    fontSize: '0.7rem'
                }}
            />
        );
    };

    // Helper function to determine redirect link based on user category and contract source
    const getContractRedirectInfo = (contract) => {
        const instituteCategoryId = parseInt(sessionStorage.getItem('institute_category_id') || '0');

        // For Clinics (1) and Pharmacies (2) - always redirect to My Contracts (they're always publishers)
        if (instituteCategoryId === 1 || instituteCategoryId === 2) {
            return {
                link: `/institute/contracts?contract_id=${contract.id}`,
                label: 'View in My Contracts',
                icon: <Description sx={{ fontSize: 18 }} />
            };
        }

        // For Agencies (3) and Headhunters (4) - check if publisher or applicant
        if (instituteCategoryId === 3 || instituteCategoryId === 4) {
            // contract.source is "published" if user is publisher, "applied" if user is applicant
            if (contract.source === 'published') {
                return {
                    link: `/institute/contracts?contract_id=${contract.id}`,
                    label: 'View in My Contracts',
                    icon: <Description sx={{ fontSize: 18 }} />
                };
            } else {
                // User applied to this contract
                return {
                    link: `/institute/applications?contract_id=${contract.id}`,
                    label: 'View in My Applications',
                    icon: <Work sx={{ fontSize: 18 }} />
                };
            }
        }

        // Default fallback
        return {
            link: `/institute/contracts?contract_id=${contract.id}`,
            label: 'View Contract',
            icon: <Description sx={{ fontSize: 18 }} />
        };
    };

    const filterContracts = (contracts) => {
        if (!contracts) return [];

        return contracts.filter(contract => {
            // Exclude cancelled contracts
            if (contract.status === 'cancelled') {
                return false;
            }

            // Search filter - check contract name, type, and position
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                const matchesName = contract.contract_type_name?.toLowerCase().includes(searchLower);
                const matchesPosition = contract.data?.position?.toLowerCase().includes(searchLower) ||
                    (contract.position_names && contract.position_names.some(name => name.toLowerCase().includes(searchLower)));
                const matchesContractName = contract.data?.contract_name?.toLowerCase().includes(searchLower);

                if (!matchesName && !matchesPosition && !matchesContractName) {
                    return false;
                }
            }

            // Urgency filter
            if (filterUrgency !== "all" && contract.urgency_level !== filterUrgency) {
                return false;
            }

            // Status filter
            if (filterStatus !== "all" && contract.status !== filterStatus) {
                return false;
            }

            // Professional filter
            if (filterProfessional === "assigned" && !contract.professional) {
                return false;
            }
            if (filterProfessional === "unassigned" && contract.professional) {
                return false;
            }

            return true;
        });
    };

    const ContractRow = ({ contract }) => (
        <TableRow
            hover
            sx={{
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                    backgroundColor: '#f8fafc',
                    '& .action-buttons': { opacity: 1 }
                },
                '& .action-buttons': { opacity: 0.6, transition: 'opacity 0.15s ease' }
            }}
            onClick={() => {
                setSelectedContract(contract);
                setShowDetailsModal(true);
            }}
        >
            <TableCell sx={{ py: 2 }}>
                <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0
                        }}
                    >
                        #{contract.id}
                    </Box>
                    <Stack spacing={0.25}>
                        <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b' }}>
                            {contract.contract_type_name || 'Contract'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {contract.position_names && contract.position_names.length > 0
                                ? contract.position_names.join(', ')
                                : (contract.data?.position || contract.data?.contract_name || '-')}
                        </Typography>
                        {contract.location && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOn sx={{ fontSize: 12, color: '#94a3b8' }} />
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                    {contract.location}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </TableCell>

            <TableCell align="center" sx={{ py: 2 }}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: '#f8fafc',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.75
                    }}
                >
                    <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }}>
                        {formatDate(contract.start_date)}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: contract.days_until_start <= 3 ? '#dc2626' : '#64748b',
                            fontWeight: contract.days_until_start <= 3 ? 600 : 400
                        }}
                    >
                        {getDaysText(contract.days_until_start)}
                    </Typography>
                </Box>
            </TableCell>

            <TableCell align="center" sx={{ py: 2 }}>
                {getUrgencyChip(contract.urgency_level)}
            </TableCell>

            <TableCell align="center" sx={{ py: 2 }}>
                <Chip
                    label={contract.status_display?.label || contract.status}
                    size="small"
                    sx={{
                        backgroundColor: contract.status_display?.color + '20',
                        color: contract.status_display?.color,
                        fontWeight: 600,
                        border: `1px solid ${contract.status_display?.color}40`
                    }}
                />
            </TableCell>

            <TableCell align="center" sx={{ py: 2 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                    <Badge
                        badgeContent={contract.pending_applications > 0 ? contract.pending_applications : 0}
                        color="warning"
                        max={99}
                    >
                        <Chip
                            label={contract.total_applications || 0}
                            size="small"
                            sx={{
                                backgroundColor: contract.total_applications > 0 ? '#dbeafe' : '#f1f5f9',
                                color: contract.total_applications > 0 ? '#2563eb' : '#64748b',
                                fontWeight: 700,
                                minWidth: '40px'
                            }}
                        />
                    </Badge>
                    {contract.pending_applications > 0 && (
                        <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                            {contract.pending_applications} to review
                        </Typography>
                    )}
                </Box>
            </TableCell>

            <TableCell sx={{ py: 2 }}>
                {contract.professional ? (
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: '#10b981',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}
                        >
                            {contract.professional.name?.charAt(0)?.toUpperCase() || 'P'}
                        </Avatar>
                        <Stack spacing={0}>
                            <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }}>
                                {contract.professional.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {contract.professional.applicant_type}
                            </Typography>
                        </Stack>
                    </Box>
                ) : (
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{
                            background: '#fef3c7',
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.75,
                            display: 'inline-flex'
                        }}
                    >
                        <Warning sx={{ fontSize: 16, color: '#d97706' }} />
                        <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600 }}>
                            Unassigned
                        </Typography>
                    </Box>
                )}
            </TableCell>

            <TableCell align="center" sx={{ py: 2 }}>
                {contract.has_agreement ? (
                    contract.agreement_signed ? (
                        <Chip
                            label="Signed"
                            size="small"
                            icon={<CheckCircle sx={{ fontSize: 14 }} />}
                            sx={{
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#16a34a' }
                            }}
                        />
                    ) : (
                        <Chip
                            label="Pending"
                            size="small"
                            icon={<AccessTime sx={{ fontSize: 14 }} />}
                            sx={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#d97706' }
                            }}
                        />
                    )
                ) : (
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        N/A
                    </Typography>
                )}
            </TableCell>

            <TableCell align="right" sx={{ py: 2 }}>
                <Box className="action-buttons" display="flex" gap={0.5} justifyContent="flex-end">
                    {/* Redirect to My Contracts or My Applications */}
                    {(() => {
                        const redirectInfo = getContractRedirectInfo(contract);
                        return (
                            <Tooltip title={redirectInfo.label}>
                                <IconButton
                                    size="small"
                                    component={Link}
                                    to={redirectInfo.link}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        color: 'white',
                                        '&:hover': { background: 'linear-gradient(135deg, #5558e3 0%, #7c4fe8 100%)' }
                                    }}
                                >
                                    {redirectInfo.icon}
                                </IconButton>
                            </Tooltip>
                        );
                    })()}
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContract(contract);
                                setShowDetailsModal(true);
                            }}
                            sx={{
                                background: '#f1f5f9',
                                '&:hover': { background: '#e2e8f0', color: '#6366f1' }
                            }}
                        >
                            <Visibility sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    {contract.status === 'booked' ? (
                        <Tooltip title="Cannot cancel - contract is already booked">
                            <span>
                                <IconButton
                                    size="small"
                                    disabled
                                    sx={{ opacity: 0.3 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Cancel sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Cancel Contract">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCancelModal(contract);
                                }}
                                sx={{
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    '&:hover': { background: '#fee2e2' }
                                }}
                            >
                                <Cancel sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );

    const PageHeader = ({ stats }) => (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
                borderRadius: { xs: 0, md: '0 0 24px 24px' },
                px: { xs: 2, md: 4 },
                pt: { xs: 3, md: 4 },
                pb: { xs: 3, md: 4 },
                mb: 3,
                mt: '25px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background decoration */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    pointerEvents: 'none'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: '30%',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    pointerEvents: 'none'
                }}
            />

            {/* Header content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <EventNote sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                                Upcoming Work
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                                Manage your scheduled contracts and assignments
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        component={Link}
                        to="/institute/contracts/create"
                        variant="contained"
                        startIcon={<i className="fas fa-plus" />}
                        sx={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            fontWeight: 600,
                            px: 3,
                            py: 1.2,
                            borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.3)',
                            '&:hover': {
                                background: 'rgba(255,255,255,0.3)',
                            }
                        }}
                    >
                        New Contract
                    </Button>
                </Box>

                {/* Stats Cards */}
                {stats && (
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Box
                                sx={{
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 3,
                                    p: 2,
                                    textAlign: 'center',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.2)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                                    <Assignment sx={{ fontSize: 20, opacity: 0.9 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="800" sx={{ lineHeight: 1.1 }}>
                                    {stats.total_upcoming || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>
                                    Total Upcoming
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box
                                sx={{
                                    background: 'linear-gradient(135deg, rgba(239,68,68,0.3) 0%, rgba(220,38,38,0.3) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 3,
                                    p: 2,
                                    textAlign: 'center',
                                    border: '1px solid rgba(239,68,68,0.4)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                                    <Warning sx={{ fontSize: 20, color: '#fca5a5' }} />
                                </Box>
                                <Typography variant="h3" fontWeight="800" sx={{ lineHeight: 1.1, color: '#fecaca' }}>
                                    {stats.imminent_count || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>
                                    Imminent (1-3 days)
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box
                                sx={{
                                    background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(37,99,235,0.3) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 3,
                                    p: 2,
                                    textAlign: 'center',
                                    border: '1px solid rgba(59,130,246,0.4)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                                    <Schedule sx={{ fontSize: 20, color: '#93c5fd' }} />
                                </Box>
                                <Typography variant="h3" fontWeight="800" sx={{ lineHeight: 1.1, color: '#bfdbfe' }}>
                                    {stats.this_week || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>
                                    This Week
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box
                                sx={{
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(5,150,105,0.3) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 3,
                                    p: 2,
                                    textAlign: 'center',
                                    border: '1px solid rgba(16,185,129,0.4)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                                    <CalendarToday sx={{ fontSize: 20, color: '#6ee7b7' }} />
                                </Box>
                                <Typography variant="h3" fontWeight="800" sx={{ lineHeight: 1.1, color: '#a7f3d0' }}>
                                    {stats.this_month || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>
                                    This Month
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Box>
    );

    if (loading) {
        return (
            <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 57px)', background: '#f8fafc' }}>
                <PageHeader stats={null} />
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px" gap={2}>
                    <CircularProgress size={48} sx={{ color: '#6366f1' }} />
                    <Typography variant="body2" color="text.secondary">Loading your upcoming contracts...</Typography>
                </Box>
            </div>
        );
    }

    if (!contractsData) {
        return (
            <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 57px)', background: '#f8fafc' }}>
                <PageHeader stats={null} />
                <Box maxWidth="1400px" mx="auto" px={2}>
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: 3,
                            py: 2,
                            '& .MuiAlert-icon': { fontSize: 28 }
                        }}
                    >
                        <Typography fontWeight="600">Failed to load contracts data</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>Please refresh the page or try again later.</Typography>
                    </Alert>
                </Box>
            </div>
        );
    }

    const { stats, contracts, timeline_view, user_type } = contractsData;

    const timelineSections = [
        { key: 'pending_signature', title: 'Pending Signature', subtitle: 'Contracts awaiting signature', color: '#dc2626', icon: <Edit sx={{ fontSize: 20 }} />, bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' },
        { key: 'unassigned', title: 'Needs Assignment', subtitle: 'Open contracts without professionals', color: '#f59e0b', icon: <Group sx={{ fontSize: 20 }} />, bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' },
        { key: 'imminent', title: 'Starting Soon', subtitle: 'Within 1-3 days', color: '#dc2626', icon: <Warning sx={{ fontSize: 20 }} />, bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' },
        { key: 'this_week', title: 'This Week', subtitle: '4-7 days away', color: '#3b82f6', icon: <Schedule sx={{ fontSize: 20 }} />, bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
        { key: 'this_month', title: 'This Month', subtitle: '8-30 days away', color: '#10b981', icon: <CalendarToday sx={{ fontSize: 20 }} />, bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' },
        { key: 'future', title: 'Future Contracts', subtitle: 'More than 30 days away', color: '#6b7280', icon: <TrendingUp sx={{ fontSize: 20 }} />, bgGradient: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)' }
    ];

    const activeFiltersCount = [filterUrgency, filterStatus, filterProfessional].filter(f => f !== 'all').length + (searchText ? 1 : 0);

    return (
        <div className="" style={{ minHeight: 'calc(100vh - 57px)', background: '#f8fafc' }}>
            <PageHeader stats={stats} />

            <section className="content pt-0">
                <Box maxWidth="1400px" mx="auto" px={{ xs: 2, md: 3 }}>
                    {/* Enhanced Search & Filters */}
                    <Paper
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            border: '1px solid #e5e7eb',
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ p: 2, background: 'white' }}>
                            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                <TextField
                                    placeholder="Search by contract name, position, or location..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    size="small"
                                    sx={{
                                        flex: 1,
                                        minWidth: '280px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            background: '#f8fafc',
                                            '&:hover': { background: '#f1f5f9' },
                                            '&.Mui-focused': { background: 'white' }
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: '#94a3b8' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchText && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchText("")}>
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <Badge badgeContent={activeFiltersCount} color="primary">
                                    <Button
                                        variant={showFilters ? "contained" : "outlined"}
                                        startIcon={<FilterList />}
                                        onClick={() => setShowFilters(!showFilters)}
                                        sx={{
                                            borderRadius: 2,
                                            px: 2.5,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            ...(showFilters ? {
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                '&:hover': { background: 'linear-gradient(135deg, #5558e3 0%, #7c4fe8 100%)' }
                                            } : {
                                                borderColor: '#e5e7eb',
                                                color: '#64748b',
                                                '&:hover': { borderColor: '#6366f1', color: '#6366f1', background: '#f5f3ff' }
                                            })
                                        }}
                                    >
                                        Filters
                                    </Button>
                                </Badge>
                            </Box>

                            <Collapse in={showFilters}>
                                <Box
                                    display="flex"
                                    gap={2}
                                    mt={2.5}
                                    pt={2.5}
                                    flexWrap="wrap"
                                    alignItems="center"
                                    sx={{ borderTop: '1px solid #f1f5f9' }}
                                >
                                    <TextField
                                        select
                                        label="Urgency Level"
                                        value={filterUrgency}
                                        onChange={(e) => setFilterUrgency(e.target.value)}
                                        size="small"
                                        sx={{
                                            minWidth: 160,
                                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                        }}
                                    >
                                        <MenuItem value="all">All Levels</MenuItem>
                                        <MenuItem value="critical">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
                                                Critical
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="high">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                                                High
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="medium">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                                                Medium
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="normal">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                                Normal
                                            </Box>
                                        </MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        label="Contract Status"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        size="small"
                                        sx={{
                                            minWidth: 180,
                                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                        }}
                                    >
                                        <MenuItem value="all">All Statuses</MenuItem>
                                        <MenuItem value="booked">Booked</MenuItem>
                                        <MenuItem value="pending_signature">Pending Signature</MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        label="Assignment"
                                        value={filterProfessional}
                                        onChange={(e) => setFilterProfessional(e.target.value)}
                                        size="small"
                                        sx={{
                                            minWidth: 160,
                                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                        }}
                                    >
                                        <MenuItem value="all">All Contracts</MenuItem>
                                        <MenuItem value="assigned">Assigned Only</MenuItem>
                                        <MenuItem value="unassigned">Unassigned Only</MenuItem>
                                    </TextField>

                                    {activeFiltersCount > 0 && (
                                        <Button
                                            variant="text"
                                            startIcon={<Close sx={{ fontSize: 18 }} />}
                                            onClick={() => {
                                                setSearchText("");
                                                setFilterUrgency("all");
                                                setFilterStatus("all");
                                                setFilterProfessional("all");
                                            }}
                                            sx={{
                                                color: '#ef4444',
                                                fontWeight: 600,
                                                '&:hover': { background: '#fef2f2' }
                                            }}
                                        >
                                            Clear All ({activeFiltersCount})
                                        </Button>
                                    )}
                                </Box>
                            </Collapse>
                        </Box>
                    </Paper>

                    {/* Timeline Sections - Enhanced Cards */}
                    {timelineSections.map(section => {
                        const sectionContracts = filterContracts(timeline_view[section.key] || []);
                        if (sectionContracts.length === 0) return null;

                        return (
                            <Paper
                                key={section.key}
                                elevation={0}
                                sx={{
                                    mb: 2.5,
                                    borderRadius: 3,
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: section.color + '60',
                                        boxShadow: `0 4px 20px ${section.color}15`
                                    }
                                }}
                            >
                                {/* Section Header */}
                                <Box
                                    sx={{
                                        p: 2,
                                        background: section.bgGradient,
                                        borderLeft: `4px solid ${section.color}`,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            filter: 'brightness(0.98)'
                                        }
                                    }}
                                    onClick={() => toggleSection(section.key)}
                                >
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2,
                                                background: section.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                boxShadow: `0 2px 8px ${section.color}40`
                                            }}
                                        >
                                            {section.icon}
                                        </Box>
                                        <Box>
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Typography variant="h6" fontWeight="700" sx={{ color: '#1e293b' }}>
                                                    {section.title}
                                                </Typography>
                                                <Chip
                                                    label={sectionContracts.length}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: section.color,
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        height: 24,
                                                        minWidth: 32
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                {section.subtitle}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            background: 'white',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                            '&:hover': { background: '#f8fafc' }
                                        }}
                                    >
                                        {expandedSections[section.key] ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Box>

                                {/* Section Content */}
                                <Collapse in={expandedSections[section.key]}>
                                    <TableContainer sx={{ background: 'white' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ background: '#f8fafc' }}>
                                                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>Contract</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>Start Date</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>Urgency</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>Status</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>Applications</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>Assigned Professional</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>Agreement</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sectionContracts.map(contract => (
                                                    <ContractRow key={contract.id} contract={contract} />
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Collapse>
                            </Paper>
                        );
                    })}

                    {/* Empty State */}
                    {filterContracts(contracts).length === 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 6,
                                textAlign: 'center',
                                borderRadius: 3,
                                border: '1px solid #e5e7eb',
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                            }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3
                                }}
                            >
                                <Search sx={{ fontSize: 36, color: '#6366f1' }} />
                            </Box>
                            <Typography variant="h6" fontWeight="700" color="#1e293b" gutterBottom>
                                No Contracts Found
                            </Typography>
                            <Typography variant="body2" color="#64748b" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                                {activeFiltersCount > 0
                                    ? "No contracts match your current filters. Try adjusting your search criteria."
                                    : "You don't have any upcoming contracts at the moment."}
                            </Typography>
                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="outlined"
                                    startIcon={<Close />}
                                    onClick={() => {
                                        setSearchText("");
                                        setFilterUrgency("all");
                                        setFilterStatus("all");
                                        setFilterProfessional("all");
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            )}
                        </Paper>
                    )}
                </Box>
            </section>

            {/* Enhanced Contract Details Modal */}
            <Dialog
                open={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh'
                    }
                }}
            >
                {selectedContract && (
                    <>
                        <DialogTitle sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            py: 3
                        }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">
                                        {selectedContract.contract_type_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                                        Contract ID: #{selectedContract.id}
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => setShowDetailsModal(false)}
                                    sx={{
                                        color: '#fff',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    <Close />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                            {/* Quick Status Bar */}
                            <Paper elevation={0} sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={3}>
                                        <Box textAlign="center">
                                            <CalendarToday sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Start Date
                                            </Typography>
                                            <Typography variant="body2" fontWeight="600">
                                                {formatDate(selectedContract.start_date)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box textAlign="center">
                                            <Person sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Days Until Start
                                            </Typography>
                                            <Typography variant="body2" fontWeight="600">
                                                {getDaysText(selectedContract.days_until_start)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box textAlign="center">
                                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                                Urgency
                                            </Typography>
                                            {getUrgencyChip(selectedContract.urgency_level)}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box textAlign="center">
                                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                                Status
                                            </Typography>
                                            <Chip
                                                label={selectedContract.status_display?.label || selectedContract.status}
                                                size="small"
                                                sx={{
                                                    backgroundColor: selectedContract.status_display?.color,
                                                    color: '#fff',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Grid container spacing={2}>
                                {/* Contract Information Card */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={2} sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                <Edit sx={{ color: '#fff', fontSize: 20 }} />
                                            </Box>
                                            <Typography variant="h6" fontWeight="600">
                                                Contract Details
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <Stack spacing={1.5}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                    POSITION
                                                </Typography>
                                                <Typography variant="body2">
                                                    {selectedContract.position_names && selectedContract.position_names.length > 0
                                                        ? selectedContract.position_names.join(', ')
                                                        : (selectedContract.data?.position || selectedContract.data?.contract_name || '-')}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                    LOCATION
                                                </Typography>
                                                <Typography variant="body2">
                                                    📍 {selectedContract.location || '-'}
                                                </Typography>
                                            </Box>
                                            {selectedContract.data?.rate && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                        RATE
                                                    </Typography>
                                                    <Typography variant="body2" color="success.main" fontWeight="600">
                                                        ${selectedContract.data.rate}/hr
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Schedule Card */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={2} sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                <CalendarToday sx={{ color: '#fff', fontSize: 20 }} />
                                            </Box>
                                            <Typography variant="h6" fontWeight="600">
                                                Schedule
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <Stack spacing={1.5}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                    START DATE
                                                </Typography>
                                                <Typography variant="body2" fontWeight="600">
                                                    {formatDate(selectedContract.start_date)}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                    END DATE
                                                </Typography>
                                                <Typography variant="body2" fontWeight="600">
                                                    {formatDate(selectedContract.end_date)}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                    DURATION
                                                </Typography>
                                                <Typography variant="body2">
                                                    {selectedContract.duration_days ? `${selectedContract.duration_days} days` : '-'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Applicant Card */}
                                {selectedContract.professional && (
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={2} sx={{ p: 2.5, height: '100%', borderRadius: 2, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <CheckCircle sx={{ color: '#10b981', fontSize: 24, mr: 1.5 }} />
                                                <Typography variant="h6" fontWeight="600" color="#065f46">
                                                    Assigned Applicant
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ mb: 2 }} />
                                            <Stack spacing={1.5}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                        NAME
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="600">
                                                        {selectedContract.professional.name}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                        EMAIL
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedContract.professional.email}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                        TYPE
                                                    </Typography>
                                                    <Typography variant="body2" color="primary.main" fontWeight="600">
                                                        {selectedContract.professional.applicant_type}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Agreement Status Card */}
                                {selectedContract.has_agreement && (
                                    <Grid item xs={12} md={selectedContract.professional ? 6 : 12}>
                                        <Paper
                                            elevation={2}
                                            sx={{
                                                p: 2.5,
                                                height: '100%',
                                                borderRadius: 2,
                                                background: selectedContract.agreement_signed
                                                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                                                    : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" mb={2}>
                                                {selectedContract.agreement_signed ? (
                                                    <CheckCircle sx={{ color: '#10b981', fontSize: 24, mr: 1.5 }} />
                                                ) : (
                                                    <Warning sx={{ color: '#f59e0b', fontSize: 24, mr: 1.5 }} />
                                                )}
                                                <Typography variant="h6" fontWeight="600" color={selectedContract.agreement_signed ? '#065f46' : '#92400e'}>
                                                    Agreement Status
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ mb: 2 }} />
                                            <Typography variant="body2" fontWeight="600" mb={0.5}>
                                                {selectedContract.agreement_signed ? 'Fully Signed' : 'Pending Signature'}
                                            </Typography>
                                            {selectedContract.agreement_status && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {selectedContract.agreement_status.replace(/_/g, ' ').toUpperCase()}
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Additional Information Card */}
                                {selectedContract.data && (selectedContract.data.hours_per_day || selectedContract.data.description) && (
                                    <Grid item xs={12}>
                                        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                                            <Typography variant="h6" fontWeight="600" mb={2}>
                                                Additional Information
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Stack spacing={1.5}>
                                                {selectedContract.data.hours_per_day && (
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                            HOURS PER DAY
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {selectedContract.data.hours_per_day} hours/day
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {selectedContract.data.description && (
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                            DESCRIPTION
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {selectedContract.data.description}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>

                            {/* Action Buttons */}
                            <Box mt={3} display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowDetailsModal(false)}
                                    sx={{ px: 3 }}
                                >
                                    Close
                                </Button>
                                {/* Redirect to My Contracts or My Applications */}
                                {(() => {
                                    const redirectInfo = getContractRedirectInfo(selectedContract);
                                    return (
                                        <Button
                                            variant="contained"
                                            component={Link}
                                            to={redirectInfo.link}
                                            startIcon={redirectInfo.icon}
                                            sx={{
                                                px: 3,
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5558e3 0%, #7c4fe8 100%)'
                                                }
                                            }}
                                        >
                                            {redirectInfo.label}
                                        </Button>
                                    );
                                })()}
                                {(selectedContract.status === 'booked' || selectedContract.status === 'cancelled') ? (
                                    <Tooltip title={`Cannot modify - contract is ${selectedContract.status}. Please contact support if you need assistance.`}>
                                        <span>
                                            <Button
                                                variant="contained"
                                                startIcon={<Edit />}
                                                disabled
                                                sx={{ px: 3, opacity: 0.5 }}
                                            >
                                                Edit Contract
                                            </Button>
                                        </span>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        variant="contained"
                                        component={Link}
                                        to={`/institute/contracts/${selectedContract.id}/edit`}
                                        startIcon={<Edit />}
                                        sx={{
                                            px: 3,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)'
                                            }
                                        }}
                                    >
                                        Edit Contract
                                    </Button>
                                )}
                                {selectedContract.has_agreement && !selectedContract.agreement_signed && selectedContract.agreement_id && (
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        component={Link}
                                        to={`/institute/agreements/${selectedContract.agreement_id}`}
                                        sx={{ px: 3 }}
                                    >
                                        Sign Agreement
                                    </Button>
                                )}
                                {selectedContract.status === 'booked' ? (
                                    <Tooltip title="Cannot cancel - contract is already booked. Please contact support if you need assistance.">
                                        <span>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<Cancel />}
                                                disabled
                                                sx={{ px: 3, opacity: 0.5 }}
                                            >
                                                Cancel Contract
                                            </Button>
                                        </span>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<Cancel />}
                                        onClick={() => handleOpenCancelModal(selectedContract)}
                                        sx={{ px: 3 }}
                                    >
                                        Cancel Contract
                                    </Button>
                                )}
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>

            {/* Cancel Confirmation Modal */}
            <CancelConfirmationModal
                open={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setContractToCancel(null);
                }}
                onConfirm={handleCancelContract}
                title="Cancel Contract"
                message={`Are you sure you want to cancel this contract${contractToCancel ? ` (#${contractToCancel.id})` : ''}? This action cannot be undone.`}
                type="contract"
                id={contractToCancel?.id}
            />
        </div>
    );
};

export default InstituteUpcomingContracts;
