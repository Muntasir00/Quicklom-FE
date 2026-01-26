import React, { useState } from "react";
import { Modal, Button, Badge as BootstrapBadge } from "react-bootstrap";
import { Chip, Tooltip, Divider } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import TranslateIcon from '@mui/icons-material/Translate';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

const ViewCandidatesModal = ({ show, setShow, candidates, applicationData, onAcceptCandidate, acceptedCandidateId }) => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    if (!candidates || candidates.length === 0) {
        return (
            <Modal show={show} onHide={() => setShow(false)} size="md" centered>
                <Modal.Header closeButton style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <Modal.Title className="d-flex align-items-center">
                        <PersonIcon className="mr-2" style={{ color: '#3b82f6' }} />
                        <span>Proposed Candidates</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-5">
                    <PersonIcon style={{ fontSize: 64, color: '#cbd5e1', marginBottom: '1rem' }} />
                    <h5 className="text-muted">No Candidates Found</h5>
                    <p className="text-muted small">There are no candidates associated with this application.</p>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '2px solid #e5e7eb' }}>
                    <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        try {
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return dateString;
        }
    };

    const getExperienceColor = (experience) => {
        const exp = experience?.toLowerCase();
        if (exp?.includes('entry')) return '#3b82f6';
        if (exp?.includes('intermediate')) return '#8b5cf6';
        if (exp?.includes('experienced') || exp?.includes('senior')) return '#059669';
        return '#6b7280';
    };

    const handleAccept = (candidateId) => {
        if (onAcceptCandidate) {
            onAcceptCandidate(candidateId);
        }
    };

    return (
        <Modal
            show={show}
            onHide={() => setShow(false)}
            size="xl"
            centered
            className="candidates-modal"
            style={{ zIndex: 9999 }}
            backdrop="static"
        >
            {/* Header */}
            <Modal.Header
                closeButton
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderBottom: 'none',
                    padding: '1.5rem 2rem'
                }}
            >
                <Modal.Title className="w-100">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div className="bg-white rounded-circle p-2 mr-3 d-flex align-items-center justify-content-center"
                                 style={{ width: 42, height: 42 }}>
                                <PersonIcon style={{ fontSize: 24, color: '#667eea' }} />
                            </div>
                            <div>
                                <h5 className="mb-0" style={{ fontWeight: 600 }}>Proposed Candidates</h5>
                                <small style={{ opacity: 0.9 }}>
                                    {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'} for review
                                </small>
                            </div>
                        </div>
                        {applicationData && (
                            <Chip
                                label={applicationData.status?.toUpperCase()}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }}
                            />
                        )}
                    </div>
                </Modal.Title>
            </Modal.Header>

            {/* Body */}
            <Modal.Body style={{
                maxHeight: 'calc(100vh - 250px)',
                overflowY: 'auto',
                padding: '1.5rem 2rem',
                backgroundColor: '#f8fafc'
            }}>
                {/* Candidates Grid */}
                <div className="row">
                    {candidates.map((candidate, index) => {
                        const isAccepted = acceptedCandidateId === candidate.id;
                        const isDisabled = acceptedCandidateId && acceptedCandidateId !== candidate.id;

                        return (
                            <div key={candidate.id || index} className="col-12 mb-3">
                                <div
                                    className={`card shadow-sm candidate-card ${isAccepted ? 'border-success' : ''}`}
                                    style={{
                                        borderRadius: '12px',
                                        border: isAccepted ? '3px solid #10b981' : '1px solid #e5e7eb',
                                        backgroundColor: isDisabled ? '#f1f5f9' : 'white',
                                        opacity: isDisabled ? 0.6 : 1,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Accepted Badge Ribbon */}
                                    {isAccepted && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            background: '#10b981',
                                            color: 'white',
                                            padding: '0.5rem 2rem',
                                            transform: 'rotate(45deg) translate(30%, -50%)',
                                            transformOrigin: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            zIndex: 10,
                                            width: '200px',
                                            textAlign: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                        }}>
                                            ✓ ACCEPTED
                                        </div>
                                    )}

                                    <div className="card-body" style={{ padding: '1.5rem' }}>
                                        <div className="row">
                                            {/* Left Column - Main Info */}
                                            <div className="col-lg-7">
                                                {/* Name & Role */}
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="bg-primary rounded-circle p-2 mr-2 d-flex align-items-center justify-content-center"
                                                             style={{ width: 36, height: 36 }}>
                                                            <PersonIcon style={{ fontSize: 20, color: 'white' }} />
                                                        </div>
                                                        <div>
                                                            <h5 className="mb-0" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                                                                {candidate.first_name} {candidate.last_name || ''}
                                                            </h5>
                                                            <small className="text-muted">Candidate #{index + 1} • ID: {candidate.id}</small>
                                                        </div>
                                                    </div>

                                                    {/* Role & Experience Badges */}
                                                    <div className="d-flex gap-2 mt-2">
                                                        {candidate.primary_role && (
                                                            <Chip
                                                                icon={<WorkIcon style={{ fontSize: '0.9rem' }} />}
                                                                label={candidate.primary_role}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#3b82f6',
                                                                    color: 'white',
                                                                    fontWeight: 500,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        )}
                                                        {candidate.experience && (
                                                            <Chip
                                                                label={candidate.experience.replace('_', ' ')}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getExperienceColor(candidate.experience),
                                                                    color: 'white',
                                                                    fontWeight: 500,
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'capitalize'
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <Divider style={{ margin: '1rem 0' }} />

                                                {/* Contact Info - Compact Grid */}
                                                <div className="row">
                                                    <div className="col-md-6 mb-2">
                                                        <div className="d-flex align-items-start">
                                                            <EmailIcon style={{ fontSize: '1rem', color: '#64748b', marginTop: '2px', marginRight: '8px' }} />
                                                            <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</div>
                                                                <div className="text-dark" style={{ fontWeight: 500, wordBreak: 'break-word' }}>
                                                                    {candidate.email || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <div className="d-flex align-items-start">
                                                            <PhoneIcon style={{ fontSize: '1rem', color: '#64748b', marginTop: '2px', marginRight: '8px' }} />
                                                            <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</div>
                                                                <div className="text-dark" style={{ fontWeight: 500 }}>
                                                                    {candidate.phone || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <div className="d-flex align-items-start">
                                                            <LocationOnIcon style={{ fontSize: '1rem', color: '#64748b', marginTop: '2px', marginRight: '8px' }} />
                                                            <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                                                                <div className="text-dark" style={{ fontWeight: 500 }}>
                                                                    {candidate.city ? `${candidate.city}${candidate.province ? `, ${candidate.province}` : ''}` :
                                                                     <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not specified</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <div className="d-flex align-items-start">
                                                            <BadgeIcon style={{ fontSize: '1rem', color: '#64748b', marginTop: '2px', marginRight: '8px' }} />
                                                            <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>License</div>
                                                                <div className="text-dark" style={{ fontWeight: 500 }}>
                                                                    {candidate.license_number || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Languages */}
                                                {candidate.languages && candidate.languages.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <TranslateIcon style={{ fontSize: '1rem', color: '#64748b', marginRight: '8px' }} />
                                                            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                                                Languages
                                                            </span>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {candidate.languages.map((lang, i) => (
                                                                <BootstrapBadge
                                                                    key={i}
                                                                    bg="secondary"
                                                                    className="text-capitalize"
                                                                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: 500 }}
                                                                >
                                                                    {lang}
                                                                </BootstrapBadge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Document */}
                                                {candidate.id_upload && (
                                                    <div className="mt-3">
                                                        <a
                                                            href={`/${candidate.id_upload}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                        >
                                                            <DownloadIcon style={{ fontSize: '0.9rem', marginRight: '4px' }} />
                                                            View ID Document
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Column - Action Card */}
                                            <div className="col-lg-5">
                                                <div style={{
                                                    background: isAccepted ? '#ecfdf5' : isDisabled ? '#f8fafc' : '#f0f9ff',
                                                    borderRadius: '8px',
                                                    padding: '1.5rem',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    border: isAccepted ? '2px solid #10b981' : '1px solid #e5e7eb'
                                                }}>
                                                    {/* Additional Info */}
                                                    <div className="mb-3">
                                                        <h6 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
                                                            Additional Details
                                                        </h6>
                                                        <div style={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#64748b' }}>
                                                            {candidate.dob && (
                                                                <div className="mb-1">
                                                                    <CakeIcon style={{ fontSize: '0.9rem', marginRight: '6px', verticalAlign: 'middle' }} />
                                                                    <strong>DOB:</strong> {formatDate(candidate.dob)}
                                                                </div>
                                                            )}
                                                            {candidate.gender && (
                                                                <div className="mb-1 text-capitalize">
                                                                    <strong>Gender:</strong> {candidate.gender}
                                                                </div>
                                                            )}
                                                            {candidate.postal_code && (
                                                                <div className="mb-1">
                                                                    <strong>Postal:</strong> {candidate.postal_code}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Accept Button or Status */}
                                                    {onAcceptCandidate && (
                                                        <>
                                                            {isAccepted ? (
                                                                <div className="alert alert-success mb-0" style={{
                                                                    padding: '1rem',
                                                                    borderRadius: '8px',
                                                                    textAlign: 'center',
                                                                    border: '2px solid #10b981'
                                                                }}>
                                                                    <CheckCircleIcon style={{ fontSize: '2rem', color: '#059669', marginBottom: '0.5rem' }} />
                                                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#059669' }}>
                                                                        Candidate Accepted!
                                                                    </div>
                                                                    <small style={{ color: '#047857', display: 'block', marginTop: '0.25rem' }}>
                                                                        This candidate has been selected
                                                                    </small>
                                                                </div>
                                                            ) : isDisabled ? (
                                                                <Tooltip title="Another candidate has been selected" arrow>
                                                                    <div className="alert alert-secondary mb-0" style={{
                                                                        padding: '0.75rem',
                                                                        borderRadius: '8px',
                                                                        textAlign: 'center',
                                                                        fontSize: '0.85rem'
                                                                    }}>
                                                                        <InfoIcon style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: '#6b7280' }} />
                                                                        <div style={{ color: '#6b7280' }}>Not available</div>
                                                                    </div>
                                                                </Tooltip>
                                                            ) : applicationData?.status === 'pending' ? (
                                                                <Button
                                                                    variant="success"
                                                                    className="w-100"
                                                                    onClick={() => handleAccept(candidate.id)}
                                                                    style={{
                                                                        padding: '0.875rem',
                                                                        fontSize: '0.95rem',
                                                                        fontWeight: 600,
                                                                        borderRadius: '8px',
                                                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                                    }}
                                                                >
                                                                    <VerifiedUserIcon style={{ fontSize: '1.1rem', marginRight: '0.5rem' }} />
                                                                    Accept Candidate
                                                                </Button>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div className="alert alert-info d-flex align-items-center" style={{
                    backgroundColor: '#dbeafe',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                }}>
                    <InfoIcon style={{ color: '#1e40af', fontSize: '1.5rem', marginRight: '1rem' }} />
                    <div style={{ fontSize: '0.85rem', color: '#1e3a8a' }}>
                        <strong>Note:</strong> Once you accept a candidate, all other candidates from this application will be automatically deselected.
                    </div>
                </div>
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer style={{
                borderTop: '2px solid #e5e7eb',
                padding: '1rem 2rem',
                backgroundColor: '#f8fafc'
            }}>
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        <strong>{candidates.length}</strong> candidate{candidates.length !== 1 ? 's' : ''} total
                        {acceptedCandidateId && <span className="ml-2">• <strong style={{ color: '#10b981' }}>1 accepted</strong></span>}
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setShow(false)}
                        style={{
                            padding: '0.625rem 1.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            borderRadius: '8px'
                        }}
                    >
                        Close
                    </Button>
                </div>
            </Modal.Footer>

            <style>{`
                .candidate-card {
                    transition: all 0.2s ease;
                }

                .candidate-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
                }

                .candidates-modal {
                    z-index: 9999 !important;
                }

                .candidates-modal .modal-backdrop {
                    z-index: 9998 !important;
                }

                .candidates-modal .modal-dialog {
                    z-index: 9999 !important;
                }

                .candidates-modal .modal-content {
                    border: none;
                    border-radius: 16px;
                    overflow: hidden;
                }

                .candidates-modal .modal-header .btn-close {
                    filter: brightness(0) invert(1);
                }

                .candidates-modal .modal-body::-webkit-scrollbar {
                    width: 8px;
                }

                .candidates-modal .modal-body::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }

                .candidates-modal .modal-body::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                .candidates-modal .modal-body::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </Modal>
    );
};

export default ViewCandidatesModal;
