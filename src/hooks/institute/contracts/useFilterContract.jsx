import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { getContractsService } from "@services/institute/ContractService";
import { getInstituteProfileService } from "@services/institute/ProfileService";
import { getPositionSoughtsService } from "@services/user/PositionSoughtService";


export const useFilterContract = (setContracts) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const contractIdParam = searchParams.get("contract_id");
    const filterParam = searchParams.get("filter");

    const [profile, setProfile] = useState(null);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        contract_id: contractIdParam || "",
        province: "",
        position_id: "",
        min_rate: "",
        max_rate: "",
        specialty: "",  // Frontend uses this, backend should be updated to handle it
        start_date: "",
        end_date: "",
        month: "",
        contract_duration_type: "",  // Frontend uses this, backend should be updated to handle it
        status: "",
        filter: filterParam || "",  // Special filters like "no_applications"
        // Backend also supports these (but we don't use them in the UI currently):
        // duration: "",
        // institute_specialty_id: "",
        // publisher_name: "",
        // publisher_email: "",
        // position_sought: "",
        // id: ""
    });

    // Get profile-specific filter options
    const getAvailableProvinces = () => {
        // Try different possible paths for the data
        const regions = profile?.regions_served || profile?.data?.data?.regions_served || profile?.data?.regions_served;
        console.log("Getting available provinces:", regions);
        if (!regions) {
            console.log("No regions_served found. Profile structure:", profile);
            return [];
        }
        return regions;
    };

    const getAvailableSpecialties = () => {
        // Try different possible paths for the data
        const specialties = profile?.specialties_covered || profile?.data?.data?.specialties_covered || profile?.data?.specialties_covered;
        console.log("Getting available specialties:", specialties);
        if (!specialties) {
            console.log("No specialties_covered found. Profile structure:", profile);
            return [];
        }
        return specialties;
    };

    const getAvailableContractTypes = () => {
        // Try different possible paths for the data
        const types = profile?.types_of_contracts_managed || profile?.data?.data?.types_of_contracts_managed || profile?.data?.types_of_contracts_managed;
        console.log("Getting available contract types:", types);
        if (!types) {
            console.log("No types_of_contracts_managed found. Profile structure:", profile);
            return [];
        }
        return types;
    };

    // Get positions filtered by specialties in profile
    const getFilteredPositions = () => {
        // Try different possible paths for the data
        const specialtiesInProfile = profile?.specialties_covered || profile?.data?.data?.specialties_covered || profile?.data?.specialties_covered;

        if (!specialtiesInProfile || !positions.length) {
            console.log("Cannot filter positions - specialties:", specialtiesInProfile, "positions:", positions.length);
            return [];
        }

        // Map specialties to professional categories (industry names)
        const specialtyToCategoryMap = {
            "General Medicine": "General Medicine",
            "Dental Care": "Dental Care",
            "Nursing and Home Care": "Nursing and Home Care",
            "Pharmacy": "Pharmacy",
        };

        console.log("Filtering positions by specialties:", specialtiesInProfile);

        // Filter positions that match the specialties in the profile
        const filtered = positions.filter(position => {
            const positionCategory = position.professional_category?.name;
            const matches = specialtiesInProfile.some(specialty => {
                const mappedCategory = specialtyToCategoryMap[specialty];
                return mappedCategory === positionCategory;
            });
            return matches;
        });

        console.log("Filtered positions:", filtered.length, "out of", positions.length);
        return filtered;
    };

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
                contract_duration_type: "",
                status: "",
                filter: ""
            };
            setFilters(cleared);
            // Also clear URL params by navigating to the base path
            navigate(location.pathname, { replace: true });
            const contractData = await getContractsService({ filters: cleared });
            if (!contractData || !Array.isArray(contractData)) return;
            setContracts(contractData ?? []);
        } catch (error) {
            console.error("Error clearing filters:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Build filters based on profile restrictions
            const profileFilters = { ...filters };

            console.log("Submitting filters:", profileFilters);

            // Only include filters that are within profile scope
            if (profileFilters.province && !getAvailableProvinces().includes(profileFilters.province)) {
                console.warn("Selected province not in profile regions served");
                delete profileFilters.province;
            }

            if (profileFilters.specialty && !getAvailableSpecialties().includes(profileFilters.specialty)) {
                console.warn("Selected specialty not in profile specialties covered");
                delete profileFilters.specialty;
            }

            if (profileFilters.contract_duration_type && !getAvailableContractTypes().includes(profileFilters.contract_duration_type)) {
                console.warn("Selected contract type not in profile types managed");
                delete profileFilters.contract_duration_type;
            }

            console.log("Validated filters:", profileFilters);

            const contractData = await getContractsService({ filters: profileFilters });
            console.log("Contracts received:", contractData?.length || 0);

            if (!contractData || !Array.isArray(contractData)) return;
            setContracts(contractData ?? []);
        } catch (error) {
            console.error("Error submitting filters:", error);
        }
    };

    const initializeStateHelper = async () => {
        try {
            setLoading(true);

            // Fetch profile and positions
            const [profileResponse, positionsData] = await Promise.all([
                getInstituteProfileService(),
                getPositionSoughtsService()
            ]);

            console.log("=== PROFILE RESPONSE ===");
            console.log("Full response:", profileResponse);
            console.log("Response.data:", profileResponse?.data);
            console.log("Response.data.data:", profileResponse?.data?.data);

            // Handle nested profile structure
            // The service returns { status: true, data: { id, user_id, data: { actual profile fields } } }
            const profileData = profileResponse?.data || profileResponse;

            console.log("Profile data to be set:", profileData);
            console.log("Regions served:", profileData?.data?.regions_served);
            console.log("Specialties covered:", profileData?.data?.specialties_covered);
            console.log("Contract types managed:", profileData?.data?.types_of_contracts_managed);

            setProfile(profileData || null);
            setPositions(Array.isArray(positionsData) ? positionsData : []);

            console.log("=== POSITIONS RESPONSE ===");
            console.log("Positions count:", positionsData?.length || 0);
            if (positionsData?.length > 0) {
                console.log("Sample position:", positionsData[0]);
            }

            setLoading(false);
        } catch (err) {
            console.error("Init error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeStateHelper();
    }, []);

    // Sync filter state with URL params when they change
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            filter: filterParam || "",
            contract_id: contractIdParam || ""
        }));
    }, [filterParam, contractIdParam]);

    return {
        filters,
        handleChange,
        handleClear,
        handleSubmit,
        profile,
        positions: getFilteredPositions(),
        availableProvinces: getAvailableProvinces(),
        availableSpecialties: getAvailableSpecialties(),
        availableContractTypes: getAvailableContractTypes(),
        loading,
    };
};