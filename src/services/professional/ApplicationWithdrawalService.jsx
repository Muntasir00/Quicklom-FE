import axios from "axios";
import Swal from "sweetalert2";

const API_RESOURCE = "professional";

/**
 * Check if a withdrawal fee is required for an application
 * @param {number} applicationId - Application ID to check
 * @returns {Promise<object>} - Fee info with fee_required, amount, etc.
 */
export const checkWithdrawalFee = async (applicationId) => {
    try {
        const response = await axios.get(
            `/v.1/${API_RESOURCE}/applications/${applicationId}/withdrawal-fee`
        );
        return response.data?.data || { fee_required: false };
    } catch (error) {
        console.error('Error checking withdrawal fee:', error);
        return { fee_required: false };
    }
};

/**
 * Create a payment session for withdrawal fee
 * @param {number} applicationId - Application ID
 * @param {object} options - success_url and cancel_url (optional)
 * @returns {Promise<object>} - Payment session with url to redirect
 */
export const createWithdrawalFeePayment = async (applicationId, options = {}) => {
    try {
        const response = await axios.post(
            `/v.1/${API_RESOURCE}/applications/${applicationId}/withdrawal-fee/pay`,
            options
        );
        return response.data?.data;
    } catch (error) {
        console.error('Error creating withdrawal fee payment:', error);
        throw error;
    }
};

/**
 * Complete application withdrawal after fee payment
 * @param {number} applicationId - Application ID
 * @param {string} sessionId - Stripe session ID
 * @param {string} reason - Withdrawal reason
 * @returns {Promise<object>} - Response with status
 */
export const completeWithdrawalAfterPayment = async (applicationId, sessionId, reason = '') => {
    try {
        const response = await axios.post(
            `/v.1/${API_RESOURCE}/applications/${applicationId}/withdraw-with-fee`,
            { session_id: sessionId, reason }
        );
        return response.data;
    } catch (error) {
        console.error('Error completing withdrawal after payment:', error);
        throw error;
    }
};

/**
 * Withdraw an application (for professionals, agencies, headhunters)
 * Handles withdrawal fee flow if required
 * @param {number} applicationId - Application ID to withdraw
 * @param {string} reason - Optional reason for withdrawal
 * @returns {Promise<object>} - Response with status, warning, and counts
 */
export const withdrawApplicationService = async (applicationId, reason = '') => {
    try {
        const formData = new FormData();
        if (reason) {
            formData.append('reason', reason);
        }

        const response = await axios.put(
            `/v.1/${API_RESOURCE}/applications/${applicationId}/withdraw`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (response.data?.status) {
            // Check if there's a pending cancellation fee - show payment popup
            if (response.data.pending_fee) {
                const pendingFee = response.data.pending_fee;

                const feeResult = await Swal.fire({
                    icon: 'warning',
                    title: 'Withdrawal Successful - Fee Required',
                    html: `
                        <p>Your application has been withdrawn successfully.</p>
                        <br>
                        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; text-align: left;">
                            <p><strong>Cancellation Fee:</strong> $${pendingFee.amount?.toFixed(2) || '0.00'} CAD</p>
                            <p style="font-size: 0.9em; color: #856404;">This fee was applied because you withdrew within 48 hours of the contract start date.</p>
                        </div>
                        <br>
                        <p><strong>Important:</strong> You must pay this fee before applying to new contracts.</p>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Pay Now',
                    cancelButtonText: 'Pay Later',
                    confirmButtonColor: '#f59e0b'
                });

                if (feeResult.isConfirmed && pendingFee.payment_url) {
                    window.location.href = pendingFee.payment_url;
                }

                return response.data;
            }

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Application Withdrawn',
                text: response.data.message || 'Application withdrawn successfully',
                timer: 3000
            });

            // Show warning if present
            if (response.data.warning) {
                setTimeout(() => {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Withdrawal Warning',
                        html: response.data.warning.replace(/\n/g, '<br>'),
                        confirmButtonText: 'I Understand'
                    });
                }, 500);
            }

            return response.data;
        }

        Swal.fire("Oops!", "Failed to withdraw application", "error");
        return null;
    } catch (error) {
        console.error('Error withdrawing application:', error);
        const statusCode = error.response?.status;
        const errorData = error.response?.data;

        // Handle withdrawal fee required (402 Payment Required)
        if (statusCode === 402 && errorData?.fee_required) {
            const feeInfo = errorData.fee_info;

            const result = await Swal.fire({
                icon: 'warning',
                title: 'Withdrawal Fee Required',
                html: `
                    <p>A withdrawal fee is required because you are withdrawing from a booked contract
                    within ${feeInfo.hours_threshold || 48} hours of the start date.</p>
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
                confirmButtonText: 'Pay & Withdraw',
                cancelButtonText: 'Go Back',
                confirmButtonColor: '#d33'
            });

            if (result.isConfirmed) {
                // Create payment session and redirect
                try {
                    const paymentResult = await createWithdrawalFeePayment(applicationId);
                    if (paymentResult?.url) {
                        window.location.href = paymentResult.url;
                    } else {
                        Swal.fire("Error", "Failed to create payment session", "error");
                    }
                } catch (paymentError) {
                    Swal.fire("Error", "Failed to initiate payment", "error");
                }
            }

            return { fee_required: true, withdrawn: false };
        }

        // Check for ban/warning message in error response
        if (errorData?.warning) {
            Swal.fire({
                icon: 'error',
                title: 'Withdrawal Limit Reached',
                html: errorData.warning.replace(/\n/g, '<br>'),
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire("Oops!", errorData?.message || 'Failed to withdraw application', "error");
        }

        throw error;
    }
};

/**
 * Withdraw application with confirmation dialog
 * @param {number} applicationId - Application ID to withdraw
 * @returns {Promise<boolean>} - True if withdrawn successfully
 */
export const withdrawApplicationWithConfirmation = async (applicationId) => {
    // First check if fee is required
    const feeInfo = await checkWithdrawalFee(applicationId);

    let confirmMessage = 'This action will withdraw your application from this contract.';
    if (feeInfo.fee_required) {
        confirmMessage = `
            <p>This action will withdraw your application from this booked contract.</p>
            <br>
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px; text-align: left;">
                <p><strong>Note:</strong> A withdrawal fee of <strong>$${feeInfo.amount?.toFixed(2)} CAD</strong>
                will be charged because you are withdrawing within ${feeInfo.hours_threshold || 48} hours
                of the contract start date.</p>
            </div>
        `;
    }

    const result = await Swal.fire({
        icon: 'warning',
        title: 'Withdraw Application?',
        html: confirmMessage,
        input: 'textarea',
        inputLabel: 'Reason for withdrawal (optional)',
        inputPlaceholder: 'Enter reason...',
        showCancelButton: true,
        confirmButtonText: feeInfo.fee_required ? 'Proceed to Payment' : 'Yes, Withdraw',
        cancelButtonText: 'Go Back',
        confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return false;

    const reason = result.value || '';

    try {
        const response = await withdrawApplicationService(applicationId, reason);
        return response?.status === true;
    } catch (error) {
        return false;
    }
};
