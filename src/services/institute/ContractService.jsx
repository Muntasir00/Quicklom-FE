import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const getContractsService = async ({ filters } = {}) => {
    try {
        const response = await axios.get(`/v.1/institute/contracts`, {
            params: {
                contract_id: filters?.contract_id || "",
                province: filters?.province || "",
                position_id: filters?.position_id || "",
                min_rate: filters?.min_rate || "",
                max_rate: filters?.max_rate || "",
                start_date: filters?.start_date || "",
                end_date: filters?.end_date || "",
                month: filters?.month || "",
                status: filters?.status || "",
                duration: filters?.duration || "",
                institute_specialty_id: filters?.institute_specialty_id || "",
                affected_entity_id: filters?.affected_entity_id || "",
                specialty: filters?.specialty || "",
                contract_duration_type: filters?.contract_duration_type || "",
                filter: filters?.filter || "",
            }
        });
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};


export const getContractByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/institute/contracts/${id}`);
        if (response.data?.status === false) return null;
        const data = response?.data?.data;
        console.log("contract data: ", data);
        return data ?? null;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const createContractService = async (payload) => {
    try {
        const config = { headers: { "Content-Type": "multipart/form-data" } };
        const response = await axios.post(`/v.1/institute/contracts/create`, payload, config);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }
        Swal.fire("Success!", "Contract created successfully.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        const statusCode = error.response?.status;
        const errorData = error.response?.data;

        // Handle outstanding cancellation fees (402 Payment Required)
        if (statusCode === 402 && errorData?.outstanding_fees) {
            const feeResult = await Swal.fire({
                icon: 'warning',
                title: 'Outstanding Cancellation Fees',
                html: `
                    <p>${errorData.message}</p>
                    <br>
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: left;">
                        <p><strong>Total Outstanding:</strong> $${errorData.total_amount?.toFixed(2) || '0.00'} CAD</p>
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

        Swal.fire("Oops!", errorData?.message || "Something went wrong.", "error");
        return false;
    }
};

export const updateContractService = async (id, payload) => {
    try {
        const config = { headers: { "Content-Type": "multipart/form-data" } };
        const response = await axios.put(`/v.1/institute/contracts/${Number(id)}/update`, payload, config);
        
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }

        Swal.fire("Success!", "Contract updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const deleteContractService = async (id) => {
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "#d33",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return false;

        const response = await axios.delete(`/v.1/institute/contracts/${Number(id?.contractId)}/delete`);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }
        Swal.fire("Deleted!", "Contract has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};

export const getContractTypeName = async (id) => {
    try {
        console.log(id);
        const response = await axios.get(`/v.1/institute/contracts/${Number(id)}/type`);
        if (response.data?.status === false) return null;
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};