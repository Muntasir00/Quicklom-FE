import {Skeleton} from "@components/ui/skeleton.jsx";

const InvoicesSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Header: Filter Button & Tabs Skeleton */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-1">
                {/* Filter Button Skeleton */}
                <div className="pr-4 py-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                </div>

                {/* Tabs Skeleton */}
                <div className="flex flex-1 items-center gap-8 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 pb-3 min-w-[120px]">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-8 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Table Header Skeleton */}
                <div className="bg-gray-100 h-12 w-full border-b border-gray-200 flex items-center px-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                    <Skeleton className="h-4 w-10" />
                </div>

                {/* Table Rows Skeleton */}
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                        <div key={row} className="flex items-center px-4 py-5 gap-4">
                            <Skeleton className="h-4 w-[12%]" /> {/* Invoice ID */}
                            <Skeleton className="h-6 w-[10%] rounded-full" /> {/* Type Badge */}
                            <div className="flex-1 space-y-2"> {/* Contract */}
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-4 w-[12%]" /> {/* Issue Date */}
                            <Skeleton className="h-4 w-[12%]" /> {/* Due Date */}
                            <Skeleton className="h-4 w-[10%]" /> {/* Amount */}
                            <Skeleton className="h-6 w-[10%] rounded-lg" /> {/* Status */}
                            <Skeleton className="h-8 w-8 rounded-full" /> {/* Action */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InvoicesSkeleton;