import React from "react";
import { useState, useEffect } from "react";
import { upperCaseFirst } from "@utils/StringUtils";
import { 
    getUsersPerRoleService, 
    getUsersStatisticsService, 
    getUsersRegistrationsStatisticsService, 
    getInstituteStatisticsByCategory,
    getContractStatisticsService 
} from "@services/admin/StatisticsService";

export const useViewDashboard = () => {
    const menu = "Dashboard";
    const userRole = sessionStorage.getItem("role");
    const sessionUserRole = sessionStorage.getItem("role");
    const [roleStatistics, setRoleStatistics] = useState([]);
    const [userStatistics, setUserStatistics] = useState([]);
    const [userRegistrationsStatistics, setUserRegistrationsStatistics] = useState([]);
    const [instituteCategoryStatistics, setInstituteCategoryStatistics] = useState([]);
    const [contractStatistics, setContractStatistics] = useState(null);

    const initializeStateHelper = async () => {
        try {
            const roleStatisticsData = await getUsersPerRoleService();
            const userStatisticsData = await getUsersStatisticsService();
            const userRegistrationsStatisticsData = await getUsersRegistrationsStatisticsService();
            const instituteCategoryStatisticsData = await getInstituteStatisticsByCategory();
            const contractStatisticsData = await getContractStatisticsService();

            setRoleStatistics(roleStatisticsData ?? []);
            setUserStatistics(userStatisticsData ?? []);
            setUserRegistrationsStatistics(userRegistrationsStatisticsData ?? []);           
            setInstituteCategoryStatistics(instituteCategoryStatisticsData ?? []);
            setContractStatistics(contractStatisticsData ?? null);
        } catch (error) { 
            console.error("Error in initializeStateHelper:", error);
        }
    };

    useEffect(() => { 
        initializeStateHelper();
        document.title = `${upperCaseFirst(menu ?? "Quicklocum")} | Quicklocum`;
    }, []);

    return {
        menu,
        userRole,
        roleStatistics,
        userStatistics,
        userRegistrationsStatistics,
        instituteCategoryStatistics,
        contractStatistics
    };
};
