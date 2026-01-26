import React from "react";
import {
    Box,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormHelperText,
    Typography,
    Card,
    CardContent,
} from "@mui/material";
import { useContractForm } from "@hooks/admin/contracts/useContractForm";
import { cleanContractName } from "@utils/StringUtils";

const Form = ({ setSelectedContract, setCurrentStep, contractTypes }) => {
    const {
        register,
        handleSubmit,
        errors,
        onSubmit,
        contractId,
        FORM_ID,
    } = useContractForm({
        setSelectedContract,
        contractTypes,
        setCurrentStep
    });

    return (
        <Box component="form" id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
            <FormControl component="fieldset" error={!!errors?.contract_category} fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
                    Contract Types <span style={{ color: '#ef4444' }}>*</span>
                </FormLabel>
                {contractTypes && Array.isArray(contractTypes) && contractTypes.length > 0 ? (
                    <RadioGroup>
                        {contractTypes.map((type) => (
                            <Card
                                key={type?.id}
                                sx={{
                                    mb: 1.5,
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: '#3b82f6',
                                        backgroundColor: '#f8fafc',
                                    },
                                }}
                            >
                                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                    <FormControlLabel
                                        value={cleanContractName(type?.contract_name ?? "")}
                                        control={
                                            <Radio
                                                {...register("contract_category")}
                                                value={cleanContractName(type?.contract_name ?? "")}
                                                sx={{
                                                    color: '#94a3b8',
                                                    '&.Mui-checked': { color: '#3b82f6' },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography fontWeight={500} color="#334155">
                                                {type?.contract_name ?? ""}
                                            </Typography>
                                        }
                                        sx={{ m: 0, width: '100%' }}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </RadioGroup>
                ) : (
                    <Typography color="error" sx={{ py: 2 }}>
                        No contracts found. Please contact admin or update your profile.
                    </Typography>
                )}
                {errors?.contract_category && (
                    <FormHelperText sx={{ mt: 1, fontSize: '0.875rem' }}>
                        {errors?.contract_category?.message}
                    </FormHelperText>
                )}
            </FormControl>
        </Box>
    );
};

export default Form;
