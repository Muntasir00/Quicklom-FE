import { useLocation, useNavigate } from "react-router-dom";
import { format } from "timeago.js";
import { useNotifications } from "@context/NotificationContext";


export const useHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const menu = location.pathname;

    const {
        notifications,
        statistics: notificationStatistics,
        markAsRead,
        fetchNotifications
    } = useNotifications();

    const SESSION = {
        USER_ROLE: sessionStorage.getItem("role"),
        USER_ID: sessionStorage.getItem("user_id"),
        INSTITUTE_CATEGORY: (sessionStorage.getItem("institute_category_name") || '').toLowerCase(),
    };

    const handleNotificationClick = async (notificationId) => {
        await markAsRead(notificationId);
    };

    return {
        navigate,
        menu,
        SESSION,
        notificationStatistics,
        notifications,
        format,
        handleNotificationClick,
        initializeStateHelper: fetchNotifications,
    };
};
