import React, { useEffect } from "react";

const UserContractFilterForm = ({ setContracts, useFilterHook, onFiltersChange }) => {
    const {
        filters,
        handleChange,
        handleClear,
        handleSubmit,
        profile,
        positions = [],
        availableProvinces = [],
        availableSpecialties = [],
        availableContractTypes = [],
        loading,
    } = useFilterHook(setContracts);

    // Count active filters and notify parent
    useEffect(() => {
        if (onFiltersChange) {
            const activeFiltersCount = Object.values(filters).filter(
                (value) => value !== "" && value !== null && value !== undefined
            ).length;
            onFiltersChange(activeFiltersCount);
        }
    }, [filters, onFiltersChange]);

    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading filters...</span>
                </div>
            </div>
        );
    }

    // Contract status options
    const statusOptions = [
        { value: "open", label: "Open" },
        { value: "pending", label: "Pending" },
        { value: "booked", label: "Booked" },
        { value: "in_discussion", label: "In Discussion" },
        { value: "closed", label: "Closed" },
        { value: "cancelled", label: "Cancelled" },
    ];

    // Map contract duration types to readable labels
    const getContractTypeLabel = (type) => {
        const labels = {
            "temporary staffing": "Temporary Staffing",
            "permanent staffing": "Permanent Staffing",
            "Permanent_and_Temporary": "Permanent & Temporary"
        };
        return labels[type] || type;
    };

    return (
        <form onSubmit={handleSubmit} className="compact-filter-form">
            <style>{`
                .compact-filter-form .form-group {
                    margin-bottom: 0.5rem;
                }
                .compact-filter-form label {
                    font-size: 11px;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    color: #495057;
                }
                .compact-filter-form .form-control {
                    height: 32px;
                    font-size: 12px;
                    padding: 0.25rem 0.5rem;
                }
                .compact-filter-form .form-text {
                    display: none;
                }
                .compact-filter-form .alert {
                    padding: 0.5rem 0.75rem;
                    font-size: 11px;
                    margin-bottom: 0.5rem;
                }
                .compact-filter-form .btn {
                    padding: 0.35rem 0.75rem;
                    font-size: 12px;
                }
                .compact-filter-form i.fa-lg {
                    font-size: 1rem;
                }
            `}</style>
            <div className="row">
                {/* Contract ID Filter */}
                <div className="col-md-4 col-sm-6 mb-1">
                    <div className="form-group">
                        <label className="font-weight-bold">
                            <i className="fas fa-hashtag mr-2 text-primary"></i>
                            Contract ID
                        </label>
                        <input
                            type="number"
                            name="contract_id"
                            className="form-control"
                            placeholder="Enter contract ID"
                            value={filters.contract_id || ''}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>
                </div>

                {/* Regions Served - Province Filter */}
                {availableProvinces.length > 0 && (
                    <div className="col-md-4 col-sm-6 mb-1">
                        <div className="form-group">
                            <label className="font-weight-bold">
                                <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                                Region/Province
                            </label>
                            <select
                                name="province"
                                className="form-control"
                                value={filters.province}
                                onChange={handleChange}
                            >
                                <option value="">All Regions</option>
                                {availableProvinces.map((province, index) => (
                                    <option key={index} value={province}>
                                        {province}
                                    </option>
                                ))}
                            </select>
                            <small className="form-text text-muted">
                                Regions you serve: {availableProvinces.length}
                            </small>
                        </div>
                    </div>
                )}

                {/* Specialties Covered */}
                {availableSpecialties.length > 0 && (
                    <div className="col-md-4 col-sm-6 mb-1">
                        <div className="form-group">
                            <label className="font-weight-bold">
                                <i className="fas fa-stethoscope mr-2 text-primary"></i>
                                Specialty
                            </label>
                            <select
                                name="specialty"
                                className="form-control"
                                value={filters.specialty}
                                onChange={handleChange}
                            >
                                <option value="">All Specialties</option>
                                {availableSpecialties.map((specialty, index) => (
                                    <option key={index} value={specialty}>
                                        {specialty}
                                    </option>
                                ))}
                            </select>
                            <small className="form-text text-muted">
                                Specialties you cover: {availableSpecialties.length}
                            </small>
                        </div>
                    </div>
                )}

                {/* Positions (filtered by specialties) */}
                {positions.length > 0 && (
                    <div className="col-md-4 col-sm-6 mb-1">
                        <div className="form-group">
                            <label className="font-weight-bold">
                                <i className="fas fa-user-md mr-2 text-primary"></i>
                                Position
                            </label>
                            <select
                                name="position_id"
                                className="form-control"
                                value={filters.position_id}
                                onChange={handleChange}
                            >
                                <option value="">All Positions</option>
                                {positions.map((position) => (
                                    <option key={position.id} value={position.id}>
                                        {position.name}
                                        {position.professional_category?.name &&
                                            ` (${position.professional_category.name})`
                                        }
                                    </option>
                                ))}
                            </select>
                            <small className="form-text text-muted">
                                Positions in your specialties
                            </small>
                        </div>
                    </div>
                )}

                {/* Types of Contracts Managed */}
                {availableContractTypes.length > 0 && (
                    <div className="col-md-4 col-sm-6 mb-1">
                        <div className="form-group">
                            <label className="font-weight-bold">
                                <i className="fas fa-file-contract mr-2 text-primary"></i>
                                Contract Type
                            </label>
                            <select
                                name="contract_duration_type"
                                className="form-control"
                                value={filters.contract_duration_type}
                                onChange={handleChange}
                            >
                                <option value="">All Contract Types</option>
                                {availableContractTypes.map((type, index) => (
                                    <option key={index} value={type}>
                                        {getContractTypeLabel(type)}
                                    </option>
                                ))}
                            </select>
                            <small className="form-text text-muted">
                                Contract types you manage: {availableContractTypes.length}
                            </small>
                        </div>
                    </div>
                )}

                {/* Contract Status */}
                <div className="col-md-4 col-sm-6 mb-1">
                    <div className="form-group">
                        <label className="font-weight-bold">
                            <i className="fas fa-info-circle mr-2 text-primary"></i>
                            Status
                        </label>
                        <select
                            name="status"
                            className="form-control"
                            value={filters.status}
                            onChange={handleChange}
                        >
                            <option value="">All Statuses</option>
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date Range Filters */}
                <div className="col-md-4 col-sm-6 mb-1">
                    <div className="form-group">
                        <label className="font-weight-bold">
                            <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                            Start Date From
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            className="form-control"
                            value={filters.start_date}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="col-md-4 col-sm-6 mb-1">
                    <div className="form-group">
                        <label className="font-weight-bold">
                            <i className="fas fa-calendar-check mr-2 text-primary"></i>
                            End Date Until
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            className="form-control"
                            value={filters.end_date}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Month Filter */}
                <div className="col-md-4 col-sm-6 mb-1">
                    <div className="form-group">
                        <label className="font-weight-bold">
                            <i className="fas fa-calendar mr-2 text-primary"></i>
                            Filter by Month
                        </label>
                        <input
                            type="month"
                            name="month"
                            className="form-control"
                            value={filters.month || ''}
                            onChange={handleChange}
                        />
                        <small className="form-text text-muted" style={{ display: 'block !important' }}>
                            Show contracts starting in this month
                        </small>
                    </div>
                </div>

                {/* Rate Range Filters */}
                <div className="col-md-4 col-sm-6 mb-1">
                    <div className="form-group">
                        <label className="font-weight-bold">
                            <i className="fas fa-dollar-sign mr-2 text-primary"></i>
                            Min Rate ($)
                        </label>
                        <input
                            type="number"
                            name="min_rate"
                            className="form-control"
                            placeholder="e.g., 50"
                            value={filters.min_rate}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="col-md-4 col-sm-6 mb-1">
                    <div className="form-group">
                        <label className="font-weight-bold">
                            <i className="fas fa-dollar-sign mr-2 text-primary"></i>
                            Max Rate ($)
                        </label>
                        <input
                            type="number"
                            name="max_rate"
                            className="form-control"
                            placeholder="e.g., 200"
                            value={filters.max_rate}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                {/* Special Filter: No Applications */}
                <div className="col-md-4 col-sm-6 mb-1">
                    <div className="form-group">
                        <label className="font-weight-bold">
                            <i className="fas fa-exclamation-triangle mr-2 text-warning"></i>
                            Special Filter
                        </label>
                        <select
                            name="filter"
                            className={`form-control ${filters.filter === 'no_applications' ? 'border-warning' : ''}`}
                            value={filters.filter || ''}
                            onChange={handleChange}
                            style={filters.filter === 'no_applications' ? { borderWidth: '2px', backgroundColor: '#fff8e1' } : {}}
                        >
                            <option value="">None</option>
                            <option value="no_applications">No Applications (7+ days)</option>
                        </select>
                        <small className="form-text text-muted" style={{ display: 'block', fontSize: '10px' }}>
                            Open contracts with no applications
                        </small>
                    </div>
                </div>
            </div>

            {/* Profile Info Banner */}
            {profile && (
                <div className="alert alert-info mb-3" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="fas fa-info-circle fa-lg mr-2"></i>
                        <div>
                            <strong>Profile-Based Filters:</strong>
                            <span className="ml-2">
                                Showing filters for {availableSpecialties.length} {availableSpecialties.length === 1 ? 'specialty' : 'specialties'},
                                {' '}{availableProvinces.length} {availableProvinces.length === 1 ? 'region' : 'regions'},
                                and {availableContractTypes.length} contract {availableContractTypes.length === 1 ? 'type' : 'types'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            className="btn btn-outline-secondary mr-2"
                            onClick={handleClear}
                        >
                            <i className="fas fa-times mr-2"></i>
                            Clear Filters
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <i className="fas fa-search mr-2"></i>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default UserContractFilterForm;