import React from 'react';
import { MetricsCard } from './MetricsCard';

const AgreementStatsGrid = ({ statsData, isLoading = false }) => {
    // ডিফল্ট ডাটা যদি প্রপস না থাকে
    const defaultStats = [
        { label: "Total Agreements", value: statsData?.total || 0 },
        { label: "Pending Your Signature", value: statsData?.pending || 0 },
        { label: "Fully Signed", value: statsData?.signed || 0 },
        { label: "Expired", value: statsData?.expired || 0 }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full mb-8">
            {defaultStats.map((stat, index) => (
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

export default AgreementStatsGrid;