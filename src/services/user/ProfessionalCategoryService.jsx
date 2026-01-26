import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const getProfessionalCategoriesService = async () => {
    try {
        const response = await axios.get(`/v.1/user/professional-categories`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};