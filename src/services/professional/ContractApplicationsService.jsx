import axios from "axios";
import Swal from "sweetalert2";

const API_RESOURCE = "professional";

export const getContractApplicationsService = async ({ filters } = {}) => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/contract-applications`, {
            params: {
                contract_id: filters?.contract_id || "",
                position_id: filters?.position_id || "",
                start_date: filters?.start_date || "",
                end_date: filters?.end_date || "",
                status: filters?.status || "",
                institute_specialty_id: filters?.institute_specialty_id || "",
                affected_entity_id: filters?.affected_entity_id || "",
            }
        });

        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const updateContractApplicationsStatus = async ({ application, skipConfirmation = false, mayHaveFee = false }) => {
    try {
        if (!skipConfirmation) {
            // Show different message if cancellation fee may apply
            const confirmMessage = mayHaveFee
                ? "This will permanently withdraw your application. Since you are withdrawing from a booked contract within 48 hours of the start date, a cancellation fee will apply."
                : "This will permanently withdraw your application.";

            const result = await Swal.fire({
                title: mayHaveFee ? "Cancellation Fee Warning" : "Warning",
                html: mayHaveFee
                    ? `<p>${confirmMessage}</p><br><div style="background: #fff3cd; padding: 10px; border-radius: 5px;"><strong>Note:</strong> You will be prompted to pay the fee after withdrawal.</div>`
                    : confirmMessage,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: mayHaveFee ? "Yes, Withdraw (Fee Applies)" : "Yes, Withdraw it!",
                confirmButtonColor: "#d33",
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) return false;
        }

        const response = await axios.put(`/v.1/${API_RESOURCE}/contract-applications/${application?.id}/update/status`,{},
            {
                params: {
                    status: application?.status || "",
                },
            }
        );

        if (response.data.status === false) return false;

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

            return true; // Withdrawal was successful
        }

        Swal.fire("Success!", response.data.message || "Application withdrawn successfully!", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        const errorData = error.response?.data;
        Swal.fire("Oops!", errorData?.message || "Something went wrong.", "error");
        return false;
    }
};