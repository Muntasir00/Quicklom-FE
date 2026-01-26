import React, { useState, useEffect } from "react";
import { getContractsService, deleteContractService } from "@services/admin/ContractService"; 
import { useNavigate, useSearchParams } from "react-router-dom";
import { Chip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import { upperCaseFirst } from "@utils/StringUtils";
import { CONTRACT_MODAL_COMPONENTS_LIST } from "@constants/ContractModalConstants";
import { cleanContractName } from "@utils/StringUtils";


export const useViewContract = () => {
    const menu = "contracts";
    const action = "View";
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionUserRole = sessionStorage.getItem("role");
    
    // state variables
    const [contracts, setContracts] = useState([]);
    const [showContractData, setShowContractData] = useState(null);
    const [show, setShow] = useState(false);
    const [ContractModel, setContractModel] = useState(null);
    const affectedEntityId = searchParams.get("affected_entity_id");


    // status update state variables
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [selectedStatusUpdate, setSelectedStatusUpdate] = useState({id: null, status: ""});

    const [filters, setFilters] = useState({
        affected_entity_id: "",
    });

    const initializeStateHelper = async (newFilters) => {
        try {
            const activeFilters = newFilters ?? filters;
            const contractsData = await getContractsService({ filters: activeFilters });
            setContracts(Array.isArray(contractsData) ? contractsData : []);
        } catch (error) {
            console.error("Error in initializeStateHelper:", error);
        }
    };

    const handleShowModal = (contractId, contractName) => {
        try {
            const selectedContract = cleanContractName(contractName);
            const ModalComponent = CONTRACT_MODAL_COMPONENTS_LIST[selectedContract];
            const contractData = contracts?.find(item => item.id === contractId);

            if (!ModalComponent || !contractData || Object.keys(contractData).length <= 0) {
                console.error("Invalid contract or modal component found for contract:", contractName);
                return;
            }

            const data = { ...contractData, ...contractData?.data };
        
            setShowContractData(data ?? null);
            setContractModel(() => ModalComponent); // save the component
            setShow(true);
        } catch (error) {
            console.error("Error in handleShowModal:", error);
        }
    };

    useEffect(() => {
        try { 
            const newFilters = {
                ...filters,
                affected_entity_id: affectedEntityId ?? "",
            };
  
            setFilters(newFilters);
            initializeStateHelper(newFilters);
            sessionStorage.removeItem("selected_contract_user_id");
            document.title = `${upperCaseFirst(menu ?? "Quicklocum")} | Quicklocum`;
        } catch (error) {
            console.error("Error occured:", error);
        }
    }, [affectedEntityId]);

    const columns = [
        { field: "id", headerName: "#", maxWidth: 50, flex: 1 },
        { 
            field: "user", 
            headerName: "User", 
            minWidth: 200, flex: 1, 
            renderCell: (params) => params.value ? params.value?.name : "-" 
        },
        { 
            field: "publisher_name", 
            headerName: "Publisher Name", 
            minWidth: 200, flex: 1, 
            renderCell: (params) => params?.row?.published_by ? params?.row?.published_by?.name : "-" 
        },
        { 
            field: "publisher_email", 
            headerName: "Publisher Email", 
            minWidth: 200, flex: 1, 
            renderCell: (params) => params?.row?.published_by ? params?.row?.published_by?.email : "-" 
        },
        { 
            field: "start_date", 
            headerName: "Start Date", 
            minWidth: 120, flex: 1,
            renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-"
        },
        { 
            field: "end_date", 
            headerName: "End Date", 
            minWidth: 120, flex: 1,
            renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-"
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace("_", " ").toUpperCase()}
                    color={
                        params.value === "open" ? "success" :
                        params.value === "pending" ? "warning" :
                        params.value === "cancelled" ? "error" :
                        params.value === "in_discussion" ? "default" :
                        params.value === "booked" ? "primary" :
                        params.value === "closed" ? "secondary" :
                        "default"
                    }
                    size="small"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        if (!params?.row?.id || !params?.row?.contract_type?.contract_name) return;
                        setSelectedStatusUpdate({ id: params.row.id, status: params.row.status });
                        setShowStatusUpdateModal(true);
                    }}
                />
            ),
        },
        { field: "created_at", headerName: "Created At", minWidth: 150, flex: 1 },
        { field: "updated_at", headerName: "Updated At", minWidth: 150, flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 100,
            flex: 0,
            renderCell: (params) => (
                <div className="action-btns">
                    <IconButton size="small"  style={{ padding: 2 }} color="success"  
                        onClick={() => {
                            if (!params?.row?.id || !params?.row?.contract_type?.contract_name) return;
                            console.log(params?.row?.contract_type?.contract_name);
                            handleShowModal(params.row.id, params.row.contract_type.contract_name);
                        }} 
                    >
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        style={{ padding: 2 }}
                        color="primary"
                        onClick={() => {
                            if (!params?.row?.user_id) return;
                            sessionStorage.setItem("selected_contract_user_id", params.row.user_id);
                            navigate(`/admin/contracts/${params.row.id}/edit`)
                        }}
                    >
                        <EditIcon />
                    </IconButton>

                    <IconButton
                        size="small"
                        style={{ padding: 2 }}
                        color="error"
                        onClick={async () => {
                            const status = await deleteContractService({ contractId: params.row.id });
                            if (status) initializeStateHelper();
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    return {
        menu,
        navigate,
        sessionUserRole,
        contracts,
        action,
        columns,
        show,
        setShow,
        ContractModel,
        showContractData,
        showStatusUpdateModal,
        setShowStatusUpdateModal,
        selectedStatusUpdate,
        initializeStateHelper,
        setContracts
    };
};
