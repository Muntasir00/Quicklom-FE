import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useViewDashboard } from "@hooks/professional/dashbaord/useViewDashboard";
import { useViewContractApplications } from "@hooks/professional/statistics/useViewContractApplications";
import axios from 'axios';
import Swal from 'sweetalert2';
import "../../../styles/modernStyles.css";

function View() {
    const { menu, sessionUserRole } = useViewDashboard();
    const { contractApplicationStatistics } = useViewContractApplications();
    const [dashboardKpis, setDashboardKpis] = useState(null);
    const [loadingKpis, setLoadingKpis] = useState(true);
    const [pendingFees, setPendingFees] = useState(null);
    const [loadingFees, setLoadingFees] = useState(true);

    const totalApplications = contractApplicationStatistics?.total_applications ?? 0;
    const pendingApplications = contractApplicationStatistics?.application_status?.pending ?? 0;
    const acceptedApplications = contractApplicationStatistics?.application_status?.accepted ?? 0;
    const rejectedApplications = contractApplicationStatistics?.application_status?.rejected ?? 0;

    // Calculate acceptance rate
    const acceptanceRate = totalApplications > 0
        ? Math.round((acceptedApplications / totalApplications) * 100)
        : 0;

    // Fetch dashboard KPIs
    useEffect(() => {
        const fetchDashboardKpis = async () => {
            try {
                setLoadingKpis(true);
                const response = await axios.get('/v.1/professional/statistics/dashboard-kpis');
                if (response.data.status) {
                    setDashboardKpis(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard KPIs:', error);
            } finally {
                setLoadingKpis(false);
            }
        };

        fetchDashboardKpis();
    }, []);

    // Fetch pending cancellation fees
    useEffect(() => {
        const fetchPendingFees = async () => {
            try {
                setLoadingFees(true);
                const response = await axios.get('/v.1/professional/pending-cancellation-fees');
                console.log('Pending fees response:', response.data);
                if (response.data.status) {
                    setPendingFees(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching pending fees:', error);
                // Set empty state on error so loading indicator disappears
                setPendingFees({ fees: [], total_amount: 0, has_outstanding_fees: false });
            } finally {
                setLoadingFees(false);
            }
        };

        fetchPendingFees();
    }, []);

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

    const quickActions = [
        {
            title: "Browse Jobs",
            description: "Find new opportunities",
            icon: "fas fa-search",
            link: `/${sessionUserRole}/published-contracts`,
            color: "primary"
        },
        {
            title: "My Availability",
            description: "Manage your schedule",
            icon: "fas fa-calendar-alt",
            link: `/${sessionUserRole}/availability`,
            color: "success"
        },
        {
            title: "Messages",
            description: "Check communications",
            icon: "fas fa-comments",
            link: `/${sessionUserRole}/messaging`,
            color: "info"
        },
        {
            title: "Profile",
            description: "Update your information",
            icon: "fas fa-user-circle",
            link: `/${sessionUserRole}/profile/${sessionUserRole}/edit`,
            color: "warning"
        }
    ];

    return (
        <div className="content-wrapper" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)', minHeight: '100vh', paddingBottom: '2rem'}}>
            {/* Compact Header */}
            <div className="dashboard-header-compact">
                <div className="container-fluid">
                    <div className="header-flex">
                        <div className="header-left">
                            <h1 className="page-title">
                                <i className="fas fa-tachometer-alt mr-2"></i>
                                Dashboard
                            </h1>
                        </div>
                        <div className="header-right">
                            <div className="date-badge">
                                <i className="far fa-calendar-alt mr-2"></i>
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content" style={{paddingTop: '1rem', paddingBottom: '1rem'}}>
                <div className="container-fluid">
                    {/* Comprehensive KPI Grid */}
                    {!loadingKpis && dashboardKpis && (
                        <div className="kpi-grid-comprehensive">
                            {/* Career Stats */}
                            <div className="kpi-mini kpi-purple">
                                <div className="kpi-mini-header">
                                    <i className="fas fa-briefcase"></i>
                                    <span>Completed</span>
                                </div>
                                <div className="kpi-mini-value">{dashboardKpis.career_metrics.total_completed_contracts}</div>
                            </div>

                            <div className="kpi-mini kpi-blue">
                                <div className="kpi-mini-header">
                                    <i className="fas fa-running"></i>
                                    <span>Active</span>
                                </div>
                                <div className="kpi-mini-value">{dashboardKpis.career_metrics.active_contracts}</div>
                            </div>

                            <div className="kpi-mini kpi-green">
                                <div className="kpi-mini-header">
                                    <i className="fas fa-percentage"></i>
                                    <span>Success</span>
                                </div>
                                <div className="kpi-mini-value">{dashboardKpis.career_metrics.success_rate}%</div>
                            </div>

                            <div className="kpi-mini kpi-orange">
                                <div className="kpi-mini-header">
                                    <i className="fas fa-file-signature"></i>
                                    <span>Signed</span>
                                </div>
                                <div className="kpi-mini-value">{dashboardKpis.career_metrics.fully_signed_agreements}</div>
                            </div>

                            {/* Monthly Performance */}
                            <div className="kpi-mini kpi-cyan">
                                <div className="kpi-mini-header">
                                    <i className="fas fa-calendar-check"></i>
                                    <span>This Month</span>
                                </div>
                                <div className="kpi-mini-value">
                                    {dashboardKpis.monthly_metrics.contracts_this_month}
                                    {dashboardKpis.monthly_metrics.growth_percentage !== 0 && (
                                        <span className={`growth-indicator ${dashboardKpis.monthly_metrics.growth_percentage > 0 ? 'positive' : 'negative'}`}>
                                            <i className={`fas fa-arrow-${dashboardKpis.monthly_metrics.growth_percentage > 0 ? 'up' : 'down'}`}></i>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Applications */}
                            <div className="kpi-mini kpi-indigo">
                                <div className="kpi-mini-header">
                                    <i className="fas fa-file-alt"></i>
                                    <span>Applications</span>
                                </div>
                                <div className="kpi-mini-value">{totalApplications}</div>
                                <div className="kpi-mini-subtext">{pendingApplications} pending</div>
                            </div>

                            <div className="kpi-mini kpi-emerald">
                                <div className="kpi-mini-header">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Accepted</span>
                                </div>
                                <div className="kpi-mini-value">{acceptedApplications}</div>
                                <div className="kpi-mini-subtext">{acceptanceRate}% rate</div>
                            </div>

                            {dashboardKpis.pending_actions.unsigned_agreements > 0 && (
                                <div className="kpi-mini kpi-warning pulse-mini">
                                    <div className="kpi-mini-header">
                                        <i className="fas fa-pen"></i>
                                        <span>Action</span>
                                    </div>
                                    <div className="kpi-mini-value">{dashboardKpis.pending_actions.unsigned_agreements}</div>
                                    <div className="kpi-mini-subtext">Need signature</div>
                                </div>
                            )}

                            <div className="kpi-mini kpi-red">
                                <div className="kpi-mini-header">
                                    <i className="fas fa-times-circle"></i>
                                    <span>Rejected</span>
                                </div>
                                <div className="kpi-mini-value">{rejectedApplications}</div>
                            </div>
                        </div>
                    )}

                    {/* Outstanding Fees Section - Only show if there are pending fees */}
                    {!loadingFees && pendingFees?.has_outstanding_fees && (
                        <div className="outstanding-fees-section" style={{marginBottom: '1rem'}}>
                            <div className="fees-alert">
                                <div className="fees-alert-header">
                                    <div className="fees-alert-icon">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div className="fees-alert-title">
                                        <h3>Outstanding Cancellation Fees</h3>
                                        <p>You have outstanding fees that must be paid before applying to new contracts</p>
                                    </div>
                                    <div className="fees-total">
                                        <span className="total-label">Total Due</span>
                                        <span className="total-amount">${pendingFees.total_amount?.toFixed(2)} CAD</span>
                                    </div>
                                </div>
                                <div className="fees-list">
                                    {pendingFees.fees.map((fee) => (
                                        <div key={fee.id} className="fee-item">
                                            <div className="fee-details">
                                                <div className="fee-contract">
                                                    <i className="fas fa-file-contract"></i>
                                                    <span>{fee.contract_title || `Contract #${fee.contract_id}`}</span>
                                                </div>
                                                <div className="fee-meta">
                                                    <span className="fee-date">
                                                        <i className="fas fa-calendar"></i>
                                                        {new Date(fee.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="fee-percentage">{fee.percentage}% fee</span>
                                                </div>
                                            </div>
                                            <div className="fee-action">
                                                <span className="fee-amount">${fee.amount?.toFixed(2)}</span>
                                                <button
                                                    className="pay-fee-btn"
                                                    onClick={() => handlePayFee(fee)}
                                                >
                                                    <i className="fas fa-credit-card"></i>
                                                    Pay Now
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions Grid */}
                    <div className="compact-card card-elevated" style={{marginTop: '1rem'}}>
                        <div className="compact-card-header header-gradient">
                            <i className="fas fa-bolt mr-2"></i>
                            <span>Quick Actions</span>
                        </div>
                        <div className="compact-card-body" style={{padding: '0.75rem'}}>
                            <div className="quick-actions-compact">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={index}
                                        to={action.link}
                                        className={`quick-action-compact action-${action.color}`}
                                    >
                                        <div className="action-icon-compact">
                                            <i className={action.icon}></i>
                                        </div>
                                        <span className="action-title-compact">{action.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <style>{`
                /* Compact Header */
                .dashboard-header-compact {
                    background: white;
                    border-bottom: 2px solid #e5e7eb;
                    padding: 0.75rem 0;
                    margin-bottom: 0;
                }

                .header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                    display: flex;
                    align-items: center;
                }

                .page-title i {
                    color: #667eea;
                }

                .date-badge {
                    background: #f3f4f6;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                }

                /* Comprehensive KPI Grid */
                .kpi-grid-comprehensive {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .kpi-mini {
                    background: white;
                    border-radius: 10px;
                    padding: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    border-left: 4px solid;
                    position: relative;
                    overflow: hidden;
                }

                .kpi-mini:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .kpi-mini::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 40px;
                    height: 40px;
                    opacity: 0.1;
                    border-radius: 50%;
                }

                .kpi-purple { border-color: #9333ea; }
                .kpi-purple::before { background: #9333ea; }
                .kpi-blue { border-color: #3b82f6; }
                .kpi-blue::before { background: #3b82f6; }
                .kpi-green { border-color: #10b981; }
                .kpi-green::before { background: #10b981; }
                .kpi-orange { border-color: #f59e0b; }
                .kpi-orange::before { background: #f59e0b; }
                .kpi-cyan { border-color: #06b6d4; }
                .kpi-cyan::before { background: #06b6d4; }
                .kpi-indigo { border-color: #6366f1; }
                .kpi-indigo::before { background: #6366f1; }
                .kpi-emerald { border-color: #059669; }
                .kpi-emerald::before { background: #059669; }
                .kpi-warning { border-color: #f59e0b; }
                .kpi-warning::before { background: #f59e0b; }
                .kpi-red { border-color: #ef4444; }
                .kpi-red::before { background: #ef4444; }

                .kpi-mini-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .kpi-mini-header i {
                    font-size: 0.875rem;
                    opacity: 0.7;
                }

                .kpi-mini-value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #1f2937;
                    line-height: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .kpi-mini-subtext {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    margin-top: 0.25rem;
                    font-weight: 500;
                }

                .growth-indicator {
                    font-size: 1rem;
                    margin-left: 0.5rem;
                }

                .growth-indicator.positive {
                    color: #10b981;
                }

                .growth-indicator.negative {
                    color: #ef4444;
                }

                .pulse-mini {
                    animation: pulse-glow-mini 2s infinite;
                }

                @keyframes pulse-glow-mini {
                    0%, 100% {
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    50% {
                        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
                    }
                }

                /* Compact Stats Grid */
                .stats-grid-compact {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .stat-card-compact {
                    background: white;
                    border-radius: 10px;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                }

                .stat-card-compact:hover {
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                    transform: translateY(-3px);
                }

                .stat-icon-compact {
                    width: 48px;
                    height: 48px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }

                .stat-primary .stat-icon-compact {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }

                .stat-warning .stat-icon-compact {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }

                .stat-success .stat-icon-compact {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .stat-danger .stat-icon-compact {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                }

                .stat-content-compact {
                    flex: 1;
                }

                .stat-value-compact {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2d3748;
                    line-height: 1;
                }

                .stat-label-compact {
                    font-size: 0.7rem;
                    color: #718096;
                    margin-top: 0.125rem;
                }

                .stat-rate-compact {
                    font-size: 0.65rem;
                    color: #10b981;
                    font-weight: 600;
                    margin-top: 0.125rem;
                }

                /* Compact Card */
                .compact-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .card-elevated {
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .card-elevated:hover {
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }

                .compact-card-header {
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-bottom: 2px solid #e2e8f0;
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: #1f2937;
                    display: flex;
                    align-items: center;
                    letter-spacing: 0.3px;
                }

                .header-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-bottom: none;
                }

                .compact-card-body {
                    padding: 1rem;
                }

                /* Quick Actions Compact */
                .quick-actions-compact {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.5rem;
                }

                .quick-action-compact {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 0.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.375rem;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    text-align: center;
                }

                .quick-action-compact:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    border-color: #667eea;
                }

                .action-icon-compact {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    color: white;
                }

                .action-primary .action-icon-compact {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }

                .action-success .action-icon-compact {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .action-info .action-icon-compact {
                    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
                }

                .action-warning .action-icon-compact {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }

                .action-title-compact {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #2d3748;
                }

                /* Status Bars Compact */
                .status-bars-compact {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .status-bar-compact {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .status-bar-label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .badge-compact {
                    padding: 0.125rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                .badge-warning {
                    background: #fef3c7;
                    color: #92400e;
                }

                .badge-success {
                    background: #d1fae5;
                    color: #065f46;
                }

                .badge-danger {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .status-bar-value {
                    font-weight: 700;
                    color: #2d3748;
                    font-size: 0.875rem;
                }

                .progress-bar-compact {
                    height: 6px;
                    background: #f3f4f6;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .progress-bar-compact > div {
                    height: 100%;
                    transition: width 0.5s ease;
                }

                .progress-fill-warning {
                    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
                }

                .progress-fill-success {
                    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
                }

                .progress-fill-danger {
                    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
                }

                /* Empty State Compact */
                .empty-state-compact {
                    text-align: center;
                    padding: 0;
                }

                .empty-icon-compact {
                    font-size: 2rem;
                    color: #cbd5e0;
                    margin-bottom: 0.5rem;
                }

                .empty-text-compact {
                    color: #718096;
                    font-size: 0.8rem;
                    margin-bottom: 0.5rem;
                }

                .btn-compact-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .btn-compact-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
                    color: white;
                }

                /* Quick Actions Grid */
                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .quick-action-card {
                    background: white;
                    border: 2px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    text-decoration: none;
                    transition: all var(--transition-base);
                    position: relative;
                    overflow: hidden;
                    animation: fadeIn 0.5s ease;
                }

                .quick-action-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    transition: width var(--transition-base);
                }

                .quick-action-primary::before {
                    background: linear-gradient(180deg, var(--primary-gradient-start), var(--primary-gradient-end));
                }

                .quick-action-success::before {
                    background: linear-gradient(180deg, var(--success-gradient-start), var(--success-gradient-end));
                }

                .quick-action-info::before {
                    background: linear-gradient(180deg, var(--info-gradient-start), var(--info-gradient-end));
                }

                .quick-action-warning::before {
                    background: linear-gradient(180deg, var(--warning-gradient-start), var(--warning-gradient-end));
                }

                .quick-action-card:hover {
                    transform: translateX(8px);
                    border-color: transparent;
                    box-shadow: var(--shadow-lg);
                }

                .quick-action-card:hover::before {
                    width: 100%;
                    opacity: 0.05;
                }

                .quick-action-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: var(--border-radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                    flex-shrink: 0;
                    transition: all var(--transition-base);
                }

                .quick-action-primary .quick-action-icon {
                    background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
                }

                .quick-action-success .quick-action-icon {
                    background: linear-gradient(135deg, var(--success-gradient-start), var(--success-gradient-end));
                }

                .quick-action-info .quick-action-icon {
                    background: linear-gradient(135deg, var(--info-gradient-start), var(--info-gradient-end));
                }

                .quick-action-warning .quick-action-icon {
                    background: linear-gradient(135deg, var(--warning-gradient-start), var(--warning-gradient-end));
                }

                .quick-action-card:hover .quick-action-icon {
                    transform: scale(1.1) rotate(5deg);
                }

                .quick-action-content {
                    flex: 1;
                }

                .quick-action-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 0.25rem;
                }

                .quick-action-description {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .quick-action-arrow {
                    color: var(--text-muted);
                    transition: all var(--transition-base);
                }

                .quick-action-card:hover .quick-action-arrow {
                    color: var(--primary-color);
                    transform: translateX(4px);
                }

                /* Status Progress */
                .status-progress-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .status-progress-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .status-progress-label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .status-progress-value {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .status-progress-bar {
                    height: 12px;
                    background: var(--gray-100);
                    border-radius: 6px;
                    overflow: hidden;
                }

                .status-progress-fill {
                    height: 100%;
                    border-radius: 6px;
                    transition: width 1s ease;
                }

                .status-progress-warning {
                    background: linear-gradient(90deg, var(--warning-gradient-start), var(--warning-gradient-end));
                }

                .status-progress-success {
                    background: linear-gradient(90deg, var(--success-gradient-start), var(--success-gradient-end));
                }

                .status-progress-danger {
                    background: linear-gradient(90deg, var(--danger-gradient-start), var(--danger-gradient-end));
                }

                @media (max-width: 768px) {
                    .quick-actions-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* New KPI Cards */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                }

                .kpi-card {
                    background: white;
                    border-radius: 8px;
                    padding: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                    border-left: 4px solid;
                }

                .kpi-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .kpi-purple {
                    border-color: #9333ea;
                }

                .kpi-blue {
                    border-color: #3b82f6;
                }

                .kpi-green {
                    border-color: #10b981;
                }

                .kpi-orange {
                    border-color: #f59e0b;
                }

                .kpi-icon {
                    width: 45px;
                    height: 45px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    color: white;
                    flex-shrink: 0;
                }

                .kpi-purple .kpi-icon {
                    background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
                }

                .kpi-blue .kpi-icon {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }

                .kpi-green .kpi-icon {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .kpi-orange .kpi-icon {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }

                .kpi-content {
                    flex: 1;
                }

                .kpi-value {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #1f2937;
                    line-height: 1;
                }

                .kpi-label {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                    font-weight: 500;
                }

                .stat-info .stat-icon-compact {
                    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
                }

                .growth-positive {
                    color: #10b981 !important;
                }

                .growth-negative {
                    color: #ef4444 !important;
                }

                .pulse-card {
                    animation: pulse-glow 2s infinite;
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                    }
                    50% {
                        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
                    }
                }

                /* Outstanding Fees Section */
                .outstanding-fees-section {
                    margin-top: 1rem;
                }

                .fees-alert {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border: 2px solid #f59e0b;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
                }

                .fees-alert-header {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: rgba(245, 158, 11, 0.1);
                    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
                    gap: 1rem;
                }

                .fees-alert-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .fees-alert-title {
                    flex: 1;
                }

                .fees-alert-title h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #92400e;
                }

                .fees-alert-title p {
                    margin: 0.25rem 0 0 0;
                    font-size: 0.85rem;
                    color: #b45309;
                }

                .fees-total {
                    text-align: right;
                }

                .fees-total .total-label {
                    display: block;
                    font-size: 0.75rem;
                    color: #92400e;
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .fees-total .total-amount {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #b45309;
                }

                .fees-list {
                    padding: 0.75rem 1rem;
                }

                .fee-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    border-radius: 8px;
                    padding: 0.875rem 1rem;
                    margin-bottom: 0.5rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    transition: all 0.2s ease;
                }

                .fee-item:last-child {
                    margin-bottom: 0;
                }

                .fee-item:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transform: translateY(-1px);
                }

                .fee-details {
                    flex: 1;
                }

                .fee-contract {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 0.95rem;
                }

                .fee-contract i {
                    color: #6b7280;
                }

                .fee-meta {
                    display: flex;
                    gap: 1rem;
                    margin-top: 0.375rem;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .fee-meta i {
                    margin-right: 0.25rem;
                }

                .fee-action {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .fee-amount {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #b45309;
                }

                .pay-fee-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1.25rem;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pay-fee-btn:hover {
                    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
                }

                .pay-fee-btn i {
                    font-size: 0.8rem;
                }

                /* Mobile Responsiveness */
                @media (max-width: 992px) {
                    .kpi-grid-comprehensive {
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .header-flex {
                        flex-direction: column;
                        gap: 0.75rem;
                        align-items: flex-start;
                    }

                    .date-badge {
                        width: 100%;
                        justify-content: center;
                    }

                    .page-title {
                        font-size: 1.25rem;
                    }

                    .kpi-grid-comprehensive {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.5rem;
                    }

                    .kpi-mini-value {
                        font-size: 1.5rem;
                    }

                    .quick-actions-compact {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .fees-alert-header {
                        flex-direction: column;
                        text-align: center;
                    }

                    .fees-total {
                        text-align: center;
                        margin-top: 0.5rem;
                    }

                    .fee-item {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .fee-action {
                        width: 100%;
                        justify-content: space-between;
                    }
                }

                @media (max-width: 480px) {
                    .kpi-grid-comprehensive {
                        grid-template-columns: 1fr;
                    }

                    .kpi-mini {
                        padding: 0.75rem;
                    }

                    .quick-actions-compact {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default View;
