import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect, useCallback } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PermanentStaffingPharmacyFormSchema } from "@schemas/institute/PermanentStaffingPharmacyFormSchema";
import { createContractService, getContractByIdService, updateContractService } from "@services/institute/ContractService";
import { useNavigate, useParams } from "react-router-dom";

import { getProfessionalCategoriesService } from "@services/user/ProfessionalCategoryService";
import { getPositionSoughtsService } from "@services/user/PositionSoughtService";

export const usePermanentStaffingPharmacyForm = () => {
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;
        
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const formId = "permanent-staffing-pharmacy-form";

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
        resolver: zodResolver(PermanentStaffingPharmacyFormSchema),
        defaultValues: {
            // Location fields
            facility_name: "",
            street_address: "",
            city: "",
            province: "",
            postal_code: "",
            country: "Canada",

            // Contract details
            start_date: "",
            required_experience: "",
            job_description: "",

            // Compensation
            compensation: "",
            benefits: [],
            additional_bonus: "no",
            fees: "",
            urgent_need: false,

            // Attachments
            attachments: null,

            // Position sought - fixed to Pharmacy
            position_soughts: [
                {
                    professional_category_id: "",       // will be set to Pharmacy ID
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

            // Set default professional category to "Pharmacy"
            const pharmacyCategory = professionalCategoriesData?.find(
                cat => cat.name === "Pharmacy" || cat.name.toLowerCase().includes("pharm")
            );
            if (pharmacyCategory) {
                setValue("position_soughts.0.professional_category_id", pharmacyCategory.id);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }

    useEffect(() => { initLocalState() }, []);

    // Debug: Log validation errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.error("❌ VALIDATION ERRORS:", errors);
            console.error("❌ Form Values:", getValues());
        }
    }, [errors]);

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
        try {
            console.log("🔍 FORM VALIDATION PASSED - Submitting data:", data);
            console.log("🔍 Form Errors:", errors);

            const payload = { ...data };

            // Ensure only 1 position_sought for Pharmacy contracts
            if (Array.isArray(payload.position_soughts) && payload.position_soughts.length > 1) {
                payload.position_soughts = [payload.position_soughts[0]];
                console.log("🔧 Cleaned position_soughts to only first item:", payload.position_soughts);
            }
            let fileKeys = ["attachments"];
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

            // Handle position_soughts if it exists in the data - ONLY USE FIRST ONE for Pharmacy
            if (Array.isArray(formData?.position_soughts) && formData.position_soughts.length > 0) {
                // Only keep the first position_sought for Pharmacy contracts
                formData.position_soughts = [formData.position_soughts[0]];
                setPositionRows([{id: 1, name: ""}]);
            }

            setContract(contractData);

            // Reset form with the data from the JSON field, plus any top-level fields
            // Map compensation and attachment fields to ensure proper recovery
            setTimeout(() => {
                reset({
                    ...formData,
                    // Map all possible compensation field names
                    gross_salary: formData.gross_salary || formData.annual_salary || formData.compensation_value || '',
                    hourly_rate: formData.hourly_rate || formData.hourlyRate || '',
                    daily_rate: formData.daily_rate || formData.dailyRate || formData.per_day || '',
                    service_rate: formData.service_rate || formData.serviceRate || '',
                    rate_amount: formData.rate_amount || '',
                    // Attachment fields
                    attachments: formData.attachments || [],
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

    // Add onError handler for debugging
    const onError = (errors) => {
        console.error("❌ FORM SUBMISSION FAILED - Validation Errors:", errors);
        console.error("❌ Current Form Values:", getValues());
    };

    return {
        register,
        handleSubmit,
        onSubmit,
        onError,
        errors,
        setValue,
        setError,
        reset,
        contract,
        API_BASE_URL,
        formId,
        positionRows,               // position
        handleAddRow,               // position
        handleRemoveRow,            // position
        watch,                      // position
        professionalCategories,     // position
        positions,                  // position
    };
};