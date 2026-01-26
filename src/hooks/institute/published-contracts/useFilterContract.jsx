import { useState, useEffect } from "react";
import { getInstituteSpecialityService } from "@services/user/InstituteSpecialityService";
import { getPositionSoughtsService } from "@services/user/PositionSoughtService";
import { getPublishedContractsService } from "@services/institute/PublishedContractService";

// Canadian provinces
const CANADIAN_PROVINCES = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon"
];

// Contract duration types
const CONTRACT_DURATION_TYPES = [
    "temporary staffing",
    "permanent staffing"
];

export const useFilterContract = (setContracts) => {
    const [instituteSpecialties, setInstituteSpecialties] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        contract_id: "",
        province: "",
        position_id: "",
        min_rate: "",
        max_rate: "",
        specialty: "",
        start_date: "",
        end_date: "",
        month: "",
        status: "",
        contract_duration_type: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClear = async () => {
        try {
            const cleared = {
                contract_id: "",
                province: "",
                position_id: "",
                min_rate: "",
                max_rate: "",
                specialty: "",
                start_date: "",
                end_date: "",
                month: "",
                status: "",
                contract_duration_type: ""
            };
            setFilters(cleared);
            const contractData = await getPublishedContractsService({ filters: cleared });
            if (!contractData || !Array.isArray(contractData)) return;
            setContracts(contractData ?? []);
        } catch (error) {
            console.error("Error clearing filters:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            console.log("Institute - Submitting search with filters:", filters);
            const contractData = await getPublishedContractsService({ filters });
            if (!contractData || !Array.isArray(contractData)) return;
            setContracts(contractData ?? []);
        } catch (error) {
            console.error("Error submitting filters:", error);
        }
    };

    const initializeStateHelper = async () => {
        try {
            setLoading(true);
            const specialtyData = await getInstituteSpecialityService();
            const positionsData = await getPositionSoughtsService();

            setInstituteSpecialties(specialtyData ?? []);
            setPositions(Array.isArray(positionsData) ? positionsData : []);
        } catch (err) {
            console.error("Init error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { initializeStateHelper(); }, []);

    // Return both old names (for backward compatibility) and new names (for UserContractFilterForm)
    return {
        filters,
        handleChange,
        handleClear,
        handleSubmit,
        instituteSpecialties,
        positions,
        // New properties for UserContractFilterForm compatibility
        loading,
        profile: null,
        availableProvinces: CANADIAN_PROVINCES,
        availableSpecialties: (instituteSpecialties || []).map(s => s.name).filter(Boolean),
        availableContractTypes: CONTRACT_DURATION_TYPES,
    };
};
