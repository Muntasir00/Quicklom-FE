
const FeatureGrid = ({stats}) => {
    const gridColsClass = stats.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-4";

    return (
        <div className={`grid grid-cols-2 md:grid-cols-2 ${gridColsClass} gap-4 mb-6`}>
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`
             bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between h-24 hover:shadow-sm transition-shadow
             ${stats.length === 3 && index === 2 ? "col-span-2 lg:col-span-1" : ""}
          `}
                >
                      <span className="text-base font-medium text-[#194185]">
                        {stat.label}
                      </span>
                    <span className="text-[32px] text-right text-[#194185]">
                        {stat.value}
                      </span>
                </div>
            ))}
        </div>
    );
};

const FeatureCard = ({stats}) => {
    return (
        <div
            className="grid gap-4 mb-6"
            style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
            }}
        >
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between h-24 hover:shadow-sm transition-shadow"
                >
                      <span className="text-base font-medium text-[#194185]">
                        {stat.label}
                      </span>
                    <span className="text-2xl md:text-[32px] text-right text-[#194185]">
                        {stat.value}
                      </span>
                </div>
            ))}
        </div>
    );
};


export {FeatureCard, FeatureGrid};