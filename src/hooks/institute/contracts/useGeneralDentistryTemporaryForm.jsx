import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect, useCallback } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralDentistryTemporaryFormSchema } from "@schemas/institute/GeneralDentistryTemporaryFormSchema";

import { createContractService, getContractByIdService, updateContractService } from "@services/institute/ContractService";
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";
import { useNavigate, useParams } from "react-router-dom";

import { getProfessionalCategoriesService } from "@services/user/ProfessionalCategoryService";
import { getPositionSoughtsService } from "@services/user/PositionSoughtService";

export const useGeneralDentistryTemporaryForm = () => {
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;

    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");

    const SELECTED_CONTRACT_TYPE = CONTRACT_TYPE.GENERAL_DENTISTRY_TEMPORARY;
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
        resolver: zodResolver(GeneralDentistryTemporaryFormSchema),
        defaultValues: {
            position_sought: "",
            contract_location: "",
            start_date: "",
            end_date: "",
            work_schedule: "",
            break_included: "no",
            break_duration: "",
            required_experience: "",
            compensation_mode: "perDay",
            daily_rate: "",
            hourly_rate: "",
            bonus_incentives: "no",
            fees: "",
            parking: "",
            //languages: "",
            //software: "",
            languages: [],
            software: [],
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
                // Check if the field has a file
                const value = data[field];

                // Handle File object directly (from setValue)
                if (isFile(value)) {
                    formData.append(field, value);
                    // Don't set to null - keep it undefined so backend knows to handle the file
                    delete payload[field];
                }
                // Handle FileList (from input with multiple files)
                else if (isFileList(value) && value.length > 0) {
                    formData.append(field, value[0]);
                    delete payload[field];
                }
                // Handle array of files
                else if (Array.isArray(value) && value.length > 0 && isFile(value[0])) {
                    formData.append(field, value[0]);
                    delete payload[field];
                }
                // If it's a string (existing file path from edit), keep it in payload
                else if (typeof value === 'string' && value) {
                    // Keep the existing path in payload
                    payload[field] = value;
                }
                // Otherwise, no file - remove from payload
                else {
                    delete payload[field];
                }
            });
        } catch (error) {
            console.error("Error in handle files:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            console.log("=== FORM SUBMISSION DEBUG ===");
            console.log("contractId:", contractId);
            console.log("contract state:", contract);
            console.log("Raw data received:", data);
            console.log("Attachments value:", data.attachments);
            console.log("Attachments type:", typeof data.attachments);
            console.log("Is File?:", data.attachments instanceof File);
            console.log("Additional info:", data.additional_info);

            const payload = { ...data };
            let fileKeys = ["attachments"];
            const formData = new FormData();

            // Helper function to handle file upload and append to form data
            handleFiles(formData, data, payload, fileKeys);

            // Use existing contract_type_id when editing, or get from sessionStorage when creating
            if (contractId && contract) {
                payload['contract_type_id'] = contract.contract_type_id;
                console.log("Using contract.contract_type_id:", contract.contract_type_id);
            } else {
                payload['contract_type_id'] = sessionStorage.getItem('contract_type_id');
                console.log("Using sessionStorage contract_type_id:", payload['contract_type_id']);
            }

            formData.append("data", JSON.stringify(payload));

            console.log("=== FORMDATA CONTENTS ===");
            console.log("Payload being sent:", payload);
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(key, "File:", value.name, value.size, "bytes");
                } else {
                    console.log(key, value);
                }
            }
            console.log("============================");

            let success;

            if (contractId) {
                console.log("Calling updateContractService with contractId:", contractId);
                success = await updateContractService(contractId, formData);
                console.log("Update result:", success);
            } else {
                console.log("Calling createContractService");
                success = await createContractService(formData);
                console.log("Create result:", success);
            }

            console.log("Success value:", success);
            if (!success) {
                console.log("Success check failed, returning early");
                return;
            }

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

            setContract(contractData);

            // Reset form with the data from the JSON field, plus any top-level fields
            // Map compensation and attachment fields to ensure proper recovery
            setTimeout(() => {
                // Handle date fields - need to sync selected_dates with start_date/end_date
                let startDate = '';
                let endDate = '';
                let selectedDates = formData.selected_dates;

                // If selected_dates exists in formData, derive start/end from it
                if (selectedDates) {
                    try {
                        const datesArray = typeof selectedDates === 'string'
                            ? JSON.parse(selectedDates)
                            : selectedDates;

                        if (Array.isArray(datesArray) && datesArray.length > 0) {
                            // Extract just the date strings
                            const dates = datesArray.map(item =>
                                typeof item === 'object' ? item.date : item
                            ).sort();

                            startDate = dates[0];
                            endDate = dates[dates.length - 1];
                        }
                    } catch (e) {
                        console.error("Error parsing selected_dates:", e);
                    }
                }

                // Fallback to top-level dates if selected_dates not available
                if (!startDate && contractData.start_date) {
                    startDate = new Date(contractData.start_date).toISOString().split('T')[0];
                }
                if (!endDate && contractData.end_date) {
                    endDate = new Date(contractData.end_date).toISOString().split('T')[0];
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
                    // Note: File attachments cannot be pre-loaded into file input for security reasons
                    // Existing attachments are stored in contract.data and can be displayed separately
                    attachments: null, // Keep as null for file input
                    additional_info: formData.additional_info || '',
                    // Date fields - synchronized with selected_dates
                    start_date: startDate,
                    end_date: endDate,
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