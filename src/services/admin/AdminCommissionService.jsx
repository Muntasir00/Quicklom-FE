import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_URL = `${API_URL}/api/v.1/admin/commissions`;

class AdminCommissionService {
    // ============================================================================
    // GLOBAL COMMISSION SETTINGS
    // ============================================================================

    /**
     * Get global commission settings
     * @returns {Promise<Object>} Global settings object
     */
    static async getGlobalSettings() {
        try {
            const response = await axios.get(`${BASE_URL}/global`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching global commission settings:', error);
            throw error;
        }
    }

    /**
     * Update global commission settings
     * @param {Object} settings - Settings to update
     * @returns {Promise<Object>} Updated settings
     */
    static async updateGlobalSettings(settings) {
        try {
            const response = await axios.put(`${BASE_URL}/global`, settings);
            return response.data.data;
        } catch (error) {
            console.error('Error updating global commission settings:', error);
            throw error;
        }
    }

    // ============================================================================
    // CUSTOM USER COMMISSIONS
    // ============================================================================

    /**
     * Get all custom commissions with optional filters
     * @param {Object} filters - Optional filters
     * @returns {Promise<Object>} List of custom commissions
     */
    static async getAllCustomCommissions(filters = {}) {
        try {
            const params = {
                user_id: filters.user_id || null,
                is_active: filters.is_active !== undefined ? filters.is_active : null,
                search: filters.search || null,
                limit: filters.limit || 50,
                offset: filters.offset || 0,
            };

            // Remove null values
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

            const response = await axios.get(`${BASE_URL}/custom`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching custom commissions:', error);
            throw error;
        }
    }

    /**
     * Get custom commission by ID
     * @param {number} commissionId - Custom commission ID
     * @returns {Promise<Object>} Custom commission details
     */
    static async getCustomCommission(commissionId) {
        try {
            const response = await axios.get(`${BASE_URL}/custom/${commissionId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching custom commission:', error);
            throw error;
        }
    }

    /**
     * Create custom commission for a user
     * @param {Object} commissionData - Commission data
     * @returns {Promise<Object>} Created commission
     */
    static async createCustomCommission(commissionData) {
        try {
            const response = await axios.post(`${BASE_URL}/custom`, commissionData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating custom commission:', error);
            throw error;
        }
    }

    /**
     * Update custom commission
     * @param {number} commissionId - Commission ID
     * @param {Object} commissionData - Data to update
     * @returns {Promise<Object>} Updated commission
     */
    static async updateCustomCommission(commissionId, commissionData) {
        try {
            const response = await axios.put(`${BASE_URL}/custom/${commissionId}`, commissionData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating custom commission:', error);
            throw error;
        }
    }

    /**
     * Delete custom commission
     * @param {number} commissionId - Commission ID
     * @returns {Promise<Object>} Deletion result
     */
    static async deleteCustomCommission(commissionId) {
        try {
            const response = await axios.delete(`${BASE_URL}/custom/${commissionId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting custom commission:', error);
            throw error;
        }
    }

    // ============================================================================
    // USER-SPECIFIC QUERIES
    // ============================================================================

    /**
     * Get effective commission rates for a specific user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Effective rates with source info
     */
    static async getUserCommissionRates(userId) {
        try {
            const response = await axios.get(`${BASE_URL}/user/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user commission rates:', error);
            throw error;
        }
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    /**
     * Get commission statistics overview
     * @returns {Promise<Object>} Statistics data
     */
    static async getStatistics() {
        try {
            const response = await axios.get(`${BASE_URL}/statistics`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching commission statistics:', error);
            throw error;
        }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Format percentage for display
     * @param {number} value - Percentage value (e.g., 10.0)
     * @returns {string} Formatted percentage
     */
    static formatPercentage(value) {
        if (value === null || value === undefined) return 'N/A';
        return `${Number(value).toFixed(1)}%`;
    }

    /**
     * Format currency for display
     * @param {number} value - Dollar amount
     * @returns {string} Formatted currency
     */
    static formatCurrency(value) {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(value);
    }

    /**
     * Format date for display
     * @param {string} isoString - ISO date string
     * @returns {string} Formatted date
     */
    static formatDate(isoString) {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Check if custom commission is currently active
     * @param {Object} commission - Commission object
     * @returns {boolean}
     */
    static isActive(commission) {
        if (!commission) return false;

        const now = new Date();

        if (commission.valid_from) {
            const validFrom = new Date(commission.valid_from);
            if (now < validFrom) return false;
        }

        if (commission.valid_until) {
            const validUntil = new Date(commission.valid_until);
            if (now > validUntil) return false;
        }

        return true;
    }

    /**
     * Get status badge info for custom commission
     * @param {Object} commission - Commission object
     * @returns {Object} { label, color }
     */
    static getStatusBadge(commission) {
        if (!commission) {
            return { label: 'No Override', color: 'default' };
        }

        const now = new Date();

        if (commission.valid_from) {
            const validFrom = new Date(commission.valid_from);
            if (now < validFrom) {
                return { label: 'Scheduled', color: 'info' };
            }
        }

        if (commission.valid_until) {
            const validUntil = new Date(commission.valid_until);
            if (now > validUntil) {
                return { label: 'Expired', color: 'default' };
            }
        }

        return { label: 'Active', color: 'success' };
    }

    /**
     * Get source badge for rates display
     * @param {string} source - Rate source ('custom', 'global', 'default')
     * @returns {Object} { label, color }
     */
    static getSourceBadge(source) {
        const badges = {
            custom: { label: 'Custom Override', color: 'primary' },
            global: { label: 'Global Settings', color: 'secondary' },
            default: { label: 'System Default', color: 'default' }
        };
        return badges[source] || { label: source, color: 'default' };
    }

    /**
     * Get default permanent rates
     * @returns {Object} Default rates by contract type
     */
    static getDefaultPermanentRates() {
        return {
            'Dental – Permanent Staffing Contract': 5000.00,
            'Pharmacy – Permanent Staffing Contract': 4000.00,
            'General Practice – Permanent Contract': 3000.00,
            'Specialty Dentistry – Contract': 2000.00,
            'Nursing – Permanent Contract': 2000.00
        };
    }

    /**
     * Get default applicant permanent rates
     * @returns {Object} Default rates by contract type
     */
    static getDefaultApplicantPermanentRates() {
        return {
            'Dental – Permanent Staffing Contract': 500.00,
            'Pharmacy – Permanent Staffing Contract': 400.00,
            'General Practice – Permanent Contract': 300.00,
            'Specialty Dentistry – Contract': 200.00,
            'Nursing – Permanent Contract': 200.00
        };
    }

    /**
     * Prepare commission data for API submission
     * @param {Object} formData - Form data from UI
     * @returns {Object} Cleaned data for API
     */
    static prepareSubmissionData(formData) {
        const data = {};

        // Only include fields that have values
        if (formData.user_id) data.user_id = Number(formData.user_id);
        if (formData.temporary_commission_percentage !== '' && formData.temporary_commission_percentage !== null) {
            data.temporary_commission_percentage = Number(formData.temporary_commission_percentage);
        }
        if (formData.service_fee_override !== '' && formData.service_fee_override !== null) {
            data.service_fee_override = Number(formData.service_fee_override);
        }
        if (formData.monthly_subscription_override !== '' && formData.monthly_subscription_override !== null) {
            data.monthly_subscription_override = Number(formData.monthly_subscription_override);
        }
        if (formData.reason) data.reason = formData.reason;
        if (formData.valid_from) data.valid_from = formData.valid_from;
        if (formData.valid_until) data.valid_until = formData.valid_until;

        return data;
    }
}

export default AdminCommissionService;
