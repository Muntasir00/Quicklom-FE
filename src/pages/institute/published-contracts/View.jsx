import {useState, useMemo} from "react";
import {useViewPublishedContracts} from "@hooks/institute/published-contracts/useViewPublishedContracts";
import ContractApplicationAdditionalInformationModal
    from "@components/modals/ContractApplicationAdditionalInformationModal";
import Filter from "@components/forms/UserContractFilterForm";
import {
    Clock,
    HeartHandshake,
    LayoutGrid, ListFilter, Pill,
    PlusSquare,
    Stethoscope, User
} from "lucide-react";

// Industry configuration with icons and colors
const INDUSTRIES = [
    {
        id: 'all',
        name: 'All Industries',
        icon: 'fas fa-globe',
        color: '#667eea',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        id: 'general_medicine',
        name: 'General Medicine',
        icon: 'fas fa-stethoscope',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
        id: 'dental_care',
        name: 'Dental Care',
        icon: 'fas fa-tooth',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
    },
    {
        id: 'pharmacy',
        name: 'Pharmacy',
        icon: 'fas fa-pills',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
        id: 'nursing',
        name: 'Nursing & Home Care',
        icon: 'fas fa-heart',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
    }
];

// Contract type colors
const CONTRACT_TYPE_COLORS = {
    temporary: {
        bg: '#fef3c7',
        border: '#f59e0b',
        text: '#92400e',
        badge: '#f59e0b',
        label: 'Temporary'
    },
    permanent: {
        bg: '#dbeafe',
        border: '#3b82f6',
        text: '#1e40af',
        badge: '#3b82f6',
        label: 'Permanent'
    }
};

// Helper to determine industry from contract name
const getIndustry = (contractName) => {
    if (!contractName) return 'other';
    const name = contractName.toLowerCase();
    if (name.includes('dentistry') || name.includes('dental')) return 'dental_care';
    if (name.includes('pharmacy')) return 'pharmacy';
    if (name.includes('nursing')) return 'nursing';
    if (name.includes('general practice')) return 'general_medicine';
    return 'other';
};

// Helper to determine contract duration type
const getContractDurationType = (contractName) => {
    if (!contractName) return 'other';
    const name = contractName.toLowerCase();
    if (name.includes('temporary')) return 'temporary';
    if (name.includes('permanent')) return 'permanent';
    // Specialty contracts (like "Specialty Dentistry – Contract") are treated as temporary
    if (name.includes('specialty') || name.includes('dentistry') || name.includes('dental')) return 'temporary';
    return 'other';
};

const View = () => {
    const {
        rows,
        showForm,
        setShowForm,
        show,
        setShow,
        ContractModel,
        showContractData,
        useFilterHook,
        setContracts,
        selectedContractId,
        handleShowModal,
        setSelectedContractId,
    } = useViewPublishedContracts();

    const [activeIndustry, setActiveIndustry] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
    const rowsPerPage = 8;

    // Filter contracts by industry
    const filteredRows = useMemo(() => {
        if (activeIndustry === 'all') return rows;
        return rows.filter(row => {
            const industry = getIndustry(row.contract_type?.contract_name);
            return industry === activeIndustry;
        });
    }, [rows, activeIndustry]);

    // Group contracts by duration type
    const groupedContracts = useMemo(() => {
        const temporary = filteredRows.filter(row =>
            getContractDurationType(row.contract_type?.contract_name) === 'temporary'
        );
        const permanent = filteredRows.filter(row =>
            getContractDurationType(row.contract_type?.contract_name) === 'permanent'
        );
        const other = filteredRows.filter(row =>
            getContractDurationType(row.contract_type?.contract_name) === 'other'
        );
        return {temporary, permanent, other};
    }, [filteredRows]);

    // Industry counts
    const industryCounts = useMemo(() => {
        const counts = {all: rows.length};
        INDUSTRIES.forEach(ind => {
            if (ind.id !== 'all') {
                counts[ind.id] = rows.filter(row =>
                    getIndustry(row.contract_type?.contract_name) === ind.id
                ).length;
            }
        });
        return counts;
    }, [rows]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            open: "#10b981",
            pending: "#f59e0b",
            cancelled: "#ef4444",
            in_discussion: "#6b7280",
            booked: "#3b82f6",
            closed: "#6b7280"
        };
        return colors[status] || "#6b7280";
    };

    // Helper to parse currency values
    const parseCurrency = (value) => {
        if (!value) return null;
        const cleanValue = String(value).replace(/[$,\s]/g, '');
        const num = Number(cleanValue);
        return isNaN(num) ? null : num;
    };

    // Get the count of selected dates (for temporary contracts)
    const getSelectedDatesCount = (data) => {
        // Try selected_dates first
        if (data?.selected_dates) {
            try {
                const dates = typeof data.selected_dates === 'string'
                    ? JSON.parse(data.selected_dates)
                    : data.selected_dates;
                if (Array.isArray(dates) && dates.length > 0) {
                    return dates.length;
                }
            } catch (e) {
                console.debug('Unable to parse selected_dates');
            }
        }

        // Try time_slots
        if (data?.time_slots) {
            try {
                const slots = typeof data.time_slots === 'string'
                    ? JSON.parse(data.time_slots)
                    : data.time_slots;
                if (Array.isArray(slots) && slots.length > 0) {
                    // Count unique dates
                    const uniqueDates = new Set(slots.map(s => s.date).filter(Boolean));
                    return uniqueDates.size;
                }
            } catch (e) {
                console.debug('Unable to parse time_slots');
            }
        }

        // Fallback to 1 for permanent contracts
        return 1;
    };

    // Calculate total hours from time slots
    const getTotalHoursFromTimeSlots = (data) => {
        if (!data?.time_slots) return null;

        try {
            const slots = typeof data.time_slots === 'string'
                ? JSON.parse(data.time_slots)
                : data.time_slots;

            if (!Array.isArray(slots) || slots.length === 0) return null;

            let totalHours = 0;
            slots.forEach(slot => {
                const start = slot.start_time || slot.start;
                const end = slot.end_time || slot.end;
                if (start && end) {
                    const [startH, startM] = start.split(':').map(Number);
                    const [endH, endM] = end.split(':').map(Number);
                    let hours = (endH + endM / 60) - (startH + startM / 60);
                    if (hours < 0) hours += 24; // Handle overnight shifts
                    totalHours += hours;
                }
            });

            return totalHours > 0 ? totalHours : null;
        } catch (e) {
            return null;
        }
    };

    // Calculate total contract value (matching invoice_service.py logic)
    const getTotalContractValue = (contract) => {
        const data = contract?.data;
        if (!data) return null;

        const hourlyRate = parseCurrency(data.hourly_rate);
        const dailyRate = parseCurrency(data.daily_rate);
        const contractValue = parseCurrency(data.contract_value);
        const annualSalary = parseCurrency(data.annual_salary);
        const grossSalary = parseCurrency(data.gross_salary);
        const rateAmount = parseCurrency(data.rate_amount);
        const compensationValue = parseCurrency(data.compensation_value);

        const compensationMode = data.compensation_mode || '';
        const isFixedContractValue = compensationMode === 'Fixed Contract Value' || compensationMode === 'fixed_contract_value';

        // 1. Fixed Contract Value - use directly (with or without compensation mode)
        if (contractValue > 0 && isFixedContractValue) {
            return contractValue;
        }

        // 2. Hourly rate - multiply by total hours
        if (hourlyRate > 0) {
            const totalHours = getTotalHoursFromTimeSlots(data);
            if (totalHours) {
                return hourlyRate * totalHours;
            }
            // Fallback: assume 8 hours per day
            const daysCount = getSelectedDatesCount(data);
            return hourlyRate * daysCount * 8;
        }

        // 3. Daily rate - multiply by selected days count
        if (dailyRate > 0) {
            const daysCount = getSelectedDatesCount(data);
            return dailyRate * daysCount;
        }

        // 4. Annual salary - use directly
        if (annualSalary > 0) {
            return annualSalary;
        }

        // 5. Gross salary - use directly
        if (grossSalary > 0) {
            return grossSalary;
        }

        // 6. Contract value without compensation mode check (fallback)
        if (contractValue > 0) {
            return contractValue;
        }

        // 7. Rate amount (for specialty dentistry and similar)
        if (rateAmount > 0) {
            return rateAmount;
        }

        // 8. Compensation value (generic fallback)
        if (compensationValue > 0) {
            return compensationValue;
        }

        return null;
    };

    // Helper to format currency
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return null;
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Helper to get position sought from contract data
    const getPositionSought = (contract) => {
        const data = contract?.data;
        if (!data) return null;

        // Check position_soughts array
        if (data.position_soughts && Array.isArray(data.position_soughts)) {
            const positions = data.position_soughts
                .map(ps => {
                    if (typeof ps === 'string') return ps;
                    if (ps.position_name) return ps.position_name;
                    if (ps.name) return ps.name;
                    return null;
                })
                .filter(Boolean);
            if (positions.length > 0) return positions.join(', ');
        }

        // Fallback to position field
        if (data.position) return data.position;

        // Fallback to contract_name
        if (data.contract_name) return data.contract_name;

        return null;
    };

    // Helper to get full location from contract data
    const getFullLocation = (contract) => {
        const data = contract?.data;
        if (!data) return null;

        const parts = [];
        if (data.facility_name) parts.push(data.facility_name);
        if (data.street_address) parts.push(data.street_address);
        if (data.city) parts.push(data.city);
        if (data.province) parts.push(data.province);
        if (data.postal_code) parts.push(data.postal_code);

        return parts.length > 0 ? parts.join(', ') : null;
    };

    const activeIndustryData = INDUSTRIES.find(i => i.id === activeIndustry);


    const Industries = [
        {
            id: "all",
            name: 'All Industries',
            icon: LayoutGrid,
            color: 'text-blue-500',
            activeBg: 'bg-blue-50',
            activeBorder: 'border-blue-200'
        },
        {id: "general_medicine", name: 'General Medicine', icon: PlusSquare, color: 'text-purple-500'},
        {id: "dental_care", name: 'Dental Care', icon: Stethoscope, color: 'text-blue-400'},
        {id: "pharmacy", name: 'Pharmacy', icon: Pill, color: 'text-emerald-500'},
        {id: "nursing", name: 'Nursing & Home Care', icon: HeartHandshake, color: 'text-orange-400'},
    ];


    const TYPE_CONFIG = {
        temporary: {
            primary: 'text-blue-500',
            bg: 'bg-blue-50',
            border: 'border-blue-500',
            accent: '#3b82f6',
            icon: <Clock className="text-blue-500"/>
        },
        permanent: {
            primary: 'text-amber-500',
            bg: 'bg-amber-50',
            border: 'border-amber-500',
            accent: '#f59e0b',
            icon: <User className="text-amber-500"/>
        }
    };

    const ContractSection = ({title, contracts, type}) => {
        const config = TYPE_CONFIG[type] || TYPE_CONFIG.temporary;

        if (!contracts || contracts.length === 0) return null;

        const count = contracts.length;

        return (
            <div className="flex flex-col w-full mb-8">
                {/* Section Header */}
                <div
                    className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${config.border} border-opacity-20`}>
                    <div className="flex items-center gap-3">
                        {/* Icon Box */}
                        <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center shadow-sm`}>
                            {/*<i className={`fas ${config.icon} ${config.primary} text-base`}></i>*/}
                            {config.icon}
                        </div>

                        {/* Title and Subtitle */}
                        <div className="flex flex-col">
                            <h2 className="!text-base font-bold text-[#2D8FE3] leading-tight !mb-0">
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Right Side Circular Badge (matches image) */}
                    <div
                        className="w-6 h-6 rounded-lg py-[3px] px-2 border border-[#BDD7ED] flex items-center justify-center">
                    <span className="text-sm font-medium text-[#374151]">
                        {count}
                    </span>
                    </div>
                </div>

                {/* List of Cards */}
                <div className="flex flex-col gap-4">
                    {contracts.map((contract) => (
                        <ContractCard
                            key={contract.id}
                            contract={contract}
                            durationType={type} // Pass 'temporary' or 'permanent'
                        />
                    ))}
                </div>
            </div>
        );
    };


    const ContractCard = ({contract, durationType}) => {
        const typeConfig = CONTRACT_TYPE_COLORS[durationType] || CONTRACT_TYPE_COLORS.temporary;
        const hasApplied = contract?.user_application?.has_applied;
        const totalValue = getTotalContractValue(contract);
        const positionSought = getPositionSought(contract);
        const fullLocation = getFullLocation(contract);

        const typeTagClass = typeConfig.label === "Temporary"
            ? "bg-[#FBF1E7] text-[#F36B2D]"
            : "bg-blue-50 text-blue-500 border-blue-100";

        const cardBorderColor = durationType !== 'permanent' ? "!border-[#95C8EC]" : "!border-[#F1D370]"

        return (
            <div
                onClick={() => handleShowModal(contract.id, contract.contract_type?.contract_name)}
                className={`group bg-[#FBFBFB] border ${cardBorderColor} rounded-xl p-3 space-y-3 transition-all duration-200 cursor-pointer relative overflow-hidden`}
            >
                {/* Top Row: ID and Status Tags */}
                <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-[#374151] tracking-tight">
                      #{contract.id}
                    </span>
                    <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span
                            className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wider border border-emerald-100">
                            {contract.status?.replace('_', ' ') || 'Open'}
                          </span>
                        {/* Type Badge (Temporary/Permanent) */}
                        <span
                            className={`text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wider border ${typeTagClass}`}>
                                {typeConfig.label}
                              </span>
                        {/* Action Menu icon */}
                        <button className="text-gray-300 hover:text-gray-500 ml-1">
                            <i className="fas fa-ellipsis-v text-xs"></i>
                        </button>
                    </div>
                </div>

                {/* Main Title & Position */}
                <div className="mb-2">
                    <h3 className="!text-base font-medium text-[#2A394B] mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                        {contract.contract_type?.contract_name || 'General Dentistry – Temporary Contract'}
                    </h3>

                    {/* Dynamic Position Sought (if exists) */}
                    {positionSought && (
                        <div
                            className="flex items-center gap-2 mb-2 text-blue-700 bg-blue-50/50 w-fit px-2 py-0.5 rounded text-[12px] font-semibold">
                            <i className="fas fa-user-md text-[10px]"></i>
                            {positionSought}
                        </div>
                    )}

                    {/* Location Section */}
                    <div className="flex flex-col  sm:gap-1 text-[13px] text-gray-500">
                        <span className="!text-sm text-[#6B7280] !block !mb-0">Location</span>
                        <span
                            className="line-clamp-1 !mb-0 !text-sm text-[#2A394B]">{fullLocation || "Address not specified"}</span>
                    </div>
                </div>

                {/* Footer Info & Action Button */}
                <div
                    className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-2 border-t border-gray-50 mt-2">
                    <div className="flex gap-3 sm:gap-10 w-full sm:w-auto">
                        {/* Contract Value */}
                        <div>
                            <p className="text-sm capitalize text-[#6B7280]  !mb-0">
                                Contract value
                            </p>
                            <p className="text-sm font-medium text-[#2D8FE3] !mb-0">
                                {totalValue ? formatCurrency(totalValue) : '$ 0.00'}
                            </p>
                        </div>

                        {/* Duration */}
                        <div>
                            <p className="text-sm text-[#6B7280]  !mb-0">
                                Duration
                            </p>
                            <p className="text-[14px] text-[#2A394B] !mb-0">
                                {contract.start_date ? formatDate(contract.start_date) : 'TBD'}
                                {contract.end_date ? ` - ${formatDate(contract.end_date)}` : ''}
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Button based on Application Status */}
                    <div className="w-full sm:w-auto">
                        {hasApplied ? (
                            <button
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-2 !rounded-lg border-[2px] border-[#BDD7ED]  bg-[#EAF5FE] text-[#2D8FE3] text-sm transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <i className="far fa-file-alt"></i>
                                Applied
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedContractId(contract.id);
                                    setShowForm(true);
                                }}
                                // style={{background: activeIndustryData?.gradient || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-2 !rounded-lg bg-[#2D8FE3] text-white text-sm  hover:brightness-110 transition-all active:scale-95"
                            >
                                <i className="fas fa-paper-plane text-[11px]"></i>
                                Apply
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>

            <div className="flex items-center gap-3 bg-white w-full">
                {/* Filter Icon Button */}
                <button
                    className={`flex-shrink-0 p-3 border border-gray-200 !rounded-lg hover:bg-gray-50 transition-all shadow-sm relative
                     ${showFilters || appliedFiltersCount > 0
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }
                    `}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <ListFilter className="w-4 h-4 text-gray-500"/>
                </button>

                {/* Scrollable Tabs Container */}
                <div
                    className="flex items-center gap-1 p-2 border border-gray-100 rounded-xl overflow-x-auto no-scrollbar scroll-smooth">
                    {Industries.map((industry) => {
                        const Icon = industry.icon;
                        const isActive = activeIndustry === industry.id;

                        return (
                            <button
                                key={industry.id}
                                onClick={() => setActiveIndustry(industry.id)}
                                className={`flex items-center gap-2 px-3 py-2 !rounded-lg whitespace-nowrap transition-all duration-200
                                    ${isActive
                                    ? 'bg-blue-50 border border-blue-200 text-blue-600 shadow-sm'
                                    : 'border border-transparent text-slate-600 hover:bg-gray-50'
                                }
                                  `}
                            >
                                <Icon
                                    className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isActive ? 'text-blue-500' : industry.color}`}/>
                                <span className="text-sm font-semibold tracking-wide">
                                    {industry.name}
                                  </span>
                            </button>
                        );
                    })}
                </div>

            </div>

            {/* Filter Section */}
            {showFilters && (
                <div className="my-4">
                    <Filter
                        setContracts={setContracts}
                        useFilterHook={useFilterHook}
                        onFiltersChange={(count) => setAppliedFiltersCount(count)}
                    />
                </div>
            )}

            <div className="mt-4">
                {filteredRows.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <i className={`${activeIndustryData?.icon || 'fas fa-briefcase'} text-5xl text-gray-300`}></i>
                        </div>
                        <h5 className="text-xl font-semibold text-gray-600 mb-2">No Job Offers Available</h5>
                        <p className="text-gray-400 text-sm">
                            There are no {activeIndustry !== 'all' ? activeIndustryData?.name : ''} positions
                            available at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Temporary Contracts Column */}
                        <ContractSection
                            title="Temporary Positions"
                            contracts={groupedContracts.temporary}
                            type="temporary"
                            count={groupedContracts.temporary?.length || 0}
                        />

                        {/* Permanent Contracts Column */}
                        <ContractSection
                            title="Permanent Positions"
                            contracts={groupedContracts.permanent}
                            type="permanent"
                            count={groupedContracts.permanent?.length || 0}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <ContractApplicationAdditionalInformationModal
                show={showForm}
                setShow={setShowForm}
                contractId={selectedContractId}
            />

            {ContractModel && show && (
                <ContractModel
                    show={show}
                    setShow={setShow}
                    contract={showContractData}
                />
            )}
        </>
    );
};

export default View;
