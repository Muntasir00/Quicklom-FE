import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useViewContractApplications } from "@hooks/professional/contract-applications/useViewContractApplications";
import Filter from "@components/forms/ContractApplicationFilterForm";
import { CONTRACT_APPLICATION_STATUS } from "@constants/ContractApplicationConstants";
import "./ApplicationsStyles.css";

const View = () => {
    const {
        sessionUserRole,
        rows,
        show,
        setShow,
        ContractModel,
        showContractData,
        useFilterHook,
        setApplications,
        handleShowModal,
        updateContractApplicationsStatus,
        initializeStateHelper,
    } = useViewContractApplications();

    const [expandedContracts, setExpandedContracts] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    // Calculate statistics
    const totalApplications = rows.length;
    const pendingApplications = rows.filter(r => r.status?.toLowerCase() === 'pending').length;
    const acceptedApplications = rows.filter(r => r.status?.toLowerCase() === 'accepted' || r.status?.toLowerCase() === 'approved').length;
    const rejectedApplications = rows.filter(r => r.status?.toLowerCase() === 'rejected').length;

    // Filter rows based on status
    const filteredRows = useMemo(() => {
        if (statusFilter === "all") return rows;
        if (statusFilter === "pending") return rows.filter(r => r.status?.toLowerCase() === 'pending');
        if (statusFilter === "accepted") return rows.filter(r => ['accepted', 'approved'].includes(r.status?.toLowerCase()));
        if (statusFilter === "rejected") return rows.filter(r => r.status?.toLowerCase() === 'rejected');
        return rows;
    }, [rows, statusFilter]);

    // Group applications by contract
    const groupedByContract = useMemo(() => {
        const groups = {};
        filteredRows.forEach(row => {
            const contractId = row.contract_id;
            if (!groups[contractId]) {
                groups[contractId] = {
                    contract: row.contract,
                    applications: []
                };
            }
            groups[contractId].applications.push(row);
        });
        return Object.values(groups);
    }, [filteredRows]);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { label: "Pending", class: "pending", icon: "fas fa-clock" },
            approved: { label: "Accepted", class: "accepted", icon: "fas fa-check-circle" },
            accepted: { label: "Accepted", class: "accepted", icon: "fas fa-check-circle" },
            rejected: { label: "Rejected", class: "rejected", icon: "fas fa-times-circle" },
            withdrawn: { label: "Withdrawn", class: "withdrawn", icon: "fas fa-undo" }
        };
        return statusMap[status?.toLowerCase()] || { label: status || "Unknown", class: "unknown", icon: "fas fa-question-circle" };
    };

    const getContractStatusInfo = (status) => {
        const statusMap = {
            open: { label: "Open", class: "open" },
            closed: { label: "Closed", class: "closed" },
            cancelled: { label: "Cancelled", class: "cancelled" },
            pending: { label: "Pending", class: "pending" },
            booked: { label: "Booked", class: "booked" }
        };
        return statusMap[status?.toLowerCase()] || { label: status || "Unknown", class: "unknown" };
    };

    const handleWithdrawApplication = async (applicationId, currentStatus, contractStatus, contractStartDate) => {
        if (currentStatus === CONTRACT_APPLICATION_STATUS.WITHDRAWN) return;

        // Check if cancellation fee may apply (accepted + booked + within 48 hours of start)
        const isWithin48Hours = contractStartDate &&
            (new Date(contractStartDate) - new Date()) <= 48 * 60 * 60 * 1000;
        const mayHaveFee = currentStatus?.toLowerCase() === 'accepted' &&
            contractStatus?.toLowerCase() === 'booked' &&
            isWithin48Hours;

        try {
            const application = { id: applicationId, status: CONTRACT_APPLICATION_STATUS.WITHDRAWN };
            const status = await updateContractApplicationsStatus({ application, mayHaveFee });
            if (status) await initializeStateHelper();
        } catch (error) {
            console.error("Error withdrawing application:", error);
        }
    };

    const toggleContract = (contractId) => {
        setExpandedContracts(prev => ({
            ...prev,
            [contractId]: !prev[contractId]
        }));
    };

    const expandAll = () => {
        const allExpanded = {};
        groupedByContract.forEach(({ contract, applications }) => {
            const id = contract?.id || applications[0]?.contract_id;
            allExpanded[id] = true;
        });
        setExpandedContracts(allExpanded);
    };

    const collapseAll = () => {
        setExpandedContracts({});
    };

    const getLocation = (contract) => {
        const data = contract?.data || {};
        const parts = [];
        if (data.city) parts.push(data.city);
        if (data.state) parts.push(data.state);
        if (data.location) return data.location;
        if (data.facility_name) return data.facility_name;
        return parts.length > 0 ? parts.join(", ") : null;
    };

    return (
        <div className="content-wrapper applications-page">
            {/* Header */}
            <div className="applications-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="header-icon">
                            <i className="fas fa-paper-plane"></i>
                        </div>
                        <div className="header-text">
                            <h1>My Applications</h1>
                            <p>{totalApplications} application{totalApplications !== 1 ? 's' : ''} submitted</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <Link to={`/${sessionUserRole}/published-contracts`} className="browse-jobs-btn">
                            <i className="fas fa-search"></i>
                            Browse Jobs
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div
                        className={`stat-card blue ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        <i className="fas fa-folder"></i>
                        <div className="stat-info">
                            <span className="stat-value">{totalApplications}</span>
                            <span className="stat-label">Total</span>
                        </div>
                    </div>
                    <div
                        className={`stat-card yellow ${statusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        <i className="fas fa-clock"></i>
                        <div className="stat-info">
                            <span className="stat-value">{pendingApplications}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                    <div
                        className={`stat-card green ${statusFilter === 'accepted' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('accepted')}
                    >
                        <i className="fas fa-check-circle"></i>
                        <div className="stat-info">
                            <span className="stat-value">{acceptedApplications}</span>
                            <span className="stat-label">Accepted</span>
                        </div>
                    </div>
                    <div
                        className={`stat-card red ${statusFilter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('rejected')}
                    >
                        <i className="fas fa-times-circle"></i>
                        <div className="stat-info">
                            <span className="stat-value">{rejectedApplications}</span>
                            <span className="stat-label">Rejected</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="applications-toolbar">
                <div className="toolbar-left">
                    <button
                        className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <i className="fas fa-filter"></i>
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>
                    <span className="results-count">
                        {groupedByContract.length} contract{groupedByContract.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="toolbar-right">
                    <button className="toolbar-btn" onClick={expandAll} title="Expand All">
                        <i className="fas fa-expand-alt"></i>
                    </button>
                    <button className="toolbar-btn" onClick={collapseAll} title="Collapse All">
                        <i className="fas fa-compress-alt"></i>
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="filters-section">
                    <Filter setApplications={setApplications} useFilterHook={useFilterHook} />
                </div>
            )}

            {/* Applications Content */}
            <div className="applications-content">
                {groupedByContract.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-inbox"></i>
                        </div>
                        <h3>No applications found</h3>
                        <p>
                            {statusFilter !== 'all'
                                ? `No ${statusFilter} applications. Try changing the filter.`
                                : "You haven't applied to any jobs yet. Start exploring opportunities!"
                            }
                        </p>
                        <Link to={`/${sessionUserRole}/published-contracts`} className="browse-btn">
                            <i className="fas fa-search"></i>
                            Browse Available Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="contracts-list">
                        {groupedByContract.map(({ contract, applications }) => {
                            const contractId = contract?.id || applications[0]?.contract_id;
                            const isExpanded = expandedContracts[contractId];
                            const jobTitle = contract?.data?.job_title || contract?.contract_type?.contract_name || `Contract #${contractId}`;
                            const contractStatus = getContractStatusInfo(contract?.status);
                            const location = getLocation(contract);
                            const latestApp = applications[0];

                            return (
                                <div key={contractId} className={`contract-card ${isExpanded ? 'expanded' : ''}`}>
                                    {/* Contract Header */}
                                    <div className="contract-header" onClick={() => toggleContract(contractId)}>
                                        <div className="contract-info">
                                            <div className="contract-title-row">
                                                <span className="contract-id">#{contractId}</span>
                                                <h3 className="contract-title">{jobTitle}</h3>
                                                <span className={`contract-status ${contractStatus.class}`}>
                                                    {contractStatus.label}
                                                </span>
                                            </div>
                                            <div className="contract-meta">
                                                {contract?.published_by?.name && (
                                                    <span className="meta-item">
                                                        <i className="fas fa-building"></i>
                                                        {contract.published_by.name}
                                                    </span>
                                                )}
                                                {location && (
                                                    <span className="meta-item">
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        {location}
                                                    </span>
                                                )}
                                                <span className="meta-item">
                                                    <i className="fas fa-calendar"></i>
                                                    {formatDate(contract?.start_date)} - {formatDate(contract?.end_date)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="contract-summary">
                                            <div className="app-count">
                                                <span className="count">{applications.length}</span>
                                                <span className="label">Application{applications.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} expand-icon`}></i>
                                        </div>
                                    </div>

                                    {/* Applications List */}
                                    {isExpanded && (
                                        <div className="applications-list">
                                            {applications.map((app) => {
                                                const statusInfo = getStatusInfo(app.status);
                                                // Can withdraw if: not already withdrawn and not rejected
                                                // Note: Withdrawal from booked contracts IS allowed but may incur a cancellation fee (handled by backend)
                                                const canWithdraw = app.status !== CONTRACT_APPLICATION_STATUS.WITHDRAWN &&
                                                    app.status?.toLowerCase() !== 'rejected';
                                                // Check if withdrawal may incur a fee (accepted + booked contract + within 48 hours of start)
                                                const isWithin48Hours = contract?.start_date &&
                                                    (new Date(contract.start_date) - new Date()) <= 48 * 60 * 60 * 1000;
                                                const mayHaveFee = app.status?.toLowerCase() === 'accepted' &&
                                                    contract?.status?.toLowerCase() === 'booked' &&
                                                    isWithin48Hours;

                                                return (
                                                    <div key={app.id} className={`application-item ${statusInfo.class}`}>
                                                        <div className="app-main">
                                                            <div className="app-header">
                                                                <span className="app-id">Application #{app.id}</span>
                                                                <span className={`app-status ${statusInfo.class}`}>
                                                                    <i className={statusInfo.icon}></i>
                                                                    {statusInfo.label}
                                                                </span>
                                                            </div>
                                                            <div className="app-details">
                                                                <div className="detail-row">
                                                                    <i className="fas fa-clock"></i>
                                                                    <span>Applied: {formatDateTime(app.applied_at || app.created_at)}</span>
                                                                </div>
                                                                {app.data?.proposed_candidates && app.data.proposed_candidates.length > 0 && (
                                                                    <div className="proposed-candidates">
                                                                        <span className="candidates-label">Proposed Candidates:</span>
                                                                        <div className="candidates-list">
                                                                            {app.data.proposed_candidates.map((candidate, idx) => (
                                                                                <span key={idx} className="candidate-tag">
                                                                                    <i className="fas fa-user"></i>
                                                                                    {candidate.name}
                                                                                    {candidate.position && ` - ${candidate.position}`}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="app-actions">
                                                            <button
                                                                className="btn-view"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const contractName = contract?.contract_type?.contract_name || "";
                                                                    if (contractId && contractName) {
                                                                        handleShowModal(contractId, contractName);
                                                                    }
                                                                }}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                                View Contract
                                                            </button>
                                                            {canWithdraw ? (
                                                                <button
                                                                    className={`btn-withdraw ${mayHaveFee ? 'has-fee-warning' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleWithdrawApplication(app.id, app.status, contract?.status, contract?.start_date);
                                                                    }}
                                                                    title={mayHaveFee ? "Withdrawal may incur a cancellation fee" : ""}
                                                                >
                                                                    <i className="fas fa-undo"></i>
                                                                    Withdraw {mayHaveFee && <i className="fas fa-exclamation-triangle ms-1" style={{color: '#ffc107'}}></i>}
                                                                </button>
                                                            ) : app.status === CONTRACT_APPLICATION_STATUS.WITHDRAWN ? (
                                                                <span className="withdrawn-label">
                                                                    <i className="fas fa-ban"></i>
                                                                    Withdrawn
                                                                </span>
                                                            ) : (
                                                                <span className="rejected-label" title="This application was rejected">
                                                                    <i className="fas fa-times-circle"></i>
                                                                    Rejected
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
