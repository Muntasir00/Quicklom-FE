import React, { useState } from "react";
import { useViewNotifications } from "@hooks/professional/notifications/useViewNotifications";
import "./NotificationsStyles.css";

const View = () => {
    const {
        SESSION_USER_ROLE,
        rows,
        handleMarkAllAsRead,
        navigate,
    } = useViewNotifications();

    const [filter, setFilter] = useState("all");

    const unreadCount = rows.filter(row => !row.is_read).length;

    const filteredNotifications = rows.filter(n => {
        if (filter === "unread") return !n.is_read;
        if (filter === "read") return n.is_read;
        return true;
    });

    const getNotificationRoute = (notification) => {
        const data = notification.data || {};
        const event = data.event || "";

        const routeConfig = {
            "application_accepted": { path: "contract-applications", param: "application_id", value: data.application_id || data.affected_entity_id },
            "application_rejected": { path: "contract-applications", param: "application_id", value: data.application_id || data.affected_entity_id },
            "contract_starting_soon": { path: "upcoming-contracts", param: "contract_id", value: data.contract_id || data.affected_entity_id },
            "contract_booked": { path: "upcoming-contracts", param: "contract_id", value: data.contract_id || data.affected_entity_id },
            "contract_completed": { path: "upcoming-contracts", param: "contract_id", value: data.contract_id || data.affected_entity_id },
            "agreement_generated": { path: "agreements", param: "agreement_id", value: data.agreement_id || data.affected_entity_id },
            "agreement_signed_by_institute": { path: "agreements", param: "agreement_id", value: data.agreement_id || data.affected_entity_id },
            "agreement_fully_signed": { path: "agreements", param: "agreement_id", value: data.agreement_id || data.affected_entity_id },
            "new_message": { path: "messaging", param: "user_id", value: data.sender_id || data.affected_entity_id }
        };

        const config = routeConfig[event];
        if (config && config.value) {
            return `/${SESSION_USER_ROLE}/${config.path}?${config.param}=${config.value}`;
        }

        const affectedEntity = data.affected_entity;
        const affectedEntityId = data.affected_entity_id;
        if (affectedEntity && affectedEntityId) {
            const entityMapping = {
                "contracts": { path: "upcoming-contracts", param: "contract_id" },
                "contract_applications": { path: "contract-applications", param: "application_id" },
                "applications": { path: "contract-applications", param: "application_id" },
                "agreements": { path: "agreements", param: "agreement_id" },
                "messages": { path: "messaging", param: "user_id" }
            };
            const mapping = entityMapping[affectedEntity];
            if (mapping) {
                return `/${SESSION_USER_ROLE}/${mapping.path}?${mapping.param}=${affectedEntityId}`;
            }
        }
        return null;
    };

    const getNotificationIcon = (notification) => {
        const data = notification.data || {};
        const event = data.event || "";
        const affectedEntity = data.affected_entity || "";

        if (event.includes("application") || affectedEntity.includes("application")) {
            return { icon: "fas fa-paper-plane", color: "#3b82f6", bg: "#eff6ff" };
        }
        if (event.includes("agreement") || affectedEntity.includes("agreement")) {
            return { icon: "fas fa-file-signature", color: "#8b5cf6", bg: "#f5f3ff" };
        }
        if (event.includes("contract") || affectedEntity.includes("contract")) {
            return { icon: "fas fa-file-contract", color: "#10b981", bg: "#ecfdf5" };
        }
        if (event.includes("message") || affectedEntity.includes("message")) {
            return { icon: "fas fa-envelope", color: "#f59e0b", bg: "#fffbeb" };
        }
        return { icon: "fas fa-bell", color: "#6366f1", bg: "#eef2ff" };
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const handleNotificationClick = (notification) => {
        const route = getNotificationRoute(notification);
        if (route) {
            navigate(route);
        }
    };

    return (
        <div className="content-wrapper notifications-page">
            {/* Header */}
            <div className="notifications-header">
                <div className="notifications-header-content">
                    <div className="notifications-header-left">
                        <div className="notifications-icon-wrapper">
                            <i className="fas fa-bell"></i>
                            {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
                        </div>
                        <div className="notifications-header-text">
                            <h1>Notifications</h1>
                            <p>
                                {unreadCount > 0
                                    ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                                    : "All caught up! No new notifications"}
                            </p>
                        </div>
                    </div>
                    <button
                        className="mark-all-read-btn"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        <i className="fas fa-check-double"></i>
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="notifications-filters">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        <i className="fas fa-inbox"></i>
                        All
                        <span className="tab-count">{rows.length}</span>
                    </button>
                    <button
                        className={`filter-tab ${filter === "unread" ? "active" : ""}`}
                        onClick={() => setFilter("unread")}
                    >
                        <i className="fas fa-envelope"></i>
                        Unread
                        <span className="tab-count unread">{unreadCount}</span>
                    </button>
                    <button
                        className={`filter-tab ${filter === "read" ? "active" : ""}`}
                        onClick={() => setFilter("read")}
                    >
                        <i className="fas fa-envelope-open"></i>
                        Read
                        <span className="tab-count">{rows.length - unreadCount}</span>
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-container">
                {filteredNotifications.length === 0 ? (
                    <div className="notifications-empty">
                        <div className="empty-icon">
                            <i className="fas fa-bell-slash"></i>
                        </div>
                        <h3>No notifications</h3>
                        <p>{filter === "unread" ? "You've read all your notifications" : "You don't have any notifications yet"}</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {filteredNotifications.map((notification) => {
                            const iconData = getNotificationIcon(notification);
                            const route = getNotificationRoute(notification);
                            const isClickable = !!route;

                            return (
                                <div
                                    key={notification.id}
                                    className={`notification-card ${notification.is_read ? "read" : "unread"} ${isClickable ? "clickable" : ""}`}
                                    onClick={() => isClickable && handleNotificationClick(notification)}
                                >
                                    <div
                                        className="notification-icon"
                                        style={{ backgroundColor: iconData.bg, color: iconData.color }}
                                    >
                                        <i className={iconData.icon}></i>
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-header">
                                            <h4 className="notification-title">{notification.title}</h4>
                                            <span className="notification-time">{formatTime(notification.created_at)}</span>
                                        </div>
                                        <p className="notification-message">{notification.message}</p>
                                        {isClickable && (
                                            <div className="notification-action">
                                                <span className="view-details">
                                                    View Details <i className="fas fa-arrow-right"></i>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {!notification.is_read && <div className="unread-indicator"></div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default View;
