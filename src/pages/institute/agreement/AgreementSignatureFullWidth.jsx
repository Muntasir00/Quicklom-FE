/**
 * Agreement Signature Page - Full Width Version
 * Testing full-width layout without AdminLTE constraints
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import DOMPurify from 'dompurify';
import AgreementService from '@services/institute/AgreementService';
import { getCurrentUserService } from '@services/user/AuthService';

const AgreementSignatureFullWidth = () => {
    const { agreementId } = useParams();
    const navigate = useNavigate();
    const signatureRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [agreement, setAgreement] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [myRole, setMyRole] = useState(null);
    const [signedName, setSignedName] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreementHtml, setAgreementHtml] = useState('');
    const [showFeeForm, setShowFeeForm] = useState(false);
    const [agencyFees, setAgencyFees] = useState('');
    const [feesSubmitted, setFeesSubmitted] = useState(false);

    useEffect(() => {
        loadAgreement();
        loadAgreementHtml();
    }, [agreementId]);

    const loadAgreementHtml = async () => {
        try {
            const response = await axios.get(`/v.1/institute/agreements/${agreementId}/preview`);
            setAgreementHtml(response.data);
        } catch (err) {
            console.error('Error loading agreement HTML:', err);
        }
    };

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

            if (role === 'agency') {
                const fees = response.agreement.agreement_data?.fees || {};
                if (fees.requiresInput === true) {
                    setShowFeeForm(true);
                    setFeesSubmitted(false);
                } else {
                    setShowFeeForm(false);
                    setFeesSubmitted(true);
                    if (fees.agencyFees) {
                        setAgencyFees(fees.agencyFees.toString());
                    }
                }
            }

            if (role === 'client' && response.agreement.client_signed) {
                setError('You have already signed this agreement.');
            } else if (role === 'agency' && response.agreement.agency_signed) {
                setError('You have already signed this agreement.');
            }

            if (role === 'client' && !response.agreement.agency_signed) {
                setError('The applicant (agency/professional) must sign this agreement first.');
            }

        } catch (err) {
            console.error('Error loading agreement:', err);
            setError('Failed to load agreement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFees = async () => {
        if (!agencyFees || parseFloat(agencyFees) <= 0) {
            alert('Please enter a valid fee amount');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await AgreementService.updateAgreementFees(agreementId, parseFloat(agencyFees));
            setFeesSubmitted(true);
            setShowFeeForm(false);
            alert('Fee updated successfully! You can now sign the agreement.');
            await loadAgreement();
        } catch (err) {
            console.error('Error updating fees:', err);
            setError(err.response?.data?.detail || 'Failed to update fee. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
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

        if (myRole === 'agency' && showFeeForm) {
            alert('Please submit your fee before signing');
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
                alert('Agreement fully signed! Contract has been booked and invoices generated.');
            } else {
                alert('Agreement signed successfully! Waiting for the other party to sign.');
            }

            navigate('/institute/agreements');

        } catch (err) {
            console.error('Error signing agreement:', err);
            setError(err.response?.data?.detail || 'Failed to submit signature. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const styles = {
        pageContainer: {
            minHeight: '100vh',
            backgroundColor: '#f4f6f9',
            padding: 0,
            margin: 0,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
        },
        header: {
            backgroundColor: '#fff',
            borderBottom: '1px solid #dee2e6',
            padding: '20px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        },
        content: {
            padding: '30px 40px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
        },
        card: {
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            marginBottom: '30px',
            overflow: 'hidden'
        },
        cardHeader: {
            padding: '20px 30px',
            borderBottom: '1px solid #eee',
            fontWeight: '600',
            fontSize: '18px'
        },
        cardBody: {
            padding: '30px'
        },
        button: {
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
        },
        buttonPrimary: {
            backgroundColor: '#007bff',
            color: '#fff'
        },
        buttonSuccess: {
            backgroundColor: '#28a745',
            color: '#fff'
        },
        buttonSecondary: {
            backgroundColor: '#6c757d',
            color: '#fff'
        },
        input: {
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxSizing: 'border-box',
            marginTop: '8px'
        },
        alert: {
            padding: '15px 20px',
            borderRadius: '6px',
            marginBottom: '20px'
        },
        alertDanger: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb'
        },
        alertWarning: {
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeaa7'
        },
        alertSuccess: {
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb'
        },
        agreementScroll: {
            maxHeight: '500px',
            overflowY: 'auto',
            backgroundColor: '#fafafa',
            padding: '30px',
            borderRadius: '6px'
        }
    };

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.header}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>Loading Agreement...</h1>
                </div>
                <div style={{ ...styles.content, textAlign: 'center', paddingTop: '100px' }}>
                    <div style={{ fontSize: '48px', color: '#007bff' }}>⏳</div>
                    <p style={{ fontSize: '18px', color: '#6c757d', marginTop: '20px' }}>Please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                    📝 Sign Agreement #{agreement?.agreement_number}
                </h1>
                <button
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                    onClick={() => navigate('/institute/agreements')}
                >
                    ← Back to Agreements
                </button>
            </div>

            {/* Main Content */}
            <div style={styles.content}>
                {/* Error Alert */}
                {error && (
                    <div style={{ ...styles.alert, ...styles.alertDanger }}>
                        <strong>⚠️ {error}</strong>
                    </div>
                )}

                {/* Fee Input Form */}
                {showFeeForm && myRole === 'agency' && (
                    <div style={styles.card}>
                        <div style={{ ...styles.cardHeader, backgroundColor: '#ffc107', color: '#000' }}>
                            💰 Enter Your Placement Fee
                        </div>
                        <div style={styles.cardBody}>
                            <div style={{ ...styles.alert, backgroundColor: '#e7f3ff', color: '#004085', border: '1px solid #b8daff' }}>
                                <strong>Agency/Headhunter Fee:</strong><br/>
                                Enter the fee you're charging the contract publisher. This is separate from QuickLocum's service fees.
                            </div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Your Placement Fee (CAD) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                style={styles.input}
                                value={agencyFees}
                                onChange={(e) => setAgencyFees(e.target.value)}
                                placeholder="e.g., 5000.00"
                                disabled={submitting}
                            />
                            <button
                                style={{ ...styles.button, ...styles.buttonSuccess, width: '100%', marginTop: '20px' }}
                                onClick={handleSubmitFees}
                                disabled={submitting || !agencyFees}
                            >
                                {submitting ? '⏳ Submitting...' : '✓ Submit Fee & Continue'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Agreement Preview */}
                <div style={styles.card}>
                    <div style={{ ...styles.cardHeader, backgroundColor: '#007bff', color: '#fff' }}>
                        📄 Agreement Document
                    </div>
                    <div style={styles.cardBody}>
                        <p style={{ marginBottom: '20px', color: '#6c757d' }}>
                            Please read the full agreement carefully before signing
                        </p>
                        <div style={styles.agreementScroll}>
                            {agreementHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(agreementHtml) }} />
                            ) : (
                                <p style={{ textAlign: 'center', color: '#6c757d' }}>Loading agreement content...</p>
                            )}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                style={{ ...styles.button, ...styles.buttonPrimary }}
                                onClick={() => AgreementService.previewAgreement(agreementId)}
                            >
                                🔍 Open Full Agreement in New Window
                            </button>
                        </div>
                    </div>
                </div>

                {/* Signature Section */}
                <div style={styles.card}>
                    <div style={{ ...styles.cardHeader, backgroundColor: '#ffc107', color: '#000' }}>
                        ✍️ Your Signature
                    </div>
                    <div style={styles.cardBody}>
                        {/* Role Badge */}
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                backgroundColor: myRole === 'client' ? '#007bff' : '#28a745',
                                color: '#fff',
                                fontWeight: '500'
                            }}>
                                Signing as: {myRole === 'client' ? 'Client' : 'Agency/Professional'}
                            </span>
                        </div>

                        {/* Fee Status */}
                        {myRole === 'agency' && feesSubmitted && (
                            <div style={{ ...styles.alert, ...styles.alertSuccess, marginBottom: '20px' }}>
                                ✓ {agencyFees > 0 ? `Fee submitted: $${parseFloat(agencyFees).toFixed(2)} CAD` : 'No fee required (Professional)'}
                            </div>
                        )}

                        {/* Name Input */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                style={styles.input}
                                value={signedName}
                                onChange={(e) => setSignedName(e.target.value)}
                                placeholder="Enter your full legal name"
                                disabled={submitting}
                            />
                        </div>

                        {/* Signature Canvas */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                                Signature *
                            </label>
                            <div style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: '#fff' }}>
                                <SignatureCanvas
                                    ref={signatureRef}
                                    canvasProps={{
                                        style: {
                                            width: '100%',
                                            height: '200px',
                                            border: '1px dashed #ccc',
                                            borderRadius: '4px'
                                        }
                                    }}
                                />
                            </div>
                            <button
                                style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '10px', fontSize: '14px', padding: '8px 16px' }}
                                onClick={handleClearSignature}
                                disabled={submitting}
                            >
                                🔄 Clear Signature
                            </button>
                        </div>

                        {/* Terms Checkbox */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    disabled={submitting}
                                    style={{ marginRight: '10px', width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '16px' }}>
                                    I have read and agree to the terms and conditions of this agreement *
                                </span>
                            </label>
                            <small style={{ color: '#6c757d', marginLeft: '30px', display: 'block', marginTop: '5px' }}>
                                ℹ️ IP address and timestamp will be recorded
                            </small>
                        </div>

                        {/* Submit Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <button
                                style={{ ...styles.button, ...styles.buttonSuccess }}
                                onClick={handleSubmitSignature}
                                disabled={
                                    submitting ||
                                    !signedName ||
                                    !agreedToTerms ||
                                    showFeeForm ||
                                    (myRole === 'client' && !agreement?.agency_signed)
                                }
                            >
                                {submitting ? '⏳ Submitting...' : '✓ Sign Agreement'}
                            </button>
                            <button
                                style={{ ...styles.button, ...styles.buttonSecondary }}
                                onClick={() => navigate('/institute/agreements')}
                                disabled={submitting}
                            >
                                ✕ Cancel
                            </button>
                        </div>

                        {/* Signature Status */}
                        {agreement && (
                            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                <h6 style={{ marginBottom: '15px', fontWeight: '600' }}>Signature Status:</h6>
                                <div>
                                    <div style={{ marginBottom: '10px' }}>
                                        {agreement.agency_signed ? '✅' : '⏳'} Agency: {agreement.agency_signed ? 'Signed' : 'Pending'}
                                    </div>
                                    <div>
                                        {agreement.client_signed ? '✅' : '⏳'} Client: {agreement.client_signed ? 'Signed' : 'Pending'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgreementSignatureFullWidth;
