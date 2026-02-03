function MetricsCard({label, value}) {
    return (
        <div
            className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between min-h-[6rem] hover:shadow-md transition-shadow duration-200">
              <span className="text-sm sm:text-base font-medium text-[#194185]">
                {label}
              </span>
            <span className="text-2xl sm:text-[32px] font-semibold text-right text-[#194185] mt-2">
                {value}
              </span>
        </div>
    )
}

const MatricsGrid = ({stats}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <MetricsCard
                    key={index}
                    label={stat.label}
                    value={stat.value}
                />
            ))}
        </div>
    )
}

export default MatricsGrid;