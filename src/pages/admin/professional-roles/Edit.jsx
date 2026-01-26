import React, { useEffect, useState } from "react";
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
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import Form from "./Form";
import { professionalRoleSchema } from "../../../schemas/admin/ProfessionalRoleSchema";
import {
    updateProfessionalRoleService,
    getProfessionalRoleByIdService,
} from "../../../services/admin/ProfessionalRoleService";
import { getProfessionalCategoriesService } from "../../../services/admin/ProfessionalCategoryService";
import PageHeader from "@components/admin/PageHeader";

const Edit = () => {
    const menu = "Professional Roles";
    const userRole = sessionStorage.getItem("role");
    const [professionalCategories, setProfessionalCategories] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(professionalRoleSchema),
        defaultValues: { name: "", status: "", professional_category_id: "" },
    });

    const onSubmit = async (data) => {
        try {
            const status = await updateProfessionalRoleService(Number(id), data);
            if (!status) return;
            navigate(`/${userRole}/professional-roles`);
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
            try {
                setProfessionalCategories(await getProfessionalCategoriesService());
                const data = await getProfessionalRoleByIdService(Number(id));
                if (!data) return;
                reset({ name: data.name, status: data.status ? "1" : "0", professional_category_id: data.professional_category_id });
            } catch (error) {
                console.error("Error fetching professional role data:", error);
            }
        };
        initializeStateHelper();
        document.title = `Edit ${menu} | Quicklocum`;
    }, [id, reset]);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title={`Edit ${menu}`}
                subtitle="Update professional role details"
                icon={<WorkRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: menu, path: `/${userRole}/professional-roles` },
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
                        <Form register={register} errors={errors} professionalCategories={professionalCategories} />
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
                            to={`/${userRole}/professional-roles`}
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
