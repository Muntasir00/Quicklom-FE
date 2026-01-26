import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const getContractsService = async ({ filters } = {}) => {
    try {
        const response = await axios.get(`/v.1/admin/contracts`, {
            params: {
                id: filters?.id || "",
                publisher_name: filters?.publisher_name || "",
                publisher_email: filters?.publisher_email || "",
                start_date: filters?.start_date || "",
                status: filters?.status || "",
                position_id: filters?.position_id || "",
                affected_entity_id: filters?.affected_entity_id || "",
                industry: filters?.industry || "",
                urgency: filters?.urgency || "",
                professional_category_id: filters?.professional_category_id || "",
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
        const response = await axios.get(`/v.1/admin/contracts/${id}`);
        if (response.data?.status === false) return null;
        const data = response?.data?.data?.data;
        console.log("admin contract data: ", data);
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
        const response = await axios.post(`/v.1/admin/contracts/create`, payload, config);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }
        Swal.fire("Success!", "Contract created successfully.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};

export const updateContractService = async (id, payload) => {
    try {
        const config = { headers: { "Content-Type": "multipart/form-data" } };
        const response = await axios.put(`/v.1/admin/contracts/${Number(id)}/update`, payload, config);

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

        const response = await axios.delete(`/v.1/admin/contracts/${Number(id?.contractId)}/delete`);
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
        const response = await axios.get(`/v.1/admin/contracts/${Number(id)}/type`);
        if (response.data?.status === false) return null;
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};


export const updateContractStatusService = async ({ contractId, payload }) => {
    try {
        if (!contractId) return Swal.fire("Error!", "Invalid contract ID.", "error");
        const response = await axios.put(`/v.1/admin/contracts/${contractId}/update/status`, payload);
        if (response.data.status === false) return Swal.fire("Oops!", "Something went wrong.", "error");
        Swal.fire("Success!", "Contract status updated successfully!", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};

export const getContractApplicantsService = async (contractId) => {
    try {
        const response = await axios.get(`/v.1/admin/contracts/${contractId}/applicants`);
        if (response.data?.status === false) return null;
        return response.data.data;
    } catch (error) {
        console.error("Error fetching applicants:", error);
        return null;
    }
};

export const getContractIndustryStatsService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/contracts/statistics/industries`);
        if (response.data?.status === false) return null;
        return response.data.data;
    } catch (error) {
        console.error("Error fetching industry stats:", error);
        return null;
    }
};

export const getProfessionalCategoriesService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/professional-categories`);
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error("Error fetching professional categories:", error);
        return [];
    }
};
