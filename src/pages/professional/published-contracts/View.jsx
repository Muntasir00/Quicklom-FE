import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useViewPublishedContracts } from "@hooks/professional/published-contracts/useViewPublishedContracts";
import Filter from "@components/forms/UserContractFilterForm";
import "./FindJobsStyles.css";

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
    const rowsPerPage = 12;
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    const currentRows = rows.slice(startIdx, endIdx);

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
            open: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
            pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
            cancelled: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
            in_discussion: { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
            booked: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
            closed: { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" }
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

    return (
        <div className="content-wrapper find-jobs-page">
            {/* Header */}
            <div className="find-jobs-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="header-icon">
                            <i className="fas fa-search"></i>
                        </div>
                        <div className="header-text">
                            <h1>Find Jobs</h1>
                            <p>{totalJobs} available opportunities</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <Link to={`/${sessionUserRole}/contract-applications`} className="my-apps-btn">
                            <i className="fas fa-paper-plane"></i>
                            My Applications
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card blue">
                        <i className="fas fa-briefcase"></i>
                        <div className="stat-info">
                            <span className="stat-value">{totalJobs}</span>
                            <span className="stat-label">Total Jobs</span>
                        </div>
                    </div>
                    <div className="stat-card green">
                        <i className="fas fa-door-open"></i>
                        <div className="stat-info">
                            <span className="stat-value">{activeJobs}</span>
                            <span className="stat-label">Open Now</span>
                        </div>
                    </div>
                    <div className="stat-card purple">
                        <i className="fas fa-check-circle"></i>
                        <div className="stat-info">
                            <span className="stat-value">{rows.filter(r => r.user_application?.has_applied).length}</span>
                            <span className="stat-label">Applied</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="jobs-toolbar">
                <div className="toolbar-left">
                    <button
                        className={`filter-toggle-btn ${showFilters ? 'active' : ''} ${appliedFiltersCount > 0 ? 'has-filters' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <i className="fas fa-filter"></i>
                        {showFilters ? 'Hide Filters' : 'Filters'}
                        {appliedFiltersCount > 0 && <span className="filter-count">{appliedFiltersCount}</span>}
                    </button>
                </div>
                <div className="toolbar-right">
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                            onClick={() => setViewMode('cards')}
                            title="Card View"
                        >
                            <i className="fas fa-th-large"></i>
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <i className="fas fa-list"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="filters-section">
                    <Filter
                        setContracts={setContracts}
                        useFilterHook={useFilterHook}
                        onFiltersChange={(count) => setAppliedFiltersCount(count)}
                    />
                </div>
            )}

            {/* Jobs Content */}
            <div className="jobs-content">
                {rows.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-search"></i>
                        </div>
                        <h3>No jobs found</h3>
                        <p>Try adjusting your filters or check back later for new opportunities</p>
                    </div>
                ) : viewMode === 'cards' ? (
                    <div className="jobs-grid">
                        {currentRows.map((job) => {
                            const hasApplied = job.user_application?.has_applied;
                            const statusStyle = getStatusColor(job.status);
                            const contractValue = getContractValue(job);
                            const location = getLocation(job);
                            const positions = getPositions(job);
                            const duration = getDuration(job);
                            const data = job.data || {};

                            return (
                                <div key={job.id} className={`job-card ${hasApplied ? 'applied' : ''}`}>
                                    {/* Card Header */}
                                    <div className="job-card-header">
                                        <div className="job-id">#{job.id}</div>
                                        <div
                                            className="job-status"
                                            style={{
                                                background: statusStyle.bg,
                                                color: statusStyle.color,
                                                border: `1px solid ${statusStyle.border}`
                                            }}
                                        >
                                            {job.status?.replace("_", " ")}
                                        </div>
                                    </div>

                                    {/* Contract Type */}
                                    <h3 className="job-title">{job.contract_type?.contract_name || "Contract"}</h3>

                                    {/* Publisher */}
                                    <div className="job-publisher">
                                        <i className="fas fa-building"></i>
                                        <span>{job.published_by?.name || "Unknown Publisher"}</span>
                                    </div>

                                    {/* Positions */}
                                    {positions.length > 0 && (
                                        <div className="job-positions">
                                            <div className="section-label">
                                                <i className="fas fa-user-md"></i>
                                                Positions
                                            </div>
                                            <div className="positions-list">
                                                {positions.slice(0, 3).map((pos, idx) => (
                                                    <span key={idx} className="position-tag">{pos}</span>
                                                ))}
                                                {positions.length > 3 && (
                                                    <span className="position-tag more">+{positions.length - 3}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {location && (
                                        <div className="job-location">
                                            <i className="fas fa-map-marker-alt"></i>
                                            <span>{location}</span>
                                        </div>
                                    )}

                                    {/* Contract Details Grid */}
                                    <div className="job-details-grid">
                                        {/* Dates */}
                                        <div className="detail-item">
                                            <i className="fas fa-calendar-alt"></i>
                                            <div className="detail-content">
                                                <span className="detail-label">Duration</span>
                                                <span className="detail-value">
                                                    {formatDate(job.start_date)} - {formatDate(job.end_date)}
                                                    {duration && <span className="duration-badge">{duration}</span>}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contract Value */}
                                        {contractValue && (
                                            <div className="detail-item highlight">
                                                <i className="fas fa-dollar-sign"></i>
                                                <div className="detail-content">
                                                    <span className="detail-label">Contract Value</span>
                                                    <span className="detail-value money">{formatCurrency(contractValue) || contractValue}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Info from data */}
                                        {data.work_type && (
                                            <div className="detail-item">
                                                <i className="fas fa-clock"></i>
                                                <div className="detail-content">
                                                    <span className="detail-label">Work Type</span>
                                                    <span className="detail-value">{data.work_type}</span>
                                                </div>
                                            </div>
                                        )}

                                        {data.specialty && (
                                            <div className="detail-item">
                                                <i className="fas fa-stethoscope"></i>
                                                <div className="detail-content">
                                                    <span className="detail-label">Specialty</span>
                                                    <span className="detail-value">{data.specialty}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="job-card-footer">
                                        {hasApplied ? (
                                            <div className="applied-badge">
                                                <i className="fas fa-check-circle"></i>
                                                Applied
                                            </div>
                                        ) : (
                                            <button
                                                className="apply-btn"
                                                onClick={() => handleApplyToContract(job.id)}
                                            >
                                                <i className="fas fa-paper-plane"></i>
                                                Apply Now
                                            </button>
                                        )}
                                        <button
                                            className="view-btn"
                                            onClick={() => handleShowModal(job.id, job.contract_type?.contract_name)}
                                        >
                                            <i className="fas fa-eye"></i>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* List View */
                    <div className="jobs-list">
                        {currentRows.map((job) => {
                            const hasApplied = job.user_application?.has_applied;
                            const statusStyle = getStatusColor(job.status);
                            const contractValue = getContractValue(job);
                            const location = getLocation(job);
                            const positions = getPositions(job);

                            return (
                                <div key={job.id} className={`job-list-item ${hasApplied ? 'applied' : ''}`}>
                                    <div className="list-item-main">
                                        <div className="list-item-header">
                                            <span className="job-id">#{job.id}</span>
                                            <h3 className="job-title">{job.contract_type?.contract_name || "Contract"}</h3>
                                            <div
                                                className="job-status"
                                                style={{
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color,
                                                    border: `1px solid ${statusStyle.border}`
                                                }}
                                            >
                                                {job.status?.replace("_", " ")}
                                            </div>
                                        </div>
                                        <div className="list-item-meta">
                                            <span><i className="fas fa-building"></i> {job.published_by?.name || "-"}</span>
                                            {location && <span><i className="fas fa-map-marker-alt"></i> {location}</span>}
                                            <span><i className="fas fa-calendar"></i> {formatDate(job.start_date)} - {formatDate(job.end_date)}</span>
                                            {contractValue && <span className="value"><i className="fas fa-dollar-sign"></i> {formatCurrency(contractValue) || contractValue}</span>}
                                        </div>
                                        {positions.length > 0 && (
                                            <div className="list-item-positions">
                                                {positions.slice(0, 4).map((pos, idx) => (
                                                    <span key={idx} className="position-tag">{pos}</span>
                                                ))}
                                                {positions.length > 4 && <span className="position-tag more">+{positions.length - 4}</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="list-item-actions">
                                        {hasApplied ? (
                                            <div className="applied-badge">
                                                <i className="fas fa-check-circle"></i> Applied
                                            </div>
                                        ) : (
                                            <button className="apply-btn" onClick={() => handleApplyToContract(job.id)}>
                                                <i className="fas fa-paper-plane"></i> Apply
                                            </button>
                                        )}
                                        <button className="view-btn" onClick={() => handleShowModal(job.id, job.contract_type?.contract_name)}>
                                            <i className="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {rows.length > 0 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Showing {startIdx + 1} to {Math.min(endIdx, rows.length)} of {rows.length} jobs
                        </div>
                        <div className="pagination-controls">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="page-btn"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="page-btn"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
