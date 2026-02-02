import { Search, RotateCcw, Hash, UserCircle, Briefcase, Calendar, Info } from "lucide-react";

// eslint-disable-next-line react/prop-types
const UserContractFilterForm = ({ setApplications, useFilterHook }) => {
    const { 
        filters, 
        handleChange, 
        handleClear, 
        handleSubmit,
        instituteSpecialties,
        positions, 
        CONTRACT_APPLICATION_STATUS 
    } = useFilterHook(setApplications);

    return (
        <form className="mb-4" onSubmit={handleSubmit}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                    <Search className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-800">Search Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Contract ID */}
                    <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5" /> Contract ID
                        </div>
                        <input
                            type="number"
                            name="contract_id"
                            onChange={handleChange}
                            value={filters.contract_id || ''}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                            placeholder="e.g. 1024"
                            min="1"
                        />
                    </div>

                    {/* Position Sought */}
                    <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5" /> Position Sought
                        </div>
                        <select
                            name="position_id"
                            onChange={handleChange}
                            value={filters.position_id}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm appearance-none cursor-pointer"
                        >
                            <option value="">All Positions</option>
                            {Array.isArray(positions) && positions.length > 0 ? (
                                positions.map((position) => (
                                    <option key={position.id} value={position.id}>
                                        {position.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No positions available</option>
                            )}
                        </select>
                    </div>

                    {/* Institute Specialties */}
                    <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <UserCircle className="w-3.5 h-3.5" /> Institute Specialties
                        </div>
                        <select
                            name="institute_specialty_id"
                            onChange={handleChange}
                            value={filters.institute_specialty_id}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm appearance-none cursor-pointer"
                        >
                            <option value="">All Specialties</option>
                            {Array.isArray(instituteSpecialties) && instituteSpecialties?.length > 0 ? (
                                instituteSpecialties.map((specialty) => (
                                    <option key={specialty?.id} value={specialty?.id}>
                                        {specialty?.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No specialties available</option>
                            )}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" /> Application Status
                        </div>
                        <select
                            name="status"
                            onChange={handleChange}
                            value={filters.status}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm appearance-none cursor-pointer"
                        >
                            <option value="">All Status</option>
                            {Object.entries(CONTRACT_APPLICATION_STATUS).map(([key, value]) => (
                                <option key={key} value={value}>
                                    {value.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Start Date
                        </div>
                        <input
                            type="date"
                            name="start_date"
                            onChange={handleChange}
                            value={filters.start_date}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> End Date
                        </div>
                        <input
                            type="date"
                            name="end_date"
                            onChange={handleChange}
                            value={filters.end_date}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-all cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" /> Clear Filters
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all cursor-pointer"
                    >
                        <Search className="w-4 h-4" /> Search
                    </button>
                </div>
            </div>
        </form>
    );
};

export default UserContractFilterForm;
