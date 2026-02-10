import {API_BASE_URL} from "@config/apiConfig";
import React, {useState, useEffect, useCallback} from "react";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {permanentStaffingDentalFormSchema} from "@schemas/institute/PermanentStaffingDentalFormSchema";
import {
    createContractService,
    getContractByIdService,
    updateContractService
} from "@services/institute/ContractService";
import {useNavigate, useParams} from "react-router-dom";

import {getProfessionalCategoriesService} from "@services/user/ProfessionalCategoryService";
import {getPositionSoughtsService} from "@services/user/PositionSoughtService";

export const usePermanentStaffingDentalForm = () => {
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;

    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const formId = "permanent-staffing-dental-form";

    const {id: contractId} = useParams();
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
        formState: {errors},
    } = useForm({
        resolver: zodResolver(permanentStaffingDentalFormSchema),
        defaultValues: {
            // Location fields
            facility_name: "",
            street_address: "",
            city: "",
            province: "",
            postal_code: "",
            country: "",

            // Contract details
            start_date: "",
            required_experience: "",
            working_shifts: [],
            job_description: "",

            // Compensation
            compensation_mode: "",
            hourly_rate: "",
            annual_salary: "",
            production_percentage: "",
            other_compensation: "",
            benefits: [],
            additional_bonus: "no",
            urgent_need: false,

            // Attachments
            attachments: null,

            // Position sought - fixed to Dental
            position_soughts: [
                {
                    professional_category_id: "",       // will be set to Dental/Dentistry ID
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

            // Set default professional category to "Dental" or "Dentistry" or "Dental Care"
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

    useEffect(() => {
        initLocalState()
    }, []);

    const handleAddRow = () => {
        // Not needed for this form but keeping for compatibility
        const lastId = positionRows.length > 0 ? positionRows[positionRows.length - 1].id + 1 : 0;
        const newId = lastId + 1;
        setPositionRows([...positionRows, {id: newId, name: ""}]);
    };

    const handleRemoveRow = (id) => {
        // Not needed for this form but keeping for compatibility
        const filteredRows = positionRows.filter(row => row.id !== id);
        setPositionRows(filteredRows);

        // Also remove from form state
        const currentPositions = getValues("position_soughts");
        const updated = currentPositions.filter((_, index) => index !== id - 1);
        setValue("position_soughts", updated);
    };

    // const handleFiles = (formData, data, payload, fileKeys = []) => {
    //     try {
    //         if (!fileKeys || fileKeys.length === 0) return;
    //
    //         fileKeys.forEach((field) => {
    //             let file = null;
    //             if (data[field]?.length) file = data[field][0];
    //             if (isFile(file) || isFileList(file)) {
    //                 payload[field] = null;
    //                 formData.append(field, file);
    //             }
    //         });
    //     } catch (error) {
    //         console.error("Error in handle files:", error);
    //     }
    // };

    const handleFiles = (formData, data, payload, fileKeys = []) => {
        if (!Array.isArray(fileKeys) || fileKeys.length === 0) return;

        fileKeys.forEach((field) => {
            const value = data?.[field];

            // Only handle if it's FileList from <input type="file">
            if (value instanceof FileList && value.length > 0) {
                const file = value[0];

                if (file instanceof File || file instanceof Blob) {
                    // Remove from JSON payload since file is sent via multipart
                    delete payload[field];
                    formData.append(field, file);
                }
            }
        });
    };


    const onSubmit = async (data) => {
        try {
            console.log("=== SUBMIT STARTED ===");
            // console.log("contractId:", contractId);
            // console.log("contract state:", contract);
            console.log("form data:", data);

            const payload = {...data};
            let fileKeys = ["attachments"];
            console.log(payload, fileKeys)
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
            console.log("Payload to send:", payload);
            console.log("Form data:", Object.fromEntries(formData.entries()));

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
            console.log("=== INITIALIZING PERMANENT DENTAL FORM ===");
            console.log("formData from DB:", formData);
            console.log("compensation_mode:", formData.compensation_mode);
            console.log("annual_salary:", formData.annual_salary);
            console.log("hourly_rate:", formData.hourly_rate);
            console.log("working_shifts:", formData.working_shifts);

            setTimeout(() => {
                const resetData = {
                    ...formData,
                    // Map all compensation field variants for this form
                    // This form uses: annual_salary, hourly_rate, production_percentage, other_compensation
                    annual_salary: formData.annual_salary || formData.gross_salary || formData.compensation || formData.compensation_value || '',
                    hourly_rate: formData.hourly_rate || formData.hourlyRate || '',
                    production_percentage: formData.production_percentage || formData.productionPercentage || '',
                    other_compensation: formData.other_compensation || formData.otherCompensation || '',
                    // Keep these for backwards compatibility with other forms
                    gross_salary: formData.gross_salary || formData.annual_salary || formData.compensation_value || formData.compensation || '',
                    compensation: formData.compensation || formData.gross_salary || formData.annual_salary || formData.compensation_value || '',
                    daily_rate: formData.daily_rate || formData.dailyRate || formData.per_day || '',
                    service_rate: formData.service_rate || formData.serviceRate || '',
                    rate_amount: formData.rate_amount || '',
                    // Preserve existing attachment path (string) - file inputs accept strings for existing files
                    // If user uploads a new file, it will overwrite this with FileList
                    attachments: formData.attachments || null,
                    additional_info: formData.additional_info || '',
                    // Date fields from top level
                    start_date: contractData.start_date ? new Date(contractData.start_date).toISOString().split('T')[0] : '',
                    end_date: contractData.end_date ? new Date(contractData.end_date).toISOString().split('T')[0] : '',
                };

                console.log("=== RESETTING FORM WITH DATA ===");
                console.log("resetData.compensation_mode:", resetData.compensation_mode);
                console.log("resetData.annual_salary:", resetData.annual_salary);
                console.log("resetData.hourly_rate:", resetData.hourly_rate);
                console.log("Full resetData:", resetData);

                reset(resetData);

                console.log("=== AFTER RESET ===");
                console.log("Form values after reset:", getValues());
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
        formId,
        positionRows,               // position
        handleAddRow,               // position
        handleRemoveRow,            // position
        watch,                      // position
        professionalCategories,     // position
        positions,                  // position
    };
};