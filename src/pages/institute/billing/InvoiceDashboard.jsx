import {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import InvoiceService from '@services/institute/InvoiceService';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    FileText, FolderOpen, CreditCard, WalletCards, ListFilter, Hash,
    Tag,
    CalendarDays,
    X,
    CalendarCheck
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import InvoiceTable from "@pages/institute/billing/Invoice/InvoiceTable.jsx";
import {Label} from "@components/ui/label.jsx";
import {Input} from "@components/ui/input.jsx";
import {Button} from "@components/ui/button.jsx";
import InvoicesSkeleton from "@pages/institute/billing/Invoice/InvoicesSkeleton.jsx";

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
            setSearchFilters(prev => ({...prev, invoice_id: invoiceIdParam}));
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
            return {label: 'OVERDUE', color: '#ef4444', bg: '#fef2f2', icon: 'fa-exclamation-circle'};
        }

        const statuses = {
            open: {label: 'OPEN', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock'},
            paid: {label: 'PAID', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle'},
            void: {label: 'VOID', color: '#6b7280', bg: '#f3f4f6', icon: 'fa-ban'},
            draft: {label: 'DRAFT', color: '#3b82f6', bg: '#eff6ff', icon: 'fa-file'},
            uncollectible: {label: 'UNCOLLECTIBLE', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle'}
        };
        return statuses[statusLower] || {
            label: statusLower?.toUpperCase() || 'N/A',
            color: '#6b7280',
            bg: '#f3f4f6',
            icon: 'fa-file'
        };
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

        return {contractId: null, contractType: null};
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
        const {name, value} = e.target;
        setSearchFilters(prev => ({...prev, [name]: value}));
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
        return <InvoicesSkeleton/>
    }

    const tabs = [
        {id: 'all', label: 'Total Invoices', icon: FileText, count: stats.total || 0},
        {id: 'open', label: 'Open', icon: FolderOpen, count: stats.open || 0},
        {id: 'paid', label: 'Paid', icon: CreditCard, count: stats.paid || 0},
        {id: 'overdue', label: 'Overdue', icon: WalletCards, count: stats.overdue || 0},
    ];

    return (
        <>
            <div className="flex items-center gap-2">
                <div className="pr-4 py-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`relative !p-2.5 !rounded-md border transition-all duration-200 ${
                            showFilters
                                ? "bg-[#EEF7FF] border-[#BDD7ED] text-[#2D8FE3]"
                                : "border-gray-200 hover:bg-gray-50 text-gray-500"
                        }`}
                    >
                        {/* Main Icon */}
                        <ListFilter size={20} strokeWidth={1.5}/>

                        {/* Filter Count Badge */}
                        {activeFiltersCount > 0 && (
                            <span
                                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D8FE3] text-[10px] font-bold text-white border-2 border-white shadow-sm animate-in zoom-in duration-300">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="w-full bg-white border-b border-gray-200 flex items-center ">
                    {/* Tabs Container */}
                    <div className="flex flex-1 items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = filter === tab.id;

                            return (
                                <div
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id)}
                                    className={`
                                relative flex items-center gap-3 px-2 pb-3 cursor-pointer transition-all duration-300 whitespace-nowrap group
                                ${isActive ? 'text-[#2D8FE3]' : 'text-gray-500 hover:text-gray-700'}
                            `}
                                >
                                    {/* Icon */}
                                    <Icon
                                        size={20}
                                        strokeWidth={isActive ? 2 : 1.5}
                                        className={`${isActive ? 'text-[#2D8FE3]' : 'text-gray-400 group-hover:text-gray-600'}`}
                                    />

                                    {/* Label */}
                                    <span
                                        className={`text-[15px] font-medium tracking-tight ${isActive ? 'font-semibold' : 'font-normal'}`}>
                                    {tab.label}
                                </span>

                                    {/* Badge/Count */}
                                    <span className={`
                                ml-1 flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold rounded-lg border
                                ${isActive
                                        ? 'bg-[#EEF7FF] border-[#DBEEFF] text-[#2D8FE3]'
                                        : 'bg-white border-gray-200 text-gray-500'}
                                `}>
                                    {tab.count}
                                </span>

                                    {/* Active Underline Indicator */}
                                    {isActive && (
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2D8FE3] rounded-t-full"/>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {showFilters && (
                <div
                    className="bg-white border border-gray-200 rounded-xl p-6 mt-4 shadow-sm animate-in fade-in zoom-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Invoice ID / Number */}
                        <div className="space-y-2">
                            <Label className="!flex items-center gap-2 text-sm font-semibold text-[#2A394B]">
                                <Hash size={16} className="text-gray-400"/>
                                Invoice ID / Number
                            </Label>
                            <Input
                                type="text"
                                name="invoice_id"
                                placeholder="Search by ID..."
                                value={searchFilters.invoice_id}
                                onChange={handleSearchFilterChange}
                                className="h-10 focus-visible:ring-[#2D8FE3] border-gray-200"
                            />
                        </div>

                        {/* Invoice Type */}
                        <div className="space-y-2">
                            <Label className="!flex items-center gap-2 text-sm font-semibold text-[#2A394B]">
                                <Tag size={16} className="text-gray-400"/>
                                Invoice Type
                            </Label>
                            <Select
                                name="invoice_type"
                                value={searchFilters.invoice_type || "all_types"}
                                // Shadcn Select সরাসরি value দেয়, তাই আমরা manual event object তৈরি করে দিচ্ছি
                                onValueChange={(value) => {
                                    const finalValue = value === "all_types" ? "" : value;
                                    handleSearchFilterChange({
                                        target: {
                                            name: "invoice_type",
                                            value: finalValue
                                        }
                                    })
                                }}
                            >
                                <SelectTrigger className="w-full h-10 border-gray-200 focus:ring-[#2D8FE3]">
                                    <SelectValue placeholder="All Types"/>
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all_types">All
                                        Types</SelectItem> {/* value খালি রাখা যায় না তাই 'all_types' বা 'all' দিতে পারেন */}
                                    <SelectItem value="headhunter_monthly">Monthly Subscription</SelectItem>
                                    <SelectItem value="headhunter_commission">Commission</SelectItem>
                                    <SelectItem value="clinic_commission">Service Fee</SelectItem>
                                    <SelectItem value="direct_hire">Direct Hire</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* From Date */}
                        <div className="space-y-2">
                            <Label className="!flex items-center gap-2 text-sm font-semibold text-[#2A394B]">
                                <CalendarDays size={16} className="text-gray-400"/>
                                From Date
                            </Label>
                            <Input
                                type="date"
                                name="start_date"
                                value={searchFilters.start_date}
                                onChange={handleSearchFilterChange}
                                className="h-10 focus-visible:ring-[#2D8FE3] border-gray-200"
                            />
                        </div>

                        {/* To Date */}
                        <div className="space-y-2">
                            <Label className="!flex items-center gap-2 text-sm font-semibold text-[#2A394B]">
                                <CalendarCheck size={16} className="text-gray-400"/>
                                To Date
                            </Label>
                            <Input
                                type="date"
                                name="end_date"
                                value={searchFilters.end_date}
                                onChange={handleSearchFilterChange}
                                className="h-10 focus-visible:ring-[#2D8FE3] border-gray-200"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="text-gray-500 hover:text-red-500 hover:bg-red-50 !rounded-md gap-2 font-medium transition-colors"
                        >
                            <X size={16}/>
                            Clear Filters
                        </Button>
                    </div>
                </div>
            )}

            {filteredInvoices.length === 0 ? (
                <div className="empty-state py-20 text-center border rounded-xl bg-white mt-4">
                    <div className="empty-state-icon mb-4 flex justify-center">
                        <div className="p-4 bg-gray-50 rounded-full">
                            <FileText size={48} className="text-gray-300"/>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No invoices found</h3>
                    <p className="text-gray-500">
                        {filter === 'all'
                            ? 'Invoices will appear here once contracts are booked'
                            : `No ${filter} invoices at the moment`
                        }
                    </p>
                </div>
            ) : (
                <div className="mt-4">
                    <InvoiceTable
                        data={filteredInvoices}
                        getStatusInfo={getStatusInfo}
                        getInvoiceTypeInfo={getInvoiceTypeInfo}
                        getContractInfo={getContractInfo}
                        getInvoiceNumber={getInvoiceNumber}
                        formatDate={formatDate}
                        formatAmount={formatAmount}
                        handlePayInvoice={handlePayInvoice}
                        handleViewPDF={handleViewPDF}
                    />
                </div>
            )}

        </>
    );
};

export default InvoiceDashboard;
