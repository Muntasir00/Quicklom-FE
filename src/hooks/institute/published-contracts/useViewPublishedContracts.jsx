import React, { useState, useEffect } from "react";
import { getPublishedContractsService, applyToContractService } from "@services/institute/PublishedContractService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Chip, IconButton, Tooltip } from "@mui/material";
import ApplyIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { upperCaseFirst } from "@utils/StringUtils";
import { GridActionsCellItem } from "@mui/x-data-grid";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CONTRACT_MODAL_COMPONENTS_LIST } from "@constants/ContractModalConstants";
import { cleanContractName } from "@utils/StringUtils";
import { useFilterContract } from "@hooks/institute/published-contracts/useFilterContract";



export const useViewPublishedContracts = () => {
    const menu = "job offers";
    const action = "View";
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [contracts, setContracts] = useState([]);
    const [searchParams] = useSearchParams();
    const contractIdParam = searchParams.get("contract_id");

    // modal state variables
    const [showForm, setShowForm] = useState(false);
    const [showContractData, setShowContractData] = useState(null);
    const [show, setShow] = useState(false);
    const [ContractModel, setContractModel] = useState(null);
    const [selectedContractId, setSelectedContractId] = useState(null);

    const initializeStateHelper = async () => {
        try {
            const contractsData = await getPublishedContractsService();
            let filteredContracts = Array.isArray(contractsData) ? contractsData : [];

            // If contract_id is in URL params, filter to show only that contract
            if (contractIdParam) {
                filteredContracts = filteredContracts.filter(c => c.id === parseInt(contractIdParam));
            }

            setContracts(filteredContracts);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => { initializeStateHelper(); }, [contractIdParam]);
    useEffect(() => { document.title = `${upperCaseFirst(menu ?? "Quicklocum")} | Quicklocum`; }, []);

    const columns = [
        {
            field: "id",
            headerName: "#",
            width: 60,
            renderCell: (params) => (
                <span style={{fontWeight: "800", color: "#5a67d8", fontSize: "12px"}}>
                    #{params.value}
                </span>
            )
        },
        {
            field: "contract_type",
            headerName: "Contract",
            minWidth: 180,
            flex: 1,
            renderCell: (params) => params.value ? (
                <div style={{display: "flex", alignItems: "center"}}>
                    <i className="fas fa-file-contract mr-2" style={{color: "#667eea", fontSize: "13px"}}></i>
                    <span style={{fontWeight: "700", color: "#2c3e50", fontSize: "12px"}}>{params.value.contract_name}</span>
                </div>
            ) : "-"
        },
        {
            field: "publisher_name",
            headerName: "Publisher",
            minWidth: 160,
            flex: 1,
            renderCell: (params) => params?.row?.published_by ? (
                <div style={{display: "flex", alignItems: "center", width: "100%", height: "100%", overflow: "visible"}}>
                    <i className="fas fa-user-tie mr-2" style={{color: "#667eea", fontSize: "13px", flexShrink: 0}}></i>
                    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", flex: 1}}>
                        <div style={{fontWeight: "700", fontSize: "11px", color: "#2c3e50", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                            {params?.row?.published_by?.name}
                        </div>
                        <small style={{color: "#6c757d", fontSize: "10px", fontWeight: "600", lineHeight: "1.3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                            {params?.row?.published_by?.email}
                        </small>
                    </div>
                </div>
            ) : "-"
        },
        {
            field: "start_date",
            headerName: "Start",
            minWidth: 100,
            width: 100,
            renderCell: (params) => params.value ? (
                <div style={{display: "flex", alignItems: "center"}}>
                    <i className="far fa-calendar-check mr-1" style={{color: "#10b981", fontSize: "12px"}}></i>
                    <span style={{fontWeight: "700", color: "#2c3e50", fontSize: "11px"}}>{new Date(params.value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                    })}</span>
                </div>
            ) : "-"
        },
        {
            field: "end_date",
            headerName: "End",
            minWidth: 100,
            width: 100,
            renderCell: (params) => params.value ? (
                <div style={{display: "flex", alignItems: "center"}}>
                    <i className="far fa-calendar-times mr-1" style={{color: "#ef4444", fontSize: "12px"}}></i>
                    <span style={{fontWeight: "700", color: "#2c3e50", fontSize: "11px"}}>{new Date(params.value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                    })}</span>
                </div>
            ) : "-"
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 100,
            width: 100,
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
        // ✅ NEW: Application Status Column
        {
            field: "application_status",
            headerName: "App Status",
            minWidth: 110,
            width: 110,
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
        {
            field: "created_at",
            headerName: "Created",
            minWidth: 100,
            width: 100,
            renderCell: (params) => params.value ? (
                <div style={{display: "flex", alignItems: "center"}}>
                    <i className="far fa-clock mr-1" style={{color: "#667eea", fontSize: "10px"}}></i>
                    <small style={{fontWeight: "700", color: "#2c3e50", fontSize: "9px"}}>{new Date(params.value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                    })}</small>
                </div>
            ) : "-"
        },
        {
            field: "updated_at",
            headerName: "Updated",
            minWidth: 100,
            width: 100,
            renderCell: (params) => params.value ? (
                <div style={{display: "flex", alignItems: "center"}}>
                    <i className="far fa-clock mr-1" style={{color: "#667eea", fontSize: "10px"}}></i>
                    <small style={{fontWeight: "700", color: "#2c3e50", fontSize: "9px"}}>{new Date(params.value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                    })}</small>
                </div>
            ) : "-"
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 200,
            width: 200,
            sortable: false,
            renderCell: (params) => {
                const hasApplied = params.row?.user_application?.has_applied;

                return (
                    <div style={{display: "flex", gap: "6px", alignItems: "center"}}>
                        {/* Apply Button or Applied Status */}
                        {!hasApplied ? (
                            <Tooltip title="Apply to contract" arrow>
                                <Chip
                                    label="APPLY"
                                    color="primary"
                                    size="small"
                                    onClick={async () => {
                                        try {
                                            const contractId = params?.row?.id;
                                            if (!contractId) return;
                                            setSelectedContractId(contractId ?? null);
                                            setShowForm(true);
                                        } catch (error) {
                                            console.error("Error:", error);
                                        }
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        fontWeight: "700",
                                        fontSize: "10px",
                                        height: "26px",
                                        padding: "0 10px"
                                    }}
                                />
                            </Tooltip>
                        ) : (
                            <Tooltip title="Application submitted" arrow>
                                <Chip
                                    label="APPLIED"
                                    color="success"
                                    size="small"
                                    style={{
                                        cursor: "not-allowed",
                                        fontWeight: "700",
                                        fontSize: "10px",
                                        height: "26px",
                                        padding: "0 10px"
                                    }}
                                />
                            </Tooltip>
                        )}

                        {/* View Details Button */}
                        <Tooltip title="View contract details" arrow>
                            <Chip
                                label="VIEW"
                                color="info"
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    try {
                                        if (!params?.row?.id || !params?.row?.contract_type?.contract_name) return;
                                        handleShowModal(params.row.id, params.row.contract_type.contract_name);
                                    } catch(error) {
                                        console.error("Error:", error);
                                    }
                                }}
                                style={{
                                    cursor: "pointer",
                                    fontWeight: "700",
                                    fontSize: "10px",
                                    height: "26px",
                                    padding: "0 10px"
                                }}
                            />
                        </Tooltip>
                    </div>
                );
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
        showForm,           // form
        setShowForm,        // form
        show,               // modal data
        setShow,            // modal data
        ContractModel,      // modal data
        showContractData,   // modal data
        useFilterHook: useFilterContract,
        selectedContractId,
        setSelectedContractId,
        handleShowModal,
    };
};