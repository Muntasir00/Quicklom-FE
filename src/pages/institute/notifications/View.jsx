import React, { useMemo, useState } from "react";
import { useViewNotifications } from "@hooks/institute/notifications/useViewNotifications";
import { cn } from "../../../lib/utils.js";

import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card } from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Separator } from "@components/ui/separator";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";

import {
    Bell,
    CheckCheck,
    Inbox,
    Mail,
    MailOpen,
    ExternalLink,
    CalendarClock,
    CreditCard,
    FileText,
    User,
    AlertTriangle,
    XCircle,
    Info,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

/** icon mapping: you can tune keywords as you like */
const getNotificationMeta = (n) => {
    const title = (n.title || "").toLowerCase();
    const message = (n.message || "").toLowerCase();
    const combined = `${title} ${message}`;

    if (combined.includes("contract") || combined.includes("application")) {
        return { Icon: FileText, tone: "blue", label: "Contract" };
    }
    if (combined.includes("payment") || combined.includes("invoice") || combined.includes("billing")) {
        return { Icon: CreditCard, tone: "green", label: "Payment" };
    }
    if (combined.includes("schedule") || combined.includes("reminder") || combined.includes("upcoming")) {
        return { Icon: CalendarClock, tone: "violet", label: "Schedule" };
    }
    if (combined.includes("profile") || combined.includes("user") || combined.includes("account")) {
        return { Icon: User, tone: "amber", label: "Account" };
    }
    if (combined.includes("warning") || combined.includes("attention")) {
        return { Icon: AlertTriangle, tone: "amber", label: "Warning" };
    }
    if (combined.includes("error") || combined.includes("failed") || combined.includes("rejected")) {
        return { Icon: XCircle, tone: "red", label: "Error" };
    }
    return { Icon: Info, tone: "indigo", label: "Info" };
};

const toneClasses = {
    blue: { ring: "ring-blue-200", bg: "bg-blue-50", fg: "text-blue-600" },
    green: { ring: "ring-emerald-200", bg: "bg-emerald-50", fg: "text-emerald-600" },
    violet: { ring: "ring-violet-200", bg: "bg-violet-50", fg: "text-violet-600" },
    amber: { ring: "ring-amber-200", bg: "bg-amber-50", fg: "text-amber-600" },
    red: { ring: "ring-red-200", bg: "bg-red-50", fg: "text-red-600" },
    indigo: { ring: "ring-indigo-200", bg: "bg-indigo-50", fg: "text-indigo-600" },
};

const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
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

const groupNotificationsByDate = (notifications) => {
    const groups = { today: [], yesterday: [], thisWeek: [], earlier: [] };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach((n) => {
        const d = new Date(n.created_at);
        if (d >= today) groups.today.push(n);
        else if (d >= yesterday) groups.yesterday.push(n);
        else if (d >= weekAgo) groups.thisWeek.push(n);
        else groups.earlier.push(n);
    });

    return groups;
};

function EmptyState({ filter }) {
    const isUnread = filter === "unread";
    return (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                {isUnread ? <Mail className="h-7 w-7 text-muted-foreground" /> : <Inbox className="h-7 w-7 text-muted-foreground" />}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
                {isUnread ? "All caught up!" : "No notifications yet"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                {isUnread
                    ? "You've read all your notifications. Check back later for updates."
                    : "When you receive notifications, they'll appear here."}
            </p>
        </div>
    );
}

function Section({
                     title,
                     items,
                     onOpen,
                     onMarkAsRead,
                     onMarkAsUnread,
                 }) {
    if (!items.length) return null;

    return (
        <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground px-1">
                {title}
            </p>

            <div className="space-y-3">
                {items.map((n) => (
                    <NotificationCard
                        key={n.id}
                        notification={n}
                        onOpen={onOpen}
                        onMarkAsRead={onMarkAsRead}
                        onMarkAsUnread={onMarkAsUnread}
                    />
                ))}
            </div>
        </div>
    );
}

function NotificationCard({
                              notification,
                              onOpen,
                              onMarkAsRead,
                              onMarkAsUnread,
                          }) {
    const { Icon, tone } = getNotificationMeta(notification);
    const toneCls = toneClasses[tone];

    return (
        <Card
            onClick={() => onOpen(notification)}
            className={cn(
                "group relative cursor-pointer overflow-hidden border transition-all py-0 gap-1",
                "hover:-translate-y-[1px] hover:shadow-md",
                notification.is_read ? "bg-background" : "bg-white",
                notification.is_read ? "border-border" : "border-indigo-200"
            )}
        >
            {/* unread left accent */}
            {!notification.is_read && (
                <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />
            )}

            <div className="flex gap-3 p-4 sm:p-5">
                {/* icon */}
                <div
                    className={cn(
                        "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ring-1",
                        notification.is_read ? "bg-muted ring-border" : cn(toneCls.bg, toneCls.ring)
                    )}
                >
                    <Icon className={cn("h-5 w-5", notification.is_read ? "text-muted-foreground" : toneCls.fg)} />
                </div>

                {/* content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                        <h4
                            className={cn(
                                "truncate text-sm sm:text-[15px]",
                                notification.is_read ? "font-medium text-muted-foreground" : "font-semibold text-foreground"
                            )}
                        >
                            {notification.title}
                        </h4>

                        {!notification.is_read && (
                            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                    </div>

                    <p
                        className={cn(
                            "mt-1 text-sm leading-relaxed",
                            notification.is_read ? "text-muted-foreground/80" : "text-muted-foreground"
                        )}
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                    </p>
                </div>

                {/* actions (show on hover) */}
                <TooltipProvider>
                    <div
                        className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-xl"
                                    onClick={() =>
                                        notification.is_read ? onMarkAsUnread(notification.id) : onMarkAsRead(notification.id)
                                    }
                                >
                                    {notification.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {notification.is_read ? "Mark as unread" : "Mark as read"}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-xl"
                                    onClick={() => onOpen(notification)}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>View details</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            {/* mobile actions */}
            <div className=" px-4 pb-4">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className=" rounded-xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            notification.is_read ? onMarkAsUnread(notification.id) : onMarkAsRead(notification.id);
                        }}
                    >
                        {notification.is_read ? (
                            <>
                                <Mail className="h-4 w-4 mr-2" /> Mark unread
                            </>
                        ) : (
                            <>
                                <MailOpen className="h-4 w-4 mr-2" /> Mark read
                            </>
                        )}
                    </Button>
                    <Button
                        className=" rounded-xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen(notification);
                        }}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" /> Open
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default function View() {
    const { rows, handleMarkAllAsRead, handleMarkAsRead, handleMarkAsUnread, handleOpenNotification } =
        useViewNotifications();

    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);

    const unreadCount = rows.filter((r) => !r.is_read).length;
    const readCount = rows.length - unreadCount;

    const filteredNotifications = useMemo(() => {
        let filtered = [...rows];
        if (filter === "unread") filtered = filtered.filter((n) => !n.is_read);
        if (filter === "read") filtered = filtered.filter((n) => n.is_read);
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [rows, filter]);

    const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE));
    const paginated = filteredNotifications.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const grouped = groupNotificationsByDate(paginated);

    const onFilterChange = (v) => {
        setFilter(v);
        setPage(1);
    };

    return (
        <div className="">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="relative p-3 bg-white rounded-lg border border-gray-100">
                        <Bell className="w-8 h-8 text-indigo-600" strokeWidth={2.2} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-4 -right-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
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

            {/* CONTENT */}
            <div className="">
                {/* FILTER TABS */}
                <Card className="rounded-lg py-0">
                    <div className="p-3">
                        <Tabs value={filter} onValueChange={(v) => onFilterChange(v)} >
                            <TabsList className="grid grid-cols-3 !rounded-lg ">
                                <TabsTrigger value="all" className="!rounded-lg">
                                    <span className="mr-2">All</span>
                                    <Badge variant={filter === "all" ? "default" : "secondary"} className="rounded-full">
                                        {rows.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="rounded-lg">
                                    <span className="mr-2">Unread</span>
                                    {unreadCount > 0 ? (
                                        <Badge className="rounded-full">{unreadCount}</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="rounded-full">
                                            0
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="read" className="rounded-lg">
                                    <span className="mr-2">Read</span>
                                    <Badge variant={filter === "read" ? "default" : "secondary"} className="rounded-full">
                                        {readCount}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={filter} className="mt-4">
                                <Card className="rounded-2xl border shadow-sm">
                                    <div className="p-4 sm:p-6">
                                        {filteredNotifications.length === 0 ? (
                                            <EmptyState filter={filter} />
                                        ) : (
                                            <div className="space-y-6">
                                                <Section
                                                    title="Today"
                                                    items={grouped.today}
                                                    onOpen={handleOpenNotification}
                                                    onMarkAsRead={handleMarkAsRead}
                                                    onMarkAsUnread={handleMarkAsUnread}
                                                />
                                                <Section
                                                    title="Yesterday"
                                                    items={grouped.yesterday}
                                                    onOpen={handleOpenNotification}
                                                    onMarkAsRead={handleMarkAsRead}
                                                    onMarkAsUnread={handleMarkAsUnread}
                                                />
                                                <Section
                                                    title="This Week"
                                                    items={grouped.thisWeek}
                                                    onOpen={handleOpenNotification}
                                                    onMarkAsRead={handleMarkAsRead}
                                                    onMarkAsUnread={handleMarkAsUnread}
                                                />
                                                <Section
                                                    title="Earlier"
                                                    items={grouped.earlier}
                                                    onOpen={handleOpenNotification}
                                                    onMarkAsRead={handleMarkAsRead}
                                                    onMarkAsUnread={handleMarkAsUnread}
                                                />

                                                {totalPages > 1 && (
                                                    <>
                                                        <Separator />
                                                        <div className="flex justify-center">
                                                            <ShadcnPagination
                                                                page={page}
                                                                totalPages={totalPages}
                                                                onPageChange={setPage}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </Card>
            </div>
        </div>
    );
}

/** shadcn pagination helper */
function ShadcnPagination({
                              page,
                              totalPages,
                              onPageChange,
                          }) {
    const pages = useMemo(() => {
        // simple compact pagination: show 1, last, current ±1
        const set = new Set([1, totalPages, page, page - 1, page + 1]);
        return [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    }, [page, totalPages]);

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        className={cn(page === 1 && "pointer-events-none opacity-50")}
                    />
                </PaginationItem>

                {pages.map((p, idx) => {
                    const prev = pages[idx - 1];
                    const showEllipsis = idx > 0 && prev && p - prev > 1;
                    return (
                        <React.Fragment key={p}>
                            {showEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink isActive={p === page} onClick={() => onPageChange(p)}>
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        </React.Fragment>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        className={cn(page === totalPages && "pointer-events-none opacity-50")}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
