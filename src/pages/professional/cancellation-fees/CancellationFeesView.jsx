import {
    AlertTriangle,
    Info,
    FileText,
    CreditCard,
    Calendar,
    Percent,
    DollarSign,
    ChevronRight
} from 'lucide-react';

// eslint-disable-next-line react/prop-types
const CancellationFeesView = ({ pendingFees, formatDate, handlePayFee }) => {
    return (
        <div className="space-y-8">

            {/* Header Section */}
            <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-50 rounded-full opacity-50 block"></div>

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-5">
                        <div className="p-4 bg-amber-100 rounded-2xl">
                            <AlertTriangle className="w-8 h-8 text-amber-600" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Cancellation Fees
                            </h1>
                            <p className="text-slate-500 font-medium mt-1 max-w-md leading-relaxed">
                                Outstanding fees that must be paid before applying to new contracts.
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto px-6 py-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-1">
                            Total Outstanding
                        </span>
                        <span className="text-3xl font-black text-white">
                            ${pendingFees?.total_amount?.toFixed(2)} <span className="text-sm font-medium text-slate-400">CAD</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Box - Styled as a subtle callout */}
            <div className="flex items-start gap-4 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <div className="mt-1">
                    <Info className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-indigo-900">Why do I have cancellation fees?</h4>
                    <p className="text-sm text-indigo-700/80 leading-relaxed">
                        Cancellation fees are applied when you withdraw from a booked contract within 48 hours of the start date. This helps ensure reliability for healthcare facilities.
                    </p>
                </div>
            </div>

            {/* Fees List */}
            <div className="grid grid-cols-1 gap-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-2">
                    Pending Invoices
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {pendingFees.fees.length}
                    </span>
                </h2>

                {pendingFees.fees.map((fee) => (
                    <div
                        key={fee.id}
                        className="group bg-white border border-slate-200 rounded-3xl hover:border-indigo-300 transition-all duration-300 hover:shadow-lg overflow-hidden"
                    >
                        {/* Card Header */}
                        <div className="p-5 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-slate-900">
                                        {fee.contract_title || `Contract #${fee.contract_id}`}
                                    </h3>
                                    <span className="text-xs font-medium text-slate-400">
                                        Application ID: {fee.application_id}
                                    </span>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-amber-100">
                                Pending Payment
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
                                {/* Amount */}
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" /> Fee Amount
                                    </span>
                                    <p className="text-lg font-extrabold text-slate-900">
                                        ${fee.amount?.toFixed(2)} <span className="text-xs font-medium">CAD</span>
                                    </p>
                                </div>

                                {/* Rate */}
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                        <Percent className="w-3 h-3" /> Fee Rate
                                    </span>
                                    <p className="text-lg font-bold text-slate-700">
                                        {fee.percentage}%
                                    </p>
                                </div>

                                {/* Date */}
                                <div className="space-y-1 col-span-2 md:col-span-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Date Incurred
                                    </span>
                                    <p className="text-[15px] font-semibold text-slate-700">
                                        {formatDate(fee.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handlePayFee(fee)}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-100 active:scale-95"
                            >
                                <CreditCard className="w-4 h-4" />
                                Pay Invoice
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CancellationFeesView;