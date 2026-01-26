import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Button, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddIcon from "@mui/icons-material/Add";
import { upperCaseFirst } from "@utils/StringUtils";
import PageHeader from "@components/admin/PageHeader";
import { useViewNotifications } from "@hooks/admin/notifications/useViewNotifications";
import { DataGrid } from "@mui/x-data-grid";
import CreateNotificationModal from "@components/modals/CreateNotificationModal";

const View = () => {
    const {
        menu,
        navigate,
        SESSION_USER_ROLE,
        rows,
        action,
        columns,
        slug,
        showCreateForm,
        setShowCreateForm,
    } = useViewNotifications();

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Notifications"
                subtitle="Manage system notifications"
                icon={<NotificationsIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: '/admin/dashboard' },
                    { label: 'Notifications' },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} color="#1e293b">
                            Manage {menu ?? "-"}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setShowCreateForm(true)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundColor: '#3b82f6',
                                '&:hover': {
                                    backgroundColor: '#2563eb',
                                },
                            }}
                        >
                            Add New
                        </Button>
                    </Box>

                    <CardContent sx={{ p: 0 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowId={(row) => row.id}
                            pagination
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                                sorting: {
                                    sortModel: [{ field: "id", sort: "desc" }],
                                },
                            }}
                            pageSizeOptions={[10, 25, 50, 100]}
                            autoHeight
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
                            }}
                        />

                        {CreateNotificationModal && showCreateForm && (
                            <CreateNotificationModal
                                show={showCreateForm}
                                setShow={setShowCreateForm}
                            />
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}

export default View;
