import {useState, useMemo, useEffect} from "react";
import {useViewContractApplicants} from "@hooks/institute/contract-applicants/useViewContractApplicants";
import {useNavigate, useSearchParams} from "react-router-dom";
import UserProfileModal from "@components/modals/UserProfileModal";
import ViewCandidatesModal from "@components/modals/ViewCandidatesModal";
import {
    CircularProgress,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ApplicantListItem from "@pages/institute/contract-applicants/ApplicantListItem.jsx";
import {Search, ListFilter, FileText, X, FolderOpen} from "lucide-react";
import {Input} from "@components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import {Badge} from "@components/ui/badge";
import {Button} from "@components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import MetricsGrid from "@pages/institute/contract-applications/metrics-grid.jsx";

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
    const [expandedSections, setExpandedSections] = useState({temporary: true, permanent: true});
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [contractIdFilter, setContractIdFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Clear all URL filters
    const clearUrlFilters = () => {
        // Remove URL params by navigating to the same page without params
        navigate('/institute/contract-applicants', {replace: true});
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
        const categoryData = groupedData[category] || {Temporary: {}, Permanent: {}, Other: {}};
        let total = 0;
        let pending = 0;

        ['Temporary', 'Permanent', 'Other'].forEach(type => {
            Object.values(categoryData[type] || {}).forEach(contract => {
                total += contract.applicants.length;
                pending += contract.applicants.filter(a => a.status === 'pending').length;
            });
        });

        return {total, pending};
    };

    // Get action buttons for an applicant
    const getActionButtons = (applicant) => {
        const actions = originalColumns.find(col => col.field === 'actions');
        if (actions && actions.getActions) {
            return actions.getActions({row: applicant});
        }
        return [];
    };

    const categories = Object.keys(groupedData);
    const activeCategoryData = groupedData[activeCategory] || {Temporary: {}, Permanent: {}, Other: {}};

    const renderContractSection = (contracts,) => {
        const contractList = Object.values(contracts);
        if (contractList.length === 0) return null;

        return (
            <div>
                {contractList.map(({applicants}) => {
                    return (
                        applicants.map((applicant) => (
                            <ApplicantListItem
                                key={applicant.id}
                                applicant={applicant}
                                getActionButtons={getActionButtons} // হুক থেকে আসা ফাংশন
                                isActionLoading={isActionLoading}   // হুক থেকে আসা স্টেট
                            />
                        ))
                    )
                })}
            </div>
        );
    };
    const statsConfig = [
        {label: "Total", value: stats.total},
        {label: "Pending", value: stats.pending},
        {label: "Accepted", value: stats.accepted},
        {label: "Rejected", value: stats.rejected},
    ];
    return (
        <div>
            <MetricsGrid stats={statsConfig}/>

            {/* Main Content */}
            <div>
                {/* URL Filter Banner - Shows when navigated with filters */}
                {hasUrlFilter && (
                    <div
                        className="bg-amber-50 border border-amber-400 rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <ListFilter className="text-amber-600 h-5 w-5"/>
                            <span className="text-amber-900 font-semibold text-[0.9rem]">
                Filtered view:
                                {applicationIdParam && ` Application #${applicationIdParam}`}
                                {contractIdParam && ` Contract #${contractIdParam}`}
            </span>
                            <Badge
                                variant="secondary"
                                className="bg-amber-400 text-amber-950 hover:bg-amber-400 font-bold text-[0.75rem] px-2 py-0"
                            >
                                {rows.length} result{rows.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearUrlFilters}
                            className="text-amber-900 border-amber-600 font-semibold h-8 hover:bg-amber-100 hover:text-amber-950 transition-colors"
                        >
                            <X className="mr-1.5 h-4 w-4"/>
                            Clear Filter
                        </Button>
                    </div>
                )}

                {/* Search and Filter Bar */}

                <div
                    className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center border border-gray-100">

                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                        <Input
                            placeholder="Search by name, email, or contract..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!pl-10 h-10 border-gray-200 focus-visible:ring-slate-400"
                        />
                    </div>

                    {/* Status Filter Select */}
                    <div className="flex items-center gap-2 min-w-[150px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-10 border-gray-200 focus:ring-slate-400">
                                <div className="flex items-center gap-2">
                                    <ListFilter className="h-4 w-4 text-gray-400"/>
                                    <SelectValue placeholder="All Status"/>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Contract Filter Select */}
                    <div className="flex items-center gap-2 min-w-[220px]">
                        <Select value={contractIdFilter} onValueChange={setContractIdFilter}>
                            <SelectTrigger className="h-10 border-gray-200 focus:ring-slate-400">
                                <div className="flex items-center gap-2 text-left">
                                    <FileText className="h-4 w-4 text-gray-400 shrink-0"/>
                                    <SelectValue placeholder="All Contracts"/>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-contracts">All Contracts</SelectItem>
                                {uniqueContracts.map((contract) => {
                                    return (
                                        <SelectItem key={contract.id} value={String(contract.id)}>
                                            #{contract.id} - {contract.name.length > 25 ? contract.name.substring(0, 25) + '...' : contract.name}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Clear All Filters Button */}
                    {(searchTerm || statusFilter !== 'all' || contractIdFilter) && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="h-10 px-4 text-gray-500 border-gray-200 font-semibold hover:bg-gray-50 hover:text-gray-700 transition-colors"
                                    >
                                        <X className="mr-2 h-4 w-4"/>
                                        Clear
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Clear all filters</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {isLoading ? (
                    <div style={{marginTop: '2rem'}}>
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{mb: 2, borderRadius: '12px'}}/>
                        <Skeleton variant="rectangular" width="100%" height={400} sx={{borderRadius: '12px'}}/>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-white rounded-xl py-16 px-8 text-center shadow-sm">
                        <i className="fas fa-inbox text-[4rem] text-gray-300 mb-4"></i>
                        <h5 className="text-gray-500 font-semibold">No applicants found</h5>
                        <p className="text-gray-400">
                            {searchTerm || statusFilter !== 'all' || contractIdFilter
                                ? 'Try adjusting your search or filter criteria'
                                : 'Applicants will appear here once professionals apply to your contracts'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Industry Tabs */}
                        <div
                            className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-xl mb-6 overflow-x-auto no-scrollbar">
                            {categories.map((category) => {
                                const config = getCategoryConfig(category);
                                const catStats = getCategoryStats(category);
                                const isActive = activeCategory === category;

                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => setActiveCategory(category)}
                                        className={`
                                            flex items-center gap-2 pl-2 pr-4 py-2 !rounded-lg transition-all duration-200 whitespace-nowrap text-sm font-semibold
                                            ${isActive
                                            ? "bg-[#F0F7FF] border border-[#D1E9FF] text-[#2D8FE3]"
                                            : "bg-transparent border border-transparent text-[#4B5563] hover:bg-gray-50"
                                        }
                                        `}
                                    >
                                        {/* Icon */}
                                        <i
                                            className={`${config.icon} text-base`}
                                            style={{color: isActive ? '#2D8FE3' : config.color}}
                                        ></i>

                                        {/* Category Name & Count */}
                                        <span className="tracking-tight">
                                            {category}
                                            {category !== "All Industries" && catStats.total > 0 && (
                                                <span className="ml-1 opacity-70 font-medium">({catStats.total})</span>
                                            )}
                                        </span>

                                        {/* Optional: Pending Badge (যদি আগের মতো ছোট কমলা ডট বা সংখ্যা দেখাতে চান) */}
                                        {isActive && catStats.pending > 0 && (
                                            <span
                                                className="ml-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <>
                            {renderContractSection(activeCategoryData.Temporary, 'Temporary')}
                            {renderContractSection(activeCategoryData.Permanent, 'Permanent')}
                            {renderContractSection(activeCategoryData.Other, 'Other')}

                            {Object.keys(activeCategoryData.Temporary).length === 0 &&
                                Object.keys(activeCategoryData.Permanent).length === 0 &&
                                Object.keys(activeCategoryData.Other).length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                                        <FolderOpen size={40} className="mb-4 opacity-80" strokeWidth={1.5}/>
                                        <p className="!text-base font-medium !mb-0">No applicants in this category</p>
                                    </div>
                                )}
                        </>
                    </>
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
                PaperProps={{sx: {borderRadius: '12px', padding: '0.5rem'}}}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#d97706',
                    fontSize: '1.25rem',
                    fontWeight: 700
                }}>
                    <WarningAmberIcon sx={{fontSize: '2rem', color: '#f59e0b'}}/>
                    Confirm Acceptance
                </DialogTitle>
                <DialogContent sx={{paddingTop: '1rem'}}>
                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '2px solid #fbbf24',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <p style={{margin: 0, color: '#92400e', fontSize: '0.95rem', lineHeight: '1.5'}}>
                            <strong>Warning:</strong> Accepting this candidate will automatically reject all other
                            pending applicants for this contract.
                        </p>
                    </div>
                    <p style={{margin: 0, color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6'}}>
                        Are you sure you want to proceed?
                    </p>
                </DialogContent>
                <DialogActions sx={{padding: '1rem', gap: '0.5rem'}}>
                    <Button onClick={handleCancelAccept} variant="outlined"
                            sx={{color: '#6b7280', borderColor: '#d1d5db', textTransform: 'none', fontWeight: 600}}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAccept}
                        disabled={isProcessingAccept}
                        variant="contained"
                        sx={{
                            backgroundColor: '#10b981',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {backgroundColor: '#059669'}
                        }}
                    >
                        {isProcessingAccept ? (
                            <>
                                <CircularProgress size={16} style={{color: '#ffffff', marginRight: '8px'}}/>
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
