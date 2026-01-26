import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_COMPONENTS_LIST } from "@constants/ContractComponentsConstants";
import { CONTRACT_FORM_HOOKS_LIST } from "@constants/AdminContractFormHooksConstants";
import { getUserContractTypesService } from "@services/user/ContractTypeService";

export const useEditContract = () => {
    // component state
    const menu = "contracts";
    const action = "edit";

    // router params
    const { id: contractId } = useParams();

    // steps state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;

    // auth user state
    const sessionUserRole = sessionStorage.getItem("role")?.toLowerCase();
    const sessionUserId = sessionStorage.getItem("selected_contract_user_id");

    // contracts state
    const [contract, setContract] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const ContractForm = CONTRACT_COMPONENTS_LIST[selectedContract];
    const ContractFormHook = CONTRACT_FORM_HOOKS_LIST[selectedContract];
    const [contractTypes, setContractTypes] = useState([]);

    const initializeStateHelper = async () => {
        try {
            const contractTypesData = await getUserContractTypesService(sessionUserId);
            setContractTypes(Array.isArray(contractTypesData) ? contractTypesData : []);
        } catch (error) {
            console.error("Error initializing states:", error);
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
    };
};
