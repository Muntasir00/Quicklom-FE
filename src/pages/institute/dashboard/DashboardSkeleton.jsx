import {Skeleton} from "@components/ui/skeleton.jsx";

export default function DashboardSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {/* Top Section: Metrics and Status */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                {/* Left Column - Metrics Cards Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 h-full">
                    <Skeleton className="lg:col-span-3 h-[100px]" />
                    <Skeleton className="lg:col-span-3 h-[100px]" />
                    <Skeleton className="lg:col-span-2 h-[100px]" />
                    <Skeleton className="lg:col-span-2 h-[100px]" />
                    <Skeleton className="lg:col-span-2 h-[100px]" />
                </div>

                {/* Right Column - Contract Status Skeleton */}
                <div className="w-full h-full">
                    <Skeleton className="w-full h-[220px] rounded-2xl" />
                </div>
            </div>

            {/* Middle Section: Charts and Applicants */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts Skeleton */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Contract Trend Chart */}
                    <div className="w-full rounded-xl border bg-white p-6">
                        <div className="flex justify-between mb-6">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-[250px] w-full" />
                    </div>

                    {/* Financial Chart */}
                    <div className="w-full rounded-xl border bg-white p-6">
                        <div className="flex gap-6 h-[200px]">
                            <div className="w-1/4 space-y-4">
                                <Skeleton className="h-5 w-20" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </div>
                            <Skeleton className="w-3/4 h-full" />
                        </div>
                    </div>
                </div>

                {/* Applicants Skeleton */}
                <div className="lg:col-span-1">
                    <div className="w-full h-full rounded-xl border bg-white p-6 flex flex-col gap-6">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex gap-3">
                            <Skeleton className="h-16 flex-1" />
                            <Skeleton className="h-16 flex-1" />
                        </div>
                        <Skeleton className="h-5 w-24" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}