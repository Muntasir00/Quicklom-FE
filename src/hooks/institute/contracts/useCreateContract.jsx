import { useState, useEffect } from 'react';
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { getUserContractTypesService } from "@services/user/ContractTypeService";
import { CONTRACT_FORM_HOOKS_LIST } from "@constants/ContractFormHooksConstants";
import { CONTRACT_COMPONENTS_LIST } from "@constants/ContractComponentsConstants";

export const useCreateContract = () => {
    // component state
    const menu = "contracts";
    const action = "create";
    
    // staps state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;
    
    // auth user state
    const sessionUserRole = sessionStorage.getItem("role")?.toLowerCase();
    const sessionUserId = sessionStorage.getItem("user_id");    
    
    // contracts state
    const [selectedContract, setSelectedContract] = useState(null);
    const ContractForm = CONTRACT_COMPONENTS_LIST[selectedContract];
    const ContractFormHook = CONTRACT_FORM_HOOKS_LIST[selectedContract];
    const [contractTypes, setContractTypes] = useState([]);

    console.log("ContractForm",ContractForm);
    console.log("selectedContract",selectedContract);

    const initializeStateHelper = async () => {
        try {
            const contractTypesData = await getUserContractTypesService(sessionUserId);
            setContractTypes(Array.isArray(contractTypesData)? contractTypesData : []);
        } catch(error){
            console.error("Error in initializing states:", error);
        }
    };
        
    useEffect(() => {
        initializeStateHelper();
        document.title = "Contracts | Quicklocum";
    }, []);
    
    return {
        menu,
        action,
        currentStep,
        setCurrentStep,
        totalSteps,
        sessionUserRole,
        sessionUserId,
        selectedContract,
        setSelectedContract,
        contractTypes,
        setContractTypes,
        ContractForm,
        ContractFormHook,
        CONTRACT_FORM_IDS_LIST
    }
};