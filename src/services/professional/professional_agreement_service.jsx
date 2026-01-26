/**
 * Professional Agreement Service
 * Location: src/services/professional/AgreementService.jsx
 *
 * Handles agreement operations for professional users
 * Professionals are always the applicant (agency side) in agreements
 */

import axios from 'axios';
import DOMPurify from 'dompurify';

const BASE_URL = '/v.1/professional';

class AgreementService {
    /**
     * Get all agreements for current professional
     */
    static async getMyAgreements(status = null, limit = 50) {
        try {
            const params = { limit };
            if (status) params.status = status;

            const response = await axios.get(`${BASE_URL}/agreements`, { params });
            return response.data;
        } catch (error) {
            console.error('Error getting agreements:', error);
            throw error;
        }
    }

    /**
     * Get detailed information about a specific agreement
     */
    static async getAgreementDetails(agreementId) {
        try {
            const response = await axios.get(`${BASE_URL}/agreements/${agreementId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting agreement details:', error);
            throw error;
        }
    }

    /**
     * Get agreement for a specific contract
     */
    static async getAgreementByContract(contractId) {
        try {
            const response = await axios.get(`${BASE_URL}/agreements/contract/${contractId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting agreement by contract:', error);
            throw error;
        }
    }

    /**
     * Update agreement fees (for agency/headhunter applicants)
     * Must be called before signing when status is pending_applicant_fees
     */
    static async updateAgreementFees(agreementId, feesData) {
        try {
            const response = await axios.post(
                `${BASE_URL}/agreements/${agreementId}/update-fees`,
                {
                    agency_fees: feesData.agencyFees,
                    fee_type: feesData.feeType || 'percentage',
                    fee_description: feesData.feeDescription || null
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating agreement fees:', error);
            throw error;
        }
    }

    /**
     * Sign an agreement as a professional
     * If agency/headhunter, fees must be submitted first
     */
    static async signAgreement(agreementId, signatureData) {
        try {
            const response = await axios.post(
                `${BASE_URL}/agreements/${agreementId}/sign`,
                signatureData
            );
            return response.data;
        } catch (error) {
            console.error('Error signing agreement:', error);
            throw error;
        }
    }

    /**
     * Get agreement PDF URL
     */
    static async getAgreementPDF(agreementId) {
        try {
            const response = await axios.get(`${BASE_URL}/agreements/${agreementId}/pdf`);
            return response.data;
        } catch (error) {
            console.error('Error getting agreement PDF:', error);
            throw error;
        }
    }

    /**
     * Download agreement PDF (fully signed)
     */
    static async downloadAgreementPDF(agreementId, agreementNumber) {
        try {
            const response = await axios.get(
                `${BASE_URL}/agreements/${agreementId}/download?force=true`,
                {
                    responseType: 'blob' // Important for file download
                }
            );

            // Check if we actually got a PDF
            const contentType = response.headers['content-type'];
            console.log('Download response content-type:', contentType);
            console.log('Download response size:', response.data.size);

            if (contentType && !contentType.includes('application/pdf')) {
                // If not a PDF, it might be an error - try to read it
                const text = await response.data.text();
                console.error('Expected PDF but got:', contentType);
                console.error('Response content:', text.substring(0, 500));
                throw new Error('Server did not return a PDF file. Please check the backend logs.');
            }

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${agreementNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error downloading agreement PDF:', error);
            throw error;
        }
    }

    /**
     * Preview agreement as HTML in new window
     * For auto-generated agreements, shows HTML
     * For custom agreements, shows PDF
     */
    static async previewAgreement(agreementId, isCustom = false) {
        try {
            if (isCustom) {
                // For custom agreements, the preview endpoint returns a PDF
                const response = await axios.get(
                    `${BASE_URL}/agreements/${agreementId}/preview`,
                    { responseType: 'blob' }
                );

                // Create a blob URL and open in new window
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            } else {
                // Fetch the agreement HTML from the backend
                const response = await axios.get(`${BASE_URL}/agreements/${agreementId}/preview`);

                // Create a new window and write sanitized HTML content
                const previewWindow = window.open('', '_blank', 'width=900,height=800,scrollbars=yes');

                if (previewWindow) {
                    previewWindow.document.open();
                    const sanitizedHtml = DOMPurify.sanitize(response.data);
                    previewWindow.document.write(sanitizedHtml);
                    previewWindow.document.close();
                } else {
                    alert('Please allow pop-ups to preview the agreement');
                }
            }
        } catch (error) {
            console.error('Error previewing agreement:', error);
            alert('Failed to preview agreement. Please try again.');
        }
    }

    /**
     * Get count of pending agreements
     */
    static async getPendingCount() {
        try {
            const response = await axios.get(`${BASE_URL}/agreements/pending/count`);
            return response.data.count || 0;
        } catch (error) {
            console.error('Error getting pending count:', error);
            return 0;
        }
    }

    /**
     * Format date for display
     */
    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format date and time for display
     */
    static formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get status badge color
     */
    static getStatusColor(status) {
        const colors = {
            'draft': 'secondary',
            'pending_applicant_fees': 'warning',
            'pending_applicant_signature': 'warning',
            'pending_publisher_signature': 'info',
            'pending_client': 'info',  // Legacy
            'pending_agency': 'warning',  // Legacy
            'pending_fees': 'warning',  // Legacy
            'partially_signed': 'info',
            'fully_signed': 'success',
            'rejected': 'danger',
            'expired': 'dark'
        };
        return colors[status] || 'secondary';
    }

    /**
     * Get user-friendly status text
     */
    static getStatusText(status) {
        const texts = {
            'draft': 'Draft',
            'pending_applicant_fees': 'Enter Your Fees',
            'pending_applicant_signature': 'Sign Now',
            'pending_publisher_signature': 'Waiting for Publisher',
            'pending_client': 'Waiting for Publisher',  // Legacy
            'pending_agency': 'Sign Now',  // Legacy
            'pending_fees': 'Enter Your Fees',  // Legacy
            'partially_signed': 'Partially Signed',
            'fully_signed': 'Fully Signed',
            'rejected': 'Rejected',
            'expired': 'Expired'
        };
        return texts[status] || status;
    }

    /**
     * Check if agreement requires fee input before signing
     * Returns true if user needs to enter fees before they can sign
     */
    static requiresFeesInput(agreement) {
        // Check pending_action from API
        if (agreement.pending_action === 'enter_fees') {
            return true;
        }

        // Check status
        const feesRequiredStatuses = [
            'pending_applicant_fees',
            'pending_fees'  // Legacy
        ];

        if (feesRequiredStatuses.includes(agreement.status)) {
            return true;
        }

        // Check agreement_data.fees.requiresInput
        const fees = agreement.agreement_data?.fees;
        if (fees && fees.requiresInput === true) {
            return true;
        }

        return false;
    }

    /**
     * Check if agreement is pending professional's signature
     * NEW FLOW: Applicant ALWAYS signs first (for both platform and custom agreements)
     * Uses can_sign field from API response
     */
    static isPendingMySignature(agreement) {
        // Use can_sign field from API if available
        if (agreement.can_sign !== undefined) {
            return agreement.can_sign;
        }

        // Fallback logic if can_sign not present
        if (agreement.status === 'fully_signed') return false;
        if (agreement.agency_signed) return false;

        // NEW FLOW: Applicant signs first for ALL agreements (platform and custom)
        // Check for statuses that allow signing
        const canSignStatuses = [
            'pending_applicant_signature',
            'pending_agency'  // Legacy status
        ];

        return canSignStatuses.includes(agreement.status);
    }

    /**
     * Format currency amount
     */
    static formatCurrency(amount, currency = 'CAD') {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    }
}

export default AgreementService;