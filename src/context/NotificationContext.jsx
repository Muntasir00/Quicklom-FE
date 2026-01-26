import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { SESSION_KEYS, SessionUtil } from "@utils/SessionUtils";

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

// Helper function to get services based on role
const getServicesForRole = (role) => {
    if (role === "professional") {
        return import("@services/professional/NotificationService").then(notifModule =>
            import("@services/professional/StatisticsService").then(statsModule => ({
                getUserNotificationsService: notifModule.getUserNotificationsService,
                markNotificationAsReadService: notifModule.markNotificationAsReadService,
                markNotificationAsUnreadService: notifModule.markNotificationAsUnreadService,
                markAllNotificationsAsReadService: notifModule.markAllNotificationsAsReadService,
                getNotificationStatisticsService: statsModule.getNotificationStatisticsService,
            }))
        );
    } else {
        // Default to institute
        return import("@services/institute/NotificationService").then(notifModule =>
            import("@services/institute/StatisticsService").then(statsModule => ({
                getUserNotificationsService: notifModule.getUserNotificationsService,
                markNotificationAsReadService: notifModule.markNotificationAsReadService,
                markNotificationAsUnreadService: notifModule.markNotificationAsUnreadService,
                markAllNotificationsAsReadService: notifModule.markAllNotificationsAsReadService,
                getNotificationStatisticsService: statsModule.getNotificationStatisticsService,
            }))
        );
    }
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [statistics, setStatistics] = useState({
        total_notifications: 0,
        read_count: 0,
        unread_count: 0
    });
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState(null);
    const userRole = SessionUtil.get(SESSION_KEYS.USER_ROLE) || "institute";

    // Load services when component mounts or role changes
    useEffect(() => {
        getServicesForRole(userRole).then(setServices);
    }, [userRole]);

    // Fetch notifications and statistics
    const fetchNotifications = useCallback(async () => {
        if (!services) return;

        try {
            setLoading(true);
            const [notificationsData, statisticsData] = await Promise.all([
                services.getUserNotificationsService(),
                services.getNotificationStatisticsService()
            ]);

            setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
            setStatistics(statisticsData || {
                total_notifications: 0,
                read_count: 0,
                unread_count: 0
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [services]);

    // Mark a single notification as read
    const markAsRead = useCallback(async (notificationId) => {
        if (!services) return false;
        const success = await services.markNotificationAsReadService(notificationId);
        if (success) {
            await fetchNotifications();
        }
        return success;
    }, [services, fetchNotifications]);

    // Mark a single notification as unread
    const markAsUnread = useCallback(async (notificationId) => {
        if (!services) return false;
        const success = await services.markNotificationAsUnreadService(notificationId);
        if (success) {
            await fetchNotifications();
        }
        return success;
    }, [services, fetchNotifications]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!services) return false;
        const success = await services.markAllNotificationsAsReadService();
        if (success) {
            await fetchNotifications();
        }
        return success;
    }, [services, fetchNotifications]);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Optional: Poll for updates every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const value = {
        notifications,
        statistics,
        loading,
        fetchNotifications,
        markAsRead,
        markAsUnread,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
