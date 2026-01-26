import { API_BASE_URL } from "@config/apiConfig";
import React, { useEffect, useCallback } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpecialtyDentistryFormSchema } from "@schemas/institute/SpecialtyDentistryFormSchema";

import { createContractService, getContractByIdService, updateContractService } from "@services/admin/ContractService";
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";
import { useNavigate, useParams } from "react-router-dom";

export const useSpecialtyDentistryForm = () => {
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;
        
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");

    const SELECTED_CONTRACT_TYPE = CONTRACT_TYPE.SPECIALTY_DENTISTRY;
    const FORM_ID = CONTRACT_FORM_IDS_LIST[SELECTED_CONTRACT_TYPE];

    const { id: contractId } = useParams();
    const [contract, setContract] = React.useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(SpecialtyDentistryFormSchema),
        defaultValues: {
            position_title: "",
            required_specialty: "",
            mission_objective: "",
            start_date: "",
            end_date: "",
            estimated_duration: {
                start_hour: "",
                end_hour: "",
            },
            proposed_rate: "",
            equipment_room: "no",
            required_documents: "no",
        },
    });

    const handleFiles = (formData, data, payload, fileKeys = []) => {
        try {
            if (!fileKeys || fileKeys.length === 0) return;

            fileKeys.forEach((field) => {
                let file = null;
                if (data[field]?.length) file = data[field][0];
                if (isFile(file) || isFileList(file)) {
                    payload[field] = null;
                    formData.append(field, file);
                }
            });
        } catch (error) {
            console.error("Error in handle files:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = { ...data };
            let fileKeys = [];
            const formData = new FormData();
            
            // Helper function to handle file upload and append to form data
            handleFiles(formData, data, payload, fileKeys);
            
            payload['contract_type_id'] = sessionStorage.getItem('contract_type_id');
            payload['user_id'] = sessionStorage.getItem('selected_contract_user_id');

            formData.append("data", JSON.stringify(payload));
            console.log("Form data:", Object.fromEntries(formData.entries()));
            
            let success;
            
            if (contractId) {
                success = await updateContractService(contractId, formData);
            } else {
                success = await createContractService(formData);
            }

            if (!success) return;

            sessionStorage.removeItem('contract_type_id');
            sessionStorage.removeItem('selected_contract_user_id');

            reset()
            navigate(`/${sessionUserRole}/contracts`);
        } catch (error) {
            console.error("Error in onSubmit:", error);
        }
    };

    const initializeStateHelper = useCallback(async () => {
        try {
            const contractData = await getContractByIdService(contractId);
            if (!contractData || typeof contractData !== "object") return;
            reset({ ...contractData })
            setContract(contractData);
        } catch (error) {
            console.error("Error in initializeStateHelper:", error);
        }
    }, [contractId]); 
    
        
    useEffect(() => {
        if (contractId) initializeStateHelper();
    }, [contractId]);
    
    
    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        setValue,
        setError,
        reset,
        watch,
        contract,
        API_BASE_URL,
        FORM_ID
    };
};
