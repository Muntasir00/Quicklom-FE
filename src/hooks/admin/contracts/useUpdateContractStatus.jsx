import React, { useState, useEffect, useCallback } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateContractStatusService } from "@services/admin/ContractService"

const UpdateContractStatusSchema = z.object({
    status: z.string().min(1, "Status is required"),
});

export const useUpdateContractStatus = (contract, onSuccess) => {
    const sessionUserRole = sessionStorage.getItem("role");
    const FORM_ID = "update-contract-status-form";

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(UpdateContractStatusSchema),
        defaultValues: {
            status: "",  
        },
    });
    
    const onSubmit = async (data) => {
        try {
            if (!contract?.id) return;
            const success = await updateContractStatusService({contractId: contract?.id, payload: data});
            if (!success) return;
            reset();
            onSuccess?.(); 
        } catch (error) {
            console.error("Error in onSubmit:", error);
        }
    };

    const initializeStateHelper = useCallback(async () => {
        try {
            if (!contract?.status) return;
            const contractStatus = contract?.status?.toString()?.trim()?.toLowerCase()?.replace(/\s+/g, "_");
            reset({ status: contractStatus ?? "" });
        } catch (error) {
            console.error("Error in initializeStateHelper:", error);
        }
    }, [contract]);
    
    useEffect(() => {
        if (contract?.status) initializeStateHelper();
    }, [contract]);
    
    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        setValue,
        setError,
        reset,
        watch,
        FORM_ID
    };
};