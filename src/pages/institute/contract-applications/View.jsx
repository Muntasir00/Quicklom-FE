import React, { useState, useMemo, useEffect } from "react";
import { useViewContractApplications } from "@hooks/institute/contract-applications/useViewContractApplications";
import ViewCandidatesModal from "@components/modals/ViewCandidatesModal";
import { useFilterContract } from "@hooks/institute/contract-applications/useFilterContract";
import {
    Tooltip, CircularProgress, Skeleton, Chip, Tabs, Tab, Box, Collapse,
    TextField, MenuItem, InputAdornment, IconButton
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import { CONTRACT_APPLICATION_STATUS } from "@constants/ContractApplicationConstants";

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
        show,
        setShow,
        ContractModel,
        showContractData,
        useFilterHook,
        setApplications,
        showCandidatesModal,
        setShowCandidatesModal,
        selectedCandidates,
        selectedApplicationData,
        handleViewCandidates,
        handleShowModal,
        initializeStateHelper,
    } = useViewContractApplications();

    // Get filter hook data
    const filterHook = useFilterHook(setApplications);
    const {
        filters,
        handleChange,
        handleClear,
        handleSubmit,
        instituteSpecialties,
        positions,
    } = filterHook;

    const [activeCategory, setActiveCategory] = useState(null);
    const [expandedSections, setExpandedSections] = useState({ temporary: true, permanent: true });
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get category from contract data
    const getContractCategory = (row) => {
        return row?.contract?.contract_type?.industry ||
               row?.contract?.industry ||
               "Other";
    };

    // Get contract duration type
    const getContractDurationType = (row) => {
        const durationType = row?.contract?.contract_type?.contract_duration_type ||
                            row?.contract?.duration_type ||
                            "";
        if (durationType.toLowerCase().includes('permanent')) return 'Permanent';
        if (durationType.toLowerCase().includes('temporary')) return 'Temporary';
        return 'Other';
    };

    // Group applications by category, then by duration type
    const groupedData = useMemo(() => {
        let filteredRows = rows;

        // Apply local search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredRows = filteredRows.filter(row => {
                const contractTitle = (row.contract?.data?.job_title || row.contract?.contract_type?.contract_name || "").toLowerCase();
                const contractType = (row.contract?.contract_type?.contract_name || "").toLowerCase();
                return contractTitle.includes(term) || contractType.includes(term);
            });
        }

        // Apply local status filter
        if (statusFilter !== "all") {
            filteredRows = filteredRows.filter(row => row.status === statusFilter);
        }

        const grouped = {};

        filteredRows.forEach(row => {
            const category = getContractCategory(row);
            const durationType = getContractDurationType(row);

            if (!grouped[category]) {
                grouped[category] = {
                    Temporary: [],
                    Permanent: [],
                    Other: []
                };
            }

            grouped[category][durationType].push(row);
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
    }, [rows, searchTerm, statusFilter]);

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
        withdrawn: rows.filter(r => r.status === 'withdrawn').length,
    }), [rows]);

    // Category stats
    const getCategoryStats = (category) => {
        const categoryData = groupedData[category] || { Temporary: [], Permanent: [], Other: [] };
        let total = 0;
        let pending = 0;

        ['Temporary', 'Permanent', 'Other'].forEach(type => {
            total += (categoryData[type] || []).length;
            pending += (categoryData[type] || []).filter(a => a.status === 'pending').length;
        });

        return { total, pending };
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            accepted: '#10b981',
            rejected: '#ef4444',
            withdrawn: '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    const getContractStatusColor = (status) => {
        const colors = {
            open: '#10b981',
            closed: '#6b7280',
            cancelled: '#ef4444',
            booked: '#3b82f6',
        };
        return colors[status] || '#6b7280';
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleAdvancedFilter = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await handleSubmit(e);
        setIsLoading(false);
    };

    const handleClearFilters = async () => {
        setIsLoading(true);
        await handleClear();
        setSearchTerm("");
        setStatusFilter("all");
        setIsLoading(false);
    };

    const categories = Object.keys(groupedData);
    const activeConfig = getCategoryConfig(activeCategory);
    const activeCategoryData = groupedData[activeCategory] || { Temporary: [], Permanent: [], Other: [] };

    const renderApplicationCard = (application) => {
        const contract = application.contract;
        const contractTitle = contract?.data?.job_title || contract?.contract_type?.contract_name || 'Untitled Contract';
        const candidatesCount = application.additional_information?.length || 0;

        return (
            <div key={application.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                marginBottom: '0.75rem',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                gap: '1rem',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
                {/* Left: Contract Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                            {contractTitle}
                        </span>
                        <Chip
                            label={application.status?.replace('_', ' ').toUpperCase()}
                            size="small"
                            sx={{
                                backgroundColor: getStatusColor(application.status),
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                height: '22px'
                            }}
                        />
                        <Chip
                            label={contract?.status?.toUpperCase() || 'N/A'}
                            size="small"
                            sx={{
                                backgroundColor: getContractStatusColor(contract?.status),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                height: '22px'
                            }}
                        />
                        {candidatesCount > 0 && (
                            <Chip
                                icon={<PeopleIcon style={{ color: 'white', fontSize: '0.75rem' }} />}
                                label={`${candidatesCount} candidates`}
                                size="small"
                                sx={{
                                    backgroundColor: '#6366f1',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    height: '22px'
                                }}
                            />
                        )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>
                            <i className="far fa-calendar-alt mr-1"></i>
                            Applied: {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'N/A'}
                        </span>
                        {contract?.start_date && (
                            <span>
                                <i className="fas fa-play mr-1"></i>
                                Start: {new Date(contract.start_date).toLocaleDateString()}
                            </span>
                        )}
                        {contract?.end_date && (
                            <span>
                                <i className="fas fa-stop mr-1"></i>
                                End: {new Date(contract.end_date).toLocaleDateString()}
                            </span>
                        )}
                        <span>
                            <i className="fas fa-hashtag mr-1"></i>
                            ID: #{application.id}
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    {candidatesCount > 0 && (
                        <Tooltip title="View Proposed Candidates" arrow>
                            <IconButton
                                size="small"
                                onClick={() => handleViewCandidates(application)}
                                sx={{
                                    backgroundColor: '#6366f1',
                                    color: 'white',
                                    '&:hover': { backgroundColor: '#4f46e5' }
                                }}
                            >
                                <PeopleIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="View Contract Details" arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                const contractId = application?.contract_id || "";
                                const contractName = application?.contract?.contract_type?.contract_name || "";
                                if (contractId && contractName) {
                                    handleShowModal(contractId, contractName);
                                }
                            }}
                            sx={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                '&:hover': { backgroundColor: '#059669' }
                            }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {/* Can withdraw if: not already withdrawn and not rejected */}
                    {/* Note: Withdrawal from booked contracts IS allowed but may incur a fee if within 48 hours of start */}
                    {application.status !== CONTRACT_APPLICATION_STATUS.WITHDRAWN &&
                     application.status !== 'rejected' && (() => {
                        // Check if within 48 hours of contract start
                        const isWithin48Hours = contract?.start_date &&
                            (new Date(contract.start_date) - new Date()) <= 48 * 60 * 60 * 1000;
                        const mayHaveFee = application.status === 'accepted' &&
                            contract?.status?.toLowerCase() === 'booked' &&
                            isWithin48Hours;

                        return (
                            <Tooltip
                                title={mayHaveFee
                                    ? "Withdraw Application (cancellation fee applies)"
                                    : "Withdraw Application"}
                                arrow
                            >
                                <IconButton
                                    size="small"
                                    onClick={async () => {
                                        try {
                                            const { updateContractApplicationsStatus } = await import('@services/institute/ContractApplicationsService');
                                            const applicationData = {
                                                id: application.id,
                                                status: CONTRACT_APPLICATION_STATUS.WITHDRAWN
                                            };
                                            const result = await updateContractApplicationsStatus({ application: applicationData, mayHaveFee });
                                            if (result) initializeStateHelper();
                                        } catch (error) {
                                            console.error("Error withdrawing application:", error);
                                            // Fee required error is handled by the service
                                        }
                                    }}
                                    sx={{
                                        backgroundColor: mayHaveFee ? '#f59e0b' : '#ef4444',
                                        color: 'white',
                                        '&:hover': { backgroundColor: mayHaveFee ? '#d97706' : '#dc2626' }
                                    }}
                                >
                                    <CancelIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        );
                    })()}
                </div>
            </div>
        );
    };

    const renderContractSection = (applications, durationType) => {
        if (applications.length === 0) return null;

        const isExpanded = expandedSections[durationType.toLowerCase()];
        const pendingCount = applications.filter(a => a.status === 'pending').length;

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
                            label={`${applications.length} application${applications.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: durationType === 'Temporary' ? '#fbbf24' : '#3b82f6',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                            }}
                        />
                        {pendingCount > 0 && (
                            <Chip
                                label={`${pendingCount} pending`}
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

                {/* Applications List */}
                <Collapse in={isExpanded}>
                    <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        padding: '1rem',
                        border: '1px solid #e5e7eb'
                    }}>
                        {applications.map(app => renderApplicationCard(app))}
                    </div>
                </Collapse>
            </div>
        );
    };

    return (
        <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 57px)', backgroundColor: '#f8fafc' }}>
            {/* Page Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                <i className="fas fa-file-alt" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, color: 'white', fontWeight: 700 }}>My Applications</h4>
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                    {stats.total} application{stats.total !== 1 ? 's' : ''} across {categories.length} {categories.length === 1 ? 'industry' : 'industries'}
                                </span>
                            </div>
                        </div>
                        {/* Quick Stats */}
                        <div className="d-flex gap-2 mt-2 mt-md-0 flex-wrap">
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.5rem 0.875rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.1rem' }}>{stats.pending}</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>Pending</div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.5rem 0.875rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: '#34d399', fontWeight: 700, fontSize: '1.1rem' }}>{stats.accepted}</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>Accepted</div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.5rem 0.875rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem' }}>{stats.rejected}</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>Rejected</div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.5rem 0.875rem', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '1.1rem' }}>{stats.withdrawn}</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>Withdrawn</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-fluid" style={{ padding: '1.5rem' }}>
                {/* Search and Filter Bar */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            placeholder="Search contracts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{ minWidth: '250px', flex: 1 }}
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
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="accepted">Accepted</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                            <MenuItem value="withdrawn">Withdrawn</MenuItem>
                        </TextField>
                        <Tooltip title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}>
                            <IconButton
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                sx={{
                                    backgroundColor: showAdvancedFilters ? '#667eea' : '#f3f4f6',
                                    color: showAdvancedFilters ? 'white' : '#6b7280',
                                    '&:hover': {
                                        backgroundColor: showAdvancedFilters ? '#5a67d8' : '#e5e7eb'
                                    }
                                }}
                            >
                                <FilterListIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Clear All Filters">
                            <IconButton
                                onClick={handleClearFilters}
                                disabled={isLoading}
                                sx={{
                                    backgroundColor: '#f3f4f6',
                                    color: '#6b7280',
                                    '&:hover': { backgroundColor: '#e5e7eb' }
                                }}
                            >
                                {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                            </IconButton>
                        </Tooltip>
                    </div>

                    {/* Advanced Filters */}
                    <Collapse in={showAdvancedFilters}>
                        <form onSubmit={handleAdvancedFilter} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem', display: 'block' }}>
                                        Contract ID
                                    </label>
                                    <input
                                        type="number"
                                        name="contract_id"
                                        value={filters.contract_id || ''}
                                        onChange={handleChange}
                                        className="form-control form-control-sm"
                                        placeholder="Enter ID"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem', display: 'block' }}>
                                        Position
                                    </label>
                                    <select
                                        name="position_id"
                                        value={filters.position_id || ''}
                                        onChange={handleChange}
                                        className="form-control form-control-sm"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <option value="">All Positions</option>
                                        {Array.isArray(positions) && positions.map(pos => (
                                            <option key={pos.id} value={pos.id}>{pos.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem', display: 'block' }}>
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={filters.start_date || ''}
                                        onChange={handleChange}
                                        className="form-control form-control-sm"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem', display: 'block' }}>
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={filters.end_date || ''}
                                        onChange={handleChange}
                                        className="form-control form-control-sm"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={isLoading}
                                    style={{ borderRadius: '8px', padding: '0.5rem 1rem' }}
                                >
                                    Clear
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-sm btn-primary"
                                    disabled={isLoading}
                                    style={{ borderRadius: '8px', padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                                >
                                    {isLoading ? <CircularProgress size={16} style={{ color: 'white' }} /> : 'Apply Filters'}
                                </button>
                            </div>
                        </form>
                    </Collapse>
                </div>

                {isLoading ? (
                    <div style={{ marginTop: '1rem' }}>
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
                        <h5 style={{ color: '#6b7280', fontWeight: 600 }}>No applications found</h5>
                        <p style={{ color: '#9ca3af' }}>
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Your contract applications will appear here'}
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

                            {activeCategoryData.Temporary.length === 0 &&
                             activeCategoryData.Permanent.length === 0 &&
                             activeCategoryData.Other.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></i>
                                    <p style={{ fontSize: '1rem', fontWeight: 500 }}>No applications in this category</p>
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

            <ViewCandidatesModal
                show={showCandidatesModal}
                setShow={setShowCandidatesModal}
                candidates={selectedCandidates}
                applicationData={selectedApplicationData}
            />
        </div>
    );
};

export default View;
