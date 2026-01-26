import React, { useState, useMemo } from "react";
import { useViewNotifications } from "@hooks/institute/notifications/useViewNotifications";
import {
    Button,
    Box,
    Typography,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    Pagination,
    Fade,
    Collapse
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InboxIcon from "@mui/icons-material/Inbox";

const ITEMS_PER_PAGE = 10;

// Get notification icon based on type/title
const getNotificationIcon = (notification) => {
    const title = notification.title?.toLowerCase() || "";
    const message = notification.message?.toLowerCase() || "";
    const combined = title + " " + message;

    if (combined.includes("contract") || combined.includes("application")) {
        return { icon: AssignmentIcon, color: "#3b82f6", bg: "#eff6ff" };
    }
    if (combined.includes("payment") || combined.includes("invoice") || combined.includes("billing")) {
        return { icon: PaymentIcon, color: "#10b981", bg: "#ecfdf5" };
    }
    if (combined.includes("schedule") || combined.includes("reminder") || combined.includes("upcoming")) {
        return { icon: EventIcon, color: "#8b5cf6", bg: "#f5f3ff" };
    }
    if (combined.includes("profile") || combined.includes("user") || combined.includes("account")) {
        return { icon: PersonIcon, color: "#f59e0b", bg: "#fffbeb" };
    }
    if (combined.includes("warning") || combined.includes("attention")) {
        return { icon: WarningAmberIcon, color: "#f59e0b", bg: "#fffbeb" };
    }
    if (combined.includes("error") || combined.includes("failed") || combined.includes("rejected")) {
        return { icon: ErrorOutlineIcon, color: "#ef4444", bg: "#fef2f2" };
    }
    if (combined.includes("success") || combined.includes("approved") || combined.includes("accepted")) {
        return { icon: CheckCircleOutlineIcon, color: "#10b981", bg: "#ecfdf5" };
    }
    return { icon: InfoOutlinedIcon, color: "#6366f1", bg: "#eef2ff" };
};

// Format relative time
const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Group notifications by date
const groupNotificationsByDate = (notifications) => {
    const groups = {
        today: [],
        yesterday: [],
        thisWeek: [],
        earlier: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach((notification) => {
        const date = new Date(notification.created_at);
        if (date >= today) {
            groups.today.push(notification);
        } else if (date >= yesterday) {
            groups.yesterday.push(notification);
        } else if (date >= weekAgo) {
            groups.thisWeek.push(notification);
        } else {
            groups.earlier.push(notification);
        }
    });

    return groups;
};

// Single Notification Card Component
const NotificationCard = ({ notification, onOpen, onMarkAsRead, onMarkAsUnread }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { icon: IconComponent, color, bg } = getNotificationIcon(notification);

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onOpen(notification)}
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                padding: "1rem 1.25rem",
                backgroundColor: notification.is_read ? "#fafafa" : "#ffffff",
                borderRadius: "12px",
                border: notification.is_read ? "1px solid #e5e7eb" : "1px solid #c7d2fe",
                boxShadow: notification.is_read
                    ? "none"
                    : "0 2px 8px rgba(99, 102, 241, 0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                    backgroundColor: notification.is_read ? "#f5f5f5" : "#f8faff",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                },
                "&::before": notification.is_read ? {} : {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    backgroundColor: "#6366f1",
                    borderRadius: "4px 0 0 4px"
                }
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "10px",
                    backgroundColor: notification.is_read ? "#f3f4f6" : bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                }}
            >
                <IconComponent
                    sx={{
                        fontSize: "1.4rem",
                        color: notification.is_read ? "#9ca3af" : color
                    }}
                />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography
                        sx={{
                            fontWeight: notification.is_read ? 500 : 600,
                            fontSize: "0.95rem",
                            color: notification.is_read ? "#6b7280" : "#111827",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {notification.title}
                    </Typography>
                    {!notification.is_read && (
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#6366f1",
                                flexShrink: 0
                            }}
                        />
                    )}
                </Box>
                <Typography
                    sx={{
                        fontSize: "0.875rem",
                        color: notification.is_read ? "#9ca3af" : "#4b5563",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                    }}
                >
                    {notification.message}
                </Typography>
                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        mt: 0.75
                    }}
                >
                    {formatTimeAgo(notification.created_at)}
                </Typography>
            </Box>

            {/* Actions */}
            <Fade in={isHovered}>
                <Box
                    sx={{
                        display: "flex",
                        gap: 0.5,
                        alignItems: "center"
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Tooltip title={notification.is_read ? "Mark as unread" : "Mark as read"}>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                notification.is_read
                                    ? onMarkAsUnread(notification.id)
                                    : onMarkAsRead(notification.id);
                            }}
                            sx={{
                                color: "#6b7280",
                                "&:hover": {
                                    backgroundColor: "#f3f4f6",
                                    color: "#6366f1"
                                }
                            }}
                        >
                            {notification.is_read ? (
                                <MarkEmailUnreadIcon fontSize="small" />
                            ) : (
                                <MarkEmailReadIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="View details">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen(notification);
                            }}
                            sx={{
                                color: "#6b7280",
                                "&:hover": {
                                    backgroundColor: "#f3f4f6",
                                    color: "#6366f1"
                                }
                            }}
                        >
                            <OpenInNewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Fade>
        </Box>
    );
};

// Date Group Section
const DateGroupSection = ({ title, notifications, onOpen, onMarkAsRead, onMarkAsUnread }) => {
    if (notifications.length === 0) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <Typography
                sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 1.5,
                    pl: 0.5
                }}
            >
                {title}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {notifications.map((notification) => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onOpen={onOpen}
                        onMarkAsRead={onMarkAsRead}
                        onMarkAsUnread={onMarkAsUnread}
                    />
                ))}
            </Box>
        </Box>
    );
};

// Empty State Component
const EmptyState = ({ filter }) => (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 2
        }}
    >
        <Box
            sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3
            }}
        >
            {filter === "unread" ? (
                <NotificationsNoneIcon sx={{ fontSize: "2.5rem", color: "#9ca3af" }} />
            ) : (
                <InboxIcon sx={{ fontSize: "2.5rem", color: "#9ca3af" }} />
            )}
        </Box>
        <Typography
            sx={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#374151",
                mb: 1
            }}
        >
            {filter === "unread" ? "All caught up!" : "No notifications yet"}
        </Typography>
        <Typography
            sx={{
                fontSize: "0.875rem",
                color: "#6b7280",
                textAlign: "center",
                maxWidth: 300
            }}
        >
            {filter === "unread"
                ? "You've read all your notifications. Check back later for updates."
                : "When you receive notifications, they'll appear here."}
        </Typography>
    </Box>
);

const View = () => {
    const {
        rows,
        handleMarkAllAsRead,
        handleMarkAsRead,
        handleMarkAsUnread,
        handleOpenNotification
    } = useViewNotifications();

    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);

    const unreadCount = rows.filter((row) => !row.is_read).length;
    const readCount = rows.length - unreadCount;

    // Filter notifications
    const filteredNotifications = useMemo(() => {
        let filtered = [...rows];
        if (filter === "unread") {
            filtered = filtered.filter((n) => !n.is_read);
        } else if (filter === "read") {
            filtered = filtered.filter((n) => n.is_read);
        }
        // Sort by date descending
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [rows, filter]);

    // Pagination
    const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
    const paginatedNotifications = filteredNotifications.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    // Group for display
    const groupedNotifications = groupNotificationsByDate(paginatedNotifications);

    // Reset page when filter changes
    const handleFilterChange = (event, newValue) => {
        setFilter(newValue);
        setPage(1);
    };

    return (
        <div
            className="content-wrapper"
            style={{ minHeight: "calc(100vh - 57px)", backgroundColor: "#f8fafc", marginTop: "25px" }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)",
                    color: "white",
                    padding: "2.5rem 2rem 3rem",
                    boxShadow: "0 10px 40px -10px rgba(79, 70, 229, 0.5)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)",
                        pointerEvents: "none"
                    },
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -2,
                        left: 0,
                        right: 0,
                        height: "20px",
                        background: "#f8fafc",
                        borderRadius: "20px 20px 0 0"
                    }
                }}
            >
                <Box
                    sx={{
                        maxWidth: 900,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                        position: "relative",
                        zIndex: 1
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: "16px",
                                background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                                backdropFilter: "blur(10px)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
                                border: "1px solid rgba(255,255,255,0.2)"
                            }}
                        >
                            <NotificationsActiveIcon sx={{ fontSize: "1.85rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 800,
                                    mb: 0.5,
                                    letterSpacing: "-0.02em",
                                    textShadow: "0 2px 10px rgba(0,0,0,0.1)"
                                }}
                            >
                                Notifications
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    opacity: 0.95,
                                    fontWeight: 500,
                                    letterSpacing: "0.01em"
                                }}
                            >
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                                    : "You're all caught up!"}
                            </Typography>
                        </Box>
                    </Box>
                    {unreadCount > 0 && (
                        <Button
                            variant="contained"
                            startIcon={<MarkEmailReadIcon />}
                            onClick={handleMarkAllAsRead}
                            sx={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                                color: "white",
                                textTransform: "none",
                                fontWeight: 600,
                                padding: "0.65rem 1.5rem",
                                borderRadius: "12px",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.25)",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)"
                                },
                                "&:active": {
                                    transform: "translateY(0)"
                                }
                            }}
                        >
                            Mark all as read
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>
                {/* Filter Tabs */}
                <Box
                    sx={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        mb: 2,
                        overflow: "hidden"
                    }}
                >
                    <Tabs
                        value={filter}
                        onChange={handleFilterChange}
                        sx={{
                            minHeight: 48,
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#6366f1",
                                height: 3,
                                borderRadius: "3px 3px 0 0"
                            }
                        }}
                    >
                        <Tab
                            value="all"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>All</span>
                                    <Box
                                        sx={{
                                            backgroundColor: filter === "all" ? "#6366f1" : "#e5e7eb",
                                            color: filter === "all" ? "white" : "#6b7280",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            padding: "2px 8px",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        {rows.length}
                                    </Box>
                                </Box>
                            }
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                color: filter === "all" ? "#6366f1" : "#6b7280",
                                "&.Mui-selected": { color: "#6366f1" }
                            }}
                        />
                        <Tab
                            value="unread"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>Unread</span>
                                    {unreadCount > 0 && (
                                        <Box
                                            sx={{
                                                backgroundColor: filter === "unread" ? "#6366f1" : "#fbbf24",
                                                color: "white",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                padding: "2px 8px",
                                                borderRadius: "10px"
                                            }}
                                        >
                                            {unreadCount}
                                        </Box>
                                    )}
                                </Box>
                            }
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                color: filter === "unread" ? "#6366f1" : "#6b7280",
                                "&.Mui-selected": { color: "#6366f1" }
                            }}
                        />
                        <Tab
                            value="read"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>Read</span>
                                    <Box
                                        sx={{
                                            backgroundColor: filter === "read" ? "#6366f1" : "#e5e7eb",
                                            color: filter === "read" ? "white" : "#6b7280",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            padding: "2px 8px",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        {readCount}
                                    </Box>
                                </Box>
                            }
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                color: filter === "read" ? "#6366f1" : "#6b7280",
                                "&.Mui-selected": { color: "#6366f1" }
                            }}
                        />
                    </Tabs>
                </Box>

                {/* Notifications List */}
                <Box
                    sx={{
                        backgroundColor: "white",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        padding: "1.5rem"
                    }}
                >
                    {filteredNotifications.length === 0 ? (
                        <EmptyState filter={filter} />
                    ) : (
                        <>
                            <DateGroupSection
                                title="Today"
                                notifications={groupedNotifications.today}
                                onOpen={handleOpenNotification}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAsUnread={handleMarkAsUnread}
                            />
                            <DateGroupSection
                                title="Yesterday"
                                notifications={groupedNotifications.yesterday}
                                onOpen={handleOpenNotification}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAsUnread={handleMarkAsUnread}
                            />
                            <DateGroupSection
                                title="This Week"
                                notifications={groupedNotifications.thisWeek}
                                onOpen={handleOpenNotification}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAsUnread={handleMarkAsUnread}
                            />
                            <DateGroupSection
                                title="Earlier"
                                notifications={groupedNotifications.earlier}
                                onOpen={handleOpenNotification}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAsUnread={handleMarkAsUnread}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        mt: 4,
                                        pt: 3,
                                        borderTop: "1px solid #e5e7eb",
                                        position: "relative",
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            top: -1,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: "60px",
                                            height: "3px",
                                            background: "linear-gradient(90deg, transparent, #e5e7eb, transparent)",
                                            borderRadius: "2px"
                                        }
                                    }}
                                >
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={(e, value) => setPage(value)}
                                        color="primary"
                                        size="large"
                                        sx={{
                                            "& .MuiPaginationItem-root": {
                                                fontWeight: 600,
                                                fontSize: "0.9rem",
                                                minWidth: 40,
                                                height: 40,
                                                borderRadius: "10px",
                                                margin: "0 4px",
                                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                border: "1px solid transparent",
                                                "&:hover": {
                                                    backgroundColor: "#f3f4f6",
                                                    border: "1px solid #e5e7eb",
                                                    transform: "translateY(-1px)"
                                                }
                                            },
                                            "& .Mui-selected": {
                                                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important",
                                                color: "white",
                                                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
                                                border: "none !important",
                                                "&:hover": {
                                                    background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%) !important",
                                                    transform: "translateY(-1px)"
                                                }
                                            },
                                            "& .MuiPaginationItem-previousNext": {
                                                backgroundColor: "#f8fafc",
                                                border: "1px solid #e5e7eb",
                                                "&:hover": {
                                                    backgroundColor: "#f3f4f6",
                                                    borderColor: "#d1d5db"
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </div>
    );
};

export default View;
