import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Button,
} from "@mui/material";

// MUI Icons
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import Form from './Form';
import { upperCaseFirst } from "@utils/StringUtils";
import { useCreateContractType } from "@hooks/admin/contract-types/useCreateContractType";
import PageHeader from "@components/admin/PageHeader";

const Create = () => {
    const menu = "contract types";
    const userRole = sessionStorage.getItem("role");

    useEffect(() => {
        document.title = `${upperCaseFirst(menu ?? "contracts types")} | Quicklocum`;
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Create Contract Type"
                subtitle="Add a new contract type configuration"
                icon={<DescriptionRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: 'Contract Types', path: `/${userRole}/contract-types` },
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
                    <CardContent sx={{ p: 3 }}>
                        <Form ContractFormHook={useCreateContractType} />
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
                            component={Link}
                            to={`/${userRole}/contract-types`}
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
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
                        <Button
                            form="contract-form"
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
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}

export default Create;
