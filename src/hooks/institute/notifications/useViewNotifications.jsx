import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { upperCaseWords } from "@utils/StringUtils";
import { SESSION_KEYS, SessionUtil } from "@utils/SessionUtils";
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

    // Route mapping based on event type
    const routeConfig = {
        // Contract-related notifications
        "new_application_received": {
            path: "contract-applicants",
            param: "application_id",
            value: data.application_id || data.affected_entity_id
        },
        "contract_starting_soon": {
            path: "contracts",
            param: "contract_id",
            value: data.contract_id || data.affected_entity_id
        },
        "contract_expiring_soon": {
            path: "contracts",
            param: "contract_id",
            value: data.contract_id || data.affected_entity_id
        },
        "contract_booked": {
            path: "contracts",
            param: "contract_id",
            value: data.contract_id || data.affected_entity_id
        },
        "contract_completed": {
            path: "contracts",
            param: "contract_id",
            value: data.contract_id || data.affected_entity_id
        },

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

        // Agreement-related notifications
        "agreement_generated": {
            path: "agreements",
            param: "agreement_id",
            value: data.agreement_id || data.affected_entity_id
        },
        "agreement_signed_by_applicant": {
            path: "agreements",
            param: "agreement_id",
            value: data.agreement_id || data.affected_entity_id
        },
        "agreement_fully_signed": {
            path: "agreements",
            param: "agreement_id",
            value: data.agreement_id || data.affected_entity_id
        },

        // Invoice-related notifications
        "invoice_generated": {
            path: "billing/invoices",
            param: "invoice_id",
            value: data.invoice_id || data.affected_entity_id
        },
        "payment_received": {
            path: "billing/invoices",
            param: "invoice_id",
            value: data.invoice_id || data.affected_entity_id
        },
        "payment_failed": {
            path: "billing/invoices",
            param: "invoice_id",
            value: data.invoice_id || data.affected_entity_id
        },
        "invoice_overdue": {
            path: "billing/invoices",
            param: "invoice_id",
            value: data.invoice_id || data.affected_entity_id
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
            "contracts": { path: "contracts", param: "contract_id" },
            "contract_applications": { path: "contract-applicants", param: "application_id" },
            "applications": { path: "contract-applications", param: "application_id" },
            "agreements": { path: "agreements", param: "agreement_id" },
            "invoices": { path: "billing/invoices", param: "invoice_id" },
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

    return {
        rows: notifications,
        handleMarkAllAsRead,
        handleMarkAsRead,
        handleMarkAsUnread,
        handleOpenNotification,
        initializeStateHelper: fetchNotifications,
    };
};
