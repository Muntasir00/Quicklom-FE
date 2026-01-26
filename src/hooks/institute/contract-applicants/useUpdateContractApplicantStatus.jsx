import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateContractApplicantStatusService } from "@services/institute/ContractApplicantsService";

const UpdateContractApplicantStatusSchema = z.object({
    status: z.string().min(1, "Status is required"),
});

export const useUpdateContractApplicantStatus = (applicant, onSuccess) => {
    const sessionUserRole = sessionStorage.getItem("role");
    const FORM_ID = "update-contract-applicant-status-form";

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(UpdateContractApplicantStatusSchema),
        defaultValues: {
            status: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            if (!applicant?.id) return;
            
            const success = await updateContractApplicantStatusService({
                contractId: applicant.id,
                payload: data,
            });

            if (!success) return;
            reset();
            onSuccess?.();
        } catch (error) {
            console.error("Error updating applicant status:", error);
        }
    };

    const initializeStateHelper = useCallback(async () => {
        try {
            if (!applicant?.status) return;
            const applicantStatus = applicant.status
                ?.toString()
                ?.trim()
                ?.toLowerCase()
                ?.replace(/\s+/g, "_");
            reset({ status: applicantStatus ?? "" });
        } catch (error) {
            console.error("Error initializing applicant state:", error);
        }
    }, [applicant]);

    useEffect(() => {
        try {
            console.log("application data:", applicant);
            if (applicant?.status) {
                initializeStateHelper();
            }
        } catch (error) {
            console.error("Error in useEffect:", error);
        } 
    }, [applicant]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        setValue,
        setError,
        reset,
        FORM_ID,
    };
};
