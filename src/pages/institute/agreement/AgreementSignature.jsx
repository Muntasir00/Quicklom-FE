/**
 * Agreement Signature Page
 * Location: src/pages/institute/AgreementSignature.jsx
 *
 * REDESIGNED: Clear role-based views with steps at top
 *
 * PUBLISHER VIEW:
 * - Step 1: Choose agreement type (platform or custom)
 * - Step 2: Wait for applicant to sign
 * - Step 3: Review fee and sign
 *
 * APPLICANT VIEW:
 * - Step 1: Review agreement
 * - Step 2: Enter fee (if agency/headhunter) and sign
 * - Step 3: Wait for publisher to sign
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import AgreementService from '@services/institute/AgreementService';
import { getCurrentUserService } from '@services/user/AuthService';
import AgreementTemplateRouter from '@components/agreement/AgreementTemplateRouter';

const AgreementSignature = () => {
    const { agreementId } = useParams();
    const navigate = useNavigate();
    const signatureRef = useRef(null);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [agreement, setAgreement] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [myRole, setMyRole] = useState(null);
    const [signedName, setSignedName] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Fee input state (ONLY for agencies/headhunters)
    const [requiresFeeInput, setRequiresFeeInput] = useState(false);
    const [agencyFees, setAgencyFees] = useState('');
    const [applicantFees, setApplicantFees] = useState(null);

    // Custom agreement upload state
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [sendingPlatform, setSendingPlatform] = useState(false);

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
            setAgreement(response.agreement);

            const role = AgreementService.getMyRole(response.agreement, user.id);
            setMyRole(role);

            const fees = response.agreement.agreement_data?.fees || {};
            const status = response.agreement.status;

            // For APPLICANT (agency): Check if fee input is required
            if (role === 'agency') {
                const needsFees = status === 'pending_applicant_fees' ||
                                  status === 'pending_fees' ||
                                  fees.requiresInput === true;

                if (needsFees && !response.agreement.agency_signed) {
                    setRequiresFeeInput(true);
                } else {
                    setRequiresFeeInput(false);
                    if (fees.agencyFees) {
                        setAgencyFees(fees.agencyFees.toString());
                    }
                }
            }

            // For PUBLISHER: Show applicant's submitted fees
            if (role === 'client' && fees.agencyFees) {
                setApplicantFees({
                    amount: fees.agencyFees,
                    type: fees.feeType || 'fixed'
                });
            }

        } catch (err) {
            console.error('Error loading agreement:', err);
            setError('Failed to load agreement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Determine current step for each role
    const getCurrentStep = () => {
        if (myRole === 'client') {
            // Publisher steps
            if (agreement?.status === 'draft') return 1;
            if (!agreement?.agency_signed) return 2;
            if (!agreement?.client_signed) return 3;
            return 4; // Complete
        } else {
            // Applicant steps
            if (requiresFeeInput) return 1;
            if (!agreement?.agency_signed) return 2;
            if (!agreement?.client_signed) return 3;
            return 4; // Complete
        }
    };

    const handleClearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
                alert('Please select a PDF or DOCX file');
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                e.target.value = '';
                return;
            }
            setUploadFile(file);
        }
    };

    const handleSendPlatformAgreement = async () => {
        if (!window.confirm('Send the platform agreement to the applicant?\n\nThey will add their fee and sign first, then you will review and sign.')) {
            return;
        }

        try {
            setSendingPlatform(true);
            setError(null);
            await AgreementService.choosePlatformAgreement(agreementId);
            alert('Agreement sent! The applicant will be notified.');
            await loadAgreement();
        } catch (err) {
            console.error('Error sending platform agreement:', err);
            setError(err.response?.data?.detail || 'Failed to send agreement.');
        } finally {
            setSendingPlatform(false);
        }
    };

    const handleUploadCustomAgreement = async () => {
        if (!uploadFile) {
            alert('Please select a file');
            return;
        }

        try {
            setUploading(true);
            setError(null);
            await AgreementService.uploadCustomAgreement(agreementId, uploadFile);
            alert('Custom agreement uploaded and sent to applicant!');
            setUploadFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            await loadAgreement();
        } catch (err) {
            console.error('Error uploading custom agreement:', err);
            setError(err.response?.data?.detail || 'Failed to upload agreement.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitSignature = async () => {
        if (!signedName.trim()) {
            alert('Please enter your full name');
            return;
        }
        if (!agreedToTerms) {
            alert('Please agree to the terms');
            return;
        }
        if (signatureRef.current.isEmpty()) {
            alert('Please provide your signature');
            return;
        }

        // Fee validation for applicants
        if (myRole === 'agency' && requiresFeeInput) {
            if (!agencyFees || parseFloat(agencyFees) <= 0) {
                alert('Please enter a valid fee amount');
                return;
            }
            const feeAmount = parseFloat(agencyFees);
            const confirmed = window.confirm(
                `Confirm your placement fee:\n\n$${feeAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })} CAD\n\nThe publisher will review this before signing.`
            );
            if (!confirmed) return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Submit fees first if required
            if (myRole === 'agency' && requiresFeeInput) {
                await AgreementService.updateAgreementFees(agreementId, {
                    agencyFees: parseFloat(agencyFees),
                    feeType: 'fixed',
                    feeDescription: null
                });
            }

            // Submit signature
            const signatureData = signatureRef.current.toDataURL();
            const result = await AgreementService.signAgreement(agreementId, {
                signature: signatureData,
                signed_name: signedName
            });

            if (result.both_signed) {
                alert('Agreement complete! Contract has been booked.');
            } else if (myRole === 'agency') {
                alert('Signed successfully! The publisher will review your fee and sign.');
            } else {
                alert('Signed successfully!');
            }

            navigate('/institute/agreements');

        } catch (err) {
            console.error('Error signing:', err);
            setError(err.response?.data?.detail || 'Failed to sign. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Check if user can sign
    const canSign = () => {
        if (myRole === 'agency') {
            return !agreement?.agency_signed;
        } else if (myRole === 'client') {
            return agreement?.agency_signed && !agreement?.client_signed;
        }
        return false;
    };

    if (loading) {
        return (
            <div className="" style={{ marginTop: '15px' }}>
                <section className="content">
                    <div className="container-fluid">
                        <div className="text-center py-5">
                            <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
                            <p className="mt-3">Loading agreement...</p>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const currentStep = getCurrentStep();

    // ========================================
    // PUBLISHER VIEW
    // ========================================
    if (myRole === 'client') {
        return (
            <div className="" style={{ marginTop: '15px' }}>
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center">
                            <h1 className="m-0">
                                <i className="fas fa-file-signature mr-2"></i>
                                Agreement #{agreement?.agreement_number}
                            </h1>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/institute/agreements')}
                            >
                                <i className="fas fa-arrow-left mr-2"></i>Back to Agreements
                            </button>
                        </div>
                    </div>
                </div>

                <section className="content">
                    <div className="container-fluid">
                        {/* Error Alert */}
                        {error && (
                            <div className="alert alert-danger alert-dismissible">
                                <button type="button" className="close" onClick={() => setError(null)}>×</button>
                                <i className="fas fa-exclamation-triangle mr-2"></i>{error}
                            </div>
                        )}

                        {/* PROGRESS STEPS - TOP OF PAGE */}
                        <div className="card mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    {/* Step 1 */}
                                    <div className="text-center flex-fill">
                                        <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 ${currentStep > 1 ? 'bg-success' : currentStep === 1 ? 'bg-primary' : 'bg-secondary'} text-white`} style={{ width: '50px', height: '50px' }}>
                                            {currentStep > 1 ? <i className="fas fa-check"></i> : <span className="h5 mb-0">1</span>}
                                        </div>
                                        <div className={`font-weight-bold ${currentStep === 1 ? 'text-primary' : ''}`}>Send Agreement</div>
                                        <small className="text-muted">Choose type & send</small>
                                    </div>
                                    <div className={`flex-fill ${currentStep > 1 ? 'border-success' : 'border-secondary'}`} style={{ height: '3px', backgroundColor: currentStep > 1 ? '#28a745' : '#dee2e6', maxWidth: '100px' }}></div>

                                    {/* Step 2 */}
                                    <div className="text-center flex-fill">
                                        <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 ${currentStep > 2 ? 'bg-success' : currentStep === 2 ? 'bg-warning' : 'bg-secondary'} text-white`} style={{ width: '50px', height: '50px' }}>
                                            {currentStep > 2 ? <i className="fas fa-check"></i> : <span className="h5 mb-0">2</span>}
                                        </div>
                                        <div className={`font-weight-bold ${currentStep === 2 ? 'text-warning' : ''}`}>Applicant Signs</div>
                                        <small className="text-muted">They add fee & sign</small>
                                    </div>
                                    <div className={`flex-fill`} style={{ height: '3px', backgroundColor: currentStep > 2 ? '#28a745' : '#dee2e6', maxWidth: '100px' }}></div>

                                    {/* Step 3 */}
                                    <div className="text-center flex-fill">
                                        <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 ${currentStep > 3 ? 'bg-success' : currentStep === 3 ? 'bg-success' : 'bg-secondary'} text-white`} style={{ width: '50px', height: '50px' }}>
                                            {currentStep > 3 ? <i className="fas fa-check"></i> : <span className="h5 mb-0">3</span>}
                                        </div>
                                        <div className={`font-weight-bold ${currentStep === 3 ? 'text-success' : ''}`}>You Sign</div>
                                        <small className="text-muted">Review fee & sign</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 1: Choose Agreement Type */}
                        {currentStep === 1 && (
                            <>
                                <div className="card border-primary">
                                    <div className="card-header bg-primary text-white">
                                        <h4 className="mb-0"><i className="fas fa-paper-plane mr-2"></i>Step 1: Send Agreement to Applicant</h4>
                                    </div>
                                    <div className="card-body">
                                        <p className="lead mb-4">Choose which agreement to send. The applicant will add their placement fee and sign first.</p>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <div className="card h-100 border-success">
                                                    <div className="card-body text-center">
                                                        <i className="fas fa-file-contract fa-4x text-success mb-3"></i>
                                                        <h4>Platform Agreement</h4>
                                                        <p className="text-muted">Use our standard agreement template. Quick and compliant.</p>
                                                        <button
                                                            className="btn btn-success btn-lg"
                                                            onClick={handleSendPlatformAgreement}
                                                            disabled={sendingPlatform}
                                                        >
                                                            {sendingPlatform ? <><i className="fas fa-spinner fa-spin mr-2"></i>Sending...</> : <><i className="fas fa-paper-plane mr-2"></i>Send Platform Agreement</>}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="card h-100 border-info">
                                                    <div className="card-body text-center">
                                                        <i className="fas fa-file-upload fa-4x text-info mb-3"></i>
                                                        <h4>Custom Agreement</h4>
                                                        <p className="text-muted">Upload your own contract (PDF or DOCX).</p>
                                                        <div className="mb-3">
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                accept=".pdf,.docx"
                                                                onChange={handleFileChange}
                                                                disabled={uploading}
                                                                ref={fileInputRef}
                                                            />
                                                        </div>
                                                        {uploadFile && (
                                                            <button
                                                                className="btn btn-info btn-lg"
                                                                onClick={handleUploadCustomAgreement}
                                                                disabled={uploading}
                                                            >
                                                                {uploading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Uploading...</> : <><i className="fas fa-upload mr-2"></i>Upload & Send</>}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Agreement Preview for Step 1 */}
                                <div className="card mt-4">
                                    <div className="card-header bg-light">
                                        <h5 className="mb-0">
                                            <i className="fas fa-eye mr-2"></i>Platform Agreement Preview
                                            <small className="text-muted ml-2">(What will be sent if you choose Platform Agreement)</small>
                                        </h5>
                                    </div>
                                    <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                                        {agreement ? (
                                            <AgreementTemplateRouter agreement={agreement} />
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STEP 2: Waiting for Applicant */}
                        {currentStep === 2 && (
                            <div className="card border-warning">
                                <div className="card-header bg-warning">
                                    <h4 className="mb-0"><i className="fas fa-hourglass-half mr-2"></i>Step 2: Waiting for Applicant</h4>
                                </div>
                                <div className="card-body text-center py-5">
                                    <i className="fas fa-user-clock fa-5x text-warning mb-4"></i>
                                    <h3>The applicant is reviewing the agreement</h3>
                                    <p className="lead text-muted">They need to enter their placement fee and sign. You'll be notified when it's your turn.</p>
                                    <div className="alert alert-info d-inline-block">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        Agreement sent on {agreement?.sent_to_applicant_at ? new Date(agreement.sent_to_applicant_at).toLocaleDateString() : 'recently'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Publisher Signs */}
                        {currentStep === 3 && (
                            <div className="card border-success">
                                <div className="card-header bg-success text-white">
                                    <h4 className="mb-0"><i className="fas fa-pen mr-2"></i>Step 3: Review & Sign</h4>
                                </div>
                                <div className="card-body">
                                    <div className="alert alert-success mb-4">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        <strong>The applicant has signed!</strong> {applicantFees ? 'Review their placement fee below and sign to complete the agreement.' : 'Sign below to complete the agreement.'}
                                    </div>

                                    {/* Applicant's Fee - Only shown for agency/headhunter applicants */}
                                    {applicantFees && (
                                        <div className="card bg-light mb-4">
                                            <div className="card-body">
                                                <h5><i className="fas fa-dollar-sign mr-2 text-success"></i>Applicant's Placement Fee</h5>
                                                <div className="display-4 text-success font-weight-bold">
                                                    ${parseFloat(applicantFees.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })} CAD
                                                </div>
                                                <p className="text-muted mt-2 mb-0">
                                                    <i className="fas fa-exclamation-triangle text-warning mr-2"></i>
                                                    By signing, you agree to pay this fee to the applicant.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Signature Form */}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label><strong>Your Full Name *</strong></label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    value={signedName}
                                                    onChange={(e) => setSignedName(e.target.value)}
                                                    placeholder="Enter your full legal name"
                                                    disabled={submitting}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label><strong>Your Signature *</strong></label>
                                                <div className="border rounded bg-white p-2">
                                                    <SignatureCanvas
                                                        ref={signatureRef}
                                                        canvasProps={{
                                                            style: { width: '100%', height: '150px', border: '1px solid #ddd', borderRadius: '4px' }
                                                        }}
                                                    />
                                                </div>
                                                <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={handleClearSignature}>
                                                    <i className="fas fa-redo mr-1"></i>Clear
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="agreedToTerms"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            />
                                            <label className="custom-control-label" htmlFor="agreedToTerms">
                                                I agree to the terms of this agreement and the placement fee above *
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-success btn-lg btn-block"
                                        onClick={handleSubmitSignature}
                                        disabled={submitting || !signedName || !agreedToTerms}
                                    >
                                        {submitting ? <><i className="fas fa-spinner fa-spin mr-2"></i>Signing...</> : <><i className="fas fa-check mr-2"></i>Accept Fee & Sign Agreement</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Agreement Preview */}
                        {currentStep !== 1 && (
                            <div className="card mt-4">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        <i className="fas fa-file-alt mr-2"></i>Agreement Preview
                                        {agreement?.is_custom_agreement && <span className="badge badge-info ml-2">Custom</span>}
                                    </h5>
                                </div>
                                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                                    {agreement?.is_custom_agreement ? (
                                        <div className="text-center py-4">
                                            <i className="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                                            <p>Custom agreement uploaded</p>
                                            <button className="btn btn-outline-primary" onClick={() => AgreementService.previewCustomAgreement(agreementId)}>
                                                <i className="fas fa-external-link-alt mr-2"></i>View PDF
                                            </button>
                                        </div>
                                    ) : agreement ? (
                                        <AgreementTemplateRouter agreement={agreement} />
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        );
    }

    // ========================================
    // APPLICANT VIEW
    // ========================================
    return (
        <div className="" style={{ marginTop: '15px' }}>
            <div className="content-header">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="m-0">
                            <i className="fas fa-file-signature mr-2"></i>
                            Agreement #{agreement?.agreement_number}
                        </h1>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/institute/agreements')}
                        >
                            <i className="fas fa-arrow-left mr-2"></i>Back to Agreements
                        </button>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-danger alert-dismissible">
                            <button type="button" className="close" onClick={() => setError(null)}>×</button>
                            <i className="fas fa-exclamation-triangle mr-2"></i>{error}
                        </div>
                    )}

                    {/* PROGRESS STEPS - TOP OF PAGE */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                {/* Step 1 */}
                                <div className="text-center flex-fill">
                                    <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 ${currentStep > 1 ? 'bg-success' : currentStep === 1 ? 'bg-primary' : 'bg-secondary'} text-white`} style={{ width: '50px', height: '50px' }}>
                                        {currentStep > 1 ? <i className="fas fa-check"></i> : <span className="h5 mb-0">1</span>}
                                    </div>
                                    <div className={`font-weight-bold ${currentStep === 1 ? 'text-primary' : ''}`}>
                                        {requiresFeeInput ? 'Enter Fee' : 'Review'}
                                    </div>
                                    <small className="text-muted">{requiresFeeInput ? 'Add your fee' : 'Read agreement'}</small>
                                </div>
                                <div className={`flex-fill`} style={{ height: '3px', backgroundColor: currentStep > 1 ? '#28a745' : '#dee2e6', maxWidth: '100px' }}></div>

                                {/* Step 2 */}
                                <div className="text-center flex-fill">
                                    <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 ${currentStep > 2 ? 'bg-success' : currentStep === 2 ? 'bg-primary' : 'bg-secondary'} text-white`} style={{ width: '50px', height: '50px' }}>
                                        {currentStep > 2 ? <i className="fas fa-check"></i> : <span className="h5 mb-0">2</span>}
                                    </div>
                                    <div className={`font-weight-bold ${currentStep === 2 ? 'text-primary' : ''}`}>Sign</div>
                                    <small className="text-muted">Add your signature</small>
                                </div>
                                <div className={`flex-fill`} style={{ height: '3px', backgroundColor: currentStep > 2 ? '#28a745' : '#dee2e6', maxWidth: '100px' }}></div>

                                {/* Step 3 */}
                                <div className="text-center flex-fill">
                                    <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 ${currentStep > 3 ? 'bg-success' : currentStep === 3 ? 'bg-warning' : 'bg-secondary'} text-white`} style={{ width: '50px', height: '50px' }}>
                                        {currentStep > 3 ? <i className="fas fa-check"></i> : <span className="h5 mb-0">3</span>}
                                    </div>
                                    <div className={`font-weight-bold ${currentStep === 3 ? 'text-warning' : ''}`}>Publisher Signs</div>
                                    <small className="text-muted">Wait for publisher</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Already Signed */}
                    {agreement?.agency_signed && (
                        <div className="card border-success">
                            <div className="card-header bg-success text-white">
                                <h4 className="mb-0"><i className="fas fa-check-circle mr-2"></i>You Have Signed</h4>
                            </div>
                            <div className="card-body text-center py-5">
                                <i className="fas fa-hourglass-half fa-5x text-warning mb-4"></i>
                                <h3>Waiting for Publisher</h3>
                                <p className="lead text-muted">You have signed this agreement. The publisher will review your fee and sign to complete.</p>
                                {agencyFees && (
                                    <div className="alert alert-info d-inline-block">
                                        <strong>Your submitted fee:</strong> ${parseFloat(agencyFees).toLocaleString('en-CA', { minimumFractionDigits: 2 })} CAD
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sign Form - Only if not signed yet */}
                    {!agreement?.agency_signed && (
                        <div className="card border-primary">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">
                                    <i className="fas fa-pen mr-2"></i>
                                    {requiresFeeInput ? 'Enter Your Fee & Sign' : 'Sign Agreement'}
                                </h4>
                            </div>
                            <div className="card-body">
                                {/* Fee Input */}
                                {requiresFeeInput && (
                                    <div className="card bg-light mb-4">
                                        <div className="card-body">
                                            <h5><i className="fas fa-dollar-sign mr-2 text-warning"></i>Your Placement Fee</h5>
                                            <p className="text-muted">Enter the fee you're charging the publisher. They will review this before signing.</p>
                                            <div className="input-group input-group-lg" style={{ maxWidth: '300px' }}>
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={agencyFees}
                                                    onChange={(e) => setAgencyFees(e.target.value)}
                                                    placeholder="5000.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">CAD</span>
                                                </div>
                                            </div>
                                            {agencyFees && parseFloat(agencyFees) > 0 && (
                                                <div className="mt-2 text-success">
                                                    <i className="fas fa-check-circle mr-1"></i>
                                                    Fee: ${parseFloat(agencyFees).toLocaleString('en-CA', { minimumFractionDigits: 2 })} CAD
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Signature Form */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label><strong>Your Full Name *</strong></label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={signedName}
                                                onChange={(e) => setSignedName(e.target.value)}
                                                placeholder="Enter your full legal name"
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label><strong>Your Signature *</strong></label>
                                            <div className="border rounded bg-white p-2">
                                                <SignatureCanvas
                                                    ref={signatureRef}
                                                    canvasProps={{
                                                        style: { width: '100%', height: '150px', border: '1px solid #ddd', borderRadius: '4px' }
                                                    }}
                                                />
                                            </div>
                                            <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={handleClearSignature}>
                                                <i className="fas fa-redo mr-1"></i>Clear
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="agreedToTerms"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        />
                                        <label className="custom-control-label" htmlFor="agreedToTerms">
                                            I agree to the terms of this agreement *
                                        </label>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-success btn-lg btn-block"
                                    onClick={handleSubmitSignature}
                                    disabled={submitting || !signedName || !agreedToTerms || (requiresFeeInput && (!agencyFees || parseFloat(agencyFees) <= 0))}
                                >
                                    {submitting ? (
                                        <><i className="fas fa-spinner fa-spin mr-2"></i>Signing...</>
                                    ) : (
                                        <><i className="fas fa-check mr-2"></i>{requiresFeeInput ? 'Submit Fee & Sign' : 'Sign Agreement'}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Agreement Preview */}
                    <div className="card mt-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-file-alt mr-2"></i>Agreement Preview
                                {agreement?.is_custom_agreement && <span className="badge badge-info ml-2">Custom</span>}
                            </h5>
                        </div>
                        <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                            {agreement?.is_custom_agreement ? (
                                <div className="text-center py-4">
                                    <i className="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                                    <p>Custom agreement uploaded by publisher</p>
                                    <button className="btn btn-outline-primary" onClick={() => AgreementService.previewCustomAgreement(agreementId)}>
                                        <i className="fas fa-external-link-alt mr-2"></i>View PDF
                                    </button>
                                </div>
                            ) : agreement ? (
                                <AgreementTemplateRouter agreement={agreement} />
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AgreementSignature;
