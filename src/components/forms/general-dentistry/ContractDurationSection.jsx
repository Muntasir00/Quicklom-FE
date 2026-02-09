import React from 'react';
import {Button} from "@components/ui/button";
import {Label} from "@components/ui/label";
import {Checkbox} from "@components/ui/checkbox";
import {Input} from "@components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    Briefcase,
    Calendar as CalendarIcon,
    Trash2,
    Clock,
    Info,
    AlertTriangle,
    Copy,
    X
} from "lucide-react";

const ContractDurationSection = ({
                                     contract,
                                     calendarMonth,
                                     setCalendarMonth,
                                     selectedDates,
                                     setSelectedDates,
                                     setValue,
                                     register,
                                     errors,
                                     watch,
                                     handleRemoveDate,
                                     handleClearAllDates,
                                     formatDateLocal,
                                     CANADA_HOLIDAYS,
                                     groupConsecutiveDates,
                                     formatDateDisplay,
                                     applyToAll,
                                     setApplyToAll,
                                     masterTimeSlot,
                                     setMasterTimeSlot,
                                     timeSlots,
                                     setTimeSlots
                                 }) => {

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <div className="w-full space-y-6 my-6">
            {/* Main Legend Container */}
            <div className="relative border border-slate-200 rounded-xl p-4 md:p-8 pt-10 bg-white shadow-sm">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[15px] text-slate-400 font-normal">
                    Contract Duration
                </span>

                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-8 px-2 md:px-10">
                    <button
                        type="button"
                        onClick={() => {
                            const current = new Date(calendarMonth);
                            current.setMonth(current.getMonth() - 1);
                            setCalendarMonth(current);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400"/>
                    </button>
                    <h3 className="text-[18px] font-medium text-slate-600">
                        {calendarMonth.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
                    </h3>
                    <button
                        type="button"
                        onClick={() => {
                            const current = new Date(calendarMonth);
                            current.setMonth(current.getMonth() + 1);
                            setCalendarMonth(current);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-400"/>
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 md:gap-4 mb-8">
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-center text-[13px] font-medium text-slate-300 py-2">
                            {day}
                        </div>
                    ))}

                    {(() => {
                        const year = calendarMonth.getFullYear();
                        const month = calendarMonth.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const lastDay = new Date(year, month + 1, 0).getDate();
                        const days = [];

                        for (let i = 0; i < firstDay; i++) {
                            days.push(<div key={`empty-${i}`} className="h-10 md:h-14"></div>);
                        }

                        for (let day = 1; day <= lastDay; day++) {
                            const date = new Date(year, month, day);
                            const dateStr = formatDateLocal(date);
                            const isSelected = selectedDates.includes(dateStr);
                            const isHoliday = CANADA_HOLIDAYS.includes(dateStr);
                            const isToday = dateStr === formatDateLocal(new Date());

                            days.push(
                                <div
                                    key={dateStr}
                                    onClick={() => {
                                        if (!isHoliday) {
                                            if (isSelected) {
                                                handleRemoveDate(dateStr);
                                            } else {
                                                const updatedDates = [...selectedDates, dateStr].sort();
                                                setSelectedDates(updatedDates);
                                                setValue("selected_dates", JSON.stringify(updatedDates));
                                            }
                                        }
                                    }}
                                    className={`
                                        h-10 md:h-14 flex items-center justify-center rounded-lg text-[15px] cursor-pointer transition-all border
                                        ${isSelected ? 'bg-[#e3f2fd] border-[#90caf9] text-slate-700' : 'border-transparent text-slate-600 hover:bg-slate-50'}
                                        ${isHoliday ? 'bg-[#ef4444] border-[#ef4444] text-white cursor-not-allowed hover:bg-[#ef4444]' : ''}
                                        ${isToday && !isSelected && !isHoliday ? 'border-blue-200' : ''}
                                    `}
                                >
                                    {day}
                                </div>
                            );
                        }
                        return days;
                    })()}
                </div>

                {/* Legend & Action Buttons */}
                <div
                    className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-50">
                    {/* Legend Items */}
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#e3f2fd] border border-[#90caf9]"></div>
                            <span className="text-sm text-slate-500 font-medium">Selected</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#ef4444]"></div>
                            <span className="text-sm text-slate-500 font-medium">Holiday (Blocked)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-slate-100 bg-white"></div>
                            <span className="text-sm text-slate-500 font-medium">Available</span>
                        </div>
                    </div>

                    {/* Quick Selection Buttons */}
                    <div className="flex flex-wrap justify-center gap-3 w-full lg:w-auto">
                        <Button
                            type="button" variant="outline" size="sm"
                            className="text-[#10b981] border-[#10b981] hover:bg-emerald-50 h-10 px-4 rounded-xl flex items-center gap-2"
                            onClick={() => {
                                // Select all weekdays in current month (excluding holidays)
                                const currentMonth = calendarMonth;
                                const year = currentMonth.getFullYear();
                                const month = currentMonth.getMonth();
                                const lastDay = new Date(year, month + 1, 0).getDate();
                                const weekdays = [];

                                for (let day = 1; day <= lastDay; day++) {
                                    const date = new Date(year, month, day);
                                    const dateStr = formatDateLocal(date);
                                    const dayOfWeek = date.getDay();
                                    const isHoliday = CANADA_HOLIDAYS.includes(dateStr);
                                    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) { // Not Sunday, Saturday, or holiday
                                        weekdays.push(dateStr);
                                    }
                                }

                                const updatedDates = [...new Set([...selectedDates, ...weekdays])].sort();
                                setSelectedDates(updatedDates);
                                setValue("selected_dates", JSON.stringify(updatedDates));
                            }}
                        >
                            <Briefcase className="w-4 h-4"/> Select All Weekdays
                        </Button>
                        <Button
                            type="button" variant="outline" size="sm"
                            className="text-[#10b981] border-[#10b981] hover:bg-emerald-50 h-10 px-4 rounded-xl flex items-center gap-2"
                            onClick={() => {
                                // Select entire month (excluding holidays)
                                const currentMonth = calendarMonth;
                                const year = currentMonth.getFullYear();
                                const month = currentMonth.getMonth();
                                const lastDay = new Date(year, month + 1, 0).getDate();
                                const allDays = [];

                                for (let day = 1; day <= lastDay; day++) {
                                    const date = new Date(year, month, day);
                                    const dateStr = formatDateLocal(date);
                                    const isHoliday = CANADA_HOLIDAYS.includes(dateStr);
                                    if (!isHoliday) {
                                        allDays.push(dateStr);
                                    }
                                }

                                const updatedDates = [...new Set([...selectedDates, ...allDays])].sort();
                                setSelectedDates(updatedDates);
                                setValue("selected_dates", JSON.stringify(updatedDates));
                            }}
                        >
                            <CalendarIcon className="w-4 h-4"/> Select Entire Month
                        </Button>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {/* Alert for empty selection */}
                    {selectedDates.length === 0 && (
                        <div
                            className="mt-8 p-4 md:p-5 bg-[#fffbeb] border border-[#fef3c7] rounded-xl flex items-center gap-4 animate-in fade-in duration-500">
                            <div
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="text-[#f59e0b] w-5 h-5"/>
                            </div>
                            <p className="text-[#92400e] text-[15px] !mb-0">
                                No dates selected yet. <span className="text-[#d97706] font-normal">Please add at least one date or date range above.</span>
                            </p>
                        </div>
                    )}

                    {/* ২. Validation Error: At least one working date must be selected */}
                    {errors?.selected_dates && (
                        <div
                            className="p-2 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 animate-shake">
                            <div
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-red-50">
                                <X className="text-red-500 w-5 h-5"/>
                            </div>
                            <p className="text-red-600 text-[15px] font-medium italic !mb-0">
                                {errors.selected_dates.message}
                            </p>
                        </div>
                    )}

                    {/* ৩. Validation Error: Start Date & End Date required */}
                    {(errors?.start_date || errors?.end_date) && (
                        <div className="flex flex-col gap-2 bg-red-50/50 p-3 rounded-lg border border-red-100/50">
                            {errors?.start_date && (
                                <p className="text-xs text-red-500 flex items-center gap-2 font-medium italic !mb-0">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.start_date.message}
                                </p>
                            )}
                            {errors?.end_date && (
                                <p className="text-xs text-red-500 flex items-center gap-2 font-medium italic !mb-0">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.end_date.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                {selectedDates.length > 0 && (
                    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center">
                            <Label className="text-[16px] font-medium text-slate-700 !flex items-center gap-2 !mb-0">
                                <CalendarIcon className="w-4 h-4 text-emerald-500"/>
                                Selected Dates ({selectedDates.length} days)
                            </Label>
                            <Button type="button" variant="ghost" size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                                    onClick={handleClearAllDates}>
                                <Trash2 className="w-4 h-4 mr-2"/> Clear All
                            </Button>
                        </div>
                        <div
                            className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                            {groupConsecutiveDates(selectedDates).map((group, idx) => (
                                <div key={idx}
                                     className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
                                    {group.length === 1 ? formatDateDisplay(group[0]) : `${formatDateDisplay(group[0])} → ${formatDateDisplay(group[group.length - 1])}`}
                                    <X className="w-3.5 h-3.5 ml-2 cursor-pointer hover:text-red-500"
                                       onClick={() => /* Remove logic */ {
                                       }}/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Time Slot Configuration Card */}
            {selectedDates.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mt-8">
                    <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-400"/>
                        <h4 className="font-medium">Configure Time Slots for Selected Dates</h4>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-2 space-x-3 rounded-lg">
                            <Checkbox
                                id="applyToAll"
                                checked={applyToAll}
                                onCheckedChange={(val) => setApplyToAll(!!val)}
                                className="h-5 w-5 rounded-lg border-slate-300"
                            />
                            <Label htmlFor="applyToAll" className="text-sm font-bold text-slate-700 !mb-0">Apply the
                                same time
                                slot to all selected dates</Label>
                        </div>

                        {applyToAll ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end animate-in fade-in">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-500">Start Time</Label>
                                    <Input
                                        type="time"
                                        className="h-11"
                                        defaultValue={masterTimeSlot.start_time}
                                        onChange={(e) => {
                                            const newMaster = {
                                                ...masterTimeSlot,
                                                start_time: e.target.value
                                            };
                                            setMasterTimeSlot(newMaster);
                                            const newSlots = {};
                                            selectedDates.forEach(date => {
                                                newSlots[date] = {...newMaster};
                                            });
                                            setTimeSlots(newSlots);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-500">End Time</Label>
                                    <Input
                                        type="time"
                                        className="h-11"
                                        value={masterTimeSlot.end_time}
                                        onChange={(e) => {
                                            const newMaster = {
                                                ...masterTimeSlot,
                                                end_time: e.target.value
                                            };
                                            setMasterTimeSlot(newMaster);
                                            const newSlots = {};
                                            selectedDates.forEach(date => {
                                                newSlots[date] = {...newMaster};
                                            });
                                            setTimeSlots(newSlots);
                                        }}
                                    />
                                </div>
                                <div
                                    className="p-4 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-center gap-2">
                                    <Info className="w-4 h-4 flex-shrink-0"/>
                                    This will apply {masterTimeSlot.start_time} - {masterTimeSlot.end_time} to
                                    all {selectedDates.length} dates.
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Start Time</th>
                                        <th className="px-6 py-4">End Time</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {selectedDates.map(date => {
                                        const slot = timeSlots[date] || {start_time: "09:00", end_time: "17:00"};
                                        return (
                                            <tr key={date} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium text-slate-700">{formatDateDisplay(date)}</td>
                                                <td className="px-6 py-4">
                                                    <Input
                                                        type="time"
                                                        className="h-9 w-32"
                                                        // defaultValue="09:00"
                                                        value={slot?.start_time}
                                                        onChange={(e) => {
                                                            setTimeSlots(prev => ({
                                                                ...prev,
                                                                [date]: {
                                                                    ...prev[date],
                                                                    start_time: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Input
                                                        type="time"
                                                        className="h-9 w-32"
                                                        value={slot.end_time}
                                                        onChange={(e) => {
                                                            setTimeSlots(prev => ({
                                                                ...prev,
                                                                [date]: {
                                                                    ...prev[date],
                                                                    end_time: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-400">
                                                    <Copy
                                                        className="w-4 h-4 mx-auto cursor-pointer hover:text-blue-500"/>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden Inputs for Form Submission */}
            <input type="hidden" {...register("selected_dates")} />
            <input type="hidden" {...register("start_date")} />
            <input type="hidden" {...register("end_date")} />
            <input type="hidden" {...register("time_slots")} />
        </div>
    );
};

export default ContractDurationSection;