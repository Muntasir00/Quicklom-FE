import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect, useCallback } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NursingTemporaryFormSchema } from "@schemas/institute/NursingTemporaryFormSchema";

import { createContractService, getContractByIdService, updateContractService } from "@services/institute/ContractService";
import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";
import { useNavigate, useParams } from "react-router-dom";

import { getProfessionalCategoriesService } from "@services/user/ProfessionalCategoryService";
import { getPositionSoughtsService } from "@services/user/PositionSoughtService";


export const useNursingTemporaryForm = () => {
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;
        
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");

    const SELECTED_CONTRACT_TYPE = CONTRACT_TYPE.NURSING_TEMPORARY;
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
        resolver: zodResolver(NursingTemporaryFormSchema),
        defaultValues: {
            // Address fields (replacing province and facility)
            facility_name: "",
            street_address: "",
            city: "",
            province: "",
            postal_code: "",
            country: "",

            // Date selection (replacing start_date and end_date)
            selected_dates: "",

            shifts: [],
            required_domain: [],
            software_skills: [],
            minimum_experience: "",
            languages: [],
            hourly_rate: "",
            payment_method: "",
            travel_costs: "no",
            required_license: false,
            compliance: {
                vaccination: false,
                criminal_record: false,
                mandatory_training: false,
            },
            position_soughts: [
                {
                    professional_category_id: "",       // will be set to "Nursing and Home Care" ID
                    position_id: ""                     // single position ID (string or number)
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

            // Set default professional category to "Nursing and Home Care"
            const nursingCategory = professionalCategoriesData?.find(cat => cat.name === "Nursing and Home Care");
            if (nursingCategory) {
                setValue("position_soughts.0.professional_category_id", nursingCategory.id);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }

    useEffect(() => { initLocalState() }, []);

    const handleAddRow = () => {
        // Not needed anymore since we only have one category
        // Keeping for potential future use or backward compatibility
        const lastId = positionRows.length > 0 ? positionRows[positionRows.length - 1].id + 1 : 0;
        const newId =  lastId + 1;
        setPositionRows([...positionRows, {id: newId, name: ""}]);
    };

    const handleRemoveRow = (id) => {
        // Not needed anymore since we only have one category
        // Keeping for potential future use or backward compatibility
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

            // Convert position_id (single) to position_ids (array) for backend compatibility
            if (payload.position_soughts && Array.isArray(payload.position_soughts)) {
                payload.position_soughts = payload.position_soughts.map(ps => {
                    if (ps.position_id && !ps.position_ids) {
                        return {
                            ...ps,
                            position_ids: [ps.position_id], // Convert single ID to array
                            position_id: undefined // Remove singular field
                        };
                    }
                    return ps;
                });
            }

            // Use existing contract_type_id when editing, or get from sessionStorage when creating
            if (contractId && contract) {
                payload['contract_type_id'] = contract.contract_type_id;
            } else {
                payload['contract_type_id'] = sessionStorage.getItem('contract_type_id');
            }

            formData.append("data", JSON.stringify(payload));
            console.log("📤 Nursing Temporary - Submitting form data:", Object.fromEntries(formData.entries()));
            console.log("📋 Position soughts being submitted:", payload.position_soughts);

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

            console.log("📋 Merged contract data (Nursing Temporary):", mergedContract);
            setContract(mergedContract);

            // Handle position_soughts conversion from old format (position_ids array) to new format (position_id single value)
            let processedPositionSoughts = formData.position_soughts;
            if (Array.isArray(formData.position_soughts) && formData.position_soughts.length > 0) {
                processedPositionSoughts = formData.position_soughts.map(ps => {
                    // If position_ids exists (old format), convert to position_id (new format)
                    if (ps.position_ids && Array.isArray(ps.position_ids) && ps.position_ids.length > 0) {
                        return {
                            ...ps,
                            position_id: ps.position_ids[0], // Take first position from array
                            position_ids: undefined // Remove old field
                        };
                    }
                    return ps;
                });
            }

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
                    // Use date fields from formData (contract.data) if available, otherwise fall back to top level
                    start_date: formData.start_date || (contractData.start_date ? new Date(contractData.start_date).toISOString().split('T')[0] : ''),
                    end_date: formData.end_date || (contractData.end_date ? new Date(contractData.end_date).toISOString().split('T')[0] : ''),
                    // Use processed position_soughts with position_id
                    position_soughts: processedPositionSoughts || formData.position_soughts,
                });
                console.log("📅 Nursing Temporary form reset with dates and position:", {
                    start_date: formData.start_date || contractData.start_date,
                    end_date: formData.end_date || contractData.end_date,
                    selected_dates: formData.selected_dates,
                    position_soughts: processedPositionSoughts
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