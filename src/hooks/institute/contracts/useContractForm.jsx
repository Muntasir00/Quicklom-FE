import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cleanContractName } from "@utils/StringUtils";
import { getContractTypeName } from "@services/institute/ContractService";
import { useParams } from "react-router-dom";

const ContractFormSchema = z.object({
    contract_category: z.string().min(1, "Contract category is required"),
});

export const useContractForm = ({ setSelectedContract, contractTypes, setCurrentStep }) => {
    const { id: contractId } = useParams();
    const FORM_ID = "form-1";

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ContractFormSchema),
        defaultValues: {
            contract_category: "",
        },
    });

    const selectedContract = watch("contract_category");

    useEffect(() => {
        if (selectedContract) setSelectedContract(selectedContract);
    }, [selectedContract, setSelectedContract]);

    
    const initializeStateHelper = useCallback(async () => {
        try {
            const contractTypeNameData = await getContractTypeName(contractId);
            reset({
                contract_category: contractTypeNameData?.contract_type_name
                    ? cleanContractName(contractTypeNameData.contract_type_name)
                    : null,
            });
        } catch (error) {
            console.error("Error fetching contract type name:", error);
        }
    }, [contractId, reset]);

    useEffect(() => {
        if (contractId) initializeStateHelper();
    }, [contractId, initializeStateHelper]);

    const onSubmit = (data) => {
        try {
            console.log("Form Data:", data);
            sessionStorage.removeItem("contract_type_id");

            const contract_type_id = (contractTypes ?? []).find(
                (contract) => cleanContractName(contract.contract_name) === selectedContract
            )?.id;

            sessionStorage.setItem("contract_type_id", contract_type_id);
            setCurrentStep((prev) => prev + 1);
            console.log(`Selected Category: ${data.contract_category}`);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return {
        register,
        handleSubmit,
        watch,
        errors,
        onSubmit,
        contractId,
        contractTypes,
        FORM_ID,
    };
};
