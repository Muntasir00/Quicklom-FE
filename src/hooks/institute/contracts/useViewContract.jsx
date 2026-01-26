import React, { useState, useEffect } from "react";
import { getContractsService, deleteContractService } from "@services/institute/ContractService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Chip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { upperCaseFirst } from "@utils/StringUtils";
import { useFilterContract } from "@hooks/institute/contracts/useFilterContract";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CONTRACT_MODAL_COMPONENTS_LIST } from "@constants/ContractModalConstants";
import { cleanContractName } from "@utils/StringUtils"


export const useViewContract = () => {
    const menu = "contracts";
    const action = "View";
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [searchParams] = useSearchParams();

    // modal state variables
    const [contracts, setContracts] = useState([]);
    const [showContractData, setShowContractData] = useState(null);
    const [show, setShow] = useState(false);
    const [ContractModel, setContractModel] = useState(null);
    const affectedEntityId = searchParams.get("affected_entity_id");
    const contractId = searchParams.get("contract_id");
    const filterParam = searchParams.get("filter");

    const [filters, setFilters] = useState({
        affected_entity_id: "",
        contract_id: "",
        filter: "",
    });

    const initializeStateHelper = async (newFilters) => {
        try {
            const activeFilters = newFilters ?? filters;
            const contractsData = await getContractsService({ filters: activeFilters });
            setContracts(Array.isArray(contractsData) ? contractsData : []);
        } catch (error) {
            console.error("Error", error);
        }
    };

    useEffect(() => {
        try {
            const newFilters = {
                ...filters,
                affected_entity_id: affectedEntityId ?? "",
                contract_id: contractId ?? "",
                filter: filterParam ?? "",
            };

            setFilters(newFilters);
            initializeStateHelper(newFilters);
        } catch (error) {
            console.error("Error occured:", error);
        }
    }, [affectedEntityId, contractId, filterParam]);

    useEffect(() => { document.title = `${upperCaseFirst(menu ?? "Quicklocum")} | Quicklocum`;}, []);

    const columns = [
        { field: "id", headerName: "#", maxWidth: 50, flex: 1 },
        { field: "contract_type", headerName: "Contract Type Name", minWidth: 200, flex: 1,
            renderCell: (params) => params.value ? params.value.contract_name : "-"
        },
        { field: "publisher_name", headerName: "Publisher Name", minWidth: 200, flex: 1,
            renderCell: (params) => params?.row?.published_by ? params?.row?.published_by?.name : "-"
        },
        { field: "publisher_email", headerName: "Publisher Email", minWidth: 200, flex: 1,
            renderCell: (params) => params?.row?.published_by ? params?.row?.published_by?.email : "-"
        },
        { field: "start_date", headerName: "Start Date", minWidth: 120, flex: 1,
            renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-"
        },
        { field: "end_date", headerName: "End Date", minWidth: 120, flex: 1,
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
                />
            ),
        },
        { field: "created_at", headerName: "Created At", minWidth: 150, flex: 1 },
        { field: "updated_at", headerName: "Updated At", minWidth: 150, flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 100,
            flex: 1,
            renderCell: (params) => (
                <div className="action-btns">
                    <IconButton size="small"  style={{ padding: 2 }} color="success"
                        onClick={() => {
                            try {
                                if (!params?.row?.id || !params?.row?.contract_type?.contract_name) return;
                                console.log(params?.row?.contract_type?.contract_name);
                                handleShowModal(params.row.id, params.row.contract_type.contract_name);
                            } catch (error) {
                                console.error("Error", error);
                            }
                        }}
                    >
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        style={{ padding: 2 }}
                        color="primary"
                        onClick={() => navigate(`/${sessionUserRole}/contracts/${params.row.id}/edit`)}
                    >
                        <EditIcon />
                    </IconButton>

                    <IconButton
                        size="small"
                        style={{ padding: 2 }}
                        color="error"
                        onClick={ async () => {
                            try {
                                const status = await deleteContractService({ contractId: params.row.id });
                                if (status) initializeStateHelper();
                            } catch (error) {
                                console.error("Error", error);
                            }
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    const handleShowModal = (contractId, contractName) => {
        try {
            const selectedContract = cleanContractName(contractName);
            const ModalComponent = CONTRACT_MODAL_COMPONENTS_LIST[selectedContract];
            const contractData = contracts?.find(item => item.id === contractId);

            if (!ModalComponent || !contractData || Object.keys(contractData).length === 0) {
                console.error(
                    "Cannot open contract modal. Issues detected:",
                    !ModalComponent ? "- Modal component is missing" : "",
                    !contractData ? "- contractData is undefined or null" : "",
                    contractData && Object.keys(contractData).length === 0 ? "- contractData is empty" : "",
                    "\nContract name:", contractName
                );
                return;
            }

            // FIXED: Properly flatten the data and convert objects to strings/primitives
            const flattenedData = {
                ...contractData,
                ...contractData?.data,
                // Convert nested objects to strings for display
                contract_type_name: contractData?.contract_type?.contract_name || "",
                contract_type_id: contractData?.contract_type?.id || "",
                contract_type_description: contractData?.contract_type?.description || "",
                publisher_name: contractData?.published_by?.name || "",
                publisher_email: contractData?.published_by?.email || "",
            };

            // Remove the nested objects to prevent React from trying to render them
            delete flattenedData.contract_type;
            delete flattenedData.published_by;

            console.log("Flattened contract data:", flattenedData);

            setShowContractData(flattenedData);
            setContractModel(() => ModalComponent);
            setShow(true);
        } catch (error) {
            console.error("Error in handleShowModal:", error);
        }
    };

    return {
        menu,
        navigate,
        sessionUserRole,
        contracts,
        action,
        columns,
        setContracts,
        useFilterHook: useFilterContract,
        show,               // modal data
        setShow,            // modal data
        ContractModel,      // modal data
        showContractData,   // modal data
        handleShowModal,    // ADDED: Export the function so it can be used in card view
        filters,            // Export filters for active filter indicator
        searchParams,       // Export searchParams for URL manipulation
    };
};