import { Loader2 } from 'lucide-react'; // Lucide Icon for Loading

const LoadingState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white/50 rounded-xl border border-slate-100 backdrop-blur-sm">
            {/* Spinning Icon Container */}
            <div className="relative flex items-center justify-center mb-5">
                {/* Background Pulse Effect */}
                <div className="absolute inset-0 bg-indigo-100 rounded-full scale-150 opacity-30 animate-pulse"></div>

                {/* The Spinner */}
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" strokeWidth={2.5} />
                </div>
            </div>

            {/* Loading Text with Fade effect */}
            <div className="flex flex-col items-center gap-1">
                <h3 className="text-lg font-bold text-slate-900 animate-pulse">
                    Processing...
                </h3>
                <p className="text-sm font-medium text-slate-400">
                    Please wait while we fetch your fee details.
                </p>
            </div>
        </div>
    );
};

export default LoadingState;