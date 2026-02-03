import React, {useState, useEffect, useMemo} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getSortedRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import {Info, Eye, ArrowUpDown, ListFilter, Search, RotateCcw} from 'lucide-react';

import AgreementService from '@services/institute/AgreementService';
import {getCurrentUserService} from '@services/user/AuthService';
import MetricsGrid from "@pages/institute/billing/billing/metrics-grid.jsx";
import AgreementDashboardSkeleton from "@pages/institute/agreement/Components/AgreementDashboardSkeleton.jsx";

const AgreementDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const agreementIdParam = searchParams.get("agreement_id");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [filteredAgreements, setFilteredAgreements] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Check if user is headhunter/agency (show "You" column) or clinic/pharmacy (show only "Applicant" column)
    const instituteCategoryId = sessionStorage.getItem('institute_category_id');
    const instituteCategoryName = sessionStorage.getItem('institute_category_name');

    // Categories 3 & 4 are Recruitment Agency and Head Hunter
    const isHeadhunterOrAgency = instituteCategoryId === '3' || instituteCategoryId === '4';
    const showYouColumn = isHeadhunterOrAgency;

    console.log('Institute Category:', {id: instituteCategoryId, name: instituteCategoryName, showYouColumn});

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        signed: 0,
        expired: 0
    });

    useEffect(() => {
        loadAgreements();
    }, []);

    useEffect(() => {
        filterAgreements();
    }, [statusFilter, searchTerm, agreements, agreementIdParam]);

    const loadAgreements = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user
            const user = await getCurrentUserService();
            setCurrentUser(user);

            // Get all agreements
            const response = await AgreementService.getMyAgreements();
            const agreementsList = response.agreements || [];
            setAgreements(agreementsList);

            // Calculate statistics
            calculateStats(agreementsList, user.id);

        } catch (err) {
            console.error('Error loading agreements:', err);
            setError('Failed to load agreements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (agreementsList, userId) => {
        const total = agreementsList.length;
        // Include both signature-required and fees-required as "pending action"
        const pending = agreementsList.filter(a =>
            AgreementService.isPendingMySignature(a, userId) ||
            AgreementService.requiresFeesInput(a, userId)
        ).length;
        const signed = agreementsList.filter(a =>
            a.status === 'fully_signed'
        ).length;
        const expired = agreementsList.filter(a =>
            a.status === 'expired'
        ).length;

        setStats({total, pending, signed, expired});
    };

    const filterAgreements = () => {
        let filtered = [...agreements];

        // Filter by agreement_id from URL (notification navigation)
        if (agreementIdParam) {
            const agreementId = parseInt(agreementIdParam, 10);
            filtered = filtered.filter(a => a.id === agreementId);
            setFilteredAgreements(filtered);
            return; // Skip other filters when navigating from notification
        }

        // Filter by status
        if (statusFilter !== 'all') {
            if (statusFilter === 'pending_my_signature') {
                // Include both signature-required and fees-required
                filtered = filtered.filter(a =>
                    AgreementService.isPendingMySignature(a, currentUser?.id) ||
                    AgreementService.requiresFeesInput(a, currentUser?.id)
                );
            } else if (statusFilter === 'pending_other_signature') {
                filtered = filtered.filter(a => {
                    // Use can_sign from API - if can_sign is false and not fully signed, it's pending other party
                    if (a.can_sign !== undefined) {
                        return !a.can_sign && a.status !== 'fully_signed' && a.status !== 'expired' && a.status !== 'rejected';
                    }
                    // Fallback
                    const myRole = AgreementService.getMyRole(a, currentUser?.id);
                    return (a.status === 'pending_client' && myRole !== 'client') ||
                        (a.status === 'pending_agency' && myRole !== 'agency') ||
                        (a.status === 'pending_publisher_signature' && myRole !== 'client') ||
                        (a.status === 'pending_applicant_signature' && myRole !== 'agency') ||
                        (a.status === 'pending_applicant_fees');
                });
            } else {
                filtered = filtered.filter(a => a.status === statusFilter);
            }
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.agreement_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.agreement_data?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.agreement_data?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.agreement_data?.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAgreements(filtered);
    };


    const filteredData = useMemo(() => {
        let filtered = [...agreements];
        if (agreementIdParam) return filtered.filter(a => a.id === parseInt(agreementIdParam, 10));

        if (statusFilter !== 'all') {
            if (statusFilter === 'pending_my_signature') {
                filtered = filtered.filter(a => AgreementService.isPendingMySignature(a, currentUser?.id) || AgreementService.requiresFeesInput(a, currentUser?.id));
            } else {
                filtered = filtered.filter(a => a.status === statusFilter);
            }
        }
        if (searchTerm) {
            filtered = filtered.filter(a => a.agreement_number.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return filtered;
    }, [agreements, statusFilter, searchTerm, agreementIdParam, currentUser]);

    const columns = useMemo(() => [
        {
            header: 'Agreement #',
            accessorKey: 'agreement_number',
            cell: info => <span className="font-medium text-slate-900">{info.getValue()}</span>

        },
        {
            header: 'Contract',
            accessorKey: 'contract_id',
            cell: info => {
                const agreement = info.row.original;
                return (
                    <div className="flex flex-col">
                        <button
                            onClick={() => onContractClick(agreement)}
                            className="text-[#2D8FE3] font-bold hover:underline text-sm text-left"
                        >
                            #{agreement.contract_id}
                        </button>
                        <span className="text-[11px] text-slate-400 font-medium leading-none">
                            {agreement.contract_type?.industry || agreement.contract_type?.name || 'N/A'}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'agreement_data.job.title',
            header: 'Position',
            cell: info => <span className="text-slate-700 font-medium">{info.getValue() || 'N/A'}</span>
        },
        ...(showYouColumn ? [
            {
                header: 'You',
                cell: ({row}) => {
                    const myRole = AgreementService.getMyRole(row.original, currentUser?.id);
                    const isApplicant = myRole === 'agency' || myRole === 'applicant';
                    return (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isApplicant ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {isApplicant ? 'Applicant' : 'Publisher'}
                        </span>
                    );
                }
            },
            {
                header: 'Other Party',
                cell: ({row}) => {
                    const a = row.original;
                    const myRole = AgreementService.getMyRole(a, currentUser?.id);
                    const other = myRole === 'client' ? a.agreement_data?.agency : a.agreement_data?.client;
                    console.log(other)
                    return (
                        <div className="flex flex-col">
                            <span className="text-gray-800">{other?.name || 'N/A'}</span>
                            <span
                                className="text-[11px] text-gray-400">({myRole === 'client' ? 'Applicant' : 'Publisher'})</span>
                        </div>
                    );
                }
            }
        ] : []),
        {
            header: 'Status',
            cell: ({row}) => {
                const a = row.original;
                const statusText = AgreementService.getStatusText(a.status, a, currentUser?.id);
                return <span className="text-sm text-gray-600 leading-tight block max-w-[180px]">{statusText}</span>;
            }
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: info => (
                <span className="text-slate-600 whitespace-nowrap text-sm">
                    {AgreementService.formatDate(info.getValue())}
                </span>
            )
        },
        {
            header: 'Action',
            cell: ({row}) => {
                const a = row.original;
                const myRole = AgreementService.getMyRole(a, currentUser?.id);
                const needsFees = AgreementService.requiresFeesInput(a, currentUser?.id);

                return (
                    <div className="flex items-center gap-2">
                        {/* Conditional Action Button based on Image logic */}
                        {needsFees ? (
                            <button
                                onClick={() => navigate(`/institute/agreements/${a.id}/sign`)}
                                className="bg-[#f0ad4e] hover:bg-orange-600 text-white px-2 py-1.5 rounded text-[10px] font-medium transition-colors"
                            >
                                Fee & Sign
                            </button>
                        ) : a.status === 'fully_signed' ? (
                            <button onClick={() => AgreementService.downloadAgreementPDF(a.id, a.agreement_number)}
                                    className="bg-[#28a745] hover:bg-green-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors">
                                Download PDF
                            </button>
                        ) : (
                            <button onClick={() => navigate(`/institute/agreements/${a.id}/sign`)}
                                    className="bg-[#5cb85c] hover:bg-green-600 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors">
                                {myRole === 'client' ? 'Pick & Send' : 'Sign'}
                            </button>
                        )}

                        {/* Preview Eye Button */}
                        <button
                            onClick={() => AgreementService.previewAgreement(a.id)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        >
                            <Eye size={18}/>
                        </button>
                    </div>
                );
            }
        }
    ], [currentUser, showYouColumn, navigate]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {sorting},
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (loading) return <AgreementDashboardSkeleton/>

    const statsData = [
        {label: "Total Agreements", value: stats.total},
        {label: "Pending Your Signature", value: stats.pending},
        {label: "Fully Signed", value: stats.signed},
        {label: "Expired", value: stats.expired},
    ];

    const handleResetFilters = () => {
        setStatusFilter('all');
        setSearchTerm('');
    };

    return (
        <div className="space-y-5">
            <MetricsGrid stats={statsData}/>

            <div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 font-medium text-sm shadow-sm
                    ${showFilters ? 'bg-blue-600 border-blue-600 text-white shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <ListFilter size={18} strokeWidth={2}/>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>


                {showFilters && (
                    <div
                        className="bg-white mt-3 rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div
                            className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                            {/*<div className="flex items-center gap-2">*/}
                            {/*    <FilterIcon size={16} className="text-slate-500"/>*/}
                            {/*    <h3 className="text-sm font-bold text-slate-700">Filter Agreements</h3>*/}
                            {/*</div>*/}

                            {/* রিসেট বাটনটি এখানে যোগ করা হয়েছে */}
                            {(statusFilter !== 'all' || searchTerm !== '') && (
                                <button
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                                >
                                    <RotateCcw size={14}/>
                                    Reset Filters
                                </button>
                            )}
                        </div>

                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Status Filter */}
                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agreement
                                    Status</label>
                                <select
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending_my_signature">Pending My Signature</option>
                                    <option value="pending_other_signature">Pending Other Party Signature</option>
                                    <option value="fully_signed">Fully Signed</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>

                            {/* Search Input */}
                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search
                                    Agreement</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                                        placeholder="Agreement #, Position, Company..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Table Container */}
            <div className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {/* Image Style Header: Gray background */}
                        <thead className="bg-[#f8f9fa] border-b border-gray-200">
                        {table.getHeaderGroups().map(headerGroup => {
                            return (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-1">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {
                                                    header.id !== 'agreement_number' && header.id !== 'actions' ?
                                                        <ArrowUpDown size={14}
                                                                     className="text-slate-400 opacity-70"/>
                                                        : null
                                                }
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            )
                        })}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-2.5 py-4 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-10 text-gray-400">No agreements
                                    found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination matching the image footer */}
                <div
                    className="px-4 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <span>Showing</span>
                        <select
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                        >
                            {[10, 25, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>{pageSize}</option>
                            ))}
                        </select>
                        <span>of {filteredData.length} Entries</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center">
                            {[...Array(table.getPageCount())].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => table.setPageIndex(i)}
                                    className={`px-3 py-1 rounded mx-0.5 ${table.getState().pagination.pageIndex === i ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Commission Structure Info Box (Bottom) */}
            <div className=" bg-[#e7f3ff] border border-[#b8daff] rounded-lg p-4 flex items-start gap-3">
                <div className="mt-0.5 text-blue-500">
                    <Info size={20}/>
                </div>
                <div className="text-[#31708f] leading-relaxed">
                    <span className="font-bold">Commission Structure</span> QuickLocum charges a simple <span
                    className="font-bold">10% commission</span> on direct hire contract values, plus a <span
                    className="font-bold">$20 service fee</span> per booked contract. Agencies and headhunters also have
                    a <span className="font-bold">$300/month subscription</span> that activates after the 2nd booked
                    contract of the month.
                </div>
            </div>

        </div>
    );
};

export default AgreementDashboard;