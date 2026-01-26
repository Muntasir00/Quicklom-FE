import React  from "react";
import { DataGrid } from "@mui/x-data-grid";

const DataGridComponent = ({ columns, rows }) => {
    return (
        <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            pageSizeOptions={[10, 25, 50, 100]}
            pagination
            getRowId={(row) => row.id}
            initialState={{
                sorting: {
                    sortModel: [{ field: "id", sort: "desc" }],
                },
            }}
            sx={{
                "& .MuiDataGrid-cell": {
                    fontSize: "13px", // Font size for individual cells in the table
                },

                "& .MuiDataGrid-columnHeader": {
                    fontSize: "13px", // Font size for column headers
                },

                "& .MuiDataGrid-footerContainer": {
                    fontSize: "13px", // Font size for the footer container (includes pagination)
                },
            
                "& .MuiTablePagination-root": {
                    fontSize: "13px", // Font size for the root of the pagination component
                },
            
                "& .MuiTablePagination-toolbar": {
                    fontSize: "13px", // Font size for the toolbar section of pagination (main layout area)
                },
            
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input, & .MuiTablePagination-menuItem": {
                    fontSize: "13px", // Font size for dropdown label (e.g., "Rows per page"), input field, and dropdown items
                },
            
                "& .MuiTablePagination-displayedRows": {
                    fontSize: "13px", // Font size for the displayed rows text (e.g., "1–5 of 5")
                },
            }}             
        />
    );
};

export default DataGridComponent;