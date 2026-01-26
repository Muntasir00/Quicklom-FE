import React, { useState, useEffect } from "react";
import { getPublishedContractsService, applyToContractService } from "@services/professional/PublishedContractService";
import { useNavigate } from "react-router-dom";
import { Chip, IconButton, Tooltip } from "@mui/material";
import ApplyIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { upperCaseFirst } from "@utils/StringUtils";
import { GridActionsCellItem } from "@mui/x-data-grid";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CONTRACT_MODAL_COMPONENTS_LIST } from "@constants/ContractModalConstants";
import { cleanContractName } from "@utils/StringUtils";
import { useFilterContract } from "@hooks/professional/published-contracts/useFilterContract";

export const useViewPublishedContracts = () => {
    const menu = "job offers";
    const action = "View";
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [contracts, setContracts] = useState([]);

    // modal state variables (only for viewing contract details)
    const [showContractData, setShowContractData] = useState(null);
    const [show, setShow] = useState(false);
    const [ContractModel, setContractModel] = useState(null);

    const initializeStateHelper = async () => {
        try {
            const contractsData = await getPublishedContractsService();
            console.log("Raw contracts data:", contractsData);
            console.log("First contract:", contractsData?.[0]);
            console.log("First contract ID:", contractsData?.[0]?.id);
            setContracts(Array.isArray(contractsData) ? contractsData : []);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => { initializeStateHelper(); }, []);
    useEffect(() => { document.title = `${upperCaseFirst(menu ?? "Quicklocum")} | Quicklocum`; }, []);

    // Direct application handler
    const handleApplyToContract = async (contractId) => {
        try {
            console.log("handleApplyToContract called with contractId:", contractId);
            console.log("contractId type:", typeof contractId);

            if (!contractId || isNaN(contractId)) {
                console.error("Invalid contract ID:", contractId);
                alert("Error: Invalid contract ID");
                return;
            }

            console.log("Applying to contract:", contractId);

            // Call the API to apply directly - pass as object with contractId property
            const response = await applyToContractService({ contractId });

            if (response) {
                console.log("Application successful:", response);
                // Refresh the contracts list to update the UI
                await initializeStateHelper();
            }
        } catch (error) {
            console.error("Error applying to contract:", error);
            console.error("Error details:", error.response?.data);
        }
    };

    const columns = [
        { field: "id", headerName: "#", width: 70 },
        {
            field: "contract_type",
            headerName: "Contract Type Name",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => params.value ? params.value.contract_name : "-"
        },
        {
            field: "publisher_name",
            headerName: "Publisher Name",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => params?.row?.published_by ? params?.row?.published_by?.name : "-"
        },
        {
            field: "publisher_email",
            headerName: "Publisher Email",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => params?.row?.published_by ? params?.row?.published_by?.email : "-"
        },
        {
            field: "start_date",
            headerName: "Start Date",
            minWidth: 120,
            flex: 1,
            renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-"
        },
        {
            field: "end_date",
            headerName: "End Date",
            minWidth: 120,
            flex: 1,
            renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-"
        },
        {
            field: "status",
            headerName: "Contract Status",
            minWidth: 140,
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
        // Application Status Column
        {
            field: "application_status",
            headerName: "Application Status",
            minWidth: 180,
            flex: 1,
            renderCell: (params) => {
                const userApplication = params.row?.user_application;

                if (!userApplication?.has_applied) {
                    return (
                        <Chip
                            label="NOT APPLIED"
                            color="default"
                            size="small"
                            variant="outlined"
                        />
                    );
                }

                return (
                    <Tooltip title={`Applied on ${new Date(userApplication.applied_at).toLocaleString()}`}>
                        <Chip
                            label={userApplication.status?.replace("_", " ").toUpperCase()}
                            color={
                                userApplication.status === "pending" ? "warning" :
                                userApplication.status === "accepted" ? "success" :
                                userApplication.status === "rejected" ? "error" :
                                userApplication.status === "withdrawn" ? "default" :
                                "default"
                            }
                            size="small"
                            icon={<CheckCircleIcon />}
                        />
                    </Tooltip>
                );
            },
        },
        { field: "created_at", headerName: "Created At", minWidth: 150, flex: 1 },
        { field: "updated_at", headerName: "Updated At", minWidth: 150, flex: 1 },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            minWidth: 150,
            flex: 1,
            getActions: (params) => {
                console.log("getActions called");
                console.log("params.id:", params.id);
                console.log("params.row:", params.row);
                console.log("params.row?.id:", params.row?.id);

                const hasApplied = params.row?.user_application?.has_applied;
                // Try to get ID from multiple sources
                const contractId = params.id || params.row?.id;

                console.log("Resolved contractId:", contractId);

                const actions = [];

                // Only show APPLY button if user hasn't applied yet
                if (!hasApplied) {
                    actions.push(
                        <GridActionsCellItem
                            icon={
                                <Chip
                                    label="APPLY"
                                    color="primary"
                                    size="small"
                                    style={{ cursor: "pointer" }}
                                />
                            }
                            label="Apply"
                            onClick={() => {
                                console.log("=== APPLY BUTTON CLICKED ===");
                                console.log("Captured contractId:", contractId);
                                console.log("params at click time:", params);

                                if (!contractId) {
                                    console.error("No contract ID available");
                                    alert("Error: Contract ID not found");
                                    return;
                                }
                                handleApplyToContract(contractId);
                            }}
                        />
                    );
                } else {
                    // Show status chip instead of apply button
                    actions.push(
                        <GridActionsCellItem
                            icon={
                                <Chip
                                    label="APPLIED"
                                    color="success"
                                    size="small"
                                    icon={<CheckCircleIcon />}
                                    style={{ cursor: "not-allowed" }}
                                />
                            }
                            label="Already Applied"
                            disabled
                        />
                    );
                }

                // View Contract button (always visible)
                actions.push(
                    <GridActionsCellItem
                        icon={
                            <IconButton size="small" style={{ padding: 2 }} color="success">
                                <VisibilityIcon />
                            </IconButton>
                        }
                        label="View Contract"
                        showInMenu
                        onClick={() => {
                            try {
                                if (!params?.row?.id || !params?.row?.contract_type?.contract_name) return;
                                console.log(params?.row?.contract_type?.contract_name);
                                handleShowModal(params.row.id, params.row.contract_type.contract_name);
                            } catch(error) {
                                console.error("Error:", error);
                            }
                        }}
                    />
                );

                return actions;
            },
        }
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

            const data = { ...contractData, ...contractData?.data };

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
        rows: contracts,
        action,
        columns,
        setContracts,
        show,               // modal data (for contract details only)
        setShow,            // modal data
        ContractModel,      // modal data
        showContractData,   // modal data
        useFilterHook: useFilterContract,
        handleShowModal,
        handleApplyToContract,
    };
};