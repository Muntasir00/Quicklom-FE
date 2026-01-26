import axios from 'axios';
import DOMPurify from 'dompurify';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_URL = `${API_URL}/api/v.1/admin`;

class AdminAgreementService {
    /**
     * Get all agreements with filtering and pagination
     */
    static async getAllAgreements(params = {}) {
        try {
            // Filter out empty string values
            const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            const response = await axios.get(`${BASE_URL}/agreements`, {
                params: cleanParams,
                withCredentials: true
            });

            if (response.data.status) {
                return response.data;
            }
            throw new Error(response.data.message || 'Failed to fetch agreements');
        } catch (error) {
            console.error('Error fetching agreements:', error);
            throw error;
        }
    }

    /**
     * Get agreement details
     */
    static async getAgreementDetails(agreementId) {
        try {
            const response = await axios.get(`${BASE_URL}/agreements/${agreementId}`, {
                withCredentials: true
            });

            if (response.data.status) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch agreement details');
        } catch (error) {
            console.error('Error fetching agreement details:', error);
            throw error;
        }
    }

    /**
     * Preview agreement as HTML
     */
    static async previewAgreement(agreementId) {
        try {
            const response = await axios.get(
                `${BASE_URL}/agreements/${agreementId}/preview`,
                {
                    withCredentials: true
                }
            );

            // Open new window and write sanitized HTML content
            const previewWindow = window.open('', '_blank');
            if (previewWindow) {
                const sanitizedHtml = DOMPurify.sanitize(response.data);
                previewWindow.document.write(sanitizedHtml);
                previewWindow.document.close();
            } else {
                alert('Please allow popups for this site to view agreements');
            }
        } catch (error) {
            console.error('Error previewing agreement:', error);
            alert('Failed to preview agreement');
            throw error;
        }
    }

    /**
     * Download agreement PDF
     */
    static async downloadAgreementPDF(agreementId, force = false) {
        try {
            const response = await axios.get(
                `${BASE_URL}/agreements/${agreementId}/download`,
                {
                    params: { force },
                    responseType: 'blob',
                    withCredentials: true
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error downloading agreement PDF:', error);
            throw error;
        }
    }

    /**
     * Get agreement statistics
     */
    static async getAgreementStatistics() {
        try {
            const response = await axios.get(`${BASE_URL}/agreements/statistics/overview`, {
                withCredentials: true
            });

            if (response.data.status) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch statistics');
        } catch (error) {
            console.error('Error fetching agreement statistics:', error);
            throw error;
        }
    }

    /**
     * Format currency
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
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
}

export default AdminAgreementService;
