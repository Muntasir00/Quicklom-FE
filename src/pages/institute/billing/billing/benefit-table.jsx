import {SquareMinus} from "lucide-react";

export default function BenefitTable() {
    return(
        <div
            className="mt-4 relative overflow-x-auto bg-neutral-primary-soft shadow-xs !rounded-lg border border-default">
            <table className="w-full min-w-[700px] text-sm text-left rtl:text-right text-body">
                <thead className="text-sm text-body bg-[#E5E7EB] border-b border-default">
                <tr>
                    <th scope="col"
                        className="px-6 py-3 font-medium rounded-tl-[8px] w-[10%] sm:w-auto">
                        Fee Type
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium w-[50%] sm:w-auto">
                        Description
                    </th>
                    <th scope="col"
                        className="px-6 py-3 font-medium rounded-tr-[8px] w-[35%] sm:w-auto">
                        Amount
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr className="bg-neutral-primary border-b border-default">
                    <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                        <div className="flex items-center gap-1">
                            <SquareMinus/>
                            <span className="text-[#2A394B]">Service Fee</span>
                        </div>
                    </th>
                    <td className="px-6 py-4">
                        <p className="text-[#2A394B] text-xs">Per booked contract (signed agreement)</p>
                        <p className="text-[#9CA3AF] text-xs">Charged when a contract is successfully
                            booked</p>
                    </td>
                    <td className="px-6 py-4">
                                        <span
                                            className="inline-flex rounded-lg bg-[#DBEEFF] px-3 py-2 text-xs font-medium text-[#2D8FE3]">
                                            $20 CAD
                                          </span>
                    </td>
                </tr>
                <tr className="bg-neutral-primary border-b border-default">
                    <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                        <div className="flex items-center gap-1">
                            <SquareMinus/>
                            <span className="text-[#2A394B]">Direct Hire Commission</span>
                        </div>
                    </th>
                    <td className="px-6 py-4">
                        <p className="text-[#2A394B] text-xs">When hiring a professional directly (no
                            agency)</p>
                        <p className="text-[#9CA3AF] text-xs">Based on total contract value</p>
                    </td>
                    <td className="px-6 py-4">
                                        <span
                                            className="inline-flex rounded-lg bg-[#E1F7F3] px-3 py-2 text-xs font-medium text-[#19B28A]">
                                            10% of contract value
                                          </span>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    )
}