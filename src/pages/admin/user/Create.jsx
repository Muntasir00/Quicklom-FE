import React, { useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Card,
    CardContent,
    Button,
} from "@mui/material";

// MUI Icons
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import Form from './Form';
import { userSchema } from "../../../schemas/admin/UserSchema";
import { createUserService } from "../../../services/admin/UserService";
import { getRolesService } from "../../../services/admin/RoleService";
import PageHeader from "@components/admin/PageHeader";

const Create = () => {
    const menu = "Users";
    const userRole = sessionStorage.getItem("role")?.toLowerCase();
    const navigate = useNavigate();
    const [roles, setRoles] = React.useState([]);

    const initializeStateHelper = async () => {
        const rolesData = await getRolesService();
        setRoles(rolesData ?? []);
    };

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirm_password: "",
            role_id: "",
            status: "0"
        },
    });

    const onSubmit = async (data) => {
        try {
            const status = await createUserService(data);
            if (status) navigate(`/${userRole}/users`);
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
        initializeStateHelper();
        document.title = `Create ${menu} | Quicklocum`;
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title={`Create ${menu}`}
                subtitle="Add a new user account"
                icon={<PersonAddRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: menu, path: `/${userRole}/users` },
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
                        <Form register={register} errors={errors} roles={roles} />
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
                            to={`/${userRole}/users`}
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
