import axios from "axios";
import Swal from "sweetalert2";

const API_RESOURCE = sessionStorage.getItem("role");

export const getNotificationsService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/notifications`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        const apiError = error.response?.data;

        if (apiError?.errors) {
            const firstErrorMessage = Object.values(apiError.errors)
                .flat()
                .join("\n");
            Swal.fire("Error", firstErrorMessage, "error");
        }

        return [];
    }
};


export const getUserNotificationsService = async (userId) => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/notifications/user/${userId}`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        const apiError = error.response?.data;

        if (apiError?.errors) {
            const firstErrorMessage = Object.values(apiError.errors)
                .flat()
                .join("\n");
            Swal.fire("Error", firstErrorMessage, "error");
        }

        return [];
    }
};
