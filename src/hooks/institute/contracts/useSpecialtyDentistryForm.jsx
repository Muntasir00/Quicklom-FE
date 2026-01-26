import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect, useCallback } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpecialtyDentistryFormSchema } from "@schemas/institute/SpecialtyDentistryFormSchema";

import { createContractService, getContractByIdService, updateContractService } from "@services/institute/ContractService";
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";
import { useNavigate, useParams } from "react-router-dom";

import { getProfessionalCategoriesService } from "@services/user/ProfessionalCategoryService";
import { getPositionSoughtsService } from "@services/user/PositionSoughtService";

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
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(SpecialtyDentistryFormSchema, {
            async: false,
            mode: 'sync',
        }),
        mode: 'onChange',
        defaultValues: {
            // Location fields
            facility_name: "",
            street_address: "",
            city: "",
            province: "",
            postal_code: "",
            country: "Canada",

            // Date fields
            selected_dates: "",
            start_date: "",
            end_date: "",

            // Specialty details
            position_title: "",
            required_specialty: "",
            mission_objective: "",

            // Duration and compensation
            estimated_duration: {
                start_hour: "",
                end_hour: "",
            },
            proposed_rate: "",
            rate_amount: "",

            // Additional requirements
            equipment_room: "no",
            required_documents: "no",

            // Position sought - fixed to Dental
            position_soughts: [
                {
                    professional_category_id: "",       // will be set to Dental ID
                    position_ids: []                    // array with single position (radio selection)
                }
            ],
        },
    });

    // position soughts state - only need one row since category is fixed
    const [positionRows, setPositionRows] = useState([{id: 1, name: ""}]);
    const [professionalCategories, setProfessionalCategories] = useState([]);
    const [positions, setPositions] = useState([]);

    const initLocalState = async () => {
        try {
            const professionalCategoriesData = await getProfessionalCategoriesService();
            const positionsData = await getPositionSoughtsService();

            setPositions(Array.isArray(positionsData) ? positionsData : []);
            setProfessionalCategories(Array.isArray(professionalCategoriesData) ? professionalCategoriesData : []);

            // Set default professional category to "Dental" or "Dentistry"
            const dentalCategory = professionalCategoriesData?.find(
                cat => cat.name === "Dental" ||
                       cat.name === "Dentistry" ||
                       cat.name === "Dental Care" ||
                       cat.name.toLowerCase().includes("dent")
            );
            if (dentalCategory) {
                setValue("position_soughts.0.professional_category_id", dentalCategory.id);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }

    useEffect(() => { initLocalState() }, []);

    const handleAddRow = () => {
        // Not needed for this form but keeping for compatibility
        const lastId = positionRows.length > 0 ? positionRows[positionRows.length - 1].id + 1 : 0;
        const newId =  lastId + 1;
        setPositionRows([...positionRows, {id: newId, name: ""}]);
    };

    const handleRemoveRow = (id) => {
        // Not needed for this form but keeping for compatibility
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
        console.log("=== FORM SUBMISSION START ===");
        console.log("Form data received:", data);
        console.log("Form errors:", errors);

        try {
            const payload = { ...data };
            let fileKeys = [];
            const formData = new FormData();

            console.log("Payload before processing:", payload);

            // Helper function to handle file upload and append to form data
            handleFiles(formData, data, payload, fileKeys);

            // Use existing contract_type_id when editing, or get from sessionStorage when creating
            if (contractId && contract) {
                payload['contract_type_id'] = contract.contract_type_id;
                console.log("Editing contract - contract_type_id:", payload['contract_type_id']);
            } else {
                payload['contract_type_id'] = sessionStorage.getItem('contract_type_id');
                console.log("Creating contract - contract_type_id:", payload['contract_type_id']);
            }

            formData.append("data", JSON.stringify(payload));
            console.log("FormData payload:", Object.fromEntries(formData.entries()));
            console.log("JSON payload:", JSON.stringify(payload, null, 2));

            let success;

            if (contractId) {
                console.log("Updating contract with ID:", contractId);
                success = await updateContractService(contractId, formData);
            } else {
                console.log("Creating new contract");
                success = await createContractService(formData);
            }

            console.log("Service response success:", success);

            if (!success) {
                console.error("Service returned false/failure");
                return;
            }

            sessionStorage.removeItem('contract_type_id');
            reset()
            navigate(`/${sessionUserRole}/contracts`);
            console.log("=== FORM SUBMISSION SUCCESS ===");
        } catch (error) {
            console.error("=== ERROR IN ONSUBMIT ===");
            console.error("Error:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
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

            setContract(contractData);

            // Reset form with the data from the JSON field, plus any top-level fields
            // Map compensation and attachment fields to ensure proper recovery
            setTimeout(() => {
                // Parse selected_dates properly
                let parsedSelectedDates = '';
                if (formData.selected_dates) {
                    if (typeof formData.selected_dates === 'string') {
                        // Already a string, use as is
                        parsedSelectedDates = formData.selected_dates;
                    } else if (Array.isArray(formData.selected_dates)) {
                        // Convert array to JSON string
                        parsedSelectedDates = JSON.stringify(formData.selected_dates);
                    }
                }

                reset({
                    ...formData,
                    // Map all possible compensation field names (dental forms use 'compensation')
                    compensation: formData.compensation || formData.gross_salary || formData.annual_salary || formData.compensation_value || '',
                    gross_salary: formData.gross_salary || formData.annual_salary || formData.compensation_value || formData.compensation || '',
                    hourly_rate: formData.hourly_rate || formData.hourlyRate || '',
                    daily_rate: formData.daily_rate || formData.dailyRate || formData.per_day || '',
                    service_rate: formData.service_rate || formData.serviceRate || '',
                    rate_amount: formData.rate_amount || '',
                    // Ensure selected_dates is always a JSON string for the schema
                    selected_dates: parsedSelectedDates,
                    // Note: File attachments cannot be pre-loaded into file input for security reasons
                    // Existing attachments are stored in contract.data and can be displayed separately
                    attachments: null, // Keep as null for file input
                    additional_info: formData.additional_info || '',
                    // Date fields from top level
                    start_date: contractData.start_date ? new Date(contractData.start_date).toISOString().split('T')[0] : '',
                    end_date: contractData.end_date ? new Date(contractData.end_date).toISOString().split('T')[0] : '',
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