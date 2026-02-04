import React, { useState, useEffect } from "react";
import { getContractApplicationsService, updateContractApplicationsStatus, getMyCandidatesService } from "@services/institute/ContractApplicationsService";
import { getUserProfileService } from "@services/institute/ProfileService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { upperCaseWords } from "@utils/StringUtils";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import { Chip, IconButton, Tooltip, Badge } from "@mui/material";

import { CONTRACT_MODAL_COMPONENTS_LIST } from "@constants/ContractModalConstants";
import { CONTRACT_APPLICATION_STATUS } from "@constants/ContractApplicationConstants";
import { cleanContractName } from "@utils/StringUtils";
import { useFilterContract } from "@hooks/institute/contract-applications/useFilterContract";


export const useViewContractApplications = () => {
    const menu = "contract applications";
    const action = "View";
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [applications, setApplications] = useState([]);
    const [userCategory, setUserCategory] = useState(null);
    const [searchParams] = useSearchParams();
    const contractIdParam = searchParams.get("contract_id");

    // modal state variables for contract details
    const [showContractData, setShowContractData] = useState(null);
    const [show, setShow] = useState(false);
    const [ContractModel, setContractModel] = useState(null);

    // modal state variables for viewing candidates
    const [showCandidatesModal, setShowCandidatesModal] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [selectedApplicationData, setSelectedApplicationData] = useState(null);

    const initializeStateHelper = async () => {
        try {
            // Pass contract_id filter to backend if present in URL
            const filters = contractIdParam ? { contract_id: contractIdParam } : {};
            const data = await getContractApplicationsService({ filters });
            const applications = Array.isArray(data) ? data : [];
            setApplications(applications);
        } catch (error) {
            console.log("Error", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const profileData = await getUserProfileService();
            if (profileData?.category?.name) {
                setUserCategory(profileData.category.name);
                // console.log("User category:", profileData.category.name);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        fetchUserProfile();
    }, [contractIdParam]);
    useEffect(() => { document.title = `${upperCaseWords(menu ?? "Quicklocum")} | Quicklocum`; }, []);

    // Check if user is headhunter or recruitment agency based on category
    const isHeadhunterOrAgency = () => {
        if (!userCategory) return false;

        const categoryLower = userCategory.toLowerCase();
        const isMatch = categoryLower === "head hunter" || categoryLower === "recruitment agency";

        // console.log("User category:", userCategory);
        // console.log("Is headhunter/agency:", isMatch);

        return isMatch;
    };

    const handleViewCandidates = async (application) => {
        try {
            console.log("Viewing candidates for application:", application);

            // Fetch unmasked candidates data from the new endpoint
            const response = await getMyCandidatesService(application.id);

            if (response && response.candidates && response.candidates.length > 0) {
                console.log("Found unmasked candidates:", response.candidates);
                setSelectedCandidates(response.candidates);
                setSelectedApplicationData({
                    ...application,
                    status: response.application_status
                });
                setShowCandidatesModal(true);
            } else {
                // Fallback to existing data if endpoint fails
                const candidates = application.additional_information || [];
                console.log("Fallback to existing candidates:", candidates);

                if (candidates.length === 0) {
                    console.warn("No candidates found for this application");
                    alert("No candidates found for this application");
                    return;
                }

                setSelectedCandidates(candidates);
                setSelectedApplicationData(application);
                setShowCandidatesModal(true);
            }
        } catch (error) {
            console.error("Error viewing candidates:", error);
        }
    };

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
        // Show candidates count column only for headhunters/agencies
        ...(isHeadhunterOrAgency() ? [{
            field: "candidates_count",
            headerName: "Candidates",
            width: 120,
            renderCell: (params) => {
                const count = params?.row?.additional_information?.length || 0;
                return (
                    <Tooltip title={`${count} candidate(s) proposed`}>
                        <Badge badgeContent={count} color="primary">
                            <PeopleIcon color="action" />
                        </Badge>
                    </Tooltip>
                );
            }
        }] : []),
        {
            field: "status",
            headerName: "Application Status",
            minWidth: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                    color={
                        params.value === "pending" ? "warning" :
                        params.value === "accepted" ? "success" :
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
            minWidth: 150,
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
            minWidth: 160,
            flex: 1,
            renderCell: (params) =>
                params.value ? new Date(params.value).toLocaleString() : "-"
        },
        {
            field: "contract_start_date",
            headerName: "Contract Start",
            minWidth: 150,
            flex: 1,
            renderCell: (params) =>
                params?.row?.contract?.start_date
                    ? new Date(params?.row?.contract?.start_date).toLocaleDateString()
                    : "-"
        },
        {
            field: "contract_end_date",
            headerName: "Contract End",
            minWidth: 150,
            flex: 1,
            renderCell: (params) =>
                params?.row?.contract?.end_date
                    ? new Date(params?.row?.contract?.end_date).toLocaleDateString()
                    : "-"
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: isHeadhunterOrAgency() ? 120 : 80,
            flex: 0,
            renderCell: (params) => (
                <div className="action-btns" style={{ display: 'flex', gap: '4px' }}>
                    {/* View Candidates Button - Only for headhunters/agencies */}
                    {isHeadhunterOrAgency() && (
                        <Tooltip title="View Proposed Candidates">
                            <IconButton
                                size="small"
                                style={{ padding: 2 }}
                                color="primary"
                                onClick={() => handleViewCandidates(params.row)}
                            >
                                <PeopleIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* View Contract Details Button */}
                    <Tooltip title="View Contract Details">
                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="success"
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
                    </Tooltip>

                    {/* Withdraw Application Button */}
                    <Tooltip title="Withdraw Application">
                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="error"
                            disabled={params?.row?.status === CONTRACT_APPLICATION_STATUS.WITHDRAWN}
                            onClick={async () => {
                                try {
                                    if (params?.row?.status === CONTRACT_APPLICATION_STATUS.WITHDRAWN) return;
                                    const application = {
                                        id: params?.row?.id,
                                        status: CONTRACT_APPLICATION_STATUS.WITHDRAWN
                                    };
                                    const status = await updateContractApplicationsStatus({ application });
                                    if (status) initializeStateHelper();
                                } catch (error) {
                                    console.log("Error", error);
                                }
                            }}
                        >
                            <CancelIcon />
                        </IconButton>
                    </Tooltip>
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
        rows: applications,
        action,
        columns,
        setApplications,
        show,
        setShow,
        ContractModel,
        showContractData,
        useFilterHook: useFilterContract,
        // New returns for candidates modal
        showCandidatesModal,
        setShowCandidatesModal,
        selectedCandidates,
        selectedApplicationData,
        // Functions for button actions
        handleViewCandidates,
        handleShowModal,
        initializeStateHelper,
    };
};