import {useEffect, useMemo, useState} from "react";
import {
    SlidersHorizontal,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    FilterX,
    Briefcase, ArrowRight, Search, Inbox
} from "lucide-react";
import {useViewPublishedContracts} from "@hooks/professional/published-contracts/useViewPublishedContracts";
import Filter from "@components/forms/UserContractFilterForm";
// import "./FindJobsStyles.css";
import MetricsGrid from "@pages/professional/published-contracts/metrics-grid.jsx";
import {JobCard} from "@pages/professional/published-contracts/job-card.jsx";
import JobListView from "@pages/professional/published-contracts/job-list-view.jsx";
import {Link} from "react-router-dom";

const View = () => {
    const {
        sessionUserRole,
        rows,
        show,
        setShow,
        ContractModel,
        showContractData,
        useFilterHook,
        setContracts,
        handleShowModal,
        handleApplyToContract,
    } = useViewPublishedContracts();

    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
    const [viewMode, setViewMode] = useState("cards"); // cards or list
    const [itemsPerPage, setItemsPerPage] = useState(10);
    // const rowsPerPage = 12;
    const totalPages = Math.ceil(rows.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    // const currentRows = rows.slice(startIdx, endIdx);
    const currentRows = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return rows.slice(start, start + itemsPerPage);
    }, [rows, currentPage, itemsPerPage]);

    const totalJobs = rows.length;
    const activeJobs = rows.filter(r => r.status?.toLowerCase() === 'open').length;

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (value) => {
        if (!value) return null;
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const getStatusColor = (status) => {
        const colors = {
            open: {bg: "#ecfdf5", color: "#059669", border: "#a7f3d0"},
            pending: {bg: "#fffbeb", color: "#d97706", border: "#fde68a"},
            cancelled: {bg: "#fef2f2", color: "#dc2626", border: "#fecaca"},
            in_discussion: {bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db"},
            booked: {bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe"},
            closed: {bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db"}
        };
        return colors[status?.toLowerCase()] || colors.closed;
    };

    const getContractValue = (contract) => {
        const data = contract.data || {};

        // For fixed contract value or permanent contracts
        if (data.contract_value) return data.contract_value;
        if (data.contractValue) return data.contractValue;
        if (data.annual_salary) return data.annual_salary;
        if (data.gross_salary) return data.gross_salary;

        // For temporary contracts, calculate based on compensation mode
        const compensationMode = data.compensation_mode?.toLowerCase() || '';

        // Calculate for daily rate
        if ((compensationMode.includes('per day') || compensationMode.includes('daily')) && data.daily_rate) {
            const dailyRate = parseFloat(data.daily_rate);
            if (!isNaN(dailyRate)) {
                // Get number of days from selected_dates
                let selectedDates = data.selected_dates;
                if (typeof selectedDates === 'string') {
                    try {
                        selectedDates = JSON.parse(selectedDates);
                    } catch (e) {
                        selectedDates = [];
                    }
                }
                if (Array.isArray(selectedDates) && selectedDates.length > 0) {
                    return dailyRate * selectedDates.length;
                }
            }
            return data.daily_rate; // Fallback to showing just the rate
        }

        // Calculate for hourly rate
        if ((compensationMode.includes('per hour') || compensationMode.includes('hourly')) && data.hourly_rate) {
            const hourlyRate = parseFloat(data.hourly_rate);
            if (!isNaN(hourlyRate)) {
                // Get total hours from time_slots
                let timeSlots = data.time_slots;
                if (typeof timeSlots === 'string') {
                    try {
                        timeSlots = JSON.parse(timeSlots);
                    } catch (e) {
                        timeSlots = [];
                    }
                }
                if (Array.isArray(timeSlots) && timeSlots.length > 0) {
                    let totalHours = 0;
                    timeSlots.forEach(slot => {
                        if (slot.start_time && slot.end_time) {
                            const [startH, startM] = slot.start_time.split(':').map(Number);
                            const [endH, endM] = slot.end_time.split(':').map(Number);
                            const startMinutes = startH * 60 + startM;
                            const endMinutes = endH * 60 + endM;
                            const hours = (endMinutes - startMinutes) / 60;
                            if (hours > 0) totalHours += hours;
                        }
                    });
                    if (totalHours > 0) {
                        return hourlyRate * totalHours;
                    }
                }
            }
            return data.hourly_rate; // Fallback to showing just the rate
        }

        // Fallback for other cases
        return data.rate || data.hourly_rate || data.daily_rate || data.salary || data.compensation || null;
    };

    const getLocation = (contract) => {
        const data = contract.data || {};
        const parts = [];

        if (data.address || data.street_address) parts.push(data.address || data.street_address);
        if (data.city) parts.push(data.city);
        if (data.state || data.province) parts.push(data.state || data.province);
        if (data.zip_code || data.postal_code) parts.push(data.zip_code || data.postal_code);
        if (data.country) parts.push(data.country);

        return parts.length > 0 ? parts.join(", ") : null;
    };

    const getPositions = (contract) => {
        if (contract.positions && contract.positions.length > 0) {
            return contract.positions.map(p => p.name || p.position_name).filter(Boolean);
        }
        if (contract.contract_positions && contract.contract_positions.length > 0) {
            return contract.contract_positions.map(cp => cp.position?.name || cp.position_name).filter(Boolean);
        }
        const data = contract.data || {};
        if (data.position_sought) return [data.position_sought];
        if (data.positions) return Array.isArray(data.positions) ? data.positions : [data.positions];
        return [];
    };

    const getDuration = (contract) => {
        if (!contract.start_date || !contract.end_date) return null;
        const start = new Date(contract.start_date);
        const end = new Date(contract.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) !== 1 ? 's' : ''}`;
        return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) !== 1 ? 's' : ''}`;
    };

    const statsConfig = [
        {label: "Total Jobs", value: totalJobs},
        {label: "Open Now", value: activeJobs}, // অথবা আপনার ওপেন কন্টাক্ট লজিক
        {label: "Applied", value: rows.filter(r => r.user_application?.has_applied).length}, // অথবা এপ্লাইড লজিক
    ];

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, rows.length]);

    return (
        <div className="">

            <MetricsGrid stats={statsConfig} isLoading={false}/>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 bg-transparent mb-2">

                {/* Left Side: Filter Toggle */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`
                    relative flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl w-full text-sm font-semibold transition-all duration-300 border cursor-pointer
                    ${showFilters || appliedFiltersCount > 0
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                        }
                `}
                    >
                        {appliedFiltersCount > 0 && !showFilters ? (
                            <SlidersHorizontal className="w-4 h-4 animate-pulse"/>
                        ) : (
                            <SlidersHorizontal className="w-4 h-4"/>
                        )}

                        <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>

                        {/* Applied Filters Count Badge */}
                        {appliedFiltersCount > 0 && (
                            <span
                                className="flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full shadow-lg shadow-blue-200 ml-1">
                        {appliedFiltersCount}
                    </span>
                        )}
                    </button>
                </div>

                {/* Right Side: View Mode Toggle */}
                <div
                    className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50 w-full sm:w-auto justify-center sm:justify-start">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`
                    flex items-center gap-2 px-4 py-2 !rounded-md text-sm font-bold transition-all duration-300 cursor-pointer
                    ${viewMode === 'cards'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                        }
                `}
                        title="Card View"
                    >
                        <LayoutGrid className="w-4 h-4"/>
                        <span className="hidden md:inline">Grid</span>
                    </button>

                    <button
                        onClick={() => setViewMode('list')}
                        className={`
                    flex items-center gap-2 px-4 py-2 !rounded-md text-sm font-bold transition-all duration-300 cursor-pointer
                    ${viewMode === 'list'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                        }
                `}
                        title="List View"
                    >
                        <List className="w-4 h-4"/>
                        <span className="hidden md:inline">List</span>
                    </button>
                </div>
            </div>


            {/* Filters */}
            {showFilters && (
                <div className="">
                    <Filter
                        setContracts={setContracts}
                        useFilterHook={useFilterHook}
                        onFiltersChange={(count) => setAppliedFiltersCount(count)}
                    />
                </div>
            )}

            <div className="mt-6">
                {rows.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-24 px-6 text-center bg-white border-2 border-dashed border-slate-200 rounded-[32px] transition-all duration-500">

                        {/* আইকন সেকশন - গ্লাস-মর্ফিজম স্টাইল */}
                        <div className="relative mb-4">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                                {appliedFiltersCount > 0 ? (
                                    <Search className="w-10 h-10 text-blue-400" />
                                ) : (
                                    <Inbox className="w-10 h-10 text-slate-300" />
                                )}
                            </div>
                            {/* ডেকোরেটিভ ছোট সার্কেল */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-100 rounded-full border-4 border-white animate-bounce"></div>
                        </div>

                        {/* টেক্সট কন্টেন্ট */}
                        <div className="max-w-sm">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
                                {appliedFiltersCount > 0 ? "No matches found" : "No jobs available right now"}
                            </h3>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-10">
                                {appliedFiltersCount > 0
                                    ? `We couldn't find any jobs matching your current filters. Try adjusting your search or clearing the filters.`
                                    : "There are currently no open contracts in this category. Please check back later or explore other categories."
                                }
                            </p>
                        </div>
                    </div>
                ) : viewMode === 'cards' ? (
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {currentRows.map((job) => (
                            <JobCard key={job.id} job={job}
                                     onViewDetails={() => handleShowModal(job.id, job.contract_type?.contract_name)}
                                     onApply={() => handleApplyToContract(job.id)}/>
                        ))}
                    </div>
                ) : (
                    /* List View Section */
                    <div className="flex flex-col gap-4">
                        <JobListView data={currentRows} handleShowModal={handleShowModal}
                                     onApply={handleApplyToContract}/>
                    </div>
                )}
            </div>

                {/* Pagination */}
                {rows.length > 0 && (
                    <div
                        className="flex flex-col sm:flex-row sm:flex-row-reverse items-center justify-between gap-4 px-4 py-4 mt-6 border-t border-[#E6E6EB] bg-white w-full">

                        {/* বাম পাশ: Showing [Select] of [Total] Entries */}
                        <div className="flex items-center gap-2 text-[13px] text-[#64748B] order-2 sm:order-1">
                            <span>Showing</span>
                            <div className="relative group">
                                <select
                                    value={itemsPerPage || 10}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="appearance-none bg-[#F8FAFC] border border-[#E6E6EB] rounded-lg pl-3 pr-8 py-1.5 font-bold text-[#1E293B] cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <div
                                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">
                                    <ChevronUp className="w-3.5 h-3.5"/>
                                </div>
                            </div>
                            <span>of {rows.length} Entries</span>
                        </div>

                        {/* ডান পাশ: Pagination Controls */}
                        <div className="flex items-center gap-1 order-1 sm:order-2">
                            {/* Previous Button */}
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="flex items-center gap-1 px-2 py-2 text-[13px] font-medium text-[#94A3B8] hover:text-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4"/>
                                <span className="hidden md:inline">Previous</span>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({length: totalPages}, (_, i) => i + 1)
                                    .filter(pageNum => {
                                        // লজিক: প্রথম ৩টি, শেষের ৩টি এবং কারেন্ট পেজের আসেপাশের পেজ দেখানো
                                        if (totalPages <= 7) return true;
                                        return (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            Math.abs(pageNum - currentPage) <= 1
                                        );
                                    })
                                    .map((pageNum, index, array) => {
                                        const isSelected = currentPage === pageNum;
                                        const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;

                                        return (
                                            <div key={pageNum} className="flex items-center">
                                                {showEllipsis && (
                                                    <span className="px-2 text-[#94A3B8] text-[13px]">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`
                                        flex items-center justify-center min-w-[32px] h-8 md:min-w-[40px] md:h-10 px-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer
                                        ${isSelected
                                                        ? "border border-[#E6E6EB] bg-white text-[#1E293B] shadow-sm"
                                                        : "text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                                                    }
                                    `}
                                                >
                                                    {pageNum}
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Next Button */}
                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="flex items-center gap-1 px-2 py-2 text-[13px] font-medium text-[#94A3B8] hover:text-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <span className="hidden md:inline">Next</span>
                                <ChevronRight className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                )}

            {/* Contract Modal */}
            {ContractModel && show && (
                <ContractModel
                    show={show}
                    setShow={setShow}
                    contract={showContractData}
                />
            )}
        </div>
    );
};

export default View;
