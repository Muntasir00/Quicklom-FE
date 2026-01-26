import React, { useState, useMemo } from "react";
import { useViewPublishedContracts } from "@hooks/institute/published-contracts/useViewPublishedContracts";
import ContractApplicationAdditionalInformationModal from "@components/modals/ContractApplicationAdditionalInformationModal";
import Filter from "@components/forms/UserContractFilterForm";

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
        menu,
        action,
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
        return { temporary, permanent, other };
    }, [filteredRows]);

    // Industry counts
    const industryCounts = useMemo(() => {
        const counts = { all: rows.length };
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

    // Contract Card Component
    const ContractCard = ({ contract, durationType }) => {
        const typeConfig = CONTRACT_TYPE_COLORS[durationType] || CONTRACT_TYPE_COLORS.temporary;
        const hasApplied = contract?.user_application?.has_applied;
        const totalValue = getTotalContractValue(contract);
        const positionSought = getPositionSought(contract);
        const fullLocation = getFullLocation(contract);

        return (
            <div
                onClick={() => handleShowModal(contract.id, contract.contract_type?.contract_name)}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: `2px solid ${typeConfig.border}20`,
                    borderLeft: `4px solid ${typeConfig.border}`,
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{
                                background: typeConfig.badge,
                                color: 'white',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '700',
                                textTransform: 'uppercase'
                            }}>
                                {typeConfig.label}
                            </span>
                            <span style={{
                                background: getStatusColor(contract.status),
                                color: 'white',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '700',
                                textTransform: 'uppercase'
                            }}>
                                {contract.status?.replace('_', ' ')}
                            </span>
                            {totalValue && (
                                <span style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '700'
                                }}>
                                    {formatCurrency(totalValue)}
                                </span>
                            )}
                        </div>
                        <h6 style={{ margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '14px' }}>
                            {contract.contract_type?.contract_name || 'Contract'}
                        </h6>
                    </div>
                    <span style={{ fontWeight: '800', color: activeIndustryData?.color || '#667eea', fontSize: '12px' }}>
                        #{contract.id}
                    </span>
                </div>

                {/* Position Sought */}
                {positionSought && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        background: '#f0f9ff',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px'
                    }}>
                        <i className="fas fa-user-md" style={{ color: '#0369a1', fontSize: '11px' }}></i>
                        <span style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600' }}>
                            {positionSought}
                        </span>
                    </div>
                )}

                {/* Full Location */}
                {fullLocation && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                    }}>
                        <i className="fas fa-map-marker-alt" style={{ color: '#dc2626', fontSize: '11px', marginTop: '2px' }}></i>
                        <span style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.4' }}>
                            {fullLocation}
                        </span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-building" style={{ color: '#6b7280', fontSize: '11px' }}></i>
                        <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>
                            {contract.published_by?.name || 'Unknown'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-calendar" style={{ color: '#6b7280', fontSize: '11px' }}></i>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                            {contract.start_date ? formatDate(contract.start_date) : '-'} → {contract.end_date ? formatDate(contract.end_date) : '-'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        {hasApplied ? (
                            <span style={{
                                background: '#dcfce7',
                                color: '#166534',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                <i className="fas fa-check-circle"></i> Applied
                            </span>
                        ) : (
                            <span style={{
                                background: '#f3f4f6',
                                color: '#6b7280',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600'
                            }}>
                                Not Applied
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!hasApplied && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedContractId(contract.id);
                                    setShowForm(true);
                                }}
                                style={{
                                    background: activeIndustryData?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <i className="fas fa-paper-plane"></i> Apply
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Contract Section Component
    const ContractSection = ({ title, contracts, durationType, icon }) => {
        const typeConfig = CONTRACT_TYPE_COLORS[durationType];
        if (contracts.length === 0) return null;

        return (
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: `2px solid ${typeConfig?.border || '#e5e7eb'}20`
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: `${typeConfig?.badge || '#667eea'}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className={icon} style={{ color: typeConfig?.badge || '#667eea', fontSize: '16px' }}></i>
                    </div>
                    <div>
                        <h5 style={{ margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '16px' }}>
                            {title}
                        </h5>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {contracts.length} contract{contracts.length !== 1 ? 's' : ''} available
                        </span>
                    </div>
                </div>
                <div>
                    {contracts.map(contract => (
                        <ContractCard key={contract.id} contract={contract} durationType={durationType} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="content-wrapper" style={{ minHeight: "calc(100vh - 57px)", background: '#f8fafc' }}>
            {/* Page Header */}
            <div className="content-header py-3" style={{ backgroundColor: '#f4f6f9', marginTop: '15px' }}>
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                            <div
                                className="icon-wrapper mr-3 d-flex align-items-center justify-content-center rounded"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: activeIndustryData?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: `0 4px 12px ${activeIndustryData?.color || '#667eea'}40`
                                }}
                            >
                                <i className={activeIndustryData?.icon || 'fas fa-briefcase'} style={{ fontSize: '1.3rem', color: 'white' }}></i>
                            </div>
                            <div>
                                <h4 className="mb-0 font-weight-bold text-dark">Job Offers</h4>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    {filteredRows.length} available position{filteredRows.length !== 1 ? 's' : ''} • Browse by industry
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn ${appliedFiltersCount > 0 ? 'btn-warning' : 'btn-outline-secondary'}`}
                            style={{
                                borderRadius: '8px',
                                position: 'relative',
                                background: appliedFiltersCount > 0 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : undefined,
                                border: appliedFiltersCount > 0 ? 'none' : undefined,
                                color: appliedFiltersCount > 0 ? 'white' : undefined,
                                fontWeight: appliedFiltersCount > 0 ? '600' : undefined,
                                boxShadow: appliedFiltersCount > 0 ? '0 4px 12px rgba(245, 158, 11, 0.4)' : undefined
                            }}
                        >
                            <i className={`fas fa-filter mr-2`}></i>
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                            {appliedFiltersCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    border: '2px solid white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    {appliedFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <section className="content pt-0" style={{ padding: '1rem' }}>
                <div className="container-fluid">
                    {/* Filter Section */}
                    {showFilters && (
                        <div style={{ marginBottom: '1rem' }}>
                            <Filter
                                setContracts={setContracts}
                                useFilterHook={useFilterHook}
                                onFiltersChange={(count) => setAppliedFiltersCount(count)}
                            />
                        </div>
                    )}

                    {/* Industry Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        overflowX: 'auto',
                        paddingBottom: '0.5rem'
                    }}>
                        {INDUSTRIES.map(industry => (
                            <button
                                key={industry.id}
                                onClick={() => {
                                    setActiveIndustry(industry.id);
                                    setCurrentPage(1);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '10px',
                                    border: activeIndustry === industry.id ? 'none' : '2px solid #e5e7eb',
                                    background: activeIndustry === industry.id ? industry.gradient : 'white',
                                    color: activeIndustry === industry.id ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease',
                                    boxShadow: activeIndustry === industry.id ? `0 4px 12px ${industry.color}40` : 'none'
                                }}
                            >
                                <i className={industry.icon} style={{ fontSize: '14px' }}></i>
                                {industry.name}
                                <span style={{
                                    background: activeIndustry === industry.id ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                }}>
                                    {industryCounts[industry.id] || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    {filteredRows.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                            <i className={activeIndustryData?.icon || 'fas fa-briefcase'} style={{
                                fontSize: '48px',
                                color: '#d1d5db',
                                marginBottom: '1rem'
                            }}></i>
                            <h5 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No Job Offers Available</h5>
                            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                                There are no {activeIndustry !== 'all' ? activeIndustryData?.name : ''} positions available at the moment.
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {/* Temporary Contracts Column */}
                            <div>
                                <ContractSection
                                    title="Temporary Positions"
                                    contracts={groupedContracts.temporary}
                                    durationType="temporary"
                                    icon="fas fa-clock"
                                />
                            </div>

                            {/* Permanent Contracts Column */}
                            <div>
                                <ContractSection
                                    title="Permanent Positions"
                                    contracts={groupedContracts.permanent}
                                    durationType="permanent"
                                    icon="fas fa-user-tie"
                                />
                            </div>
                        </div>
                    )}

                    {/* Other contracts (if any don't match temporary/permanent) */}
                    {groupedContracts.other.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <ContractSection
                                title="Other Positions"
                                contracts={groupedContracts.other}
                                durationType="temporary"
                                icon="fas fa-briefcase"
                            />
                        </div>
                    )}
                </div>
            </section>

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
        </div>
    );
};

export default View;
