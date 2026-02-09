import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {getUpcomingContractsService} from "@services/institute/UpcomingContractsService";
import {
    Box,
    Chip,
    Button,
    CircularProgress,
    Grid,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Alert,
    Stack,
    Divider,
    Paper,
    Tooltip,
} from "@mui/material";
import {
    Close,
    CalendarToday,
    Person,
    CheckCircle,
    Warning,
    Edit,
    Cancel,
    TrendingUp,
    Schedule,
    Group,
    Description,
    Work
} from "@mui/icons-material";
import CancelConfirmationModal from "@components/modals/CancelConfirmationModal";
import {cancelContractService} from "@services/institute/ContractCancellationService";
import {LayoutGrid, Plus, SearchIcon, X,} from "lucide-react";
import {StatsCard} from "@pages/institute/upcoming_contracts/StatsCard.jsx";
import {Button as SButton} from "@components/ui/button.jsx"
import WorkCard from "@pages/institute/upcoming_contracts/WorkCard.jsx";
import ContractFilters from "@pages/institute/upcoming_contracts/ContractFilters.jsx";
import UpcomingContractsSkeleton from "@pages/institute/upcoming_contracts/UpcomingContractsSkeleton.jsx";

const InstituteUpcomingContracts = () => {
    const [loading, setLoading] = useState(true);
    const [contractsData, setContractsData] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [contractToCancel, setContractToCancel] = useState(null);

    // Filters
    const [searchText, setSearchText] = useState("");
    const [filterUrgency, setFilterUrgency] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterProfessional, setFilterProfessional] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // Expandable sections
    const [expandedSections, setExpandedSections] = useState({
        pending_signature: true,
        unassigned: true,
        imminent: true,
        this_week: false,
        this_month: false,
        future: false
    });

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

    const handleOpenCancelModal = (contract) => {
        setContractToCancel(contract);
        setShowCancelModal(true);
        setShowDetailsModal(false); // Close details modal if open
    };

    const handleCancelContract = async (contractId, reason) => {
        const result = await cancelContractService(contractId, reason);
        if (result?.status) {
            // Refresh the contracts list
            await fetchUpcomingContracts();
            setShowCancelModal(false);
            setContractToCancel(null);
        }
        return result;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysText = (days) => {
        if (days === null || days === undefined) return '';
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days < 0) return `${Math.abs(days)}d ago`;
        return `${days} days`;
    };

    const getUrgencyChip = (urgency) => {
        const config = {
            critical: {bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Critical', icon: '!!'},
            high: {bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'High', icon: '!'},
            medium: {bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Medium', icon: ''},
            normal: {bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Normal', icon: ''}
        };
        const {bg, color, border, label, icon} = config[urgency] || config.normal;
        return (
            <Chip
                label={icon ? `${icon} ${label}` : label}
                size="small"
                sx={{
                    backgroundColor: bg,
                    color: color,
                    border: `1px solid ${border}`,
                    fontWeight: 600,
                    fontSize: '0.7rem'
                }}
            />
        );
    };

    // Helper function to determine redirect link based on user category and contract source
    const getContractRedirectInfo = (contract) => {
        const instituteCategoryId = parseInt(sessionStorage.getItem('institute_category_id') || '0');

        // For Clinics (1) and Pharmacies (2) - always redirect to My Contracts (they're always publishers)
        if (instituteCategoryId === 1 || instituteCategoryId === 2) {
            return {
                link: `/institute/contracts?contract_id=${contract.id}`,
                label: 'View in My Contracts',
                icon: <Description sx={{fontSize: 18}}/>
            };
        }

        // For Agencies (3) and Headhunters (4) - check if publisher or applicant
        if (instituteCategoryId === 3 || instituteCategoryId === 4) {
            // contract.source is "published" if user is publisher, "applied" if user is applicant
            if (contract.source === 'published') {
                return {
                    link: `/institute/contracts?contract_id=${contract.id}`,
                    label: 'View in My Contracts',
                    icon: <Description sx={{fontSize: 18}}/>
                };
            } else {
                // User applied to this contract
                return {
                    link: `/institute/applications?contract_id=${contract.id}`,
                    label: 'View in My Applications',
                    icon: <Work sx={{fontSize: 18}}/>
                };
            }
        }

        // Default fallback
        return {
            link: `/institute/contracts?contract_id=${contract.id}`,
            label: 'View Contract',
            icon: <Description sx={{fontSize: 18}}/>
        };
    };

    const filterContracts = (contracts) => {
        if (!contracts) return [];

        return contracts.filter(contract => {
            // Exclude cancelled contracts
            if (contract.status === 'cancelled') {
                return false;
            }

            // Search filter - check contract name, type, and position
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                const matchesName = contract.contract_type_name?.toLowerCase().includes(searchLower);
                const matchesPosition = contract.data?.position?.toLowerCase().includes(searchLower) ||
                    (contract.position_names && contract.position_names.some(name => name.toLowerCase().includes(searchLower)));
                const matchesContractName = contract.data?.contract_name?.toLowerCase().includes(searchLower);

                if (!matchesName && !matchesPosition && !matchesContractName) {
                    return false;
                }
            }

            // Urgency filter
            if (filterUrgency !== "all" && contract.urgency_level !== filterUrgency) {
                return false;
            }

            // Status filter
            if (filterStatus !== "all" && contract.status !== filterStatus) {
                return false;
            }

            // Professional filter
            if (filterProfessional === "assigned" && !contract.professional) {
                return false;
            }
            if (filterProfessional === "unassigned" && contract.professional) {
                return false;
            }

            return true;
        });
    };


    if (loading) {
        return (
            <UpcomingContractsSkeleton />
        );
    }

    if (!contractsData) {
        return (
            <div className="" style={{minHeight: 'calc(100vh - 57px)', background: '#f8fafc'}}>
                <Box maxWidth="1400px" mx="auto" px={2}>
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: 3,
                            py: 2,
                            '& .MuiAlert-icon': {fontSize: 28}
                        }}
                    >
                        <Typography fontWeight="600">Failed to load contracts data</Typography>
                        <Typography variant="body2" sx={{mt: 0.5}}>Please refresh the page or try again
                            later.</Typography>
                    </Alert>
                </Box>
            </div>
        );
    }

    const {stats, contracts, timeline_view, user_type} = contractsData;

    const timelineSections = [
        {
            key: 'pending_signature',
            title: 'Pending Signature',
            subtitle: 'Contracts awaiting signature',
            color: '#dc2626',
            icon: <Edit sx={{fontSize: 20}}/>,
            bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
        },
        {
            key: 'unassigned',
            title: 'Needs Assignment',
            subtitle: 'Open contracts without professionals',
            color: '#f59e0b',
            icon: <Group sx={{fontSize: 20}}/>,
            bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
        },
        {
            key: 'imminent',
            title: 'Starting Soon',
            subtitle: 'Within 1-3 days',
            color: '#dc2626',
            icon: <Warning sx={{fontSize: 20}}/>,
            bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
        },
        {
            key: 'this_week',
            title: 'This Week',
            subtitle: '4-7 days away',
            color: '#3b82f6',
            icon: <Schedule sx={{fontSize: 20}}/>,
            bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
        },
        {
            key: 'this_month',
            title: 'This Month',
            subtitle: '8-30 days away',
            color: '#10b981',
            icon: <CalendarToday sx={{fontSize: 20}}/>,
            bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
        },
        {
            key: 'future',
            title: 'Future Contracts',
            subtitle: 'More than 30 days away',
            color: '#6b7280',
            icon: <TrendingUp sx={{fontSize: 20}}/>,
            bgGradient: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
        }
    ];

    const activeFiltersCount = [filterUrgency, filterStatus, filterProfessional].filter(f => f !== 'all').length + (searchText ? 1 : 0);

    const contractToJob = (contract, section) => {
        const title =
            (contract.position_names && contract.position_names.length > 0)
                ? contract.position_names.join(", ")
                : (contract.data?.position || contract.data?.contract_name || contract.contract_type_name || "Contract");

        const hospital = contract.contract_type_name || "Contract";

        const dateRange = `${formatDate(contract.start_date)} — ${formatDate(contract.end_date)}`;

        const shift =
            contract.data?.shift ||
            (contract.data?.hours_per_day ? `${contract.data.hours_per_day} hrs/day` : "-");

        const assignedProfessional = contract.professional?.name || null;

        // badge text (আপনার টেবিল লজিক অনুযায়ী days_until_start থেকে)
        const urgencyText =
            contract.days_until_start === 0
                ? "Starting Today"
                : contract.days_until_start === 1
                    ? "Starting Tomorrow"
                    : contract.days_until_start <= 3
                        ? "Starting Soon (1-3 Days)"
                        : contract.days_until_start <= 7
                            ? "This Week (4-7 Days)"
                            : "Upcoming";

        return {
            id: contract.id,
            title,
            hospital,
            urgencyText,
            location: contract.location || "-",
            dateRange,
            shift,
            assignedProfessional,
            accentColor: section?.color || "#6366f1",
            raw: contract,
        };
    };

    const buildCardActions = (contract) => {
        const redirectInfo = getContractRedirectInfo(contract);

        return {
            redirectInfo,
            onViewDetails: () => {
                setSelectedContract(contract);
                setShowDetailsModal(true);
            },
            onCancel: () => handleOpenCancelModal(contract),
        };
    };


    return (
        <>
            <div className="">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-12 h-12 bg-[#EEF7FF] rounded-md  text-blue-500 flex items-center justify-center">
                            <LayoutGrid className="w-6 h-6"/>
                        </div>
                        <div>
                            <h1 className="!text-base font-semibold text-slate-800 !mb-0">Upcoming Work</h1>
                            <p className="text-slate-500 text-sm !mb-0">Manage your scheduled contracts and
                                assignments</p>
                        </div>
                    </div>
                    <Link to="/institute/contracts/create">
                        <SButton
                            className="!bg-[#2D8FE3] hover:bg-blue-600 text-white h-11 px-6 !rounded-lg !font-bold transition-all flex gap-2">
                            <Plus className="w-5 h-5"/>
                            Add New Contract
                        </SButton>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 my-4">
                    <StatsCard title="Upcoming Work" value={stats?.total_upcoming || 0} percentage="20"
                               subText="Currently Running"/>
                    <StatsCard title="Starting Soon" value={stats?.imminent_count || 0} percentage="20"
                               subText="Currently Running"/>
                    <StatsCard title="This Week" value={stats?.this_week || 0} percentage="20" subText="7days details"
                               isNegative/>
                    <StatsCard title="This Month" value={stats?.this_month || '0'} percentage="20"
                               subText="30days reports"/>
                </div>

                <ContractFilters
                    activeFiltersCount={activeFiltersCount}
                    filterStatus={filterStatus}
                    filterProfessional={filterProfessional}
                    filterUrgency={filterUrgency}
                    searchText={searchText}
                    setFilterProfessional={setFilterProfessional}
                    setFilterStatus={setFilterStatus}
                    setFilterUrgency={setFilterStatus}
                    setSearchText={setSearchText}
                    setShowFilters={setShowFilters}
                    showFilters={showFilters}
                />

                {timelineSections.map((section) => {
                    const sectionContracts = filterContracts(timeline_view[section.key] || []);
                    if (sectionContracts.length === 0) return null;

                    return (
                        <div key={section.key} className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 ">
                                {sectionContracts.map((contract) => (
                                    <WorkCard
                                        key={contract.id}
                                        job={contractToJob(contract, section)}
                                        actions={buildCardActions(contract)}
                                        showActions={true}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}


            </div>


            {/* Empty State */}
            {filterContracts(contracts).length === 0 && (
                <>
                    <div
                        className="bg-[#F3F9FE] border border-slate-100 rounded-xl p-8 h-auto flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                            <SearchIcon className="w-10 h-10 text-[#2D8FE3]"/>
                        </div>
                        <h3 className="text-base font-semibold text-[#2A394B] mb-2">No Contracts Found</h3>
                        <p className="text-[#374151] text-sm !mb-0">
                            You don't have upcoming contracts at the moment
                        </p>
                        {activeFiltersCount > 0 && (
                            <SButton
                                variant="outline"
                                onClick={() => {
                                    setSearchText("");
                                    setFilterUrgency("all");
                                    setFilterStatus("all");
                                    setFilterProfessional("all");
                                }}
                                className="rounded-lg font-semibold flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all h-10 px-4"
                            >
                                <X className="w-4 h-4"/>
                                Clear All Filters
                            </SButton>
                        )}
                    </div>
                </>
            )}

            {/* Enhanced Contract Details Modal */}
            <Dialog
                open={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh'
                    }
                }}
            >
                {selectedContract && (
                    <>
                        <DialogTitle sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            py: 3
                        }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">
                                        {selectedContract.contract_type_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{opacity: 0.9, mt: 0.5}}>
                                        Contract ID: #{selectedContract.id}
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => setShowDetailsModal(false)}
                                    sx={{
                                        color: '#fff',
                                        '&:hover': {backgroundColor: 'rgba(255,255,255,0.1)'}
                                    }}
                                >
                                    <Close/>
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{p: 3, backgroundColor: '#f8f9fa'}}>
                            {/* Quick Status Bar */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                mb: 3,
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                            }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={3}>
                                        <Box textAlign="center">
                                            <CalendarToday sx={{fontSize: 32, color: '#667eea', mb: 1}}/>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Start Date
                                            </Typography>
                                            <Typography variant="body2" fontWeight="600">
                                                {formatDate(selectedContract.start_date)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box textAlign="center">
                                            <Person sx={{fontSize: 32, color: '#667eea', mb: 1}}/>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Days Until Start
                                            </Typography>
                                            <Typography variant="body2" fontWeight="600">
                                                {getDaysText(selectedContract.days_until_start)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box textAlign="center">
                                            <Typography variant="caption" color="text.secondary" display="block"
                                                        mb={1}>
                                                Urgency
                                            </Typography>
                                            {getUrgencyChip(selectedContract.urgency_level)}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box textAlign="center">
                                            <Typography variant="caption" color="text.secondary" display="block"
                                                        mb={1}>
                                                Status
                                            </Typography>
                                            <Chip
                                                label={selectedContract.status_display?.label || selectedContract.status}
                                                size="small"
                                                sx={{
                                                    backgroundColor: selectedContract.status_display?.color,
                                                    color: '#fff',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Grid container spacing={2}>
                                {/* Contract Information Card */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={2} sx={{p: 2.5, height: '100%', borderRadius: 2}}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                <Edit sx={{color: '#fff', fontSize: 20}}/>
                                            </Box>
                                            <Typography variant="h6" fontWeight="600">
                                                Contract Details
                                            </Typography>
                                        </Box>
                                        <Divider sx={{mb: 2}}/>
                                        <Stack spacing={1.5}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary"
                                                            fontWeight="600">
                                                    POSITION
                                                </Typography>
                                                <Typography variant="body2">
                                                    {selectedContract.position_names && selectedContract.position_names.length > 0
                                                        ? selectedContract.position_names.join(', ')
                                                        : (selectedContract.data?.position || selectedContract.data?.contract_name || '-')}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary"
                                                            fontWeight="600">
                                                    LOCATION
                                                </Typography>
                                                <Typography variant="body2">
                                                    📍 {selectedContract.location || '-'}
                                                </Typography>
                                            </Box>
                                            {selectedContract.data?.rate && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary"
                                                                fontWeight="600">
                                                        RATE
                                                    </Typography>
                                                    <Typography variant="body2" color="success.main"
                                                                fontWeight="600">
                                                        ${selectedContract.data.rate}/hr
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Schedule Card */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={2} sx={{p: 2.5, height: '100%', borderRadius: 2}}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                <CalendarToday sx={{color: '#fff', fontSize: 20}}/>
                                            </Box>
                                            <Typography variant="h6" fontWeight="600">
                                                Schedule
                                            </Typography>
                                        </Box>
                                        <Divider sx={{mb: 2}}/>
                                        <Stack spacing={1.5}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary"
                                                            fontWeight="600">
                                                    START DATE
                                                </Typography>
                                                <Typography variant="body2" fontWeight="600">
                                                    {formatDate(selectedContract.start_date)}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary"
                                                            fontWeight="600">
                                                    END DATE
                                                </Typography>
                                                <Typography variant="body2" fontWeight="600">
                                                    {formatDate(selectedContract.end_date)}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary"
                                                            fontWeight="600">
                                                    DURATION
                                                </Typography>
                                                <Typography variant="body2">
                                                    {selectedContract.duration_days ? `${selectedContract.duration_days} days` : '-'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Applicant Card */}
                                {selectedContract.professional && (
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={2} sx={{
                                            p: 2.5,
                                            height: '100%',
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                                        }}>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <CheckCircle sx={{color: '#10b981', fontSize: 24, mr: 1.5}}/>
                                                <Typography variant="h6" fontWeight="600" color="#065f46">
                                                    Assigned Applicant
                                                </Typography>
                                            </Box>
                                            <Divider sx={{mb: 2}}/>
                                            <Stack spacing={1.5}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary"
                                                                fontWeight="600">
                                                        NAME
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="600">
                                                        {selectedContract.professional.name}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary"
                                                                fontWeight="600">
                                                        EMAIL
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedContract.professional.email}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary"
                                                                fontWeight="600">
                                                        TYPE
                                                    </Typography>
                                                    <Typography variant="body2" color="primary.main"
                                                                fontWeight="600">
                                                        {selectedContract.professional.applicant_type}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Agreement Status Card */}
                                {selectedContract.has_agreement && (
                                    <Grid item xs={12} md={selectedContract.professional ? 6 : 12}>
                                        <Paper
                                            elevation={2}
                                            sx={{
                                                p: 2.5,
                                                height: '100%',
                                                borderRadius: 2,
                                                background: selectedContract.agreement_signed
                                                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                                                    : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" mb={2}>
                                                {selectedContract.agreement_signed ? (
                                                    <CheckCircle sx={{color: '#10b981', fontSize: 24, mr: 1.5}}/>
                                                ) : (
                                                    <Warning sx={{color: '#f59e0b', fontSize: 24, mr: 1.5}}/>
                                                )}
                                                <Typography variant="h6" fontWeight="600"
                                                            color={selectedContract.agreement_signed ? '#065f46' : '#92400e'}>
                                                    Agreement Status
                                                </Typography>
                                            </Box>
                                            <Divider sx={{mb: 2}}/>
                                            <Typography variant="body2" fontWeight="600" mb={0.5}>
                                                {selectedContract.agreement_signed ? 'Fully Signed' : 'Pending Signature'}
                                            </Typography>
                                            {selectedContract.agreement_status && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {selectedContract.agreement_status.replace(/_/g, ' ').toUpperCase()}
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Additional Information Card */}
                                {selectedContract.data && (selectedContract.data.hours_per_day || selectedContract.data.description) && (
                                    <Grid item xs={12}>
                                        <Paper elevation={2} sx={{p: 2.5, borderRadius: 2}}>
                                            <Typography variant="h6" fontWeight="600" mb={2}>
                                                Additional Information
                                            </Typography>
                                            <Divider sx={{mb: 2}}/>
                                            <Stack spacing={1.5}>
                                                {selectedContract.data.hours_per_day && (
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary"
                                                                    fontWeight="600">
                                                            HOURS PER DAY
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {selectedContract.data.hours_per_day} hours/day
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {selectedContract.data.description && (
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary"
                                                                    fontWeight="600">
                                                            DESCRIPTION
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {selectedContract.data.description}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>

                            {/* Action Buttons */}
                            <Box mt={3} display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowDetailsModal(false)}
                                    sx={{px: 3}}
                                >
                                    Close
                                </Button>
                                {/* Redirect to My Contracts or My Applications */}
                                {(() => {
                                    const redirectInfo = getContractRedirectInfo(selectedContract);
                                    return (
                                        <Button
                                            variant="contained"
                                            component={Link}
                                            to={redirectInfo.link}
                                            startIcon={redirectInfo.icon}
                                            sx={{
                                                px: 3,
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5558e3 0%, #7c4fe8 100%)'
                                                }
                                            }}
                                        >
                                            {redirectInfo.label}
                                        </Button>
                                    );
                                })()}
                                {(selectedContract.status === 'booked' || selectedContract.status === 'cancelled') ? (
                                    <Tooltip
                                        title={`Cannot modify - contract is ${selectedContract.status}. Please contact support if you need assistance.`}>
                                        <span>
                                            <Button
                                                variant="contained"
                                                startIcon={<Edit/>}
                                                disabled
                                                sx={{px: 3, opacity: 0.5}}
                                            >
                                                Edit Contract
                                            </Button>
                                        </span>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        variant="contained"
                                        component={Link}
                                        to={`/institute/contracts/${selectedContract.id}/edit`}
                                        startIcon={<Edit/>}
                                        sx={{
                                            px: 3,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)'
                                            }
                                        }}
                                    >
                                        Edit Contract
                                    </Button>
                                )}
                                {selectedContract.has_agreement && !selectedContract.agreement_signed && selectedContract.agreement_id && (
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        component={Link}
                                        to={`/institute/agreements/${selectedContract.agreement_id}`}
                                        sx={{px: 3}}
                                    >
                                        Sign Agreement
                                    </Button>
                                )}
                                {selectedContract.status === 'booked' ? (
                                    <Tooltip
                                        title="Cannot cancel - contract is already booked. Please contact support if you need assistance.">
                                        <span>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<Cancel/>}
                                                disabled
                                                sx={{px: 3, opacity: 0.5}}
                                            >
                                                Cancel Contract
                                            </Button>
                                        </span>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<Cancel/>}
                                        onClick={() => handleOpenCancelModal(selectedContract)}
                                        sx={{px: 3}}
                                    >
                                        Cancel Contract
                                    </Button>
                                )}
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>

            {/* Cancel Confirmation Modal */}
            <CancelConfirmationModal
                open={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setContractToCancel(null);
                }}
                onConfirm={handleCancelContract}
                title="Cancel Contract"
                message={`Are you sure you want to cancel this contract${contractToCancel ? ` (#${contractToCancel.id})` : ''}? This action cannot be undone.`}
                type="contract"
                id={contractToCancel?.id}
            />
        </>
    );
};

export default InstituteUpcomingContracts;
