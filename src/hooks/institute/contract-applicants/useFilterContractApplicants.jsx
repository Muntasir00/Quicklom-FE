import { getContractApplicantsService } from "@services/institute/ContractApplicantsService";

/**
 * Custom hook for filtering contract applicants
 */
export const useFilterContractApplicants = () => {
    const filterApplicants = async (filters) => {
        try {
            console.log("Filtering applicants with:", filters);
            const data = await getContractApplicantsService({ filters });
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error in filter hook:", error);
            return [];
        }
    };

    return filterApplicants;
};