import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useViewContract } from "@hooks/institute/contracts/useViewContract";
import Filter from "@components/forms/UserContractFilterForm"
import CancelConfirmationModal from "@components/modals/CancelConfirmationModal";
import { cancelContractService } from "@services/institute/ContractCancellationService";

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
    const{
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
                    let hours = (endH + endM/60) - (startH + startM/60);
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
            return { value: contractValue, type: 'fixed', label: 'Contract Value' };
        }

        // 2. Hourly rate - multiply by total hours
        if (hourlyRate > 0) {
            const totalHours = getTotalHoursFromTimeSlots(data);
            if (totalHours) {
                const total = hourlyRate * totalHours;
                return { value: total, type: 'hourly', label: `${totalHours.toFixed(1)}hrs @ $${hourlyRate.toLocaleString()}/hr` };
            }
            // Fallback: assume 8 hours per day
            const daysCount = getSelectedDatesCount(data);
            const total = hourlyRate * daysCount * 8;
            return { value: total, type: 'hourly', label: `${daysCount} days @ $${hourlyRate.toLocaleString()}/hr` };
        }

        // 3. Daily rate - multiply by selected days count
        if (dailyRate > 0) {
            const daysCount = getSelectedDatesCount(data);
            const total = dailyRate * daysCount;
            return { value: total, type: 'daily', label: `${daysCount} days @ $${dailyRate.toLocaleString()}/day` };
        }

        // 4. Annual salary - use directly
        if (annualSalary > 0) {
            return { value: annualSalary, type: 'salary', label: 'Annual Salary' };
        }

        // 5. Gross salary - use directly
        if (grossSalary > 0) {
            return { value: grossSalary, type: 'salary', label: 'Annual Salary' };
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
        if (data.service_rate) { const rate = parseCurrency(data.service_rate); if (rate) return `$${rate.toLocaleString()}/service`; }
        if (data.procedure_rate) { const rate = parseCurrency(data.procedure_rate); if (rate) return `$${rate.toLocaleString()}/procedure`; }
        if (data.production_percentage) return `${data.production_percentage}% of production`;
        if (data.rate_amount) { const rate = parseCurrency(data.rate_amount); if (rate) return `$${rate.toLocaleString()}`; }
        if (data.compensation_value) { const value = parseCurrency(data.compensation_value); if (value) return `$${value.toLocaleString()}`; }
        return 'Not specified';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            'open': { color: 'success', icon: 'fa-check-circle', text: 'Open' },
            'pending': { color: 'warning', icon: 'fa-clock', text: 'Pending' },
            'pending_signature': { color: 'info', icon: 'fa-file-signature', text: 'Pending Signature' },
            'closed': { color: 'secondary', icon: 'fa-times-circle', text: 'Closed' },
            'cancelled': { color: 'danger', icon: 'fa-ban', text: 'Cancelled' },
            'in_discussion': { color: 'info', icon: 'fa-comments', text: 'In Discussion' },
            'booked': { color: 'primary', icon: 'fa-handshake', text: 'Booked' },
        };
        const config = statusConfig[status] || statusConfig['pending'];
        return (
            <span className={`badge badge-${config.color} px-2 py-1`}>
                <i className={`fas ${config.icon} mr-1`}></i>
                {config.text}
            </span>
        );
    };

    // Contract Card Component
    const ContractCard = ({ contract }) => {
        const config = getCategoryConfig(contract?.contract_type?.industry);
        return (
            <div
                className="card contract-card shadow-sm h-100"
                onClick={() => handleContractClick(contract)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease', borderLeft: `4px solid ${config.color}` }}
            >
                <div className="card-header bg-white border-0 pb-0 pt-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center">
                            <div
                                className="icon-wrapper mr-2 d-flex align-items-center justify-content-center rounded-circle"
                                style={{ width: '35px', height: '35px', backgroundColor: config.bgColor }}
                            >
                                <i className={`${config.icon}`} style={{ color: config.color, fontSize: '0.9rem' }}></i>
                            </div>
                            <div>
                                <h6 className="mb-0 font-weight-bold text-truncate" style={{ maxWidth: '160px', fontSize: '0.85rem' }}>
                                    {contract?.contract_type?.contract_name || 'Unnamed'}
                                </h6>
                                <small className="text-muted">ID: #{contract?.id}</small>
                            </div>
                        </div>
                        {contract?.data?.urgent_need && (
                            <span className="badge badge-danger badge-pill" style={{ fontSize: '0.65rem' }}>Urgent</span>
                        )}
                    </div>
                </div>
                <div className="card-body py-2">
                    <div className="mb-2">{getStatusBadge(contract?.status)}</div>
                    <div className="mb-2">
                        <small className="text-muted"><i className="fas fa-user-tie mr-1"></i>Position</small>
                        <div className="font-weight-bold text-truncate" style={{ fontSize: '0.8rem' }}>{getPositions(contract)}</div>
                    </div>
                    <div className="mb-2">
                        <small className="text-muted"><i className="fas fa-map-marker-alt mr-1"></i>Location</small>
                        <div className="text-truncate" style={{ fontSize: '0.8rem' }}>{getLocation(contract)}</div>
                    </div>
                    <div className="mb-2">
                        <small className="text-muted"><i className="fas fa-calendar-alt mr-1"></i>Duration</small>
                        <div style={{ fontSize: '0.8rem' }}>{formatDate(contract?.start_date)}{contract?.end_date ? ` - ${formatDate(contract?.end_date)}` : ' - Ongoing'}</div>
                    </div>
                    <div>
                        <small className="text-muted"><i className="fas fa-dollar-sign mr-1"></i>Contract Value</small>
                        <div className="text-success font-weight-bold">{getCompensation(contract)}</div>
                    </div>
                </div>
                <div className="card-footer bg-light border-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{new Date(contract?.created_at).toLocaleDateString()}</small>
                        <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleContractClick(contract); }}>
                                <i className="fas fa-eye"></i>
                            </button>
                            {(contract?.status === 'booked' || contract?.status === 'cancelled') ? (
                                <button className="btn btn-outline-secondary btn-sm" disabled style={{ opacity: '0.5' }}><i className="fas fa-edit"></i></button>
                            ) : (
                                <Link to={`/${sessionUserRole}/${menu}/${contract.id}/edit`} className="btn btn-outline-warning btn-sm" onClick={(e) => e.stopPropagation()}>
                                    <i className="fas fa-edit"></i>
                                </Link>
                            )}
                            {contract?.status !== 'booked' && contract?.status !== 'cancelled' && (
                                <button className="btn btn-outline-danger btn-sm" onClick={(e) => handleOpenCancelModal(contract, e)}><i className="fas fa-ban"></i></button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 57px)' }}>
            {/* Page Header */}
            <div className="content-header py-3" style={{ backgroundColor: '#f4f6f9', marginTop: '25px' }}>
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                            <div
                                className="icon-wrapper mr-3 d-flex align-items-center justify-content-center rounded"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                <i className="fas fa-file-contract text-white" style={{ fontSize: '1.3rem' }}></i>
                            </div>
                            <div>
                                <h4 className="mb-0 font-weight-bold text-dark">My Contracts</h4>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    {totalContracts} total contract{totalContracts !== 1 ? 's' : ''} • Manage your healthcare agreements
                                </span>
                            </div>
                        </div>
                        <Link
                            to={`/${sessionUserRole}/${menu}/create`}
                            className="btn btn-primary px-4 shadow-sm"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            <i className="fa fa-plus mr-2"></i>
                            Add New Contract
                        </Link>
                    </div>
                </div>
            </div>

            <section className="content pt-0">
                <div className="container-fluid">

                    {/* Active Special Filter Banner */}
                    {isNoApplicationsFilter && (
                        <div
                            className="alert mb-3 d-flex align-items-center justify-content-between"
                            style={{
                                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                            }}
                        >
                            <div className="d-flex align-items-center">
                                <i className="fas fa-filter mr-2" style={{ fontSize: '1.2rem' }}></i>
                                <div>
                                    <strong>Filter Active:</strong> Showing contracts with no applications (open for 7+ days)
                                </div>
                            </div>
                            <button
                                className="btn btn-sm btn-light"
                                onClick={clearSpecialFilter}
                                style={{ fontWeight: '600' }}
                            >
                                <i className="fas fa-times mr-1"></i>
                                Clear Filter
                            </button>
                        </div>
                    )}

                    {/* Filter Section - Collapsible */}
                    <div className={`card shadow-sm mb-3 ${isNoApplicationsFilter ? 'border-warning' : ''}`} style={isNoApplicationsFilter ? { borderWidth: '2px' } : {}}>
                        <div className="card-header bg-white py-2" data-toggle="collapse" data-target="#filterCollapse" style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <i className={`fas fa-filter mr-2 ${isNoApplicationsFilter ? 'text-warning' : 'text-primary'}`}></i>
                                    <span className="font-weight-bold" style={{ fontSize: '0.9rem' }}>Filters</span>
                                    {isNoApplicationsFilter && (
                                        <span className="badge badge-warning ml-2" style={{ fontSize: '0.7rem' }}>
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            Active
                                        </span>
                                    )}
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="btn-group btn-group-sm mr-3" role="group">
                                        <button type="button" className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={(e) => { e.stopPropagation(); setViewMode('cards'); }}>
                                            <i className="fas fa-th-large"></i>
                                        </button>
                                        <button type="button" className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={(e) => { e.stopPropagation(); setViewMode('table'); }}>
                                            <i className="fas fa-list"></i>
                                        </button>
                                    </div>
                                    <i className="fas fa-chevron-down text-muted"></i>
                                </div>
                            </div>
                        </div>
                        <div className="collapse" id="filterCollapse">
                            <div className="card-body py-2">
                                <Filter setContracts={setContracts} useFilterHook={useFilterHook} />
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    {contracts && contracts.length > 0 ? (
                        <>
                            <div className="category-tabs d-flex flex-wrap mb-3" style={{ gap: '8px' }}>
                                {categories.map((category) => {
                                    const config = getCategoryConfig(category);
                                    const isActive = activeCategory === category;
                                    const count = groupedContracts[category]?.length || 0;

                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            className={`btn category-tab d-flex align-items-center ${isActive ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(category)}
                                            style={{
                                                backgroundColor: isActive ? config.color : config.bgColor,
                                                color: isActive ? 'white' : config.color,
                                                border: `2px solid ${config.color}`,
                                                borderRadius: '25px',
                                                padding: '6px 14px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s ease',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <i className={`${config.icon} mr-2`}></i>
                                            {category}
                                            <span
                                                className="badge badge-pill ml-2"
                                                style={{
                                                    backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : config.color,
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Contracts Panel */}
                            <div
                                className="contracts-panel p-3 rounded"
                                style={{
                                    backgroundColor: activeConfig?.bgColor || '#f8f9fa',
                                    border: `2px solid ${activeConfig?.color || '#dee2e6'}`,
                                    minHeight: '300px'
                                }}
                            >
                                {viewMode === 'cards' ? (
                                    <div className="row">
                                        {activeContracts.map((contract) => (
                                            <div className="col-xl-3 col-lg-4 col-md-6 mb-3" key={contract.id}>
                                                <ContractCard contract={contract} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover bg-white rounded">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Contract Type</th>
                                                    <th>Position</th>
                                                    <th>Location</th>
                                                    <th>Start</th>
                                                    <th>Status</th>
                                                    <th>Contract Value</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeContracts.map((contract) => (
                                                    <tr key={contract.id} onClick={() => handleContractClick(contract)} style={{ cursor: 'pointer' }}>
                                                        <td>#{contract.id}</td>
                                                        <td className="text-truncate" style={{ maxWidth: '150px' }}>{contract?.contract_type?.contract_name}</td>
                                                        <td className="text-truncate" style={{ maxWidth: '120px' }}>{getPositions(contract)}</td>
                                                        <td className="text-truncate" style={{ maxWidth: '100px' }}>{getLocation(contract)}</td>
                                                        <td>{formatDate(contract?.start_date)}</td>
                                                        <td>{getStatusBadge(contract?.status)}</td>
                                                        <td className="text-success font-weight-bold">{getCompensation(contract)}</td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                <button className="btn btn-outline-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleContractClick(contract); }}><i className="fas fa-eye"></i></button>
                                                                {(contract?.status !== 'booked' && contract?.status !== 'cancelled') && (
                                                                    <Link to={`/${sessionUserRole}/${menu}/${contract.id}/edit`} className="btn btn-outline-warning btn-sm" onClick={(e) => e.stopPropagation()}><i className="fas fa-edit"></i></Link>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeContracts.length === 0 && (
                                    <div className="text-center text-muted py-5">
                                        <i className="fas fa-inbox fa-3x mb-3"></i>
                                        <h6>No contracts in this category</h6>
                                        <p className="mb-0">Try selecting a different category or adjusting your filters</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="row mt-3">
                                <div className="col-6 col-md-3 mb-2">
                                    <div className="card shadow-sm border-left-success py-2">
                                        <div className="card-body py-2 px-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-check-circle text-success mr-2"></i>
                                                <div>
                                                    <div className="text-xs text-uppercase text-muted">Open</div>
                                                    <div className="h6 mb-0 font-weight-bold">{contracts.filter(c => c.status === 'open' || c.status === 'in_discussion').length}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3 mb-2">
                                    <div className="card shadow-sm border-left-warning py-2">
                                        <div className="card-body py-2 px-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-clock text-warning mr-2"></i>
                                                <div>
                                                    <div className="text-xs text-uppercase text-muted">Pending</div>
                                                    <div className="h6 mb-0 font-weight-bold">{contracts.filter(c => c.status === 'pending' || c.status === 'pending_signature').length}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3 mb-2">
                                    <div className="card shadow-sm border-left-info py-2">
                                        <div className="card-body py-2 px-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-handshake text-info mr-2"></i>
                                                <div>
                                                    <div className="text-xs text-uppercase text-muted">Booked</div>
                                                    <div className="h6 mb-0 font-weight-bold">{contracts.filter(c => c.status === 'booked').length}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3 mb-2">
                                    <div className="card shadow-sm border-left-secondary py-2">
                                        <div className="card-body py-2 px-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-times-circle text-secondary mr-2"></i>
                                                <div>
                                                    <div className="text-xs text-uppercase text-muted">Closed</div>
                                                    <div className="h6 mb-0 font-weight-bold">{contracts.filter(c => c.status === 'closed' || c.status === 'cancelled').length}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card shadow-sm">
                            <div className="card-body p-5 text-center">
                                <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                                <h5 className="text-muted">No Contracts Found</h5>
                                <p className="text-muted">There are no contracts to display. Click "Add New" to create one.</p>
                                <Link to={`/${sessionUserRole}/${menu}/create`} className="btn btn-primary mt-2">
                                    <i className="fa fa-plus mr-2"></i>Create Your First Contract
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Contract Modal */}
                    {ContractModel && show && showContractData && (
                        <ContractModel show={show} setShow={handleCloseModal} contract={showContractData} />
                    )}

                    {/* Cancel Confirmation Modal */}
                    <CancelConfirmationModal
                        open={showCancelModal}
                        onClose={() => { setShowCancelModal(false); setContractToCancel(null); }}
                        onConfirm={handleCancelContract}
                        title="Cancel Contract"
                        message={`Are you sure you want to cancel this contract${contractToCancel ? ` (#${contractToCancel.id})` : ''}?`}
                        type="contract"
                        id={contractToCancel?.id}
                    />
                </div>
            </section>

            <style jsx>{`
                .border-left-success { border-left: 4px solid #28a745 !important; }
                .border-left-warning { border-left: 4px solid #ffc107 !important; }
                .border-left-info { border-left: 4px solid #17a2b8 !important; }
                .border-left-secondary { border-left: 4px solid #6c757d !important; }
                .contract-card { border: 2px solid transparent; }
                .contract-card:hover { transform: translateY(-3px); box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important; border-color: #007bff; }
                .category-tab:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
                .category-tab:focus { outline: none; }
            `}</style>
        </div>
    );
}

export default View;
