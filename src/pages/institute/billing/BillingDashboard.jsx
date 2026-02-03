import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import BillingService from '@services/institute/BillingService';
import {getCurrentUserService} from '@services/user/AuthService';
import {Info} from "lucide-react";
import MatricsGrid from "@pages/institute/billing/billing/metrics-grid.jsx";
import {Card} from "@components/ui/card.jsx";
import BillingPaymentTopBar from "@pages/institute/billing/billing/billing-payment-top-bar.jsx";
import KeyBenefits from "@pages/institute/billing/billing/key-benefits.jsx";
import BenefitTable from "@pages/institute/billing/billing/benefit-table.jsx";
import BillingSkeleton from "@pages/institute/billing/billing/BillingSkeleton.jsx";

const BillingDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState({
        total_spent: 0,
        pending_invoices: 0,
        paid_invoices: 0,
        overdue_invoices: 0,
        current_month_spent: 0
    });
    const [userCategory, setUserCategory] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadBillingData();
    }, []);

    const loadBillingData = async () => {
        try {
            setLoading(true);
            setError(null);

            const user = await getCurrentUserService();
            setCurrentUser(user);

            const category = user.institute_category_id;
            setUserCategory(category);

            await BillingService.getOrCreateCustomer({
                user_id: user.id,
                email: user.email,
                name: user.name || user.email,
                institute_category_id: category
            });

            const statsResponse = await BillingService.getBillingStatistics();
            setStatistics(statsResponse.statistics || statistics);

        } catch (err) {
            console.error('Error loading billing data:', err);
            setError('Failed to load billing information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    };

    const getUserCategoryInfo = () => {
        const categories = {
            1: {
                name: 'Private Clinics and Practices',
                color: 'primary',
                icon: 'fas fa-hospital',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            },
            2: {
                name: 'Pharmacy',
                color: 'info',
                icon: 'fas fa-pills',
                gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
            },
            3: {
                name: 'Recruitment Agency',
                color: 'success',
                icon: 'fas fa-building',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            },
            4: {
                name: 'Head Hunter',
                color: 'warning',
                icon: 'fas fa-user-tie',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            }
        };
        return categories[userCategory] || categories[1];
    };

    const categoryInfo = getUserCategoryInfo();
    const isAgencyOrHeadhunter = userCategory === 3 || userCategory === 4;

    if (loading) {
        return <BillingSkeleton />
    }

    const billingPaymentsStats = [
        {label: "Total Spent", value: `${formatCurrency(statistics.total_spent)}`},
        {label: "This Month", value: `${formatCurrency(statistics.current_month_spent)}`},
        {label: "Paid Invoices", value: statistics.paid_invoices},
        {label: "Pending", value: statistics.pending_invoices},
    ];

    return (
        <>
            <div className="space-y-3">
                <MatricsGrid stats={billingPaymentsStats}/>
                <Card
                    className="bg-white rounded-xl border border-gray-200 p-3 md:p-6 shadow-[0px_9px_24px_0px_#00000008] flex flex-col gap-8">
                    <h2 className="text-xl text-[#194185] font-bold text-center !mb-0">Your Plan</h2>

                    <div className="space-y-4">
                        {/* Top Banner */}
                        <BillingPaymentTopBar/>

                        <div
                            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-2xl font-medium text-[#194185] !mb-0">Monthly Subscription</h4>
                                    <p className="text-[#194185] text-[18px] !mb-0">Triggered upon your 2nd booked
                                        contract of
                                        the month</p>
                                </div>
                                <div
                                    className="inline-flex items-baseline rounded-xl bg-[#EEF7FF] border border-[#DBEEFF] p-5">
                                    <span className="text-[32px] font-extrabold text-[#2D8FE3] leading-none">
                                        $300
                                    </span>
                                    <span className="ml-2 text-sm text-[#2D8FE3]">
                                        CAD/month
                                    </span>
                                </div>
                            </div>

                            {/* Key Benefits */}
                            <KeyBenefits/>

                            {/* Benefits Table */}
                            <BenefitTable/>


                            <div
                                className="mt-4 flex items-start  gap-3 rounded-lg bg-[#DBEEFF] p-2 border">
                                <Info className="h-5 w-5 flex-shrink-0 text-[#2D8FE3]"/>
                                <p className="text-sm text-[#2A394B] leading-relaxed !mb-0">
                                    <span className="font-medium text-[#2D8FE3]">Note</span> All prices shown are before
                                    taxes.
                                    GST/HST/PST/QST
                                    will be applied based on your province at checkout.
                                </p>
                            </div>

                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default BillingDashboard;
