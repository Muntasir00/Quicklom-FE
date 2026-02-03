import {useState, useEffect} from "react";
import {useViewDashboard} from "@hooks/institute/dashboard/useViewDashboard";
import axios from "axios";
import Swal from "sweetalert2";
import {Card} from "@components/ui/card.jsx";
import StatCard from "@pages/institute/dashboard/stat-card.jsx";
import ContractsChart from "@pages/institute/dashboard/contracts-chart.jsx";
import {FinancialLineChart} from "@pages/institute/dashboard/financial-line-chart.jsx";
import {LayoutGrid} from "lucide-react";
import DashboardSkeleton from "@pages/institute/dashboard/DashboardSkeleton.jsx";

function Dashboard() {
    const {
        sessionUserRole,
        contractStatistics,
        dashboardKPIs,
        loading
    } = useViewDashboard();

    const [pendingFees, setPendingFees] = useState(null);
    const [loadingFees, setLoadingFees] = useState(true);

    useEffect(() => {
        fetchPendingFees();
    }, []);

    const fetchPendingFees = async () => {
        try {
            setLoadingFees(true);
            const response = await axios.get('/v.1/institute/pending-cancellation-fees');
            if (response.data.status) {
                setPendingFees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching pending fees:', error);
            setPendingFees({fees: [], total_amount: 0, has_outstanding_fees: false});
        } finally {
            setLoadingFees(false);
        }
    };

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

    const totalContracts = contractStatistics?.total_contracts || 0;

    if (loading) {
        return <DashboardSkeleton/>;
    }

    const applicants = [
        {
            id: 1,
            name: "James Smith",
            contract: "Contract Title",
            time: "15 min ago",
            avatar: "https://i.pravatar.cc/150?img=11", // Placeholder image
        },
        {
            id: 2,
            name: "Liam Johnson",
            contract: "Contract Title",
            time: "3 hours ago",
            avatar: "https://i.pravatar.cc/150?img=5",
        },
        {
            id: 3,
            name: "Sophia Brown",
            contract: "Contract Title",
            time: "Yesterday",
            avatar: "https://i.pravatar.cc/150?img=9",
        },
        {
            id: 4,
            name: "Olivia Williams",
            contract: "Contract Title",
            time: "1 Dec, 2025",
            avatar: "https://i.pravatar.cc/150?img=24",
        },
        {
            id: 5,
            name: "Noah Jones",
            contract: "Contract Title",
            time: "29 Nov, 2025",
            avatar: "https://i.pravatar.cc/150?img=13",
        },
    ];

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                {/* Left Column - Metrics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 h-full">
                    {/* Time to fill */}
                    <Card
                        className="bg-white lg:col-span-3 flex flex-col justify-between p-3 border border-[rgba(230,230,235,1)] rounded-lg">
                        <h3 className="text-sm text-[#102A56] !mb-0">Time to fill</h3>
                        <p className="font-light text-[40px] leading-none tracking-normal text-right text-[#707070] !mb-0">
                            {dashboardKPIs?.operational_efficiency?.time_to_fill_days || 0}d
                        </p>
                    </Card>

                    {/* Fill Rate */}
                    <Card
                        className="bg-white lg:col-span-3 flex flex-col justify-between p-3 border border-[rgba(230,230,235,1)] rounded-lg">
                        <h3 className="text-sm text-[#102A56] mb-2 font-normal !mb-0">Fill Rate</h3>
                        <p className="font-light text-[40px] leading-none tracking-normal text-right text-[#707070] !mb-0">
                            {dashboardKPIs?.pipeline?.fill_rate || 0}%
                        </p>
                    </Card>

                    {/* Response Time */}
                    <Card
                        className="bg-white lg:col-span-2 flex flex-col justify-between p-3 border border-[rgba(230,230,235,1)] rounded-lg">
                        <h3 className="text-sm text-[#102A56] mb-2 font-normal !mb-0">Response Time</h3>
                        <p className="font-light text-[40px] leading-none tracking-normal text-right text-[#707070] !mb-0">
                            {dashboardKPIs?.operational_efficiency?.response_time_hours || 0}h
                        </p>
                    </Card>

                    {/* Cancellation Rate */}
                    <Card
                        className="bg-white lg:col-span-2 flex flex-col justify-between p-3 border border-[rgba(230,230,235,1)] rounded-lg">
                        <h3 className="text-sm text-[#102A56] mb-2 font-normal !mb-0">Cancellation Rate</h3>
                        <p className="font-light text-[40px] leading-none tracking-normal text-right text-[#707070] !mb-0">
                            {dashboardKPIs?.pipeline?.cancellation_rate || 0}%
                        </p>
                    </Card>

                    {/* Acceptance Rate */}
                    <Card
                        className="bg-white lg:col-span-2 flex flex-col justify-between p-3 border border-[rgba(230,230,235,1)] rounded-lg">
                        <h3 className="text-sm text-[#102A56] mb-2 font-normal !mb-0">Acceptance Rate</h3>
                        <p className="font-light text-[40px] leading-none tracking-normal text-right text-[#707070] !mb-0">
                            {dashboardKPIs?.engagement?.acceptance_rate || 0}%
                        </p>
                    </Card>
                </div>
                <div className="max-w-6xl mx-auto w-full h-full">
                    <div
                        className="rounded-2xl p-4 shadow-sm bg-gradient-to-r from-[#EAF5FE] to-[#DBEEFF] h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-[#102A56] !mb-0">Contract status</h2>
                            <div className="flex gap-2 items-center">
                                <span className="text-base text-[#194185] font-medium">Total</span>
                                <span className="text-[32px] leading-[1] font-normal text-[#194185]">
                                    {totalContracts}
                                </span>
                            </div>
                        </div>

                        <div className="my-4 h-px w-full bg-white"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-y-0">

                            <div className="p-4 md:border-r border-b border-white">
                                <p className="text-lg text-[#4a6fae] !mb-0">Pending</p>
                                <p className="text-4xl font-light text-[#163b7c] text-right !mb-0">
                                    {contractStatistics?.contract_status?.pending || 0}
                                </p>
                            </div>
                            <div className="p-4 md:border-r border-b border-white">
                                <p className="text-lg text-[#4a6fae] !mb-0">Open</p>
                                <p className="text-4xl font-light text-[#163b7c] text-right !mb-0">
                                    {contractStatistics?.contract_status?.open || 0}
                                </p>
                            </div>
                            <div className="p-4 border-b border-white">
                                <p className="text-lg text-[#4a6fae] !mb-0">Pending Sign</p>
                                <p className="text-4xl font-light text-[#163b7c] text-right !mb-0">
                                    {contractStatistics?.contract_status?.pending_signature || 0}
                                </p>
                            </div>
                            <div className="p-4 md:border-r border-b md:border-b-0 border-white">
                                <p className="text-lg text-[#4a6fae] !mb-0">Booked</p>
                                <p className="text-4xl font-light text-[#163b7c] text-right !mb-0">
                                    {contractStatistics?.contract_status?.booked || 0}
                                </p>
                            </div>
                            <div className="p-4 md:border-r border-b md:border-b-0  border-white">
                                <p className="text-lg text-[#4a6fae] !mb-0">Closed</p>
                                <p className="text-4xl font-light text-[#163b7c] text-right !mb-0">
                                    {contractStatistics?.contract_status?.closed || 0}
                                </p>
                            </div>
                            <div className="p-4  border-white">
                                <p className="text-lg text-[#4a6fae] !mb-0">Cancelled</p>
                                <p className="text-4xl font-light text-[#163b7c] text-right !mb-0">
                                    {contractStatistics?.contract_status?.cancelled || 0}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-6 w-full min-h-screen ">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="w-full rounded-xl border bg-white shadow-sm p-6">
                            <div className="flex items-center justify-between flex-wrap mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 !mb-0">6 Month Contract Trend</h3>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-[2px] bg-teal-400"></div>
                                        <span className="text-[#212529] text-xs">Published</span>
                                        {/*<span className="font-semibold text-gray-900">15</span>*/}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-[2px] bg-blue-500"></div>
                                        <span className="text-[#212529] text-xs">Booked</span>
                                        {/*<span className="font-semibold text-gray-900">210</span>*/}
                                    </div>
                                </div>
                            </div>
                            <ContractsChart chartData={dashboardKPIs?.trends?.monthly_trends}/>
                        </div>

                        <div className="w-full h-[300px] rounded-xl border bg-white shadow-sm p-6">
                            <div className="flex flex-col md:flex-row gap-6 h-full w-full">
                                <div
                                    className="w-full md:w-[25%] flex flex-col justify-between gap-4 pr-4">
                                    <div className="space-y-1">
                                        <h2 className="text-sm font-semibold text-[#102A56] leading-none tracking-tight !mb-0">Financial</h2>
                                    </div>

                                    <div className="flex gap-3">
                                        <StatCard
                                            value="$0"
                                            label="Spend MTD"
                                            colorClass="text-teal-400"
                                            bgClass="bg-teal-400"
                                        />

                                        <StatCard
                                            value="$0"
                                            label="Spend YTD"
                                            colorClass="text-blue-500"
                                            bgClass="bg-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="w-full md:w-[75%] h-full">
                                    <FinancialLineChart chartData={dashboardKPIs?.trends?.monthly_trends}/>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 h-full relative">
                        <div
                            className="w-full h-full  rounded-xl border bg-white shadow-sm p-6 flex flex-col gap-6">
                            <h2 className="text-sm font-medium text-[#102A56] !mb-0">Applications</h2>
                            <div
                                className="bg-[#F6F6FB] rounded-[6px] p-2 flex items-center justify-center md:justify-between gap-3 mb-2">
                                <div className="flex flex-col">
                                    <span className="text-xl font-normal text-[#2E90FA]">4</span>
                                    <span
                                        className="text-sm text-[#404040] font-normal">Total Received</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-normal text-[#2E90FA]">1</span>
                                    <span
                                        className="text-sm text-[#404040] font-normal">Pending Review</span>
                                </div>
                            </div>

                            <h3 className="text-sm font-normal text-[#404040] !mb-0">New Applicants</h3>

                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                <div className="divide-y divide-gray-100">
                                    {applicants.map((applicant) => (
                                        <div
                                            key={applicant.id}
                                            className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-200 group cursor-pointer"
                                        >
                                            {/* Avatar */}
                                            <img
                                                src={applicant.avatar}
                                                alt={applicant.name}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-blue-100"
                                            />

                                            {/* Info */}
                                            <div className="ml-4 flex-1 min-w-0">
                                                <h4 className="!text-base font-medium text-[#333333] truncate !mb-0">
                                                    {applicant.name}
                                                </h4>
                                                <p className="!text-[10px] text-[#8E8E8E] truncate !mb-0">
                                                    Applied for <span
                                                    className="text-[#175CD3] font-normal">{applicant.contract}</span>
                                                </p>
                                            </div>

                                            {/* Time */}
                                            <div className="ml-2 text-[10px] text-[#8E8E8E] whitespace-nowrap">
                                                {applicant.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white !p-4 !rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center">
                                <LayoutGrid size={24}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
