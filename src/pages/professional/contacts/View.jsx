import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { upperCaseFirst } from "@utils/StringUtils";
import { ContentHeader } from "@components/pages/ContentHeader";
import { useViewContacts } from "@hooks/professional/contacts/useViewContacts";
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
        <div className="content-wrapper">
           <ContentHeader menu={menu} action={action} />
            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card card-primary card-outline">
                                <div className="card-header">
                                    <h3 className="card-title text-capitalize">Manage { menu ?? "-" }</h3>
                                </div>
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
