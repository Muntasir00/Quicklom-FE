import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chip } from "@mui/material";
import { upperCaseWords } from "@utils/StringUtils";
import { SESSION_KEYS, SessionUtil } from "@utils/SessionUtils";
import { GridActionsCellItem } from "@mui/x-data-grid";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DoneIcon from "@mui/icons-material/Done";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import { useNotifications } from "@context/NotificationContext";

/**
 * Get the navigation path and query params based on notification type
 * @param {Object} notification - The notification object
 * @param {string} userRole - Current user role (institute/professional)
 * @returns {string} - The navigation path with query params
 */
export const getNotificationRoute = (notification, userRole) => {
    const data = notification.data || {};
    const event = data.event || "";

    // Route mapping based on event type for professional
    const routeConfig = {
        // Application-related notifications
        "application_accepted": {
            path: "contract-applications",
            param: "application_id",
            value: data.application_id || data.affected_entity_id
        },
        "application_rejected": {
            path: "contract-applications",
            param: "application_id",
            value: data.application_id || data.affected_entity_id
        },

        // Contract-related notifications
        "contract_starting_soon": {
            path: "upcoming-contracts",
            param: "contract_id",
            value: data.contract_id || data.affected_entity_id
        },
        "contract_booked": {
            path: "upcoming-contracts",
            param: "contract_id",
            value: data.contract_id || data.affected_entity_id
        },
        "contract_completed": {
            path: "upcoming-contracts",
            param: "contract_id",
            value: data.contract_id || data.affected_entity_id
        },

        // Agreement-related notifications
        "agreement_generated": {
            path: "agreements",
            param: "agreement_id",
            value: data.agreement_id || data.affected_entity_id
        },
        "agreement_signed_by_institute": {
            path: "agreements",
            param: "agreement_id",
            value: data.agreement_id || data.affected_entity_id
        },
        "agreement_fully_signed": {
            path: "agreements",
            param: "agreement_id",
            value: data.agreement_id || data.affected_entity_id
        },

        // Message-related notifications
        "new_message": {
            path: "messaging",
            param: "user_id",
            value: data.sender_id || data.affected_entity_id
        }
    };

    // Get route config for this event, or use affected_entity fallback
    const config = routeConfig[event];

    if (config && config.value) {
        return `/${userRole}/${config.path}?${config.param}=${config.value}`;
    }

    // Fallback to affected_entity logic
    const affectedEntity = data.affected_entity;
    const affectedEntityId = data.affected_entity_id;

    if (affectedEntity && affectedEntityId) {
        // Map affected_entity to correct path and param
        const entityMapping = {
            "contracts": { path: "upcoming-contracts", param: "contract_id" },
            "contract_applications": { path: "contract-applications", param: "application_id" },
            "applications": { path: "contract-applications", param: "application_id" },
            "agreements": { path: "agreements", param: "agreement_id" },
            "messages": { path: "messaging", param: "user_id" }
        };

        const mapping = entityMapping[affectedEntity];
        if (mapping) {
            return `/${userRole}/${mapping.path}?${mapping.param}=${affectedEntityId}`;
        }

        // Generic fallback
        return `/${userRole}/${affectedEntity}?id=${affectedEntityId}`;
    }

    // Default to notifications page
    return `/${userRole}/notifications`;
};

export const useViewNotifications = () => {
    const menu = "notifications";
    const action = "View";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);

    const {
        notifications,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        fetchNotifications
    } = useNotifications();

    const handleMarkAsRead = async (notificationId) => {
        await markAsRead(notificationId);
    };

    const handleMarkAsUnread = async (notificationId) => {
        await markAsUnread(notificationId);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const handleOpenNotification = async (notification) => {
        // Auto-mark as read when opening
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Get the smart navigation path
        const path = getNotificationRoute(notification, SESSION_USER_ROLE);
        navigate(path);
    };

    useEffect(() => {
        document.title = `${upperCaseWords(menu) ?? "Quicklocum"} | Quicklocum`;
    }, []);

    const columns = [
        { field: "id", headerName: "#", width: 70 },
        {
            field: "title",
            headerName: "Title",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => (
                <span
                    onClick={() => handleOpenNotification(params.row)}
                    style={{
                        cursor: 'pointer',
                        fontWeight: params.row.is_read ? 'normal' : '600',
                        color: params.row.is_read ? '#6b7280' : '#111827'
                    }}
                >
                    {params.value}
                </span>
            )
        },
        {
            field: "message",
            headerName: "Message",
            minWidth: 350,
            flex: 2,
            renderCell: (params) => (
                <span
                    onClick={() => handleOpenNotification(params.row)}
                    style={{
                        cursor: 'pointer',
                        fontWeight: params.row.is_read ? 'normal' : '500',
                        color: params.row.is_read ? '#6b7280' : '#374151'
                    }}
                >
                    {params.value}
                </span>
            )
        },
        {
            field: "is_read",
            headerName: "Status",
            minWidth: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Read" : "Unread"}
                    color={params.value ? "success" : "warning"}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem'
                    }}
                />
            ),
        },
        {
            field: "created_at",
            headerName: "Date",
            minWidth: 180,
            flex: 1,
            renderCell: (params) => {
                if (!params.value) return "-";
                const date = new Date(params.value);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);

                let timeAgo;
                if (diffMins < 1) timeAgo = 'Just now';
                else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
                else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
                else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
                else timeAgo = date.toLocaleDateString();

                return (
                    <span
                        style={{
                            fontWeight: params.row.is_read ? 'normal' : '500',
                            color: params.row.is_read ? '#9ca3af' : '#6b7280'
                        }}
                    >
                        {timeAgo}
                    </span>
                );
            },
        },
    ];

    return {
        menu,
        navigate,
        SESSION_USER_ROLE,
        rows: notifications,
        action,
        columns,
        slug,
        handleMarkAllAsRead,
        initializeStateHelper: fetchNotifications,
    };
};
