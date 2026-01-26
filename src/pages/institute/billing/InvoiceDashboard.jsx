import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InvoiceService from '@services/institute/InvoiceService';
import axios from 'axios';
import Swal from 'sweetalert2';

const InvoiceDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        paid: 0,
        overdue: 0
    });
    const [filter, setFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [searchFilters, setSearchFilters] = useState({
        invoice_id: '',
        invoice_type: '',
        start_date: '',
        end_date: ''
    });
    const [highlightedInvoiceId, setHighlightedInvoiceId] = useState(null);
    const [pendingFees, setPendingFees] = useState(null);
    const [loadingFees, setLoadingFees] = useState(true);

    useEffect(() => {
        // Check for invoice_id in URL params (from notifications)
        const invoiceIdParam = searchParams.get('invoice_id');
        if (invoiceIdParam) {
            setHighlightedInvoiceId(parseInt(invoiceIdParam));
            setSearchFilters(prev => ({ ...prev, invoice_id: invoiceIdParam }));
            setShowFilters(true);
        }
        loadInvoices();
        loadPendingFees();
    }, [searchParams]);

    const loadPendingFees = async () => {
        try {
            setLoadingFees(true);
            const response = await axios.get('/v.1/institute/pending-cancellation-fees');
            if (response.data.status) {
                setPendingFees(response.data.data);
            }
        } catch (error) {
            console.error('Error loading pending fees:', error);
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

    const loadInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await InvoiceService.getUserInvoices(null, 50);

            if (response.success) {
                setInvoices(response.invoices);

                const stats = {
                    total: response.invoices.length,
                    open: response.invoices.filter(inv =>
                        inv.status === 'open' || inv.status === 'OPEN'
                    ).length,
                    paid: response.invoices.filter(inv =>
                        inv.status === 'paid' || inv.status === 'PAID'
                    ).length,
                    overdue: response.invoices.filter(inv =>
                        inv.status === 'uncollectible' || inv.status === 'UNCOLLECTIBLE' ||
                        (inv.due_date && new Date(inv.due_date) < new Date() && inv.status?.toLowerCase() === 'open')
                    ).length
                };
                setStats(stats);
            }
        } catch (err) {
            console.error('Error loading invoices:', err);
            setError('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (invoice) => {
        const statusLower = invoice.status?.toLowerCase();
        const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && statusLower === 'open';

        if (isOverdue) {
            return { label: 'OVERDUE', color: '#ef4444', bg: '#fef2f2', icon: 'fa-exclamation-circle' };
        }

        const statuses = {
            open: { label: 'OPEN', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock' },
            paid: { label: 'PAID', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle' },
            void: { label: 'VOID', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-ban' },
            draft: { label: 'DRAFT', color: '#3b82f6', bg: '#eff6ff', icon: 'fa-file' },
            uncollectible: { label: 'UNCOLLECTIBLE', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle' }
        };
        return statuses[statusLower] || { label: statusLower?.toUpperCase() || 'N/A', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-file' };
    };

    const getInvoiceTypeInfo = (invoice) => {
        const planType = invoice.payment_plan || invoice.invoice_metadata?.invoice_type;

        const types = {
            'headhunter_monthly': {
                label: 'Monthly Subscription',
                color: '#f59e0b',
                bg: '#fffbeb',
                icon: 'fa-calendar-check',
                description: '$300/month headhunter subscription'
            },
            'headhunter_commission': {
                label: 'Commission',
                color: '#8b5cf6',
                bg: '#f5f3ff',
                icon: 'fa-percentage',
                description: 'Commission per placement'
            },
            'clinic_commission': {
                label: 'Service Fee',
                color: '#10b981',
                bg: '#ecfdf5',
                icon: 'fa-file-invoice-dollar',
                description: 'Placement service fee'
            },
            'direct_hire': {
                label: 'Direct Hire',
                color: '#3b82f6',
                bg: '#eff6ff',
                icon: 'fa-handshake',
                description: '10% direct hire commission'
            }
        };

        return types[planType] || {
            label: 'Invoice',
            color: '#6b7280',
            bg: '#f3f4f6',
            icon: 'fa-file-invoice',
            description: 'Standard invoice'
        };
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
            day: 'numeric'
        });
    };

    const formatAmount = (amount, currency = 'cad') => {
        if (!amount && amount !== 0) return '$0.00';
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount / 100);
    };

    const getInvoiceNumber = (invoice) => {
        // Use stripe_invoice_number (shown on Stripe PDF), fallback to custom_invoice_number
        return invoice.stripe_invoice_number || invoice.custom_invoice_number || '-';
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
                contractType: metadata.contract_type || null
            };
        }

        return { contractId: null, contractType: null };
    };

    const handlePayInvoice = (invoice) => {
        if (invoice.hosted_invoice_url) {
            window.open(invoice.hosted_invoice_url, '_blank');
        }
    };

    const handleViewPDF = (invoice) => {
        if (invoice.invoice_pdf || invoice.invoice_pdf_url) {
            window.open(invoice.invoice_pdf || invoice.invoice_pdf_url, '_blank');
        }
    };

    // Count active search filters
    const activeFiltersCount = Object.values(searchFilters).filter(
        (value) => value !== '' && value !== null && value !== undefined
    ).length;

    const handleSearchFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleClearFilters = () => {
        setSearchFilters({
            invoice_id: '',
            invoice_type: '',
            start_date: '',
            end_date: ''
        });
        setHighlightedInvoiceId(null);
    };

    const filteredInvoices = invoices.filter(invoice => {
        // First apply status filter
        const statusLower = invoice.status?.toLowerCase();
        const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && statusLower === 'open';

        if (filter !== 'all') {
            if (filter === 'overdue') {
                if (!(isOverdue || statusLower === 'uncollectible')) return false;
            } else if (statusLower !== filter) {
                return false;
            }
        }

        // Then apply search filters
        // Invoice ID filter
        if (searchFilters.invoice_id) {
            const searchId = searchFilters.invoice_id.toLowerCase();
            const invoiceNumber = (invoice.stripe_invoice_number || invoice.custom_invoice_number || '').toLowerCase();
            const invoiceId = String(invoice.id);
            if (!invoiceNumber.includes(searchId) && !invoiceId.includes(searchId)) {
                return false;
            }
        }

        // Invoice type filter
        if (searchFilters.invoice_type) {
            const planType = invoice.payment_plan || invoice.invoice_metadata?.invoice_type;
            if (planType !== searchFilters.invoice_type) {
                return false;
            }
        }

        // Start date filter (invoices created on or after)
        if (searchFilters.start_date) {
            const invoiceDate = invoice.created_at || invoice.created;
            if (invoiceDate) {
                const invoiceDateObj = typeof invoiceDate === 'number'
                    ? new Date(invoiceDate * 1000)
                    : new Date(invoiceDate);
                const filterDate = new Date(searchFilters.start_date);
                if (invoiceDateObj < filterDate) {
                    return false;
                }
            }
        }

        // End date filter (invoices created on or before)
        if (searchFilters.end_date) {
            const invoiceDate = invoice.created_at || invoice.created;
            if (invoiceDate) {
                const invoiceDateObj = typeof invoiceDate === 'number'
                    ? new Date(invoiceDate * 1000)
                    : new Date(invoiceDate);
                const filterDate = new Date(searchFilters.end_date);
                filterDate.setHours(23, 59, 59, 999); // Include the entire end date
                if (invoiceDateObj > filterDate) {
                    return false;
                }
            }
        }

        return true;
    });

    if (loading) {
        return (
            <div className="content-wrapper" style={{ marginTop: '15px', background: '#f8fafc', minHeight: 'calc(100vh - 57px)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading invoices...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper" style={{ marginTop: '15px', background: '#f8fafc', minHeight: 'calc(100vh - 57px)' }}>
            <style>{`
                .invoice-page {
                    padding: 24px;
                    width: 100%;
                }

                .invoice-header {
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

                .invoice-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .invoice-header-content {
                    position: relative;
                    z-index: 1;
                }

                .invoice-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                }

                .invoice-header p {
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
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
                }

                .stat-card.active {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

                .invoice-table-card {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .invoice-table-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .invoice-table-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .invoice-table th {
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

                .invoice-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }

                .invoice-table tr:last-child td {
                    border-bottom: none;
                }

                .invoice-table tr:hover td {
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

                .date-value {
                    color: #475569;
                    font-size: 0.85rem;
                }

                .due-date-overdue {
                    color: #ef4444;
                    font-weight: 600;
                }

                .contract-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    color: #6366f1;
                    font-size: 0.85rem;
                    text-decoration: none;
                    font-weight: 500;
                }

                .contract-link:hover {
                    text-decoration: underline;
                }

                .actions-cell {
                    text-align: right;
                    white-space: nowrap;
                }

                .actions-cell a,
                .actions-cell button {
                    display: inline-block;
                    padding: 5px 10px;
                    margin-left: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    border-radius: 4px;
                    text-decoration: none;
                    cursor: pointer;
                    border: none;
                }

                .btn-pay {
                    background-color: #22c55e;
                    color: white;
                }

                .btn-pay:hover {
                    background-color: #16a34a;
                }

                .btn-pdf {
                    background-color: #3b82f6;
                    color: white;
                }

                .btn-pdf:hover {
                    background-color: #2563eb;
                }

                .btn-view {
                    background-color: #6b7280;
                    color: white;
                }

                .btn-view:hover {
                    background-color: #4b5563;
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

                .filter-toggle-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #475569;
                    position: relative;
                }

                .filter-toggle-btn:hover {
                    background: #f8fafc;
                }

                .filter-toggle-btn.active {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border-color: transparent;
                }

                .filter-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 700;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .filter-panel {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 16px;
                    border: 1px solid #e2e8f0;
                }

                .filter-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .filter-group label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #475569;
                }

                .filter-group input,
                .filter-group select {
                    padding: 10px 14px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: white;
                    transition: all 0.2s ease;
                }

                .filter-group input:focus,
                .filter-group select:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .filter-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .filter-clear-btn {
                    padding: 10px 20px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .filter-clear-btn:hover {
                    background: #f1f5f9;
                }

                .invoice-row-highlighted {
                    animation: highlightFade 3s ease-out;
                }

                @keyframes highlightFade {
                    0% { background: rgba(99, 102, 241, 0.2); }
                    100% { background: transparent; }
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .invoice-table {
                        display: block;
                        overflow-x: auto;
                    }
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .invoice-page {
                        padding: 16px;
                    }

                    .invoice-header {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                        padding: 24px;
                    }

                    .invoice-header h1 {
                        font-size: 1.5rem;
                    }
                }

                /* Outstanding Fees Card */
                .outstanding-fees-card {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border: 2px solid #f59e0b;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
                }

                .fees-header {
                    display: flex;
                    align-items: center;
                    padding: 20px 24px;
                    background: rgba(245, 158, 11, 0.1);
                    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
                    gap: 16px;
                }

                .fees-header-icon {
                    width: 52px;
                    height: 52px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.4rem;
                    flex-shrink: 0;
                }

                .fees-header-content {
                    flex: 1;
                }

                .fees-header-content h3 {
                    margin: 0;
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #92400e;
                }

                .fees-header-content p {
                    margin: 4px 0 0 0;
                    font-size: 0.875rem;
                    color: #b45309;
                }

                .fees-header-total {
                    text-align: right;
                }

                .fees-header-total .total-label {
                    display: block;
                    font-size: 0.75rem;
                    color: #92400e;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .fees-header-total .total-value {
                    display: block;
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #b45309;
                }

                .fees-body {
                    padding: 16px 24px;
                }

                .fee-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-bottom: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    transition: all 0.2s ease;
                }

                .fee-row:last-child {
                    margin-bottom: 0;
                }

                .fee-row:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-1px);
                }

                .fee-info {
                    flex: 1;
                }

                .fee-contract-name {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.95rem;
                }

                .fee-contract-name i {
                    color: #6b7280;
                }

                .fee-details-meta {
                    display: flex;
                    gap: 16px;
                    margin-top: 6px;
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .fee-details-meta i {
                    margin-right: 4px;
                }

                .fee-rate {
                    color: #b45309;
                    font-weight: 500;
                }

                .fee-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .fee-amount-display {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #b45309;
                }

                .pay-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pay-btn:hover {
                    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
                }

                @media (max-width: 768px) {
                    .fees-header {
                        flex-direction: column;
                        text-align: center;
                    }

                    .fees-header-total {
                        text-align: center;
                        margin-top: 8px;
                    }

                    .fee-row {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .fee-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>

            <div className="invoice-page">
                {/* Header */}
                <div className="invoice-header">
                    <div className="invoice-header-content">
                        <h1><i className="fas fa-file-invoice mr-3"></i>Invoices</h1>
                        <p>View and manage all your invoices</p>
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

                {/* Outstanding Cancellation Fees Section */}
                {!loadingFees && pendingFees?.has_outstanding_fees && (
                    <div className="outstanding-fees-card">
                        <div className="fees-header">
                            <div className="fees-header-icon">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="fees-header-content">
                                <h3>Outstanding Cancellation Fees</h3>
                                <p>You have cancellation fees that need to be paid. These fees were incurred from withdrawing from booked contracts within 48 hours of start.</p>
                            </div>
                            <div className="fees-header-total">
                                <span className="total-label">Total Outstanding</span>
                                <span className="total-value">${pendingFees.total_amount?.toFixed(2)} CAD</span>
                            </div>
                        </div>
                        <div className="fees-body">
                            {pendingFees.fees.map((fee) => (
                                <div key={fee.id} className="fee-row">
                                    <div className="fee-info">
                                        <div className="fee-contract-name">
                                            <i className="fas fa-file-contract"></i>
                                            {fee.contract_title || `Contract #${fee.contract_id}`}
                                        </div>
                                        <div className="fee-details-meta">
                                            <span>
                                                <i className="fas fa-calendar"></i>
                                                {new Date(fee.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <span className="fee-rate">{fee.percentage}% cancellation fee</span>
                                        </div>
                                    </div>
                                    <div className="fee-actions">
                                        <span className="fee-amount-display">${fee.amount?.toFixed(2)}</span>
                                        <button className="pay-btn" onClick={() => handlePayFee(fee)}>
                                            <i className="fas fa-credit-card"></i>
                                            Pay Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Statistics */}
                <div className="stats-grid">
                    <div
                        className={`stat-card ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white' }}>
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Invoices</div>
                    </div>
                    <div
                        className={`stat-card ${filter === 'open' ? 'active' : ''}`}
                        onClick={() => setFilter('open')}
                    >
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-value">{stats.open}</div>
                        <div className="stat-label">Open</div>
                    </div>
                    <div
                        className={`stat-card ${filter === 'paid' ? 'active' : ''}`}
                        onClick={() => setFilter('paid')}
                    >
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-value">{stats.paid}</div>
                        <div className="stat-label">Paid</div>
                    </div>
                    <div
                        className={`stat-card ${filter === 'overdue' ? 'active' : ''}`}
                        onClick={() => setFilter('overdue')}
                    >
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
                            <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <div className="stat-value">{stats.overdue}</div>
                        <div className="stat-label">Overdue</div>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="invoice-table-card">
                    <div className="invoice-table-header">
                        <h2>
                            {filter === 'all' ? 'All Invoices' :
                             filter === 'open' ? 'Open Invoices' :
                             filter === 'paid' ? 'Paid Invoices' :
                             'Overdue Invoices'}
                            <span style={{ fontWeight: 400, color: '#64748b', marginLeft: '8px' }}>
                                ({filteredInvoices.length})
                            </span>
                        </h2>
                        <button
                            className={`filter-toggle-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <i className={`fas ${showFilters ? 'fa-times' : 'fa-filter'}`}></i>
                            {showFilters ? 'Hide Filters' : 'Filters'}
                            {activeFiltersCount > 0 && (
                                <span className="filter-badge">{activeFiltersCount}</span>
                            )}
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="filter-panel">
                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>
                                        <i className="fas fa-hashtag mr-2"></i>
                                        Invoice ID / Number
                                    </label>
                                    <input
                                        type="text"
                                        name="invoice_id"
                                        placeholder="Search by invoice ID or number..."
                                        value={searchFilters.invoice_id}
                                        onChange={handleSearchFilterChange}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>
                                        <i className="fas fa-tag mr-2"></i>
                                        Invoice Type
                                    </label>
                                    <select
                                        name="invoice_type"
                                        value={searchFilters.invoice_type}
                                        onChange={handleSearchFilterChange}
                                    >
                                        <option value="">All Types</option>
                                        <option value="headhunter_monthly">Monthly Subscription</option>
                                        <option value="headhunter_commission">Commission</option>
                                        <option value="clinic_commission">Service Fee</option>
                                        <option value="direct_hire">Direct Hire</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>
                                        <i className="fas fa-calendar-alt mr-2"></i>
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={searchFilters.start_date}
                                        onChange={handleSearchFilterChange}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>
                                        <i className="fas fa-calendar-check mr-2"></i>
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={searchFilters.end_date}
                                        onChange={handleSearchFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="filter-actions">
                                <button
                                    type="button"
                                    className="filter-clear-btn"
                                    onClick={handleClearFilters}
                                >
                                    <i className="fas fa-times mr-2"></i>
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {filteredInvoices.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i className="fas fa-file-invoice"></i>
                            </div>
                            <h3>No invoices found</h3>
                            <p>
                                {filter === 'all'
                                    ? 'Invoices will appear here once contracts are booked'
                                    : `No ${filter} invoices at the moment`
                                }
                            </p>
                        </div>
                    ) : (
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Type</th>
                                    <th>Contract</th>
                                    <th>Issue Date</th>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => {
                                    const statusInfo = getStatusInfo(invoice);
                                    const typeInfo = getInvoiceTypeInfo(invoice);
                                    const contractInfo = getContractInfo(invoice);
                                    const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status?.toLowerCase() === 'open';
                                    const isHighlighted = highlightedInvoiceId === invoice.id;

                                    return (
                                        <tr key={invoice.id} className={isHighlighted ? 'invoice-row-highlighted' : ''}>
                                            <td>
                                                <span className="invoice-id">
                                                    {getInvoiceNumber(invoice)}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className="type-badge"
                                                    style={{ background: typeInfo.bg, color: typeInfo.color }}
                                                    title={typeInfo.description}
                                                >
                                                    <i className={`fas ${typeInfo.icon}`}></i>
                                                    {typeInfo.label}
                                                </span>
                                            </td>
                                            <td>
                                                {contractInfo.contractId ? (
                                                    <span className="contract-link">
                                                        <i className="fas fa-file-contract"></i>
                                                        #{contractInfo.contractId}
                                                    </span>
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
                                                <span
                                                    className="status-badge"
                                                    style={{ background: statusInfo.bg, color: statusInfo.color }}
                                                >
                                                    <i className={`fas ${statusInfo.icon}`}></i>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                {invoice.status?.toLowerCase() === 'open' && invoice.hosted_invoice_url && (
                                                    <button className="btn-pay" onClick={() => handlePayInvoice(invoice)}>
                                                        Pay
                                                    </button>
                                                )}
                                                {(invoice.invoice_pdf || invoice.invoice_pdf_url) && (
                                                    <button className="btn-pdf" onClick={() => handleViewPDF(invoice)}>
                                                        PDF
                                                    </button>
                                                )}
                                                {invoice.hosted_invoice_url && (
                                                    <button className="btn-view" onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}>
                                                        View
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceDashboard;
