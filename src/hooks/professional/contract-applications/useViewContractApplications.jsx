import React, { useState, useEffect } from "react";
import { getContractApplicationsService, updateContractApplicationsStatus } from "@services/professional/ContractApplicationsService";
import { useNavigate } from "react-router-dom";
import { Chip, IconButton } from "@mui/material";
import { upperCaseFirst } from "@utils/StringUtils";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';                    // Cancel / clear

import { CONTRACT_MODAL_COMPONENTS_LIST } from "@constants/ContractModalConstants";
import { CONTRACT_APPLICATION_STATUS } from "@constants/ContractApplicationConstants";
import { cleanContractName } from "@utils/StringUtils";
import { useFilterContract } from "@hooks/professional/contract-applications/useFilterContract";

import { useSearchParams } from "react-router-dom";


export const useViewContractApplications = () => {
    const menu = "contract applications";
    const action = "View";
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [applications, setApplications] = useState([]);
    
    // notification state variables and URL filters
    const [searchParams] = useSearchParams();
    const affectedEntityId = searchParams.get("affected_entity_id");
    const contractIdParam = searchParams.get("contract_id");
    const applicationIdParam = searchParams.get("application_id");

    // modal state variables
    const [showContractData, setShowContractData] = useState(null);
    const [show, setShow] = useState(false);
    const [ContractModel, setContractModel] = useState(null);

    const initializeStateHelper = async (newFilters) => {
        try {
            const activeFilters = newFilters ?? filters;
            const data = await getContractApplicationsService({filters: activeFilters});
            setApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error in initializeStateHelper:", error);
        }
    };

    const [filters, setFilters] = useState({
        affected_entity_id: "",
        contract_id: "",
        application_id: "",
    });

    useEffect(() => {
        try {
            const newFilters = {
                ...filters,
                affected_entity_id: affectedEntityId ?? "",
                contract_id: contractIdParam ?? "",
                application_id: applicationIdParam ?? "",
            };
            setFilters(newFilters);
            initializeStateHelper(newFilters);
        } catch (error) {
            console.error("Error in useEffect initializeStateHelper:", error);
        }
    }, [affectedEntityId, contractIdParam, applicationIdParam]);

    useEffect(() => { document.title = `${upperCaseFirst(menu ?? "Quicklocum")} | Quicklocum`; }, []);

    const columns = [
        { field: "id", headerName: "#", width: 70 },
        {
            field: "contract_title",
            headerName: "Contract Title",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => {
                const contract = params?.row?.contract;
                if (!contract) return "-";

                const jobTitle = contract.data?.job_title;
                if (jobTitle) return jobTitle;

                return contract.contract_type?.contract_name || "-";
            }
        },
        {
            field: "status",
            headerName: "Application Status",
            minWidth: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                    color={
                        params.value === "pending" ? "warning" :
                        params.value === "approved" ? "success" :
                        params.value === "rejected" ? "error" :
                        "default"
                    }
                    size="small"
                />
            ),
        },
        {
            field: "contract_status",
            headerName: "Contract Status",
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    label={params?.row?.contract?.status?.toUpperCase() || "-"}
                    color={
                        params?.row?.contract?.status === "open" ? "success" :
                        params?.row?.contract?.status === "closed" ? "secondary" :
                        params?.row?.contract?.status === "cancelled" ? "error" :
                        "default"
                    }
                    size="small"
                />
            ),
        },
        {
            field: "applied_at",
            headerName: "Applied At",
            minWidth: 150,
            flex: 1,
            renderCell: (params) =>
                params.value ? new Date(params.value).toLocaleString() : "-"
        },
        {
            field: "contract_start_date",
            headerName: "Contract Start",
            minWidth: 100,
            flex: 1,
            renderCell: (params) =>
                params?.row?.contract?.start_date
                    ? new Date(params?.row?.contract?.start_date).toLocaleDateString()
                    : "-"
        },
        {
            field: "contract_end_date",
            headerName: "Contract End",
            minWidth: 100,
            flex: 1,
            renderCell: (params) =>
                params?.row?.contract?.end_date
                    ? new Date(params?.row?.contract?.end_date).toLocaleDateString()
                    : "-"
        },
        {
            field: "actions",
            headerName: "Actions",
            maxWidth: 80,
            flex: 0,
            renderCell: (params) => (
                <div className="action-btns">
                    <IconButton size="small"  style={{ padding: 2 }} color="success"  
                        onClick={() => {
                            try {
                                const contractId = params?.row?.contract_id || "";
                                const contractName = params?.row?.contract?.contract_type?.contract_name || "";
                                if (!contractId || !contractName) return;
                                console.log({ contractId, contractName });
                                handleShowModal(contractId, contractName);
                            } catch (error) {
                                console.log("Error", error);
                            }
                        }} 
                    >
                        <VisibilityIcon />
                    </IconButton>

                    <IconButton size="small" style={{ padding: 2 }} color="error"
                        onClick={async () => {
                            try {
                                if (params?.row?.status == CONTRACT_APPLICATION_STATUS.WITHDRAWN) return;
                                const application = {id: params?.row?.id, status: CONTRACT_APPLICATION_STATUS.WITHDRAWN};
                                const status = await updateContractApplicationsStatus({ application });
                                if (status) initializeStateHelper();
                            } catch (error) {
                                console.log("Error", error);
                            }
                        }}
                    >
                        <CancelIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    const handleShowModal = (contractId, contractName) => {
        try {
            const selectedContract = cleanContractName(contractName);
            const ModalComponent = CONTRACT_MODAL_COMPONENTS_LIST[selectedContract];
            const contractData = applications?.find(item => item?.contract_id === contractId);

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

            const data = { 
                ...contractData?.contract,
                ...contractData?.contract?.data, 
            };
                        
            setShowContractData(data ?? null);
            setContractModel(() => ModalComponent); // save the component
            setShow(true);
        } catch (error) {
            console.error("Error in handleShowModal:", error);
        }
    };

    return {
        menu,
        navigate,
        sessionUserRole,
        rows: applications,
        action,
        columns,
        setApplications,
        show,               // modal data
        setShow,            // modal data
        ContractModel,      // modal data
        showContractData,   // modal data
        useFilterHook: useFilterContract,
        handleShowModal,
        updateContractApplicationsStatus,
        initializeStateHelper,
    };
};
