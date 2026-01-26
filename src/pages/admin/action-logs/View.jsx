import { useEffect, useState  } from "react";
import { getActionLogService } from "../../../services/admin/ActionLogService";
import { DataGrid, GridToolbarExport } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { getRolesService } from "../../../services/admin/RoleService";
import Filter from "./Filter";


const View = () => {
    const [actionLogs, setActionLogs] = useState([]);
    const [roles, setRoles] = useState([]);
    const [logsType, setLogsType] = useState([]);
    const [actionTypes, setActionTypes] = useState([]);
    const [actionStatusTypes, setActionStatusTypes] = useState([]);   

    const initializeStateHelper = async () => {
        try{
            const data = await getActionLogService();
            const rolesData = await getRolesService();
            setActionLogs(data?.logs || []);
            setRoles(rolesData || []);
            setLogsType(data?.logs_type || []);
            setActionTypes(data?.user_action_type || []);
            setActionStatusTypes(data?.action_status_type || []);
        } catch (error) {
            console.error("Error in setting states:", error);
        }
    };
    
    const columns = [
        { field: "id", headerName: "#", width: 40 },
        { field: "user", headerName: "User", width: 180, renderCell: (params) => params.value?.name || "-" },
        { field: "email", headerName: "Email", width: 180, renderCell: (params) => params.row.email ?? "-" },
        { field: "log_type", headerName: "Log Type", width: 130 },
        { field: "action_type", headerName: "Action Type", width: 180 },
        { field: "action_status", headerName: "Status", width: 130,
            renderCell: (params) => (
                <Chip label={params.value} color={
                    params.value === "Success" ? "success" :
                    ["Failed","Error","Unauthorized"].includes(params.value) ? "error" :
                    ["Pending","In Progress"].includes(params.value) ? "warning" :
                    "info"
                }
                size="small"
                />
            ),
        },
        { field: "action_description", headerName: "Description", width: 250 },
        { field: "affected_entity", headerName: "Affected Entity", width: 200 },
        { field: "ip_address", headerName: "IP Address", width: 130 },        
        { field: "location", headerName: "Location", width: 150, renderCell: (params) => params.value || "-" },
        { field: "created_at", headerName: "Created At", width: 180 },
    ];

    useEffect(() => {
        initializeStateHelper();
        document.title = "Action Logs | Quicklocum";
    }, []);

    return (
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Action Logs</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="#">Action Logs</a></li>
                                <li className="breadcrumb-item active">View</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <Filter
                                roles={roles}
                                logsType={logsType}
                                actionTypes={actionTypes}
                                getActionLogService={getActionLogService}
                                setActionLogs={setActionLogs}
                                actionStatusTypes={actionStatusTypes}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="card card-primary card-outline">
                                <div className="card-header">
                                    <h3 className="card-title">Manage Action Logs</h3>
                                    <div className="row d-none">
                                        <div className="col-md-12">
                                            <a href="#" className="btn btn-sm btn-primary float-right"><i className="fa fa-plus pr-1"></i> Add New</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <DataGrid
                                        rows={actionLogs}
                                        columns={columns}
                                        pageSize={10}
                                        rowsPerPageOptions={[10]}
                                        pageSizeOptions={[10, 25, 50, 100]}
                                        pagination
                                        getRowId={(row) => row.id}
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
