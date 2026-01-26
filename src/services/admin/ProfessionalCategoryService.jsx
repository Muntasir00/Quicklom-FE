import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const getProfessionalCategoriesService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/professional-categories`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getProfessionalCategoryWithRolesService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/professional-categories/${id}/roles`);
        if (response.data?.status === false) return [];
        console.log(response?.data?.data)
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const createProfessionalCategoryService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/professional-categories/create`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }

        Swal.fire("Success!", "Category created successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};


export const updateProfessionalCategoryService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/professional-categories/${id}/update`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }

        Swal.fire("Success!", "Category updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};


export const deleteProfessionalCategoryService = async (id) => {
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

        const response = await axios.delete(`/v.1/admin/professional-categories/${Number(id.categoryId)}/delete`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }

        Swal.fire("Deleted!", "Category has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};


export const getProfessionalCategoryByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/professional-categories/${id}`);

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
