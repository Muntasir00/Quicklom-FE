/**
 * Agreement Dashboard
 * Location: src/pages/institute/AgreementDashboard.jsx
 *
 * Displays all recruitment service agreements for the current user
 * Shows agreements where user is either the client (contract publisher) or agency (applicant)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AgreementService from '@services/institute/AgreementService';
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

    // Check if user is headhunter/agency (show "You" column) or clinic/pharmacy (show only "Applicant" column)
    const instituteCategoryId = sessionStorage.getItem('institute_category_id');
    const instituteCategoryName = sessionStorage.getItem('institute_category_name');

    // Categories 3 & 4 are Recruitment Agency and Head Hunter
    const isHeadhunterOrAgency = instituteCategoryId === '3' || instituteCategoryId === '4';
    const showYouColumn = isHeadhunterOrAgency;

    console.log('Institute Category:', { id: instituteCategoryId, name: instituteCategoryName, showYouColumn });

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        signed: 0,
        expired: 0
    });

    useEffect(() => {
        loadAgreements();
    }, []);

    useEffect(() => {
        filterAgreements();
    }, [statusFilter, searchTerm, agreements, agreementIdParam]);

    const loadAgreements = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user
            const user = await getCurrentUserService();
            setCurrentUser(user);

            // Get all agreements
            const response = await AgreementService.getMyAgreements();
            const agreementsList = response.agreements || [];
            setAgreements(agreementsList);

            // Calculate statistics
            calculateStats(agreementsList, user.id);

        } catch (err) {
            console.error('Error loading agreements:', err);
            setError('Failed to load agreements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (agreementsList, userId) => {
        const total = agreementsList.length;
        // Include both signature-required and fees-required as "pending action"
        const pending = agreementsList.filter(a =>
            AgreementService.isPendingMySignature(a, userId) ||
            AgreementService.requiresFeesInput(a, userId)
        ).length;
        const signed = agreementsList.filter(a =>
            a.status === 'fully_signed'
        ).length;
        const expired = agreementsList.filter(a =>
            a.status === 'expired'
        ).length;

        setStats({ total, pending, signed, expired });
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

        // Filter by status
        if (statusFilter !== 'all') {
            if (statusFilter === 'pending_my_signature') {
                // Include both signature-required and fees-required
                filtered = filtered.filter(a =>
                    AgreementService.isPendingMySignature(a, currentUser?.id) ||
                    AgreementService.requiresFeesInput(a, currentUser?.id)
                );
            } else if (statusFilter === 'pending_other_signature') {
                filtered = filtered.filter(a => {
                    // Use can_sign from API - if can_sign is false and not fully signed, it's pending other party
                    if (a.can_sign !== undefined) {
                        return !a.can_sign && a.status !== 'fully_signed' && a.status !== 'expired' && a.status !== 'rejected';
                    }
                    // Fallback
                    const myRole = AgreementService.getMyRole(a, currentUser?.id);
                    return (a.status === 'pending_client' && myRole !== 'client') ||
                           (a.status === 'pending_agency' && myRole !== 'agency') ||
                           (a.status === 'pending_publisher_signature' && myRole !== 'client') ||
                           (a.status === 'pending_applicant_signature' && myRole !== 'agency') ||
                           (a.status === 'pending_applicant_fees');
                });
            } else {
                filtered = filtered.filter(a => a.status === statusFilter);
            }
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.agreement_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.agreement_data?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.agreement_data?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.agreement_data?.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAgreements(filtered);
    };

    const handleViewAgreement = (agreementId) => {
        navigate(`/institute/agreements/${agreementId}`);
    };

    const handleSignAgreement = (agreementId) => {
        navigate(`/institute/agreements/${agreementId}/sign`);
    };

    const handleDownloadPDF = async (agreementId, agreementNumber) => {
        try {
            await AgreementService.downloadAgreementPDF(agreementId, agreementNumber);
        } catch (err) {
            alert('Failed to download PDF. Please try again.');
        }
    };

    const handlePreviewAgreement = async (agreement) => {
        // For custom agreements, use different preview method
        if (agreement.is_custom_agreement) {
            await AgreementService.previewCustomAgreement(agreement.id);
        } else {
            AgreementService.previewAgreement(agreement.id);
        }
    };

    if (loading) {
        return (
            <div className="content-wrapper" style={{ marginTop: '15px' }}>
                <div className="content-header">
                    <div className="container-fluid">
                        <h1 className="m-0">Agreements</h1>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="text-center py-5">
                            <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
                            <p className="mt-3">Loading agreements...</p>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="content-wrapper" style={{ marginTop: '15px' }}>
            {/* Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2 align-items-center">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-file-signature mr-2"></i>
                                Recruitment Service Agreements
                            </h1>
                        </div>
                        <div className="col-sm-6 text-right">
                            <ol className="breadcrumb float-sm-right mb-2">
                                <li className="breadcrumb-item"><a href="/institute/dashboard">Home</a></li>
                                <li className="breadcrumb-item active">Agreements</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="content">
                <div className="container-fluid">
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show">
                            <button type="button" className="close" onClick={() => setError(null)}>
                                <span>&times;</span>
                            </button>
                            <i className="icon fas fa-ban"></i>
                            {error}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="row">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{stats.total}</h3>
                                    <p>Total Agreements</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-file-contract"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.pending}</h3>
                                    <p>Pending Your Signature</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.signed}</h3>
                                    <p>Fully Signed</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-double"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-secondary">
                                <div className="inner">
                                    <h3>{stats.expired}</h3>
                                    <p>Expired</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-calendar-times"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-filter mr-2"></i>
                                Filter Agreements
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            className="form-control"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="pending_my_signature">Pending My Signature</option>
                                            <option value="pending_other_signature">Pending Other Party Signature</option>
                                            <option value="fully_signed">Fully Signed</option>
                                            <option value="expired">Expired</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Search</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by agreement #, job title, company..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agreements List */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-list mr-2"></i>
                                Your Agreements ({filteredAgreements.length})
                            </h3>
                        </div>
                        <div className="card-body p-0">
                            {filteredAgreements.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-folder-open fa-4x text-muted mb-3"></i>
                                    <p className="text-muted">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'No agreements match your filters'
                                            : 'No agreements yet'}
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Agreement #</th>
                                                <th>Contract ID</th>
                                                <th>Contract Type</th>
                                                <th>Position</th>
                                                {showYouColumn ? (
                                                    <>
                                                        <th>You</th>
                                                        <th>Other Party</th>
                                                    </>
                                                ) : (
                                                    <th>Applicant</th>
                                                )}
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAgreements.map(agreement => {
                                                const myRole = AgreementService.getMyRole(agreement, currentUser?.id);
                                                const needsMySignature = AgreementService.isPendingMySignature(agreement, currentUser?.id);
                                                const needsFeesInput = AgreementService.requiresFeesInput(agreement, currentUser?.id);
                                                const needsMyAction = needsMySignature || needsFeesInput;

                                                return (
                                                    <tr key={agreement.id}>
                                                        <td>
                                                            <strong>{agreement.agreement_number}</strong>
                                                            {agreement.is_custom_agreement && (
                                                                <span className="badge badge-info ml-2" title="Custom uploaded agreement">
                                                                    <i className="fas fa-file-upload"></i> Custom
                                                                </span>
                                                            )}
                                                            {/* Step-based badge */}
                                                            {(() => {
                                                                if (myRole === 'client') {
                                                                    if (agreement.status === 'draft') {
                                                                        return <span className="badge badge-primary ml-2"><i className="fas fa-paper-plane mr-1"></i>Ready to Send</span>;
                                                                    }
                                                                    if (!agreement.agency_signed) {
                                                                        return <span className="badge badge-secondary ml-2"><i className="fas fa-clock mr-1"></i>Waiting for Applicant</span>;
                                                                    }
                                                                    if (agreement.agency_signed && !agreement.client_signed) {
                                                                        return <span className="badge badge-success ml-2"><i className="fas fa-pen mr-1"></i>Your Turn to Sign</span>;
                                                                    }
                                                                } else if (myRole === 'agency') {
                                                                    if (needsFeesInput) {
                                                                        return <span className="badge badge-warning ml-2"><i className="fas fa-dollar-sign mr-1"></i>Enter Fee & Sign</span>;
                                                                    }
                                                                    if (!agreement.agency_signed) {
                                                                        return <span className="badge badge-success ml-2"><i className="fas fa-pen mr-1"></i>Ready to Sign</span>;
                                                                    }
                                                                    if (agreement.agency_signed && !agreement.client_signed) {
                                                                        return <span className="badge badge-secondary ml-2"><i className="fas fa-clock mr-1"></i>Waiting for Publisher</span>;
                                                                    }
                                                                }
                                                                return null;
                                                            })()}
                                                        </td>
                                                        <td>
                                                            {agreement.contract_id ? (
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        // Check if user is publisher of this contract
                                                                        const isPublisher = agreement.client_user_id === currentUser?.id;
                                                                        // Categories 1 & 2 (Clinics/Pharmacies) always go to My Contracts
                                                                        const isClinicOrPharmacy = instituteCategoryId === '1' || instituteCategoryId === '2';

                                                                        if (isPublisher || isClinicOrPharmacy) {
                                                                            // Publisher or Clinic/Pharmacy: go to My Contracts
                                                                            navigate(`/institute/contracts?contract_id=${agreement.contract_id}`);
                                                                        } else {
                                                                            // Applicant (Agency/Headhunter): go to Applications
                                                                            navigate(`/institute/contract-applications?contract_id=${agreement.contract_id}`);
                                                                        }
                                                                    }}
                                                                    className="text-primary"
                                                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                    title={agreement.client_user_id === currentUser?.id ? "View my contract" : "View application"}
                                                                >
                                                                    #{agreement.contract_id}
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted">N/A</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {agreement.contract_type ? (
                                                                <span className="badge badge-light" style={{ fontSize: '0.85em' }}>
                                                                    {agreement.contract_type.industry || agreement.contract_type.name || 'N/A'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">N/A</span>
                                                            )}
                                                        </td>
                                                        <td>{agreement.agreement_data?.job?.title || 'N/A'}</td>
                                                        {showYouColumn ? (
                                                            <>
                                                                <td>
                                                                    <span className={`badge badge-${myRole === 'client' ? 'primary' : 'success'}`}>
                                                                        {myRole === 'client' ? 'Publisher' : 'Applicant'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {myRole === 'client'
                                                                        ? (agreement.agreement_data?.agency?.name || 'N/A')
                                                                        : (agreement.agreement_data?.client?.name || 'N/A')
                                                                    }
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        ({myRole === 'client' ? 'Applicant' : 'Publisher'})
                                                                    </small>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <td>
                                                                {agreement.agreement_data?.agency?.name || 'N/A'}
                                                            </td>
                                                        )}
                                                        <td>
                                                            <span className={`badge badge-${AgreementService.getStatusColor(agreement.status)}`}>
                                                                {AgreementService.getStatusText(agreement.status, agreement, currentUser?.id)}
                                                            </span>
                                                        </td>
                                                        <td>{AgreementService.formatDate(agreement.created_at)}</td>
                                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                {/* Primary action button based on step */}
                                                                {(() => {
                                                                    // PUBLISHER (client) actions
                                                                    if (myRole === 'client') {
                                                                        // Step 1: Draft - need to pick and send agreement
                                                                        if (agreement.status === 'draft') {
                                                                            return (
                                                                                <button
                                                                                    className="btn btn-primary"
                                                                                    onClick={() => handleSignAgreement(agreement.id)}
                                                                                    title="Choose agreement type and send to applicant"
                                                                                >
                                                                                    <i className="fas fa-paper-plane mr-1"></i> Pick & Send
                                                                                </button>
                                                                            );
                                                                        }
                                                                        // Step 2: Waiting for applicant
                                                                        if (!agreement.agency_signed && agreement.status !== 'fully_signed') {
                                                                            return (
                                                                                <button
                                                                                    className="btn btn-secondary"
                                                                                    onClick={() => handleSignAgreement(agreement.id)}
                                                                                    title="View agreement status"
                                                                                >
                                                                                    <i className="fas fa-clock mr-1"></i> Waiting
                                                                                </button>
                                                                            );
                                                                        }
                                                                        // Step 3: Applicant signed, publisher needs to review & sign
                                                                        if (agreement.agency_signed && !agreement.client_signed) {
                                                                            return (
                                                                                <button
                                                                                    className="btn btn-success"
                                                                                    onClick={() => handleSignAgreement(agreement.id)}
                                                                                    title="Review fee and sign the agreement"
                                                                                >
                                                                                    <i className="fas fa-pen mr-1"></i> Review & Sign
                                                                                </button>
                                                                            );
                                                                        }
                                                                    }
                                                                    // APPLICANT (agency) actions
                                                                    else if (myRole === 'agency') {
                                                                        // Need to enter fees and sign
                                                                        if (needsFeesInput) {
                                                                            return (
                                                                                <button
                                                                                    className="btn btn-warning"
                                                                                    onClick={() => handleSignAgreement(agreement.id)}
                                                                                    title="Enter your placement fee and sign"
                                                                                >
                                                                                    <i className="fas fa-dollar-sign mr-1"></i> Enter Fee & Sign
                                                                                </button>
                                                                            );
                                                                        }
                                                                        // Need to sign (no fees required)
                                                                        if (!agreement.agency_signed) {
                                                                            return (
                                                                                <button
                                                                                    className="btn btn-success"
                                                                                    onClick={() => handleSignAgreement(agreement.id)}
                                                                                    title="Sign the agreement"
                                                                                >
                                                                                    <i className="fas fa-pen mr-1"></i> Sign
                                                                                </button>
                                                                            );
                                                                        }
                                                                        // Already signed, waiting for publisher
                                                                        if (agreement.agency_signed && !agreement.client_signed) {
                                                                            return (
                                                                                <button
                                                                                    className="btn btn-secondary"
                                                                                    onClick={() => handleSignAgreement(agreement.id)}
                                                                                    title="View agreement status"
                                                                                >
                                                                                    <i className="fas fa-clock mr-1"></i> Waiting
                                                                                </button>
                                                                            );
                                                                        }
                                                                    }
                                                                    return null;
                                                                })()}

                                                                {/* Preview button */}
                                                                <button
                                                                    className="btn btn-outline-info"
                                                                    onClick={() => handlePreviewAgreement(agreement)}
                                                                    title={agreement.is_custom_agreement ? "Preview Custom Agreement" : "Preview Agreement"}
                                                                >
                                                                    <i className={`fas ${agreement.is_custom_agreement ? 'fa-file-pdf' : 'fa-eye'}`}></i>
                                                                </button>

                                                                {/* Download PDF for fully signed */}
                                                                {agreement.status === 'fully_signed' && (
                                                                    <button
                                                                        className="btn btn-success"
                                                                        onClick={() => handleDownloadPDF(agreement.id, agreement.agreement_number)}
                                                                        title="Download Signed PDF"
                                                                    >
                                                                        <i className="fas fa-download"></i>
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
        </div>
    );
};

export default AgreementDashboard;