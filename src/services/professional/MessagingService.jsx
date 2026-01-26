import axios from "axios";
import Swal from "sweetalert2";

const API_RESOURCE = "professional";

/**
 * Get all messages for the current user
 */
export const getMessagesService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/messages`);
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
 * Get messages between current user and specific user
 * Automatically marks messages as read when fetched
 */
export const getUserMessageService = async (userId) => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/messages/user/${userId}`);
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
 * Create a new message
 */
export const createMessageService = async (formData) => {
    try {
        const response = await axios.post(`/v.1/${API_RESOURCE}/messages/create`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data?.status === false) {
            console.log("Failed to create message", response.data);
            return [];
        }

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
 * Mark a specific message as read
 */
export const markMessageAsReadService = async (messageId) => {
    try {
        const response = await axios.put(`/v.1/${API_RESOURCE}/messages/${messageId}/mark-read`);
        if (response.data?.status === false) {
            console.log("Failed to mark message as read", response.data);
            return null;
        }
        return response?.data?.data || null;
    } catch (error) {
        console.error("Error marking message as read:", error);
        return null;
    }
};

/**
 * Mark all messages from a specific user as read
 */
export const markAllMessagesAsReadService = async (userId) => {
    try {
        const response = await axios.put(`/v.1/${API_RESOURCE}/messages/user/${userId}/mark-all-read`);
        if (response.data?.status === false) {
            console.log("Failed to mark messages as read", response.data);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return false;
    }
};

/**
 * Get unread message counts
 * Returns total unread and breakdown by sender
 */
export const getUnreadCountService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/messages/unread/count`);
        if (response.data?.status === false) {
            return { total_unread: 0, by_sender: [] };
        }
        return response?.data?.data || { total_unread: 0, by_sender: [] };
    } catch (error) {
        console.error("Error getting unread count:", error);
        return { total_unread: 0, by_sender: [] };
    }
};

/**
 * Update an existing message
 */
export const updateMessageService = async (messageId, data) => {
    try {
        const response = await axios.put(`/v.1/${API_RESOURCE}/messages/${messageId}/update`, data);
        if (response.data?.status === false) {
            console.log("Failed to update message", response.data);
            return null;
        }
        return response?.data?.data || null;
    } catch (error) {
        console.error("Error occurred:", error);
        const apiError = error.response?.data;
        if (apiError?.errors) {
            const firstErrorMessage = Object.values(apiError.errors).flat().join("\n");
            Swal.fire("Error", firstErrorMessage, "error");
        }
        return null;
    }
};

/**
 * Delete a message
 */
export const deleteMessageService = async ({ messageId }) => {
    try {
        const response = await axios.delete(`/v.1/${API_RESOURCE}/messages/${messageId}/delete`);
        if (response.data?.status === false) {
            Swal.fire("Error", response.data.message || "Failed to delete message", "error");
            return false;
        }
        Swal.fire("Success", "Message deleted successfully", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        const apiError = error.response?.data;
        if (apiError?.message) {
            Swal.fire("Error", apiError.message, "error");
        }
        return false;
    }
};