import axios from "axios";

/**
 * Professional Upcoming Contracts Service
 * Handles API calls for professional users to view their upcoming contracted work
 * Professionals ONLY see contracts they have APPLIED TO with accepted status
 */

export const getUpcomingContractsService = async ({ filters } = {}) => {
    try {
        const response = await axios.get(`/v.1/professional/upcoming-contracts`, {
            params: {
                filter_urgency: filters?.filter_urgency || "",
                days_ahead: filters?.days_ahead || 90,
                include_past: filters?.include_past || false,
                sort_by: filters?.sort_by || "start_date",
            }
        });

        if (response.data?.status === false) return null;
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return null;
    }
};

export const getImminentContractsService = async (hours = 72) => {
    try {
        const response = await axios.get(`/v.1/professional/upcoming-contracts/imminent`, {
            params: {
                hours_threshold: hours
            }
        });

        if (response.data?.status === false) return [];
        return response?.data?.data || [];
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getCalendarViewService = async (year, month) => {
    try {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;

        const response = await axios.get(`/v.1/professional/upcoming-contracts/calendar`, {
            params
        });

        if (response.data?.status === false) return null;
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return null;
    }
};

export const getUpcomingContractsStatsService = async () => {
    try {
        const data = await getUpcomingContractsService();
        return data?.stats || null;
    } catch (error) {
        console.error("Error occurred:", error);
        return null;
    }
};

export const getImminentCountService = async (hours = 72) => {
    try {
        const contracts = await getImminentContractsService(hours);
        return contracts.length;
    } catch (error) {
        console.error("Error occurred:", error);
        return 0;
    }
};

export const getPendingSignatureContractsService = async () => {
    try {
        const data = await getUpcomingContractsService();
        return data?.timeline_view?.pending_signature || [];
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getProjectedEarningsService = async () => {
    try {
        const stats = await getUpcomingContractsStatsService();
        return stats?.total_projected_earnings || null;
    } catch (error) {
        console.error("Error occurred:", error);
        return null;
    }
};