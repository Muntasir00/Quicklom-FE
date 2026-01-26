import React, { useState, useEffect } from "react";
import { upperCaseFirst } from "@utils/StringUtils";
import { getContractApplicationStatisticsService } from "@services/professional/StatisticsService";

export const useViewContractApplications = () => {
    const [contractApplicationStatistics, setContractApplicationStatistics] = useState(null);

    const initializeStateHelper = async () => {
        try {
            const data = await getContractApplicationStatisticsService();
            setContractApplicationStatistics(data ?? null);
        } catch (error) {
            console.error("Error in initializeStateHelper:", error);
        }
    };

    useEffect(() => { initializeStateHelper() }, []);

    return { contractApplicationStatistics };
};
