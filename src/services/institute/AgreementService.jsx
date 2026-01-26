/**
 * Agreement Service
 * Location: src/services/institute/AgreementService.jsx
 *
 * NEW BILLING MODEL:
 * - Agreement collects agency's fees for their client (ONLY if agency/headhunter)
 * - Simple single fee input (agencyFees)
 * - Professionals don't input fees
 */

import axios from 'axios';
import DOMPurify from 'dompurify';

const BASE_URL = '/v.1/institute';

class AgreementService {
    /**
     * Get all agreements for current user
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
     * Get agreements for a specific contract
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
     * Update agreement fees (agency's fees for their client)
     * ONLY called for agencies/headhunters
     * After submitting fees, status moves to pending_applicant_signature
     */
    static async updateAgreementFees(agreementId, feesData) {
        try {
            // Support both simple number and object format
            const payload = typeof feesData === 'number'
                ? { agency_fees: feesData }
                : {
                    agency_fees: feesData.agencyFees || feesData.agency_fees,
                    fee_type: feesData.feeType || feesData.fee_type || 'percentage',
                    fee_description: feesData.feeDescription || feesData.fee_description || null
                };

            const response = await axios.post(
                `${BASE_URL}/agreements/${agreementId}/update-fees`,
                payload
            );
            return response.data;
        } catch (error) {
            console.error('Error updating agreement fees:', error);
            throw error;
        }
    }

    /**
     * Sign an agreement
     * Handles special case of contract overlap error (409 Conflict)
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

            // Check for contract overlap error
            const apiError = error.response?.data?.detail || error.response?.data;
            const statusCode = error.response?.status;

            if (statusCode === 409 && apiError?.error_code === "CONTRACT_OVERLAP") {
                const conflicts = apiError?.data?.conflicting_contracts || [];
                let conflictDetails = "";

                if (conflicts.length > 0) {
                    conflictDetails = "\n\nConflicting contracts:\n";
                    conflicts.forEach(c => {
                        conflictDetails += `• Contract #${c.id}: ${c.start_date} to ${c.end_date} (${c.status})\n`;
                    });
                }

                // Create a custom error with formatted message
                const customError = new Error(
                    `Cannot complete booking. The applicant has another contract booked during this period.${conflictDetails}`
                );
                customError.isOverlapError = true;
                customError.conflicts = conflicts;
                throw customError;
            }

            throw error;
        }
    }

    /**
     * Choose platform agreement and send to applicant
     * This sends the auto-generated platform agreement to the applicant for signature
     * NEW FLOW: Applicant signs first, publisher signs second
     */
    static async choosePlatformAgreement(agreementId) {
        try {
            const response = await axios.post(
                `${BASE_URL}/agreements/${agreementId}/choose-type`,
                { agreement_type: 'platform' }
            );
            return response.data;
        } catch (error) {
            console.error('Error choosing platform agreement:', error);
            throw error;
        }
    }

    /**
     * Upload a custom agreement PDF to REPLACE existing auto-generated agreement
     * Only contract publishers can upload custom agreements
     * NEW FLOW: Applicant signs first, publisher signs second
     */
    static async uploadCustomAgreement(agreementId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${BASE_URL}/agreements/${agreementId}/upload-custom`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error uploading custom agreement:', error);
            throw error;
        }
    }

    /**
     * Preview custom agreement PDF in new window
     */
    static async previewCustomAgreement(agreementId) {
        try {
            // For custom agreements, the preview endpoint returns the PDF directly
            const response = await axios.get(
                `${BASE_URL}/agreements/${agreementId}/preview`,
                { responseType: 'blob' }
            );

            // Create a blob URL and open in new window
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error previewing custom agreement:', error);
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
     */
    static async previewAgreement(agreementId) {
        try {
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
            'pending_applicant_signature': 'info',
            'pending_publisher_signature': 'warning',
            'pending_client': 'warning',  // Legacy
            'pending_agency': 'info',  // Legacy
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
     * @param {string} status - Agreement status
     * @param {object} agreement - Agreement object (optional, for context-aware text)
     * @param {number} currentUserId - Current user ID (optional, for context-aware text)
     */
    static getStatusText(status, agreement = null, currentUserId = null) {
        // Use status_message from API if available
        if (agreement && agreement.status_message) {
            return agreement.status_message;
        }

        // Default texts
        const texts = {
            'draft': 'Choose Agreement Type',
            'pending_applicant_fees': 'Waiting for Applicant Fees',
            'pending_applicant_signature': 'Waiting for Applicant Signature',
            'pending_publisher_signature': 'Sign Now',
            'pending_client': 'Sign Now',  // Legacy
            'pending_agency': 'Waiting for Applicant',  // Legacy
            'pending_fees': 'Waiting for Fees',  // Legacy
            'partially_signed': 'Partially Signed',
            'fully_signed': 'Fully Signed',
            'rejected': 'Rejected',
            'expired': 'Expired'
        };
        return texts[status] || status;
    }

    /**
     * Check if agreement requires fee input before signing (for agency/headhunter applicants)
     * Returns true if current user needs to enter fees before they can sign
     */
    static requiresFeesInput(agreement, currentUserId) {
        if (!agreement || !currentUserId) return false;

        // Check if current user is the applicant (agency)
        if (agreement.agency_user_id !== currentUserId) return false;

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
        if (fees && fees.requiresInput === true && !agreement.agency_signed) {
            return true;
        }

        return false;
    }

    /**
     * Check if agreement needs any action from current user (fees OR signature)
     */
    static needsMyAction(agreement, currentUserId) {
        return this.isPendingMySignature(agreement, currentUserId) ||
               this.requiresFeesInput(agreement, currentUserId);
    }

    /**
     * Check if agreement is pending current user's signature
     * NEW FLOW: Applicant ALWAYS signs first, publisher signs second
     */
    static isPendingMySignature(agreement, currentUserId) {
        if (!agreement || !currentUserId) return false;

        // Use can_sign from API if available
        if (agreement.can_sign !== undefined) {
            return agreement.can_sign;
        }

        // Fallback logic
        if (agreement.status === 'fully_signed' || agreement.status === 'expired' || agreement.status === 'rejected') {
            return false;
        }

        // Check if current user is the publisher (client) and needs to sign
        // NEW FLOW: Publisher can only sign when status is pending_publisher_signature
        if (agreement.client_user_id === currentUserId && !agreement.client_signed) {
            const canSignStatuses = ['pending_publisher_signature', 'pending_client'];
            return canSignStatuses.includes(agreement.status);
        }

        // Check if current user is the applicant (agency) and needs to sign
        if (agreement.agency_user_id === currentUserId && !agreement.agency_signed) {
            const canSignStatuses = ['pending_applicant_signature', 'pending_agency'];
            return canSignStatuses.includes(agreement.status);
        }

        return false;
    }

    /**
     * Get the role of current user in agreement
     */
    static getMyRole(agreement, currentUserId) {
        if (agreement.client_user_id === currentUserId) return 'client';
        if (agreement.agency_user_id === currentUserId) return 'agency';
        return 'unknown';
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