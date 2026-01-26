import axios from "axios";
import Swal from "sweetalert2";

export const getInstituteCategoriesService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/institute-categories`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getInstituteCategoryByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/institute-categories/${id}`);

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


export const createInstituteCategoryService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/institute-categories/create`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }

        Swal.fire("Success!", "Institute category created successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const updateInstituteCategoryService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/institute-categories/${id}/update`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }

        Swal.fire("Success!", "Institute category updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};


export const deleteInstituteCategoryService = async (id) => {
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

        const response = await axios.delete(`/v.1/admin/institute-categories/${Number(id.categoryId)}/delete`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }

        Swal.fire("Deleted!", "Institute category has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};
