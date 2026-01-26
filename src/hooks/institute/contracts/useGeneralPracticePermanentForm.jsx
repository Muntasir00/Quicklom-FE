import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect, useCallback } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralPracticePermanentFormSchema } from "@schemas/institute/GeneralPracticePermanentFormSchema";

import { createContractService, getContractByIdService, updateContractService } from "@services/institute/ContractService";
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";
import { useNavigate, useParams } from "react-router-dom";

import { getProfessionalCategoriesService } from "@services/user/ProfessionalCategoryService";
import { getPositionSoughtsService } from "@services/user/PositionSoughtService";


export const useGeneralPracticePermanentForm = () => {
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;
        
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");

    const SELECTED_CONTRACT_TYPE = CONTRACT_TYPE.GENERAL_PRACTICE_PERMANENT;
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
        resolver: zodResolver(GeneralPracticePermanentFormSchema),
        defaultValues: {
            contract_type: "",
            job_title: "General Practitioner",
            province: "",
            facility: "",
            start_date: "",
            end_date: "",
            weekly_schedule: "",
            required_skills: [],
            software_skills: [],
            minimum_experience: "",
            languages: [],
            gross_salary: "",
            payment_method: "",
            benefits: [],
            travel_costs: "no",
            required_license: false,
            compliance: {
                vaccination: false,
                criminal_record: false,
                confidentiality: false,
            },
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
            let fileKeys = [];
            const formData = new FormData();
            
            // Helper function to handle file upload and append to form data
            handleFiles(formData, data, payload, fileKeys);

            // Use existing contract_type_id when editing, or get from sessionStorage when creating
            if (contractId && contract) {
                payload['contract_type_id'] = contract.contract_type_id;
            } else {
                payload['contract_type_id'] = sessionStorage.getItem('contract_type_id');
            }

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

            // Extract form data from the 'data' JSON field
            const formData = contractData.data || {};

            // Handle position_soughts if it exists in the data
            if (Array.isArray(formData?.position_soughts) && formData.position_soughts.length > 0) {
                setPositionRows(formData.position_soughts.map((cat, index) => ({ id: index + 1, name: "" })));
            }

            // Merge the data object into the contract so the form can access fields directly
            const mergedContract = {
                ...contractData,
                ...formData
            };

            console.log("📋 Merged contract data (Permanent):", mergedContract);

            setContract(mergedContract);

            // Reset form with the data from the JSON field, plus any top-level fields
            // Map compensation fields to ensure proper recovery
            setTimeout(() => {
                reset({
                    ...formData,
                    // Map all possible compensation field names
                    gross_salary: formData.gross_salary || formData.annual_salary || formData.compensation_value || '',
                    hourly_rate: formData.hourly_rate || formData.hourlyRate || '',
                    daily_rate: formData.daily_rate || formData.dailyRate || formData.per_day || '',
                    service_rate: formData.service_rate || formData.serviceRate || '',
                    rate_amount: formData.rate_amount || '',
                    // Use date fields from formData (contract.data) if available, otherwise fall back to top level
                    start_date: formData.start_date || (contractData.start_date ? new Date(contractData.start_date).toISOString().split('T')[0] : ''),
                    end_date: formData.end_date || (contractData.end_date ? new Date(contractData.end_date).toISOString().split('T')[0] : ''),
                });
                console.log("💰 Payment field values:", {
                    payment_method: formData.payment_method,
                    gross_salary: formData.gross_salary || formData.annual_salary || formData.compensation_value
                });
            }, 100);

        } catch (error) {
            console.error("Error in initializeStateHelper:", error);
        }
    }, [contractId, reset]); 

    
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
