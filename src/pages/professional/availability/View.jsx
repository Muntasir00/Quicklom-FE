import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, startOfDay, parseISO, isWithinInterval, getDay, getDate } from "date-fns";
import {
    getAvailabilityCalendarService,
    deleteAvailabilityService
} from "@services/professional/AvailabilityService";
import AddAvailabilityModal from "./AddAvailabilityModal";
import EditAvailabilityModal from "./EditAvailabilityModal";
import "./AvailabilityStyles.css";

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

                const isInRange = isWithinInterval(dayStart, { start, end }) ||
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
                return isWithinInterval(dayStart, { start, end }) ||
                       dayStart.getTime() === start.getTime() ||
                       dayStart.getTime() === end.getTime();
            } catch (e) {
                return false;
            }
        });

        return { availabilities: availabilitiesForDay, contracts: contractsForDay };
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Statistics
    const totalAvailabilities = availabilities.length;
    const totalBooked = bookedContracts.length;
    const upcomingAvailabilities = availabilities.filter(a => new Date(a.start_date) > new Date()).length;

    return (
        <div className="content-wrapper availability-page">
            {/* Header */}
            <div className="availability-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="header-icon">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="header-text">
                            <h1>My Availability</h1>
                            <p>Manage your schedule and availability slots</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className="add-availability-btn"
                            onClick={() => {
                                setSelectedDate(null);
                                setShowAddModal(true);
                            }}
                        >
                            <i className="fas fa-plus"></i>
                            Add Availability
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card blue">
                        <i className="fas fa-calendar-alt"></i>
                        <div className="stat-info">
                            <span className="stat-value">{totalAvailabilities}</span>
                            <span className="stat-label">Total Slots</span>
                        </div>
                    </div>
                    <div className="stat-card green">
                        <i className="fas fa-clock"></i>
                        <div className="stat-info">
                            <span className="stat-value">{upcomingAvailabilities}</span>
                            <span className="stat-label">Upcoming</span>
                        </div>
                    </div>
                    <div className="stat-card yellow">
                        <i className="fas fa-briefcase"></i>
                        <div className="stat-info">
                            <span className="stat-value">{totalBooked}</span>
                            <span className="stat-label">Booked</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Toolbar */}
            <div className="calendar-toolbar">
                <div className="toolbar-left">
                    <div className="month-nav">
                        <button className="nav-btn" onClick={handlePreviousMonth}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <h2 className="current-month">{format(currentDate, 'MMMM yyyy')}</h2>
                        <button className="nav-btn" onClick={handleNextMonth}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <button className="today-btn" onClick={handleToday}>
                        Today
                    </button>
                </div>
                <div className="toolbar-right">
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                            onClick={() => setViewMode('month')}
                        >
                            <i className="fas fa-calendar"></i>
                            Month
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <i className="fas fa-list"></i>
                            List
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="calendar-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your calendar...</p>
                    </div>
                ) : viewMode === 'month' ? (
                    <div className="calendar-container">
                        {/* Weekday Headers */}
                        <div className="weekday-headers">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="weekday-header">{day}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="calendar-grid">
                            {calendarDays.map((day) => {
                                const events = getEventsForDay(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isTodayDate = isToday(day);
                                const hasEvents = events.availabilities.length > 0 || events.contracts.length > 0;

                                return (
                                    <div
                                        key={day.toString()}
                                        className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
                                        onClick={() => isCurrentMonth && handleDayClick(day)}
                                    >
                                        <div className="day-header">
                                            <span className={`day-number ${isTodayDate ? 'today-number' : ''}`}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>

                                        <div className="day-events">
                                            {events.contracts.map(contract => (
                                                <div key={`contract-${contract.id}`} className="event booked">
                                                    <i className="fas fa-briefcase"></i>
                                                    <span>Booked</span>
                                                </div>
                                            ))}
                                            {events.availabilities.map(avail => (
                                                <div key={`avail-${avail.id}`} className="event available">
                                                    <div className="event-info">
                                                        <i className="fas fa-check-circle"></i>
                                                        <span className="event-time">
                                                            {format(parseISO(avail.start_date), 'h:mma')}
                                                        </span>
                                                        {avail.is_recurring && (
                                                            <i className="fas fa-sync-alt recurring" title={avail.recurrence_pattern}></i>
                                                        )}
                                                    </div>
                                                    <div className="event-actions">
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={(e) => handleEdit(avail, e)}
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-pen"></i>
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={(e) => handleDelete(avail.id, e)}
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {!hasEvents && isCurrentMonth && (
                                            <div className="empty-day">
                                                <i className="fas fa-plus"></i>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="calendar-legend">
                            <div className="legend-item">
                                <span className="legend-dot available"></span>
                                <span>Available</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot booked"></span>
                                <span>Booked</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot today"></span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="list-container">
                        {/* Available Slots */}
                        <div className="list-section">
                            <h3 className="section-title">
                                <i className="fas fa-check-circle"></i>
                                Available Slots
                                <span className="count">{availabilities.length}</span>
                            </h3>
                            {availabilities.length > 0 ? (
                                <div className="list-items">
                                    {availabilities.map(avail => (
                                        <div key={avail.id} className="list-item available">
                                            <div className="item-icon">
                                                <i className="fas fa-calendar-check"></i>
                                            </div>
                                            <div className="item-content">
                                                <div className="item-title">
                                                    {format(new Date(avail.start_date), 'EEEE, MMM dd, yyyy')}
                                                </div>
                                                <div className="item-meta">
                                                    <span>
                                                        <i className="fas fa-clock"></i>
                                                        {format(new Date(avail.start_date), 'h:mm a')} - {format(new Date(avail.end_date), 'h:mm a')}
                                                    </span>
                                                    {avail.is_recurring && (
                                                        <span className="recurring-badge">
                                                            <i className="fas fa-sync-alt"></i>
                                                            {avail.recurrence_pattern}
                                                        </span>
                                                    )}
                                                    {avail.notes && (
                                                        <span>
                                                            <i className="fas fa-sticky-note"></i>
                                                            {avail.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="item-actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(avail)}
                                                >
                                                    <i className="fas fa-pen"></i>
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(avail.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-list">
                                    <i className="fas fa-calendar-times"></i>
                                    <p>No availability slots added yet</p>
                                    <button
                                        className="add-btn"
                                        onClick={() => {
                                            setSelectedDate(null);
                                            setShowAddModal(true);
                                        }}
                                    >
                                        <i className="fas fa-plus"></i>
                                        Add Availability
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Booked Contracts */}
                        <div className="list-section">
                            <h3 className="section-title">
                                <i className="fas fa-briefcase"></i>
                                Booked Contracts
                                <span className="count">{bookedContracts.length}</span>
                            </h3>
                            {bookedContracts.length > 0 ? (
                                <div className="list-items">
                                    {bookedContracts.map(contract => (
                                        <div key={contract.id} className="list-item booked">
                                            <div className="item-icon booked">
                                                <i className="fas fa-briefcase"></i>
                                            </div>
                                            <div className="item-content">
                                                <div className="item-title">
                                                    {contract.title || `Contract #${contract.id}`}
                                                </div>
                                                <div className="item-meta">
                                                    <span>
                                                        <i className="fas fa-calendar"></i>
                                                        {format(new Date(contract.start_date), 'MMM dd')} - {format(new Date(contract.end_date), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="status-badge booked">Booked</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-list">
                                    <i className="fas fa-inbox"></i>
                                    <p>No booked contracts yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

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
