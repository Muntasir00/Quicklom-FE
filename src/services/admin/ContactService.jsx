import axios from "axios";
import Swal from "sweetalert2";

const API_RESOURCE = "admin";

/**
 * Get all contacts/users in the system (admin view)
 */
export const getContactsService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/contacts`);
        if (response.data?.status === false) return [];
        return response?.data?.data || [];
    } catch (error) {
        console.error("Error occurred:", error);
        const apiError = error.response?.data;

        if (apiError?.errors) {
            const firstErrorMessage = Object.values(apiError.errors).flat().join("\n");
            Swal.fire("Error", firstErrorMessage, "error");
        }

        return [];
    }
};

/**
 * Get all users grouped by role
 */
export const getUsersByRoleService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/users/by-role`);
        if (response.data?.status === false) return {};
        return response?.data?.data || {};
    } catch (error) {
        console.error("Error occurred:", error);
        return {};
    }
};