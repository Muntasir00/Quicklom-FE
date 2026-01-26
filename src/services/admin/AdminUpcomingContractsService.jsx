import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_URL = `${API_URL}/api/v.1/admin`;

class AdminUpcomingContractsService {
    /**
     * Get all upcoming contracts with filtering and pagination
     */
    static async getUpcomingContracts(params = {}) {
        try {
            // Filter out empty string values
            const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            const response = await axios.get(`${BASE_URL}/upcoming-contracts`, {
                params: cleanParams,
                withCredentials: true
            });

            if (response.data.status) {
                return response.data;
            }
            throw new Error(response.data.message || 'Failed to fetch upcoming contracts');
        } catch (error) {
            console.error('Error fetching upcoming contracts:', error);
            throw error;
        }
    }

    /**
     * Get upcoming contracts statistics
     */
    static async getStatistics() {
        try {
            const response = await axios.get(`${BASE_URL}/upcoming-contracts/statistics/overview`, {
                withCredentials: true
            });

            if (response.data.status) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch statistics');
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    }

    /**
     * Get applicants for a specific contract
     */
    static async getContractApplicants(contractId) {
        try {
            const response = await axios.get(`${BASE_URL}/upcoming-contracts/${contractId}/applicants`, {
                withCredentials: true
            });

            if (response.data.status) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch applicants');
        } catch (error) {
            console.error('Error fetching contract applicants:', error);
            throw error;
        }
    }

    /**
     * Get agreement for a specific contract
     */
    static async getContractAgreement(contractId) {
        try {
            const response = await axios.get(`${BASE_URL}/upcoming-contracts/${contractId}/agreement`, {
                withCredentials: true
            });

            if (response.data.status) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch agreement');
        } catch (error) {
            console.error('Error fetching contract agreement:', error);
            throw error;
        }
    }

    /**
     * Download agreement PDF
     */
    static async downloadAgreementPDF(agreementId) {
        try {
            const response = await axios.get(`${BASE_URL}/agreements/${agreementId}/download`, {
                withCredentials: true,
                responseType: 'blob'
            });

            return response.data;
        } catch (error) {
            console.error('Error downloading agreement PDF:', error);
            throw error;
        }
    }

    /**
     * Get status badge class
     */
    static getStatusBadgeClass(status) {
        const statusMap = {
            'booked': 'badge badge-success',
            'pending_signature': 'badge badge-warning',
            'open': 'badge badge-info',
            'pending': 'badge badge-secondary'
        };
        return statusMap[status] || 'badge badge-secondary';
    }

    /**
     * Get status display text
     */
    static getStatusDisplay(status) {
        const statusMap = {
            'booked': 'Booked',
            'pending_signature': 'Pending Signature',
            'open': 'Open',
            'pending': 'Pending'
        };
        return statusMap[status] || status;
    }

    /**
     * Format date
     */
    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format datetime
     */
    static formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get urgency badge
     */
    static getUrgencyBadge(daysUntilStart) {
        if (daysUntilStart === null || daysUntilStart === undefined) return null;

        if (daysUntilStart < 0) {
            return { text: 'Started', class: 'badge badge-dark' };
        } else if (daysUntilStart === 0) {
            return { text: 'Today!', class: 'badge badge-danger' };
        } else if (daysUntilStart <= 3) {
            return { text: `${daysUntilStart}d - Urgent`, class: 'badge badge-danger' };
        } else if (daysUntilStart <= 7) {
            return { text: `${daysUntilStart}d - Soon`, class: 'badge badge-warning' };
        } else if (daysUntilStart <= 14) {
            return { text: `${daysUntilStart} days`, class: 'badge badge-info' };
        } else {
            return { text: `${daysUntilStart} days`, class: 'badge badge-secondary' };
        }
    }
}

export default AdminUpcomingContractsService;
