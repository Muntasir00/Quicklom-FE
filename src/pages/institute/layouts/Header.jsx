import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutService } from '../../../services/user/AuthService'
import { useHeader } from "@hooks/institute/layouts/useHeader"
import { getNotificationRoute } from "@hooks/institute/notifications/useViewNotifications"
import Swal from "sweetalert2";

const Header = () => {
    const {
        navigate,
        menu,
        SESSION,
        notificationStatistics,
        notifications,
        format,
        handleNotificationClick,
    } = useHeader();

    const userName = sessionStorage.getItem("name") || "User";
    const userRole = sessionStorage.getItem("role") || "Guest";
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuToggle = (e) => {
        e.preventDefault();
        if (isMobile && window.toggleInstituteSidebar) {
            window.toggleInstituteSidebar();
        }
    };

    const handleLogout = async (event) => {
        event.preventDefault();

        const result = await Swal.fire({
            title: 'Logout Confirmation',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d9488',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            const status = await logoutService(event);
            if (status === true) {
                navigate("/login");
            }
        }
    };

    return (
        <nav className="main-header navbar navbar-expand healthcare-header">
            {/* Left navbar links */}
            <ul className="navbar-nav align-items-center">
                {/* Sidebar Toggle */}
                <li className="nav-item">
                    <a
                        className="nav-link toggle-btn"
                        data-widget={isMobile ? undefined : "pushmenu"}
                        href="#"
                        role="button"
                        title="Toggle Navigation"
                        onClick={isMobile ? handleMenuToggle : undefined}
                    >
                        <i className="fas fa-bars"></i>
                    </a>
                </li>
            </ul>

            {/* Right navbar links */}
            <ul className="navbar-nav ml-auto align-items-center">
                {/* Notifications */}
                <li className="nav-item dropdown">
                    <a
                        className="nav-link notification-wrapper"
                        data-toggle="dropdown"
                        href="#"
                    >
                        <div className={`notification-bell ${notificationStatistics?.unread_count > 0 ? 'has-notifications' : ''}`}>
                            <i className={notificationStatistics?.unread_count > 0 ? "fas fa-bell" : "far fa-bell"}></i>
                            {notificationStatistics?.unread_count > 0 && (
                                <span className="notification-count">
                                    {notificationStatistics?.unread_count > 99 ? '99+' : notificationStatistics?.unread_count}
                                </span>
                            )}
                        </div>
                    </a>

                    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right notification-dropdown">
                        <div className="dropdown-header-custom">
                            <i className="fas fa-bell mr-2"></i>
                            Notifications
                            <span className="badge badge-light ml-auto">
                                {notificationStatistics?.unread_count || 0} new
                            </span>
                        </div>

                        <div className="notification-list">
                            {Array.isArray(notifications) && notifications.length > 0 ? (
                                notifications.slice(0, 5).map((notification, index) => (
                                    <Link
                                        key={notification.id || index}
                                        className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                                        to={getNotificationRoute(notification, SESSION.USER_ROLE)}
                                        onClick={(e) => {
                                            if (!notification.is_read) {
                                                handleNotificationClick(notification.id);
                                            }
                                        }}
                                    >
                                        <div className="notification-icon">
                                            <i className={`fas fa-${notification.is_read ? 'envelope-open' : 'envelope'}`}></i>
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-title">
                                                {notification?.title
                                                    ? notification.title.length > 35
                                                        ? notification.title.substring(0, 35) + "..."
                                                        : notification.title
                                                    : "-"}
                                            </p>
                                            <span className="notification-time">
                                                {notification?.created_at ? format(notification.created_at) : ""}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="no-notifications">
                                    <i className="far fa-bell-slash"></i>
                                    <p>No notifications</p>
                                </div>
                            )}
                        </div>

                        <Link to={`/${SESSION.USER_ROLE}/notifications`} className="dropdown-footer-custom">
                            View All Notifications
                            <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                    </div>
                </li>

                {/* User Info & Logout */}
                <li className="nav-item dropdown">
                    <a
                        className="nav-link user-dropdown-toggle"
                        data-toggle="dropdown"
                        href="#"
                        role="button"
                    >
                        <div className="user-avatar-header">
                            <i className="fas fa-user-md"></i>
                        </div>
                        <div className="user-info-header d-none d-md-flex">
                            <span className="user-name-header">{userName}</span>
                            <span className="user-role-header">{userRole}</span>
                        </div>
                        <i className="fas fa-chevron-down dropdown-arrow d-none d-md-inline"></i>
                    </a>

                    <div className="dropdown-menu dropdown-menu-right user-dropdown">
                        <div className="user-dropdown-header">
                            <div className="user-avatar-large">
                                <i className="fas fa-user-md"></i>
                            </div>
                            <div className="user-details">
                                <span className="user-fullname">{userName}</span>
                                <span className="user-role-label">{userRole}</span>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        <Link to={`/${SESSION.USER_ROLE}/profile/${SESSION.USER_ID}/edit`} className="dropdown-item-custom">
                            <i className="fas fa-id-card-alt"></i>
                            My Profile
                        </Link>
                        <Link to={`/${SESSION.USER_ROLE}/account`} className="dropdown-item-custom">
                            <i className="fas fa-user-cog"></i>
                            Account Settings
                        </Link>
                        <Link to={`/${SESSION.USER_ROLE}/notifications`} className="dropdown-item-custom">
                            <i className="fas fa-bell"></i>
                            Notifications
                            {notificationStatistics?.unread_count > 0 && (
                                <span className="item-badge">{notificationStatistics?.unread_count}</span>
                            )}
                        </Link>

                        <div className="dropdown-divider"></div>

                        <a
                            className="dropdown-item-custom logout-item"
                            href="#"
                            onClick={handleLogout}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </div>
                </li>
            </ul>

            <style jsx>{`
                /* Healthcare Header Theme */
                .healthcare-header {
                    background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%) !important;
                    border-bottom: 2px solid #0d9488 !important;
                    box-shadow: 0 2px 15px rgba(13, 148, 136, 0.1) !important;
                    min-height: 60px !important;
                    padding: 0 1rem !important;
                    z-index: 1030;
                }

                /* Toggle Button */
                .toggle-btn {
                    width: 42px;
                    height: 42px;
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    color: #0d9488 !important;
                    font-size: 1.1rem;
                    transition: all 0.25s ease;
                }

                .toggle-btn:hover {
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%) !important;
                    color: white !important;
                    transform: scale(1.05);
                }

                /* Notification Bell */
                .notification-wrapper {
                    padding: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                }

                .notification-bell {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 1rem;
                    position: relative;
                    transition: all 0.25s ease;
                }

                .notification-bell.has-notifications {
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(13, 148, 136, 0.4);
                }

                .notification-bell:hover {
                    transform: scale(1.05);
                }

                .notification-count {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 700;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                    animation: pulse-count 2s infinite;
                }

                @keyframes pulse-count {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                /* Notification Dropdown */
                .notification-dropdown {
                    width: 360px !important;
                    padding: 0 !important;
                    border: none !important;
                    border-radius: 16px !important;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
                    overflow: hidden;
                    margin-top: 10px !important;
                }

                .dropdown-header-custom {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                    color: white;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .dropdown-header-custom .badge {
                    font-size: 0.7rem;
                    padding: 0.25rem 0.5rem;
                }

                .notification-list {
                    max-height: 320px;
                    overflow-y: auto;
                }

                .notification-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 0.875rem 1.25rem;
                    text-decoration: none !important;
                    border-bottom: 1px solid #f1f5f9;
                    transition: all 0.2s ease;
                }

                .notification-item:hover {
                    background: #f8fafc;
                }

                .notification-item.unread {
                    background: #f0fdfa;
                    border-left: 3px solid #0d9488;
                }

                .notification-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 0.85rem;
                    flex-shrink: 0;
                }

                .notification-item.unread .notification-icon {
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                    color: white;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-title {
                    margin: 0;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: #1e293b;
                    line-height: 1.4;
                }

                .notification-item.unread .notification-title {
                    font-weight: 600;
                }

                .notification-time {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }

                .no-notifications {
                    padding: 2rem;
                    text-align: center;
                    color: #94a3b8;
                }

                .no-notifications i {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .no-notifications p {
                    margin: 0;
                    font-size: 0.875rem;
                }

                .dropdown-footer-custom {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.875rem;
                    background: #f8fafc;
                    color: #0d9488 !important;
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-decoration: none !important;
                    transition: all 0.2s ease;
                }

                .dropdown-footer-custom:hover {
                    background: #f0fdfa;
                    color: #0f766e !important;
                }

                /* User Dropdown */
                .user-dropdown-toggle {
                    display: flex !important;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 0.875rem !important;
                    background: #f8fafc;
                    border-radius: 12px;
                    transition: all 0.25s ease;
                    margin-left: 0.5rem;
                }

                .user-dropdown-toggle:hover {
                    background: #f0fdfa;
                }

                .user-avatar-header {
                    width: 38px;
                    height: 38px;
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.95rem;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
                }

                .user-info-header {
                    flex-direction: column;
                    line-height: 1.2;
                }

                .user-name-header {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #0f172a;
                }

                .user-role-header {
                    font-size: 0.7rem;
                    color: #64748b;
                    text-transform: capitalize;
                }

                .dropdown-arrow {
                    font-size: 0.65rem;
                    color: #94a3b8;
                    margin-left: 0.25rem;
                }

                /* User Dropdown Menu */
                .user-dropdown {
                    width: 280px !important;
                    padding: 0 !important;
                    border: none !important;
                    border-radius: 16px !important;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
                    overflow: hidden;
                    margin-top: 10px !important;
                }

                .user-dropdown-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                }

                .user-avatar-large {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                }

                .user-details {
                    display: flex;
                    flex-direction: column;
                }

                .user-fullname {
                    font-size: 1rem;
                    font-weight: 600;
                    color: white;
                }

                .user-role-label {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: capitalize;
                }

                .dropdown-divider {
                    margin: 0 !important;
                    border-color: #f1f5f9 !important;
                }

                .dropdown-item-custom {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.875rem 1.25rem;
                    color: #475569 !important;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-decoration: none !important;
                    transition: all 0.2s ease;
                }

                .dropdown-item-custom:hover {
                    background: #f8fafc;
                    color: #0d9488 !important;
                }

                .dropdown-item-custom i {
                    width: 18px;
                    text-align: center;
                    color: #94a3b8;
                    transition: color 0.2s;
                }

                .dropdown-item-custom:hover i {
                    color: #0d9488;
                }

                .item-badge {
                    margin-left: auto;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 0.2rem 0.5rem;
                    border-radius: 10px;
                }

                .logout-item {
                    color: #ef4444 !important;
                }

                .logout-item:hover {
                    background: #fef2f2 !important;
                    color: #dc2626 !important;
                }

                .logout-item i {
                    color: #ef4444;
                }

                /* Scrollbar for notification list */
                .notification-list::-webkit-scrollbar {
                    width: 5px;
                }

                .notification-list::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .notification-list::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }

                /* ========================================
                   RESPONSIVE HEADER STYLES
                   ======================================== */

                /* Tablet & Mobile - Header adjustments */
                @media (max-width: 991.98px) {
                    .healthcare-header {
                        position: fixed !important;
                        top: 0;
                        left: 0;
                        right: 0;
                        z-index: 1030;
                        margin-left: 0 !important;
                    }

                    .toggle-btn {
                        width: 44px;
                        height: 44px;
                    }
                }

                /* Mobile - Notification dropdown */
                @media (max-width: 575.98px) {
                    .notification-dropdown {
                        width: calc(100vw - 20px) !important;
                        max-width: 360px;
                        right: -60px !important;
                    }

                    .user-dropdown {
                        width: calc(100vw - 20px) !important;
                        max-width: 280px;
                        right: 0 !important;
                    }

                    .user-dropdown-toggle {
                        padding: 0.4rem 0.5rem !important;
                        margin-left: 0.25rem;
                    }

                    .notification-bell {
                        width: 38px;
                        height: 38px;
                    }

                    .user-avatar-header {
                        width: 36px;
                        height: 36px;
                    }
                }

                /* Small mobile */
                @media (max-width: 400px) {
                    .healthcare-header {
                        padding: 0 0.5rem !important;
                    }

                    .notification-dropdown {
                        right: -80px !important;
                    }
                }

                /* Safe area for notched devices */
                @supports (padding-top: env(safe-area-inset-top)) {
                    .healthcare-header {
                        padding-top: env(safe-area-inset-top) !important;
                    }
                }
            `}</style>
        </nav>
    );
}

export default Header;
