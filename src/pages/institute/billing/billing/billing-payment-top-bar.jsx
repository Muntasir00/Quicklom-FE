import {Building2} from "lucide-react";

export default function BillingPaymentTopBar() {
    return (
        <div className="flex items-start md:items-center gap-4 rounded-lg bg-[#F3F9FE] p-2 md:p-3">
            <div
                className="flex h-10 w-10 items-center justify-center rounded-lg sm:bg-[#EAF5FE] text-[#2D8FE3]">
                <Building2 className="h-5 w-5" color="#2D8FE3"/>
            </div>
            <div>
                <h3 className="font-semibold text-[#194185] !mb-0">Recruitment Agency</h3>
                <p className="text-sm text-[#194185] !mb-0">
                    Monthly subscription + per-contract fees. First contract free each month!
                </p>
            </div>
        </div>
    )
}