import axios from "axios";
import Swal from "sweetalert2";

let API_RESOURCE = sessionStorage.getItem("role");
API_RESOURCE = API_RESOURCE || "professional";

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


export const getUserNotificationsService = async () => {
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

export const markNotificationAsReadService = async (notificationId) => {
    try {
        const response = await axios.put(`/v.1/${API_RESOURCE}/notifications/${notificationId}/mark-read`);
        return response.data?.status === true;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return false;
    }
};

export const markNotificationAsUnreadService = async (notificationId) => {
    try {
        const response = await axios.put(`/v.1/${API_RESOURCE}/notifications/${notificationId}/mark-unread`);
        return response.data?.status === true;
    } catch (error) {
        console.error("Error marking notification as unread:", error);
        return false;
    }
};

export const markAllNotificationsAsReadService = async () => {
    try {
        const response = await axios.put(`/v.1/${API_RESOURCE}/notifications/mark-all-read`);
        if (response.data?.status === true) {
            Swal.fire({
                title: "Success!",
                text: response.data?.message || "All notifications marked as read",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        Swal.fire("Error", "Failed to mark all notifications as read", "error");
        return false;
    }
};
