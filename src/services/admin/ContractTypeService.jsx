import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const getContractTypesService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/contract-types`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getContractTypeByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/contract-types/${id}`);
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

export const createContractTypeService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/contract-types/create`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }
        Swal.fire("Success!", "Contract type created successfully.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};

export const updateContractTypeService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/contract-types/${id}/update`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }
        Swal.fire("Success!", "Contract type updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const deleteContractTypeService = async (id) => {
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

        const response = await axios.delete(`/v.1/admin/contract-types/${Number(id?.contractTypeId)}/delete`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }
        Swal.fire("Deleted!", "Contract type has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};
