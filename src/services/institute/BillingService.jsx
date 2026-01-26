import axios from 'axios';

const BASE_URL = '/v.1/institute';

class BillingService {
    // ============================================================================
    // CUSTOMER MANAGEMENT
    // ============================================================================

    static async getOrCreateCustomer(customerData) {
        try {
            const response = await axios.post(`${BASE_URL}/billing/customers/create`, customerData);
            return response.data;
        } catch (error) {
            console.error('Error creating/getting customer:', error);
            throw error;
        }
    }

    static async getCustomerByUser() {
        try {
            const response = await axios.get(`${BASE_URL}/billing/customers/by-user`);
            return response.data;
        } catch (error) {
            console.error('Error getting customer:', error);
            throw error;
        }
    }

    static async getMyCustomer() {
        try {
            const response = await axios.get(`${BASE_URL}/billing/customers/me`);
            return response.data;
        } catch (error) {
            console.error('Error getting customer details:', error);
            throw error;
        }
    }

    // ============================================================================
    // SUBSCRIPTION PLAN MANAGEMENT
    // ============================================================================

    static async getCurrentPlan() {
        try {
            const response = await axios.get(`${BASE_URL}/billing/subscription-plan/current`);
            return response.data;
        } catch (error) {
            console.error('Error getting current plan:', error);
            throw error;
        }
    }

    static async updateSubscriptionPlan(planType) {
        try {
            const response = await axios.post(`${BASE_URL}/billing/subscription-plan/update`, {
                plan_type: planType
            });
            return response.data;
        } catch (error) {
            console.error('Error updating subscription plan:', error);
            throw error;
        }
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    static async getBillingStatistics() {
        try {
            const response = await axios.get(`${BASE_URL}/billing/statistics`);
            return response.data;
        } catch (error) {
            console.error('Error getting billing statistics:', error);
            throw error;
        }
    }

    // ============================================================================
    // INVOICES
    // ============================================================================

    static async getInvoices(limit = 50) {
        try {
            const response = await axios.get(
                `${BASE_URL}/billing/invoices?limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error('Error getting invoices:', error);
            throw error;
        }
    }

    static async getCharges(limit = 50) {
        try {
            const response = await axios.get(
                `${BASE_URL}/billing/charges?limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error('Error getting charges:', error);
            throw error;
        }
    }

    // ============================================================================
    // SUBSCRIPTIONS (Legacy - Keep for backward compatibility)
    // ============================================================================

    static async listCustomerSubscriptions(customerId) {
        try {
            const response = await axios.get(
                `${BASE_URL}/billing/subscriptions/customer/${customerId}/list`
            );
            return response.data;
        } catch (error) {
            console.error('Error getting subscriptions:', error);
            throw error;
        }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    static formatCurrency(amount, currency = 'CAD') {
        // Amount is in cents
        const dollars = amount / 100;
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(dollars);
    }

    static formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

export default BillingService;