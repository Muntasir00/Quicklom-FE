import React from "react";
import { useNavigate } from "react-router-dom";
import "./ContractDetailsModal.css";

const ContractDetailsModal = ({ contract, onClose }) => {
    const navigate = useNavigate();

    if (!contract) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || "";
        switch (statusLower) {
            case 'open': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'booked': return 'badge-info';
            case 'closed': return 'badge-secondary';
            case 'cancelled': return 'badge-danger';
            default: return 'badge-primary';
        }
    };

    const handleViewContract = () => {
        const role = sessionStorage.getItem('role');
        const instituteCategoryId = sessionStorage.getItem('institute_category_id');

        // Use is_publisher from backend (already calculated on server)
        const isPublisher = contract.is_publisher ?? false;

        // Debug logging
        console.log('🔍 ContractDetailsModal Debug:', {
            role,
            instituteCategoryId,
            contractPublisherId: contract.publisher_id,
            isPublisher,
            contract
        });

        // Determine redirect based on user role
        if (role === 'professional') {
            // Professionals always go to applications
            navigate(`/${role}/contract-applications?contract_id=${contract.contract_id}`);
        } else if (role === 'institute') {
            // Check if they are publisher or applicant using backend field
            if (isPublisher) {
                // They published this contract, go to My Contracts
                navigate(`/${role}/contracts?contract_id=${contract.contract_id}`);
            } else {
                // They applied to this contract, go to Applications (contract-applications for applicants)
                navigate(`/${role}/contract-applications?contract_id=${contract.contract_id}`);
            }
        }

        onClose();
    };

    return (
        <div className="contract-modal-overlay" onClick={onClose}>
            <div className="contract-modal" onClick={(e) => e.stopPropagation()}>
                <div className="contract-modal-header">
                    <h5 className="contract-modal-title">
                        <i className="fas fa-file-contract mr-2"></i>
                        Contract Details
                    </h5>
                    <button className="contract-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="contract-modal-body">
                    {/* Contract ID & Status */}
                    <div className="contract-detail-row">
                        <div className="contract-detail-label">
                            <i className="fas fa-hashtag mr-2"></i>
                            Contract ID
                        </div>
                        <div className="contract-detail-value">
                            #{contract.contract_id}
                        </div>
                    </div>

                    {/* Contract Name */}
                    <div className="contract-detail-row">
                        <div className="contract-detail-label">
                            <i className="fas fa-signature mr-2"></i>
                            Contract Name
                        </div>
                        <div className="contract-detail-value">
                            {contract.contract_name || "Unnamed Contract"}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="contract-detail-row">
                        <div className="contract-detail-label">
                            <i className="fas fa-info-circle mr-2"></i>
                            Status
                        </div>
                        <div className="contract-detail-value">
                            <span className={`badge ${getStatusColor(contract.contract_status)}`}>
                                {contract.contract_status || "Unknown"}
                            </span>
                        </div>
                    </div>

                    {/* Location */}
                    {contract.location && contract.location !== 'N/A' && (
                        <div className="contract-detail-row">
                            <div className="contract-detail-label">
                                <i className="fas fa-map-marker-alt mr-2"></i>
                                Location
                            </div>
                            <div className="contract-detail-value">
                                {contract.location}
                            </div>
                        </div>
                    )}

                    {/* Position Sought */}
                    {contract.position_sought && contract.position_sought !== 'N/A' && (
                        <div className="contract-detail-row">
                            <div className="contract-detail-label">
                                <i className="fas fa-user-md mr-2"></i>
                                Position
                            </div>
                            <div className="contract-detail-value">
                                {contract.position_sought}
                            </div>
                        </div>
                    )}

                    {/* Specialty (for Dentistry) */}
                    {contract.specialty && (
                        <div className="contract-detail-row">
                            <div className="contract-detail-label">
                                <i className="fas fa-tooth mr-2"></i>
                                Specialty
                            </div>
                            <div className="contract-detail-value">
                                {contract.specialty}
                            </div>
                        </div>
                    )}

                    {/* Dates */}
                    {contract.start_date && (
                        <div className="contract-detail-row">
                            <div className="contract-detail-label">
                                <i className="fas fa-calendar-plus mr-2"></i>
                                Start Date
                            </div>
                            <div className="contract-detail-value">
                                {formatDate(contract.start_date)}
                            </div>
                        </div>
                    )}

                    {contract.end_date && (
                        <div className="contract-detail-row">
                            <div className="contract-detail-label">
                                <i className="fas fa-calendar-minus mr-2"></i>
                                End Date
                            </div>
                            <div className="contract-detail-value">
                                {formatDate(contract.end_date)}
                            </div>
                        </div>
                    )}

                    {/* Application Info */}
                    {contract.application_id && (
                        <>
                            <div className="contract-detail-divider"></div>

                            <div className="contract-detail-row">
                                <div className="contract-detail-label">
                                    <i className="fas fa-file-alt mr-2"></i>
                                    Application ID
                                </div>
                                <div className="contract-detail-value">
                                    #{contract.application_id}
                                </div>
                            </div>

                            {contract.application_status && (
                                <div className="contract-detail-row">
                                    <div className="contract-detail-label">
                                        <i className="fas fa-clipboard-check mr-2"></i>
                                        Application Status
                                    </div>
                                    <div className="contract-detail-value">
                                        <span className={`badge ${getStatusColor(contract.application_status)}`}>
                                            {contract.application_status}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {contract.applied_at && (
                                <div className="contract-detail-row">
                                    <div className="contract-detail-label">
                                        <i className="fas fa-clock mr-2"></i>
                                        Applied At
                                    </div>
                                    <div className="contract-detail-value">
                                        {formatDate(contract.applied_at)}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="contract-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        <i className="fas fa-times mr-2"></i>
                        Close
                    </button>
                    <button className="btn btn-primary" onClick={handleViewContract}>
                        <i className="fas fa-eye mr-2"></i>
                        {(() => {
                            const role = sessionStorage.getItem('role');
                            const isPublisher = contract.is_publisher ?? false;

                            if (role === 'professional') {
                                return 'View in Applications';
                            } else if (role === 'institute') {
                                if (isPublisher) {
                                    return 'View in My Contracts';
                                } else {
                                    return 'View in Applications';
                                }
                            }
                            return 'View Contract';
                        })()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractDetailsModal;