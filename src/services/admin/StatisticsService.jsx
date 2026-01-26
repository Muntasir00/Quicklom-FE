import React from 'react';
import axios from "axios";
import Swal from 'sweetalert2';

const API_RESOURCE = "admin";

export const getUsersPerRoleService = async () => {
    try {
        const response = await axios.get("/v.1/admin/statistics/users/roles");
        if (response.data?.status === false) return null;
        return response.data.data;
    } catch (error) {
        console.error("Error occurred while fetching users per role:", error);
        return null;
    }
};


export const getUsersStatisticsService = async () => {
    try {
        const response = await axios.get("/v.1/admin/statistics/users");
        if (response.data?.status === false) return null;    
        return response.data.data;
    } catch (error) {
        console.error("Error occurred while fetching users per role:", error);
        return null;
    }
};

export const getUsersRegistrationsStatisticsService = async () => {
    try {
        const response = await axios.get("/v.1/admin/statistics/users/monthly-registrations");
        if (response.data?.status === false) return [];
        const data = Object.values(response.data.data);
        return data;
    } catch (error) {
        console.error("Error occurred :", error);
        return [];
    }
};

export const getInstituteStatisticsByCategory = async () => {
    try {
        const response = await axios.get("/v.1/admin/statistics/institutes/by-category");
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getContractStatisticsService = async () => {
    try {
        const response = await axios.get("/v.1/admin/statistics/contracts");
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