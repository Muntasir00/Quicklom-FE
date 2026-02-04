import React from 'react';
import {Search, Filter, RotateCcw, Calendar, Briefcase, Hash, Loader2, ChevronDown, ListFilter} from 'lucide-react';

const ContractFilters = ({
                             searchTerm,
                             setSearchTerm,
                             statusFilter,
                             setStatusFilter,
                             showAdvancedFilters,
                             setShowAdvancedFilters,
                             isLoading,
                             handleClearFilters,
                             filters,
                             handleChange,
                             handleAdvancedFilter,
                             positions
                         }) => {

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 mb-6">
            {/* Top Bar: Search and Quick Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Search Box */}
                <div className="relative flex-1 w-full group">
                    <div
                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Search size={18}/>
                    </div>
                    <input
                        type="text"
                        placeholder="Search contracts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 !rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Status Dropdown */}
                <div className="relative w-full md:w-48 group">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 !rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>
                    <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={16}/>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
                        className={`p-2.5 !rounded-lg border transition-all duration-200 ${
                            showAdvancedFilters
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <ListFilter size={20}/>
                    </button>

                    <button
                        onClick={handleClearFilters}
                        disabled={isLoading}
                        title="Clear All Filters"
                        className="p-2.5 !rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin"/> : <RotateCcw size={20}/>}
                    </button>
                </div>
            </div>

            {/* Advanced Filters Section (Animated Collapse) */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvancedFilters ? 'max-h-[500px] opacity-100 mt-6 pt-6 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
                <form onSubmit={handleAdvancedFilter} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Contract ID */}
                        <div className="space-y-2">
                            <label
                                className="!flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                <Hash size={14}/> Contract ID
                            </label>
                            <input
                                type="number"
                                name="contract_id"
                                value={filters.contract_id || ''}
                                onChange={handleChange}
                                placeholder="Enter ID..."
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 !rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>

                        {/* Position Select */}
                        <div className="space-y-2">
                            <label
                                className="!flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                <Briefcase size={14}/> Position
                            </label>
                            <div className="relative">
                                <select
                                    name="position_id"
                                    value={filters.position_id || ''}
                                    onChange={handleChange}
                                    className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 !rounded-md text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none cursor-pointer"
                                >
                                    <option value="">All Positions</option>
                                    {Array.isArray(positions) && positions.map(pos => (
                                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    size={16}/>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                            <label
                                className="!flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                <Calendar size={14}/> Start Date
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={filters.start_date || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 !rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <label
                                className="!flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                <Calendar size={14}/> End Date
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                value={filters.end_date || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 !rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end items-center gap-3">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            disabled={isLoading}
                            className="px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 !rounded-lg transition-colors disabled:opacity-50"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold !rounded-lg  transition-all transform active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin"/>
                                    Applying...
                                </>
                            ) : (
                                'Apply Filters'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContractFilters;