import React, {useState, useEffect, useMemo} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useViewContract} from "@hooks/institute/contracts/useViewContract";
import UserContractFilterForm from "@components/forms/UserContractFilterForm.jsx"
import CancelConfirmationModal from "@components/modals/CancelConfirmationModal";
import {cancelContractService} from "@services/institute/ContractCancellationService";
import ContractsTable from "@pages/institute/contracts/Components/ContractsTable.jsx";
import {getContractColumns} from "@pages/institute/contracts/Components/columns.jsx";
import ContractCard from "@pages/institute/contracts/Components/ContractCard.jsx";
import {FilterIcon, Inbox, LayoutGrid, Plus, List, Filter, ChevronDown, AlertCircle} from "lucide-react";
import MetricsGrid from "@pages/institute/contracts/Components/metrics-grid.jsx";
import {Button} from "@components/ui/button.jsx";

// Category configuration
const CATEGORY_CONFIG = {
    "Dental Care": {
        icon: "fas fa-tooth",
        color: "#17a2b8",
        bgColor: "#e8f4f8",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        order: 1,
    },
    "Pharmacy": {
        icon: "fas fa-pills",
        color: "#28a745",
        bgColor: "#e8f5e9",
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        order: 2,
    },
    "Nursing and Home Care": {
        icon: "fas fa-hand-holding-medical",
        color: "#dc3545",
        bgColor: "#fce4ec",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        order: 3,
    },
    "General Practice": {
        icon: "fas fa-stethoscope",
        color: "#6f42c1",
        bgColor: "#f3e5f5",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        order: 4,
    },
    "General Medicine": {
        icon: "fas fa-stethoscope",
        color: "#6f42c1",
        bgColor: "#f3e5f5",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        order: 4,
    },
};

const DEFAULT_CATEGORY_CONFIG = {
    icon: "fas fa-file-medical",
    color: "#6c757d",
    bgColor: "#f8f9fa",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    order: 99,
};

const View = () => {
    const {
        menu,
        sessionUserRole,
        contracts,
        action,
        setContracts,
        useFilterHook,
        show,
        setShow,
        ContractModel,
        showContractData,
        handleShowModal,
        filters,
        searchParams,
    } = useViewContract();

    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    // Check if special filter is active
    const activeSpecialFilter = searchParams?.get("filter");
    const isNoApplicationsFilter = activeSpecialFilter === "no_applications";

    // Clear special filter
    const clearSpecialFilter = () => {
        navigate(`/${sessionUserRole}/${menu}`);
    };

    const [viewMode, setViewMode] = useState('table');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [contractToCancel, setContractToCancel] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    // Group contracts by industry/category
    const groupedContracts = useMemo(() => {
        if (!contracts || !Array.isArray(contracts)) return {};

        const grouped = contracts.reduce((acc, contract) => {
            const category = contract?.contract_type?.industry || "Other";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(contract);
            return acc;
        }, {});

        // Sort categories by their configured order
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
    }, [contracts]);

    // Auto-select tab when contracts change (e.g., after filtering)
    useEffect(() => {
        const categories = Object.keys(groupedContracts);
        if (categories.length > 0) {
            // If current active category has no contracts, switch to first category with contracts
            if (!activeCategory || !groupedContracts[activeCategory] || groupedContracts[activeCategory].length === 0) {
                const firstCategoryWithContracts = categories.find(cat => groupedContracts[cat]?.length > 0);
                if (firstCategoryWithContracts) {
                    setActiveCategory(firstCategoryWithContracts);
                }
            }
        }
    }, [groupedContracts]);

    const getCategoryConfig = (category) => {
        return CATEGORY_CONFIG[category] || DEFAULT_CATEGORY_CONFIG;
    };

    const categories = Object.keys(groupedContracts);
    const activeContracts = groupedContracts[activeCategory] || [];
    const activeConfig = getCategoryConfig(activeCategory);
    const totalContracts = contracts?.length || 0;

    // Handle contract card click to open modal
    const handleContractClick = (contract) => {
        try {
            if (!contract?.id || !contract?.contract_type?.contract_name) {
                console.error("Contract ID or type name is missing");
                return;
            }
            handleShowModal(contract.id, contract.contract_type.contract_name);
        } catch (error) {
            console.error("Error in handleContractClick:", error);
        }
    };

    const handleCloseModal = () => {
        setShow(false);
    };

    const handleOpenCancelModal = (contract, e) => {
        if (e) e.stopPropagation();
        setContractToCancel(contract);
        setShowCancelModal(true);
    };

    const handleCancelContract = async (contractId, reason) => {
        try {
            const result = await cancelContractService(contractId, reason);
            if (result?.status) {
                setContracts(prevContracts => prevContracts.filter(c => c.id !== contractId));
                setShowCancelModal(false);
                setContractToCancel(null);
            }
            return result;
        } catch (error) {
            console.error("Error cancelling contract:", error);
            throw error;
        }
    };

    // Helper functions
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

        const compensationMode = data.compensation_mode || '';
        const isFixedContractValue = compensationMode === 'Fixed Contract Value' || compensationMode === 'fixed_contract_value';

        // 1. Fixed Contract Value - use directly
        if (contractValue > 0 && isFixedContractValue) {
            return {value: contractValue, type: 'fixed', label: 'Contract Value'};
        }

        // 2. Hourly rate - multiply by total hours
        if (hourlyRate > 0) {
            const totalHours = getTotalHoursFromTimeSlots(data);
            if (totalHours) {
                const total = hourlyRate * totalHours;
                return {
                    value: total,
                    type: 'hourly',
                    label: `${totalHours.toFixed(1)}hrs @ $${hourlyRate.toLocaleString()}/hr`
                };
            }
            // Fallback: assume 8 hours per day
            const daysCount = getSelectedDatesCount(data);
            const total = hourlyRate * daysCount * 8;
            return {value: total, type: 'hourly', label: `${daysCount} days @ $${hourlyRate.toLocaleString()}/hr`};
        }

        // 3. Daily rate - multiply by selected days count
        if (dailyRate > 0) {
            const daysCount = getSelectedDatesCount(data);
            const total = dailyRate * daysCount;
            return {value: total, type: 'daily', label: `${daysCount} days @ $${dailyRate.toLocaleString()}/day`};
        }

        // 4. Annual salary - use directly
        if (annualSalary > 0) {
            return {value: annualSalary, type: 'salary', label: 'Annual Salary'};
        }

        // 5. Gross salary - use directly
        if (grossSalary > 0) {
            return {value: grossSalary, type: 'salary', label: 'Annual Salary'};
        }

        return null;
    };

    const getCompensation = (contract) => {
        const data = contract?.data;
        if (!data) return 'Not specified';

        // Try to calculate total contract value first
        const totalValue = getTotalContractValue(contract);
        if (totalValue) {
            return `$${totalValue.value.toLocaleString()}`;
        }

        // Fallback to original logic for edge cases
        const contractTypeId = contract?.contract_type_id;

        if (contractTypeId === 8 && data.compensation && data.compensation_value) {
            const value = parseCurrency(data.compensation_value);
            if (value) {
                if (data.compensation === 'Hourly Rate') return `$${value.toLocaleString()}/hr`;
                if (data.compensation === 'Fixed Salary') return `$${value.toLocaleString()}/year`;
            }
        }
        if (contractTypeId === 7 && data.compensation_mode) {
            if (data.compensation_mode === 'Percentage of Production' && data.production_percentage) {
                return `${data.production_percentage}% of production`;
            }
        }
        if (contractTypeId === 9 && data.proposed_rate && data.rate_amount) {
            const rate = parseCurrency(data.rate_amount);
            if (rate) {
                if (data.proposed_rate === 'procedure') return `$${rate.toLocaleString()}/procedure`;
                if (data.proposed_rate === 'hourly') return `$${rate.toLocaleString()}/hr`;
                return `$${rate.toLocaleString()}`;
            }
        }
        if (contractTypeId === 4 && data.payment_method === 'Per Service' && data.service_rate) {
            const rate = parseCurrency(data.service_rate);
            if (rate) return `$${rate.toLocaleString()}/service`;
        }
        if (data.service_rate) {
            const rate = parseCurrency(data.service_rate);
            if (rate) return `$${rate.toLocaleString()}/service`;
        }
        if (data.procedure_rate) {
            const rate = parseCurrency(data.procedure_rate);
            if (rate) return `$${rate.toLocaleString()}/procedure`;
        }
        if (data.production_percentage) return `${data.production_percentage}% of production`;
        if (data.rate_amount) {
            const rate = parseCurrency(data.rate_amount);
            if (rate) return `$${rate.toLocaleString()}`;
        }
        if (data.compensation_value) {
            const value = parseCurrency(data.compensation_value);
            if (value) return `$${value.toLocaleString()}`;
        }
        return 'Not specified';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
    };

    const getPositions = (contract) => {
        if (!contract?.contract_positions || contract.contract_positions.length === 0) return 'Not specified';
        return contract.contract_positions.map(cp => cp.position?.name).filter(Boolean).join(', ');
    };

    const getLocation = (contract) => {
        const data = contract?.data;
        if (!data) return 'Not specified';
        if (data.city && data.province) return `${data.city}, ${data.province}`;
        if (data.contract_location) return data.contract_location;
        if (data.city) return data.city;
        return 'Not specified';
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'open': {color: 'success', icon: 'fa-check-circle', text: 'Open'},
            'pending': {color: 'warning', icon: 'fa-clock', text: 'Pending'},
            'pending_signature': {color: 'info', icon: 'fa-file-signature', text: 'Pending Signature'},
            'closed': {color: 'secondary', icon: 'fa-times-circle', text: 'Closed'},
            'cancelled': {color: 'danger', icon: 'fa-ban', text: 'Cancelled'},
            'in_discussion': {color: 'info', icon: 'fa-comments', text: 'In Discussion'},
            'booked': {color: 'primary', icon: 'fa-handshake', text: 'Booked'},
        };
        const config = statusConfig[status] || statusConfig['pending'];
        return (
            <span className={`badge badge-${config.color} px-2 py-1`}>
                <i className={`fas ${config.icon} mr-1`}></i>
                {config.text}
            </span>
        );
    };

    const helpers = {
        getPositions,
        getLocation,
        formatDate,
        getStatusBadge,
        getCompensation
    };
    const columns = getContractColumns(
        handleContractClick,
        sessionUserRole,
        menu,
        helpers
    );

    const statsConfig = [
        {label: "Open", value: contracts.filter(c => c.status === 'open' || c.status === 'in_discussion').length},
        {
            label: "Pending",
            value: contracts.filter(c => c.status === 'pending' || c.status === 'pending_signature').length
        },
        {label: "Booked", value: contracts.filter(c => c.status === 'booked').length},
        {label: "Closed", value: contracts.filter(c => c.status === 'closed' || c.status === 'cancelled').length},
    ];

    return (
        <div>
            <MetricsGrid stats={statsConfig}/>

            <div className="flex flex-col md:flex-row items-center flex-wrap justify-between gap-4 mb-6">

                <div className="flex items-center gap-2 w-full md:w-auto ">
                    {/* Filter Toggle Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-lg shrink-0 border-gray-200 ${isOpen ? "!bg-blue-50": ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <FilterIcon className="h-4 w-4 text-gray-500"/>
                    </Button>

                    {/* Category Tabs (Middle) */}
                    <div
                        className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl overflow-x-auto no-scrollbar">
                        {categories.map((category) => {
                            const config = getCategoryConfig(category);
                            const isActive = activeCategory === category;
                            const count = groupedContracts[category]?.length || 0;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 !rounded-lg transition-all duration-200 whitespace-nowrap
                                        ${isActive
                                        ? "bg-[#F0F7FF] border border-[#D1E9FF] text-[#2D8FE3]"
                                        : "bg-transparent border border-transparent text-[#4B5563] hover:bg-gray-50"
                                    }
                                    `}
                                >
                                    <i className={`${config.icon} text-sm`}
                                       style={{color: isActive ? '#2D8FE3' : config.color}}></i>
                                    <span className="text-xs font-semibold">{category}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: View Mode & Add Button */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {/* View Switcher */}
                    <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-[#F0F7FF] text-[#2D8FE3]' : 'text-gray-400'}`}
                        >
                            <List className="h-4 w-4"/>
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'cards' ? 'bg-[#F0F7FF] text-[#2D8FE3]' : 'text-gray-400'}`}
                        >
                            <LayoutGrid className="h-4 w-4"/>
                        </button>
                    </div>

                    {/* Add Contract Button */}
                    <Button asChild className="!bg-[#2D8FE3] hover:bg-[#1E70B8] text-white !rounded-lg px-4 flex gap-2">
                        <Link to={`/${sessionUserRole}/${menu}/create`}>
                            <Plus className="h-4 w-4"/>
                            <span className="font-semibold text-sm">Add Contract</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 3. Special Filter Alert (If active) */}
            {isNoApplicationsFilter && (
                <div
                    className="mb-4 flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-800">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <FilterIcon className="h-4 w-4"/>
                        Showing contracts with no applications (7+ days)
                    </div>
                    <button onClick={clearSpecialFilter} className="text-xs underline font-bold">Clear Filter</button>
                </div>
            )}

            <div className="flex items-center gap-2">

                {isNoApplicationsFilter && (
                    <Badge variant="warning"
                           className="bg-orange-100 text-orange-700 border-none flex items-center gap-1 text-[10px] px-2 h-5">
                        <AlertCircle className="h-3 w-3"/> Active
                    </Badge>
                )}
            </div>
            {/* Collapsible Content */}
            <div
                className={`mb-3 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] border-t border-gray-50 opacity-100' : 'max-h-0 opacity-0'}`}>
                <UserContractFilterForm
                    setContracts={setContracts}
                    useFilterHook={useFilterHook}
                />
            </div>

            {/* 4. Main Content Area */}
            <section>
                {contracts && contracts.length > 0 ? (
                    <>
                        {viewMode === 'cards' ? (
                            <div
                                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {activeContracts.map((contract) => (
                                    <ContractCard
                                        key={contract.id}
                                        contract={contract}
                                        handleContractClick={handleContractClick}
                                        getPositions={getPositions}
                                        getLocation={getLocation}
                                        formatDate={formatDate}
                                        getCompensation={getCompensation}
                                        getStatusBadge={getStatusBadge}
                                        getCategoryConfig={getCategoryConfig}
                                        handleOpenCancelModal={handleOpenCancelModal}
                                        sessionUserRole={sessionUserRole}
                                        menu={menu}
                                    />
                                ))}

                                {/* Inner Empty State */}
                                {activeContracts.length === 0 && (
                                    <div
                                        className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed flex flex-col items-center">
                                        <Inbox className="h-10 w-10 text-gray-300 mb-2"/>
                                        <p className="text-gray-500 font-medium text-sm">No contracts in this
                                            category</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <ContractsTable
                                    data={activeContracts}
                                    columns={columns}
                                    onRowClick={handleContractClick}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    /* Outer Global Empty State */
                    <div
                        className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center text-center">
                        <div
                            className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
                            <Inbox size={40} strokeWidth={1}/>
                        </div>
                        <h3 className="text-xl font-bold text-[#2A394B] mb-2">No Contracts Found</h3>
                        <p className="text-gray-500 mb-8 max-w-xs">There are no contracts to display. Create your first
                            one to get started.</p>
                        <Button asChild className="bg-[#2D8FE3] rounded-xl px-8 h-12">
                            <Link to={`/${sessionUserRole}/${menu}/create`}>Create First Contract</Link>
                        </Button>
                    </div>
                )}
            </section>


            {/* Contract Modal */}
            {ContractModel && show && showContractData && (
                <ContractModel show={show} setShow={handleCloseModal} contract={showContractData}/>
            )}

            {/* Cancel Confirmation Modal */}
            <CancelConfirmationModal
                open={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setContractToCancel(null);
                }}
                onConfirm={handleCancelContract}
                title="Cancel Contract"
                message={`Are you sure you want to cancel this contract${contractToCancel ? ` (#${contractToCancel.id})` : ''}?`}
                type="contract"
                id={contractToCancel?.id}
            />
        </div>
    );
}

export default View;
