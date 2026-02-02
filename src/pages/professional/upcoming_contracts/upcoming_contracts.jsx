import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUpcomingContractsService } from "@services/professional/UpcomingContractsService";
import { withdrawApplicationService } from "@services/professional/ApplicationWithdrawalService";
import CancelConfirmationModal from "@components/modals/CancelConfirmationModal";
import "./UpcomingWorkStyles.css";
import {StatsCard} from "@pages/professional/upcoming_contracts/StatsCard.jsx";
import FilterSelect from "@pages/professional/upcoming_contracts/FilterSelect.jsx";
import {
    LayoutGrid, Plus, Search, Calendar,
    ChevronDown, Filter, SearchIcon
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@components/ui/input-group.jsx";
import WorkCard from "@pages/professional/upcoming_contracts/WorkCard.jsx";

const ProfessionalUpcomingContracts = () => {
    const [loading, setLoading] = useState(true);
    const [contractsData, setContractsData] = useState(null);
    const [viewMode, setViewMode] = useState("timeline");
    const [selectedContract, setSelectedContract] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [applicationToWithdraw, setApplicationToWithdraw] = useState(null);

    useEffect(() => {
        fetchUpcomingContracts();
        const interval = setInterval(fetchUpcomingContracts, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchUpcomingContracts = async () => {
        try {
            const data = await getUpcomingContractsService();
            setContractsData(data);
        } catch (error) {
            console.error('Error fetching upcoming contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenWithdrawModal = (contract) => {
        setApplicationToWithdraw(contract);
        setShowWithdrawModal(true);
    };

    const handleWithdrawApplication = async (applicationId, reason) => {
        try {
            const result = await withdrawApplicationService(applicationId, reason);
            if (result?.status) {
                await fetchUpcomingContracts();
                setShowWithdrawModal(false);
                setApplicationToWithdraw(null);
            }
            return result;
        } catch (error) {
            console.error("Error withdrawing application:", error);
            throw error;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getDaysText = (days) => {
        if (days === null || days === undefined) return '';
        if (days === 0) return 'Starting TODAY';
        if (days === 1) return 'Starting TOMORROW';
        if (days < 0) return `Started ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
        return `In ${days} day${days !== 1 ? 's' : ''}`;
    };

    const getUrgencyInfo = (urgency) => {
        const map = {
            critical: { label: "Critical", class: "critical", icon: "fas fa-exclamation-circle" },
            high: { label: "High", class: "high", icon: "fas fa-exclamation-triangle" },
            medium: { label: "Medium", class: "medium", icon: "fas fa-clock" },
            low: { label: "Low", class: "low", icon: "fas fa-check-circle" }
        };
        return map[urgency] || map.low;
    };

    const ContractCard = ({ contract }) => {
        const urgency = getUrgencyInfo(contract.urgency_level);
        const rate = contract.data?.hourly_rate || contract.data?.daily_rate || contract.data?.rate;

        return (
            <div className={`contract-card ${urgency.class}`}>
                <div className="card-header">
                    <div className="card-title-section">
                        <span className="contract-id">#{contract.id}</span>
                        <h3 className="contract-title">
                            {contract.contract_type_name || 'Contract'}
                        </h3>
                        <span className={`urgency-badge ${urgency.class}`}>
                            <i className={urgency.icon}></i>
                            {urgency.label}
                        </span>
                    </div>
                    <button
                        className="details-btn"
                        onClick={() => {
                            setSelectedContract(contract);
                            setShowDetailsModal(true);
                        }}
                    >
                        <i className="fas fa-info-circle"></i>
                    </button>
                </div>

                <div className="card-body">
                    {/* Institute */}
                    {contract.institute && (
                        <div className="info-row institute">
                            <i className="fas fa-building"></i>
                            <span>{contract.institute.name}</span>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="dates-section">
                        <div className="date-item">
                            <i className="fas fa-calendar-alt"></i>
                            <div className="date-content">
                                <span className="date-label">Start</span>
                                <span className="date-value">{formatDate(contract.start_date)}</span>
                            </div>
                        </div>
                        {contract.end_date && (
                            <div className="date-item">
                                <i className="fas fa-calendar-check"></i>
                                <div className="date-content">
                                    <span className="date-label">End</span>
                                    <span className="date-value">{formatDate(contract.end_date)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Days Until Start */}
                    {contract.days_until_start !== null && (
                        <div className={`countdown ${contract.days_until_start <= 3 ? 'urgent' : ''}`}>
                            <i className="fas fa-hourglass-half"></i>
                            <span>{getDaysText(contract.days_until_start)}</span>
                            {contract.duration_days && (
                                <span className="duration">({contract.duration_days} day{contract.duration_days !== 1 ? 's' : ''} duration)</span>
                            )}
                        </div>
                    )}

                    {/* Rate */}
                    {rate && (
                        <div className="rate-section">
                            <i className="fas fa-dollar-sign"></i>
                            <span>{formatCurrency(rate)}</span>
                            <span className="rate-type">/hour</span>
                        </div>
                    )}

                    {/* Agreement Status */}
                    {contract.has_agreement && contract.professional_needs_to_sign && (
                        <div className="alert-box warning">
                            <i className="fas fa-file-signature"></i>
                            <span>You need to sign the agreement</span>
                        </div>
                    )}

                    {contract.has_agreement && contract.agreement_signed && (
                        <div className="status-indicator signed">
                            <i className="fas fa-check-circle"></i>
                            <span>Agreement signed</span>
                        </div>
                    )}
                </div>

                <div className="card-footer">
                    <Link to="/professional/contract-applications" className="btn-secondary">
                        <i className="fas fa-eye"></i>
                        View Application
                    </Link>

                    {contract.has_agreement && contract.professional_needs_to_sign && (
                        <Link to={`/professional/agreements/${contract.id}/sign`} className="btn-primary">
                            <i className="fas fa-signature"></i>
                            Sign Agreement
                        </Link>
                    )}

                    {contract.can_withdraw_application ? (
                        <button
                            className={`btn-danger ${contract.withdrawal_fee_warning ? 'has-fee-warning' : ''}`}
                            onClick={() => handleOpenWithdrawModal(contract)}
                            title={contract.withdrawal_fee_warning || ''}
                        >
                            <i className="fas fa-times"></i>
                            Withdraw {contract.withdrawal_fee_warning && <i className="fas fa-exclamation-triangle ms-1" style={{color: '#ffc107'}}></i>}
                        </button>
                    ) : (
                        <span className="committed-badge" title={contract.withdrawal_disabled_reason || "Cannot withdraw this application"}>
                            <i className="fas fa-ban"></i>
                            Cannot Withdraw
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const TimelineSection = ({ title, icon, contracts, type }) => {
        if (!contracts || contracts.length === 0) return null;

        return (
            <div className={`timeline-section ${type}`}>
                <h3 className="section-title">
                    <i className={icon}></i>
                    {title}
                    <span className="count">{contracts.length}</span>
                </h3>
                <div className="section-content">
                    {contracts.map(contract => (
                        <ContractCard key={contract.id} contract={contract} />
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className=" upcoming-work-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your upcoming work...</p>
                </div>
            </div>
        );
    }

    if (!contractsData) {
        return (
            <div className="content-wrapper upcoming-work-page">
                <div className="error-state">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>Failed to load contracts data</p>
                    <button onClick={fetchUpcomingContracts} className="retry-btn">
                        <i className="fas fa-redo"></i>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { stats, contracts, timeline_view } = contractsData;

    return (
        <div className="">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm text-blue-500">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="!text-base font-semibold text-slate-800 !mb-0">Upcoming Work</h1>
                        <p className="text-slate-500 text-sm !mb-0">Manage your scheduled contracts and assignments</p>
                    </div>
                </div>
                <Button className="bg-[#2D8FE3] hover:bg-blue-600 h-11 px-6 !rounded-lg font-bold transition-all flex gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Contract
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 my-4">
                <StatsCard title="Upcoming Work" value={stats?.total_upcoming || 0} percentage="20" subText="Currently Running" />
                <StatsCard title="Starting Soon" value={stats?.imminent_count || 0} percentage="20" subText="Currently Running" />
                <StatsCard title="This Week" value={stats?.this_week || 0} percentage="20" subText="7days details" isNegative />
                <StatsCard title="This Month" value={formatCurrency(stats?.total_projected_earnings) || '$0'} percentage="20" subText="30days reports" />
            </div>

            {/* Filter Bar */}
            <div className="mb-4 flex flex-col lg:flex-row gap-4 items-center w-full border border-[#E5E7EB] p-3 rounded-lg">

                <InputGroup className="max-w-sm w-full">
                    <InputGroupInput placeholder="Search..." />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                </InputGroup>

                {/* Action Buttons Group */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <Button variant="outline" className="bg-white border-slate-100 rounded-lg text-slate-500 flex gap-2">
                        <Calendar className="w-4 h-4" /> Daily
                    </Button>

                    <FilterSelect placeholder="All Levels" />
                    <FilterSelect placeholder="All Statuses" />
                    <FilterSelect placeholder="All Contracts" />

                    <Button variant="outline" className=" bg-white border-slate-100 rounded-lg text-slate-500 flex gap-2 font-semibold">
                        Adv Filters <Filter className="w-4 h-4" />
                    </Button>

                </div>

            </div>

            {/* Empty State Section */}
            <div className="bg-[#F3F9FE] border border-slate-100 rounded-xl p-8 h-auto flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <SearchIcon className="w-10 h-10 text-[#2D8FE3]" />
                </div>
                <h3 className="text-base font-semibold text-[#2A394B] mb-2">No Contracts Found</h3>
                <p className="text-[#374151] text-sm">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    You don't have upcoming contracts at the moment
                </p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
                {[1,2,3].map((_, index) => (
                    <WorkCard key={index} job={{}} />
                ))}
            </div>

            {/* Toolbar */}
            {/*<div className="upcoming-toolbar">*/}
            {/*    <div className="toolbar-left">*/}
            {/*        <span className="results-info">*/}
            {/*            {contracts?.length || 0} contract{(contracts?.length || 0) !== 1 ? 's' : ''} scheduled*/}
            {/*        </span>*/}
            {/*    </div>*/}
            {/*    <div className="toolbar-right">*/}
            {/*        <div className="view-toggle">*/}
            {/*            <button*/}
            {/*                className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}*/}
            {/*                onClick={() => setViewMode('timeline')}*/}
            {/*            >*/}
            {/*                <i className="fas fa-stream"></i>*/}
            {/*                Timeline*/}
            {/*            </button>*/}
            {/*            <button*/}
            {/*                className={`view-btn ${viewMode === 'all' ? 'active' : ''}`}*/}
            {/*                onClick={() => setViewMode('all')}*/}
            {/*            >*/}
            {/*                <i className="fas fa-th-large"></i>*/}
            {/*                All Contracts*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*/!* Content *!/*/}
            {/*<div className="upcoming-content">*/}
            {/*    {contracts?.length === 0 ? (*/}
            {/*        <div className="empty-state">*/}
            {/*            <div className="empty-icon">*/}
            {/*                <i className="fas fa-calendar-times"></i>*/}
            {/*            </div>*/}
            {/*            <h3>No upcoming work</h3>*/}
            {/*            <p>You don't have any scheduled contracts yet. Start applying to jobs!</p>*/}
            {/*            <Link to="/professional/published-contracts" className="browse-btn">*/}
            {/*                <i className="fas fa-search"></i>*/}
            {/*                Browse Available Jobs*/}
            {/*            </Link>*/}
            {/*        </div>*/}
            {/*    ) : viewMode === 'timeline' ? (*/}
            {/*        <div className="timeline-view">*/}
            {/*            /!* Pending Signature - Top Priority *!/*/}
            {/*            <TimelineSection*/}
            {/*                title="Pending Your Signature"*/}
            {/*                icon="fas fa-file-signature"*/}
            {/*                contracts={timeline_view?.pending_signature}*/}
            {/*                type="signature"*/}
            {/*            />*/}

            {/*            /!* Imminent *!/*/}
            {/*            <TimelineSection*/}
            {/*                title="Starting Soon"*/}
            {/*                icon="fas fa-exclamation-circle"*/}
            {/*                contracts={timeline_view?.imminent}*/}
            {/*                type="imminent"*/}
            {/*            />*/}

            {/*            /!* This Week *!/*/}
            {/*            <TimelineSection*/}
            {/*                title="This Week"*/}
            {/*                icon="fas fa-calendar-week"*/}
            {/*                contracts={timeline_view?.this_week}*/}
            {/*                type="this-week"*/}
            {/*            />*/}

            {/*            /!* This Month *!/*/}
            {/*            <TimelineSection*/}
            {/*                title="This Month"*/}
            {/*                icon="fas fa-calendar-alt"*/}
            {/*                contracts={timeline_view?.this_month}*/}
            {/*                type="this-month"*/}
            {/*            />*/}

            {/*            /!* Future *!/*/}
            {/*            <TimelineSection*/}
            {/*                title="Future Contracts"*/}
            {/*                icon="fas fa-calendar-plus"*/}
            {/*                contracts={timeline_view?.future}*/}
            {/*                type="future"*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*    ) : (*/}
            {/*        <div className="all-contracts">*/}
            {/*            {contracts.map(contract => (*/}
            {/*                <ContractCard key={contract.id} contract={contract} />*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</div>*/}

            {/* Details Modal */}
            {showDetailsModal && selectedContract && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Contract Details</h2>
                            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>{selectedContract.contract_type_name}</h3>
                                <span className={`urgency-badge ${getUrgencyInfo(selectedContract.urgency_level).class}`}>
                                    {selectedContract.urgency_level}
                                </span>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="label">Start Date</span>
                                    <span className="value">{formatDate(selectedContract.start_date)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">End Date</span>
                                    <span className="value">{formatDate(selectedContract.end_date)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Status</span>
                                    <span className="value">{selectedContract.status}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Duration</span>
                                    <span className="value">{selectedContract.duration_days} days</span>
                                </div>
                            </div>

                            {selectedContract.institute && (
                                <div className="detail-section">
                                    <h4>Institute Information</h4>
                                    <p><strong>Name:</strong> {selectedContract.institute.name}</p>
                                    {selectedContract.institute.email && (
                                        <p><strong>Email:</strong> {selectedContract.institute.email}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                                Close
                            </button>
                            <Link to="/professional/contract-applications" className="btn-primary">
                                View Application
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            <CancelConfirmationModal
                open={showWithdrawModal}
                onClose={() => {
                    setShowWithdrawModal(false);
                    setApplicationToWithdraw(null);
                }}
                onConfirm={handleWithdrawApplication}
                title="Withdraw Application"
                message={`Are you sure you want to withdraw your application${applicationToWithdraw ? ` for ${applicationToWithdraw.contract_type_name}` : ''}? This action cannot be undone.`}
                type="application"
                id={applicationToWithdraw?.application_id}
            />
        </div>
    );
};

export default ProfessionalUpcomingContracts;
