import { useState } from "react";
import { useViewNotifications } from "@hooks/professional/notifications/useViewNotifications";
import {
    Bell,
    BellOff,
    CheckCheck,
    Inbox,
    Mail,
    MailOpen,
    Send,
    FileSignature,
    FileText,
    MessageSquare,
} from "lucide-react";

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
            return { icon: Send, color: "text-blue-600", bg: "bg-blue-50" };
        }
        if (event.includes("agreement") || affectedEntity.includes("agreement")) {
            return { icon: FileSignature, color: "text-purple-600", bg: "bg-purple-50" };
        }
        if (event.includes("contract") || affectedEntity.includes("contract")) {
            return { icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" };
        }
        if (event.includes("message") || affectedEntity.includes("message")) {
            return { icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" };
        }
        return { icon: Bell, color: "text-indigo-600", bg: "bg-indigo-50" };
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
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative p-3 bg-white rounded-lg border border-gray-100">
                            <Bell className="w-6 h-6 text-indigo-600" strokeWidth={2.2} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 !mb-0">Notifications</h1>
                            <p className="text-sm text-gray-500 !mb-0">
                                {unreadCount > 0
                                    ? `You have ${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                                    : "You're all caught up!"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <CheckCheck className="w-4 h-4 text-indigo-500" />
                        Mark all as read
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center p-1 bg-gray-200/50 rounded-lg w-fit mb-6">
                    {[
                        { id: 'all', label: 'All', icon: Inbox, count: rows.length },
                        { id: 'unread', label: 'Unread', icon: Mail, count: unreadCount },
                        { id: 'read', label: 'Read', icon: MailOpen, count: rows.length - unreadCount }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filter === tab.id
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <tab.icon className="w-4 h-4" strokeWidth={2.5} />
                            {tab.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                                filter === tab.id ? "bg-indigo-50 text-indigo-600" : "bg-gray-200 text-gray-600"
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                            {/*<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">*/}
                            {/*    <i className="fas fa-bell-slash text-2xl text-gray-300"></i>*/}
                            {/*</div>*/}
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                                <BellOff className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 !mb-0">No notifications</h3>
                            <p className="text-gray-500 text-sm !mb-0">
                                {filter === "unread" ? "You've read all your notifications" : "You don't have any notifications yet"}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => {
                            const iconData = getNotificationIcon(notification);
                            const route = getNotificationRoute(notification);
                            const isClickable = !!route;
                            const IconComponent = iconData.icon;

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => isClickable && handleNotificationClick(notification)}
                                    className={`group relative flex gap-4 p-3 rounded-lg border transition-all duration-200 ${
                                        notification.is_read
                                            ? "bg-white border-gray-100 opacity-80"
                                            : "bg-white border-indigo-100 shadow-sm ring-1 ring-indigo-50"
                                    } ${isClickable ? "cursor-pointer hover:border-indigo-300 " : ""}`}
                                >
                                    {/* Icon */}
                                    {/*<div className={`flex-shrink-0 w-12 h-12 rounded-lg ${iconData.bg} ${iconData.color} flex items-center justify-center text-lg`}>*/}
                                    {/*    <i className={iconData.icon}></i>*/}
                                    {/*</div>*/}
                                    {/* Icon Container */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${iconData.bg} ${iconData.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                        <IconComponent className="w-7 h-7" strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`text-sm font-bold truncate ${notification.is_read ? "text-gray-700" : "text-gray-900"}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-2">
                                                {formatTime(notification.created_at)}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed mb-2 ${notification.is_read ? "text-gray-500" : "text-gray-600"}`}>
                                            {notification.message}
                                        </p>

                                        {isClickable && (
                                            <div className="flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                                                View details
                                                <i className="fas fa-chevron-right ml-1 text-[10px]"></i>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unread Dot */}
                                    {!notification.is_read && (
                                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-600"></div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default View;