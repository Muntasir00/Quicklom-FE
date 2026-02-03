import {cn} from "../../../lib/utils.js";

export default function StatCard({
                                     value,
                                     label,
                                     colorClass,
                                     bgClass,
                                     fill
                                 }) {
    return (
        <div className="flex flex-col min-w-[100px]">
            {/* Value */}
            <span
                className={cn("text-xl font-normal", colorClass)}
                style={fill ? {color: fill} : {}}
            >
                {value}
              </span>

            {/* Label */}
            <span className="text-[10px] text-[#404040] mt-1 mb-2">
                {label}
              </span>

            {/* Progress Bar */}
            <div
                className={cn("h-1 w-[72px] rounded-full", bgClass)}
                style={fill ? {backgroundColor: fill} : {}}
            />
        </div>
    );
}