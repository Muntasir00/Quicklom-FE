import {MapPin, Calendar, Clock, User2} from 'lucide-react';

const WorkCard = ({job}) => {
    return (
        <div className=" border border-[#D1D5DB] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                    <h3 className="text-[#194185] font-medium !text-base leading-tight tracking-tight !mb-0">
                        {job.title || "Registered Nurse"}
                    </h3>
                    <p className=" font-semibold text-xs">
                        {job.hospital || "City General Hospital"}
                    </p>
                </div>

                {/* Starting Soon Badge */}
                <div className="bg-[#FAF4DE] border border-[#FFEDD5] px-3 py-2 rounded-md">
                  <span className="text-[#E08913] text-xs whitespace-nowrap">
                    Starting Soon (1-3 Days)
                  </span>
                </div>
            </div>

            {/* Details List */}
            <div className="space-y-[10px]">
                <div className="flex items-center gap-1 text-[#374151]">
                    <MapPin className="w-4 h-4  shrink-0"/>
                    <span className="text-xs">{job.location || "San Francisco, CA"}</span>
                </div>

                <div className="flex items-center gap-1 text-[#374151]">
                    <Calendar className="w-4 h-4  shrink-0"/>
                    <span className="text-xs">{job.dateRange || "Jan 15, 2025 — Mar 15, 2025"}</span>
                </div>

                <div className="flex items-center gap-1 text-[#374151]">
                    <Clock className="w-4 h-4  shrink-0"/>
                    <span className="text-xs">{job.shift || "Day Shift (7am - 7pm)"}</span>
                </div>

                <div className="flex items-center gap-1 text-[#374151]">
                    <User2 className="w-4 h-4  shrink-0"/>
                    <span className="text-xs">{job.contact || "Sarah Johnson, RN"}</span>
                </div>
            </div>
        </div>
    );
};

export default WorkCard;