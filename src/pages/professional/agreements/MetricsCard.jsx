import { Skeleton } from "@components/ui/skeleton";

export function MetricsCard({ label, value, isLoading = false }) {
    return (
        <div className="border border-[#E6E6EB] rounded-lg p-3 flex flex-col justify-between min-h-[110px] gap-4 w-full transition-all">
            {/* Label - Top Left */}
            <span className="text-[#194185] text-base font-medium leading-tight">
                {label}
            </span>

            {/* Value - Bottom Right */}
            <div className="flex justify-end items-end h-full">
                {isLoading ? (
                    <Skeleton className="h-10 w-16 rounded-md bg-slate-100" />
                ) : (
                    <span className="text-[#194185] text-[32px] font-semibold leading-none tracking-tight">
                        {value}
                    </span>
                )}
            </div>
        </div>
    );
}