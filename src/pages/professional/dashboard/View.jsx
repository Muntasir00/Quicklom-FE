import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useViewDashboard} from "@hooks/professional/dashbaord/useViewDashboard";
import {useViewContractApplications} from "@hooks/professional/statistics/useViewContractApplications";
import axios from 'axios';
import Swal from 'sweetalert2';
import "../../../styles/modernStyles.css";
import {ArrowUpRight} from "lucide-react";
import {Skeleton} from "@components/ui/skeleton.jsx";

function View() {
    const {menu, sessionUserRole} = useViewDashboard();
    const {contractApplicationStatistics} = useViewContractApplications();
    const [dashboardKpis, setDashboardKpis] = useState(null);
    const [loadingKpis, setLoadingKpis] = useState(true);
    const [pendingFees, setPendingFees] = useState(null);
    const [loadingFees, setLoadingFees] = useState(true);

    const totalApplications = contractApplicationStatistics?.total_applications ?? 0;
    const pendingApplications = contractApplicationStatistics?.application_status?.pending ?? 0;
    const acceptedApplications = contractApplicationStatistics?.application_status?.accepted ?? 0;
    const rejectedApplications = contractApplicationStatistics?.application_status?.rejected ?? 0;

    // Calculate acceptance rate
    const acceptanceRate = totalApplications > 0
        ? Math.round((acceptedApplications / totalApplications) * 100)
        : 0;

    // Fetch dashboard KPIs
    useEffect(() => {
        const fetchDashboardKpis = async () => {
            try {
                setLoadingKpis(true);
                const response = await axios.get('/v.1/professional/statistics/dashboard-kpis');
                if (response.data.status) {
                    setDashboardKpis(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard KPIs:', error);
            } finally {
                setLoadingKpis(false);
            }
        };

        fetchDashboardKpis();
    }, []);

    // Fetch pending cancellation fees
    useEffect(() => {
        const fetchPendingFees = async () => {
            try {
                setLoadingFees(true);
                const response = await axios.get('/v.1/professional/pending-cancellation-fees');
                console.log('Pending fees response:', response.data);
                if (response.data.status) {
                    setPendingFees(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching pending fees:', error);
                // Set empty state on error so loading indicator disappears
                setPendingFees({fees: [], total_amount: 0, has_outstanding_fees: false});
            } finally {
                setLoadingFees(false);
            }
        };

        fetchPendingFees();
    }, []);

    const handlePayFee = (fee) => {
        if (fee.payment_url) {
            window.open(fee.payment_url, '_blank');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Payment Error',
                text: 'Unable to create payment session. Please try again later.',
            });
        }
    };

    const quickActions = [
        {
            title: "Browse Jobs",
            description: "Find new opportunities",
            icon: "fas fa-search",
            link: `/${sessionUserRole}/published-contracts`,
            color: "primary"
        },
        {
            title: "My Availability",
            description: "Manage your schedule",
            icon: "fas fa-calendar-alt",
            link: `/${sessionUserRole}/availability`,
            color: "success"
        },
        {
            title: "Upcoming Works",
            description: "Manage your schedule",
            icon: "fas fa-calendar-alt",
            link: `/${sessionUserRole}/upcoming-contracts`,
            color: "success"
        },
        {
            title: "Agreements",
            description: "Manage your schedule",
            icon: "fas fa-calendar-alt",
            link: `/${sessionUserRole}/agreements`,
            color: "success"
        },
        {
            title: "Messages",
            description: "Check communications",
            icon: "fas fa-comments",
            link: `/${sessionUserRole}/messaging`,
            color: "info"
        },
        {
            title: "Profile",
            description: "Update your information",
            icon: "fas fa-user-circle",
            link: `/${sessionUserRole}/profile/${sessionUserRole}/edit`,
            color: "warning"
        }
    ];

    const NumberSkeleton = () => <Skeleton className="h-10 w-16 ml-auto"/>;
    const CardSkeleton = () => <Skeleton className="h-32 w-full rounded-[8px]"/>;
    const cardBase = "bg-white border border-[#E6E6EB] rounded-[8px] p-4 relative hover:shadow-sm transition-shadow";
    const labelStyle = "text-slate-600 font-semibold text-sm";
    // const numberStyle = "text-4xl font-medium text-slate-500 absolute bottom-4 right-6";
    const iconStyle = "absolute bottom-4 right-4 text-slate-300 w-5 h-5";

    return (
        <div className="min-h-screen">
            <div className="space-y-6">

                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 grid sm:grid-cols-2 gap-4">
                        {loadingKpis ? (
                            <>
                                <CardSkeleton/> <CardSkeleton/>
                                <CardSkeleton/> <CardSkeleton/>
                            </>
                        ) : (
                            <>
                                <div className={cardBase + " h-32"}>
                                    <span className={labelStyle}>Browse Jobs</span>
                                    <Link to={quickActions[0].link}>
                                        <ArrowUpRight className={iconStyle}/>
                                    </Link>
                                </div>
                                <div className={cardBase + " h-32"}>
                                    <span className={labelStyle}>My Availability</span>
                                    <Link to={quickActions[1].link}>
                                        <ArrowUpRight className={iconStyle}/>
                                    </Link>
                                </div>
                                <div className={cardBase + " h-32"}>
                                    <span className={labelStyle}>Upcoming Works</span>
                                    <Link to={quickActions[2].link}>
                                        <ArrowUpRight className={iconStyle}/>
                                    </Link>
                                </div>
                                <div className={cardBase + " h-32"}>
                                    <span className={labelStyle}>Agreements</span>
                                    <Link to={quickActions[3].link}>
                                        <ArrowUpRight className={iconStyle}/>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Section: My Applications */}
                    <div
                        className="md:col-span-7 bg-[linear-gradient(90deg,#EAF5FE_0%,#DBEEFF_100%)]  rounded-[8px] p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-slate-700 font-bold">My Applications</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-slate-500 text-sm">Total</span>
                                {
                                    loadingKpis ?
                                        <Skeleton className="h-8 w-10"/> :
                                        <span className="text-3xl font-bold text-[#1e3a8a]">
                                        {totalApplications}
                                    </span>
                                }

                            </div>
                        </div>

                        <div
                            className="flex-1 grid grid-cols-3 bg-white/50 rounded-lg border border-blue-100 overflow-hidden">
                            <div className="p-4 border-r border-blue-100 flex flex-col justify-between">
                                <span className="text-slate-500 text-sm font-medium">Pending</span>
                                {loadingKpis ? <NumberSkeleton/> :
                                    <span className="text-4xl text-blue-800 text-right">{pendingApplications}</span>}
                            </div>
                            <div className="p-4 border-r border-blue-100 flex flex-col justify-between">
                                <span className="text-slate-500 text-sm font-medium">Accepted</span>
                                {loadingKpis ? <NumberSkeleton/> :
                                    <span className="text-4xl text-blue-800 text-right">{acceptedApplications}</span>}
                            </div>
                            <div className="p-4 flex flex-col justify-between">
                                <span className="text-slate-500 text-sm font-medium">Rejected</span>
                                {loadingKpis ? <NumberSkeleton/> :
                                    <span className="text-4xl text-blue-800 text-right">{rejectedApplications}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: My Agreements */}
                <div className="bg-[#f1f5f9] border border-[#E6E6EB] rounded-[8px] p-4">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-slate-700 font-bold">My Agreements</h2>
                        <Link to={`/${sessionUserRole}/agreements`}>
                            <ArrowUpRight className="text-slate-400 w-5 h-5"/>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {label: "Total", value: 9}, // আপনার ডাটা সোর্স অনুযায়ী এখানে ভ্যালু বসবে
                            {label: "Action Required", value: 0},
                            {label: "Pending Publisher", value: 4},
                            {label: "Fully Signed", value: 5}
                        ].map((item, idx) => (
                            <div key={idx} className={cardBase + " h-36"}>
                                <span className="text-blue-800/70 font-semibold text-sm">{item.label}</span>
                                {loadingKpis ? (
                                    <Skeleton className="h-10 w-12 absolute bottom-4 right-6"/>
                                ) : (
                                    <span className="text-4xl font-medium text-blue-900/60 absolute bottom-4 right-6">
                                        {item.value}
                                    </span>
                                )}
                            </div>
                        ))}

                        {/* Total Card */}
                        {/*<div className={cardBase + " h-36"}>*/}
                        {/*    <span className="text-blue-800/70 font-semibold text-sm">Total</span>*/}
                        {/*    <span*/}
                        {/*        className="text-4xl font-medium text-blue-900/60 absolute bottom-4 right-6">9</span>*/}
                        {/*</div>*/}

                        {/* Action Required Card */}
                        {/*<div className={cardBase + " h-36"}>*/}
                        {/*    <span className="text-blue-800/70 font-semibold text-sm">Action Required</span>*/}
                        {/*    <span*/}
                        {/*        className="text-4xl font-medium text-blue-900/60 absolute bottom-4 right-6">0</span>*/}
                        {/*</div>*/}

                        {/* Pending Publisher Card */}
                        {/*<div className={cardBase + " h-36"}>*/}
                        {/*    <span className="text-blue-800/70 font-semibold text-sm">Pending Publisher</span>*/}
                        {/*    <span*/}
                        {/*        className="text-4xl font-medium text-blue-900/60 absolute bottom-4 right-6">4</span>*/}
                        {/*</div>*/}

                        {/* Fully Signed Card */}
                        {/*<div className={cardBase + " h-36"}>*/}
                        {/*    <span className="text-blue-800/70 font-semibold text-sm">Fully Signed</span>*/}
                        {/*    <span*/}
                        {/*        className="text-4xl font-medium text-blue-900/60 absolute bottom-4 right-6">5</span>*/}
                        {/*</div>*/}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default View;
