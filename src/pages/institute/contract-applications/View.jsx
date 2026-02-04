import {useState, useMemo, useEffect} from "react";
import {useViewContractApplications} from "@hooks/institute/contract-applications/useViewContractApplications";
import ViewCandidatesModal from "@components/modals/ViewCandidatesModal";
import {
    Skeleton,
} from "@mui/material";
import {CONTRACT_APPLICATION_STATUS} from "@constants/ContractApplicationConstants";
import MetricsGrid from "@pages/institute/contract-applications/metrics-grid.jsx";
import ContractFilters from "@pages/institute/contract-applications/ContractFilters.jsx";
import {updateContractApplicationsStatus} from "@services/institute/ContractApplicationsService.jsx";
import ApplicationCard from "@pages/institute/contract-applications/ApplicationCard.jsx";

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
        rows,
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
        const categoryData = groupedData[category] || {Temporary: [], Permanent: [], Other: []};
        let total = 0;
        let pending = 0;

        ['Temporary', 'Permanent', 'Other'].forEach(type => {
            total += (categoryData[type] || []).length;
            pending += (categoryData[type] || []).filter(a => a.status === 'pending').length;
        });

        return {total, pending};
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
    // const activeConfig = getCategoryConfig(activeCategory);
    const activeCategoryData = groupedData[activeCategory] || {Temporary: [], Permanent: [], Other: []};

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return "$ 0.00";
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderContractSection = (applications, durationType) => {
        if (applications.length === 0) return null;
        return (
            <div>
                {applications.map(application => {
                    const contract = application.contract;
                    const isWithin48Hours = contract?.start_date &&
                        (new Date(contract.start_date) - new Date()) <= 48 * 60 * 60 * 1000;
                    const mayHaveFee = application.status === 'accepted' &&
                        contract?.status?.toLowerCase() === 'booked' &&
                        isWithin48Hours;
                    return (
                        <ApplicationCard
                            key={application.id}
                            application={application}
                            handleShowModal={handleShowModal}
                            handleViewCandidates={handleViewCandidates}
                            handleWithdraw={async (e) => {
                                e.stopPropagation();
                                try {
                                    const result = await updateContractApplicationsStatus({
                                        application: {
                                            id: application.id,
                                            status: CONTRACT_APPLICATION_STATUS.WITHDRAWN
                                        },
                                        mayHaveFee: mayHaveFee
                                    });

                                    if (result) initializeStateHelper();
                                } catch (error) {
                                    console.error("Withdraw error:", error);
                                }
                            }}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                        />
                    );
                })}
            </div>
        );
    };

    const statsConfig = [
        {label: "Pending", value: stats.pending},
        {label: "Accepted", value: stats.accepted},
        {label: "Rejected", value: stats.rejected},
        {label: "Withdrawn", value: stats.withdrawn},
    ];

    return (
        <>
            <MetricsGrid stats={statsConfig}/>

            <ContractFilters
                // Basic Filters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}

                // Controls
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                isLoading={isLoading}
                handleClearFilters={handleClearFilters}

                // Advanced Data & Actions
                filters={filters}
                handleChange={handleChange} // e.target.name এবং value হ্যান্ডেল করে এমন ফাংশন
                handleAdvancedFilter={handleAdvancedFilter}
                positions={positions}
            />


            {isLoading ? (
                <div className="space-y-6">
                    {/* Category Tabs Skeleton */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-10 w-32 rounded-xl flex-shrink-0"/>
                        ))}
                    </div>

                    {/* Application Cards Skeleton */}
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-5 border border-slate-100 rounded-2xl bg-white space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg"/>
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-48"/>
                                            <Skeleton className="h-4 w-32"/>
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-20 rounded-full"/>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <Skeleton className="h-4 w-24"/>
                                    <Skeleton className="h-4 w-24"/>
                                    <Skeleton className="h-4 w-24"/>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Skeleton className="h-10 w-28 rounded-xl"/>
                                    <Skeleton className="h-10 w-28 rounded-xl"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : categories.length === 0 ? (
                <div
                    className="bg-white rounded-2xl py-16 px-8 text-center shadow-sm border border-slate-50 flex flex-col items-center justify-center">
                    <div className="mb-6 w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                        <i className="fas fa-inbox text-6xl text-slate-200"></i>
                    </div>

                    <h3 className="text-xl font-bold text-slate-600 mb-2">
                        No applications found
                    </h3>

                    <p className="text-slate-400 text-sm max-w-[300px] leading-relaxed">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria to find what you are looking for.'
                            : 'Your contract applications will appear here once you start receiving them.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="relative w-full overflow-x-auto scrollbar-hide select-none">
                        <div
                            className="inline-flex items-center gap-2 p-1 border border-gray-200 rounded-xl bg-white">
                            {categories.map((category) => {
                                const config = getCategoryConfig(category);
                                const catStats = getCategoryStats(category);
                                const isActive = activeCategory === category;

                                return (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`
                                                    flex items-center gap-2 px-5 py-2.5 !rounded-xl border transition-all duration-200 whitespace-nowrap
                                                        ${isActive
                                            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                            : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50 hover:border-gray-300'
                                        }
                                                  `}
                                    >
                                        {/* আইকন */}
                                        <i className={`${config.icon} text-lg`}
                                           style={{color: isActive ? undefined : config.color}}></i>

                                        {/* ক্যাটাগরি নাম */}
                                        <span className="font-semibold text-sm">
                                                    {category}
                                                  </span>

                                        {/* কাউন্টার চিপস */}
                                        <div className="flex gap-1 ml-1">
                                                    <span className={`
                                                      flex items-center justify-center text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-md
                                                      ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
                                                    `}>
                                                      {catStats.total}
                                                    </span>

                                            {catStats.pending > 0 && (
                                                <span
                                                    className="flex items-center justify-center bg-amber-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-md">
                                                      {catStats.pending}
                                                    </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <>
                        {renderContractSection(activeCategoryData.Temporary, 'Temporary')}
                        {renderContractSection(activeCategoryData.Permanent, 'Permanent')}
                        {renderContractSection(activeCategoryData.Other, 'Other')}

                        {activeCategoryData.Temporary.length === 0 &&
                            activeCategoryData.Permanent.length === 0 &&
                            activeCategoryData.Other.length === 0 && (
                                <div
                                    className="flex flex-col items-center justify-center py-16 px-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <div
                                        className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <i className="fas fa-folder-open text-2xl text-slate-400"></i>
                                    </div>
                                    <h3 className="text-slate-600 font-semibold text-lg">No Applications Found</h3>
                                    <p className="text-slate-400 text-sm mt-1 max-w-[200px] text-center">
                                        There are no applications in this category at the moment.
                                    </p>
                                </div>
                            )}
                    </>
                </>
            )}


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
        </>
    );
};

export default View;
