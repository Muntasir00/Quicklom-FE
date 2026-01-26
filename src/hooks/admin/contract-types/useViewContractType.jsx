import React, { useState, useEffect, useCallback } from "react";
import { getContractTypesService, deleteContractTypeService } from "@services/admin/ContractTypeService";
import { useNavigate } from "react-router-dom";
import { Chip, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const useViewContractType = () => {
    const menu = "contract types";
    const action = "View";
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [contractTypes, setContractTypes] = useState({});
   
    const initializeStateHelper = async () => {
        const contractTypesData = await getContractTypesService();
        setContractTypes(Array.isArray(contractTypesData) ? contractTypesData : []);
    };

    useEffect(() => { initializeStateHelper() }, []);

    const columns = [
        { field: "id", headerName: "#", maxWidth: 50, flex: 1 },
        { field: "contract_name", headerName: "Contract Name", minWidth: 200, flex: 1 },
        {
            field: "status",
            headerName: "Status",
            minWidth: 80,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Active" : "Inactive"}
                    color={params.value ? "success" : "error"}
                    size="small"
                    style={{ cursor: "pointer" }}
                />
            ),
        },
        { field: "created_at", headerName: "Created At", minWidth: 150, flex: 1 },
        { field: "updated_at", headerName: "Updated At", minWidth: 150, flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            maxWidth: 100,
            flex: 1,
            renderCell: (params) => {
                const navigate = useNavigate();
                return (
                    <div className="action-btns">
                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="primary"
                            onClick={() => navigate(`/${sessionUserRole}/contract-types/${params.row.id}/edit`)}
                        >
                            <EditIcon />
                        </IconButton>

                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="error"
                            onClick={async () => {
                                const status = await deleteContractTypeService({ contractTypeId: params.row.id });
                                if (status) initializeStateHelper(); 
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </div>
                );
            },
        },
    ];

    return {
       menu,
       navigate,
       sessionUserRole,
       contractTypes,
       action,
       columns 
    };
};
