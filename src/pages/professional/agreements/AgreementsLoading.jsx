import { FileSignature, Loader2 } from 'lucide-react';

const AgreementsLoading = () => {
    return (
        <div className="bg-slate-50/50 p-3 rounded-lg">
            <div className="w-full">

                {/* Header Section */}
                <div className="flex items-center gap-4 mb-10 ">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <FileSignature className="w-7 h-7 text-indigo-600" strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight !mb-0">
                            Agreements
                        </h1>
                        <p className="text-sm font-medium text-slate-500 !mb-0">
                            Manage and sign your professional service contracts
                        </p>
                    </div>
                </div>

                {/* Main Loading Content */}
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100 relative overflow-hidden">

                    {/* Background Decorative Circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                    {/* Animated Loader Container */}
                    <div className="relative mb-8">
                        {/* Outer Glow Pulse */}
                        <div className="absolute inset-0 bg-indigo-200 rounded-full scale-150 opacity-20 animate-pulse"></div>

                        {/* Central Icon/Loader */}
                        <div className="relative w-20 h-20 bg-white rounded-xl shadow-xl flex items-center justify-center border border-slate-100">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Loading Texts */}
                    <div className="text-center space-y-2 relative">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                            Fetching Agreements
                        </h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto text-[15px]">
                            We're preparing your contract documents and signatures. Please wait a moment.
                        </p>
                    </div>

                    {/* Placeholder "Skeleton" Lines to simulate content loading */}
                    <div className="mt-12 flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgreementsLoading;