import React, { useState, useEffect } from "react";
import {
    getContractApplicantsService,
    acceptContractApplicant,
    rejectContractApplicant,
    updateContractApplicantsStatus
} from "@services/institute/ContractApplicantsService";
import { useFilterContractApplicants } from "@hooks/institute/contract-applicants/useFilterContractApplicants";
import { useNavigate, useSearchParams } from "react-router-dom";
import { upperCaseWords, cleanContractName } from "@utils/StringUtils";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from '@mui/icons-material/People';
import { Chip, IconButton, Tooltip, Badge, CircularProgress } from "@mui/material";
import { CONTRACT_MODAL_COMPONENTS_LIST } from "@constants/ContractModalConstants";
import { CONTRACT_APPLICATION_STATUS } from "@constants/ContractApplicationConstants";
import { GridActionsCellItem } from "@mui/x-data-grid";


export const useViewContractApplicants = () => {
    const menu = "contract applicants";
    const action = "View";
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [searchParams] = useSearchParams();

    // URL param filters for notification navigation
    const applicationIdParam = searchParams.get("application_id");
    const contractIdParam = searchParams.get("contract_id");

    const [applicants, setApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoadingStates, setActionLoadingStates] = useState({});

    // Modal control for contract details
    const [showContractData, setShowContractData] = useState(null);
    const [show, setShow] = useState(false);
    const [ContractModel, setContractModel] = useState(null);

    // Modal control for user profile
    const [modalProfileData, setModalProfileData] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // status update state variables
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [selectedStatusUpdate, setSelectedStatusUpdate] = useState({id: null, status: ""});

    // Modal control for candidates (NEW)
    const [showCandidatesModal, setShowCandidatesModal] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [selectedApplicationData, setSelectedApplicationData] = useState(null);

    // Confirmation modal state (NEW)
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAcceptAction, setPendingAcceptAction] = useState(null);
    const [isProcessingAccept, setIsProcessingAccept] = useState(false);

    // Filter hook
    const useFilterHook = useFilterContractApplicants();

    // Set loading state for specific action
    const setActionLoading = (applicationId, action, isLoading) => {
        setActionLoadingStates(prev => ({
            ...prev,
            [`${applicationId}-${action}`]: isLoading
        }));
    };

    // Check if specific action is loading
    const isActionLoading = (applicationId, action) => {
        return actionLoadingStates[`${applicationId}-${action}`] || false;
    };

    // Initialize applicants list
    const initializeStateHelper = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const data = await getContractApplicantsService();
            console.log("Applicants data:", data);
            setApplicants(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Error fetching applicants:", error);
            setApplicants([]);
        } finally {
            if (isRefresh) {
                setIsRefreshing(false);
            } else {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => { initializeStateHelper(); }, []);
    useEffect(() => { document.title = `${upperCaseWords(menu ?? "Quicklocum")} | Quicklocum`; }, []);

    // Filter applicants when URL params change or when applicants are loaded
    useEffect(() => {
        if (applicants.length === 0) {
            setFilteredApplicants([]);
            return;
        }

        let filtered = [...applicants];

        // Filter by application_id if provided
        if (applicationIdParam) {
            const appId = parseInt(applicationIdParam, 10);
            filtered = filtered.filter(a => a.id === appId);
        }

        // Filter by contract_id if provided
        if (contractIdParam) {
            const contractId = parseInt(contractIdParam, 10);
            filtered = filtered.filter(a => a.contract_id === contractId);
        }

        setFilteredApplicants(filtered);
    }, [applicants, applicationIdParam, contractIdParam]);

    // Check if applicant is headhunter, recruitment agency, or professional
    const getApplicantType = (applicant) => {
        try {
            const userProfiles = applicant?.user?.profiles;
            if (!userProfiles || userProfiles.length === 0) return "professional";

            const profile = userProfiles[0];
            const categoryId = profile?.institute_category_id;

            // Category IDs: 3 = Agency, 4 = Headhunter
            // If institute_category_id exists, it's an agency or headhunter
            // Otherwise, it's a professional (direct hire)
            if (categoryId === 3) return "agency";
            if (categoryId === 4) return "headhunter";

            return "professional";
        } catch (error) {
            console.error("Error checking category:", error);
            return "professional";
        }
    };

    // Get candidates count for an applicant
    const getCandidatesCount = (applicant) => {
        return applicant?.additional_information?.length || 0;
    };

    // Handle view candidates modal
    const handleViewCandidates = (applicant) => {
        try {
            console.log("Viewing candidates for applicant:", applicant);
            const candidates = applicant.additional_information || [];

            if (candidates.length === 0) {
                console.warn("No candidates found for this applicant");
                alert("No candidates found for this applicant");
                return;
            }

            setSelectedCandidates(candidates);
            setSelectedApplicationData(applicant);
            setShowCandidatesModal(true);
        } catch (error) {
            console.error("Error viewing candidates:", error);
        }
    };

    // Show confirmation modal or candidates modal before accepting
    const handleAcceptApplicantClick = (applicationId, applicantRow = null) => {
        // Check if this is an agency/headhunter with candidates
        const applicantType = applicantRow ? getApplicantType(applicantRow) : null;
        const candidatesCount = applicantRow ? getCandidatesCount(applicantRow) : 0;

        if (applicantType && candidatesCount > 0) {
            // Agency/headhunter with candidates - show candidates modal for selection
            console.log("Agency/headhunter application - showing candidates modal");
            handleViewCandidates(applicantRow);
        } else {
            // Professional or agency without candidates - show confirmation modal
            console.log("Professional application - showing confirmation modal");
            setPendingAcceptAction({ applicationId, candidateId: null });
            setShowConfirmModal(true);
        }
    };

    // Confirm and proceed with accept
    const handleConfirmAccept = async () => {
        if (!pendingAcceptAction || isProcessingAccept) return;

        const { applicationId, candidateId } = pendingAcceptAction;

        // Set processing state to prevent double clicks
        setIsProcessingAccept(true);

        // Close modal and clear state FIRST
        setShowConfirmModal(false);
        setPendingAcceptAction(null);

        try {
            setActionLoading(applicationId, 'accept', true);
            const success = await acceptContractApplicant({ applicationId, candidateId });
            if (success) {
                await initializeStateHelper(true); // Refresh with loading indicator
            }
        } catch (error) {
            console.error("Error accepting applicant:", error);
        } finally {
            setActionLoading(applicationId, 'accept', false);
            setIsProcessingAccept(false);
        }
    };

    // Cancel accept action
    const handleCancelAccept = () => {
        setShowConfirmModal(false);
        setPendingAcceptAction(null);
    };

    // Handle accepting a specific candidate from the candidates modal
    const handleAcceptCandidate = async (candidateId) => {
        if (!selectedApplicationData) {
            console.error("No application data selected");
            return;
        }

        const applicationId = selectedApplicationData.id;

        // Close the candidates modal
        setShowCandidatesModal(false);

        try {
            setActionLoading(applicationId, 'accept', true);
            const success = await acceptContractApplicant({ applicationId, candidateId });
            if (success) {
                await initializeStateHelper(true); // Refresh with loading indicator
            }
        } catch (error) {
            console.error("Error accepting candidate:", error);
        } finally {
            setActionLoading(applicationId, 'accept', false);
            // Clear selected data
            setSelectedCandidates([]);
            setSelectedApplicationData(null);
        }
    };

    // Handle reject applicant
    const handleRejectApplicant = async (applicationId, candidateId = null) => {
        try {
            setActionLoading(applicationId, 'reject', true);
            const success = await rejectContractApplicant({ applicationId, candidateId });
            if (success) {
                await initializeStateHelper(true); // Refresh with loading indicator
            }
        } catch (error) {
            console.error("Error rejecting applicant:", error);
        } finally {
            setActionLoading(applicationId, 'reject', false);
        }
    };

    const columns = [
        {
            field: "id",
            headerName: "#",
            width: 70,
            headerAlign: 'left',
            align: 'left',
        },
        {
            field: "applicant_name",
            headerName: "Applicant Name",
            minWidth: 200,
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => {
                const userName = params?.row?.user?.name || "-";
                const applicantType = getApplicantType(params.row);

                // Determine badge label and color based on applicant type
                let badgeLabel = "";
                let badgeColor = "default";

                if (applicantType === "headhunter") {
                    badgeLabel = "Headhunter";
                    badgeColor = "secondary";
                } else if (applicantType === "agency") {
                    badgeLabel = "Agency";
                    badgeColor = "info";
                } else if (applicantType === "professional") {
                    badgeLabel = "Direct Hire";
                    badgeColor = "success";
                }

                return (
                    <div className="d-flex align-items-center gap-2">
                        <span>{userName}</span>
                        {badgeLabel && (
                            <Chip
                                label={badgeLabel}
                                color={badgeColor}
                                size="small"
                                sx={{
                                    fontSize: '0.7rem',
                                    height: '20px',
                                    fontWeight: 600
                                }}
                            />
                        )}
                    </div>
                );
            },
        },
        {
            field: "contract_type",
            headerName: "Contract Type",
            minWidth: 150,
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            valueGetter: (value, row) => {
                return row?.contract?.contract_type?.contract_name || "-";
            },
        },
        {
            field: "contract_title",
            headerName: "Contract Title",
            minWidth: 200,
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            valueGetter: (value, row) => {
                return row?.contract?.data?.contract_name || row?.contract?.data?.position || "-";
            },
        },
        {
            field: "start_date",
            headerName: "Start Date",
            width: 120,
            headerAlign: 'left',
            align: 'left',
            valueGetter: (value, row) => {
                const startDate = row?.contract?.data?.startDate;
                if (!startDate) return "-";
                return new Date(startDate).toLocaleDateString();
            },
        },
        {
            field: "status",
            headerName: "Status",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const status = params.value?.toLowerCase() || "pending";
                let color = "default";
                let label = status;

                if (status === "accepted") {
                    color = "success";
                    label = "Accepted";
                } else if (status === "rejected") {
                    color = "error";
                    label = "Rejected";
                } else if (status === "pending") {
                    color = "warning";
                    label = "Pending";
                }

                return (
                    <Chip
                        label={label}
                        color={color}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                );
            },
        },
        {
            field: "candidates_count",
            headerName: "Candidates",
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const applicantType = getApplicantType(params.row);
                const candidatesCount = getCandidatesCount(params.row);

                // Only show candidates count for headhunters and agencies
                if ((applicantType !== "headhunter" && applicantType !== "agency") || candidatesCount === 0) {
                    return "-";
                }

                return (
                    <Chip
                        label={candidatesCount}
                        color="primary"
                        size="small"
                        icon={<PeopleIcon style={{ fontSize: '1rem' }} />}
                        sx={{ fontWeight: 600 }}
                    />
                );
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            type: "actions",
            width: 150,
            headerAlign: 'center',
            align: 'center',
            getActions: (params) => {
                const actions = [];
                const applicationId = params?.row?.id;
                const status = params?.row?.status?.toLowerCase();
                const isPending = status === "pending" || !status;
                const applicantType = getApplicantType(params.row);
                const candidatesCount = getCandidatesCount(params.row);

                // View Candidates action (only for agencies/headhunters with candidates)
                if (applicantType && candidatesCount > 0) {
                    actions.push(
                        <GridActionsCellItem
                            icon={
                                <IconButton size="small" style={{ padding: 2 }} color="primary">
                                    <PeopleIcon />
                                </IconButton>
                            }
                            label="View Candidates"
                            showInMenu
                            onClick={() => handleViewCandidates(params.row)}
                        />
                    );
                }

                // View Contract action
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
                                const contractId = params?.row?.contract_id || "";
                                const contractName = params?.row?.contract?.contract_type?.contract_name || "";
                                if (!contractId || !contractName) return;
                                handleShowModal(contractId, contractName);
                            } catch (error) {
                                console.log("Error opening contract modal:", error);
                            }
                        }}
                    />
                );

                // View Profile action
                actions.push(
                    <GridActionsCellItem
                        icon={
                            <IconButton size="small" style={{ padding: 2 }} color="info">
                                <VisibilityIcon />
                            </IconButton>
                        }
                        label="View Profile"
                        showInMenu
                        onClick={() => {
                            try {
                                const applicationId = params?.row?.id || "";
                                if (!applicationId) return;
                                handleShowProfileModal(applicationId);
                            } catch (error) {
                                console.log("Error:", error);
                            }
                        }}
                    />
                );

                // Accept action (only show if status is pending)
                if (isPending) {
                    const isAcceptLoading = isActionLoading(applicationId, 'accept');
                    actions.push(
                        <GridActionsCellItem
                            icon={
                                <IconButton
                                    className="d-none"
                                    size="small"
                                    style={{ padding: 2 }}
                                    color="success"
                                    disabled={isAcceptLoading}
                                >
                                    {isAcceptLoading ? (
                                        <CircularProgress size={20} color="success" />
                                    ) : (
                                        <CheckCircleIcon />
                                    )}
                                </IconButton>
                            }
                            label="Accept"
                            disabled={isAcceptLoading}
                            onClick={() => handleAcceptApplicantClick(applicationId, params.row)}
                        />
                    );
                }

                // Reject action (only show if status is pending)
                if (isPending) {
                    const isRejectLoading = isActionLoading(applicationId, 'reject');
                    actions.push(
                        <GridActionsCellItem
                            icon={
                                <IconButton
                                    className="d-none"
                                    size="small"
                                    style={{ padding: 2 }}
                                    color="error"
                                    disabled={isRejectLoading}
                                >
                                    {isRejectLoading ? (
                                        <CircularProgress size={20} color="error" />
                                    ) : (
                                        <CancelIcon />
                                    )}
                                </IconButton>
                            }
                            label="Reject"
                            disabled={isRejectLoading}
                            onClick={() => handleRejectApplicant(applicationId)}
                        />
                    );
                }

                return actions;
            },
        },
    ];

    const handleShowProfileModal = (applicationId) => {
        try {
            const applicantData = applicants?.find(item => item?.id === applicationId);

            if (!applicantData || Object.keys(applicantData).length === 0) {
                console.error("Cannot open profile modal. Application data not found.");
                return;
            }

            const modalData = {
                profile: applicantData?.user?.profiles[0]?.data || "",
                user_name: applicantData?.user?.name || "",
                user_email: applicantData?.user?.email || "",
                profile_status: applicantData?.user?.profiles[0]?.status || "",
                contract_positions: applicantData?.contract?.contract_positions || [],
                institute_category_id: applicantData?.user?.profiles[0]?.institute_category_id || null,
            };

            console.log("Profile modal data:", modalData);
            setModalProfileData(modalData ?? null);
            setShowProfileModal(true);
        } catch (error) {
            console.error("Error in handleShowProfileModal:", error);
        }
    };

    const handleShowModal = (contractId, contractName) => {
        try {
            const selectedContract = cleanContractName(contractName);
            const ModalComponent = CONTRACT_MODAL_COMPONENTS_LIST[selectedContract];
            const contractData = applicants?.find(item => item?.contract_id === contractId);

            if (!ModalComponent || !contractData || Object.keys(contractData).length === 0) {
                console.error(
                    "Cannot open contract modal. Problems detected:",
                    !ModalComponent ? "- Missing Modal component" : "",
                    !contractData ? "- contractData undefined" : "",
                    contractData && Object.keys(contractData).length === 0 ? "- contractData empty" : "",
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

    // Determine which rows to show (filtered if URL params present, otherwise all)
    const hasUrlFilter = applicationIdParam || contractIdParam;
    const displayRows = hasUrlFilter ? filteredApplicants : applicants;

    return {
        menu,
        navigate,
        sessionUserRole,
        rows: displayRows,
        action,
        columns,
        setApplicants,
        // URL filter info for UI feedback
        hasUrlFilter,
        applicationIdParam,
        contractIdParam,
        show,
        setShow,
        ContractModel,
        showContractData,
        modalProfileData,       // profile
        setModalProfileData,    // profile
        showProfileModal,       // profile
        setShowProfileModal,    // profile
        showStatusUpdateModal,
        setShowStatusUpdateModal,
        selectedStatusUpdate,
        initializeStateHelper,
        // New returns for candidates modal
        showCandidatesModal,
        setShowCandidatesModal,
        selectedCandidates,
        selectedApplicationData,
        handleAcceptCandidate,   // Handler for accepting from candidates modal
        // Confirmation modal (NEW)
        showConfirmModal,
        setShowConfirmModal,
        handleConfirmAccept,
        handleCancelAccept,
        isProcessingAccept,
        // Filter support
        useFilterHook,
        // Loading states
        isLoading,
        isRefreshing,
        isActionLoading,
    };
};