import {useState, useMemo} from "react";
import {Link} from "react-router-dom";
import {useViewContractApplications} from "@hooks/professional/contract-applications/useViewContractApplications";
import Filter from "@components/forms/ContractApplicationFilterForm";
import {CONTRACT_APPLICATION_STATUS} from "@constants/ContractApplicationConstants";
// import "./ApplicationsStyles.css";
import MetricsGrid from "@pages/professional/contract-applications/metrics-grid.jsx";
import ApplicantCard from "@pages/professional/contract-applications/applicant-card.jsx";
import {FilterIcon, ListFilter, List, Inbox, Search, Briefcase} from "lucide-react";

const View = () => {
    const {
        sessionUserRole,
        rows,
        show,
        setShow,
        ContractModel,
        showContractData,
        useFilterHook,
        setApplications,
        handleShowModal,
        updateContractApplicationsStatus,
        initializeStateHelper,
    } = useViewContractApplications();

    const [expandedContracts, setExpandedContracts] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    // Calculate statistics
    const totalApplications = rows.length;
    const pendingApplications = rows.filter(r => r.status?.toLowerCase() === 'pending').length;
    const acceptedApplications = rows.filter(r => r.status?.toLowerCase() === 'accepted' || r.status?.toLowerCase() === 'approved').length;
    const rejectedApplications = rows.filter(r => r.status?.toLowerCase() === 'rejected').length;

    const statsConfig = [
        {label: "Total Applications", value: totalApplications},
        {label: "Pending Review", value: pendingApplications},
        {label: "Accepted Jobs", value: acceptedApplications},
        {label: "Rejected/Closed", value: rejectedApplications},
    ];

    // Filter rows based on status
    const filteredRows = useMemo(() => {
        if (statusFilter === "all") return rows;
        if (statusFilter === "pending") return rows.filter(r => r.status?.toLowerCase() === 'pending');
        if (statusFilter === "accepted") return rows.filter(r => ['accepted', 'approved'].includes(r.status?.toLowerCase()));
        if (statusFilter === "rejected") return rows.filter(r => r.status?.toLowerCase() === 'rejected');
        return rows;
    }, [rows, statusFilter]);

    // Group applications by contract
    const groupedByContract = useMemo(() => {
        const groups = {};
        filteredRows.forEach(row => {
            const contractId = row.contract_id;
            if (!groups[contractId]) {
                groups[contractId] = {
                    contract: row.contract,
                    applications: []
                };
            }
            groups[contractId].applications.push(row);
        });
        return Object.values(groups);
    }, [filteredRows]);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: {label: "Pending", class: "pending", icon: "fas fa-clock"},
            approved: {label: "Accepted", class: "accepted", icon: "fas fa-check-circle"},
            accepted: {label: "Accepted", class: "accepted", icon: "fas fa-check-circle"},
            rejected: {label: "Rejected", class: "rejected", icon: "fas fa-times-circle"},
            withdrawn: {label: "Withdrawn", class: "withdrawn", icon: "fas fa-undo"}
        };
        return statusMap[status?.toLowerCase()] || {
            label: status || "Unknown",
            class: "unknown",
            icon: "fas fa-question-circle"
        };
    };

    const getContractStatusInfo = (status) => {
        const statusMap = {
            open: {label: "Open", class: "open"},
            closed: {label: "Closed", class: "closed"},
            cancelled: {label: "Cancelled", class: "cancelled"},
            pending: {label: "Pending", class: "pending"},
            booked: {label: "Booked", class: "booked"}
        };
        return statusMap[status?.toLowerCase()] || {label: status || "Unknown", class: "unknown"};
    };

    const handleWithdrawApplication = async (applicationId, currentStatus, contractStatus, contractStartDate) => {
        if (currentStatus === CONTRACT_APPLICATION_STATUS.WITHDRAWN) return;

        // Check if cancellation fee may apply (accepted + booked + within 48 hours of start)
        const isWithin48Hours = contractStartDate &&
            (new Date(contractStartDate) - new Date()) <= 48 * 60 * 60 * 1000;
        const mayHaveFee = currentStatus?.toLowerCase() === 'accepted' &&
            contractStatus?.toLowerCase() === 'booked' &&
            isWithin48Hours;

        try {
            const application = {id: applicationId, status: CONTRACT_APPLICATION_STATUS.WITHDRAWN};
            const status = await updateContractApplicationsStatus({application, mayHaveFee});
            if (status) await initializeStateHelper();
        } catch (error) {
            console.error("Error withdrawing application:", error);
        }
    };

    const toggleContract = (contractId) => {
        setExpandedContracts(prev => ({
            ...prev,
            [contractId]: !prev[contractId]
        }));
    };

    const expandAll = () => {
        const allExpanded = {};
        groupedByContract.forEach(({contract, applications}) => {
            const id = contract?.id || applications[0]?.contract_id;
            allExpanded[id] = true;
        });
        setExpandedContracts(allExpanded);
    };

    const collapseAll = () => {
        setExpandedContracts({});
    };

    const getLocation = (contract) => {
        const data = contract?.data || {};
        const parts = [];
        if (data.city) parts.push(data.city);
        if (data.state) parts.push(data.state);
        if (data.location) return data.location;
        if (data.facility_name) return data.facility_name;
        return parts.length > 0 ? parts.join(", ") : null;
    };

    console.log(groupedByContract)

    return (
        <div className="">

            <MetricsGrid stats={statsConfig}/>


            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1 bg-transparent mb-2">

                {/* Toolbar Left: Filter & Results */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border
                    ${showFilters
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                        }
                `}
                    >
                        {showFilters ? <ListFilter className="w-4 h-4"/> : <FilterIcon className="w-4 h-4"/>}
                        <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>

                        {/* অ্যাক্টিভ ডট (ফিল্টার অন থাকলে দেখাবে) */}
                        {!showFilters && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-1"></span>
                        )}
                    </button>

                    <div
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                        <List className="w-3.5 h-3.5 text-slate-500"/>
                        <span className="text-xs font-bold text-slate-600">
                    {groupedByContract.length} <span
                            className="font-medium text-slate-500">Contract{groupedByContract.length !== 1 ? 's' : ''}</span>
                </span>
                    </div>
                </div>

                {/* Toolbar Right: Global Actions */}
                {/*<div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm w-full sm:w-auto justify-center">*/}
                {/*    <button*/}
                {/*        onClick={expandAll}*/}
                {/*        title="Expand All"*/}
                {/*        className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer group"*/}
                {/*    >*/}
                {/*        <Maximize2 className="w-4 h-4" />*/}
                {/*        <span className="text-xs font-bold hidden md:inline">Expand All</span>*/}
                {/*    </button>*/}

                {/*    <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>*/}

                {/*    <button*/}
                {/*        onClick={collapseAll}*/}
                {/*        title="Collapse All"*/}
                {/*        className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer group"*/}
                {/*    >*/}
                {/*        <Minimize2 className="w-4 h-4" />*/}
                {/*        <span className="text-xs font-bold hidden md:inline">Collapse All</span>*/}
                {/*    </button>*/}
                {/*</div>*/}
            </div>

            {showFilters && (
                <div className="">
                    <Filter setApplications={setApplications} useFilterHook={useFilterHook}/>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {
                    groupedByContract.length === 0 ?
                        <div
                            className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                            {/* আইকন কন্টেইনার */}
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Inbox className="w-10 h-10 text-slate-300"/>
                            </div>

                            {/* টেক্সট সেকশন */}
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                No Applications Found
                            </h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                                {statusFilter.status !== ''
                                    ? `It seems there are no applications with the "${statusFilter.status}" status. Try adjusting your filters.`
                                    : "You haven't applied for any contracts yet. Start your journey by exploring available opportunities!"
                                }
                            </p>

                            {/* কল টু অ্যাকশন বাটন */}
                            <Link
                                to={`/${sessionUserRole}/published-contracts`}
                                className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-sm shadow-blue-100 transition-all transform hover:scale-105 active:scale-95"
                            >
                                <Search className="w-4 h-4"/>
                                Browse Available Jobs
                            </Link>

                            {/* হেল্পার টেক্সট (অপশনাল) */}
                            <div
                                className="mt-8 flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-widest">
                                <Briefcase className="w-3 h-3"/>
                                Quicklocum Career Portal
                            </div>
                        </div>
                        :
                        groupedByContract.map((item) => {
                            const contractId = item.contract?.id || item.applications[0]?.contract_id;
                            const contract = item.contract;
                            const application = item.applications[0];

                            return (
                                <ApplicantCard
                                    key={application.id}
                                    index={contractId}
                                    title={contract.contract_type?.contract_name || "Dental Contract"}
                                    contractValue={contract.data?.contract_value}
                                    appliedDate={application.applied_at ? formatDate(new Date(application.applied_at), 'MMM dd, yyyy') : "N/A"}
                                    startDate={contract.start_date ? formatDate(new Date(contract.start_date), 'MMM dd, yyyy') : "N/A"}
                                    status={application.status}

                                    onViewDetails={() => {
                                        const contractName = contract?.contract_type?.contract_name || "";
                                        handleShowModal(contractId, contractName);
                                    }}

                                    // ২. উইথড্র হ্যান্ডেল করার জন্য
                                    onWithdraw={() => {
                                        handleWithdrawApplication(
                                            application.id,
                                            application.status,
                                            contract?.status,
                                            contract?.start_date
                                        );
                                    }}

                                />
                            );
                        })}
            </div>

            {/* Contract Modal */}
            {ContractModel && show && (
                <ContractModel
                    show={show}
                    setShow={setShow}
                    contract={showContractData}
                />
            )}

            {/* Applications Content */}
            {/*<div className="applications-content">*/}
            {/*    {groupedByContract.length === 0 ? (*/}
            {/*        <div className="empty-state">*/}
            {/*            <div className="empty-icon">*/}
            {/*                <i className="fas fa-inbox"></i>*/}
            {/*            </div>*/}
            {/*            <h3>No applications found</h3>*/}
            {/*            <p>*/}
            {/*                {statusFilter !== 'all'*/}
            {/*                    ? `No ${statusFilter} applications. Try changing the filter.`*/}
            {/*                    : "You haven't applied to any jobs yet. Start exploring opportunities!"*/}
            {/*                }*/}
            {/*            </p>*/}
            {/*            <Link to={`/${sessionUserRole}/published-contracts`} className="browse-btn">*/}
            {/*                <i className="fas fa-search"></i>*/}
            {/*                Browse Available Jobs*/}
            {/*            </Link>*/}
            {/*        </div>*/}
            {/*    ) : (*/}
            {/*        <div className="contracts-list">*/}
            {/*            {groupedByContract.map(({contract, applications}) => {*/}
            {/*                const contractId = contract?.id || applications[0]?.contract_id;*/}
            {/*                const isExpanded = expandedContracts[contractId];*/}
            {/*                const jobTitle = contract?.data?.job_title || contract?.contract_type?.contract_name || `Contract #${contractId}`;*/}
            {/*                const contractStatus = getContractStatusInfo(contract?.status);*/}
            {/*                const location = getLocation(contract);*/}
            {/*                const latestApp = applications[0];*/}

            {/*                return (*/}
            {/*                    <div key={contractId} className={`contract-card ${isExpanded ? 'expanded' : ''}`}>*/}
            {/*                        /!* Contract Header *!/*/}
            {/*                        <div className="contract-header" onClick={() => toggleContract(contractId)}>*/}
            {/*                            <div className="contract-info">*/}
            {/*                                <div className="contract-title-row">*/}
            {/*                                    <span className="contract-id">#{contractId}</span>*/}
            {/*                                    <h3 className="contract-title">{jobTitle}</h3>*/}
            {/*                                    <span className={`contract-status ${contractStatus.class}`}>*/}
            {/*                                        {contractStatus.label}*/}
            {/*                                    </span>*/}
            {/*                                </div>*/}
            {/*                                <div className="contract-meta">*/}
            {/*                                    {contract?.published_by?.name && (*/}
            {/*                                        <span className="meta-item">*/}
            {/*                                            <i className="fas fa-building"></i>*/}
            {/*                                            {contract.published_by.name}*/}
            {/*                                        </span>*/}
            {/*                                    )}*/}
            {/*                                    {location && (*/}
            {/*                                        <span className="meta-item">*/}
            {/*                                            <i className="fas fa-map-marker-alt"></i>*/}
            {/*                                            {location}*/}
            {/*                                        </span>*/}
            {/*                                    )}*/}
            {/*                                    <span className="meta-item">*/}
            {/*                                        <i className="fas fa-calendar"></i>*/}
            {/*                                        {formatDate(contract?.start_date)} - {formatDate(contract?.end_date)}*/}
            {/*                                    </span>*/}
            {/*                                </div>*/}
            {/*                            </div>*/}
            {/*                            <div className="contract-summary">*/}
            {/*                                <div className="app-count">*/}
            {/*                                    <span className="count">{applications.length}</span>*/}
            {/*                                    <span*/}
            {/*                                        className="label">Application{applications.length !== 1 ? 's' : ''}</span>*/}
            {/*                                </div>*/}
            {/*                                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} expand-icon`}></i>*/}
            {/*                            </div>*/}
            {/*                        </div>*/}

            {/*                        /!* Applications List *!/*/}
            {/*                        {isExpanded && (*/}
            {/*                            <div className="applications-list">*/}
            {/*                                {applications.map((app) => {*/}
            {/*                                    const statusInfo = getStatusInfo(app.status);*/}
            {/*                                    // Can withdraw if: not already withdrawn and not rejected*/}
            {/*                                    // Note: Withdrawal from booked contracts IS allowed but may incur a cancellation fee (handled by backend)*/}
            {/*                                    const canWithdraw = app.status !== CONTRACT_APPLICATION_STATUS.WITHDRAWN &&*/}
            {/*                                        app.status?.toLowerCase() !== 'rejected';*/}
            {/*                                    // Check if withdrawal may incur a fee (accepted + booked contract + within 48 hours of start)*/}
            {/*                                    const isWithin48Hours = contract?.start_date &&*/}
            {/*                                        (new Date(contract.start_date) - new Date()) <= 48 * 60 * 60 * 1000;*/}
            {/*                                    const mayHaveFee = app.status?.toLowerCase() === 'accepted' &&*/}
            {/*                                        contract?.status?.toLowerCase() === 'booked' &&*/}
            {/*                                        isWithin48Hours;*/}

            {/*                                    return (*/}
            {/*                                        <div key={app.id}*/}
            {/*                                             className={`application-item ${statusInfo.class}`}>*/}
            {/*                                            <div className="app-main">*/}
            {/*                                                <div className="app-header">*/}
            {/*                                                    <span className="app-id">Application #{app.id}</span>*/}
            {/*                                                    <span className={`app-status ${statusInfo.class}`}>*/}
            {/*                                                        <i className={statusInfo.icon}></i>*/}
            {/*                                                        {statusInfo.label}*/}
            {/*                                                    </span>*/}
            {/*                                                </div>*/}
            {/*                                                <div className="app-details">*/}
            {/*                                                    <div className="detail-row">*/}
            {/*                                                        <i className="fas fa-clock"></i>*/}
            {/*                                                        <span>Applied: {formatDateTime(app.applied_at || app.created_at)}</span>*/}
            {/*                                                    </div>*/}
            {/*                                                    {app.data?.proposed_candidates && app.data.proposed_candidates.length > 0 && (*/}
            {/*                                                        <div className="proposed-candidates">*/}
            {/*                                                            <span className="candidates-label">Proposed Candidates:</span>*/}
            {/*                                                            <div className="candidates-list">*/}
            {/*                                                                {app.data.proposed_candidates.map((candidate, idx) => (*/}
            {/*                                                                    <span key={idx}*/}
            {/*                                                                          className="candidate-tag">*/}
            {/*                                                                        <i className="fas fa-user"></i>*/}
            {/*                                                                        {candidate.name}*/}
            {/*                                                                        {candidate.position && ` - ${candidate.position}`}*/}
            {/*                                                                    </span>*/}
            {/*                                                                ))}*/}
            {/*                                                            </div>*/}
            {/*                                                        </div>*/}
            {/*                                                    )}*/}
            {/*                                                </div>*/}
            {/*                                            </div>*/}
            {/*                                            <div className="app-actions">*/}
            {/*                                                <button*/}
            {/*                                                    className="btn-view"*/}
            {/*                                                    onClick={(e) => {*/}
            {/*                                                        e.stopPropagation();*/}
            {/*                                                        const contractName = contract?.contract_type?.contract_name || "";*/}
            {/*                                                        if (contractId && contractName) {*/}
            {/*                                                            handleShowModal(contractId, contractName);*/}
            {/*                                                        }*/}
            {/*                                                    }}*/}
            {/*                                                >*/}
            {/*                                                    <i className="fas fa-eye"></i>*/}
            {/*                                                    View Contract*/}
            {/*                                                </button>*/}
            {/*                                                {canWithdraw ? (*/}
            {/*                                                    <button*/}
            {/*                                                        className={`btn-withdraw ${mayHaveFee ? 'has-fee-warning' : ''}`}*/}
            {/*                                                        onClick={(e) => {*/}
            {/*                                                            e.stopPropagation();*/}
            {/*                                                            handleWithdrawApplication(app.id, app.status, contract?.status, contract?.start_date);*/}
            {/*                                                        }}*/}
            {/*                                                        title={mayHaveFee ? "Withdrawal may incur a cancellation fee" : ""}*/}
            {/*                                                    >*/}
            {/*                                                        <i className="fas fa-undo"></i>*/}
            {/*                                                        Withdraw {mayHaveFee &&*/}
            {/*                                                        <i className="fas fa-exclamation-triangle ms-1"*/}
            {/*                                                           style={{color: '#ffc107'}}></i>}*/}
            {/*                                                    </button>*/}
            {/*                                                ) : app.status === CONTRACT_APPLICATION_STATUS.WITHDRAWN ? (*/}
            {/*                                                    <span className="withdrawn-label">*/}
            {/*                                                        <i className="fas fa-ban"></i>*/}
            {/*                                                        Withdrawn*/}
            {/*                                                    </span>*/}
            {/*                                                ) : (*/}
            {/*                                                    <span className="rejected-label"*/}
            {/*                                                          title="This application was rejected">*/}
            {/*                                                        <i className="fas fa-times-circle"></i>*/}
            {/*                                                        Rejected*/}
            {/*                                                    </span>*/}
            {/*                                                )}*/}
            {/*                                            </div>*/}
            {/*                                        </div>*/}
            {/*                                    );*/}
            {/*                                })}*/}
            {/*                            </div>*/}
            {/*                        )}*/}
            {/*                    </div>*/}
            {/*                );*/}
            {/*            })}*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</div>*/}


        </div>
    );
};

export default View;
