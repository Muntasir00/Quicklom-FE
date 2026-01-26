import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Card,
    CardContent,
    Button,
} from "@mui/material";

// MUI Icons
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import Form from './Form';
import { professionalCategorySchema } from "../../../schemas/admin/ProfessionalCategorySchema";
import { updateProfessionalCategoryService, getProfessionalCategoryByIdService } from "../../../services/admin/ProfessionalCategoryService";
import PageHeader from "@components/admin/PageHeader";

const Edit = () => {
    const menu = "Professional Categories";
    const userRole = sessionStorage.getItem("role");
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(professionalCategorySchema),
        defaultValues: { name: "", status: "" },
    });

    const onSubmit = async (data) => {
        try {
            const status = await updateProfessionalCategoryService(Number(id), data);
            if (!status) return;
            navigate(`/${userRole}/professional-categories`);
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
        const initializeStateHelper = async () => {
            const data = await getProfessionalCategoryByIdService(Number(id));
            if (!data) return;
            reset({
                name: data.name,
                status: data.status ? "1" : "0",
            });
        };
        initializeStateHelper();
        document.title = `Edit ${menu} | Quicklocum`;
    }, [id, reset]);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title={`Edit ${menu}`}
                subtitle="Update professional category details"
                icon={<CategoryRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: menu, path: `/${userRole}/professional-categories` },
                    { label: 'Edit' },
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
                            to={`/${userRole}/professional-categories`}
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
                            Update
                        </Button>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
};

export default Edit;
