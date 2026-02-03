import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import InvoiceService from '@services/institute/InvoiceService';
import BillingService from '@services/institute/BillingService';
import {FeatureCard} from "@pages/institute/billing/PaymentHistory/feature-card.jsx";
import {CreditCard, FileTextIcon, FolderOpen, Info} from "lucide-react";
import InvoiceHistoryTable from "@pages/institute/billing/PaymentHistory/InvoiceHistoryTable.jsx";
import ChargeHistoryTable from "@pages/institute/billing/PaymentHistory/ChargeHistoryTable.jsx";
import PaymentHistorySkeleton from "@pages/institute/billing/PaymentHistory/PaymentHistorySkeleton.jsx";

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
            return {label: 'OVERDUE', color: '#ef4444', bg: '#fef2f2', icon: 'fa-exclamation-circle'};
        }

        const statuses = {
            paid: {label: 'PAID', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle'},
            succeeded: {label: 'SUCCEEDED', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle'},
            open: {label: 'OPEN', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock'},
            draft: {label: 'DRAFT', color: '#3b82f6', bg: '#eff6ff', icon: 'fa-file'},
            void: {label: 'VOID', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-ban'},
            uncollectible: {label: 'UNCOLLECTIBLE', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle'},
            failed: {label: 'FAILED', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle'},
            pending: {label: 'PENDING', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock'}
        };
        return statuses[statusLower] || {
            label: statusLower?.toUpperCase() || 'N/A',
            color: '#6b7280',
            bg: '#f3f4f6',
            icon: 'fa-file'
        };
    };

    const getChargeStatusInfo = (status) => {
        const statusLower = status?.toLowerCase();
        const statuses = {
            succeeded: {label: 'SUCCEEDED', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle'},
            failed: {label: 'FAILED', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle'},
            pending: {label: 'PENDING', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock'}
        };
        return statuses[statusLower] || {
            label: statusLower?.toUpperCase() || 'N/A',
            color: '#6b7280',
            bg: '#f3f4f6',
            icon: 'fa-file'
        };
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

        return {contractId: null, contractType: null, contractValue: 0, commissionRate: '10%'};
    };

    const getInvoiceTypeInfo = (invoice) => {
        const planType = invoice.payment_plan || invoice.invoice_metadata?.invoice_type;

        const types = {
            'headhunter_monthly': {label: 'Subscription', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-calendar-check'},
            'headhunter_commission': {label: 'Commission', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-percentage'},
            'clinic_commission': {
                label: 'Service Fee',
                color: '#10b981',
                bg: '#ecfdf5',
                icon: 'fa-file-invoice-dollar'
            },
            'commission': {label: 'Commission', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-percentage'},
            'contract_commission': {label: 'Commission', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-percentage'},
            'direct_hire': {label: 'Direct Hire', color: '#3b82f6', bg: '#eff6ff', icon: 'fa-handshake'}
        };

        return types[planType] || {label: 'Payment', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-file-invoice'};
    };

    if (loading) {
        return (
            <div className="p-1">
                <PaymentHistorySkeleton />
            </div>
        );
    }

    const statsData = [
        {label: "Total Paid", value: `${formatAmount(stats.totalPaid)}`},
        {label: "Total Invoices", value: stats.totalInvoices},
        {label: "Total Charges", value: stats.totalCharges},
    ];

    return (
        <>
            <div className="space-y-4">
                <FeatureCard stats={statsData}/>

                <div className="w-full bg-white border-b border-gray-200">
                    <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth">
                        {/* Invoices Tab */}
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`
                        relative flex-1 flex items-center gap-3 px-6 pb-4 pt-2 cursor-pointer transition-all duration-300 whitespace-nowrap group
                        ${activeTab === 'invoices' ? 'text-[#2D8FE3]' : 'text-gray-500 hover:text-gray-700'}
                    `}
                        >
                            <FileTextIcon
                                size={18}
                                strokeWidth={activeTab === 'invoices' ? 2 : 1.5}
                                className={activeTab === 'invoices' ? 'text-[#2D8FE3]' : 'text-gray-400 group-hover:text-gray-600'}
                            />
                            <span
                                className={`text-[15px] font-medium ${activeTab === 'invoices' ? 'font-semibold' : 'font-normal'}`}>
                        Invoices
                    </span>
                            <span className={`
                        ml-auto flex items-center justify-center min-w-[24px] h-6 px-2 text-[11px] font-bold rounded-lg border
                        ${activeTab === 'invoices'
                                ? 'bg-[#EEF7FF] border-[#DBEEFF] text-[#2D8FE3]'
                                : 'bg-white border-gray-200 text-gray-500'}
                    `}>
                        {invoices.length}
                    </span>

                            {/* Active Indicator Line */}
                            {activeTab === 'invoices' && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2D8FE3] rounded-t-full"/>
                            )}
                        </button>

                        {/* Charges Tab */}
                        <button
                            onClick={() => setActiveTab('charges')}
                            className={`
                        relative flex-1 flex items-center gap-3 px-6 pb-4 pt-2 cursor-pointer transition-all duration-300 whitespace-nowrap group
                        ${activeTab === 'charges' ? 'text-[#2D8FE3]' : 'text-gray-500 hover:text-gray-700'}
                    `}
                        >
                            <FolderOpen
                                size={18}
                                strokeWidth={activeTab === 'charges' ? 2 : 1.5}
                                className={activeTab === 'charges' ? 'text-[#2D8FE3]' : 'text-gray-400 group-hover:text-gray-600'}
                            />
                            <span
                                className={`text-[15px] font-medium ${activeTab === 'charges' ? 'font-semibold' : 'font-normal'}`}>
                        Charges
                    </span>
                            <span className={`
                        ml-auto flex items-center justify-center min-w-[24px] h-6 px-2 text-[11px] font-bold rounded-lg border
                        ${activeTab === 'charges'
                                ? 'bg-[#EEF7FF] border-[#DBEEFF] text-[#2D8FE3]'
                                : 'bg-white border-gray-200 text-gray-500'}
                    `}>
                        {charges.length}
                    </span>

                            {/* Active Indicator Line */}
                            {activeTab === 'charges' && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2D8FE3] rounded-t-full"/>
                            )}
                        </button>
                    </div>
                </div>

                {activeTab === 'invoices' && (
                    <div
                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">


                        {invoices.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                                <div
                                    className="h-20 w-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
                                    <FileTextIcon size={40} className="text-[#BDCADD]"/>
                                </div>
                                <h3 className="text-lg font-semibold text-[#2A394B]">No invoices found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Commission invoices will appear here when contracts are booked
                                </p>
                            </div>
                        ) : (
                            <InvoiceHistoryTable
                                data={invoices}
                                getStatusInfo={getStatusInfo}
                                getInvoiceTypeInfo={getInvoiceTypeInfo}
                                getContractInfo={getContractInfo}
                                getInvoiceNumber={getInvoiceNumber}
                                formatDate={formatDate}
                                formatAmount={formatAmount}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'charges' && (
                    <div
                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {charges.length === 0 ? (
                            /* Empty State */
                            <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                                <div
                                    className="h-20 w-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
                                    <CreditCard size={40} className="text-[#BDCADD]"/>
                                </div>
                                <h3 className="text-lg font-semibold text-[#2A394B]">No charges found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Payment charges will appear here when payments are processed
                                </p>
                            </div>
                        ) : (
                            <ChargeHistoryTable
                                data={charges}
                                getChargeStatusInfo={getChargeStatusInfo}
                                formatDate={formatDate}
                                formatAmount={formatAmount}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'invoices' && invoices.length > 0 && (
                    <div
                        className="mt-6 flex items-start gap-4 !rounded-xl border border-[#DBEEFF] bg-[#F3F9FE] p-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Icon Section */}
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center !rounded-md bg-[#EAF5FE] text-[#2D8FE3]">
                            <Info size={22} strokeWidth={2}/>
                        </div>

                        {/* Content Section */}
                        <div className="space-y-1.5">
                            <h4 className="text-base font-bold text-[#194185] !mb-0">
                                Commission Structure
                            </h4>
                            <p className="text-sm leading-relaxed text-[#194185]/80 !mb-0">
                                QuickLocum charges a simple <span
                                className="font-bold text-[#2D8FE3]">10% commission</span> on direct hire contract
                                values,
                                plus a <span className="font-bold text-[#2D8FE3]">$20 service fee</span> per booked
                                contract.
                                Agencies and headhunters also have a <span className="font-bold text-[#2D8FE3]">$300/month subscription</span> that
                                activates after the 2nd booked contract of the month.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default PaymentHistory;
