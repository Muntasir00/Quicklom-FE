import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getInstituteSpecialityService } from "@services/user/InstituteSpecialityService";
import { getPositionSoughtsService } from "@services/user/PositionSoughtService";
import { CONTRACT_STATUS } from "@constants/ContractConstants";
import { CONTRACT_APPLICATION_STATUS } from "@constants/ContractApplicationConstants";
import { getContractApplicationsService } from "@services/institute/ContractApplicationsService";


export const useFilterContract = (setApplications) => {
    const [searchParams] = useSearchParams();
    const contractIdParam = searchParams.get("contract_id");

    const [instituteSpecialties, setInstituteSpecialties] = useState([]);
    const [positions, setPositions] = useState([]);

    const [filters, setFilters] = useState({
        contract_id: contractIdParam || "",
        position_id: "",
        institute_specialty_id: "",
        start_date: "",
        end_date: "",
        status: ""
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
                position_id: "",
                institute_specialty_id: "",
                start_date: "",
                end_date: "",
                status: "",
            };
            setFilters(cleared);
            const contractData = await getContractApplicationsService({ filters: cleared });
            if (!contractData || !Array.isArray(contractData)) return;
            setApplications(contractData ?? []);
        } catch (error) {
            console.error("Error clearing filters:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const contractData = await getContractApplicationsService({ filters });
            if (!contractData || !Array.isArray(contractData)) return;
            setApplications(contractData ?? []);
            console.log("Submitting search with filters:", filters);
        } catch (error) {
            console.error("Error submitting filters:", error);
        }
    };

    const initializeStateHelper = async () => {
        try {
            const specialtData = await getInstituteSpecialityService();
            const positionsData = await getPositionSoughtsService();

            setInstituteSpecialties(specialtData ?? []);
            setPositions(Array.isArray(positionsData) ? positionsData : []);
        } catch (err) {
            console.error("Init error:", err);
        }
    };

    useEffect(() => { initializeStateHelper(); }, []);
    
    return {
        filters,
        handleChange,
        handleClear,
        handleSubmit,
        instituteSpecialties,
        positions,
        CONTRACT_APPLICATION_STATUS,
    };
};
