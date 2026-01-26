/**
 * Professional Agreement Dashboard
 * Location: src/pages/professional/AgreementDashboard.jsx
 *
 * Enhanced version with improved design and Bootstrap layout
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AgreementService from '@services/professional/professional_agreement_service';
import { getCurrentUserService } from '@services/user/AuthService';

const AgreementDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // URL param filter for notification navigation
    const agreementIdParam = searchParams.get("agreement_id");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [filteredAgreements, setFilteredAgreements] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        pendingMySignature: 0,
        waitingPublisher: 0,
        signed: 0
    });

    useEffect(() => {
        loadAgreements();
        // Refresh every 30 seconds
        const interval = setInterval(loadAgreements, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        filterAgreements();
    }, [statusFilter, searchTerm, agreements, agreementIdParam]);

    const loadAgreements = async () => {
        try {
            setLoading(true);
            setError(null);

            const user = await getCurrentUserService();
            setCurrentUser(user);

            const response = await AgreementService.getMyAgreements();
            const agreementsList = response.agreements || [];
            setAgreements(agreementsList);

            calculateStats(agreementsList);

        } catch (err) {
            console.error('Error loading agreements:', err);
            setError('Failed to load agreements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (agreementsList) => {
        const total = agreementsList.length;

        // Count both signature-required and fees-required as "action required"
        const pendingMySignature = agreementsList.filter(a =>
            AgreementService.isPendingMySignature(a) || AgreementService.requiresFeesInput(a)
        ).length;

        const waitingPublisher = agreementsList.filter(a =>
            a.agency_signed && !a.client_signed
        ).length;

        const signed = agreementsList.filter(a =>
            a.status === 'fully_signed'
        ).length;

        setStats({ total, pendingMySignature, waitingPublisher, signed });
    };

    const filterAgreements = () => {
        let filtered = [...agreements];

        // Filter by agreement_id from URL (notification navigation)
        if (agreementIdParam) {
            const agreementId = parseInt(agreementIdParam, 10);
            filtered = filtered.filter(a => a.id === agreementId);
            setFilteredAgreements(filtered);
            return; // Skip other filters when navigating from notification
        }

        if (statusFilter !== 'all') {
            if (statusFilter === 'pending_my_signature') {
                // Include both signature-required and fees-required
                filtered = filtered.filter(a =>
                    AgreementService.isPendingMySignature(a) || AgreementService.requiresFeesInput(a)
                );
            } else if (statusFilter === 'waiting_publisher') {
                filtered = filtered.filter(a =>
                    a.agency_signed && !a.client_signed
                );
            } else {
                filtered = filtered.filter(a => a.status === statusFilter);
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.agreement_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.agreement_data?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.agreement_data?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAgreements(filtered);
    };

    const handleViewAgreement = (agreementId) => {
        navigate(`/professional/agreements/${agreementId}`);
    };

    const handleSignAgreement = (agreementId) => {
        navigate(`/professional/agreements/${agreementId}/sign`);
    };

    const handleDownloadPDF = async (agreementId, agreementNumber) => {
        try {
            await AgreementService.downloadAgreementPDF(agreementId, agreementNumber);
        } catch (err) {
            alert('Failed to download PDF. Please try again.');
        }
    };

    const handlePreviewAgreement = (agreement) => {
        AgreementService.previewAgreement(agreement.id, agreement.is_custom_agreement);
    };

    if (loading && agreements.length === 0) {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <h1 className="m-0">
                            <i className="fas fa-file-contract mr-2"></i>
                            Agreements
                        </h1>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                            <div className="text-center">
                                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading your agreements...</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            {/* Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2 align-items-center">
                        <div className="col-sm-6">
                            <h1 className="m-0 d-flex align-items-center">
                                <i className="fas fa-file-contract mr-3 text-primary"></i>
                                <span>My Agreements</span>
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right bg-transparent p-0 m-0">
                                <li className="breadcrumb-item">
                                    <a href={`/${currentUser?.role}/dashboard`}>
                                        <i className="fas fa-home"></i> Home
                                    </a>
                                </li>
                                <li className="breadcrumb-item active">Agreements</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <section className="content">
                <div className="container-fluid">
                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {error}
                            <button type="button" className="close" onClick={() => setError(null)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="text-muted mb-1 text-uppercase small font-weight-bold">Total</p>
                                            <h3 className="mb-0 font-weight-bold">{stats.total}</h3>
                                        </div>
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-file-contract fa-lg"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="text-muted mb-1 text-uppercase small font-weight-bold">Action Required</p>
                                            <h3 className="mb-0 font-weight-bold text-danger">{stats.pendingMySignature}</h3>
                                        </div>
                                        <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-exclamation-circle fa-lg"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="text-muted mb-1 text-uppercase small font-weight-bold">Pending Publisher</p>
                                            <h3 className="mb-0 font-weight-bold text-warning">{stats.waitingPublisher}</h3>
                                        </div>
                                        <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-clock fa-lg"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="text-muted mb-1 text-uppercase small font-weight-bold">Fully Signed</p>
                                            <h3 className="mb-0 font-weight-bold text-success">{stats.signed}</h3>
                                        </div>
                                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-check-double fa-lg"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 font-weight-bold">
                                <i className="fas fa-filter mr-2 text-primary"></i>
                                Filter & Search
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 mb-3 mb-md-0">
                                    <label className="font-weight-semibold small text-muted">Status Filter</label>
                                    <select
                                        className="form-control"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending_my_signature">🔴 Action Required (My Signature)</option>
                                        <option value="waiting_publisher">🟡 Waiting for Publisher</option>
                                        <option value="fully_signed">🟢 Fully Signed</option>
                                    </select>
                                </div>
                                <div className="col-md-8">
                                    <label className="font-weight-semibold small text-muted">Search Agreements</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text bg-white">
                                                <i className="fas fa-search text-muted"></i>
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by agreement number, job title, company name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <div className="input-group-append">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => setSearchTerm('')}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agreements List */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 font-weight-bold">
                                <i className="fas fa-list mr-2 text-primary"></i>
                                Your Agreements
                                <span className="badge badge-primary ml-2">{filteredAgreements.length}</span>
                            </h5>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={loadAgreements}
                                title="Refresh list"
                            >
                                <i className="fas fa-sync-alt mr-1"></i>
                                Refresh
                            </button>
                        </div>
                        <div className="card-body p-0">
                            {filteredAgreements.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-folder-open fa-4x text-muted mb-3"></i>
                                    <h5 className="text-muted">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'No agreements match your filters'
                                            : 'No agreements yet'}
                                    </h5>
                                    <p className="text-muted">
                                        {!searchTerm && statusFilter === 'all'
                                            ? 'Apply to contracts to get started!'
                                            : 'Try adjusting your filters or search term'}
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="border-0">Agreement #</th>
                                                <th className="border-0">Contract ID</th>
                                                <th className="border-0">Contract Type</th>
                                                <th className="border-0">Position</th>
                                                <th className="border-0">Publisher</th>
                                                <th className="border-0">Status</th>
                                                <th className="border-0">Signatures</th>
                                                <th className="border-0">Created</th>
                                                <th className="border-0 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAgreements.map(agreement => {
                                                const needsMySignature = AgreementService.isPendingMySignature(agreement);
                                                const needsFeesInput = AgreementService.requiresFeesInput(agreement);
                                                const needsAction = needsMySignature || needsFeesInput;

                                                return (
                                                    <tr
                                                        key={agreement.id}
                                                        className={needsAction ? 'bg-light-warning' : ''}
                                                        style={{ transition: 'background-color 0.2s' }}
                                                    >
                                                        <td className="align-middle">
                                                            <strong className="text-primary">{agreement.agreement_number}</strong>
                                                            {agreement.is_custom_agreement && (
                                                                <span className="badge badge-info ml-2" title="Custom uploaded agreement">
                                                                    <i className="fas fa-file-upload"></i> Custom
                                                                </span>
                                                            )}
                                                            {needsFeesInput && (
                                                                <span className="d-block">
                                                                    <span className="badge badge-warning mt-1 pulse-animation">
                                                                        <i className="fas fa-dollar-sign mr-1"></i>
                                                                        ENTER FEES
                                                                    </span>
                                                                </span>
                                                            )}
                                                            {needsMySignature && !needsFeesInput && (
                                                                <span className="d-block">
                                                                    <span className="badge badge-danger mt-1 pulse-animation">
                                                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                                                        SIGN NOW
                                                                    </span>
                                                                </span>
                                                            )}
                                                            {/* Show waiting for publisher message when applicant has signed */}
                                                            {agreement.agency_signed && !agreement.client_signed && (
                                                                <span className="d-block">
                                                                    <span className="badge badge-info mt-1">
                                                                        <i className="fas fa-clock mr-1"></i>
                                                                        Waiting for Publisher
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="align-middle">
                                                            {agreement.contract_id ? (
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        // Professional is always the applicant, navigate to their applications
                                                                        navigate(`/professional/contract-applications`);
                                                                    }}
                                                                    className="text-primary"
                                                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                    title="View my applications"
                                                                >
                                                                    #{agreement.contract_id}
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted">N/A</span>
                                                            )}
                                                        </td>
                                                        <td className="align-middle">
                                                            {agreement.contract_type ? (
                                                                <span className="badge badge-light" style={{ fontSize: '0.85em' }}>
                                                                    {agreement.contract_type.industry || agreement.contract_type.name || 'N/A'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">N/A</span>
                                                            )}
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="d-flex align-items-center">
                                                                <i className="fas fa-briefcase-medical text-muted mr-2"></i>
                                                                <span>{agreement.agreement_data?.job?.title || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="d-flex align-items-center">
                                                                <i className="fas fa-building text-muted mr-2"></i>
                                                                <span>{agreement.agreement_data?.client?.name || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle">
                                                            <span className={`badge badge-${AgreementService.getStatusColor(agreement.status)} px-3 py-2`}>
                                                                {AgreementService.getStatusText(agreement.status)}
                                                            </span>
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="d-flex align-items-center">
                                                                <i className={`fas fa-${agreement.agency_signed ? 'check-circle text-success' : 'circle text-muted'} mr-2`}
                                                                   title={agreement.agency_signed ? 'You signed' : 'Not signed'}></i>
                                                                <span className="mr-2">You</span>
                                                                <i className={`fas fa-${agreement.client_signed ? 'check-circle text-success' : 'circle text-muted'} mr-2`}
                                                                   title={agreement.client_signed ? 'Publisher signed' : 'Not signed'}></i>
                                                                <span>Publisher</span>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle text-muted">
                                                            <i className="far fa-calendar-alt mr-1"></i>
                                                            {AgreementService.formatDate(agreement.created_at)}
                                                        </td>
                                                        <td className="align-middle text-center">
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                <button
                                                                    className="btn btn-info"
                                                                    onClick={() => handlePreviewAgreement(agreement)}
                                                                    title={agreement.is_custom_agreement ? "Preview Custom Agreement PDF" : "Preview Agreement"}
                                                                >
                                                                    <i className={`fas ${agreement.is_custom_agreement ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
                                                                </button>

                                                                {needsFeesInput && (
                                                                    <button
                                                                        className="btn btn-warning"
                                                                        onClick={() => handleSignAgreement(agreement.id)}
                                                                        title="Enter Fees & Sign Agreement"
                                                                    >
                                                                        <i className="fas fa-dollar-sign mr-1"></i>
                                                                        Enter Fees
                                                                    </button>
                                                                )}

                                                                {needsMySignature && !needsFeesInput && (
                                                                    <button
                                                                        className="btn btn-success"
                                                                        onClick={() => handleSignAgreement(agreement.id)}
                                                                        title="Sign Agreement"
                                                                    >
                                                                        <i className="fas fa-pen mr-1"></i>
                                                                        Sign
                                                                    </button>
                                                                )}

                                                                {agreement.status === 'fully_signed' && (
                                                                    <button
                                                                        className="btn btn-success"
                                                                        onClick={() => handleDownloadPDF(agreement.id, agreement.agreement_number)}
                                                                        title="Download Signed PDF"
                                                                    >
                                                                        <i className="fas fa-download"></i> PDF
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Styles */}
            <style jsx>{`
                .pulse-animation {
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                .bg-light-warning {
                    background-color: rgba(255, 193, 7, 0.08) !important;
                }

                .table tbody tr:hover {
                    background-color: rgba(0, 123, 255, 0.05);
                }

                .card {
                    border-radius: 0.5rem;
                }

                .btn-group-sm .btn {
                    padding: 0.375rem 0.75rem;
                }

                @media (max-width: 768px) {
                    .table-responsive {
                        font-size: 0.875rem;
                    }

                    .btn-group-sm .btn {
                        padding: 0.25rem 0.5rem;
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AgreementDashboard;