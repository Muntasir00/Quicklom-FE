import { Skeleton } from "@components/ui/skeleton";

// eslint-disable-next-line react/prop-types
export function MetricsCard({ label, value, isLoading = false }) {
    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-4 flex flex-col justify-between min-h-[94px] w-full shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
            {/* Label - Top Left */}
            <span className="text-[#475569] text-[15px] font-medium leading-tight">
                {label}
            </span>

            {/* Value - Bottom Right */}
            <div className="flex justify-end items-end h-full">
                {isLoading ? (
                    <Skeleton className="h-10 w-14 rounded-md bg-slate-100" />
                ) : (
                    <span className="text-[#1E40AF] text-[36px] font-semibold leading-none tracking-tight">
                        {value}
                    </span>
                )}
            </div>
        </div>
    );
}