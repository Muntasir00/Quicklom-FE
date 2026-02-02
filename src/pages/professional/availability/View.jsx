import {useState, useEffect} from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    startOfWeek,
    endOfWeek,
    startOfDay,
    parseISO,
    isWithinInterval,
    getDay,
    getDate
} from "date-fns";
import {
    getAvailabilityCalendarService,
    deleteAvailabilityService
} from "@services/professional/AvailabilityService";
import AddAvailabilityModal from "./AddAvailabilityModal";
import EditAvailabilityModal from "./EditAvailabilityModal";
import "./AvailabilityStyles.css";
import {MetricsCard} from "@pages/professional/availability/metrics-card.jsx";
import {Button} from "@components/ui/button.jsx";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    RotateCcw,
    Briefcase,
    X,
    CircleCheckBig,
    PencilLine
} from "lucide-react";
import {cn} from "../../../lib/utils.js";
import {Skeleton} from "@components/ui/skeleton.jsx";

function View() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availabilities, setAvailabilities] = useState([]);
    const [bookedContracts, setBookedContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [viewMode, setViewMode] = useState('month');
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate]);

    const fetchCalendarData = async () => {
        setLoading(true);
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        const data = await getAvailabilityCalendarService(
            monthStart.toISOString(),
            monthEnd.toISOString()
        );

        setAvailabilities(data.availabilities || []);
        setBookedContracts(data.booked_contracts || []);
        setLoading(false);
    };

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleEdit = (availability, e) => {
        if (e) e.stopPropagation();
        setSelectedAvailability(availability);
        setShowEditModal(true);
    };

    const handleDelete = async (availabilityId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this availability slot?")) return;
        const success = await deleteAvailabilityService(availabilityId);
        if (success) {
            fetchCalendarData();
        }
    };

    const handleDayClick = (day) => {
        const isCurrentMonth = isSameMonth(day, currentDate);
        if (!isCurrentMonth) return;
        setSelectedDate(day);
        setShowAddModal(true);
    };

    const getEventsForDay = (day) => {
        const dayStart = startOfDay(day);

        const availabilitiesForDay = availabilities.filter(avail => {
            try {
                const start = startOfDay(parseISO(avail.start_date));
                const end = startOfDay(parseISO(avail.end_date));

                const isInRange = isWithinInterval(dayStart, {start, end}) ||
                    dayStart.getTime() === start.getTime() ||
                    dayStart.getTime() === end.getTime();

                if (!isInRange) return false;

                if (!avail.is_recurring) return true;

                const pattern = avail.recurrence_pattern?.toLowerCase();
                if (pattern === 'daily') return true;
                if (pattern === 'weekly') return getDay(dayStart) === getDay(start);
                if (pattern === 'monthly') return getDate(dayStart) === getDate(start);

                return true;
            } catch (e) {
                return false;
            }
        });

        const contractsForDay = bookedContracts.filter(contract => {
            try {
                const start = startOfDay(parseISO(contract.start_date));
                const end = startOfDay(parseISO(contract.end_date));
                return isWithinInterval(dayStart, {start, end}) ||
                    dayStart.getTime() === start.getTime() ||
                    dayStart.getTime() === end.getTime();
            } catch (e) {
                return false;
            }
        });

        return {availabilities: availabilitiesForDay, contracts: contractsForDay};
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({start: calendarStart, end: calendarEnd});

    // Statistics
    const totalAvailabilities = availabilities.length;
    const totalBooked = bookedContracts.length;
    const upcomingAvailabilities = availabilities.filter(a => new Date(a.start_date) > new Date()).length;

    const stats = [
        {label: "Total Slots", value: totalAvailabilities},
        {label: "Upcoming", value: upcomingAvailabilities},
        {label: "Booked", value: totalBooked},
    ];

    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    if (loading) {
        return <CalendarSkeleton />;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {stats.map((stat, idx) => (
                    <MetricsCard key={idx} label={stat.label} value={stat.value}/>
                ))}
            </div>

            {/* ২. Navigation & Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 border-[#E2E8F0] rounded-lg"
                            onClick={handlePreviousMonth}>
                        <ChevronLeft className="h-4 w-4 text-[#64748B]"/>
                    </Button>

                    <div
                        className="px-6 py-1.5 border border-[#E2E8F0] rounded-lg bg-white text-sm font-semibold text-[#1E293B] min-w-[150px] text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </div>

                    <Button variant="outline" size="icon" className="h-9 w-9 border-[#E2E8F0] rounded-lg"
                            onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4 text-[#64748B]"/>
                    </Button>
                </div>

                <Button
                    className="bg-[#2D8FE3] hover:bg-[#2476BA] text-white py-1 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"
                    onClick={() => setShowAddModal(true)}>
                    <Plus className="h-5 w-5"/>
                    Add Availability
                </Button>
            </div>

            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm bg-white transition-all">

                {/* ১. Calendar Header: Weekdays */}
                <div className="grid grid-cols-7 bg-[#F1F5F9] border-b border-[#E2E8F0]">
                    {weekDays.map((day) => (
                        <div key={day}
                             className="py-3 text-center text-[11px] font-bold text-[#64748B] tracking-widest uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* ২. Calendar Body Grid */}
                <div className="grid grid-cols-7 bg-[#E2E8F0] gap-[1px]"> {/* gap[1px] দিয়ে শার্প বর্ডার তৈরি */}
                    {calendarDays.map((day) => {
                        const events = getEventsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isTodayDate = isToday(day);
                        const hasEvents = events.availabilities.length > 0 || events.contracts.length > 0;

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => isCurrentMonth && handleDayClick(day)}
                                className={cn(
                                    "min-h-[130px] bg-white p-2 relative group transition-all duration-200",
                                    !isCurrentMonth ? "bg-slate-50/50" : "cursor-pointer hover:bg-slate-50/30"
                                )}
                            >
                                {/* দিন সংখ্যা এবং Today মার্কার */}
                                <div className="flex justify-between items-start mb-2 ">
                                    <span className={cn(
                                        "text-sm font-semibold flex items-center justify-center rounded-full transition-all",
                                        isTodayDate
                                            ? "w-7 h-7 bg-[#2D8FE3] text-white shadow-sm"
                                            : isCurrentMonth ? "text-[#64748B]" : "text-[#CBD5E1]"
                                    )}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* Empty Day Plus Icon (Hover করলে দেখাবে) */}
                                    {!hasEvents && isCurrentMonth && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-10 h-10 text-[#2D8FE3]"/>
                                        </div>
                                    )}
                                </div>

                                {/* ইভেন্ট লিস্ট (স্লটগুলো) */}
                                <div className="space-y-1.5 overflow-hidden">
                                    {/* ১. Booked (Contracts) - Blue Style */}
                                    {events.contracts.map(contract => (
                                        <div
                                            key={`contract-${contract.id}`}
                                            className="flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-md px-2 py-1"
                                        >
                                            <Briefcase className="w-3 h-3 text-[#2563EB]"/>
                                            <span
                                                className="text-[11px] font-bold text-[#2563EB] truncate">Booked</span>
                                        </div>
                                    ))}

                                    {/* ২. Availabilities - Green Style */}
                                    {events.availabilities.map(avail => (
                                        <div
                                            key={`avail-${avail.id}`}
                                            className="bg-[#E1F7F3] border border-[#B2E7DD] rounded-md px-2 py-1 group/item transition-all hover:border-[#19B28A]/40"
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                                                    <CircleCheckBig className="w-3 h-3 text-[#19B28A] flex-shrink-0"/>
                                                    <span className="text-[10px] font-bold text-[#19B28A] truncate">
                                                        {format(parseISO(avail.start_date), 'h:mma')}
                                                    </span>
                                                    {avail.is_recurring && (
                                                        <RotateCcw
                                                            className="w-2.5 h-2.5 text-[#19B28A] animate-reverse-spin"/>
                                                    )}
                                                </div>

                                                {/* এডিট এবং ডিলিট বাটন */}
                                                <div
                                                    className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(avail, e);
                                                        }}
                                                        className="p-0.5 rounded text-[#64748B] hover:text-[#1E293B]"
                                                    >
                                                        <PencilLine className="w-4 h-4"/>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(avail.id, e);
                                                        }}
                                                        className="p-0.5 rounded text-[#64748B] hover:text-red-500"
                                                    >
                                                        <X className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ৩. Legend Section */}
            {/*<div className="flex flex-wrap items-center justify-center gap-6 px-2 py-1">*/}
            {/*    <div className="flex items-center gap-2">*/}
            {/*        <div className="w-3 h-3 rounded-full bg-[#E1F7F3] border border-[#B2E7DD]"></div>*/}
            {/*        <span className="text-[12px] font-semibold text-[#64748B]">Available</span>*/}
            {/*    </div>*/}
            {/*    <div className="flex items-center gap-2">*/}
            {/*        <div className="w-3 h-3 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]"></div>*/}
            {/*        <span className="text-[12px] font-semibold text-[#64748B]">Booked</span>*/}
            {/*    </div>*/}
            {/*    <div className="flex items-center gap-2">*/}
            {/*        <div className="w-3 h-3 rounded-full bg-[#2D8FE3]"></div>*/}
            {/*        <span className="text-[12px] font-semibold text-[#64748B]">Today</span>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* Modals */}
            <AddAvailabilityModal
                show={showAddModal}
                onHide={() => {
                    setShowAddModal(false);
                    setSelectedDate(null);
                }}
                onSuccess={fetchCalendarData}
                preselectedDate={selectedDate}
            />

            <EditAvailabilityModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                availability={selectedAvailability}
                onSuccess={fetchCalendarData}
            />
        </div>
    );
}

export default View;


const CalendarSkeleton = () => (
    <div className="space-y-6">
        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col justify-center gap-2 shadow-sm">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                </div>
            ))}
        </div>

        {/* Navigation Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-[150px] rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="grid grid-cols-7 bg-[#F1F5F9] border-b border-[#E2E8F0]">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="py-3 flex justify-center">
                        <Skeleton className="h-3 w-10" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-[1px] bg-[#E2E8F0]">
                {[...Array(35)].map((_, i) => (
                    <div key={i} className="min-h-[130px] bg-white p-3 space-y-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);