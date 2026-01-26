import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const getInsuranceCompaniesService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/insurance-companies`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getInsuranceCompanyByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/insurance-companies/${id}`);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const createInsuranceCompanyService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/insurance-companies/create`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }
        Swal.fire("Success!", "Insurance company created successfully.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};

export const updateInsuranceCompanyService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/insurance-companies/${id}/update`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }
        Swal.fire("Success!", "Insurance company updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const deleteInsuranceCompanyService = async (id) => {
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

        const response = await axios.delete(`/v.1/admin/insurance-companies/${Number(id)}/delete`);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }
        Swal.fire("Deleted!", "Insurance company has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};
