import axios from "axios";

let API_RESOURCE = sessionStorage.getItem("role");
API_RESOURCE = API_RESOURCE || "institute";

/**
 * Service for fetching Institute Dashboard KPIs
 */

export const getDashboardKPIsService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/statistics/dashboard-kpis`);
        if (response.data?.status === false) return null;
        return response?.data?.data;
    } catch (error) {
        console.error("Error fetching dashboard KPIs:", error);
        return null;
    }
};

export const getContractStatisticsService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/statistics/contracts`);
        if (response.data?.status === false) return null;
        return response?.data?.data;
    } catch (error) {
        console.error("Error fetching contract statistics:", error);
        return null;
    }
};

export const getNotificationStatisticsService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/statistics/notifications`);
        if (response.data?.status === false) return null;
        return response?.data?.data;
    } catch (error) {
        console.error("Error fetching notification statistics:", error);
        return null;
    }
};
