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
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import { getInsuranceCompaniesService, deleteInsuranceCompanyService } from "../../../services/admin/InsuranceCompanyService";
import PageHeader from "@components/admin/PageHeader";

const View = () => {
    const menu = "Insurance Companies";
    const userRole = sessionStorage.getItem("role")?.toLowerCase();
    const [insuranceCompanies, setInsuranceCompanies] = useState([]);
    const navigate = useNavigate();

    const initializeStateHelper = async () => {
        setInsuranceCompanies(await getInsuranceCompaniesService());
    };

    const columns = [
        {
            field: "id",
            headerName: "#",
            width: 70,
            sortable: true,
        },
        {
            field: "province_territory",
            headerName: "Province/Territory",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "abbreviation",
            headerName: "Abbreviation",
            width: 120,
        },
        {
            field: "official_name",
            headerName: "Official Name",
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
            minWidth: 120,
        },
        {
            field: "updated_at",
            headerName: "Updated At",
            flex: 1,
            minWidth: 120,
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/${userRole}/insurance-companies/${params.row.id}/edit`)}
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
                                const status = await deleteInsuranceCompanyService(params.row.id);
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
                subtitle="Manage insurance company records"
                icon={<HealthAndSafetyRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: menu },
                ]}
                actionLabel="Add New"
                actionPath={`/${userRole}/insurance-companies/create`}
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
                            rows={insuranceCompanies}
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
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default View;
