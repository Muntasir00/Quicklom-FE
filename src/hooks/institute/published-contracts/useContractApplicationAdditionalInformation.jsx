import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContractApplicationAdditionalInformationFormSchema } from "@schemas/institute/ContractApplicationAdditionalInformationFormSchema";
import { applyToContractService } from "@services/institute/PublishedContractService";

export const useContractApplicationAdditionalInformation = (contractId, setShow) => {
    const FORM_ID = "contract-application-additional-information-form";
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;

    const {
        register,
        handleSubmit,
        control,
        setValue,
        setError,
        reset,
        watch,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ContractApplicationAdditionalInformationFormSchema),
        defaultValues: {
            candidates: [
                {
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    primary_role: "",
                    dob: "",
                    gender: "",
                    languages: [],
                    province: "",
                    city: "",
                    address: "",
                    postal_code: "",
                    id_upload: "",
                    license_number: "",
                    experience: "",
                }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "candidates"
    });

    const addCandidate = () => {
        append({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            primary_role: "",
            dob: "",
            gender: "",
            languages: [],
            province: "",
            city: "",
            address: "",
            postal_code: "",
            id_upload: "",
            license_number: "",
            experience: "",
        });
    };

    const removeCandidate = (index) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const updateCandidate = (index, field, value) => {
        setValue(`candidates.${index}.${field}`, value);
    };

    const handleFiles = (formData, data) => {
        try {
            data.candidates.forEach((candidate, index) => {
                if (candidate.id_upload) {
                    const file = candidate.id_upload[0];
                    if (isFile(file) || isFileList(file)) {
                        formData.append(`candidate_${index}_id_upload`, file);
                    }
                }
            });
        } catch (error) {
            console.error("Error in handle files:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            // Process candidates data and remove file references from JSON
            const processedCandidates = data.candidates.map((candidate, index) => {
                const { id_upload, ...candidateData } = candidate;
                return candidateData;
            });

            // Append all files
            handleFiles(formData, data);

            // Append processed candidate data
            formData.append("data", JSON.stringify({ candidates: processedCandidates }));

            console.log("Form data:", {
                candidates: processedCandidates,
                files: data.candidates.map((c, i) => ({ index: i, hasFile: !!c.id_upload?.[0] }))
            });

            const status = await applyToContractService({ contractId: contractId, payload: formData });
            if (status) {
                reset();
                setShow(false);
                // Refresh the page to show updated application status
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            console.error("Error in onSubmit:", error);
        }
    };

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        setValue,
        setError,
        reset,
        FORM_ID,
        candidates: fields,
        addCandidate,
        removeCandidate,
        updateCandidate,
    };
};