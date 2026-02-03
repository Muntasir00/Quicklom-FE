const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
);

const PaymentHistorySkeleton = () => {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Top Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-lg p-2 h-28 flex flex-col justify-between shadow-sm">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32 self-end" />
                    </div>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="w-full bg-white border-b border-gray-200 flex">
                {[1, 2].map((i) => (
                    <div key={i} className="flex-1 flex items-center gap-3 px-6 pb-4 pt-2 justify-center sm:justify-start">
                        <Skeleton className="h-5 w-5 rounded-md" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-8 rounded-lg ml-auto" />
                    </div>
                ))}
            </div>

            {/* Content Table Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                {/* Table Header Placeholder */}
                <div className="bg-gray-50 h-12 w-full flex items-center px-6 gap-4 border-b border-gray-100">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-3 flex-1" />
                    ))}
                </div>

                {/* Table Rows Placeholder */}
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5,6,7,8,9].map((row) => (
                        <div key={row} className="flex items-center px-6 py-3 gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-20 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Card Skeleton */}
            <div className="mt-6 flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="space-y-3 w-full">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    );
};

export default PaymentHistorySkeleton;