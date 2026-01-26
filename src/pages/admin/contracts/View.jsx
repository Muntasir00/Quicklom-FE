import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Chip, IconButton, Badge, Tooltip, Avatar, Card, CardContent, Box, Typography, Collapse, LinearProgress, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HomeIcon from '@mui/icons-material/Home';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EventIcon from '@mui/icons-material/Event';
import PageHeader from "@components/admin/PageHeader";
import { getContractsService, deleteContractService, getContractApplicantsService, getContractIndustryStatsService } from "@services/admin/ContractService";
import UpdateContractStatusModal from "@components/modals/UpdateContractStatusModal";
import Filter from "@components/forms/AdminContractFilterForm";
import { CONTRACT_MODAL_COMPONENTS_LIST } from "@constants/ContractModalConstants";
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from "@constants/ContractConstants";
import { cleanContractName } from "@utils/StringUtils";

// Industry icon mapping
const INDUSTRY_ICONS = {
    dental: "🦷",
    pharmacy: "💊",
    general: "🏥",
    nursing: "🏠"
};

// Timing status helper
const getTimingStatus = (startDate, endDate) => {
    if (!startDate) return null;

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    // Reset time to compare dates only
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    if (end) end.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24));

    // Check if ended
    if (end && end < now) {
        return { key: "ended", label: "Ended", color: "#757575", bgColor: "#f5f5f5", icon: "⚫" };
    }

    // Check if in progress (started but not ended)
    if (start <= now && (!end || end >= now)) {
        return { key: "in_progress", label: "In Progress", color: "#d32f2f", bgColor: "#ffebee", icon: "🔴" };
    }

    // Starting today
    if (diffDays === 0) {
        return { key: "today", label: "Starts Today!", color: "#d32f2f", bgColor: "#ffebee", icon: "🔴" };
    }

    // Starting tomorrow
    if (diffDays === 1) {
        return { key: "tomorrow", label: "Starts Tomorrow", color: "#e65100", bgColor: "#fff3e0", icon: "🟠" };
    }

    // Starting within 3 days
    if (diffDays > 0 && diffDays <= 3) {
        return { key: "soon", label: `Starts in ${diffDays} days`, color: "#e65100", bgColor: "#fff3e0", icon: "🟠" };
    }

    // Starting this week (within 7 days)
    if (diffDays > 3 && diffDays <= 7) {
        return { key: "this_week", label: `Starts in ${diffDays} days`, color: "#f9a825", bgColor: "#fffde7", icon: "🟡" };
    }

    // Future (more than 7 days)
    return { key: "upcoming", label: "Upcoming", color: "#388e3c", bgColor: "#e8f5e9", icon: "🟢" };
};

const View = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const menu = "contracts";
    const sessionUserRole = sessionStorage.getItem("role");

    // State
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showContractData, setShowContractData] = useState(null);
    const [show, setShow] = useState(false);
    const [ContractModel, setContractModel] = useState(null);
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [selectedStatusUpdate, setSelectedStatusUpdate] = useState({ id: null, status: "" });

    // Industry state
    const [industryStats, setIndustryStats] = useState(null);
    const [selectedIndustry, setSelectedIndustry] = useState(null); // null = all

    // Applicants modal state
    const [applicantsModal, setApplicantsModal] = useState({ open: false, contractId: null, data: null, loading: false });
    const [expandedCandidates, setExpandedCandidates] = useState({});

    const fetchIndustryStats = async () => {
        try {
            const stats = await getContractIndustryStatsService();
            setIndustryStats(stats);
        } catch (error) {
            console.error("Error fetching industry stats:", error);
        }
    };

    const fetchContracts = async (filters = {}) => {
        try {
            setLoading(true);
            const contractsData = await getContractsService({ filters });
            setContracts(Array.isArray(contractsData) ? contractsData : []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleIndustryClick = (industryKey) => {
        if (selectedIndustry === industryKey) {
            // Deselect - show all
            setSelectedIndustry(null);
            fetchContracts({});
        } else {
            setSelectedIndustry(industryKey);
            fetchContracts({ industry: industryKey });
        }
    };

    const handleShowModal = (contractId, contractName) => {
        try {
            const selectedContract = cleanContractName(contractName);
            const ModalComponent = CONTRACT_MODAL_COMPONENTS_LIST[selectedContract];
            const contractData = contracts?.find(item => item.id === contractId);

            if (!ModalComponent || !contractData) return;

            const data = { ...contractData, ...contractData?.data };
            setShowContractData(data);
            setContractModel(() => ModalComponent);
            setShow(true);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleViewApplicants = async (contractId) => {
        setApplicantsModal({ open: true, contractId, data: null, loading: true });
        try {
            const data = await getContractApplicantsService(contractId);
            setApplicantsModal(prev => ({ ...prev, data, loading: false }));
        } catch (error) {
            console.error("Error:", error);
            setApplicantsModal(prev => ({ ...prev, loading: false }));
        }
    };

    const toggleCandidates = (applicationId) => {
        setExpandedCandidates(prev => ({ ...prev, [applicationId]: !prev[applicationId] }));
    };

    useEffect(() => {
        document.title = "Contracts | Quicklocum";
        fetchIndustryStats();

        // Check for URL params and apply filters automatically
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.toString()) {
            // Build filters from URL params
            const urlFilters = {
                id: searchParams.get('id') || "",
                publisher_name: searchParams.get('publisher_name') || "",
                publisher_email: searchParams.get('publisher_email') || "",
                start_date: searchParams.get('start_date') || "",
                status: searchParams.get('status') || "",
                position_id: searchParams.get('position_id') || "",
                urgency: searchParams.get('urgency') || "",
                professional_category_id: searchParams.get('professional_category_id') || "",
                industry: searchParams.get('industry') || "",
            };
            // Remove empty values
            const cleanedFilters = Object.fromEntries(
                Object.entries(urlFilters).filter(([_, v]) => v !== "")
            );
            fetchContracts(cleanedFilters);
        } else {
            fetchContracts();
        }
    }, [location.search]);

    const getStatusColor = (status) => {
        return CONTRACT_STATUS_COLORS[status] || "default";
    };

    const getStatusLabel = (status) => {
        return CONTRACT_STATUS_LABELS[status] || status?.replace(/_/g, " ").toUpperCase() || "Unknown";
    };

    const getApplicantTypeIcon = (type) => {
        if (type === "Professional") return <PersonIcon fontSize="small" />;
        return <BusinessIcon fontSize="small" />;
    };

    const getApplicantTypeColor = (type) => {
        if (type === "Professional") return "#4caf50";
        if (type === "Recruitment Agency") return "#2196f3";
        if (type === "Headhunter") return "#9c27b0";
        return "#757575";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const columns = [
        {
            field: "id",
            headerName: "ID",
            width: 80,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <span style={{ fontWeight: 600, color: '#666' }}>#{params.value}</span>
            )
        },
        {
            field: "contract_type",
            headerName: "Contract Type",
            flex: 1,
            minWidth: 200,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Tooltip title={params.row.contract_type?.contract_name || "-"}>
                    <span style={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        {params.row.contract_type?.contract_name || "-"}
                    </span>
                </Tooltip>
            )
        },
        {
            field: "publisher",
            headerName: "Publisher",
            flex: 1,
            minWidth: 200,
            headerAlign: 'center',
            align: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Tooltip title={params.row.user?.name || "N/A"}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {params.row.user?.name || "N/A"}
                            </Typography>
                        </Tooltip>
                        <Tooltip title={params.row.user?.email || "N/A"}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block'
                                }}
                            >
                                {params.row.user?.email || "N/A"}
                            </Typography>
                        </Tooltip>
                    </Box>
                    <Tooltip title="View Publisher Profile">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/users/${params.row.user_id}/profile/view`)}
                            sx={{
                                color: '#1976d2',
                                padding: '4px',
                                '&:hover': { backgroundColor: '#e3f2fd' }
                            }}
                        >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        },
        {
            field: "start_date",
            headerName: "Start Date",
            width: 160,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const timing = getTimingStatus(params.value, params.row.end_date);
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.25, lineHeight: 1 }}>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                            {formatDate(params.value)}
                        </span>
                        {timing && (
                            <Tooltip title={timing.label}>
                                <Chip
                                    label={timing.icon + " " + (timing.key === "in_progress" || timing.key === "ended" ? timing.label : timing.label.replace("Starts ", ""))}
                                    size="small"
                                    sx={{
                                        height: 18,
                                        fontSize: '0.65rem',
                                        fontWeight: 600,
                                        bgcolor: timing.bgColor,
                                        color: timing.color,
                                        '& .MuiChip-label': { px: 1, py: 0 }
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        },
        {
            field: "end_date",
            headerName: "End Date",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <span>{formatDate(params.value)}</span>
            )
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
                    onClick={() => {
                        setSelectedStatusUpdate({ id: params.row.id, status: params.row.status });
                        setShowStatusUpdateModal(true);
                    }}
                    sx={{ cursor: "pointer", fontWeight: 600, fontSize: '0.7rem' }}
                />
            )
        },
        {
            field: "applicants",
            headerName: "Applicants",
            width: 110,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const count = params.row.applicants_count || 0;
                const pending = params.row.applicants_pending || 0;
                const accepted = params.row.applicants_accepted || 0;

                return (
                    <Tooltip title={`Total: ${count} | Pending: ${pending} | Accepted: ${accepted}`}>
                        <Badge
                            badgeContent={pending > 0 ? pending : null}
                            color="warning"
                            max={99}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleViewApplicants(params.row.id)}
                        >
                            <Chip
                                icon={<PeopleIcon sx={{ fontSize: '16px !important' }} />}
                                label={count}
                                size="small"
                                color={accepted > 0 ? "success" : count > 0 ? "primary" : "default"}
                                variant={count > 0 ? "filled" : "outlined"}
                                sx={{ fontWeight: 600 }}
                            />
                        </Badge>
                    </Tooltip>
                );
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 160,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => handleShowModal(params.row.id, params.row.contract_type?.contract_name)}
                            sx={{ color: '#4caf50', '&:hover': { backgroundColor: '#e8f5e9' } }}
                        >
                            <VisibilityIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="View Applicants">
                        <IconButton
                            size="small"
                            onClick={() => handleViewApplicants(params.row.id)}
                            sx={{ color: '#2196f3', '&:hover': { backgroundColor: '#e3f2fd' } }}
                        >
                            <PeopleIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={() => {
                                sessionStorage.setItem("selected_contract_user_id", params.row.user_id);
                                navigate(`/admin/contracts/${params.row.id}/edit`);
                            }}
                            sx={{ color: '#ff9800', '&:hover': { backgroundColor: '#fff3e0' } }}
                        >
                            <EditIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={async () => {
                                const status = await deleteContractService({ contractId: params.row.id });
                                if (status) {
                                    fetchContracts(selectedIndustry);
                                    fetchIndustryStats();
                                }
                            }}
                            sx={{ color: '#f44336', '&:hover': { backgroundColor: '#ffebee' } }}
                        >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Contract Management"
                subtitle="View and manage all contracts"
                icon={<AssignmentIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: '/admin/dashboard' },
                    { label: 'Contracts' },
                ]}
                actionLabel="Add New Contract"
                actionPath={`/${sessionUserRole}/contracts/create`}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                {/* Global Stats Bar */}
                    {industryStats?.global && (
                        <Card sx={{ mb: 3, bgcolor: '#1976d2', color: 'white' }}>
                            <CardContent sx={{ py: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <AssignmentIcon sx={{ fontSize: 40 }} />
                                        <Box>
                                            <Typography variant="h4" fontWeight={700}>
                                                {industryStats.global.total}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Total Contracts
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={3} flexWrap="wrap">
                                        {[
                                            { label: "Open", value: industryStats.global.open, color: "#4caf50" },
                                            { label: "Pending", value: industryStats.global.pending, color: "#ff9800" },
                                            { label: "Pending Signature", value: industryStats.global.pending_signature, color: "#2196f3" },
                                            { label: "Booked", value: industryStats.global.booked, color: "#9c27b0" },
                                            { label: "Closed", value: industryStats.global.closed, color: "#607d8b" },
                                        ].map((stat, idx) => (
                                            <Box key={idx} textAlign="center">
                                                <Typography variant="h5" fontWeight={700}>
                                                    {stat.value}
                                                </Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                    {stat.label}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Industry Cards */}
                    <div className="row mb-4">
                        {industryStats?.industries?.map((industry, idx) => (
                            <div className="col-md-3" key={idx}>
                                <Card
                                    onClick={() => handleIndustryClick(industry.key)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: selectedIndustry === industry.key ? `3px solid ${industry.color}` : '1px solid #e0e0e0',
                                        boxShadow: selectedIndustry === industry.key ? `0 4px 20px ${industry.color}40` : '0 2px 8px rgba(0,0,0,0.08)',
                                        transform: selectedIndustry === industry.key ? 'scale(1.02)' : 'scale(1)',
                                        '&:hover': {
                                            boxShadow: `0 4px 20px ${industry.color}30`,
                                            transform: 'scale(1.02)'
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="h3" fontWeight={700} sx={{ color: industry.color }}>
                                                    {industry.total}
                                                </Typography>
                                                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                                    {industry.name}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 2,
                                                    bgcolor: `${industry.color}15`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 28
                                                }}
                                            >
                                                {INDUSTRY_ICONS[industry.key]}
                                            </Box>
                                        </Box>
                                        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                                            <Chip
                                                label={`${industry.open} Open`}
                                                size="small"
                                                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 500, fontSize: '0.7rem' }}
                                            />
                                            <Chip
                                                label={`${industry.booked} Booked`}
                                                size="small"
                                                sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 500, fontSize: '0.7rem' }}
                                            />
                                            <Chip
                                                label={`${industry.pending} Pending`}
                                                size="small"
                                                sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 500, fontSize: '0.7rem' }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Urgent Contracts Alert Banner */}
                    {(() => {
                        const urgentContracts = contracts.filter(c => {
                            const timing = getTimingStatus(c.start_date, c.end_date);
                            return timing && ['today', 'tomorrow', 'in_progress'].includes(timing.key);
                        });
                        const startingToday = contracts.filter(c => getTimingStatus(c.start_date, c.end_date)?.key === 'today').length;
                        const startingTomorrow = contracts.filter(c => getTimingStatus(c.start_date, c.end_date)?.key === 'tomorrow').length;
                        const inProgress = contracts.filter(c => getTimingStatus(c.start_date, c.end_date)?.key === 'in_progress').length;
                        const startingSoon = contracts.filter(c => getTimingStatus(c.start_date, c.end_date)?.key === 'soon').length;

                        if (urgentContracts.length === 0 && startingSoon === 0) return null;

                        return (
                            <Card sx={{ mb: 3, bgcolor: '#fff3e0', border: '1px solid #ffb74d' }}>
                                <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <WarningAmberIcon sx={{ color: '#e65100', fontSize: 28 }} />
                                        <Typography variant="subtitle1" fontWeight={700} color="#e65100">
                                            Attention Required
                                        </Typography>
                                    </Box>
                                    <Box display="flex" gap={2} flexWrap="wrap" flex={1}>
                                        {inProgress > 0 && (
                                            <Chip
                                                icon={<PlayArrowIcon sx={{ fontSize: '16px !important' }} />}
                                                label={`${inProgress} In Progress`}
                                                sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 600 }}
                                            />
                                        )}
                                        {startingToday > 0 && (
                                            <Chip
                                                icon={<AccessTimeIcon sx={{ fontSize: '16px !important' }} />}
                                                label={`${startingToday} Starting Today`}
                                                sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 600 }}
                                            />
                                        )}
                                        {startingTomorrow > 0 && (
                                            <Chip
                                                icon={<EventIcon sx={{ fontSize: '16px !important' }} />}
                                                label={`${startingTomorrow} Starting Tomorrow`}
                                                sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                                            />
                                        )}
                                        {startingSoon > 0 && (
                                            <Chip
                                                icon={<CalendarTodayIcon sx={{ fontSize: '16px !important' }} />}
                                                label={`${startingSoon} Starting Within 3 Days`}
                                                sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })()}

                    {/* Active Filter Indicator */}
                    {selectedIndustry && (
                        <Box mb={2} display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                                Showing contracts for:
                            </Typography>
                            <Chip
                                label={industryStats?.industries?.find(i => i.key === selectedIndustry)?.name || selectedIndustry}
                                onDelete={() => {
                                    setSelectedIndustry(null);
                                    fetchContracts(null);
                                }}
                                sx={{
                                    bgcolor: industryStats?.industries?.find(i => i.key === selectedIndustry)?.color || '#1976d2',
                                    color: 'white',
                                    fontWeight: 600
                                }}
                            />
                        </Box>
                    )}

                    {/* Filters */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <Filter setContracts={setContracts} />
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="row">
                        <div className="col-12">
                            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <Box sx={{
                                    p: 2,
                                    borderBottom: '2px solid #1976d2',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    bgcolor: '#fff'
                                }}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <AssignmentIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                                        <Typography variant="h5" fontWeight={700} color="#333">
                                            {selectedIndustry
                                                ? industryStats?.industries?.find(i => i.key === selectedIndustry)?.name
                                                : "All Contracts"
                                            }
                                        </Typography>
                                        <Chip
                                            label={contracts.length}
                                            size="small"
                                            sx={{ bgcolor: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    {loading && <LinearProgress />}
                                    <DataGrid
                                        rows={contracts}
                                        columns={columns}
                                        initialState={{
                                            pagination: { paginationModel: { pageSize: 10 } },
                                            sorting: { sortModel: [{ field: "id", sort: "desc" }] }
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
                                            fontFamily: 'inherit',
                                            '& .MuiDataGrid-columnHeaders': {
                                                backgroundColor: '#f5f7fa',
                                                borderBottom: '2px solid #e0e0e0',
                                            },
                                            '& .MuiDataGrid-columnHeaderTitle': {
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                color: '#333',
                                            },
                                            '& .MuiDataGrid-cell': {
                                                borderBottom: '1px solid #f0f0f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem',
                                                padding: '0 12px',
                                            },
                                            '& .MuiDataGrid-cell:focus': {
                                                outline: 'none',
                                            },
                                            '& .MuiDataGrid-cell:focus-within': {
                                                outline: 'none',
                                            },
                                            '& .MuiDataGrid-columnHeader:focus': {
                                                outline: 'none',
                                            },
                                            '& .MuiDataGrid-columnHeader:focus-within': {
                                                outline: 'none',
                                            },
                                            '& .MuiDataGrid-row': {
                                                '&:nth-of-type(even)': {
                                                    backgroundColor: '#fafbfc',
                                                },
                                                '&:hover': {
                                                    backgroundColor: '#f0f7ff',
                                                },
                                            },
                                            '& .MuiDataGrid-footerContainer': {
                                                borderTop: '2px solid #e0e0e0',
                                                backgroundColor: '#f5f7fa',
                                            },
                                            '& .MuiTablePagination-root': {
                                                fontSize: '0.875rem',
                                            },
                                            '& .MuiDataGrid-virtualScroller': {
                                                minHeight: 200,
                                            },
                                        }}
                                    />
                                </Box>
                            </Card>
                        </div>
                    </div>
            </Box>

            {/* Contract Detail Modal */}
            {ContractModel && show && (
                <ContractModel show={show} setShow={setShow} contract={showContractData} />
            )}

            {/* Status Update Modal */}
            {showStatusUpdateModal && (
                <UpdateContractStatusModal
                    show={showStatusUpdateModal}
                    setShow={setShowStatusUpdateModal}
                    contract={selectedStatusUpdate}
                    onRefresh={() => {
                        fetchContracts(selectedIndustry);
                        fetchIndustryStats();
                    }}
                />
            )}

            {/* Applicants Modal */}
            {applicantsModal.open && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content" style={{ borderRadius: 12, overflow: 'hidden' }}>
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', borderBottom: 'none' }}>
                                <h5 className="modal-title text-white d-flex align-items-center">
                                    <PeopleIcon className="mr-2" />
                                    Contract Applicants
                                    {applicantsModal.data && (
                                        <span className="badge badge-light ml-2" style={{ fontSize: '0.85rem' }}>
                                            {applicantsModal.data.summary?.total || 0} total
                                        </span>
                                    )}
                                </h5>
                                <button
                                    type="button"
                                    className="close text-white"
                                    style={{ opacity: 1 }}
                                    onClick={() => setApplicantsModal({ open: false, contractId: null, data: null, loading: false })}
                                >
                                    <span style={{ fontSize: 28 }}>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {applicantsModal.loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" style={{ width: 50, height: 50 }} role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <Typography variant="body1" color="text.secondary" mt={2}>
                                            Loading applicants...
                                        </Typography>
                                    </div>
                                ) : applicantsModal.data?.applicants?.length > 0 ? (
                                    <>
                                        {/* Summary Stats */}
                                        <div className="row mb-4">
                                            {[
                                                { label: "Total", value: applicantsModal.data.summary?.total || 0, icon: "fas fa-users", bg: "#e3f2fd", color: "#1976d2" },
                                                { label: "Pending", value: applicantsModal.data.summary?.pending || 0, icon: "fas fa-clock", bg: "#fff3e0", color: "#f57c00" },
                                                { label: "Accepted", value: applicantsModal.data.summary?.accepted || 0, icon: "fas fa-check-circle", bg: "#e8f5e9", color: "#388e3c" },
                                                { label: "Rejected", value: applicantsModal.data.summary?.rejected || 0, icon: "fas fa-times-circle", bg: "#ffebee", color: "#d32f2f" }
                                            ].map((stat, idx) => (
                                                <div className="col-md-3" key={idx}>
                                                    <Card sx={{ bgcolor: stat.bg, boxShadow: 'none' }}>
                                                        <CardContent sx={{ py: 2, textAlign: 'center' }}>
                                                            <i className={stat.icon} style={{ fontSize: 24, color: stat.color }}></i>
                                                            <Typography variant="h4" fontWeight={700} sx={{ color: stat.color, my: 1 }}>
                                                                {stat.value}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {stat.label}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Applicants List */}
                                        {applicantsModal.data.applicants.map((applicant, idx) => (
                                            <Card
                                                key={idx}
                                                sx={{
                                                    mb: 2,
                                                    border: applicant.status === "accepted" ? "2px solid #4caf50" : "1px solid #e0e0e0",
                                                    boxShadow: applicant.status === "accepted" ? '0 4px 12px rgba(76,175,80,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                        <Box display="flex" alignItems="center" gap={2}>
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: getApplicantTypeColor(applicant.applicant?.type),
                                                                    width: 56,
                                                                    height: 56,
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                                }}
                                                            >
                                                                {getApplicantTypeIcon(applicant.applicant?.type)}
                                                            </Avatar>
                                                            <Box>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Typography variant="h6" fontWeight={600}>
                                                                        {applicant.applicant?.name || "N/A"}
                                                                    </Typography>
                                                                    {applicant.status === "accepted" && (
                                                                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 22 }} />
                                                                    )}
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {applicant.applicant?.email}
                                                                </Typography>
                                                                <Box display="flex" gap={1} mt={1}>
                                                                    <Chip
                                                                        label={applicant.applicant?.type}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: getApplicantTypeColor(applicant.applicant?.type),
                                                                            color: "white",
                                                                            fontWeight: 500
                                                                        }}
                                                                    />
                                                                    <Chip
                                                                        label={applicant.status?.toUpperCase()}
                                                                        size="small"
                                                                        color={applicant.status === "accepted" ? "success" : applicant.status === "pending" ? "warning" : "error"}
                                                                        sx={{ fontWeight: 500 }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        <Box textAlign="right">
                                                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                                                <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                                                Applied: {applicant.applied_at ? formatDate(applicant.applied_at) : "N/A"}
                                                            </Typography>
                                                            <Tooltip title="View User Profile">
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: '#e3f2fd',
                                                                        color: '#1976d2',
                                                                        '&:hover': { bgcolor: '#bbdefb' }
                                                                    }}
                                                                    onClick={() => navigate(`/admin/users/${applicant.applicant?.id}/profile/view`)}
                                                                >
                                                                    <OpenInNewIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>

                                                    {/* Proposed Candidates for Agency/Headhunter */}
                                                    {applicant.candidates_count > 0 && (
                                                        <Box mt={3}>
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                sx={{
                                                                    cursor: "pointer",
                                                                    p: 1.5,
                                                                    bgcolor: "#f5f5f5",
                                                                    borderRadius: 2,
                                                                    '&:hover': { bgcolor: '#eeeeee' }
                                                                }}
                                                                onClick={() => toggleCandidates(applicant.application_id)}
                                                            >
                                                                {expandedCandidates[applicant.application_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                                <Typography variant="subtitle2" fontWeight={600} ml={1}>
                                                                    Proposed Candidates ({applicant.candidates_count})
                                                                </Typography>
                                                            </Box>
                                                            <Collapse in={expandedCandidates[applicant.application_id]}>
                                                                <Box mt={2}>
                                                                    {applicant.candidates.map((candidate, cIdx) => (
                                                                        <Box
                                                                            key={cIdx}
                                                                            sx={{
                                                                                p: 2,
                                                                                mb: 1,
                                                                                bgcolor: candidate.is_accepted ? "#e8f5e9" : "#fafafa",
                                                                                border: candidate.is_accepted ? "2px solid #4caf50" : "1px solid #e0e0e0",
                                                                                borderRadius: 2
                                                                            }}
                                                                        >
                                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                                <Box>
                                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                                                            {candidate.full_name}
                                                                                        </Typography>
                                                                                        {candidate.is_accepted && (
                                                                                            <Chip
                                                                                                label="ACCEPTED"
                                                                                                size="small"
                                                                                                color="success"
                                                                                                sx={{ fontWeight: 600, height: 24 }}
                                                                                            />
                                                                                        )}
                                                                                    </Box>
                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                        {candidate.email} {candidate.phone && `| ${candidate.phone}`}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box textAlign="right" sx={{ minWidth: 150 }}>
                                                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                                                        <strong>Role:</strong> {candidate.primary_role || "N/A"}
                                                                                    </Typography>
                                                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                                                        <strong>Exp:</strong> {candidate.experience || "N/A"}
                                                                                    </Typography>
                                                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                                                        <strong>Location:</strong> {[candidate.city, candidate.province].filter(Boolean).join(", ") || "N/A"}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            </Collapse>
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <PeopleIcon sx={{ fontSize: 80, color: "#e0e0e0" }} />
                                        <Typography variant="h6" color="text.secondary" mt={2}>
                                            No applicants yet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Applications will appear here when professionals apply
                                        </Typography>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #e0e0e0', background: '#fafafa' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4"
                                    onClick={() => setApplicantsModal({ open: false, contractId: null, data: null, loading: false })}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
};

export default View;
