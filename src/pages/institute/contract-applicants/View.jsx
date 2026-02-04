import React, { useState, useMemo, useEffect } from "react";
import { useViewContractApplicants } from "@hooks/institute/contract-applicants/useViewContractApplicants";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserProfileModal from "@components/modals/UserProfileModal";
import ViewCandidatesModal from "@components/modals/ViewCandidatesModal";
import { Tooltip, CircularProgress, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Tabs, Tab, Box, Collapse, TextField, MenuItem, InputAdornment } from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

// Category configuration matching contracts page
const CATEGORY_CONFIG = {
    "Dental Care": {
        icon: "fas fa-tooth",
        color: "#17a2b8",
        bgColor: "#e8f4f8",
        gradient: "linear-gradient(135deg, #17a2b8 0%, #20c997 100%)",
        order: 1,
    },
    "Pharmacy": {
        icon: "fas fa-pills",
        color: "#28a745",
        bgColor: "#e8f5e9",
        gradient: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
        order: 2,
    },
    "Nursing and Home Care": {
        icon: "fas fa-hand-holding-medical",
        color: "#dc3545",
        bgColor: "#fce4ec",
        gradient: "linear-gradient(135deg, #dc3545 0%, #e91e63 100%)",
        order: 3,
    },
    "General Practice": {
        icon: "fas fa-stethoscope",
        color: "#6f42c1",
        bgColor: "#f3e5f5",
        gradient: "linear-gradient(135deg, #6f42c1 0%, #7c3aed 100%)",
        order: 4,
    },
    "General Medicine": {
        icon: "fas fa-stethoscope",
        color: "#6f42c1",
        bgColor: "#f3e5f5",
        gradient: "linear-gradient(135deg, #6f42c1 0%, #7c3aed 100%)",
        order: 4,
    },
};

const DEFAULT_CATEGORY_CONFIG = {
    icon: "fas fa-file-medical",
    color: "#6c757d",
    bgColor: "#f8f9fa",
    gradient: "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
    order: 99,
};

const View = () => {
    const {
        menu,
        rows,
        action,
        columns: originalColumns,
        show,
        setShow,
        ContractModel,
        showContractData,
        modalProfileData,
        showProfileModal,
        setShowProfileModal,
        showCandidatesModal,
        setShowCandidatesModal,
        selectedCandidates,
        selectedApplicationData,
        handleAcceptCandidate,
        setApplicants,
        useFilterHook,
        isLoading,
        isRefreshing,
        isActionLoading,
        showConfirmModal,
        setShowConfirmModal,
        handleConfirmAccept,
        handleCancelAccept,
        isProcessingAccept,
        hasUrlFilter,
        applicationIdParam,
        contractIdParam,
    } = useViewContractApplicants();

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeCategory, setActiveCategory] = useState(null);
    const [expandedSections, setExpandedSections] = useState({ temporary: true, permanent: true });
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [contractIdFilter, setContractIdFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Clear all URL filters
    const clearUrlFilters = () => {
        // Remove URL params by navigating to the same page without params
        navigate('/institute/contract-applicants', { replace: true });
    };

    // Clear all filters (both URL and local)
    const clearAllFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setContractIdFilter("");
        if (hasUrlFilter) {
            clearUrlFilters();
        }
    };

    // Get category from contract data
    const getContractCategory = (row) => {
        return row?.contract?.contract_type?.industry ||
               row?.contract?.industry ||
               row?.industry ||
               "Other";
    };

    // Get contract duration type
    const getContractDurationType = (row) => {
        const durationType = row?.contract?.contract_type?.contract_duration_type ||
                            row?.contract?.duration_type ||
                            row?.duration_type ||
                            "";
        if (durationType.toLowerCase().includes('permanent')) return 'Permanent';
        if (durationType.toLowerCase().includes('temporary')) return 'Temporary';
        return 'Other';
    };

    // Group applicants by category, then by duration type, then by contract
    const groupedData = useMemo(() => {
        let filteredRows = rows;

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredRows = filteredRows.filter(row => {
                const name = (row.user?.name || row.applicant_name || "").toLowerCase();
                const email = (row.applicant_email || row.email || row.user?.email || "").toLowerCase();
                const contractName = (row.contract?.contract_type?.contract_name || "").toLowerCase();
                return name.includes(term) || email.includes(term) || contractName.includes(term);
            });
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filteredRows = filteredRows.filter(row => row.status === statusFilter);
        }

        // Apply contract ID filter
        if (contractIdFilter) {
            filteredRows = filteredRows.filter(row =>
                String(row.contract_id) === contractIdFilter
            );
        }

        const grouped = {};

        filteredRows.forEach(row => {
            const category = getContractCategory(row);
            const durationType = getContractDurationType(row);
            const contractId = row.contract_id;
            const contractName = row.contract?.contract_type?.contract_name ||
                                row.contract_name ||
                                `Contract #${contractId}`;

            if (!grouped[category]) {
                grouped[category] = {
                    Temporary: {},
                    Permanent: {},
                    Other: {}
                };
            }

            if (!grouped[category][durationType][contractId]) {
                grouped[category][durationType][contractId] = {
                    contractId,
                    contractName,
                    contractData: row.contract?.data || row.contract || {},
                    applicants: []
                };
            }

            grouped[category][durationType][contractId].applicants.push(row);
        });

        // Sort categories by order
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            const orderA = CATEGORY_CONFIG[a]?.order || DEFAULT_CATEGORY_CONFIG.order;
            const orderB = CATEGORY_CONFIG[b]?.order || DEFAULT_CATEGORY_CONFIG.order;
            return orderA - orderB;
        });

        const sortedGrouped = {};
        sortedCategories.forEach(cat => {
            sortedGrouped[cat] = grouped[cat];
        });

        return sortedGrouped;
    }, [rows, searchTerm, statusFilter, contractIdFilter]);

    // Set first category with data as active by default
    useEffect(() => {
        const categories = Object.keys(groupedData);
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]);
        } else if (categories.length > 0 && !categories.includes(activeCategory)) {
            setActiveCategory(categories[0]);
        }
    }, [groupedData, activeCategory]);

    const getCategoryConfig = (category) => {
        return CATEGORY_CONFIG[category] || DEFAULT_CATEGORY_CONFIG;
    };

    // Statistics
    const stats = useMemo(() => ({
        total: rows.length,
        pending: rows.filter(r => r.status === 'pending').length,
        accepted: rows.filter(r => r.status === 'accepted').length,
        rejected: rows.filter(r => r.status === 'rejected').length,
    }), [rows]);

    // Get unique contracts for filter dropdown
    const uniqueContracts = useMemo(() => {
        const contracts = {};
        rows.forEach(row => {
            if (row.contract_id && !contracts[row.contract_id]) {
                contracts[row.contract_id] = {
                    id: row.contract_id,
                    name: row.contract?.contract_type?.contract_name || `Contract #${row.contract_id}`
                };
            }
        });
        return Object.values(contracts).sort((a, b) => a.id - b.id);
    }, [rows]);

    // Category stats
    const getCategoryStats = (category) => {
        const categoryData = groupedData[category] || { Temporary: {}, Permanent: {}, Other: {} };
        let total = 0;
        let pending = 0;

        ['Temporary', 'Permanent', 'Other'].forEach(type => {
            Object.values(categoryData[type] || {}).forEach(contract => {
                total += contract.applicants.length;
                pending += contract.applicants.filter(a => a.status === 'pending').length;
            });
        });

        return { total, pending };
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            accepted: '#10b981',
            rejected: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    // Get action buttons for an applicant
    const getActionButtons = (applicant) => {
        const actions = originalColumns.find(col => col.field === 'actions');
        if (actions && actions.getActions) {
            return actions.getActions({ row: applicant });
        }
        return [];
    };

    const renderActionButton = (action, applicant, idx) => {
        const label = action.props.label;
        const isDisabled = action.props.disabled;
        const applicationId = applicant.id;
        let bgColor, hoverBg, iconClass, tooltipText;

        if (label === 'View Candidates') {
            bgColor = '#3b82f6';
            hoverBg = '#2563eb';
            iconClass = 'fas fa-users';
            tooltipText = 'View Candidates';
        } else if (label === 'View Contract') {
            bgColor = '#10b981';
            hoverBg = '#059669';
            iconClass = 'fas fa-file-contract';
            tooltipText = 'View Contract';
        } else if (label === 'View Profile') {
            bgColor = '#8b5cf6';
            hoverBg = '#7c3aed';
            iconClass = 'fas fa-user';
            tooltipText = 'View Profile';
        } else if (label === 'Accept') {
            bgColor = '#10b981';
            hoverBg = '#059669';
            iconClass = 'fas fa-check';
            tooltipText = isActionLoading(applicationId, 'accept') ? 'Accepting...' : 'Accept';
        } else if (label === 'Reject') {
            bgColor = '#ef4444';
            hoverBg = '#dc2626';
            iconClass = 'fas fa-times';
            tooltipText = isActionLoading(applicationId, 'reject') ? 'Rejecting...' : 'Reject';
        } else {
            return null;
        }

        return (
            <Tooltip key={idx} title={tooltipText} arrow>
                <span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            action.props.onClick(e);
                        }}
                        disabled={isDisabled}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            backgroundColor: isDisabled ? '#d1d5db' : bgColor,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: isDisabled ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isDisabled) {
                                e.currentTarget.style.backgroundColor = hoverBg;
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isDisabled) {
                                e.currentTarget.style.backgroundColor = bgColor;
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {isDisabled && (label === 'Accept' || label === 'Reject') ? (
                            <CircularProgress size={14} style={{ color: '#ffffff' }} />
                        ) : (
                            <i className={iconClass}></i>
                        )}
                    </button>
                </span>
            </Tooltip>
        );
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const categories = Object.keys(groupedData);
    const activeConfig = getCategoryConfig(activeCategory);
    const activeCategoryData = groupedData[activeCategory] || { Temporary: {}, Permanent: {}, Other: {} };

    const renderContractSection = (contracts, durationType) => {
        const contractList = Object.values(contracts);
        if (contractList.length === 0) return null;

        const isExpanded = expandedSections[durationType.toLowerCase()];
        const totalApplicants = contractList.reduce((sum, c) => sum + c.applicants.length, 0);
        const pendingApplicants = contractList.reduce((sum, c) =>
            sum + c.applicants.filter(a => a.status === 'pending').length, 0);

        return (
            <div style={{ marginBottom: '1.5rem' }}>
                {/* Section Header */}
                <div
                    onClick={() => toggleSection(durationType.toLowerCase())}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: durationType === 'Temporary' ? '#fef3c7' : '#dbeafe',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        marginBottom: isExpanded ? '1rem' : 0,
                        border: `2px solid ${durationType === 'Temporary' ? '#fbbf24' : '#3b82f6'}`,
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <i className={durationType === 'Temporary' ? 'fas fa-clock' : 'fas fa-briefcase'}
                           style={{ color: durationType === 'Temporary' ? '#d97706' : '#2563eb', fontSize: '1.1rem' }}></i>
                        <span style={{ fontWeight: 700, color: durationType === 'Temporary' ? '#92400e' : '#1e40af', fontSize: '1rem' }}>
                            {durationType} Contracts
                        </span>
                        <Chip
                            label={`${contractList.length} contract${contractList.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: durationType === 'Temporary' ? '#fbbf24' : '#3b82f6',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                            }}
                        />
                        <Chip
                            label={`${totalApplicants} applicant${totalApplicants !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: '#6b7280',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                            }}
                        />
                        {pendingApplicants > 0 && (
                            <Chip
                                label={`${pendingApplicants} pending`}
                                size="small"
                                sx={{
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }}
                            />
                        )}
                    </div>
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </div>

                {/* Contract Cards */}
                <Collapse in={isExpanded}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {contractList.map(({ contractId, contractName, contractData, applicants }) => (
                            <div key={contractId} style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                {/* Contract Header */}
                                <div style={{
                                    background: activeConfig.gradient,
                                    padding: '0.875rem 1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <i className="fas fa-file-contract" style={{ color: 'white', fontSize: '1rem' }}></i>
                                        <div>
                                            <h6 style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                                                {contractName}
                                            </h6>
                                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                                                ID: #{contractId}
                                            </span>
                                        </div>
                                    </div>
                                    <Chip
                                        label={`${applicants.length} applicant${applicants.length !== 1 ? 's' : ''}`}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </div>

                                {/* Applicants List */}
                                <div style={{ padding: '0.75rem' }}>
                                    {applicants.map((applicant) => {
                                        const actions = getActionButtons(applicant);
                                        const hasProposedCandidates = applicant.proposed_candidates && applicant.proposed_candidates.length > 0;

                                        return (
                                            <div key={applicant.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem',
                                                marginBottom: '0.5rem',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                                gap: '1rem'
                                            }}>
                                                {/* Applicant Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                                                            {applicant.user?.name || applicant.applicant_name || 'Unknown'}
                                                        </span>
                                                        {applicant.user?.applicant_type && (
                                                            <Chip
                                                                label={applicant.user.applicant_type}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: applicant.user.applicant_type === 'Headhunter' ? '#9333ea' :
                                                                                   applicant.user.applicant_type === 'Recruitment Agency' ? '#3b82f6' : '#10b981',
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.65rem',
                                                                    height: '20px'
                                                                }}
                                                            />
                                                        )}
                                                        <Chip
                                                            label={applicant.status}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: getStatusColor(applicant.status),
                                                                color: 'white',
                                                                fontWeight: 700,
                                                                textTransform: 'uppercase',
                                                                fontSize: '0.65rem',
                                                                height: '20px'
                                                            }}
                                                        />
                                                        {hasProposedCandidates && (
                                                            <Chip
                                                                icon={<i className="fas fa-users" style={{ color: 'white', fontSize: '0.6rem' }}></i>}
                                                                label={`${applicant.proposed_candidates.length} candidates`}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#6366f1',
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.65rem',
                                                                    height: '20px'
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        {applicant.applicant_email || applicant.email || applicant.user?.email || 'No email'}
                                                        <span style={{ margin: '0 0.5rem' }}>|</span>
                                                        Applied: {applicant.applied_at ? new Date(applicant.applied_at).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                                                    {actions.map((action, idx) => renderActionButton(action, applicant, idx))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </Collapse>
            </div>
        );
    };

    return (
        <div >
            {/* Page Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                padding: '1.5rem 2rem',
                marginTop: '25px'
            }}>
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div style={{
                                width: '56px',
                                height: '56px',
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem'
                            }}>
                                <i className="fas fa-users" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, color: 'white', fontWeight: 700 }}>Contract Applicants</h4>
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                    {stats.total} applicant{stats.total !== 1 ? 's' : ''} across {categories.length} {categories.length === 1 ? 'industry' : 'industries'}
                                </span>
                            </div>
                        </div>
                        {/* Quick Stats */}
                        <div className="d-flex gap-3 mt-2 mt-md-0">
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.25rem' }}>{stats.pending}</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Pending</div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: '#34d399', fontWeight: 700, fontSize: '1.25rem' }}>{stats.accepted}</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Accepted</div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: '#f87171', fontWeight: 700, fontSize: '1.25rem' }}>{stats.rejected}</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Rejected</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-fluid" style={{ padding: '1.5rem' }}>
                {/* URL Filter Banner - Shows when navigated with filters */}
                {hasUrlFilter && (
                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FilterListIcon sx={{ color: '#d97706', fontSize: '1.25rem' }} />
                            <span style={{ color: '#92400e', fontWeight: 600, fontSize: '0.9rem' }}>
                                Filtered view:
                                {applicationIdParam && ` Application #${applicationIdParam}`}
                                {contractIdParam && ` Contract #${contractIdParam}`}
                            </span>
                            <Chip
                                label={`${rows.length} result${rows.length !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    backgroundColor: '#fbbf24',
                                    color: '#78350f',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }}
                            />
                        </div>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ClearIcon />}
                            onClick={clearUrlFilters}
                            sx={{
                                color: '#92400e',
                                borderColor: '#d97706',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#fde68a',
                                    borderColor: '#b45309'
                                }
                            }}
                        >
                            Clear Filter
                        </Button>
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <TextField
                        placeholder="Search by name, email, or contract..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ minWidth: '300px', flex: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#9ca3af' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        sx={{ minWidth: '150px' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FilterListIcon sx={{ color: '#9ca3af' }} />
                                </InputAdornment>
                            ),
                        }}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="accepted">Accepted</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </TextField>
                    <TextField
                        select
                        value={contractIdFilter}
                        onChange={(e) => setContractIdFilter(e.target.value)}
                        size="small"
                        sx={{ minWidth: '220px' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fas fa-file-contract" style={{ color: '#9ca3af', fontSize: '0.9rem' }}></i>
                                </InputAdornment>
                            ),
                        }}
                    >
                        <MenuItem value="">All Contracts</MenuItem>
                        {uniqueContracts.map((contract) => (
                            <MenuItem key={contract.id} value={String(contract.id)}>
                                #{contract.id} - {contract.name.length > 25 ? contract.name.substring(0, 25) + '...' : contract.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {/* Clear All Filters Button - Shows when any filter is active */}
                    {(searchTerm || statusFilter !== 'all' || contractIdFilter) && (
                        <Tooltip title="Clear all filters">
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={clearAllFilters}
                                sx={{
                                    color: '#6b7280',
                                    borderColor: '#d1d5db',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: '#f3f4f6',
                                        borderColor: '#9ca3af'
                                    }
                                }}
                            >
                                Clear
                            </Button>
                        </Tooltip>
                    )}
                </div>

                {isLoading ? (
                    <div style={{ marginTop: '2rem' }}>
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: '12px' }} />
                        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: '12px' }} />
                    </div>
                ) : categories.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <i className="fas fa-inbox" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '1rem' }}></i>
                        <h5 style={{ color: '#6b7280', fontWeight: 600 }}>No applicants found</h5>
                        <p style={{ color: '#9ca3af' }}>
                            {searchTerm || statusFilter !== 'all' || contractIdFilter
                                ? 'Try adjusting your search or filter criteria'
                                : 'Applicants will appear here once professionals apply to your contracts'}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                    }}>
                        {/* Industry Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#f8fafc' }}>
                            <Tabs
                                value={categories.indexOf(activeCategory) >= 0 ? categories.indexOf(activeCategory) : 0}
                                onChange={(e, newValue) => setActiveCategory(categories[newValue])}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        minHeight: '60px',
                                        padding: '0.75rem 1.5rem',
                                    },
                                    '& .Mui-selected': {
                                        color: `${activeConfig?.color} !important`,
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: activeConfig?.color,
                                        height: '3px',
                                    },
                                }}
                            >
                                {categories.map((category) => {
                                    const config = getCategoryConfig(category);
                                    const catStats = getCategoryStats(category);
                                    return (
                                        <Tab
                                            key={category}
                                            label={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <i className={config.icon} style={{ color: config.color }}></i>
                                                    <span>{category}</span>
                                                    <Chip
                                                        label={catStats.total}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: config.color,
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            fontSize: '0.7rem',
                                                            height: '22px',
                                                            minWidth: '28px'
                                                        }}
                                                    />
                                                    {catStats.pending > 0 && (
                                                        <Chip
                                                            label={catStats.pending}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#f59e0b',
                                                                color: 'white',
                                                                fontWeight: 700,
                                                                fontSize: '0.7rem',
                                                                height: '22px',
                                                                minWidth: '22px'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            }
                                        />
                                    );
                                })}
                            </Tabs>
                        </Box>

                        {/* Tab Content */}
                        <div style={{ padding: '1.5rem' }}>
                            {renderContractSection(activeCategoryData.Temporary, 'Temporary')}
                            {renderContractSection(activeCategoryData.Permanent, 'Permanent')}
                            {renderContractSection(activeCategoryData.Other, 'Other')}

                            {Object.keys(activeCategoryData.Temporary).length === 0 &&
                             Object.keys(activeCategoryData.Permanent).length === 0 &&
                             Object.keys(activeCategoryData.Other).length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></i>
                                    <p style={{ fontSize: '1rem', fontWeight: 500 }}>No applicants in this category</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {ContractModel && show && (
                <ContractModel
                    show={show}
                    setShow={setShow}
                    contract={showContractData}
                />
            )}
            {showProfileModal && (
                <UserProfileModal
                    show={showProfileModal}
                    setShow={setShowProfileModal}
                    userProfile={modalProfileData}
                />
            )}
            {showCandidatesModal && (
                <ViewCandidatesModal
                    show={showCandidatesModal}
                    setShow={setShowCandidatesModal}
                    candidates={selectedCandidates}
                    applicationData={selectedApplicationData}
                    onAcceptCandidate={handleAcceptCandidate}
                    acceptedCandidateId={selectedApplicationData?.accepted_candidate_id}
                />
            )}

            {/* Confirmation Modal */}
            <Dialog
                open={showConfirmModal}
                onClose={handleCancelAccept}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '12px', padding: '0.5rem' } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d97706', fontSize: '1.25rem', fontWeight: 700 }}>
                    <WarningAmberIcon sx={{ fontSize: '2rem', color: '#f59e0b' }} />
                    Confirm Acceptance
                </DialogTitle>
                <DialogContent sx={{ paddingTop: '1rem' }}>
                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '2px solid #fbbf24',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <p style={{ margin: 0, color: '#92400e', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            <strong>Warning:</strong> Accepting this candidate will automatically reject all other pending applicants for this contract.
                        </p>
                    </div>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        Are you sure you want to proceed?
                    </p>
                </DialogContent>
                <DialogActions sx={{ padding: '1rem', gap: '0.5rem' }}>
                    <Button onClick={handleCancelAccept} variant="outlined" sx={{ color: '#6b7280', borderColor: '#d1d5db', textTransform: 'none', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAccept}
                        disabled={isProcessingAccept}
                        variant="contained"
                        sx={{ backgroundColor: '#10b981', textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: '#059669' } }}
                    >
                        {isProcessingAccept ? (
                            <>
                                <CircularProgress size={16} style={{ color: '#ffffff', marginRight: '8px' }} />
                                Processing...
                            </>
                        ) : (
                            'Yes, Accept'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default View;
