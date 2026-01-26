/**
 * Professional Agreement Signature Page
 * Location: src/pages/professional/AgreementSignature.jsx
 *
 * Enhanced version with improved design and responsive layout
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import AgreementService from '@services/professional/professional_agreement_service';
import { getCurrentUserService } from '@services/user/AuthService';
import AgreementTemplateRouter from '@components/agreement/AgreementTemplateRouter';

const AgreementSignature = () => {
    const { agreementId } = useParams();
    const navigate = useNavigate();
    const signatureRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [agreement, setAgreement] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [signedName, setSignedName] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [canSign, setCanSign] = useState(false);
    const [signingMessage, setSigningMessage] = useState('');

    // Fee input state (for agency/headhunter applicants)
    const [requiresFees, setRequiresFees] = useState(false);
    const [feesSubmitted, setFeesSubmitted] = useState(false);
    const [agencyFees, setAgencyFees] = useState('');
    const [feeType, setFeeType] = useState('percentage');
    const [feeDescription, setFeeDescription] = useState('');
    const [submittingFees, setSubmittingFees] = useState(false);

    useEffect(() => {
        loadAgreement();
    }, [agreementId]);

    const loadAgreement = async () => {
        try {
            setLoading(true);
            setError(null);

            const user = await getCurrentUserService();
            setCurrentUser(user);
            setSignedName(user.name || '');

            const response = await AgreementService.getAgreementDetails(agreementId);
            const agr = response.agreement;
            setAgreement(agr);

            // Check if fees are required (for agency/headhunter applicants)
            const needsFees = AgreementService.requiresFeesInput(agr);
            setRequiresFees(needsFees);

            // NEW FLOW: Applicant ALWAYS signs first (for both platform and custom agreements)
            // Use can_sign field from API response
            if (agr.can_sign !== undefined) {
                setCanSign(agr.can_sign);
                setSigningMessage(agr.status_message || 'Please review and sign the agreement.');
                if (!agr.can_sign && agr.agency_signed) {
                    setError('You have already signed this agreement.');
                } else if (!agr.can_sign && !needsFees) {
                    // Only show error if it's not a fees-required situation
                    setError(agr.status_message || 'You cannot sign this agreement at this time.');
                }
            } else {
                // Fallback logic if can_sign not present
                if (agr.agency_signed) {
                    setCanSign(false);
                    setSigningMessage('You have already signed this agreement.');
                    setError('You have already signed this agreement.');
                } else if (agr.status === 'pending_applicant_signature' || agr.status === 'pending_agency') {
                    // Applicant can sign
                    setCanSign(true);
                    setSigningMessage('Please review and sign the agreement. The publisher will sign after you.');
                } else if (agr.status === 'pending_applicant_fees' || agr.status === 'pending_fees') {
                    // Need to enter fees first - don't show error, show fee form instead
                    setCanSign(false);
                    setSigningMessage('Please enter your fee structure, then sign the agreement.');
                } else {
                    setCanSign(false);
                    setSigningMessage('Agreement is not ready for your signature.');
                }
            }

        } catch (err) {
            console.error('Error loading agreement:', err);
            setError('Failed to load agreement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
        }
    };

    const handleSubmitFees = async () => {
        if (!agencyFees || parseFloat(agencyFees) <= 0) {
            alert('Please enter a valid fee amount');
            return;
        }

        try {
            setSubmittingFees(true);
            setError(null);

            await AgreementService.updateAgreementFees(agreementId, {
                agencyFees: parseFloat(agencyFees),
                feeType: feeType,
                feeDescription: feeDescription || null
            });

            // Reload agreement to get updated status
            setFeesSubmitted(true);
            setRequiresFees(false);
            setCanSign(true);
            setSigningMessage('Fees submitted! You can now sign the agreement.');

            // Reload to get updated status
            await loadAgreement();

            alert('Fees submitted successfully! You can now sign the agreement.');

        } catch (err) {
            console.error('Error submitting fees:', err);
            setError(err.response?.data?.detail || 'Failed to submit fees. Please try again.');
        } finally {
            setSubmittingFees(false);
        }
    };

    const handleSubmitSignature = async () => {
        if (!signedName.trim()) {
            alert('Please enter your full name');
            return;
        }

        if (!agreedToTerms) {
            alert('Please agree to the terms and conditions');
            return;
        }

        if (signatureRef.current.isEmpty()) {
            alert('Please provide your signature');
            return;
        }

        if (!canSign) {
            alert('You cannot sign this agreement');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const signatureData = signatureRef.current.toDataURL();

            const result = await AgreementService.signAgreement(agreementId, {
                signature: signatureData,
                signed_name: signedName
            });

            if (result.both_signed) {
                alert(
                    'Agreement Fully Signed!\n\n' +
                    'Both parties have signed the agreement.\n' +
                    'The contract has been moved to "booked" status.\n\n' +
                    'Congratulations! You can now start your contract.'
                );
            } else {
                alert(
                    'Signature Submitted!\n\n' +
                    'Your signature has been recorded.\n' +
                    'The publisher has been notified and will sign next.\n' +
                    'You will receive a notification when the agreement is fully signed.'
                );
            }

            navigate('/professional/agreements');

        } catch (err) {
            console.error('Error signing agreement:', err);
            setError(err.response?.data?.detail || 'Failed to sign agreement. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <h1 className="m-0">
                            <i className="fas fa-file-signature mr-2"></i>
                            Sign Agreement
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
                                <p className="mt-3 text-muted">Loading agreement details...</p>
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
                                <i className="fas fa-file-signature mr-3 text-primary"></i>
                                <span>Sign Agreement</span>
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right bg-transparent p-0 m-0">
                                <li className="breadcrumb-item">
                                    <a href={`/${currentUser?.role}/dashboard`}>
                                        <i className="fas fa-home"></i> Home
                                    </a>
                                </li>
                                <li className="breadcrumb-item">
                                    <a href={`/${currentUser?.role}/agreements`}>
                                        Agreements
                                    </a>
                                </li>
                                <li className="breadcrumb-item active">Sign</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <section className="content">
                <div className="container-fluid">
                    {/* Error Alert */}
                    {error && !loading && (
                        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-exclamation-triangle fa-2x mr-3"></i>
                                <div>
                                    <h5 className="alert-heading mb-1">Unable to Sign</h5>
                                    <p className="mb-0">{error}</p>
                                </div>
                            </div>
                            <button type="button" className="close" onClick={() => setError(null)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}

                    {/* Agreement Preview */}
                    <div className="card mb-4 shadow-sm border-0">
                        <div className="card-header bg-primary text-white">
                            <h3 className="card-title mb-0">
                                <i className="fas fa-file-contract mr-2"></i>
                                Agreement #{agreement?.agreement_number}
                                {agreement?.is_custom_agreement && (
                                    <span className="badge badge-info ml-2">
                                        <i className="fas fa-file-upload mr-1"></i>
                                        Custom
                                    </span>
                                )}
                            </h3>
                            <p className="mb-0 mt-2 small">Please read the full agreement carefully before signing</p>
                        </div>
                        <div className="card-body" style={{
                            maxHeight: '500px',
                            overflowY: 'auto',
                            backgroundColor: '#f8f9fa',
                            padding: '20px'
                        }}>
                            {agreement?.is_custom_agreement ? (
                                // Custom agreement - show PDF preview message
                                <div className="text-center py-5">
                                    <i className="fas fa-file-pdf fa-4x text-danger mb-3"></i>
                                    <h4>Custom Agreement PDF</h4>
                                    <p className="text-muted">
                                        This is a custom agreement uploaded by the contract publisher.
                                        Click the button below to view the full PDF document.
                                    </p>
                                </div>
                            ) : agreement ? (
                                <AgreementTemplateRouter agreement={agreement} />
                            ) : (
                                <div className="text-center py-5">
                                    <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                                    <p className="mt-3">Loading agreement...</p>
                                </div>
                            )}
                            <div className="text-center mt-3 pt-3 border-top">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => AgreementService.previewAgreement(agreementId, agreement?.is_custom_agreement)}
                                >
                                    <i className={`fas ${agreement?.is_custom_agreement ? 'fa-file-pdf' : 'fa-external-link-alt'} mr-2`}></i>
                                    {agreement?.is_custom_agreement ? 'View Custom Agreement PDF' : 'Open Full Agreement in New Window'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Left Column - Agreement Details */}
                        <div className="col-lg-6 mb-4">
                            {/* Agreement Info Card */}
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0 font-weight-bold">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        Agreement Details
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {agreement && (
                                        <>
                                            <div className="mb-3 pb-3 border-bottom">
                                                <div className="row">
                                                    <div className="col-5">
                                                        <p className="text-muted mb-1 small">Agreement Number</p>
                                                        <h5 className="mb-0 font-weight-bold text-primary">
                                                            {agreement.agreement_number}
                                                        </h5>
                                                    </div>
                                                    <div className="col-7 text-right">
                                                        <p className="text-muted mb-1 small">Status</p>
                                                        <span className={`badge badge-lg badge-${AgreementService.getStatusColor(agreement.status)} px-3 py-2`}>
                                                            {AgreementService.getStatusText(agreement.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="info-group mb-3">
                                                <div className="d-flex align-items-start mb-2">
                                                    <i className="fas fa-briefcase-medical text-primary mt-1 mr-3"></i>
                                                    <div>
                                                        <p className="text-muted mb-0 small">Position</p>
                                                        <p className="mb-0 font-weight-semibold">
                                                            {agreement.agreement_data?.job?.title || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="info-group mb-3">
                                                <div className="d-flex align-items-start mb-2">
                                                    <i className="fas fa-building text-primary mt-1 mr-3"></i>
                                                    <div>
                                                        <p className="text-muted mb-0 small">Publisher</p>
                                                        <p className="mb-0 font-weight-semibold">
                                                            {agreement.agreement_data?.client?.name || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="info-group mb-3">
                                                <div className="d-flex align-items-start">
                                                    <i className="far fa-calendar-alt text-primary mt-1 mr-3"></i>
                                                    <div>
                                                        <p className="text-muted mb-0 small">Created</p>
                                                        <p className="mb-0 font-weight-semibold">
                                                            {AgreementService.formatDate(agreement.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Signing Progress Card */}
                            {agreement && !error && (
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-info text-white">
                                        <h5 className="mb-0 font-weight-bold">
                                            <i className="fas fa-tasks mr-2"></i>
                                            Signing Progress
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="small font-weight-semibold">Completion Status</span>
                                                <span className="small font-weight-semibold">
                                                    {((agreement.agency_signed ? 50 : 0) + (agreement.client_signed ? 50 : 0))}%
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: '25px' }}>
                                                <div
                                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                                    role="progressbar"
                                                    style={{
                                                        width: `${((agreement.agency_signed ? 50 : 0) + (agreement.client_signed ? 50 : 0))}%`,
                                                        backgroundColor: agreement.agency_signed && agreement.client_signed ? '#28a745' : '#007bff'
                                                    }}
                                                >
                                                    <span className="font-weight-bold">
                                                        {agreement.agency_signed && agreement.client_signed ? 'Fully Signed' :
                                                         agreement.agency_signed ? 'You Signed' :
                                                         'Awaiting Signatures'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Signing Steps - NEW FLOW: Applicant ALWAYS signs first */}
                                        <div className="signing-steps">
                                            {/* Step 1: Applicant signs first */}
                                            <div className={`step-item ${agreement.agency_signed ? 'completed' : 'pending'}`}>
                                                <div className="step-icon">
                                                    <i className={`fas fa-${agreement.agency_signed ? 'check-circle' : 'circle'}`}></i>
                                                </div>
                                                <div className="step-content">
                                                    <h6 className="mb-1 font-weight-semibold">Step 1: Your Signature</h6>
                                                    <p className="mb-0 small text-muted">
                                                        {agreement.agency_signed ? 'Completed ✓' : (canSign ? 'Ready - Sign below' : 'Pending')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 2: Publisher signs second */}
                                            <div className={`step-item ${agreement.client_signed ? 'completed' : 'pending'}`}>
                                                <div className="step-icon">
                                                    <i className={`fas fa-${agreement.client_signed ? 'check-circle' : 'circle'}`}></i>
                                                </div>
                                                <div className="step-content">
                                                    <h6 className="mb-1 font-weight-semibold">Step 2: Publisher Signature</h6>
                                                    <p className="mb-0 small text-muted">
                                                        {agreement.client_signed ? 'Completed ✓' : (agreement.agency_signed ? 'Waiting for publisher' : 'Pending your signature first')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`step-item ${agreement.status === 'fully_signed' ? 'completed' : 'pending'}`}>
                                                <div className="step-icon">
                                                    <i className={`fas fa-${agreement.status === 'fully_signed' ? 'check-circle' : 'circle'}`}></i>
                                                </div>
                                                <div className="step-content">
                                                    <h6 className="mb-1 font-weight-semibold">Step 3: Contract Activation</h6>
                                                    <p className="mb-0 small text-muted">
                                                        {agreement.status === 'fully_signed' ? 'Complete - Contract is active' : 'Awaiting both signatures'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Signature Form */}
                        <div className="col-lg-6 mb-4">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-success text-white">
                                    <h5 className="mb-0 font-weight-bold">
                                        <i className="fas fa-pen-fancy mr-2"></i>
                                        Your Digital Signature
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {/* Role Badge */}
                                    <div className="mb-4">
                                        <div className="alert alert-success mb-0" role="alert">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-user-check fa-2x mr-3"></i>
                                                <div>
                                                    <h6 className="alert-heading mb-1 font-weight-bold">Signing As</h6>
                                                    <p className="mb-0">Professional (Applicant)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fee Input Section (for agency/headhunter) */}
                                    {requiresFees && !feesSubmitted && (
                                        <div className="fee-section mb-4">
                                            <div className="alert alert-warning" role="alert">
                                                <i className="fas fa-dollar-sign mr-2"></i>
                                                <strong>Step 1:</strong> Please enter your fee structure before signing the agreement.
                                            </div>

                                            <div className="card border-warning">
                                                <div className="card-header bg-warning text-dark">
                                                    <h6 className="mb-0 font-weight-bold">
                                                        <i className="fas fa-hand-holding-usd mr-2"></i>
                                                        Your Fee Structure
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="form-group">
                                                        <label className="font-weight-semibold">
                                                            Fee Type <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-control"
                                                            value={feeType}
                                                            onChange={(e) => setFeeType(e.target.value)}
                                                            disabled={submittingFees}
                                                        >
                                                            <option value="percentage">Percentage (%)</option>
                                                            <option value="fixed">Fixed Amount ($)</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="font-weight-semibold">
                                                            {feeType === 'percentage' ? 'Commission Rate (%)' : 'Fixed Fee ($)'} <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group">
                                                            {feeType === 'fixed' && (
                                                                <div className="input-group-prepend">
                                                                    <span className="input-group-text">$</span>
                                                                </div>
                                                            )}
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-lg"
                                                                value={agencyFees}
                                                                onChange={(e) => setAgencyFees(e.target.value)}
                                                                placeholder={feeType === 'percentage' ? 'e.g., 15' : 'e.g., 5000'}
                                                                min="0"
                                                                step="0.01"
                                                                disabled={submittingFees}
                                                            />
                                                            {feeType === 'percentage' && (
                                                                <div className="input-group-append">
                                                                    <span className="input-group-text">%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <small className="form-text text-muted">
                                                            Enter the fee you charge your client for this placement
                                                        </small>
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="font-weight-semibold">Fee Description (Optional)</label>
                                                        <textarea
                                                            className="form-control"
                                                            value={feeDescription}
                                                            onChange={(e) => setFeeDescription(e.target.value)}
                                                            placeholder="Add any additional details about your fee structure..."
                                                            rows="2"
                                                            disabled={submittingFees}
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="btn btn-warning btn-lg btn-block"
                                                        onClick={handleSubmitFees}
                                                        disabled={submittingFees || !agencyFees}
                                                    >
                                                        {submittingFees ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm mr-2"></span>
                                                                Submitting Fees...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-check mr-2"></i>
                                                                Submit Fees & Continue to Signature
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fee Submitted Confirmation */}
                                    {feesSubmitted && (
                                        <div className="alert alert-success" role="alert">
                                            <i className="fas fa-check-circle mr-2"></i>
                                            <strong>Fees submitted!</strong> You can now sign the agreement below.
                                        </div>
                                    )}

                                    {/* Signing Order Info */}
                                    {!agreement?.agency_signed && canSign && !requiresFees && (
                                        <div className="alert alert-info" role="alert">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            <strong>Important:</strong> {signingMessage}
                                        </div>
                                    )}

                                    {/* Show status message when can't sign (but not when fees are required) */}
                                    {!canSign && !agreement?.agency_signed && agreement?.status_message && !requiresFees && (
                                        <div className="alert alert-warning" role="alert">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            {agreement.status_message}
                                        </div>
                                    )}

                                    {/* Full Name Input - disabled until fees are submitted if required */}
                                    <div className="form-group">
                                        <label className="font-weight-semibold">
                                            Full Legal Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            value={signedName}
                                            onChange={(e) => setSignedName(e.target.value)}
                                            placeholder="Enter your full legal name"
                                            disabled={submitting || !canSign || (requiresFees && !feesSubmitted)}
                                        />
                                        <small className="form-text text-muted">
                                            <i className="fas fa-shield-alt mr-1"></i>
                                            Enter your name exactly as it appears on official documents
                                        </small>
                                    </div>

                                    {/* Signature Canvas */}
                                    <div className="form-group">
                                        <label className="font-weight-semibold">
                                            Digital Signature <span className="text-danger">*</span>
                                        </label>
                                        <div className="signature-container border rounded p-2 bg-white shadow-sm">
                                            <SignatureCanvas
                                                ref={signatureRef}
                                                canvasProps={{
                                                    className: 'signature-canvas',
                                                    style: {
                                                        width: '100%',
                                                        height: '200px',
                                                        border: '2px dashed #dee2e6',
                                                        borderRadius: '4px'
                                                    }
                                                }}
                                                backgroundColor="white"
                                            />
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <small className="text-muted">
                                                <i className="fas fa-mouse-pointer mr-1"></i>
                                                Sign using your mouse or touchscreen
                                            </small>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={handleClearSignature}
                                                disabled={submitting || !canSign || (requiresFees && !feesSubmitted)}
                                            >
                                                <i className="fas fa-eraser mr-1"></i>
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {/* Terms Checkbox */}
                                    <div className="form-group">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="agreeTerms"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                                disabled={submitting || !canSign || (requiresFees && !feesSubmitted)}
                                            />
                                            <label className="custom-control-label font-weight-normal" htmlFor="agreeTerms">
                                                I agree to the terms and conditions of this recruitment service agreement and certify that the information provided is accurate <span className="text-danger">*</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Legal Notice */}
                                    <div className="alert alert-light border" role="alert">
                                        <small>
                                            <i className="fas fa-balance-scale mr-2 text-primary"></i>
                                            <strong>Legal Notice:</strong> By signing, you acknowledge that this constitutes a legally binding electronic signature. Your IP address and timestamp will be recorded for authentication purposes.
                                        </small>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="form-group mb-0">
                                        <button
                                            type="button"
                                            className="btn btn-success btn-lg btn-block shadow-sm"
                                            onClick={handleSubmitSignature}
                                            disabled={
                                                submitting ||
                                                !signedName ||
                                                !agreedToTerms ||
                                                !canSign ||
                                                (requiresFees && !feesSubmitted)
                                            }
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm mr-2" role="status">
                                                        <span className="sr-only">Loading...</span>
                                                    </span>
                                                    Submitting Signature...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-check-circle mr-2"></i>
                                                    Sign Agreement
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-lg btn-block mt-2"
                                            onClick={() => navigate('/professional/agreements')}
                                            disabled={submitting}
                                        >
                                            <i className="fas fa-arrow-left mr-2"></i>
                                            Back to Agreements
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Styles */}
            <style jsx>{`
                .signing-steps {
                    position: relative;
                }

                .step-item {
                    display: flex;
                    align-items-start;
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.3s ease;
                }

                .step-item.completed {
                    background-color: rgba(40, 167, 69, 0.1);
                }

                .step-item.pending {
                    background-color: rgba(108, 117, 125, 0.05);
                }

                .step-icon {
                    font-size: 1.5rem;
                    margin-right: 1rem;
                    min-width: 30px;
                }

                .step-item.completed .step-icon {
                    color: #28a745;
                }

                .step-item.pending .step-icon {
                    color: #6c757d;
                }

                .signature-canvas {
                    cursor: crosshair;
                }

                .card {
                    border-radius: 0.5rem;
                }

                .btn-lg {
                    padding: 0.75rem 1.5rem;
                    font-size: 1.1rem;
                }

                @media (max-width: 991px) {
                    .col-lg-6 {
                        margin-bottom: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AgreementSignature;