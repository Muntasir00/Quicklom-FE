import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useViewDashboard } from "@hooks/institute/dashboard/useViewDashboard";
import { Tooltip } from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";

function Dashboard() {
    const {
        sessionUserRole,
        contractStatistics,
        dashboardKPIs,
        loading
    } = useViewDashboard();

    const [pendingFees, setPendingFees] = useState(null);
    const [loadingFees, setLoadingFees] = useState(true);

    useEffect(() => {
        fetchPendingFees();
    }, []);

    const fetchPendingFees = async () => {
        try {
            setLoadingFees(true);
            const response = await axios.get('/v.1/institute/pending-cancellation-fees');
            if (response.data.status) {
                setPendingFees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching pending fees:', error);
            setPendingFees({ fees: [], total_amount: 0, has_outstanding_fees: false });
        } finally {
            setLoadingFees(false);
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

    const totalContracts = contractStatistics?.total_contracts || 0;

    // Format number helper (10000 -> 10k, 1500 -> 1.5k)
    const formatNumber = (num) => {
        if (num >= 10000) {
            return (num / 1000).toFixed(0) + 'k';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num.toFixed(0);
    };

    // Format currency helper
    const formatCurrency = (num) => {
        if (num >= 10000) {
            return '$' + (num / 1000).toFixed(0) + 'k';
        } else if (num >= 1000) {
            return '$' + (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return '$' + num.toFixed(0);
    };

    // Status color helper
    const getStatusStyle = (value, target, reversed = false) => {
        if (reversed) {
            if (value <= target) return { color: '#10b981', bg: '#ecfdf5' };
            if (value <= target * 1.5) return { color: '#f59e0b', bg: '#fffbeb' };
            return { color: '#ef4444', bg: '#fef2f2' };
        }
        if (value >= target) return { color: '#10b981', bg: '#ecfdf5' };
        if (value >= target * 0.7) return { color: '#f59e0b', bg: '#fffbeb' };
        return { color: '#ef4444', bg: '#fef2f2' };
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="content-wrapper" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 57px)', padding: '1rem', paddingTop: '25px' }}>
            {/* Compact Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Dashboard</h1>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Overview of your contracts & performance</p>
                </div>
                <Link to={`/${sessionUserRole}/contracts/create`} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                    borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem'
                }}>
                    <i className="fas fa-plus"></i> New Contract
                </Link>
            </div>

            {/* Alerts - Compact */}
            {dashboardKPIs?.alerts?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    {dashboardKPIs.alerts.slice(0, 2).map((alert, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.5rem 1rem', marginBottom: '0.5rem', borderRadius: '8px',
                            background: alert.type === 'warning' ? '#fef3c7' : '#dbeafe',
                            fontSize: '0.8rem'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: alert.type === 'warning' ? '#92400e' : '#1e40af' }}>
                                <i className={`fas fa-${alert.icon}`}></i> {alert.message}
                            </span>
                            <Link to={alert.link} style={{ fontWeight: 600, color: alert.type === 'warning' ? '#d97706' : '#2563eb', textDecoration: 'none' }}>
                                {alert.action} →
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Outstanding Cancellation Fees Section */}
            {!loadingFees && pendingFees?.has_outstanding_fees && (
                <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #f59e0b',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderBottom: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1rem'
                            }}>
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#92400e' }}>Outstanding Cancellation Fees</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#b45309' }}>Must be paid before publishing new contracts</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#92400e', textTransform: 'uppercase', fontWeight: 600 }}>Total Due</span>
                            <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#b45309' }}>${pendingFees.total_amount?.toFixed(2)} CAD</span>
                        </div>
                    </div>
                    <div style={{ padding: '0.75rem 1rem' }}>
                        {pendingFees.fees.map((fee) => (
                            <div key={fee.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'white',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem',
                                marginBottom: '0.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1f2937', fontSize: '0.85rem' }}>
                                        <i className="fas fa-file-contract" style={{ color: '#6b7280' }}></i>
                                        {fee.contract_title || `Contract #${fee.contract_id}`}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {fee.percentage}% fee • {new Date(fee.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#b45309' }}>${fee.amount?.toFixed(2)}</span>
                                    <button
                                        onClick={() => handlePayFee(fee)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <i className="fas fa-credit-card"></i>
                                        Pay
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GLOBAL VIEW - At a Glance */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
                borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>
                    <i className="fas fa-eye"></i> At a Glance
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '0.75rem' }}>
                    <Tooltip title="Total contracts created" arrow>
                        <div style={{ textAlign: 'center', cursor: 'help' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalContracts}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Total</div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Contracts awaiting admin approval to be published" arrow>
                        <div style={{ textAlign: 'center', cursor: 'help' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fb923c' }}>{contractStatistics?.contract_status?.pending || 0}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Pending</div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Contracts currently open for applications" arrow>
                        <div style={{ textAlign: 'center', cursor: 'help' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>{contractStatistics?.contract_status?.open || 0}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Open</div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Contracts awaiting signature from candidate" arrow>
                        <div style={{ textAlign: 'center', cursor: 'help' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>{contractStatistics?.contract_status?.pending_signature || 0}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Pending Sign</div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Successfully filled contracts" arrow>
                        <div style={{ textAlign: 'center', cursor: 'help' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>{contractStatistics?.contract_status?.booked || 0}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Booked</div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Completed contracts" arrow>
                        <div style={{ textAlign: 'center', cursor: 'help' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a5b4fc' }}>{contractStatistics?.contract_status?.closed || 0}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Closed</div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Cancelled contracts" arrow>
                        <div style={{ textAlign: 'center', cursor: 'help' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171' }}>{contractStatistics?.contract_status?.cancelled || 0}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Cancelled</div>
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* Main Grid - 3 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem', alignItems: 'stretch' }}>
                {/* Left Column - Key Metrics */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-chart-line" style={{ color: '#6366f1' }}></i> Key Metrics
                    </div>

                    {/* Time to Fill */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <Tooltip title="Average days from contract creation to booking. Lower is better." arrow>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'help' }}>Time to Fill</span>
                        </Tooltip>
                        <span style={{
                            fontSize: '0.85rem', fontWeight: 700,
                            ...getStatusStyle(dashboardKPIs?.operational_efficiency?.time_to_fill_days || 0, 7, true),
                            padding: '0.2rem 0.5rem', borderRadius: '4px'
                        }}>
                            {dashboardKPIs?.operational_efficiency?.time_to_fill_days || 0}d
                        </span>
                    </div>

                    {/* Fill Rate */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <Tooltip title="Percentage of contracts that get booked. Higher is better." arrow>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'help' }}>Fill Rate</span>
                        </Tooltip>
                        <span style={{
                            fontSize: '0.85rem', fontWeight: 700,
                            ...getStatusStyle(dashboardKPIs?.pipeline?.fill_rate || 0, 75),
                            padding: '0.2rem 0.5rem', borderRadius: '4px'
                        }}>
                            {dashboardKPIs?.pipeline?.fill_rate || 0}%
                        </span>
                    </div>

                    {/* Response Time */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <Tooltip title="Average hours to respond to applications. Lower is better." arrow>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'help' }}>Response Time</span>
                        </Tooltip>
                        <span style={{
                            fontSize: '0.85rem', fontWeight: 700,
                            ...getStatusStyle(dashboardKPIs?.operational_efficiency?.response_time_hours || 0, 48, true),
                            padding: '0.2rem 0.5rem', borderRadius: '4px'
                        }}>
                            {dashboardKPIs?.operational_efficiency?.response_time_hours || 0}h
                        </span>
                    </div>

                    {/* Cancellation Rate */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <Tooltip title="Percentage of contracts cancelled. Lower is better." arrow>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'help' }}>Cancellation Rate</span>
                        </Tooltip>
                        <span style={{
                            fontSize: '0.85rem', fontWeight: 700,
                            ...getStatusStyle(dashboardKPIs?.pipeline?.cancellation_rate || 0, 10, true),
                            padding: '0.2rem 0.5rem', borderRadius: '4px'
                        }}>
                            {dashboardKPIs?.pipeline?.cancellation_rate || 0}%
                        </span>
                    </div>

                    {/* Acceptance Rate */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                        <Tooltip title="Percentage of applications accepted. Shows selectivity." arrow>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'help' }}>Acceptance Rate</span>
                        </Tooltip>
                        <span style={{
                            fontSize: '0.85rem', fontWeight: 700,
                            ...getStatusStyle(dashboardKPIs?.engagement?.acceptance_rate || 0, 30),
                            padding: '0.2rem 0.5rem', borderRadius: '4px'
                        }}>
                            {dashboardKPIs?.engagement?.acceptance_rate || 0}%
                        </span>
                    </div>
                </div>

                {/* Middle Column - Applications & Pipeline */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-users" style={{ color: '#8b5cf6' }}></i> Applications
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Tooltip title="Applications waiting for your review" arrow>
                            <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', cursor: 'help' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{dashboardKPIs?.applicants?.pending_applications || 0}</div>
                                <div style={{ fontSize: '0.65rem', color: '#92400e' }}>Pending Review</div>
                            </div>
                        </Tooltip>
                        <Tooltip title="Total applications received" arrow>
                            <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', cursor: 'help' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>{dashboardKPIs?.engagement?.total_applications_received || 0}</div>
                                <div style={{ fontSize: '0.65rem', color: '#1e40af' }}>Total Received</div>
                            </div>
                        </Tooltip>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                            <i className="fas fa-calendar-alt" style={{ marginRight: '0.25rem' }}></i> Upcoming
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Tooltip title="Booked contracts starting this week" arrow>
                                <div style={{ textAlign: 'center', cursor: 'help' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6366f1' }}>{dashboardKPIs?.upcoming?.this_week || 0}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>This Week</div>
                                </div>
                            </Tooltip>
                            <Tooltip title="Booked contracts starting in next 30 days" arrow>
                                <div style={{ textAlign: 'center', cursor: 'help' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>{dashboardKPIs?.upcoming?.next_30_days || 0}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Next 30 Days</div>
                                </div>
                            </Tooltip>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <Tooltip title="Average applications per contract" arrow>
                                <span style={{ color: '#64748b', cursor: 'help' }}>Avg per Contract</span>
                            </Tooltip>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{dashboardKPIs?.applicants?.avg_applications_per_contract || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Financial */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-dollar-sign" style={{ color: '#10b981' }}></i> Financial
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Tooltip title="Total invoices paid this month" arrow>
                            <div style={{ background: '#ecfdf5', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', cursor: 'help' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(dashboardKPIs?.financial?.total_spend_mtd || 0)}</div>
                                <div style={{ fontSize: '0.65rem', color: '#065f46' }}>Spend MTD</div>
                            </div>
                        </Tooltip>
                        <Tooltip title="Total invoices paid this year" arrow>
                            <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', cursor: 'help' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{formatCurrency(dashboardKPIs?.financial?.total_spend_ytd || 0)}</div>
                                <div style={{ fontSize: '0.65rem', color: '#166534' }}>Spend YTD</div>
                            </div>
                        </Tooltip>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #f1f5f9' }}>
                        <Tooltip title="Average cost per successful placement" arrow>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'help' }}>Avg Cost/Hire</span>
                        </Tooltip>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(dashboardKPIs?.financial?.avg_cost_per_hire || 0)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #f1f5f9' }}>
                        <Tooltip title="Total unpaid invoices (open + overdue)" arrow>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'help' }}>Outstanding</span>
                        </Tooltip>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(dashboardKPIs?.financial?.outstanding_invoices || 0)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #f1f5f9' }}>
                        <Tooltip title="Invoices past their due date" arrow>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'help' }}>Overdue</span>
                        </Tooltip>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: dashboardKPIs?.financial?.overdue_invoices_count > 0 ? '#ef4444' : '#1e293b' }}>
                            {dashboardKPIs?.financial?.overdue_invoices_count || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Trend & Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {/* 6-Month Trend - Compact (spans 2 columns to align with Key Metrics + Applications above) */}
                {dashboardKPIs?.trends?.monthly_trends && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb', gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-chart-bar" style={{ color: '#6366f1' }}></i> 6-Month Trend
                            </span>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '2px' }}></span> Published
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }}></span> Booked
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px' }}>
                            {dashboardKPIs.trends.monthly_trends.map((trend, i) => {
                                const max = Math.max(...dashboardKPIs.trends.monthly_trends.map(t => Math.max(t.published, t.booked)), 1);
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '80px' }}>
                                            <Tooltip title={`Published: ${trend.published}`} arrow>
                                                <div style={{ width: '14px', height: `${Math.max((trend.published / max) * 70, 3)}px`, background: '#6366f1', borderRadius: '2px 2px 0 0', cursor: 'pointer' }}></div>
                                            </Tooltip>
                                            <Tooltip title={`Booked: ${trend.booked}`} arrow>
                                                <div style={{ width: '14px', height: `${Math.max((trend.booked / max) * 70, 3)}px`, background: '#10b981', borderRadius: '2px 2px 0 0', cursor: 'pointer' }}></div>
                                            </Tooltip>
                                        </div>
                                        <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.25rem' }}>{trend.month.split(' ')[0]}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                            <Tooltip title="Growth compared to last month" arrow>
                                <div style={{ textAlign: 'center', cursor: 'help' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>MoM Growth</span>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: (dashboardKPIs?.trends?.mom_growth || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                                        {(dashboardKPIs?.trends?.mom_growth || 0) >= 0 ? '+' : ''}{dashboardKPIs?.trends?.mom_growth || 0}%
                                    </div>
                                </div>
                            </Tooltip>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>This Month</span>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{dashboardKPIs?.trends?.this_month_contracts || 0}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Last Month</span>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>{dashboardKPIs?.trends?.last_month_contracts || 0}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions - Compact */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem' }}>
                        <i className="fas fa-bolt" style={{ color: '#f59e0b', marginRight: '0.5rem' }}></i> Quick Actions
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { icon: 'fa-plus', label: 'New Contract', link: `/${sessionUserRole}/contracts/create`, color: '#6366f1' },
                            { icon: 'fa-users', label: 'Applicants', link: `/${sessionUserRole}/contract-applicants`, color: '#8b5cf6' },
                            { icon: 'fa-file-invoice', label: 'Invoices', link: `/${sessionUserRole}/invoices`, color: '#10b981' },
                            { icon: 'fa-calendar', label: 'Upcoming', link: `/${sessionUserRole}/upcoming-contracts`, color: '#f59e0b' },
                            { icon: 'fa-briefcase', label: 'Job Offers', link: `/${sessionUserRole}/published-contracts`, color: '#ec4899' }
                        ].map((a, i) => (
                            <Link key={i} to={a.link} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
                                borderRadius: '8px', textDecoration: 'none', color: '#1e293b',
                                background: '#f8fafc', transition: 'all 0.15s', fontSize: '0.8rem', fontWeight: 500
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.color = a.color; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; }}
                            >
                                <i className={`fas ${a.icon}`} style={{ color: a.color, width: '16px' }}></i>
                                {a.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
