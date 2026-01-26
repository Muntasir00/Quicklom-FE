import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Card,
    CardContent,
    Button,
} from "@mui/material";

// MUI Icons
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import Form from './Form';
import { insuranceCompanySchema } from "../../../schemas/admin/InsuranceCompanySchema";
import { createInsuranceCompanyService } from "../../../services/admin/InsuranceCompanyService";
import PageHeader from "@components/admin/PageHeader";

const Create = () => {
    const menu = "Insurance Companies";
    const userRole = sessionStorage.getItem("role")?.toLowerCase();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(insuranceCompanySchema),
        defaultValues: { province_territory: "", abbreviation: "", official_name: "", status: "1" },
    });

    const onSubmit = async (data) => {
        try {
            const status = await createInsuranceCompanyService(data);
            if (status) navigate(`/${userRole}/insurance-companies`);
        } catch (err) {
            if (err.response?.data?.errors) {
                const serverErrors = err.response.data.errors;
                Object.keys(serverErrors).forEach((field) => {
                    setError(field, { type: "server", message: serverErrors[field] });
                });
            } else {
                console.error("Unexpected error:", err);
            }
        }
    };

    useEffect(() => {
        document.title = `Create ${menu} | Quicklocum`;
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title={`Create ${menu}`}
                subtitle="Add a new insurance company"
                icon={<HealthAndSafetyRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: menu, path: `/${userRole}/insurance-companies` },
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
                        <Form register={register} errors={errors} />
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
                            to={`/${userRole}/insurance-companies`}
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
                            variant="contained"
                            startIcon={<SaveRoundedIcon />}
                            onClick={handleSubmit(onSubmit)}
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
};

export default Create;
