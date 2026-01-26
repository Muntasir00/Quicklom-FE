import React from 'react';
import axios from "axios";
import Swal from 'sweetalert2';

const API_RESOURCE = "user";


export const getInstituteCategoryService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/institute-categories`);
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error('Error occured:', error);
        return [];
    }
}

export const getInstituteSpecialityService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/institute-specialties`);
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error('Error occured:', error);
        return [];
    }
}