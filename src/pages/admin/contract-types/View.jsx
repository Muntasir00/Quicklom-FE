import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// MUI Icons
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

import { upperCaseFirst } from "@utils/StringUtils";
import { useViewContractType } from "@hooks/admin/contract-types/useViewContractType";
import PageHeader from "@components/admin/PageHeader";

const View = () => {
    const {
        navigate,
        menu,
        sessionUserRole,
        contractTypes,
        action,
        columns
    } = useViewContractType();

    useEffect(() => {
        document.title = `${upperCaseFirst(menu ?? "contracts types")} | Quicklocum`;
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Contract Types"
                subtitle="Manage contract type configurations"
                icon={<DescriptionRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${sessionUserRole}/dashboard` },
                    { label: 'Contract Types' },
                ]}
                actionLabel="Add New"
                actionPath={`/${sessionUserRole}/contract-types/create`}
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
                            rows={contractTypes}
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
}

export default View;
