import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_URL = `${API_URL}/api/v.1/admin`;

class AdminInvoiceService {
    // ============================================================================
    // INVOICE MANAGEMENT
    // ============================================================================

    /**
     * Get all invoices with comprehensive filtering
     */
    static async getAllInvoices(filters = {}) {
        try {
            const params = {
                status: filters.status || null,
                payment_plan: filters.payment_plan || null,
                invoice_type: filters.invoice_type || null,
                user_id: filters.user_id || null,
                contract_id: filters.contract_id || null,
                date_from: filters.date_from || null,
                date_to: filters.date_to || null,
                amount_min: filters.amount_min || null,
                amount_max: filters.amount_max || null,
                overdue_only: filters.overdue_only || null,
                search: filters.search || null,
                limit: filters.limit || 50,
                offset: filters.offset || 0,
                sort_by: filters.sort_by || 'created_at',
                sort_order: filters.sort_order || 'desc',
            };

            // Remove null/empty values
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

            const response = await axios.get(`${BASE_URL}/invoices`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw error;
        }
    }

    /**
     * Get detailed information about a specific invoice
     */
    static async getInvoiceDetails(invoiceId) {
        try {
            const response = await axios.get(`${BASE_URL}/invoices/${invoiceId}`);
            return response.data.data; // Return the inner data object
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            throw error;
        }
    }

    /**
     * Get comprehensive invoice statistics for dashboard
     */
    static async getInvoiceStatistics() {
        try {
            const response = await axios.get(`${BASE_URL}/invoices/statistics/overview`);
            return response.data.data; // Return the inner data object
        } catch (error) {
            console.error('Error fetching invoice statistics:', error);
            throw error;
        }
    }

    // ============================================================================
    // ADMIN ACTIONS
    // ============================================================================

    /**
     * Send payment reminder for an invoice
     */
    static async sendReminder(invoiceId) {
        try {
            const response = await axios.post(`${BASE_URL}/invoices/${invoiceId}/send-reminder`);
            return response.data;
        } catch (error) {
            console.error('Error sending reminder:', error);
            throw error;
        }
    }

    /**
     * Mark invoice as paid (for manual/offline payments)
     */
    static async markAsPaid(invoiceId) {
        try {
            const response = await axios.post(`${BASE_URL}/invoices/${invoiceId}/mark-paid`);
            return response.data;
        } catch (error) {
            console.error('Error marking invoice as paid:', error);
            throw error;
        }
    }

    /**
     * Void an invoice
     */
    static async voidInvoice(invoiceId) {
        try {
            const response = await axios.post(`${BASE_URL}/invoices/${invoiceId}/void`);
            return response.data;
        } catch (error) {
            console.error('Error voiding invoice:', error);
            throw error;
        }
    }

    /**
     * Reactivate user after invoice payment
     */
    static async reactivateUser(invoiceId) {
        try {
            const response = await axios.post(`${BASE_URL}/invoices/${invoiceId}/reactivate-user`);
            return response.data;
        } catch (error) {
            console.error('Error reactivating user:', error);
            throw error;
        }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Format currency amount (always in CAD)
     * @param {number} amountInCents - Amount in cents
     * @returns {string} Formatted currency string in CAD
     */
    static formatCurrency(amountInCents) {
        const dollars = amountInCents / 100;
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(dollars);
    }

    /**
     * Format date from ISO string
     * @param {string} isoString - ISO date string
     * @returns {string} Formatted date
     */
    static formatDate(isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Get status color for badges
     * @param {string} status - Invoice status
     * @returns {string} Color class/name
     */
    static getStatusColor(status) {
        const colors = {
            OPEN: 'warning',
            PAID: 'success',
            VOID: 'default',
            DRAFT: 'info',
            UNCOLLECTIBLE: 'error'
        };
        return colors[status?.toUpperCase()] || 'default';
    }

    /**
     * Get payment plan display name
     * @param {string} plan - Payment plan type
     * @returns {string} Display name
     */
    static getPaymentPlanDisplay(plan) {
        const displays = {
            fixed_monthly: 'Fixed Monthly',
            commission: 'Commission',
            pay_on_success: 'Pay on Success'
        };
        return displays[plan] || plan;
    }

    /**
     * Get status badge color for Material-UI
     * @param {string} status - Invoice status
     * @param {boolean} isOverdue - Whether invoice is overdue (from backend)
     * @returns {string} MUI color variant
     */
    static getStatusBadgeColor(status, isOverdue = false) {
        // If invoice is overdue (OPEN + past due date), show as error
        if (isOverdue && status === 'OPEN') {
            return 'error';
        }

        const colors = {
            OPEN: 'warning',
            PAID: 'success',
            VOID: 'default',
            DRAFT: 'info',
            UNCOLLECTIBLE: 'error'
        };
        return colors[status?.toUpperCase()] || 'default';
    }

    /**
     * Get payment plan badge color
     * @param {string} plan - Payment plan type
     * @returns {string} Color variant
     */
    static getPaymentPlanColor(plan) {
        const colors = {
            fixed_monthly: 'primary',
            commission: 'secondary',
            pay_on_success: 'success'
        };
        return colors[plan] || 'default';
    }

    /**
     * Check if invoice is overdue
     * @param {Object} invoice - Invoice object
     * @returns {boolean}
     */
    static isOverdue(invoice) {
        if (invoice.status === 'OVERDUE') return true;
        if (invoice.status === 'PAID' || invoice.status === 'VOID') return false;

        if (invoice.due_date) {
            const dueDate = new Date(invoice.due_date);
            return dueDate < new Date();
        }

        return false;
    }

    /**
     * Calculate days until due or days overdue
     * @param {string} dueDateISO - Due date ISO string
     * @returns {Object} { days: number, isOverdue: boolean }
     */
    static getDaysUntilDue(dueDateISO) {
        if (!dueDateISO) return { days: null, isOverdue: false };

        const dueDate = new Date(dueDateISO);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            days: Math.abs(diffDays),
            isOverdue: diffDays < 0
        };
    }

    /**
     * Get filter options for dropdowns
     */
    static getFilterOptions() {
        return {
            statuses: [
                { value: 'OPEN', label: 'Open' },
                { value: 'PAID', label: 'Paid' },
                { value: 'OVERDUE', label: 'Overdue' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'VOID', label: 'Void' },
                { value: 'UNCOLLECTIBLE', label: 'Uncollectible' }
            ],
            paymentPlans: [
                { value: 'fixed_monthly', label: 'Fixed Monthly' },
                { value: 'commission', label: 'Commission' },
                { value: 'pay_on_success', label: 'Pay on Success' }
            ],
            invoiceTypes: [
                { value: 'commission', label: 'Commission (10%)', icon: '💰', color: '#4caf50' },
                { value: 'monthly_subscription', label: 'Monthly Subscription', icon: '📅', color: '#2196f3' },
                { value: 'service_fee', label: 'Service Fee', icon: '📄', color: '#ff9800' },
                { value: 'per_contract_fee', label: 'Per Contract Fee', icon: '📋', color: '#9c27b0' }
            ],
            sortFields: [
                { value: 'created_at', label: 'Created Date' },
                { value: 'due_date', label: 'Due Date' },
                { value: 'amount_due', label: 'Amount' },
                { value: 'status', label: 'Status' },
                { value: 'payment_plan', label: 'Payment Plan' }
            ],
            sortOrders: [
                { value: 'desc', label: 'Newest First' },
                { value: 'asc', label: 'Oldest First' }
            ]
        };
    }

    /**
     * Get invoice type display info
     */
    static getInvoiceTypeInfo(type) {
        const types = {
            commission: { label: 'Commission (10%)', icon: '💰', color: '#4caf50', bgColor: '#e8f5e9' },
            monthly_subscription: { label: 'Monthly Subscription', icon: '📅', color: '#2196f3', bgColor: '#e3f2fd' },
            service_fee: { label: 'Service Fee', icon: '📄', color: '#ff9800', bgColor: '#fff3e0' },
            per_contract_fee: { label: 'Per Contract Fee', icon: '📋', color: '#9c27b0', bgColor: '#f3e5f5' }
        };
        return types[type] || { label: type || 'Other', icon: '📑', color: '#757575', bgColor: '#f5f5f5' };
    }
}

export default AdminInvoiceService;