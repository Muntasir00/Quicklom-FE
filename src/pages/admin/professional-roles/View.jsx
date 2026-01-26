import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    IconButton,
    Chip,
    Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// MUI Icons
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import { getProfessionalRolesService, deleteProfessionalRoleService } from "../../../services/admin/ProfessionalRoleService";
import PageHeader from "@components/admin/PageHeader";
import RolesListModal from "@components/modals/RolesListModal";

const View = () => {
    const menu = "Professional Roles";
    const userRole = sessionStorage.getItem("role");
    const [professionalRoles, setProfessionalRoles] = useState([]);
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const initializeStateHelper = async () => {
        const data = await getProfessionalRolesService();
        setProfessionalRoles(data);
    };

    const columns = [
        {
            field: "id",
            headerName: "#",
            width: 70,
            sortable: true,
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "status",
            headerName: "Status",
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                        backgroundColor: params.value ? '#d1fae5' : '#fee2e2',
                        color: params.value ? '#059669' : '#dc2626',
                        fontWeight: 500,
                        fontSize: 12,
                    }}
                />
            ),
        },
        {
            field: "created_at",
            headerName: "Created At",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "updated_at",
            headerName: "Updated At",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View">
                        <IconButton
                            size="small"
                            onClick={() => {
                                const role = professionalRoles.find((item) => item.id === params.row.id);
                                setSelectedRole(role);
                                setShow(true);
                            }}
                            sx={{
                                color: '#10b981',
                                '&:hover': { backgroundColor: '#d1fae5' },
                            }}
                        >
                            <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/${userRole}/professional-roles/${params.row.id}/edit`)}
                            sx={{
                                color: '#3b82f6',
                                '&:hover': { backgroundColor: '#dbeafe' },
                            }}
                        >
                            <EditRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={async () => {
                                const status = await deleteProfessionalRoleService({ roleId: params.row.id });
                                if (!status) return;
                                await initializeStateHelper();
                            }}
                            sx={{
                                color: '#ef4444',
                                '&:hover': { backgroundColor: '#fee2e2' },
                            }}
                        >
                            <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    useEffect(() => {
        initializeStateHelper();
        document.title = `${menu} | Quicklocum`;
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title={menu}
                subtitle="Manage professional role types"
                icon={<WorkRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: menu },
                ]}
                actionLabel="Add New"
                actionPath={`/${userRole}/professional-roles/create`}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        <DataGrid
                            rows={professionalRoles}
                            columns={columns}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                                sorting: { sortModel: [{ field: 'id', sort: 'desc' }] },
                            }}
                            pageSizeOptions={[10, 25, 50, 100]}
                            getRowId={(row) => row.id}
                            disableRowSelectionOnClick
                            autoHeight
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
                        <RolesListModal
                            show={show}
                            setShow={setShow}
                            role={selectedRole}
                        />
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default View;
