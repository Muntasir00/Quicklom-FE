import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getNotificationStatisticsService } from "@services/admin/StatisticsService";
import { getUserNotificationsService } from "@services/admin/NotificationService";
import { format } from "timeago.js";


export const useHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const menu = location.pathname;
    const [notificationStatistics, setNotificationStatistics] = useState(null);
    const [notifications, setNotifications] = useState([]);
    
    const SESSION = {
        USER_ROLE: sessionStorage.getItem("role"),
        USER_ID: sessionStorage.getItem("user_id"),
        INSTITUTE_CATEGORY: (sessionStorage.getItem("institute_category_name") || '').toLowerCase(),
    };

    const initializeStateHelper = async () => {
        try {
            const notificationStatisticsData = await getNotificationStatisticsService();
            const notificationsData = await getUserNotificationsService(SESSION.USER_ID);

            setNotificationStatistics(notificationStatisticsData ?? null);
            setNotifications(notificationsData ? [...notificationsData].reverse() : []);

        } catch (error) { 
            console.error("Error in initializeStateHelper:", error);
        }
    };

    useEffect(() => { initializeStateHelper() }, []);

    return {
        navigate,
        menu,
        SESSION,
        notificationStatistics,
        notifications,
        format,
    };
};
