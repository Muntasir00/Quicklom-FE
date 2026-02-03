import {Skeleton} from "@components/ui/skeleton.jsx";

const BillingSkeleton = () => {
    return (
        <div className="space-y-3 p-1">
            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i}
                         className="bg-white border border-gray-100 rounded-lg p-4 h-24 flex flex-col justify-between">
                        <Skeleton className="h-4 w-24"/>
                        <Skeleton className="h-8 w-20 self-end"/>
                    </div>
                ))}
            </div>

            {/* Main Plan Card Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col gap-8">
                <div className="flex justify-center">
                    <Skeleton className="h-7 w-40"/>
                </div>

                <div className="space-y-4">
                    {/* Top Banner Skeleton */}
                    <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                        <Skeleton className="h-10 w-10 rounded-lg"/>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32"/>
                            <Skeleton className="h-3 w-64"/>
                        </div>
                    </div>

                    {/* Subscription Box Skeleton */}
                    <div className="rounded-2xl border border-gray-50 p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-48"/>
                                <Skeleton className="h-4 w-72"/>
                            </div>
                            <Skeleton className="h-20 w-32 rounded-xl"/>
                        </div>

                        {/* Key Benefits Skeleton */}
                        <div className="mt-8 space-y-3">
                            <Skeleton className="h-4 w-24"/>
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className="h-2 w-2 rounded-full"/>
                                        <Skeleton className="h-3 w-full max-w-md"/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Table Skeleton */}
                        <div className="mt-8 border rounded-lg overflow-hidden">
                            <div className="bg-gray-100 h-10 w-full"/>
                            <div className="p-4 space-y-4">
                                <Skeleton className="h-12 w-full"/>
                                <Skeleton className="h-12 w-full"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSkeleton;