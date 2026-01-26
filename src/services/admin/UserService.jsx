import axios from "axios";
import Swal from 'sweetalert2';

// ==================== EXISTING SERVICES ====================

export const getUsersService = async ({ filters } = {}) => {
    try {
        const response = await axios.get(`/v.1/admin/users`, {
            params: {
                role_id: filters?.role_id || "",
                created_at: filters?.created_at || "",
                updated_at: filters?.updated_at || "",
                professional_category_id: filters?.professional_category_id || "",
                institute_category_id: filters?.institute_category_id || "",
                profile_status: filters?.profile_status || "",
                affected_entity_id: filters?.affected_entity_id || "",
            }
        });

        if (response.data.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error('Error occurred:', error);
        return [];
    }
}

export const getUserByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/users/${id}`);

        if (response.data?.status === false) {
            console.error("Error occurred:", response.data?.message);
            return null;
        }

        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return null;
    }
};

export const updateUsersStatusService = async ({ userId }) => {
    try {
        const response = await axios.put(`/v.1/admin/users/${userId}/update-status`);
        if (response.data.status === false) return;
        Swal.fire({
            title: "Success!",
            text: "User status updated successfully!",
            icon: "success"
        });
    } catch (error) {
        console.error("Error occurred:", error);
    }
};

export const updateUserService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/users/${id}/update`, payload);

        if (response.data?.status === false) {
            // Handle validation errors
            if (response.data?.errors) {
                const errorMessages = Object.entries(response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('<br>');
                Swal.fire({
                    title: "Validation Error",
                    html: errorMessages,
                    icon: "error"
                });
                return null;
            }

            Swal.fire("Oops!", response.data?.message || "Something went wrong.", "error");
            return null;
        }

        Swal.fire("Success!", "User account updated successfully.", "success");
        return response.data.data;

    } catch (error) {
        console.error("Error updating user:", error);

        // Handle backend validation errors
        if (error.response?.data?.errors) {
            const errorMessages = Object.entries(error.response.data.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('<br>');
            Swal.fire({
                title: "Validation Error",
                html: errorMessages,
                icon: "error"
            });
            return null;
        }

        const errMsg = error.response?.data?.message || "An unexpected error occurred.";
        Swal.fire("Error!", errMsg, "error");
        return null;
    }
};

export const deleteUserService = async ({ userId }) => {
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) return;

        const response = await axios.delete(`/v.1/admin/users/${userId}`);
        if (response.data.status === false) {
            Swal.fire({
                title: "Error!",
                text: response.data.message || "Failed to delete user.",
                icon: "error"
            });
            return;
        }

        Swal.fire({
            title: "Deleted!",
            text: "User has been deleted successfully!",
            icon: "success"
        });

    } catch (error) {
        console.error("Error occurred while deleting user:", error);
        Swal.fire({
            title: "Error!",
            text: "Failed to delete user. Please try again.",
            icon: "error"
        });
    }
};

export const sendVerificationEmailService = async ({ userId }) => {
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to send a verification email to this user?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, send it!",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) return;

        const response = await axios.post(`/v.1/admin/users/${Number(userId)}/send-verification`);

        if (response.data.status === false) {
            Swal.fire({
                title: "Oops!",
                text: "Something went wrong",
                icon: "error"
            });
            return;
        }

        Swal.fire({
            title: "Sent!",
            text: "Verification email has been sent successfully!",
            icon: "success"
        });

    } catch (error) {
        console.error("Error occurred while sending verification email:", error);
        Swal.fire({
            title: "Error!",
            text: "Failed to send verification email. Please try again.",
            icon: "error"
        });
    }
};

export const createUserService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/users/create`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }
        Swal.fire("Success!", "User created successfully.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};

// ==================== NEW PROFILE SERVICES ====================

/**
 * Get complete user profile by admin
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User profile data or null
 */
export const getUserProfileByAdminService = async (userId) => {
    try {
        const response = await axios.get(`/v.1/admin/users/${userId}/profile`);

        if (response.data?.status === false) {
            console.error("Error occurred:", response.data?.message);
            return null;
        }

        return response.data?.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        Swal.fire({
            title: "Error!",
            text: "Failed to fetch user profile. Please try again.",
            icon: "error"
        });
        return null;
    }
};

/**
 * Update user profile by admin
 * @param {number} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @param {Object} files - Files to upload (optional)
 * @returns {Promise<boolean>} Success status
 */
export const updateUserProfileByAdminService = async (userId, profileData, files = {}) => {
    try {
        const formData = new FormData();

        // Add JSON payload
        formData.append('data', JSON.stringify(profileData));

        // Add files if provided
        Object.entries(files).forEach(([key, file]) => {
            if (file && file instanceof File) {
                formData.append(key, file);
            }
        });

        const response = await axios.post(
            `/v.1/admin/users/${userId}/profile/update`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (response.data?.status === false) {
            Swal.fire({
                title: "Error!",
                text: response.data?.message || "Failed to update profile.",
                icon: "error"
            });
            return false;
        }

        Swal.fire({
            title: "Success!",
            text: "User profile updated successfully!",
            icon: "success"
        });
        return true;

    } catch (error) {
        console.error("Error updating user profile:", error);

        const errMsg = error.response?.data?.message ||
                      error.response?.data?.error ||
                      "An unexpected error occurred.";

        Swal.fire({
            title: "Error!",
            text: errMsg,
            icon: "error"
        });
        return false;
    }
};

/**
 * Update user profile status by admin
 * @param {number} userId - User ID
 * @param {string} status - Status value (pending, approved, rejected)
 * @returns {Promise<boolean>} Success status
 */
export const updateUserProfileStatusByAdminService = async (userId, status) => {
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Do you want to change profile status to "${status}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) return false;

        const response = await axios.put(
            `/v.1/admin/users/${userId}/profile/status`,
            null,
            { params: { status_value: status } }
        );

        if (response.data?.status === false) {
            Swal.fire({
                title: "Error!",
                text: response.data?.message || "Failed to update profile status.",
                icon: "error"
            });
            return false;
        }

        Swal.fire({
            title: "Success!",
            text: `Profile status updated to "${status}"!`,
            icon: "success"
        });
        return true;

    } catch (error) {
        console.error("Error updating profile status:", error);
        Swal.fire({
            title: "Error!",
            text: "Failed to update profile status. Please try again.",
            icon: "error"
        });
        return false;
    }
};