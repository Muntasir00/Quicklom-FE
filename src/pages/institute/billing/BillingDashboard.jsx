import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BillingService from '@services/institute/BillingService';
import { getCurrentUserService } from '@services/user/AuthService';

const BillingDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState({
        total_spent: 0,
        pending_invoices: 0,
        paid_invoices: 0,
        overdue_invoices: 0,
        current_month_spent: 0
    });
    const [userCategory, setUserCategory] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadBillingData();
    }, []);

    const loadBillingData = async () => {
        try {
            setLoading(true);
            setError(null);

            const user = await getCurrentUserService();
            setCurrentUser(user);

            const category = user.institute_category_id;
            setUserCategory(category);

            await BillingService.getOrCreateCustomer({
                user_id: user.id,
                email: user.email,
                name: user.name || user.email,
                institute_category_id: category
            });

            const statsResponse = await BillingService.getBillingStatistics();
            setStatistics(statsResponse.statistics || statistics);

        } catch (err) {
            console.error('Error loading billing data:', err);
            setError('Failed to load billing information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    };

    const getUserCategoryInfo = () => {
        const categories = {
            1: {
                name: 'Private Clinics and Practices',
                color: 'primary',
                icon: 'fas fa-hospital',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            },
            2: {
                name: 'Pharmacy',
                color: 'info',
                icon: 'fas fa-pills',
                gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
            },
            3: {
                name: 'Recruitment Agency',
                color: 'success',
                icon: 'fas fa-building',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            },
            4: {
                name: 'Head Hunter',
                color: 'warning',
                icon: 'fas fa-user-tie',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            }
        };
        return categories[userCategory] || categories[1];
    };

    const categoryInfo = getUserCategoryInfo();
    const isAgencyOrHeadhunter = userCategory === 3 || userCategory === 4;

    if (loading) {
        return (
            <div className="content-wrapper" style={{ marginTop: '15px', background: '#f8fafc', minHeight: 'calc(100vh - 57px)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading billing information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper" style={{ marginTop: '15px', background: '#f8fafc', minHeight: 'calc(100vh - 57px)' }}>
            <style>{`
                .billing-page {
                    padding: 24px;
                    width: 100%;
                }

                .billing-header {
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%);
                    border-radius: 20px;
                    padding: 32px;
                    margin-bottom: 24px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .billing-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .billing-header-content {
                    position: relative;
                    z-index: 1;
                }

                .billing-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                }

                .billing-header p {
                    opacity: 0.9;
                    margin: 0;
                    font-size: 0.95rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    margin-bottom: 12px;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .action-buttons {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 18px 32px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 1.05rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 220px;
                    text-decoration: none;
                    letter-spacing: 0.3px;
                    white-space: nowrap;
                }

                .action-btn i {
                    font-size: 1.2rem;
                }

                .action-btn-primary {
                    background: linear-gradient(145deg, #7c3aed, #6d28d9);
                    color: #ffffff;
                    box-shadow: 0 6px 20px rgba(109, 40, 217, 0.35),
                                inset 0 1px 0 rgba(255, 255, 255, 0.2);
                    border: 2px solid transparent;
                }

                .action-btn-primary:hover {
                    background: linear-gradient(145deg, #8b5cf6, #7c3aed);
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(109, 40, 217, 0.45),
                                inset 0 1px 0 rgba(255, 255, 255, 0.25);
                }

                .action-btn-primary:active {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(109, 40, 217, 0.4);
                }

                .action-btn-secondary {
                    background: linear-gradient(145deg, #0ea5e9, #0284c7);
                    color: #ffffff;
                    box-shadow: 0 6px 20px rgba(2, 132, 199, 0.35),
                                inset 0 1px 0 rgba(255, 255, 255, 0.2);
                    border: 2px solid transparent;
                }

                .action-btn-secondary:hover {
                    background: linear-gradient(145deg, #38bdf8, #0ea5e9);
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(2, 132, 199, 0.45),
                                inset 0 1px 0 rgba(255, 255, 255, 0.25);
                }

                .action-btn-secondary:active {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
                }

                .plan-card {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    margin-bottom: 24px;
                }

                .plan-header {
                    padding: 24px 32px;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .plan-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .plan-badge {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .plan-body {
                    padding: 32px;
                }

                .plan-intro {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 16px;
                    margin-bottom: 32px;
                }

                .plan-intro-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    color: white;
                    flex-shrink: 0;
                }

                .plan-intro-text h4 {
                    margin: 0 0 4px 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .plan-intro-text p {
                    margin: 0;
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .pricing-section {
                    margin-bottom: 32px;
                }

                .pricing-section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 16px;
                }

                .pricing-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }

                .pricing-table th {
                    background: #f8fafc;
                    padding: 16px;
                    text-align: center;
                    font-weight: 600;
                    color: #475569;
                    font-size: 0.85rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .pricing-table th:first-child {
                    text-align: left;
                }

                .pricing-table td {
                    padding: 20px 16px;
                    text-align: center;
                    border-bottom: 1px solid #e2e8f0;
                    vertical-align: middle;
                }

                .pricing-table td:first-child {
                    text-align: left;
                }

                .pricing-table tr:last-child td {
                    border-bottom: none;
                }

                .pricing-table tr:hover td {
                    background: #fafafa;
                }

                .fee-badge {
                    display: inline-block;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .fee-badge-green {
                    background: #dcfce7;
                    color: #166534;
                }

                .fee-badge-blue {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .fee-badge-orange {
                    background: #ffedd5;
                    color: #c2410c;
                }

                .fee-note {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-top: 6px;
                }

                .benefits-card {
                    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid #a7f3d0;
                }

                .benefits-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #166534;
                    margin-bottom: 16px;
                }

                .benefits-list {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .benefits-list li {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #166534;
                    margin-bottom: 10px;
                    font-size: 0.9rem;
                }

                .benefits-list li:last-child {
                    margin-bottom: 0;
                }

                .benefits-list li i {
                    color: #22c55e;
                }

                .subscription-highlight {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid #fcd34d;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 32px;
                }

                .subscription-info h4 {
                    margin: 0 0 4px 0;
                    color: #92400e;
                    font-size: 1rem;
                    font-weight: 700;
                }

                .subscription-info p {
                    margin: 0;
                    color: #a16207;
                    font-size: 0.85rem;
                }

                .subscription-price {
                    text-align: right;
                }

                .subscription-price .amount {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #92400e;
                }

                .subscription-price .period {
                    font-size: 0.9rem;
                    color: #a16207;
                }

                .tax-notice {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    border-radius: 12px;
                    padding: 16px 20px;
                    border-left: 4px solid #3b82f6;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .tax-notice i {
                    color: #3b82f6;
                    font-size: 1.25rem;
                }

                .tax-notice p {
                    margin: 0;
                    color: #1e40af;
                    font-size: 0.9rem;
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .billing-page {
                        padding: 16px;
                    }

                    .billing-header {
                        padding: 24px;
                        border-radius: 16px;
                    }

                    .billing-header h1 {
                        font-size: 1.5rem;
                    }

                    .action-buttons {
                        flex-direction: column;
                    }

                    .subscription-highlight {
                        flex-direction: column;
                        text-align: center;
                        gap: 16px;
                    }

                    .subscription-price {
                        text-align: center;
                    }
                }
            `}</style>

            <div className="billing-page">
                {/* Header */}
                <div className="billing-header">
                    <div className="billing-header-content">
                        <h1><i className="fas fa-credit-card mr-3"></i>Billing & Payments</h1>
                        <p>Manage your invoices, payments, and view your pricing plan</p>
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                        <span style={{ color: '#b91c1c' }}>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            style={{
                                marginLeft: 'auto',
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer'
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}>
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                        <div className="stat-value">{formatCurrency(statistics.total_spent)}</div>
                        <div className="stat-label">Total Spent</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="stat-value">{formatCurrency(statistics.current_month_spent)}</div>
                        <div className="stat-label">This Month</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white' }}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-value">{statistics.paid_invoices}</div>
                        <div className="stat-label">Paid Invoices</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{
                            background: statistics.overdue_invoices > 0
                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white'
                        }}>
                            <i className={`fas ${statistics.overdue_invoices > 0 ? 'fa-exclamation-circle' : 'fa-clock'}`}></i>
                        </div>
                        <div className="stat-value">{statistics.pending_invoices + statistics.overdue_invoices}</div>
                        <div className="stat-label">{statistics.overdue_invoices > 0 ? 'Overdue' : 'Pending'}</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button className="action-btn action-btn-primary" onClick={() => navigate('invoices')}>
                        <i className="fas fa-file-invoice"></i>
                        View Invoices
                    </button>
                    <button className="action-btn action-btn-secondary" onClick={() => navigate('history')}>
                        <i className="fas fa-history"></i>
                        Payment History
                    </button>
                </div>

                {/* Plan Card */}
                <div className="plan-card">
                    <div className="plan-header" style={{ background: categoryInfo.gradient }}>
                        <h3>
                            <i className={categoryInfo.icon}></i>
                            Your Plan
                        </h3>
                        <span className="plan-badge">{categoryInfo.name}</span>
                    </div>
                    <div className="plan-body">
                        {/* Plan Introduction */}
                        <div className="plan-intro">
                            <div className="plan-intro-icon" style={{ background: categoryInfo.gradient }}>
                                <i className={categoryInfo.icon}></i>
                            </div>
                            <div className="plan-intro-text">
                                <h4>{categoryInfo.name}</h4>
                                <p>
                                    {isAgencyOrHeadhunter
                                        ? 'Monthly subscription + per-contract fees. First contract free each month!'
                                        : 'Pay-per-hire model. No monthly fees - only pay when you successfully book a contract.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Agency/Headhunter Monthly Subscription */}
                        {isAgencyOrHeadhunter && (
                            <div className="subscription-highlight">
                                <div className="subscription-info">
                                    <h4><i className="fas fa-calendar-check mr-2"></i>Monthly Subscription</h4>
                                    <p>Triggered upon your 2nd booked contract of the month</p>
                                </div>
                                <div className="subscription-price">
                                    <span className="amount">$300</span>
                                    <span className="period"> CAD/month</span>
                                </div>
                            </div>
                        )}

                        {/* Pricing Table */}
                        <div className="pricing-section">
                            <h4 className="pricing-section-title">
                                <i className="fas fa-dollar-sign"></i>
                                Per-Contract Fees
                            </h4>

                            <table className="pricing-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '30%' }}>Fee Type</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong><i className="fas fa-file-signature text-primary mr-2"></i>Service Fee</strong>
                                        </td>
                                        <td>
                                            Per booked contract (signed agreement)
                                            <div className="fee-note">Charged when a contract is successfully booked</div>
                                        </td>
                                        <td>
                                            <span className="fee-badge fee-badge-blue">$20 CAD</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong><i className="fas fa-handshake text-success mr-2"></i>Direct Hire Commission</strong>
                                        </td>
                                        <td>
                                            When hiring a professional directly (no agency)
                                            <div className="fee-note">Based on total contract value</div>
                                        </td>
                                        <td>
                                            <span className="fee-badge fee-badge-green">10% of contract value</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Benefits */}
                        <div className="benefits-card">
                            <h4 className="benefits-title">
                                <i className="fas fa-check-circle"></i>
                                Key Benefits
                            </h4>
                            <ul className="benefits-list">
                                {isAgencyOrHeadhunter ? (
                                    <>
                                        <li><i className="fas fa-check"></i>First booked contract each month is subscription-free</li>
                                        <li><i className="fas fa-check"></i>$20 flat service fee per successful booking</li>
                                        <li><i className="fas fa-check"></i>10% commission only on direct hire placements</li>
                                        <li><i className="fas fa-check"></i>Posting contracts is always FREE</li>
                                        <li><i className="fas fa-check"></i>Access to all platform features</li>
                                    </>
                                ) : (
                                    <>
                                        <li><i className="fas fa-check"></i>No monthly subscription fees</li>
                                        <li><i className="fas fa-check"></i>$20 flat service fee per successful booking</li>
                                        <li><i className="fas fa-check"></i>10% commission only on direct hire placements</li>
                                        <li><i className="fas fa-check"></i>Posting contracts is always FREE</li>
                                        <li><i className="fas fa-check"></i>Pay only when you successfully hire</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tax Notice */}
                <div className="tax-notice">
                    <i className="fas fa-info-circle"></i>
                    <p><strong>Note:</strong> All prices shown are before taxes. GST/HST/PST/QST will be applied based on your province at checkout.</p>
                </div>
            </div>
        </div>
    );
};

export default BillingDashboard;
