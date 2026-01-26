import axios from "axios";

/**
 * Institute Upcoming Contracts Service
 * Handles API calls for institute users (clinics, pharmacies, agencies, headhunters)
 *
 * Clinics/Pharmacies: See only PUBLISHED contracts
 * Agencies/Headhunters: See both PUBLISHED and APPLIED contracts
 */

export const getUpcomingContractsService = async ({ filters } = {}) => {
    try {
        const response = await axios.get(`/v.1/institute/upcoming-contracts`, {
            params: {
                filter_urgency: filters?.filter_urgency || "",
                filter_source: filters?.filter_source || "",
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
        const response = await axios.get(`/v.1/institute/upcoming-contracts/imminent`, {
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

        const response = await axios.get(`/v.1/institute/upcoming-contracts/calendar`, {
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

export const getUserTypeService = async () => {
    try {
        const data = await getUpcomingContractsService();
        return data?.user_type || null;
    } catch (error) {
        console.error("Error occurred:", error);
        return null;
    }
};

export const getPublishedContractsService = async () => {
    try {
        const data = await getUpcomingContractsService({
            filters: { filter_source: 'published' }
        });
        return data?.contracts || [];
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getAppliedContractsService = async () => {
    try {
        const data = await getUpcomingContractsService({
            filters: { filter_source: 'applied' }
        });
        return data?.contracts || [];
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getSourceBreakdownService = async () => {
    try {
        const stats = await getUpcomingContractsStatsService();
        return {
            published_count: stats?.published_count || 0,
            applied_count: stats?.applied_count || 0
        };
    } catch (error) {
        console.error("Error occurred:", error);
        return {
            published_count: 0,
            applied_count: 0
        };
    }
};

export const getUnsignedAgreementsService = async () => {
    try {
        const data = await getUpcomingContractsService();
        return data?.contracts?.filter(c => c.has_agreement && !c.agreement_signed) || [];
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getUnassignedContractsService = async () => {
    try {
        const data = await getUpcomingContractsService();
        return data?.contracts?.filter(c => !c.professional) || [];
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};