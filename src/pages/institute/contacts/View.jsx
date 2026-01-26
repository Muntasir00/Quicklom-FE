import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { upperCaseFirst } from "@utils/StringUtils";
import { useViewContacts } from "@hooks/institute/contacts/useViewContacts";
import { DataGrid } from "@mui/x-data-grid";

const View = () => {
    const {
        menu,
        navigate,
        SESSION_USER_ROLE,
        rows,
        action,
        columns,
        slug,
    } = useViewContacts();

    return (
        <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 57px)' }}>
            {/* Page Header */}
            <div className="content-header py-3" style={{ backgroundColor: '#f4f6f9', marginTop: '15px' }}>
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                            <div
                                className="icon-wrapper mr-3 d-flex align-items-center justify-content-center rounded"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                <i className="fas fa-address-book text-white" style={{ fontSize: '1.3rem' }}></i>
                            </div>
                            <div>
                                <h4 className="mb-0 font-weight-bold text-dark">Contacts</h4>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    {rows.length} contact{rows.length !== 1 ? 's' : ''} • Manage your network
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content pt-0">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm" style={{ borderRadius: '10px', border: 'none' }}>
                                <div className="card-body">
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
                                        sx={{
                                            "& .MuiDataGrid-cell": { fontSize: "13px" },
                                            "& .MuiDataGrid-columnHeader": { fontSize: "13px" },
                                            "& .MuiDataGrid-footerContainer": { fontSize: "13px" },
                                            "& .MuiTablePagination-root": { fontSize: "13px" },
                                            "& .MuiTablePagination-toolbar": { fontSize: "13px" },
                                            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input, & .MuiTablePagination-menuItem": { fontSize: "13px" },
                                            "& .MuiTablePagination-displayedRows": { fontSize: "13px" },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default View;
