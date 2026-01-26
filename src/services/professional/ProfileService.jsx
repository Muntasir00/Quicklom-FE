import React from 'react';
import axios from "axios";
import Swal from 'sweetalert2';


export const updateProfessionalProfileService = async (userId, formData) => {
    try {
        
        const response = await axios.post(`/v.1/professional/profile/${userId}/update`, formData, { headers: { "Content-Type": "multipart/form-data" } });

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }

        Swal.fire("Success!", "Professional profile updated successfully!", "success");
        return true;
    } catch (error) {
        console.error("Error updating institute profile:", error);
        const errMsg =
            error.response?.data?.error ||                // custom error from backend
            error.response?.data?.errors?.[0] ||          // validation errors (if array)
            "An unexpected error occurred.";              // fallback
        
        Swal.fire("Oops!", "Something went wrong, please try again.", "error");
        return false;
    }
};

export const getProfessionalProfileService = async () => {
    try {
        const response = await axios.get(`/v.1/professional/profile`);
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error('Error occurred while fetching institute profile:', error);
        return [];
    }
};

