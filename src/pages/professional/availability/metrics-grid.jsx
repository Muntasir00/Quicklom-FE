import {MetricsCard} from "@pages/professional/published-contracts/metrics-card.jsx";

// eslint-disable-next-line react/prop-types
const MetricsGrid = ({ stats = [], isLoading = false }) => {
    // যদি ডাটা না থাকে তবুও ৩টি কার্ডের স্কেলিটন বা প্লেসহোল্ডার দেখাবে
    const displayStats = stats.length > 0 ? stats : [
        { label: "Total Jobs", value: 0 },
        { label: "Open Now", value: 0 },
        { label: "Applied", value: 0 }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full mb-8">
            {displayStats.map((stat, index) => (
                <MetricsCard
                    key={index}
                    label={stat.label}
                    value={stat.value}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
};

export default MetricsGrid;