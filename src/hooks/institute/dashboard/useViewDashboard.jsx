import React from "react";
import { useState, useEffect } from "react";
import { upperCaseFirst } from "@utils/StringUtils";
import {
    getContractStatisticsService
} from "@services/institute/StatisticsService";
import {
    getDashboardKPIsService
} from "@services/institute/KPIService";

export const useViewDashboard = () => {
    const menu = "Dashboard";
    const sessionUserRole = sessionStorage.getItem("role");
    const [contractStatistics, setContractStatistics] = useState(null);
    const [dashboardKPIs, setDashboardKPIs] = useState(null);
    const [loading, setLoading] = useState(true);

    const initializeStateHelper = async () => {
        try {
            setLoading(true);

            // Fetch both contract statistics and KPIs in parallel
            const [contractStatisticsData, kpisData] = await Promise.all([
                getContractStatisticsService(),
                getDashboardKPIsService()
            ]);

            setContractStatistics(contractStatisticsData ?? null);
            setDashboardKPIs(kpisData ?? null);
        } catch (error) {
            console.error("Error in initializeStateHelper:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        document.title = `${upperCaseFirst(menu ?? "Quicklocum")} | Quicklocum`;
    }, []);

    return {
        menu,
        sessionUserRole,
        contractStatistics,
        dashboardKPIs,
        loading
    };
};
