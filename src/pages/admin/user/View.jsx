import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    Chip, IconButton, Tooltip, Avatar, Card, CardContent, Box, Typography,
    LinearProgress, TextField, InputAdornment, Menu, MenuItem, Divider, Button
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// MUI Icons
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';

import {
    getUsersService,
    updateUsersStatusService,
    deleteUserService,
    sendVerificationEmailService
} from "@services/admin/UserService";
import { getRolesService } from "@services/admin/RoleService";
import Filter from "./Filter";
import PageHeader from "@components/admin/PageHeader";

const View = () => {
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem("role")?.toLowerCase();
    const [searchParams] = useSearchParams();
    const affectedEntityId = searchParams.get("affected_entity_id");

    // State
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ affected_entity_id: "" });

    // Stats
    const [stats, setStats] = useState({
        total: 0, active: 0, inactive: 0,
        professionals: 0, institutes: 0, admins: 0,
        approved: 0, pending: 0
    });

    // Action menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const initializeStateHelper = async (newFilters) => {
        try {
            setLoading(true);
            const activeFilters = newFilters ?? filters;
            const [userData, rolesData] = await Promise.all([
                getUsersService({ filters: activeFilters }),
                getRolesService()
            ]);

            const data = userData ?? [];
            setRoles(rolesData ?? []);
            setUsers(data);

            // Calculate stats
            setStats({
                total: data.length,
                active: data.filter(u => u.status).length,
                inactive: data.filter(u => !u.status).length,
                professionals: data.filter(u => u.role?.name?.toLowerCase() === "professional").length,
                institutes: data.filter(u => u.role?.name?.toLowerCase() === "institute").length,
                admins: data.filter(u => u.role?.name?.toLowerCase() === "admin").length,
                approved: data.filter(u => u.profiles?.[0]?.status === "approved").length,
                pending: data.filter(u => u.profiles?.[0]?.status === "pending").length
            });
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Users | Quicklocum";
        const newFilters = { ...filters, affected_entity_id: affectedEntityId ?? "" };
        setFilters(newFilters);
        initializeStateHelper(newFilters);
    }, [affectedEntityId]);

    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const getRoleColor = (roleName) => {
        const colors = {
            admin: "#8b5cf6",
            professional: "#10b981",
            institute: "#3b82f6"
        };
        return colors[roleName?.toLowerCase()] || "#64748b";
    };

    const getRoleIcon = (roleName) => {
        if (roleName?.toLowerCase() === "professional") return <PersonRoundedIcon fontSize="small" />;
        if (roleName?.toLowerCase() === "institute") return <BusinessRoundedIcon fontSize="small" />;
        return <VerifiedUserRoundedIcon fontSize="small" />;
    };

    const getProfileStatusColor = (status) => {
        const colors = {
            approved: "success",
            pending: "warning",
            rejected: "error",
            under_review: "info",
            incomplete: "default",
            suspended: "secondary"
        };
        return colors[status] || "default";
    };

    const getCategoryDisplay = (user) => {
        const profile = user?.profiles?.[0];
        if (!profile) return "-";

        const professionalCategories = Array.isArray(profile?.professional_category)
            ? profile.professional_category
            : profile?.professional_category ? [profile.professional_category] : [];

        const instituteCategories = Array.isArray(profile?.institute_category)
            ? profile.institute_category
            : profile?.institute_category ? [profile.institute_category] : [];

        return professionalCategories.map(c => c.name).join(", ") ||
            instituteCategories.map(c => c.name).join(", ") || "-";
    };

    // Filter users by search term
    const filteredUsers = users.filter(user =>
        !searchTerm ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statCards = [
        { label: "Total Users", value: stats.total, icon: <PeopleRoundedIcon />, color: "#64748b", bg: "#f1f5f9" },
        { label: "Active", value: stats.active, icon: <CheckCircleRoundedIcon />, color: "#10b981", bg: "#d1fae5" },
        { label: "Professionals", value: stats.professionals, icon: <PersonRoundedIcon />, color: "#10b981", bg: "#d1fae5" },
        { label: "Institutes", value: stats.institutes, icon: <BusinessRoundedIcon />, color: "#3b82f6", bg: "#dbeafe" },
        { label: "Pending", value: stats.pending, icon: <PendingActionsRoundedIcon />, color: "#f59e0b", bg: "#fef3c7" }
    ];

    const columns = [
        {
            field: "user",
            headerName: "User",
            flex: 1.5,
            minWidth: 250,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1.5} sx={{ lineHeight: 1.2 }}>
                    <Avatar sx={{ bgcolor: getRoleColor(params.row.role?.name), width: 40, height: 40 }}>
                        {getRoleIcon(params.row.role?.name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3, color: '#0f172a' }}>
                                {params.row.name || "N/A"}
                            </Typography>
                            {params.row.status && <CheckCircleRoundedIcon sx={{ fontSize: 14, color: "#10b981" }} />}
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
                            {params.row.email}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: "role",
            headerName: "Role",
            flex: 0.6,
            minWidth: 120,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => (
                <Chip
                    icon={getRoleIcon(params.value?.name)}
                    label={params.value?.name || "-"}
                    size="small"
                    sx={{
                        bgcolor: getRoleColor(params.value?.name),
                        color: "white",
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: 'white' }
                    }}
                />
            )
        },
        {
            field: "category",
            headerName: "Category",
            flex: 1,
            minWidth: 150,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => {
                const category = getCategoryDisplay(params.row);
                return (
                    <Typography
                        sx={{
                            fontSize: '0.875rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#475569'
                        }}
                        title={category}
                    >
                        {category}
                    </Typography>
                );
            }
        },
        {
            field: "profile",
            headerName: "Profile Status",
            flex: 0.7,
            minWidth: 130,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => {
                const profile = params?.row?.profiles?.[0];
                const status = profile?.status || "incomplete";
                return (
                    <Chip
                        label={status.replace(/_/g, " ").toUpperCase()}
                        color={getProfileStatusColor(status)}
                        size="small"
                        sx={{ fontWeight: 500, fontSize: 11 }}
                    />
                );
            }
        },
        {
            field: "status",
            headerName: "Account",
            flex: 0.5,
            minWidth: 100,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => (
                <Tooltip title={params.value ? "Active - Click to deactivate" : "Inactive - Click to activate"}>
                    <Chip
                        icon={params.value ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
                        label={params.value ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                            backgroundColor: params.value ? '#d1fae5' : '#fee2e2',
                            color: params.value ? '#059669' : '#dc2626',
                            fontWeight: 500,
                            cursor: "pointer",
                            '& .MuiChip-icon': {
                                color: params.value ? '#059669' : '#dc2626'
                            }
                        }}
                        onClick={async () => {
                            await updateUsersStatusService({ userId: params.row.id });
                            await initializeStateHelper();
                        }}
                    />
                </Tooltip>
            )
        },
        {
            field: "created_at",
            headerName: "Joined",
            flex: 0.5,
            minWidth: 100,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => (
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {params.value ? new Date(params.value).toLocaleDateString() : "-"}
                </Typography>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 0.6,
            minWidth: 120,
            headerAlign: 'left',
            align: 'left',
            sortable: false,
            renderCell: (params) => (
                <Box display="flex" gap={0.5}>
                    <Tooltip title="View Profile">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/${userRole}/users/${params.row.id}/profile/view`)}
                            sx={{
                                color: '#10b981',
                                '&:hover': { backgroundColor: '#d1fae5' }
                            }}
                        >
                            <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/${userRole}/users/${params.row.id}/edit`)}
                            sx={{
                                color: '#3b82f6',
                                '&:hover': { backgroundColor: '#dbeafe' }
                            }}
                        >
                            <EditRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, params.row)}
                        sx={{
                            color: '#64748b',
                            '&:hover': { backgroundColor: '#f1f5f9' }
                        }}
                    >
                        <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Users Management"
                subtitle="Manage all user accounts and profiles"
                icon={<PeopleRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: 'Users' },
                ]}
                actionLabel="Add New User"
                actionPath={`/${userRole}/users/create`}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                {/* Stats Cards */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 2,
                        mb: 3
                    }}
                >
                    {statCards.map((stat, idx) => (
                        <Card
                            key={idx}
                            sx={{
                                borderRadius: 3,
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                                backgroundColor: stat.bg,
                                border: 'none'
                            }}
                        >
                            <CardContent sx={{ py: 2.5, px: 3, "&:last-child": { pb: 2.5 } }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography
                                            variant="h4"
                                            sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}
                                        >
                                            {stat.value}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: '#64748b', fontWeight: 500 }}
                                        >
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                            color: stat.color
                                        }}
                                    >
                                        {React.cloneElement(stat.icon, { sx: { fontSize: 28 } })}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Search and Filter */}
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                        mb: 3,
                        p: 2.5
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            size="small"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: 300,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#f8fafc'
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon sx={{ color: '#94a3b8' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Filter
                                roles={roles}
                                getUsersService={getUsersService}
                                setUsers={setUsers}
                            />
                        </Box>
                    </Box>
                </Card>

                {/* Data Grid */}
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
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                All Users
                            </Typography>
                            <Chip
                                label={filteredUsers.length}
                                size="small"
                                sx={{
                                    backgroundColor: '#e2e8f0',
                                    color: '#475569',
                                    fontWeight: 600,
                                    fontSize: 12
                                }}
                            />
                        </Box>
                    </Box>
                    <CardContent sx={{ p: 0 }}>
                        {loading && <LinearProgress sx={{ height: 2 }} />}
                        <DataGrid
                            rows={filteredUsers}
                            columns={columns}
                            pageSizeOptions={[10, 25, 50, 100]}
                            pagination
                            autoHeight
                            getRowId={(row) => row.id}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                                sorting: { sortModel: [{ field: "id", sort: "desc" }] }
                            }}
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f1f5f9',
                                    borderBottom: '2px solid #e2e8f0',
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    fontWeight: 600,
                                    fontSize: 13,
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                },
                                '& .MuiDataGrid-cell': {
                                    fontSize: 14,
                                    color: '#0f172a',
                                    borderBottom: '1px solid #f1f5f9',
                                },
                                '& .MuiDataGrid-row': {
                                    transition: 'background-color 0.15s ease',
                                    '&:hover': {
                                        backgroundColor: '#f8fafc',
                                    },
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '2px solid #e2e8f0',
                                    backgroundColor: '#f8fafc',
                                },
                                '& .MuiTablePagination-root': {
                                    fontSize: 13,
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        minWidth: 180
                    }
                }}
            >
                <MenuItem
                    onClick={() => {
                        if (selectedUser) navigate(`/${userRole}/users/${selectedUser.id}/profile/view`);
                        handleMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                >
                    <VisibilityRoundedIcon fontSize="small" sx={{ mr: 1.5, color: '#10b981' }} />
                    View Profile
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (selectedUser) navigate(`/${userRole}/users/${selectedUser.id}/edit`);
                        handleMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                >
                    <EditRoundedIcon fontSize="small" sx={{ mr: 1.5, color: '#3b82f6' }} />
                    Edit User
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (selectedUser) navigate(`/${userRole}/users/${selectedUser.id}/profile/edit`);
                        handleMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                >
                    <EditRoundedIcon fontSize="small" sx={{ mr: 1.5, color: '#8b5cf6' }} />
                    Edit Profile
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={async () => {
                        if (selectedUser) await sendVerificationEmailService({ userId: selectedUser.id });
                        handleMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                >
                    <EmailRoundedIcon fontSize="small" sx={{ mr: 1.5, color: '#f59e0b' }} />
                    Send Verification Email
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={async () => {
                        if (selectedUser) {
                            await deleteUserService({ userId: selectedUser.id });
                            await initializeStateHelper();
                        }
                        handleMenuClose();
                    }}
                    sx={{ py: 1.5, color: '#ef4444' }}
                >
                    <DeleteRoundedIcon fontSize="small" sx={{ mr: 1.5 }} />
                    Delete User
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default View;
