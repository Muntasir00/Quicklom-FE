import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"
import {
    Box,
    Card,
    CardContent,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForward";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Form from './Form';
import PageHeader from "@components/admin/PageHeader";
import { useCreateContract } from "@hooks/admin/contracts/useCreateContract";
import DataGridComponent from "@components/tables/DataGridComponent";
import Swal from "sweetalert2";

const Create = () => {
   const { 
        menu, 
        action, 
        currentStep, 
        setCurrentStep, 
        totalSteps, 
        sessionUserRole, 
        sessionUserId, 
        selectedContract, 
        setSelectedContract, 
        contractTypes, 
        setContractTypes, 
        ContractForm,
        ContractFormHook,
        CONTRACT_FORM_IDS_LIST,
        columns,
        users, 
    } = useCreateContract();       

    const steps = ['Select User', 'Select Contract Type', 'Fill Contract Details'];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Create Contract"
                subtitle="Create a new contract"
                icon={<AssignmentIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${sessionUserRole}/dashboard` },
                    { label: 'Contracts', path: `/${sessionUserRole}/contracts` },
                    { label: 'Create' },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                        <Stepper activeStep={currentStep - 1} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                        {currentStep === 1 && (
                            <DataGridComponent
                                rows={users}
                                columns={columns}
                            />
                        )}
                        {currentStep === 2 && (
                            <Form setSelectedContract={setSelectedContract} setCurrentStep={setCurrentStep} contractTypes={contractTypes} />
                        )}
                        {currentStep === 3 && (
                            ContractForm ? <ContractForm ContractFormHook={ContractFormHook} /> : <Typography color="text.secondary">No contract form found</Typography>
                        )}
                    </CardContent>

                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: '0 0 16px 16px',
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
                            disabled={currentStep <= 1}
                            onClick={() => {
                                if (currentStep <= 1) return;
                                setCurrentStep((prev) => prev - 1)
                            }}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                '&:hover': {
                                    borderColor: '#cbd5e1',
                                    backgroundColor: '#f1f5f9',
                                },
                            }}
                        >
                            Back
                        </Button>

                        {currentStep < totalSteps ? (
                            currentStep === 1 ? (
                                <Button
                                    variant="contained"
                                    endIcon={<ArrowForwardRoundedIcon />}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        if (!sessionStorage.getItem("selected_contract_user_id")){
                                            Swal.fire("Warning!", "Please select a user to create a contract.", "warning");
                                            return;
                                        }
                                        setCurrentStep((prev) => prev + 1)
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        backgroundColor: '#3b82f6',
                                        boxShadow: '0 1px 2px rgba(59, 130, 246, 0.3)',
                                        '&:hover': {
                                            backgroundColor: '#2563eb',
                                        },
                                    }}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    form={`form-${currentStep}`}
                                    type="submit"
                                    variant="contained"
                                    endIcon={<ArrowForwardRoundedIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        backgroundColor: '#3b82f6',
                                        boxShadow: '0 1px 2px rgba(59, 130, 246, 0.3)',
                                        '&:hover': {
                                            backgroundColor: '#2563eb',
                                        },
                                    }}
                                >
                                    Next
                                </Button>
                            )
                        ) : (
                            <Button
                                form={CONTRACT_FORM_IDS_LIST[selectedContract]}
                                type="submit"
                                variant="contained"
                                startIcon={<SaveRoundedIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    backgroundColor: '#3b82f6',
                                    boxShadow: '0 1px 2px rgba(59, 130, 246, 0.3)',
                                    '&:hover': {
                                        backgroundColor: '#2563eb',
                                    },
                                }}
                            >
                                Create
                            </Button>
                        )}
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}

export default Create;
