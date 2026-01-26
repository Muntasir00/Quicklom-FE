import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { upperCaseFirst } from "@utils/StringUtils";
import { ContentHeader } from "@components/pages/ContentHeader";
import { useViewPositionSought } from "@hooks/admin/position-soughts/useViewPositionSought";
import { DataGrid } from "@mui/x-data-grid";

const View = () => {
    const { 
        menu,
        navigate,
        sessionUserRole,
        rows,
        action,
        columns,
        slug,
    } = useViewPositionSought();

    return (
        <div className="content-wrapper">
           <ContentHeader menu={menu} action={action} />
            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card card-primary card-outline">
                                <div className="card-header">
                                    <h3 className="card-title text-capitalize">Manage { menu ?? "-" }</h3>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Link to={`/${sessionUserRole}/${slug}/create`} className="btn btn-sm btn-primary float-right">
                                                <i className="fa fa-plus pr-1"></i> Add New
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        pageSize={10}
                                        rowsPerPageOptions={[10, 25, 50, 100]}
                                        pagination
                                        getRowId={(row) => row.id}
                                        initialState={{
                                            sorting: {
                                                sortModel: [{ field: "id", sort: "desc" }],
                                            },
                                        }}
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
