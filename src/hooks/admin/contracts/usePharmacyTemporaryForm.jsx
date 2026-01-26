import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect, useCallback } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PharmacyTemporaryFormSchema } from "@schemas/institute/PharmacyTemporaryFormSchema";

import { createContractService, getContractByIdService, updateContractService } from "@services/admin/ContractService";
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";
import { useNavigate, useParams } from "react-router-dom";

import { getProfessionalCategoriesService } from "@services/admin/ProfessionalCategoryService";
import { getPositionSoughtsService } from "@services/admin/PositionSoughtService";

export const usePharmacyTemporaryForm = () => {
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;
        
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");

    const SELECTED_CONTRACT_TYPE = CONTRACT_TYPE.PHARMACY_TEMPORARY;
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
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(PharmacyTemporaryFormSchema),
        defaultValues: {
            //position_sought: "",
            contract_location: "",
            start_date: "",
            end_date: "",
            work_schedule: "",
            break_included: "no", 
            required_experience: "",
            compensation_mode: "perDay", 
            daily_rate: "",
            hourly_rate: "",
            bonus_incentives: "no", 
            fees: "",
            parking: "",
            languages: "",
            software: "",
            detailed_job_description: "",
            additional_info: "",
            attachments: null,
            position_soughts: [
                {
                    professional_category_id: "",       // string or naumber
                    position_ids: []                    // array of strings/numbers
                }
            ],
        },
    });

    // position soughts state
    const [positionRows, setPositionRows] = useState([{id: 1, name: ""}]);
    const [professionalCategories, setProfessionalCategories] = useState([]);
    const [positions, setPositions] = useState([]);

    const initLocalState = async () => {
        try {
            const professionalCategoriesData = await getProfessionalCategoriesService();
            const positionsData = await getPositionSoughtsService();

            setPositions(Array.isArray(positionsData) ? positionsData : []);
            setProfessionalCategories(Array.isArray(professionalCategoriesData) ? professionalCategoriesData : []);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }

    useEffect(() => { initLocalState() }, []);

    const handleAddRow = () => {
        const lastId = positionRows.length > 0 ? positionRows[positionRows.length - 1].id + 1 : 0;
        const newId =  lastId + 1;
        setPositionRows([...positionRows, {id: newId, name: ""}]);
    };

    const handleRemoveRow = (id) => {
        const filteredRows = positionRows.filter(row => row.id!== id);
        setPositionRows(filteredRows);

        // Also remove from form state
        const currentPositions = getValues("position_soughts");
        const updated = currentPositions.filter((_, index) => index !== id - 1);
        setValue("position_soughts", updated);
    };
    
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
            let fileKeys = ["attachments"];
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
            
            if (!Array.isArray(contractData?.position_soughts) || contractData?.position_soughts?.length === 0) return;
            setPositionRows(contractData?.position_soughts?.map((cat, index) => ({ id: index + 1, name: "" }))); 

            // temporally fix, not optimal solution
            if (contractData && typeof contractData === "object") {
                setTimeout(() => {
                    reset({ ...contractData });
                    setContract(contractData);
                }, 100);
            }

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
        contract,
        API_BASE_URL,
        FORM_ID,
        positionRows,               // position
        handleAddRow,               // position
        handleRemoveRow,            // position
        watch,                      // position
        professionalCategories,     // position
        positions,                  // position
    };
};