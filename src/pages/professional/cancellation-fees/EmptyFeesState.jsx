import { Link } from 'react-router-dom';
import { CheckCircle2, Search } from 'lucide-react';

// eslint-disable-next-line react/prop-types
const EmptyFeesState = ({ sessionUserRole }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-xl border border-dotted border-slate-300 text-center shadow-sm">
            {/* Success Icon with Background Animation */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-100 rounded-full scale-150 opacity-20 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2} />
                </div>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
                No Outstanding Fees
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">
                You don't have any pending cancellation fees at the moment. You're all caught up!
            </p>

            {/* Action Button */}
            <Link
                to={`/${sessionUserRole}/published-contracts`}
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold border border-slate-800 rounded-lg transition-all duration-300 shadow-md shadow-indigo-200 hover:-translate-y-1"
            >
                <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Browse Available Jobs</span>
            </Link>
        </div>
    );
};

export default EmptyFeesState;