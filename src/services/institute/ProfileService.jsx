import React from 'react';
import axios from "axios";
import Swal from 'sweetalert2';

export const updateInstituteProfileService = async (userId, formData) => {
    try {
        const response = await axios.post(`/v.1/institute/profile/${userId}/update`, formData, { headers: { "Content-Type": "multipart/form-data" } });

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return false;
        }

        Swal.fire("Success!", "Institute profile updated successfully!", "success");
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


export const getInstituteProfileService = async () => {
    try {
        const response = await axios.get(`/v.1/institute/profile`);
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error('Error occurred while fetching institute profile:', error);
        Swal.fire("Error!", "Unable to fetch institute profile.", "error");
        return [];
    }
};

export const getUserProfileService = async () => {
    try {
        const response = await axios.get(`/v.1/institute/profile`);

        if (response.data?.status === false) {
            console.error("Failed to fetch profile:", response.data?.message);
            return null;
        }

        return response?.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const editInstituteProfileService = async (setProfile, setMainFormData, setSelectedCategory, setUserCategory) => {
    try {
        const response = await axios.get(`/v.1/institute/profile`);
        if (response.data?.status === false) return;
        const data = response.data.data.data;

        setMainFormData({
            institute_category_id: data.institute_category_id,
            institute_specialty_ids: data.institute_specialty_ids
        });
        
        setProfile(data);
        setUserCategory(response?.data?.category?.name);
        setSelectedCategory(response.data?.category);
    } catch (error) {
        console.error("Error :", error);
    }
};
