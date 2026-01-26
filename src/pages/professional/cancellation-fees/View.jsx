import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const View = () => {
    const [pendingFees, setPendingFees] = useState(null);
    const [loading, setLoading] = useState(true);
    const sessionUserRole = sessionStorage.getItem("role") || "professional";

    useEffect(() => {
        fetchPendingFees();
    }, []);

    const fetchPendingFees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/v.1/professional/pending-cancellation-fees');
            if (response.data.status) {
                setPendingFees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching pending fees:', error);
            setPendingFees({ fees: [], total_amount: 0, has_outstanding_fees: false });
        } finally {
            setLoading(false);
        }
    };

    const handlePayFee = (fee) => {
        if (fee.payment_url) {
            window.open(fee.payment_url, '_blank');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Payment Error',
                text: 'Unable to create payment session. Please try again later.',
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="content-wrapper">
            <style>{`
                .fees-page {
                    padding: 24px;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .fees-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    padding: 24px;
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: 16px;
                    border: 2px solid #f59e0b;
                }

                .fees-header-content {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .fees-header-icon {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                }

                .fees-header-text h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #92400e;
                }

                .fees-header-text p {
                    margin: 4px 0 0 0;
                    color: #b45309;
                    font-size: 0.9rem;
                }

                .fees-header-total {
                    text-align: right;
                }

                .fees-header-total .label {
                    display: block;
                    font-size: 0.75rem;
                    color: #92400e;
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .fees-header-total .amount {
                    display: block;
                    font-size: 2rem;
                    font-weight: 800;
                    color: #b45309;
                }

                .fees-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .fee-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }

                .fee-card:hover {
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
                    transform: translateY(-2px);
                }

                .fee-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .fee-contract-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .fee-contract-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1rem;
                }

                .fee-contract-details h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .fee-contract-details span {
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .fee-status {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .fee-status.pending {
                    background: #fef3c7;
                    color: #92400e;
                }

                .fee-card-body {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .fee-details {
                    display: flex;
                    gap: 32px;
                }

                .fee-detail-item {
                    display: flex;
                    flex-direction: column;
                }

                .fee-detail-item .label {
                    font-size: 0.75rem;
                    color: #6b7280;
                    text-transform: uppercase;
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                .fee-detail-item .value {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .fee-detail-item .value.amount {
                    font-size: 1.25rem;
                    color: #b45309;
                }

                .fee-actions {
                    display: flex;
                    gap: 12px;
                }

                .pay-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pay-btn:hover {
                    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .empty-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 20px;
                    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: #059669;
                }

                .empty-state h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.25rem;
                    color: #1f2937;
                }

                .empty-state p {
                    margin: 0 0 20px 0;
                    color: #6b7280;
                }

                .browse-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .browse-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                    color: white;
                }

                .loading-state {
                    text-align: center;
                    padding: 60px 20px;
                }

                .loading-spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e5e7eb;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .info-box {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .info-box i {
                    color: #3b82f6;
                    font-size: 1.25rem;
                    margin-top: 2px;
                }

                .info-box-content h4 {
                    margin: 0 0 4px 0;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #1e40af;
                }

                .info-box-content p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #3b82f6;
                }

                @media (max-width: 768px) {
                    .fees-header {
                        flex-direction: column;
                        text-align: center;
                        gap: 16px;
                    }

                    .fees-header-content {
                        flex-direction: column;
                    }

                    .fees-header-total {
                        text-align: center;
                    }

                    .fee-card-body {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .fee-details {
                        flex-wrap: wrap;
                        gap: 16px;
                    }

                    .fee-actions {
                        width: 100%;
                    }

                    .pay-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>

            <div className="fees-page">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading fees...</p>
                    </div>
                ) : pendingFees?.has_outstanding_fees ? (
                    <>
                        <div className="fees-header">
                            <div className="fees-header-content">
                                <div className="fees-header-icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div className="fees-header-text">
                                    <h1>Cancellation Fees</h1>
                                    <p>Outstanding fees that must be paid before applying to new contracts</p>
                                </div>
                            </div>
                            <div className="fees-header-total">
                                <span className="label">Total Outstanding</span>
                                <span className="amount">${pendingFees.total_amount?.toFixed(2)} CAD</span>
                            </div>
                        </div>

                        <div className="info-box">
                            <i className="fas fa-info-circle"></i>
                            <div className="info-box-content">
                                <h4>Why do I have cancellation fees?</h4>
                                <p>Cancellation fees are applied when you withdraw from a booked contract within 48 hours of the start date. This helps ensure reliability for healthcare facilities.</p>
                            </div>
                        </div>

                        <div className="fees-list">
                            {pendingFees.fees.map((fee) => (
                                <div key={fee.id} className="fee-card">
                                    <div className="fee-card-header">
                                        <div className="fee-contract-info">
                                            <div className="fee-contract-icon">
                                                <i className="fas fa-file-contract"></i>
                                            </div>
                                            <div className="fee-contract-details">
                                                <h3>{fee.contract_title || `Contract #${fee.contract_id}`}</h3>
                                                <span>Application #{fee.application_id}</span>
                                            </div>
                                        </div>
                                        <span className="fee-status pending">Pending Payment</span>
                                    </div>
                                    <div className="fee-card-body">
                                        <div className="fee-details">
                                            <div className="fee-detail-item">
                                                <span className="label">Fee Amount</span>
                                                <span className="value amount">${fee.amount?.toFixed(2)} CAD</span>
                                            </div>
                                            <div className="fee-detail-item">
                                                <span className="label">Fee Rate</span>
                                                <span className="value">{fee.percentage}%</span>
                                            </div>
                                            <div className="fee-detail-item">
                                                <span className="label">Date Incurred</span>
                                                <span className="value">{formatDate(fee.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="fee-actions">
                                            <button className="pay-btn" onClick={() => handlePayFee(fee)}>
                                                <i className="fas fa-credit-card"></i>
                                                Pay Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h3>No Outstanding Fees</h3>
                        <p>You don't have any pending cancellation fees. You're all set!</p>
                        <Link to={`/${sessionUserRole}/published-contracts`} className="browse-btn">
                            <i className="fas fa-search"></i>
                            Browse Available Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default View;
