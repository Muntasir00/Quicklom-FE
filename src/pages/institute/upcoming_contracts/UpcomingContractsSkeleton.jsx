import React from "react";
import { Skeleton } from "@components/ui/skeleton";

const UpcomingContractsSkeleton = () => {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-md bg-slate-200" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48 bg-slate-200" />
                        <Skeleton className="h-4 w-64 bg-slate-100" />
                    </div>
                </div>
                <Skeleton className="h-11 w-44 rounded-lg bg-slate-200" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-5 border border-slate-100 rounded-2xl bg-white space-y-3 shadow-sm">
                        <Skeleton className="h-4 w-24 bg-slate-100" />
                        <Skeleton className="h-8 w-16 bg-slate-200" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-3 w-20 bg-slate-50" />
                            <Skeleton className="h-5 w-10 rounded-full bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar Skeleton */}
            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <Skeleton className="h-11 flex-1 rounded-xl bg-slate-100" />
                <Skeleton className="h-11 w-32 rounded-xl bg-slate-100" />
            </div>

            {/* Timeline Section Skeleton */}
            <div className="space-y-6">
                {[1, 2].map((section) => (
                    <div key={section} className="space-y-4">
                        {/* Section Header Line */}
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-40 bg-slate-200 rounded-md" />
                            <div className="h-px flex-1 bg-slate-100"></div>
                        </div>

                        {/* Work Cards Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1, 2, 3].map((card) => (
                                <div key={card} className="p-4 border border-slate-200 rounded-xl bg-white space-y-4 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-40 bg-slate-200" />
                                            <Skeleton className="h-4 w-28 bg-slate-100" />
                                        </div>
                                        <Skeleton className="h-6 w-24 rounded-md bg-slate-100" />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Skeleton className="h-3 w-full bg-slate-50" />
                                        <Skeleton className="h-3 w-3/4 bg-slate-50" />
                                        <Skeleton className="h-3 w-1/2 bg-slate-50" />
                                        <Skeleton className="h-3 w-2/3 bg-slate-50" />
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex gap-2">
                                        <Skeleton className="h-9 flex-1 rounded-lg bg-slate-100" />
                                        <Skeleton className="h-9 flex-1 rounded-lg bg-slate-100" />
                                        <Skeleton className="h-9 w-10 rounded-lg bg-slate-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingContractsSkeleton;