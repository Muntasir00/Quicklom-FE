import {Skeleton} from "@components/ui/skeleton.jsx";

const ApplicantsSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-center space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                ))}
            </div>

            {/* Filter Bar Skeleton */}
            <div className="bg-white rounded-xl p-4 flex flex-wrap gap-4 items-center border border-gray-100">
                <Skeleton className="h-10 flex-1 min-w-[300px] rounded-md" />
                <Skeleton className="h-10 w-[150px] rounded-md" />
                <Skeleton className="h-10 w-[220px] rounded-md" />
            </div>

            {/* Industry Tabs Skeleton */}
            <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-xl overflow-x-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-32 rounded-lg shrink-0" />
                ))}
            </div>

            {/* List Items Skeleton */}
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-24 rounded-md" />
                            <Skeleton className="h-9 w-24 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ApplicantsSkeleton;