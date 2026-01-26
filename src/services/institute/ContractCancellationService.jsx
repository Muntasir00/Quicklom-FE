import axios from "axios";
import Swal from "sweetalert2";

const API_RESOURCE = "institute";

/**
 * Check if a cancellation fee is required for a contract
 * @param {number} contractId - Contract ID to check
 * @returns {Promise<object>} - Fee info with fee_required, amount, etc.
 */
export const checkCancellationFee = async (contractId) => {
    try {
        const response = await axios.get(
            `/v.1/${API_RESOURCE}/contracts/${contractId}/cancellation-fee`
        );
        return response.data?.data || { fee_required: false };
    } catch (error) {
        console.error('Error checking cancellation fee:', error);
        return { fee_required: false };
    }
};

/**
 * Create a payment session for cancellation fee
 * @param {number} contractId - Contract ID
 * @param {object} options - success_url and cancel_url (optional)
 * @returns {Promise<object>} - Payment session with url to redirect
 */
export const createCancellationFeePayment = async (contractId, options = {}) => {
    try {
        const response = await axios.post(
            `/v.1/${API_RESOURCE}/contracts/${contractId}/cancellation-fee/pay`,
            options
        );
        return response.data?.data;
    } catch (error) {
        console.error('Error creating cancellation fee payment:', error);
        throw error;
    }
};

/**
 * Complete contract cancellation after fee payment
 * @param {number} contractId - Contract ID
 * @param {string} sessionId - Stripe session ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<object>} - Response with status
 */
export const completeCancellationAfterPayment = async (contractId, sessionId, reason = '') => {
    try {
        const response = await axios.post(
            `/v.1/${API_RESOURCE}/contracts/${contractId}/cancel-with-fee`,
            { session_id: sessionId, reason }
        );
        return response.data;
    } catch (error) {
        console.error('Error completing cancellation after payment:', error);
        throw error;
    }
};

/**
 * Cancel a contract (for institutes, agencies, headhunters)
 * Handles cancellation fee flow if required
 * @param {number} contractId - Contract ID to cancel
 * @param {string} reason - Optional reason for cancellation
 * @returns {Promise<object>} - Response with status, warning, and counts
 */
export const cancelContractService = async (contractId, reason = '') => {
    try {
        const formData = new FormData();
        if (reason) {
            formData.append('reason', reason);
        }

        const response = await axios.put(
            `/v.1/${API_RESOURCE}/contracts/${contractId}/cancel`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (response.data?.status) {
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Contract Cancelled',
                text: response.data.message || 'Contract cancelled successfully',
                timer: 3000
            });

            // Show warning if present
            if (response.data.warning) {
                setTimeout(() => {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cancellation Warning',
                        html: response.data.warning.replace(/\n/g, '<br>'),
                        confirmButtonText: 'I Understand'
                    });
                }, 500);
            }

            return response.data;
        }

        Swal.fire("Oops!", "Failed to cancel contract", "error");
        return null;
    } catch (error) {
        console.error('Error cancelling contract:', error);
        const statusCode = error.response?.status;
        const errorData = error.response?.data;

        // Handle cancellation fee required (402 Payment Required)
        if (statusCode === 402 && errorData?.fee_required) {
            const feeInfo = errorData.fee_info;

            const result = await Swal.fire({
                icon: 'warning',
                title: 'Cancellation Fee Required',
                html: `
                    <p>A cancellation fee is required because you are cancelling within
                    ${feeInfo.hours_threshold || 48} hours of the contract start date.</p>
                    <br>
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; text-align: left;">
                        <p><strong>Fee Amount:</strong> $${feeInfo.amount?.toFixed(2) || '0.00'} CAD</p>
                        <p><strong>Contract Value:</strong> $${feeInfo.contract_value?.toFixed(2) || '0.00'} CAD</p>
                        <p><strong>Fee Rate:</strong> ${feeInfo.percentage || 25}%</p>
                    </div>
                    <br>
                    <p>Would you like to proceed with payment?</p>
                `,
                showCancelButton: true,
                confirmButtonText: 'Pay & Cancel',
                cancelButtonText: 'Go Back',
                confirmButtonColor: '#d33'
            });

            if (result.isConfirmed) {
                // Create payment session and redirect
                try {
                    const paymentResult = await createCancellationFeePayment(contractId);
                    if (paymentResult?.url) {
                        window.location.href = paymentResult.url;
                    } else {
                        Swal.fire("Error", "Failed to create payment session", "error");
                    }
                } catch (paymentError) {
                    Swal.fire("Error", "Failed to initiate payment", "error");
                }
            }

            return { fee_required: true, cancelled: false };
        }

        // Check for ban/warning message in error response
        if (errorData?.warning) {
            Swal.fire({
                icon: 'error',
                title: 'Cancellation Limit Reached',
                html: errorData.warning.replace(/\n/g, '<br>'),
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire("Oops!", errorData?.message || 'Failed to cancel contract', "error");
        }

        throw error;
    }
};

/**
 * Cancel contract with confirmation dialog
 * @param {number} contractId - Contract ID to cancel
 * @returns {Promise<boolean>} - True if cancelled successfully
 */
export const cancelContractWithConfirmation = async (contractId) => {
    // First check if fee is required
    const feeInfo = await checkCancellationFee(contractId);

    let confirmMessage = 'This action will cancel the contract and notify all applicants.';
    if (feeInfo.fee_required) {
        confirmMessage = `
            <p>This action will cancel the contract.</p>
            <br>
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px; text-align: left;">
                <p><strong>Note:</strong> A cancellation fee of <strong>$${feeInfo.amount?.toFixed(2)} CAD</strong>
                will be charged because you are cancelling within ${feeInfo.hours_threshold || 48} hours
                of the contract start date.</p>
            </div>
        `;
    }

    const result = await Swal.fire({
        icon: 'warning',
        title: 'Cancel Contract?',
        html: confirmMessage,
        input: 'textarea',
        inputLabel: 'Reason for cancellation (optional)',
        inputPlaceholder: 'Enter reason...',
        showCancelButton: true,
        confirmButtonText: feeInfo.fee_required ? 'Proceed to Payment' : 'Yes, Cancel',
        cancelButtonText: 'Go Back',
        confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return false;

    const reason = result.value || '';

    try {
        const response = await cancelContractService(contractId, reason);
        return response?.status === true;
    } catch (error) {
        return false;
    }
};
