import {Skeleton} from "@components/ui/skeleton.jsx";

const AgreementDashboardSkeleton = () => {
    return (
        <div className="space-y-5 p-1">
            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 h-28 flex flex-col justify-between shadow-sm">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16 self-end" />
                    </div>
                ))}
            </div>

            {/* Filter Button Skeleton */}
            <Skeleton className="h-11 w-32 rounded-lg" />

            {/* Table Skeleton */}
            <div className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Table Header Placeholder */}
                <div className="bg-[#f8f9fa] h-12 w-full flex items-center px-4 gap-4 border-b border-gray-200">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>

                {/* Table Rows Placeholder */}
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5, 6].map((row) => (
                        <div key={row} className="flex items-center px-4 py-5 gap-4">
                            <Skeleton className="h-4 w-[12%]" /> {/* Agreement # */}
                            <div className="flex-1 space-y-2"> {/* Contract */}
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-[15%]" /> {/* Position */}
                            <Skeleton className="h-6 w-[10%] rounded-full" /> {/* You (Badge) */}
                            <Skeleton className="h-4 w-[15%]" /> {/* Other Party */}
                            <Skeleton className="h-4 w-[12%]" /> {/* Status */}
                            <div className="flex items-center gap-2 ml-auto"> {/* Actions */}
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Skeleton */}
                <div className="px-4 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-8 w-64" />
                </div>
            </div>

            {/* Info Box Skeleton */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex items-start gap-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="space-y-3 w-full">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    );
};

export default AgreementDashboardSkeleton;