import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CONTRACT_STATUS } from "@constants/ContractConstants";
import { getContractsService, getProfessionalCategoriesService } from "@services/admin/ContractService"
import { getPositionSoughtsService } from "@services/admin/PositionSoughtService";

// Urgency options for filtering
export const URGENCY_OPTIONS = [
    { value: "in_progress", label: "In Progress", color: "#d32f2f" },
    { value: "starting_today", label: "Starting Today", color: "#d32f2f" },
    { value: "starting_tomorrow", label: "Starting Tomorrow", color: "#e65100" },
    { value: "starting_soon", label: "Starting Within 3 Days", color: "#e65100" },
    { value: "this_week", label: "This Week", color: "#f9a825" },
    { value: "upcoming", label: "Upcoming (7+ days)", color: "#388e3c" },
    { value: "ended", label: "Ended", color: "#757575" },
];

export const useFilterContract = (setContracts) => {
    const location = useLocation();
    const [positions, setPositions] = useState([]);
    const [professionalCategories, setProfessionalCategories] = useState([]);

    // Initialize filters from URL params if present
    const getInitialFilters = () => {
        const searchParams = new URLSearchParams(location.search);
        return {
            id: searchParams.get('id') || "",
            publisher_name: searchParams.get('publisher_name') || "",
            publisher_email: searchParams.get('publisher_email') || "",
            start_date: searchParams.get('start_date') || "",
            status: searchParams.get('status') || "",
            position_id: searchParams.get('position_id') || "",
            urgency: searchParams.get('urgency') || "",
            professional_category_id: searchParams.get('professional_category_id') || "",
        };
    };

    const [filters, setFilters] = useState(getInitialFilters());

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If changing professional_category_id, reset position_id
        if (name === "professional_category_id") {
            setFilters((prev) => ({
                ...prev,
                [name]: value,
                position_id: "" // Reset position when category changes
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleClear = async () => {
        try {
            const cleared = {
                id: "",
                publisher_name: "",
                publisher_email: "",
                start_date: "",
                status: "",
                position_id: "",
                urgency: "",
                professional_category_id: ""
            };
            setFilters(cleared);
            const contractData = await getContractsService({ filters: cleared });
            if (!contractData || !Array.isArray(contractData)) return;
            setContracts(contractData ?? []);
        } catch (error) {
            console.log("Error occured", error);
        }
    };

    const handleSubmit = async (event) => {
        try {
            event.preventDefault();
            const contractData = await getContractsService({ filters });
            if (!contractData || !Array.isArray(contractData)) return;
            setContracts(contractData ?? []);
            console.log("Submitting search with filters:", filters);
        } catch (error) {
            console.log("Error occured", error);
        }
    };

    const initializeStateHelper = async () => {
        try {
            const [positionsData, categoriesData] = await Promise.all([
                getPositionSoughtsService(),
                getProfessionalCategoriesService()
            ]);
            setPositions(Array.isArray(positionsData) ? positionsData : []);
            setProfessionalCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
            console.error("Error in initializeStateHelper:", error);
        }
    };

    // Auto-search when URL params are present
    const autoSearchFromUrlParams = async () => {
        const searchParams = new URLSearchParams(location.search);
        // Check if any URL params are present
        if (searchParams.toString()) {
            try {
                // Use URL params directly instead of state (to avoid closure issues)
                const urlFilters = {
                    id: searchParams.get('id') || "",
                    publisher_name: searchParams.get('publisher_name') || "",
                    publisher_email: searchParams.get('publisher_email') || "",
                    start_date: searchParams.get('start_date') || "",
                    status: searchParams.get('status') || "",
                    position_id: searchParams.get('position_id') || "",
                    urgency: searchParams.get('urgency') || "",
                    professional_category_id: searchParams.get('professional_category_id') || "",
                };
                const contractData = await getContractsService({ filters: urlFilters });
                if (!contractData || !Array.isArray(contractData)) return;
                setContracts(contractData ?? []);
            } catch (error) {
                console.log("Error occurred during auto-search:", error);
            }
        }
    };

    // Get positions filtered by selected professional category
    const getFilteredPositions = () => {
        if (!filters.professional_category_id) {
            return positions; // Return all if no category selected
        }
        return positions.filter(
            p => p.professional_category_id === parseInt(filters.professional_category_id)
        );
    };

    useEffect(() => {
        initializeStateHelper();
        autoSearchFromUrlParams();
    }, []);

    return {
        CONTRACT_STATUS,
        filters,
        handleClear,
        handleSubmit,
        handleChange,
        positions,
        professionalCategories,
        getFilteredPositions,
        URGENCY_OPTIONS,
    };
};
