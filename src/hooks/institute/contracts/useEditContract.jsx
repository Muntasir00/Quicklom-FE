import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_COMPONENTS_LIST } from "@constants/ContractComponentsConstants";
import { CONTRACT_FORM_HOOKS_LIST } from "@constants/ContractFormHooksConstants";
import { getUserContractTypesService } from "@services/user/ContractTypeService";
import { getContractByIdService } from "@services/institute/ContractService";
import { cleanContractName } from "@utils/StringUtils";

export const useEditContract = () => {
    // component state
    const menu = "contracts";
    const action = "edit";

    // router params
    const { id: contractId } = useParams();

    // steps state - start at step 2 when editing (skip contract type selection)
    const [currentStep, setCurrentStep] = useState(2);
    const totalSteps = 2;

    // auth user state
    const sessionUserRole = sessionStorage.getItem("role")?.toLowerCase();
    const sessionUserId = sessionStorage.getItem("user_id");

    // contracts state
    const [contract, setContract] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const ContractForm = CONTRACT_COMPONENTS_LIST[selectedContract];
    const ContractFormHook = CONTRACT_FORM_HOOKS_LIST[selectedContract];
    const [contractTypes, setContractTypes] = useState([]);

    const initializeStateHelper = async () => {
        try {
            setIsLoading(true);

            // Fetch contract types
            const contractTypesData = await getUserContractTypesService(sessionUserId);
            setContractTypes(Array.isArray(contractTypesData) ? contractTypesData : []);

            // Fetch the existing contract data
            const contractData = await getContractByIdService(contractId);

            if (contractData) {
                setContract(contractData);

                // Get the contract type from the contract_type relationship
                if (contractData.contract_type && contractData.contract_type.contract_name) {
                    const contractTypeName = cleanContractName(contractData.contract_type.contract_name);
                    setSelectedContract(contractTypeName);
                    // Since we have the contract type, skip directly to step 2
                    setCurrentStep(2);
                }
            }

            setIsLoading(false);
        } catch (error) {
            console.error("Error initializing states:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Contracts | Quicklocum";
        if (!contractId) return;
        initializeStateHelper();
    }, [contractId]);

    return {
        menu,
        action,
        contractId,
        currentStep,
        setCurrentStep,
        totalSteps,
        sessionUserRole,
        sessionUserId,
        contract,
        setContract,
        selectedContract,
        setSelectedContract,
        contractTypes,
        setContractTypes,
        ContractForm,
        ContractFormHook,
        CONTRACT_FORM_IDS_LIST,
        isLoading,
    };
};
