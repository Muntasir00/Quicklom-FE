import axios from 'axios';

const BASE_URL = '/v.1/institute';

class InvoiceService {
    // ============================================================================
    // INVOICE MANAGEMENT
    // ============================================================================

    static async getUserInvoices(status = null, limit = 50) {
        try {
            const params = { limit };
            if (status) {
                params.status = status;
            }

            const response = await axios.get(`${BASE_URL}/billing/invoices/user`, { params });
            return response.data;
        } catch (error) {
            console.error('Error getting user invoices:', error);
            throw error;
        }
    }

    static async getInvoiceDetails(invoiceId) {
        try {
            const response = await axios.get(`${BASE_URL}/billing/invoices/${invoiceId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting invoice details:', error);
            throw error;
        }
    }

    static async generateInvoice(contractId, paymentPlan = 'fixed_monthly') {
        try {
            const response = await axios.post(`${BASE_URL}/billing/invoices/generate`, {
                contract_id: contractId,
                payment_plan: paymentPlan
            });
            return response.data;
        } catch (error) {
            console.error('Error generating invoice:', error);
            throw error;
        }
    }

    static async sendPaymentRequest(invoiceId) {
        try {
            const response = await axios.post(`${BASE_URL}/billing/invoices/send-payment-request`, {
                invoice_id: invoiceId
            });
            return response.data;
        } catch (error) {
            console.error('Error sending payment request:', error);
            throw error;
        }
    }

    static async getPendingCount() {
        try {
            const response = await axios.get(`${BASE_URL}/billing/invoices/pending/count`);
            return response.data;
        } catch (error) {
            console.error('Error getting pending invoices count:', error);
            throw error;
        }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    static formatCurrency(amount, currency = 'CAD') {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    }

    static formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static getStatusColor(status) {
        const colors = {
            open: 'warning',
            paid: 'success',
            void: 'default',
            draft: 'info',
            uncollectible: 'error'
        };
        return colors[status] || 'default';
    }
}

export default InvoiceService;