import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Box,
    Card,
    CardContent,
    Button,
    TextField,
    Typography,
    Divider,
    Grid,
    CircularProgress,
    Alert,
} from "@mui/material";

// MUI Icons
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

import { getUserByIdService, updateUserService } from "../../../services/admin/UserService";
import PageHeader from "@components/admin/PageHeader";
import Swal from "sweetalert2";

// Validation schema
const userAccountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional().refine(
        (val) => !val || val.length >= 8,
        "Password must be at least 8 characters if provided"
    ),
    confirm_password: z.string().optional()
}).refine((data) => {
    if (data.password && data.password.trim()) {
        if (!data.confirm_password) {
            return false;
        }
        if (data.password !== data.confirm_password) {
            return false;
        }
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirm_password"]
});

const UpdatedAdminUserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem("role")?.toLowerCase();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(userAccountSchema)
    });

    const passwordValue = watch("password");

    useEffect(() => {
        document.title = "Edit User Account | Quicklocum";
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const data = await getUserByIdService(id);
            if (data) {
                setUserData(data);
                reset({
                    name: data.name,
                    email: data.email,
                    password: "",
                    confirm_password: ""
                });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            Swal.fire("Error", "Failed to load user data", "error");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                name: data.name,
                email: data.email,
            };

            if (data.password && data.password.trim() !== "") {
                payload.password = data.password;
                payload.confirm_password = data.confirm_password;
            } else {
                payload.password = null;
                payload.confirm_password = null;
            }

            const result = await updateUserService(id, payload);

            if (result) {
                navigate(`/${userRole}/users`);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <PageHeader
                    title="Edit User Account"
                    subtitle="Update user account information"
                    icon={<EditRoundedIcon />}
                    breadcrumbs={[
                        { label: 'Dashboard', path: `/${userRole}/dashboard` },
                        { label: 'Users', path: `/${userRole}/users` },
                        { label: 'Edit' },
                    ]}
                />
                <Box sx={{ px: 4, pb: 4, display: 'flex', justifyContent: 'center', pt: 8 }}>
                    <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
            </Box>
        );
    }

    if (!userData) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <PageHeader
                    title="Edit User Account"
                    subtitle="Update user account information"
                    icon={<EditRoundedIcon />}
                    breadcrumbs={[
                        { label: 'Dashboard', path: `/${userRole}/dashboard` },
                        { label: 'Users', path: `/${userRole}/users` },
                        { label: 'Edit' },
                    ]}
                />
                <Box sx={{ px: 4, pb: 4 }}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        User not found.
                    </Alert>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Edit User Account"
                subtitle="Update user account information"
                icon={<EditRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: 'Users', path: `/${userRole}/users` },
                    { label: 'Edit' },
                ]}
            />

            <Box sx={{ px: 4, pb: 4, maxWidth: 900, mx: 'auto' }}>
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                        mb: 3
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                            <Grid container spacing={3}>
                                {/* Name Field */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        placeholder="Enter name"
                                        {...register("name")}
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Grid>

                                {/* Email Field */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        placeholder="Enter email"
                                        {...register("email")}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <KeyRoundedIcon sx={{ color: '#64748b' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                    Change Password (Optional)
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                                Leave password fields empty if you don't want to change the password
                            </Typography>

                            <Grid container spacing={3}>
                                {/* Password Field */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={`New Password${passwordValue && passwordValue.trim() ? ' *' : ''}`}
                                        type="password"
                                        placeholder="Enter new password (min 8 characters)"
                                        {...register("password")}
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Grid>

                                {/* Confirm Password Field */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={`Confirm New Password${passwordValue && passwordValue.trim() ? ' *' : ''}`}
                                        type="password"
                                        placeholder="Confirm new password"
                                        {...register("confirm_password")}
                                        error={!!errors.confirm_password}
                                        helperText={errors.confirm_password?.message || (passwordValue && passwordValue.trim() ? 'Please confirm your new password' : '')}
                                        InputLabelProps={{ shrink: true }}
                                        disabled={!passwordValue || !passwordValue.trim()}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Current Role Display */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Current Role"
                                        value={userData.role?.name || 'N/A'}
                                        disabled
                                        InputLabelProps={{ shrink: true }}
                                        helperText="Role cannot be changed after account creation"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: '#f1f5f9',
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
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
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveRoundedIcon />}
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
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
                            {isSubmitting ? 'Updating...' : 'Update Account'}
                        </Button>
                    </Box>
                </Card>

                {/* Quick Links Card */}
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                    }}
                >
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <BadgeRoundedIcon sx={{ color: '#64748b' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            Quick Links
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Button
                                    component={Link}
                                    to={`/${userRole}/users/${id}/profile/view`}
                                    variant="contained"
                                    fullWidth
                                    startIcon={<VisibilityRoundedIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        backgroundColor: '#10b981',
                                        '&:hover': { backgroundColor: '#059669' },
                                    }}
                                >
                                    View Profile
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Button
                                    component={Link}
                                    to={`/${userRole}/users/${id}/profile/edit`}
                                    variant="contained"
                                    fullWidth
                                    startIcon={<EditRoundedIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        backgroundColor: '#f59e0b',
                                        '&:hover': { backgroundColor: '#d97706' },
                                    }}
                                >
                                    Edit Profile
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default UpdatedAdminUserEdit;
