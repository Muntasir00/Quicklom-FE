import React from 'react';
import axios from "axios";
import Swal from 'sweetalert2';

let API_RESOURCE = sessionStorage.getItem("role");
API_RESOURCE = API_RESOURCE || "institute";

export const getContractStatisticsService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/statistics/contracts`);
        if (response.data?.status === false) return null;    
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return null;
    }
};

export const getNotificationStatisticsService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/statistics/notifications`);
        if (response.data?.status === false) return null;    
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return null;
    }
};