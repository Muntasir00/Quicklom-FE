import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoiceService from '@services/institute/InvoiceService';
import BillingService from '@services/institute/BillingService';

const PaymentHistory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [charges, setCharges] = useState([]);
    const [activeTab, setActiveTab] = useState('invoices');
    const [stats, setStats] = useState({
        totalPaid: 0,
        totalInvoices: 0,
        totalCharges: 0
    });

    useEffect(() => {
        loadPaymentHistory();
    }, []);

    const loadPaymentHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load invoices using InvoiceService (returns due_date and custom_invoice_number)
            const invoicesResponse = await InvoiceService.getUserInvoices(null, 50);
            const invoicesList = invoicesResponse.invoices || [];
            setInvoices(invoicesList);

            // Load charges
            const chargesResponse = await BillingService.getCharges(50);
            const chargesList = chargesResponse.charges || [];
            setCharges(chargesList);

            // Calculate stats
            const paidInvoices = invoicesList.filter(inv => inv.status?.toLowerCase() === 'paid');
            const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);

            setStats({
                totalPaid: totalPaid,
                totalInvoices: invoicesList.length,
                totalCharges: chargesList.length
            });

        } catch (err) {
            console.error('Error loading payment history:', err);
            setError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (invoice) => {
        const status = invoice?.status;
        const statusLower = status?.toLowerCase();

        // Check if overdue (open invoice past due date)
        const isOverdue = invoice?.due_date && new Date(invoice.due_date) < new Date() && statusLower === 'open';

        if (isOverdue) {
            return { label: 'OVERDUE', color: '#ef4444', bg: '#fef2f2', icon: 'fa-exclamation-circle' };
        }

        const statuses = {
            paid: { label: 'PAID', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle' },
            succeeded: { label: 'SUCCEEDED', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle' },
            open: { label: 'OPEN', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock' },
            draft: { label: 'DRAFT', color: '#3b82f6', bg: '#eff6ff', icon: 'fa-file' },
            void: { label: 'VOID', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-ban' },
            uncollectible: { label: 'UNCOLLECTIBLE', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle' },
            failed: { label: 'FAILED', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle' },
            pending: { label: 'PENDING', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock' }
        };
        return statuses[statusLower] || { label: statusLower?.toUpperCase() || 'N/A', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-file' };
    };

    const getChargeStatusInfo = (status) => {
        const statusLower = status?.toLowerCase();
        const statuses = {
            succeeded: { label: 'SUCCEEDED', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle' },
            failed: { label: 'FAILED', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle' },
            pending: { label: 'PENDING', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock' }
        };
        return statuses[statusLower] || { label: statusLower?.toUpperCase() || 'N/A', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-file' };
    };

    const getInvoiceNumber = (invoice) => {
        // Use stripe_invoice_number (shown on Stripe PDF), fallback to custom_invoice_number
        return invoice.stripe_invoice_number || invoice.custom_invoice_number || '-';
    };

    const formatAmount = (amount, currency = 'cad') => {
        if (!amount && amount !== 0) return '$0.00';
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount / 100);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';

        let date;
        if (typeof timestamp === 'number') {
            date = new Date(timestamp * 1000);
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else {
            return '-';
        }

        if (isNaN(date.getTime())) return '-';

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getContractInfo = (invoice) => {
        let metadata = invoice.invoice_metadata || invoice.metadata;

        if (typeof metadata === 'string') {
            try {
                metadata = JSON.parse(metadata);
            } catch (e) {
                metadata = null;
            }
        }

        if (metadata && typeof metadata === 'object') {
            return {
                contractId: metadata.contract_id || null,
                contractType: metadata.contract_type || null,
                contractValue: metadata.contract_value || 0,
                commissionRate: metadata.commission_rate || '10%'
            };
        }

        return { contractId: null, contractType: null, contractValue: 0, commissionRate: '10%' };
    };

    const getInvoiceTypeInfo = (invoice) => {
        const planType = invoice.payment_plan || invoice.invoice_metadata?.invoice_type;

        const types = {
            'headhunter_monthly': { label: 'Subscription', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-calendar-check' },
            'headhunter_commission': { label: 'Commission', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-percentage' },
            'clinic_commission': { label: 'Service Fee', color: '#10b981', bg: '#ecfdf5', icon: 'fa-file-invoice-dollar' },
            'commission': { label: 'Commission', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-percentage' },
            'contract_commission': { label: 'Commission', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-percentage' },
            'direct_hire': { label: 'Direct Hire', color: '#3b82f6', bg: '#eff6ff', icon: 'fa-handshake' }
        };

        return types[planType] || { label: 'Payment', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-file-invoice' };
    };

    if (loading) {
        return (
            <div className="content-wrapper" style={{ marginTop: '15px', background: '#f8fafc', minHeight: 'calc(100vh - 57px)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading payment history...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper" style={{ marginTop: '15px', background: '#f8fafc', minHeight: 'calc(100vh - 57px)' }}>
            <style>{`
                .history-page {
                    padding: 24px;
                    width: 100%;
                }

                .history-header {
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%);
                    border-radius: 20px;
                    padding: 32px;
                    margin-bottom: 24px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                }

                .history-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .history-header-content {
                    position: relative;
                    z-index: 1;
                }

                .history-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                }

                .history-header p {
                    opacity: 0.9;
                    margin: 0;
                    font-size: 0.95rem;
                }

                .back-btn {
                    position: relative;
                    z-index: 1;
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
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

                .tabs-container {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .tab-btn:hover {
                    border-color: #6366f1;
                    color: #6366f1;
                }

                .tab-btn.active {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    border-color: transparent;
                }

                .tab-btn .count-badge {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                }

                .tab-btn:not(.active) .count-badge {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .history-table-card {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .history-table-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .history-table-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .history-table th {
                    background: #f8fafc;
                    padding: 14px 20px;
                    text-align: left;
                    font-weight: 600;
                    color: #64748b;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .history-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }

                .history-table tr:last-child td {
                    border-bottom: none;
                }

                .history-table tr:hover td {
                    background: #fafafa;
                }

                .invoice-id {
                    font-family: 'SF Mono', 'Monaco', monospace;
                    font-size: 0.8rem;
                    color: #475569;
                    background: #f1f5f9;
                    padding: 4px 8px;
                    border-radius: 6px;
                    display: inline-block;
                }

                .type-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .amount-value {
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 0.95rem;
                }

                .amount-paid {
                    color: #10b981;
                }

                .date-value {
                    color: #475569;
                    font-size: 0.85rem;
                }

                .due-date-overdue {
                    color: #ef4444;
                    font-weight: 600;
                }

                .contract-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .contract-id {
                    font-weight: 600;
                    color: #6366f1;
                    font-size: 0.85rem;
                }

                .contract-type {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }

                .commission-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .commission-rate {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: #dcfce7;
                    color: #166534;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .commission-amount {
                    font-size: 0.7rem;
                    color: #64748b;
                }

                .action-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: #f1f5f9;
                    color: #64748b;
                }

                .action-btn:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }

                .actions-cell {
                    display: flex;
                    gap: 6px;
                    justify-content: flex-end;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                }

                .empty-state-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 2rem;
                    color: #94a3b8;
                }

                .empty-state h3 {
                    margin: 0 0 8px 0;
                    color: #475569;
                    font-size: 1.1rem;
                }

                .empty-state p {
                    margin: 0;
                    color: #94a3b8;
                    font-size: 0.9rem;
                }

                .info-card {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid #bfdbfe;
                    margin-top: 24px;
                    display: flex;
                    gap: 16px;
                }

                .info-card-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .info-card-content h4 {
                    margin: 0 0 8px 0;
                    color: #1e40af;
                    font-size: 1rem;
                    font-weight: 700;
                }

                .info-card-content p {
                    margin: 0;
                    color: #1e40af;
                    font-size: 0.85rem;
                    line-height: 1.6;
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .history-table {
                        display: block;
                        overflow-x: auto;
                    }
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .history-page {
                        padding: 16px;
                    }

                    .history-header {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                        padding: 24px;
                    }

                    .history-header h1 {
                        font-size: 1.5rem;
                    }

                    .tabs-container {
                        flex-direction: column;
                    }
                }
            `}</style>

            <div className="history-page">
                {/* Header */}
                <div className="history-header">
                    <div className="history-header-content">
                        <h1><i className="fas fa-history mr-3"></i>Payment History</h1>
                        <p>View all your past payments and transactions</p>
                    </div>
                    <button className="back-btn" onClick={() => navigate('/institute/billing')}>
                        <i className="fas fa-arrow-left"></i>
                        Back to Billing
                    </button>
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
                    </div>
                )}

                {/* Statistics */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-value">{formatAmount(stats.totalPaid)}</div>
                        <div className="stat-label">Total Paid</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white' }}>
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <div className="stat-value">{stats.totalInvoices}</div>
                        <div className="stat-label">Total Invoices</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}>
                            <i className="fas fa-credit-card"></i>
                        </div>
                        <div className="stat-value">{stats.totalCharges}</div>
                        <div className="stat-label">Total Charges</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
                        onClick={() => setActiveTab('invoices')}
                    >
                        <i className="fas fa-file-invoice"></i>
                        Invoices
                        <span className="count-badge">{invoices.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'charges' ? 'active' : ''}`}
                        onClick={() => setActiveTab('charges')}
                    >
                        <i className="fas fa-credit-card"></i>
                        Charges
                        <span className="count-badge">{charges.length}</span>
                    </button>
                </div>

                {/* Invoices Tab */}
                {activeTab === 'invoices' && (
                    <div className="history-table-card">
                        <div className="history-table-header">
                            <h2>Invoice History</h2>
                        </div>

                        {invoices.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <i className="fas fa-file-invoice"></i>
                                </div>
                                <h3>No invoices found</h3>
                                <p>Commission invoices will appear here when contracts are booked</p>
                            </div>
                        ) : (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Type</th>
                                        <th>Contract</th>
                                        <th>Issue Date</th>
                                        <th>Due Date</th>
                                        <th>Amount Due</th>
                                        <th>Amount Paid</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => {
                                        const statusInfo = getStatusInfo(invoice);
                                        const typeInfo = getInvoiceTypeInfo(invoice);
                                        const contractInfo = getContractInfo(invoice);
                                        const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status?.toLowerCase() === 'open';

                                        return (
                                            <tr key={invoice.id}>
                                                <td>
                                                    <span className="invoice-id">
                                                        {getInvoiceNumber(invoice)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className="type-badge"
                                                        style={{ background: typeInfo.bg, color: typeInfo.color }}
                                                    >
                                                        <i className={`fas ${typeInfo.icon}`}></i>
                                                        {typeInfo.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    {contractInfo.contractId ? (
                                                        <div className="contract-info">
                                                            <span className="contract-id">#{contractInfo.contractId}</span>
                                                            {contractInfo.contractType && (
                                                                <span className="contract-type">{contractInfo.contractType}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="date-value">
                                                        {formatDate(invoice.created_at || invoice.created)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`date-value ${isOverdue ? 'due-date-overdue' : ''}`}>
                                                        {formatDate(invoice.due_date)}
                                                        {isOverdue && (
                                                            <i className="fas fa-exclamation-triangle ml-1" style={{ fontSize: '0.75rem' }}></i>
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="amount-value">
                                                        {formatAmount(invoice.amount_due, invoice.currency)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="amount-value amount-paid">
                                                        {formatAmount(invoice.amount_paid, invoice.currency)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className="status-badge"
                                                        style={{ background: statusInfo.bg, color: statusInfo.color }}
                                                    >
                                                        <i className={`fas ${statusInfo.icon}`}></i>
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        {(invoice.invoice_pdf || invoice.invoice_pdf_url) && (
                                                            <button
                                                                className="action-btn"
                                                                onClick={() => window.open(invoice.invoice_pdf || invoice.invoice_pdf_url, '_blank')}
                                                                title="Download PDF"
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </button>
                                                        )}
                                                        {invoice.hosted_invoice_url && (
                                                            <button
                                                                className="action-btn"
                                                                onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                                                                title="View Invoice"
                                                            >
                                                                <i className="fas fa-external-link-alt"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Charges Tab */}
                {activeTab === 'charges' && (
                    <div className="history-table-card">
                        <div className="history-table-header">
                            <h2>Charge History</h2>
                        </div>

                        {charges.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <i className="fas fa-credit-card"></i>
                                </div>
                                <h3>No charges found</h3>
                                <p>Payment charges will appear here when payments are processed</p>
                            </div>
                        ) : (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Charge ID</th>
                                        <th>Description</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {charges.map((charge) => {
                                        const statusInfo = getChargeStatusInfo(charge.status);

                                        return (
                                            <tr key={charge.id}>
                                                <td>
                                                    <span className="invoice-id">
                                                        {charge.id?.substring(0, 20)}...
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ color: '#1e293b' }}>
                                                        {charge.description || charge.statement_descriptor || 'Payment'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="date-value">
                                                        {formatDate(charge.created)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="amount-value">
                                                        {formatAmount(charge.amount, charge.currency)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className="status-badge"
                                                        style={{ background: statusInfo.bg, color: statusInfo.color }}
                                                    >
                                                        <i className={`fas ${statusInfo.icon}`}></i>
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Info Card */}
                {activeTab === 'invoices' && invoices.length > 0 && (
                    <div className="info-card">
                        <div className="info-card-icon">
                            <i className="fas fa-info-circle"></i>
                        </div>
                        <div className="info-card-content">
                            <h4>Commission Structure</h4>
                            <p>
                                QuickLocum charges a simple <strong>10% commission</strong> on direct hire contract values,
                                plus a <strong>$20 service fee</strong> per booked contract. Agencies and headhunters also have a
                                <strong> $300/month subscription</strong> that activates after the 2nd booked contract of the month.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
