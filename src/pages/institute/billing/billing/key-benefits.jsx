export default function KeyBenefits() {
    return (
        <div className="mt-4 space-y-3">
            <h5 className="text-xs font-medium text-[#4B5563] tracking-wider !mb-0.5">Key Benefits</h5>
            <ul className="grid gap-3">
                {[
                    "First booked contract each month is subscription-free",
                    "$20 flat service fee per successful booking",
                    "10% commission only on direct hire placements",
                    "Posting contracts is always FREE",
                    "Access to all platform features",
                ].map((benefit, i) => (
                    <KeyBenefit benefit={benefit} index={i}/>
                ))}
            </ul>
        </div>
    )
}

function KeyBenefit({index, benefit}) {
    return (
        <li key={index}
            className="flex items-baseline md:items-center gap-2 font-light text-[#4B5563] px-0.5 !mb-0">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2D8FE3]"/>
            {benefit}
        </li>
    )
}