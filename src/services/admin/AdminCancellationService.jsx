import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_URL = `${API_URL}/api/v.1/admin/cancellations`;

class AdminCancellationService {
    /**
     * Get cancellation statistics
     */
    static async getStatistics() {
        try {
            const response = await axios.get(`${BASE_URL}/statistics`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching cancellation statistics:', error);
            throw error;
        }
    }

    /**
     * Get cancellation trends by month
     */
    static async getTrends(months = 6) {
        try {
            const response = await axios.get(`${BASE_URL}/trends`, {
                params: { months }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching cancellation trends:', error);
            throw error;
        }
    }

    /**
     * Get top cancellers
     */
    static async getTopCancellers(limit = 10, period = 'all') {
        try {
            const response = await axios.get(`${BASE_URL}/top-cancellers`, {
                params: { limit, period }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching top cancellers:', error);
            throw error;
        }
    }

    /**
     * Get all cancellations with filters
     */
    static async getAllCancellations(filters = {}) {
        try {
            const params = {
                cancellation_type: filters.cancellation_type || null,
                user_id: filters.user_id || null,
                user_type: filters.user_type || null,
                month: filters.month || null,
                year: filters.year || null,
                search: filters.search || null,
                limit: filters.limit || 25,
                offset: filters.offset || 0,
            };

            // Remove null values
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

            const response = await axios.get(BASE_URL, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching cancellations:', error);
            throw error;
        }
    }

    /**
     * Get user cancellation history
     */
    static async getUserHistory(userId) {
        try {
            const response = await axios.get(`${BASE_URL}/user/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user cancellation history:', error);
            throw error;
        }
    }

    /**
     * Format cancellation type for display
     */
    static formatType(type) {
        const types = {
            'contract_cancellation': 'Contract Cancellation',
            'application_withdrawal': 'Application Withdrawal'
        };
        return types[type] || type;
    }

    /**
     * Get type badge info
     */
    static getTypeBadge(type) {
        if (type === 'contract_cancellation') {
            return { label: 'Contract', color: 'error', bg: '#fee2e2', textColor: '#dc2626' };
        }
        return { label: 'Withdrawal', color: 'warning', bg: '#fef3c7', textColor: '#d97706' };
    }

    /**
     * Get user type badge
     */
    static getUserTypeBadge(userType) {
        const badges = {
            'Professional': { bg: '#dbeafe', color: '#1d4ed8' },
            'Clinic': { bg: '#dcfce7', color: '#166534' },
            'Pharmacy': { bg: '#f3e8ff', color: '#7c3aed' },
            'Agency': { bg: '#fef3c7', color: '#d97706' },
            'Headhunter': { bg: '#ffe4e6', color: '#be123c' }
        };
        return badges[userType] || { bg: '#f3f4f6', color: '#4b5563' };
    }

    /**
     * Format date
     */
    static formatDate(isoString) {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

export default AdminCancellationService;
