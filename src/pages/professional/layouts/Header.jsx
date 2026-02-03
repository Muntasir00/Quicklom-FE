import {SidebarTrigger} from "@components/ui/sidebar.jsx";
import {Separator} from "@radix-ui/react-separator";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu.jsx";
import {getCurrentDate} from "../../../lib/utils.js";
import {BellIcon, BellOffIcon, ArrowRight, Mail, MailOpen} from "lucide-react";
import {useHeader} from "@hooks/professional/layouts/useHeader"
import {getNotificationRoute} from "@hooks/professional/notifications/useViewNotifications"
import {Link} from "react-router-dom";

const Header = () => {
    const {weekday, formattedDate} = getCurrentDate();
    const {
        navigate,
        menu,
        SESSION,
        notificationStatistics,
        notifications,
        format,
        handleNotificationClick,
    } = useHeader();

    return (
        <header
            className="sticky transition-all border-b border-gray-200 duration-300 ease-in-out  top-0 z-50 w-full bg-white/40 backdrop-blur-lg pr-4">
            <div className="flex justify-between items-center h-14">
                <div className="flex items-center gap-2 px-4">
                    {/* আইকন সাইজ বড় করার টিপস এখানেও অ্যাপ্লাই করতে পারেন */}
                    <SidebarTrigger className="-ml-1 text-[#334155] cursor-pointer [&_svg]:size-5.5"/>

                    <Separator
                        orientation="vertical"
                        className="mr-2 h-6" // h-4 এর চেয়ে h-6 হেডারে ভালো লাগে
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:block text-[12px] leading-tight text-right text-[#334155] font-medium">
                        <span>{weekday}</span> <br/>
                        <span className="text-gray-500 font-normal">{formattedDate}</span>
                    </div>

                    <Separator
                        orientation="vertical"
                        className="hidden sm:block mx-1 h-6"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="relative p-2 rounded-full  transition-colors cursor-pointer outline-none"
                                aria-label="Notifications"
                            >
                                <BellIcon className="size-5.5 text-[#334155]"/>

                                {/* নোটিফিকেশন আনরিড থাকলে লাল ডট দেখাবে */}
                                {notificationStatistics?.unread_count > 0 && (
                                    <span
                                        className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-80 mr-4 rounded-xl shadow-xl border border-gray-100 p-0 overflow-hidden"
                            align="end"
                            sideOffset={10}
                        >
                            {/* হেডার সেকশন */}
                            <div
                                className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                                <p className="text-sm font-bold text-[#102A56] flex items-center gap-2 !mb-0">
                                    <BellIcon className="size-4"/> Notifications
                                </p>
                                {notificationStatistics?.unread_count > 0 && (
                                    <span
                                        className="text-[10px] bg-[#2563EB] text-white px-2 py-0.5 rounded-full font-medium">
                                        {notificationStatistics.unread_count} new
                                    </span>
                                )}
                            </div>

                            {/* নোটিফিকেশন লিস্ট */}
                            <div className="max-h-[350px] overflow-y-auto">
                                {Array.isArray(notifications) && notifications.length > 0 ? (
                                    notifications.slice(0, 5).map((notification, index) => (
                                        <DropdownMenuItem asChild key={notification.id || index}>
                                            <Link
                                                className={`flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 
                                ${!notification.is_read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                                to={getNotificationRoute(notification, SESSION.USER_ROLE)}
                                                onClick={() => {
                                                    if (!notification.is_read) {
                                                        handleNotificationClick(notification.id);
                                                    }
                                                }}
                                            >
                                                <div
                                                    className={`mt-1 flex-shrink-0 p-1.5 rounded-full ${!notification.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {notification.is_read ? <MailOpen className="size-3.5"/> :
                                                        <Mail className="size-3.5"/>}
                                                </div>

                                                <div className="flex-1 overflow-hidden">
                                                    <p className={`!mb-0 text-sm leading-tight truncate ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                        {notification?.title || "-"}
                                                    </p>
                                                    <p className="!mb-0 text-[11px] text-gray-400 mt-1">
                                                        {notification?.created_at ? format(notification.created_at) : ""}
                                                    </p>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    /* নোটিফিকেশন না থাকলে */
                                    <div className="py-10 flex flex-col items-center justify-center text-gray-400">
                                        <BellOffIcon className="size-8 mb-2 opacity-20"/>
                                        <p className="text-xs">No notifications found</p>
                                    </div>
                                )}
                            </div>

                            {/* ফুটার সেকশন */}
                            <Link
                                to={`/${SESSION.USER_ROLE}/notifications`}
                                className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors border-t border-gray-100"
                            >
                                View All Notifications
                                <ArrowRight className="size-3"/>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

export default Header;

// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { logoutService } from '../../../services/user/AuthService'
// import { useHeader } from "@hooks/professional/layouts/useHeader"
// import { getNotificationRoute } from "@hooks/professional/notifications/useViewNotifications"
// import Swal from "sweetalert2";
//
// const Header = () => {
//     const {
//         navigate,
//         menu,
//         SESSION,
//         notificationStatistics,
//         notifications,
//         format,
//         handleNotificationClick,
//     } = useHeader();
//
//     const userName = sessionStorage.getItem("name") || "User";
//     const userRole = sessionStorage.getItem("role") || "Professional";
//     const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
//
//     useEffect(() => {
//         const handleResize = () => {
//             setIsMobile(window.innerWidth < 992);
//         };
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);
//
//     // Restore sidebar state from localStorage on mount
//     useEffect(() => {
//         const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
//         if (isCollapsed && !isMobile) {
//             document.body.classList.add('sidebar-collapse');
//         }
//     }, [isMobile]);
//
//     const handleMenuToggle = (e) => {
//         e.preventDefault();
//         if (isMobile && window.toggleProfessionalSidebar) {
//             window.toggleProfessionalSidebar();
//         } else {
//             document.body.classList.toggle('sidebar-collapse');
//             const isCollapsed = document.body.classList.contains('sidebar-collapse');
//             localStorage.setItem('sidebar-collapsed', isCollapsed);
//         }
//     };
//
//     const handleLogout = async (event) => {
//         event.preventDefault();
//
//         const result = await Swal.fire({
//             title: 'Logout Confirmation',
//             text: 'Are you sure you want to logout?',
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#6366f1',
//             cancelButtonColor: '#6c757d',
//             confirmButtonText: 'Yes, Logout',
//             cancelButtonText: 'Cancel'
//         });
//
//         if (result.isConfirmed) {
//             const status = await logoutService(event);
//             if (status === true) {
//                 navigate("/login");
//             }
//         }
//     };
//
//     return (
//         <nav className="main-header navbar navbar-expand professional-header">
//             {/* Left navbar links */}
//             <ul className="navbar-nav align-items-center">
//                 {/* Sidebar Toggle */}
//                 <li className="nav-item">
//                     <a
//                         className="nav-link toggle-btn"
//                         href="#"
//                         role="button"
//                         title="Toggle Navigation"
//                         onClick={handleMenuToggle}
//                     >
//                         <i className="fas fa-bars"></i>
//                     </a>
//                 </li>
//
//                 {/* Page Title - Desktop only */}
//                 <li className="nav-item d-none d-md-block ml-3">
//                     <span className="page-title">Professional Dashboard</span>
//                 </li>
//             </ul>
//
//             {/* Right navbar links */}
//             <ul className="navbar-nav ml-auto align-items-center">
//                 {/* Quick Actions */}
//                 <li className="nav-item d-none d-lg-block">
//                     <Link to={`/${SESSION.USER_ROLE}/published-contracts`} className="quick-action-btn">
//                         <i className="fas fa-search"></i>
//                         <span>Find Jobs</span>
//                     </Link>
//                 </li>
//
//                 {/* Notifications */}
//                 <li className="nav-item dropdown">
//                     <a
//                         className="nav-link notification-wrapper"
//                         data-toggle="dropdown"
//                         href="#"
//                     >
//                         <div className={`notification-bell ${notificationStatistics?.unread_count > 0 ? 'has-notifications' : ''}`}>
//                             <i className={notificationStatistics?.unread_count > 0 ? "fas fa-bell" : "far fa-bell"}></i>
//                             {notificationStatistics?.unread_count > 0 && (
//                                 <span className="notification-count">
//                                     {notificationStatistics?.unread_count > 99 ? '99+' : notificationStatistics?.unread_count}
//                                 </span>
//                             )}
//                         </div>
//                     </a>
//
//                     <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right notification-dropdown">
//                         <div className="dropdown-header-custom">
//                             <i className="fas fa-bell mr-2"></i>
//                             Notifications
//                             <span className="badge badge-light ml-auto">
//                                 {notificationStatistics?.unread_count || 0} new
//                             </span>
//                         </div>
//
//                         <div className="notification-list">
//                             {Array.isArray(notifications) && notifications.length > 0 ? (
//                                 notifications.slice(0, 5).map((notification, index) => (
//                                     <Link
//                                         key={notification.id || index}
//                                         className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
//                                         to={getNotificationRoute(notification, SESSION.USER_ROLE)}
//                                         onClick={(e) => {
//                                             if (!notification.is_read) {
//                                                 handleNotificationClick(notification.id);
//                                             }
//                                         }}
//                                     >
//                                         <div className="notification-icon">
//                                             <i className={`fas fa-${notification.is_read ? 'envelope-open' : 'envelope'}`}></i>
//                                         </div>
//                                         <div className="notification-content">
//                                             <p className="notification-title">
//                                                 {notification?.title
//                                                     ? notification.title.length > 35
//                                                         ? notification.title.substring(0, 35) + "..."
//                                                         : notification.title
//                                                     : "-"}
//                                             </p>
//                                             <span className="notification-time">
//                                                 {notification?.created_at ? format(notification.created_at) : ""}
//                                             </span>
//                                         </div>
//                                     </Link>
//                                 ))
//                             ) : (
//                                 <div className="no-notifications">
//                                     <i className="far fa-bell-slash"></i>
//                                     <p>No notifications</p>
//                                 </div>
//                             )}
//                         </div>
//
//                         <Link to={`/${SESSION.USER_ROLE}/notifications`} className="dropdown-footer-custom">
//                             View All Notifications
//                             <i className="fas fa-arrow-right ml-2"></i>
//                         </Link>
//                     </div>
//                 </li>
//
//                 {/* User Info & Logout */}
//                 <li className="nav-item dropdown">
//                     <a
//                         className="nav-link user-dropdown-toggle"
//                         data-toggle="dropdown"
//                         href="#"
//                         role="button"
//                     >
//                         <div className="user-avatar-header">
//                             <i className="fas fa-user-md"></i>
//                         </div>
//                         <div className="user-info-header d-none d-md-flex">
//                             <span className="user-name-header">{userName}</span>
//                             <span className="user-role-header">{userRole}</span>
//                         </div>
//                         <i className="fas fa-chevron-down dropdown-arrow d-none d-md-inline"></i>
//                     </a>
//
//                     <div className="dropdown-menu dropdown-menu-right user-dropdown">
//                         <div className="user-dropdown-header">
//                             <div className="user-avatar-large">
//                                 <i className="fas fa-user-md"></i>
//                             </div>
//                             <div className="user-details">
//                                 <span className="user-fullname">{userName}</span>
//                                 <span className="user-role-label">{userRole}</span>
//                             </div>
//                         </div>
//
//                         <div className="dropdown-divider"></div>
//
//                         <Link to={`/${SESSION.USER_ROLE}/profile/${SESSION.USER_ID}/edit`} className="dropdown-item-custom">
//                             <i className="fas fa-id-badge"></i>
//                             My Profile
//                         </Link>
//                         <Link to={`/${SESSION.USER_ROLE}/account`} className="dropdown-item-custom">
//                             <i className="fas fa-user-cog"></i>
//                             Account Settings
//                         </Link>
//                         <Link to={`/${SESSION.USER_ROLE}/availability`} className="dropdown-item-custom">
//                             <i className="fas fa-calendar-alt"></i>
//                             My Availability
//                         </Link>
//                         <Link to={`/${SESSION.USER_ROLE}/notifications`} className="dropdown-item-custom">
//                             <i className="fas fa-bell"></i>
//                             Notifications
//                             {notificationStatistics?.unread_count > 0 && (
//                                 <span className="item-badge">{notificationStatistics?.unread_count}</span>
//                             )}
//                         </Link>
//
//                         <div className="dropdown-divider"></div>
//
//                         <a
//                             className="dropdown-item-custom logout-item"
//                             href="#"
//                             onClick={handleLogout}
//                         >
//                             <i className="fas fa-sign-out-alt"></i>
//                             Logout
//                         </a>
//                     </div>
//                 </li>
//             </ul>
//
//             <style jsx>{`
//                 /* Professional Header Theme - Purple/Indigo */
//                 .professional-header {
//                     background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%) !important;
//                     border-bottom: 2px solid #6366f1 !important;
//                     box-shadow: 0 2px 15px rgba(99, 102, 241, 0.1) !important;
//                     min-height: 60px !important;
//                     padding: 0 1rem !important;
//                     z-index: 1030;
//                 }
//
//                 /* Page Title */
//                 .page-title {
//                     font-size: 1rem;
//                     font-weight: 600;
//                     color: #4f46e5;
//                     letter-spacing: 0.3px;
//                 }
//
//                 /* Toggle Button */
//                 .toggle-btn {
//                     width: 42px;
//                     height: 42px;
//                     display: flex !important;
//                     align-items: center;
//                     justify-content: center;
//                     border-radius: 10px;
//                     color: #6366f1 !important;
//                     font-size: 1.1rem;
//                     transition: all 0.25s ease;
//                 }
//
//                 .toggle-btn:hover {
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
//                     color: white !important;
//                     transform: scale(1.05);
//                 }
//
//                 /* Quick Action Button */
//                 .quick-action-btn {
//                     display: flex;
//                     align-items: center;
//                     gap: 0.5rem;
//                     padding: 0.5rem 1rem;
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
//                     color: white !important;
//                     font-size: 0.8rem;
//                     font-weight: 600;
//                     border-radius: 10px;
//                     text-decoration: none !important;
//                     transition: all 0.25s ease;
//                     box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
//                     margin-right: 0.75rem;
//                 }
//
//                 .quick-action-btn:hover {
//                     transform: translateY(-2px);
//                     box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
//                     color: white !important;
//                 }
//
//                 .quick-action-btn i {
//                     font-size: 0.85rem;
//                 }
//
//                 /* Notification Bell */
//                 .notification-wrapper {
//                     padding: 0 !important;
//                     display: flex !important;
//                     align-items: center !important;
//                 }
//
//                 .notification-bell {
//                     width: 40px;
//                     height: 40px;
//                     border-radius: 10px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     background: #f1f5f9;
//                     color: #64748b;
//                     font-size: 1rem;
//                     position: relative;
//                     transition: all 0.25s ease;
//                 }
//
//                 .notification-bell.has-notifications {
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
//                     color: white;
//                     box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
//                 }
//
//                 .notification-bell:hover {
//                     transform: scale(1.05);
//                 }
//
//                 .notification-count {
//                     position: absolute;
//                     top: -6px;
//                     right: -6px;
//                     min-width: 20px;
//                     height: 20px;
//                     padding: 0 6px;
//                     background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
//                     color: white;
//                     font-size: 0.65rem;
//                     font-weight: 700;
//                     border-radius: 10px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     border: 2px solid white;
//                     box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
//                     animation: pulse-count 2s infinite;
//                 }
//
//                 @keyframes pulse-count {
//                     0%, 100% { transform: scale(1); }
//                     50% { transform: scale(1.1); }
//                 }
//
//                 /* Notification Dropdown */
//                 .notification-dropdown {
//                     width: 360px !important;
//                     padding: 0 !important;
//                     border: none !important;
//                     border-radius: 16px !important;
//                     box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
//                     overflow: hidden;
//                     margin-top: 10px !important;
//                 }
//
//                 .dropdown-header-custom {
//                     display: flex;
//                     align-items: center;
//                     padding: 1rem 1.25rem;
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
//                     color: white;
//                     font-weight: 600;
//                     font-size: 0.95rem;
//                 }
//
//                 .dropdown-header-custom .badge {
//                     font-size: 0.7rem;
//                     padding: 0.25rem 0.5rem;
//                 }
//
//                 .notification-list {
//                     max-height: 320px;
//                     overflow-y: auto;
//                 }
//
//                 .notification-item {
//                     display: flex;
//                     align-items: flex-start;
//                     gap: 0.75rem;
//                     padding: 0.875rem 1.25rem;
//                     text-decoration: none !important;
//                     border-bottom: 1px solid #f1f5f9;
//                     transition: all 0.2s ease;
//                 }
//
//                 .notification-item:hover {
//                     background: #f8fafc;
//                 }
//
//                 .notification-item.unread {
//                     background: #f5f3ff;
//                     border-left: 3px solid #6366f1;
//                 }
//
//                 .notification-icon {
//                     width: 36px;
//                     height: 36px;
//                     border-radius: 10px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     background: #f1f5f9;
//                     color: #64748b;
//                     font-size: 0.85rem;
//                     flex-shrink: 0;
//                 }
//
//                 .notification-item.unread .notification-icon {
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
//                     color: white;
//                 }
//
//                 .notification-content {
//                     flex: 1;
//                     min-width: 0;
//                 }
//
//                 .notification-title {
//                     margin: 0;
//                     font-size: 0.85rem;
//                     font-weight: 500;
//                     color: #1e293b;
//                     line-height: 1.4;
//                 }
//
//                 .notification-item.unread .notification-title {
//                     font-weight: 600;
//                 }
//
//                 .notification-time {
//                     font-size: 0.75rem;
//                     color: #94a3b8;
//                 }
//
//                 .no-notifications {
//                     padding: 2rem;
//                     text-align: center;
//                     color: #94a3b8;
//                 }
//
//                 .no-notifications i {
//                     font-size: 2rem;
//                     margin-bottom: 0.5rem;
//                 }
//
//                 .no-notifications p {
//                     margin: 0;
//                     font-size: 0.875rem;
//                 }
//
//                 .dropdown-footer-custom {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     padding: 0.875rem;
//                     background: #f8fafc;
//                     color: #6366f1 !important;
//                     font-weight: 600;
//                     font-size: 0.85rem;
//                     text-decoration: none !important;
//                     transition: all 0.2s ease;
//                 }
//
//                 .dropdown-footer-custom:hover {
//                     background: #f5f3ff;
//                     color: #4f46e5 !important;
//                 }
//
//                 /* User Dropdown */
//                 .user-dropdown-toggle {
//                     display: flex !important;
//                     align-items: center;
//                     gap: 0.75rem;
//                     padding: 0.5rem 0.875rem !important;
//                     background: #f8fafc;
//                     border-radius: 12px;
//                     transition: all 0.25s ease;
//                     margin-left: 0.5rem;
//                 }
//
//                 .user-dropdown-toggle:hover {
//                     background: #f5f3ff;
//                 }
//
//                 .user-avatar-header {
//                     width: 38px;
//                     height: 38px;
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
//                     border-radius: 10px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     color: white;
//                     font-size: 0.95rem;
//                     box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
//                 }
//
//                 .user-info-header {
//                     flex-direction: column;
//                     line-height: 1.2;
//                 }
//
//                 .user-name-header {
//                     font-size: 0.9rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                 }
//
//                 .user-role-header {
//                     font-size: 0.7rem;
//                     color: #64748b;
//                     text-transform: capitalize;
//                 }
//
//                 .dropdown-arrow {
//                     font-size: 0.65rem;
//                     color: #94a3b8;
//                     margin-left: 0.25rem;
//                 }
//
//                 /* User Dropdown Menu */
//                 .user-dropdown {
//                     width: 280px !important;
//                     padding: 0 !important;
//                     border: none !important;
//                     border-radius: 16px !important;
//                     box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
//                     overflow: hidden;
//                     margin-top: 10px !important;
//                 }
//
//                 .user-dropdown-header {
//                     display: flex;
//                     align-items: center;
//                     gap: 1rem;
//                     padding: 1.25rem;
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
//                 }
//
//                 .user-avatar-large {
//                     width: 50px;
//                     height: 50px;
//                     background: rgba(255, 255, 255, 0.2);
//                     border-radius: 12px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     color: white;
//                     font-size: 1.25rem;
//                 }
//
//                 .user-details {
//                     display: flex;
//                     flex-direction: column;
//                 }
//
//                 .user-fullname {
//                     font-size: 1rem;
//                     font-weight: 600;
//                     color: white;
//                 }
//
//                 .user-role-label {
//                     font-size: 0.8rem;
//                     color: rgba(255, 255, 255, 0.8);
//                     text-transform: capitalize;
//                 }
//
//                 .dropdown-divider {
//                     margin: 0 !important;
//                     border-color: #f1f5f9 !important;
//                 }
//
//                 .dropdown-item-custom {
//                     display: flex;
//                     align-items: center;
//                     gap: 0.75rem;
//                     padding: 0.875rem 1.25rem;
//                     color: #475569 !important;
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     text-decoration: none !important;
//                     transition: all 0.2s ease;
//                 }
//
//                 .dropdown-item-custom:hover {
//                     background: #f8fafc;
//                     color: #6366f1 !important;
//                 }
//
//                 .dropdown-item-custom i {
//                     width: 18px;
//                     text-align: center;
//                     color: #94a3b8;
//                     transition: color 0.2s;
//                 }
//
//                 .dropdown-item-custom:hover i {
//                     color: #6366f1;
//                 }
//
//                 .item-badge {
//                     margin-left: auto;
//                     background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
//                     color: white;
//                     font-size: 0.65rem;
//                     font-weight: 700;
//                     padding: 0.2rem 0.5rem;
//                     border-radius: 10px;
//                 }
//
//                 .logout-item {
//                     color: #ef4444 !important;
//                 }
//
//                 .logout-item:hover {
//                     background: #fef2f2 !important;
//                     color: #dc2626 !important;
//                 }
//
//                 .logout-item i {
//                     color: #ef4444;
//                 }
//
//                 /* Scrollbar for notification list */
//                 .notification-list::-webkit-scrollbar {
//                     width: 5px;
//                 }
//
//                 .notification-list::-webkit-scrollbar-track {
//                     background: #f1f5f9;
//                 }
//
//                 .notification-list::-webkit-scrollbar-thumb {
//                     background: #cbd5e1;
//                     border-radius: 10px;
//                 }
//
//                 /* Responsive */
//                 @media (max-width: 991.98px) {
//                     .professional-header {
//                         position: fixed !important;
//                         top: 0;
//                         left: 0;
//                         right: 0;
//                         z-index: 1030;
//                         margin-left: 0 !important;
//                     }
//
//                     .toggle-btn {
//                         width: 44px;
//                         height: 44px;
//                     }
//                 }
//
//                 @media (max-width: 575.98px) {
//                     .notification-dropdown {
//                         width: calc(100vw - 20px) !important;
//                         max-width: 360px;
//                         right: -60px !important;
//                     }
//
//                     .user-dropdown {
//                         width: calc(100vw - 20px) !important;
//                         max-width: 280px;
//                         right: 0 !important;
//                     }
//
//                     .user-dropdown-toggle {
//                         padding: 0.4rem 0.5rem !important;
//                         margin-left: 0.25rem;
//                     }
//
//                     .notification-bell {
//                         width: 38px;
//                         height: 38px;
//                     }
//
//                     .user-avatar-header {
//                         width: 36px;
//                         height: 36px;
//                     }
//                 }
//
//                 @media (max-width: 400px) {
//                     .professional-header {
//                         padding: 0 0.5rem !important;
//                     }
//
//                     .notification-dropdown {
//                         right: -80px !important;
//                     }
//                 }
//
//                 @supports (padding-top: env(safe-area-inset-top)) {
//                     .professional-header {
//                         padding-top: env(safe-area-inset-top) !important;
//                     }
//                 }
//             `}</style>
//         </nav>
//     );
// }
//
// export default Header;
