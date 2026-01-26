import axios from "axios";
import Swal from "sweetalert2";


const API_RESOURCE = "institute";


export const getPublishedContractsService = async ({ filters } = {}) => {
    try {
        // Build params object, only include non-empty values
        const params = {};

        if (filters?.contract_id) params.contract_id = filters.contract_id;
        if (filters?.province) params.province = filters.province;
        if (filters?.position_id) params.position_id = filters.position_id;
        if (filters?.min_rate) params.min_rate = filters.min_rate;
        if (filters?.max_rate) params.max_rate = filters.max_rate;
        if (filters?.start_date) params.start_date = filters.start_date;
        if (filters?.end_date) params.end_date = filters.end_date;
        if (filters?.month) params.month = filters.month;
        if (filters?.status) params.status = filters.status;
        if (filters?.specialty) params.specialty = filters.specialty;
        if (filters?.contract_duration_type) params.contract_duration_type = filters.contract_duration_type;
        if (filters?.institute_specialty_id) params.institute_specialty_id = filters.institute_specialty_id;

        console.log("Institute PublishedContractService - Sending params:", params);

        const response = await axios.get(`/v.1/${API_RESOURCE}/published-contracts`, { params });

        if (response.data?.status === false) {
            console.log("Institute PublishedContractService - Status false, message:", response.data?.message);
            return [];
        }
        return response?.data?.data;
    } catch (error) {
        console.error("Institute PublishedContractService - Error:", error);
        return [];
    }
};


export const applyToContractService = async ({ contractId, payload }) => {
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, apply",
            confirmButtonColor: "#d33",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return false;

        const config = { headers: { "Content-Type": "multipart/form-data" } };
        const response = await axios.post(`/v.1/${API_RESOURCE}/published-contracts/${Number(contractId)}/apply`, payload, config);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.log(response.data?.error);
            return false;
        }

        Swal.fire("Applied!", "You have successfully applied to this contract.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        const apiError = error.response?.data;
        const statusCode = error.response?.status;

        // Handle outstanding cancellation fees (402 Payment Required)
        if (statusCode === 402 && apiError?.outstanding_fees) {
            const feeResult = await Swal.fire({
                icon: 'warning',
                title: 'Outstanding Cancellation Fees',
                html: `
                    <p>${apiError.message}</p>
                    <br>
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: left;">
                        <p><strong>Total Outstanding:</strong> $${apiError.total_amount?.toFixed(2) || '0.00'} CAD</p>
                    </div>
                `,
                confirmButtonText: 'Go to Invoices',
                showCancelButton: true,
                cancelButtonText: 'Close',
                confirmButtonColor: '#f59e0b'
            });

            if (feeResult.isConfirmed) {
                const role = sessionStorage.getItem('role') || 'institute';
                window.location.href = `/${role}/billing/invoices`;
            }
            return false;
        }

        if (apiError?.errors) {
            const firstErrorMessage = Object.values(apiError.errors).flat().join("\n");
            Swal.fire("Error", firstErrorMessage, "error");
        } else if (apiError?.message) {
            Swal.fire("Error", apiError.message, "error");
        } else {
            Swal.fire("Oops!", "Something went wrong.", "error");
        }

        return false;
    }
};
