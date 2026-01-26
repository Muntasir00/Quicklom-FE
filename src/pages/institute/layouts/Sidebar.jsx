import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "@hooks/institute/layouts/useSidebar";
import { getImminentCountService } from "@services/institute/UpcomingContractsService";
import { getUnreadCountService } from "@services/institute/MessagingService";
import AgreementService from "@services/institute/AgreementService";
import InvoiceService from "@services/institute/InvoiceService";
import axios from "axios";

const Sidebar = () => {
    const {
        navigate,
        menu,
        SESSION,
        ALLOWED_APPLICANT_CATEGORIES
    } = useSidebar();

    const [imminentContracts, setImminentContracts] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingAgreements, setPendingAgreements] = useState(0);
    const [pendingInvoices, setPendingInvoices] = useState(0);
    const [outstandingFees, setOutstandingFees] = useState(0);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileOpen(false);
                document.body.classList.remove('sidebar-mobile-open');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Toggle mobile sidebar
    const toggleMobileSidebar = useCallback(() => {
        setIsMobileOpen(prev => {
            const newState = !prev;
            if (newState) {
                document.body.classList.add('sidebar-mobile-open');
            } else {
                document.body.classList.remove('sidebar-mobile-open');
            }
            return newState;
        });
    }, []);

    // Close sidebar on navigation (mobile)
    const handleNavClick = useCallback(() => {
        if (isMobile) {
            setIsMobileOpen(false);
            document.body.classList.remove('sidebar-mobile-open');
        }
    }, [isMobile]);

    // Expose toggle function globally for header
    useEffect(() => {
        window.toggleInstituteSidebar = toggleMobileSidebar;
        return () => {
            delete window.toggleInstituteSidebar;
        };
    }, [toggleMobileSidebar]);

    // Handle swipe gestures
    useEffect(() => {
        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
        };

        const handleTouchMove = (e) => {
            touchEndX = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            const swipeDistance = touchEndX - touchStartX;
            const threshold = 50;

            // Swipe right to open (from left edge)
            if (swipeDistance > threshold && touchStartX < 30 && !isMobileOpen) {
                setIsMobileOpen(true);
                document.body.classList.add('sidebar-mobile-open');
            }

            // Swipe left to close
            if (swipeDistance < -threshold && isMobileOpen) {
                setIsMobileOpen(false);
                document.body.classList.remove('sidebar-mobile-open');
            }
        };

        if (isMobile) {
            document.addEventListener('touchstart', handleTouchStart);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, isMobileOpen]);

    useEffect(() => {
        fetchImminentContracts();
        fetchUnreadMessages();
        fetchPendingAgreements();
        fetchPendingInvoices();
        fetchOutstandingFees();

        const interval = setInterval(() => {
            fetchImminentContracts();
            fetchUnreadMessages();
            fetchPendingAgreements();
            fetchPendingInvoices();
            fetchOutstandingFees();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchImminentContracts = async () => {
        try {
            const count = await getImminentCountService(72);
            setImminentContracts(count);
        } catch (error) {
            console.error('Error fetching imminent contracts:', error);
        }
    };

    const fetchUnreadMessages = async () => {
        try {
            const data = await getUnreadCountService();
            setUnreadMessages(data?.total_unread || 0);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    const fetchPendingAgreements = async () => {
        try {
            const count = await AgreementService.getPendingCount();
            setPendingAgreements(count || 0);
        } catch (error) {
            console.error('Error fetching pending agreements:', error);
        }
    };

    const fetchPendingInvoices = async () => {
        try {
            const count = await InvoiceService.getPendingCount();
            setPendingInvoices(count || 0);
        } catch (error) {
            console.error('Error fetching pending invoices:', error);
        }
    };

    const fetchOutstandingFees = async () => {
        try {
            const response = await axios.get('/v.1/institute/pending-cancellation-fees');
            if (response.data.status && response.data.data?.has_outstanding_fees) {
                setOutstandingFees(response.data.data.fees?.length || 0);
            } else {
                setOutstandingFees(0);
            }
        } catch (error) {
            console.error('Error fetching outstanding fees:', error);
            setOutstandingFees(0);
        }
    };

    const isActiveRoute = (route) => {
        if (route.includes('/profile')) {
            return new RegExp('^/' + SESSION.ROLE + '/profile(?:/\\d+(?:/\\w+)*)?$').test(menu);
        }

        if (route.includes('/billing')) {
            if (route === `/${SESSION.ROLE}/billing`) {
                return menu === `/${SESSION.ROLE}/billing`;
            }
            if (route === `/${SESSION.ROLE}/billing/invoices`) {
                return menu === `/${SESSION.ROLE}/billing/invoices` ||
                       menu.startsWith(`/${SESSION.ROLE}/billing/invoices/`);
            }
            if (route === `/${SESSION.ROLE}/billing/history`) {
                return menu === `/${SESSION.ROLE}/billing/history` ||
                       menu.startsWith(`/${SESSION.ROLE}/billing/history/`);
            }
        }

        if (route.includes('/agreements')) {
            return menu === `/${SESSION.ROLE}/agreements` ||
                   menu.startsWith(`/${SESSION.ROLE}/agreements/`);
        }

        if (route.includes('/upcoming-contracts')) {
            return menu === `/${SESSION.ROLE}/upcoming-contracts` ||
                   menu.startsWith(`/${SESSION.ROLE}/upcoming-contracts/`);
        }

        return menu === route;
    };

    const MenuItem = ({ to, icon, label, badge, badgeColor = 'danger' }) => (
        <li className="nav-item">
            <Link
                to={to}
                className={`nav-link ${isActiveRoute(to) ? 'active' : ''}`}
                onClick={handleNavClick}
                data-title={label}
            >
                <i className={`nav-icon ${icon}`}></i>
                <p>
                    {label}
                    {badge > 0 && (
                        <span className={`sidebar-badge ${badgeColor}`}>{badge}</span>
                    )}
                </p>
            </Link>
        </li>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && (
                <div
                    className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
                    onClick={toggleMobileSidebar}
                />
            )}

            <aside className={`main-sidebar elevation-4 healthcare-sidebar ${isMobile ? 'mobile-sidebar' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Mobile Close Button */}
                {isMobile && (
                    <button className="sidebar-close-btn" onClick={toggleMobileSidebar}>
                        <i className="fas fa-times"></i>
                    </button>
                )}

                {/* Brand Logo */}
                <Link to={`/${SESSION.ROLE}/dashboard`} className="brand-link" onClick={handleNavClick}>
                    <div className="brand-logo-wrapper">
                        <div className="brand-icon">
                            <i className="fas fa-heartbeat"></i>
                        </div>
                        <div className="brand-text-wrapper">
                            <span className="brand-text">QuickLocum</span>
                            <span className="brand-tagline">Healthcare Platform</span>
                        </div>
                    </div>
                </Link>

                {/* Sidebar */}
                <div className="sidebar">
                    {/* Sidebar Menu */}
                    <nav className="sidebar-nav">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">

                            {/* Main Section */}
                            <li className="nav-header">
                                <i className="fas fa-home mr-2"></i>
                                MAIN
                            </li>

                            <MenuItem to={`/${SESSION.ROLE}/dashboard`} icon="fas fa-chart-pie" label="Dashboard" />
                            <MenuItem to={`/${SESSION.ROLE}/account`} icon="fas fa-user-cog" label="My Account" />
                            <MenuItem to={`/${SESSION.ROLE}/profile/${SESSION.USER_ID}/edit`} icon="fas fa-id-card-alt" label="My Profile" />

                            {/* Contracts Section */}
                            <li className="nav-header">
                                <i className="fas fa-file-medical mr-2"></i>
                                CONTRACTS
                            </li>

                            <MenuItem to={`/${SESSION.ROLE}/contracts`} icon="fas fa-file-contract" label="My Contracts" />
                            <MenuItem
                                to={`/${SESSION.ROLE}/upcoming-contracts`}
                                icon="fas fa-calendar-check"
                                label="Upcoming Work"
                                badge={imminentContracts}
                            />
                            <MenuItem to={`/${SESSION.ROLE}/contract-applicants`} icon="fas fa-user-friends" label="Applicants" />

                            {/* Job Board Section (Conditional) */}
                            {ALLOWED_APPLICANT_CATEGORIES.includes(SESSION.INSTITUTE_CATEGORY) && (
                                <>
                                    <li className="nav-header">
                                        <i className="fas fa-briefcase-medical mr-2"></i>
                                        JOB BOARD
                                    </li>

                                    <MenuItem to={`/${SESSION.ROLE}/published-contracts`} icon="fas fa-bullhorn" label="Job Offers" />
                                    <MenuItem to={`/${SESSION.ROLE}/contract-applications`} icon="fas fa-paper-plane" label="Applications" />
                                </>
                            )}

                            {/* Billing & Legal Section */}
                            <li className="nav-header">
                                <i className="fas fa-file-invoice-dollar mr-2"></i>
                                BILLING & LEGAL
                            </li>

                            <MenuItem to={`/${SESSION.ROLE}/billing`} icon="fas fa-credit-card" label="Billing & Payments" />
                            <MenuItem
                                to={`/${SESSION.ROLE}/billing/invoices`}
                                icon="fas fa-file-invoice"
                                label="Invoices"
                                badge={pendingInvoices + outstandingFees}
                            />
                            <MenuItem to={`/${SESSION.ROLE}/billing/history`} icon="fas fa-history" label="Payment History" />
                            <MenuItem
                                to={`/${SESSION.ROLE}/agreements`}
                                icon="fas fa-handshake"
                                label="Agreements"
                                badge={pendingAgreements}
                                badgeColor="warning"
                            />

                            {/* Communication Section */}
                            <li className="nav-header">
                                <i className="fas fa-comments mr-2"></i>
                                COMMUNICATION
                            </li>

                            <li className="nav-item">
                                <Link
                                    to={`/${SESSION.ROLE}/messaging`}
                                    className={`nav-link ${menu === `/${SESSION.ROLE}/messaging` || menu.startsWith(`/${SESSION.ROLE}/messaging/`) ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                    data-title="Messages"
                                >
                                    <i className="nav-icon fas fa-envelope"></i>
                                    <p>
                                        Messages
                                        {unreadMessages > 0 && (
                                            <span className="sidebar-badge danger">{unreadMessages}</span>
                                        )}
                                    </p>
                                </Link>
                            </li>

                            <MenuItem to={`/${SESSION.ROLE}/notifications`} icon="fas fa-bell" label="Notifications" />
                        </ul>
                    </nav>
                </div>

                {/* Bottom Separator */}
                <div className="sidebar-footer-separator">
                    <div className="separator-line"></div>
                    <div className="separator-glow"></div>
                </div>

            <style jsx>{`
                /* Healthcare Theme Colors */
                :root {
                    --healthcare-primary: #0d9488;
                    --healthcare-primary-dark: #0f766e;
                    --healthcare-secondary: #0f172a;
                    --healthcare-accent: #14b8a6;
                    --healthcare-light: #f0fdfa;
                    --healthcare-success: #10b981;
                    --healthcare-danger: #ef4444;
                    --healthcare-warning: #f59e0b;
                }

                .healthcare-sidebar {
                    background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%) !important;
                    border-right: none !important;
                    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15) !important;
                }

                /* Brand Section - aligned with header height (60px) */
                .brand-link {
                    display: flex !important;
                    align-items: center !important;
                    min-height: 60px !important;
                    padding: 0 1rem !important;
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%) !important;
                    border-bottom: none !important;
                    text-decoration: none !important;
                }

                .brand-logo-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .brand-icon {
                    width: 42px;
                    height: 42px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    color: white;
                    backdrop-filter: blur(10px);
                }

                .brand-text-wrapper {
                    display: flex;
                    flex-direction: column;
                }

                .brand-text {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white !important;
                    letter-spacing: 0.5px;
                    line-height: 1.2;
                }

                .brand-tagline {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 400;
                    letter-spacing: 0.3px;
                }

                /* Navigation */
                .sidebar-nav {
                    padding: 0.25rem 0;
                }

                .nav-header {
                    color: rgba(255, 255, 255, 0.4) !important;
                    font-size: 0.65rem !important;
                    font-weight: 700 !important;
                    letter-spacing: 1px !important;
                    padding: 0.6rem 1rem 0.3rem !important;
                    margin-top: 1rem !important;
                    margin-bottom: 0.5rem !important;
                    text-transform: uppercase !important;
                    display: flex !important;
                    align-items: center !important;
                }

                .nav-header i {
                    font-size: 0.6rem;
                    opacity: 0.6;
                }

                .nav-sidebar .nav-item {
                    margin: 1px 0.5rem;
                }

                .nav-sidebar .nav-link {
                    color: rgba(255, 255, 255, 0.75) !important;
                    padding: 0.5rem 0.875rem !important;
                    border-radius: 8px !important;
                    transition: all 0.25s ease !important;
                    display: flex !important;
                    align-items: center !important;
                    font-size: 0.8rem !important;
                    font-weight: 500 !important;
                }

                .nav-sidebar .nav-link:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                    color: white !important;
                    transform: translateX(4px);
                }

                .nav-sidebar .nav-link.active {
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%) !important;
                    color: white !important;
                    box-shadow: 0 4px 15px rgba(13, 148, 136, 0.4) !important;
                    transform: translateX(0);
                }

                .nav-sidebar .nav-link .nav-icon {
                    width: 18px;
                    margin-right: 0.625rem;
                    font-size: 0.85rem;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.6);
                    transition: color 0.25s;
                }

                .nav-sidebar .nav-link:hover .nav-icon,
                .nav-sidebar .nav-link.active .nav-icon {
                    color: white !important;
                }

                .nav-sidebar .nav-link p {
                    margin: 0 !important;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                /* Badges */
                .sidebar-badge {
                    font-size: 0.6rem;
                    font-weight: 700;
                    padding: 0.15rem 0.4rem;
                    border-radius: 20px;
                    min-width: 18px;
                    text-align: center;
                    animation: badge-pulse 2s infinite;
                }

                .sidebar-badge.danger {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                }

                .sidebar-badge.warning {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
                }

                @keyframes badge-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                /* Sidebar Content */
                .sidebar {
                    overflow-x: hidden !important;
                    overflow-y: auto !important;
                }

                /* Desktop - hide scrollbar but allow scroll if needed */
                @media (min-width: 992px) {
                    .sidebar {
                        scrollbar-width: none; /* Firefox */
                        -ms-overflow-style: none; /* IE/Edge */
                    }

                    .sidebar::-webkit-scrollbar {
                        display: none; /* Chrome/Safari/Opera */
                    }
                }

                /* Sidebar Footer Separator */
                .sidebar-footer-separator {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    z-index: 10;
                }

                .separator-line {
                    height: 3px;
                    background: linear-gradient(90deg, #0d9488 0%, #14b8a6 50%, #10b981 100%);
                    box-shadow: 0 0 10px rgba(13, 148, 136, 0.5);
                }

                .separator-glow {
                    height: 8px;
                    background: linear-gradient(180deg, rgba(13, 148, 136, 0.3) 0%, transparent 100%);
                    margin-top: -4px;
                }

                /* Main Sidebar Fixes */
                .main-sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 100vh;
                    max-height: 100vh;
                    z-index: 1038;
                    overflow: hidden !important;
                    display: flex;
                    flex-direction: column;
                }

                .main-sidebar .sidebar {
                    flex: 1;
                    min-height: 0;
                }

                /* Collapsed State - Desktop Only */
                @media (min-width: 992px) {
                    body.sidebar-collapse .brand-text-wrapper {
                        display: none;
                    }

                    body.sidebar-collapse .brand-link {
                        justify-content: center;
                    }

                    body.sidebar-collapse .brand-icon {
                        width: 32px;
                        height: 32px;
                        font-size: 14px;
                        border-radius: 6px;
                    }

                    body.sidebar-collapse .nav-header {
                        visibility: hidden;
                        height: 0;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: hidden;
                    }

                    body.sidebar-collapse .main-sidebar {
                        width: 4.6rem;
                    }

                    body.sidebar-collapse .nav-sidebar .nav-link p {
                        display: none;
                    }

                    body.sidebar-collapse .nav-sidebar .nav-link {
                        justify-content: center;
                        padding: 0.6rem !important;
                    }

                    body.sidebar-collapse .nav-sidebar .nav-link .nav-icon {
                        margin-right: 0;
                        font-size: 14px;
                    }
                }

                /* ========================================
                   MOBILE SIDEBAR STYLES
                   ======================================== */

                /* Mobile Overlay */
                .sidebar-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 1039;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }

                .sidebar-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                /* Mobile Close Button */
                .sidebar-close-btn {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    color: white;
                    font-size: 1.1rem;
                    cursor: pointer;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .sidebar-close-btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                    transform: scale(1.05);
                }

                .sidebar-close-btn:active {
                    transform: scale(0.95);
                }

                /* Mobile Sidebar Behavior */
                @media (max-width: 991.98px) {
                    .healthcare-sidebar {
                        position: fixed !important;
                        top: 0;
                        left: 0;
                        width: 280px !important;
                        height: 100vh !important;
                        z-index: 1040 !important;
                        transform: translateX(-100%);
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: none !important;
                    }

                    .healthcare-sidebar.mobile-open {
                        transform: translateX(0);
                        box-shadow: 10px 0 40px rgba(0, 0, 0, 0.3) !important;
                    }

                    /* Override AdminLTE default behavior */
                    body:not(.sidebar-open) .main-sidebar {
                        margin-left: 0 !important;
                    }

                    /* Prevent body scroll when sidebar is open */
                    body.sidebar-mobile-open {
                        overflow: hidden;
                    }

                    /* Adjust sidebar content for mobile */
                    .sidebar {
                        height: calc(100vh - 60px - 4px) !important;
                        overflow-y: auto !important;
                        -webkit-overflow-scrolling: touch;
                    }

                    /* Larger touch targets for mobile */
                    .nav-sidebar .nav-link {
                        padding: 0.75rem 1rem !important;
                        min-height: 48px;
                    }

                    .nav-header {
                        padding: 1rem 1rem 0.4rem !important;
                    }

                    /* Brand section adjustments */
                    .brand-link {
                        padding-right: 50px !important;
                    }
                }

                /* Tablet adjustments */
                @media (min-width: 768px) and (max-width: 991.98px) {
                    .healthcare-sidebar {
                        width: 300px !important;
                    }
                }

                /* Small mobile adjustments */
                @media (max-width: 575.98px) {
                    .healthcare-sidebar {
                        width: 85vw !important;
                        max-width: 300px;
                    }

                    .brand-text {
                        font-size: 1.1rem !important;
                    }

                    .brand-tagline {
                        font-size: 0.65rem !important;
                    }

                    .nav-sidebar .nav-link {
                        font-size: 0.85rem !important;
                    }
                }

                /* Safe area padding for notched devices */
                @supports (padding-top: env(safe-area-inset-top)) {
                    @media (max-width: 991.98px) {
                        .healthcare-sidebar {
                            padding-top: env(safe-area-inset-top);
                            padding-bottom: env(safe-area-inset-bottom);
                        }
                    }
                }

                /* Scrollbar styling for mobile */
                @media (max-width: 991.98px) {
                    .sidebar::-webkit-scrollbar {
                        width: 4px;
                    }

                    .sidebar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.05);
                    }

                    .sidebar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 4px;
                    }

                    .sidebar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.3);
                    }
                }

                /* Animation for menu items on mobile */
                @media (max-width: 991.98px) {
                    .healthcare-sidebar.mobile-open .nav-item {
                        animation: slideInLeft 0.3s ease forwards;
                        opacity: 0;
                    }

                    .healthcare-sidebar.mobile-open .nav-item:nth-child(1) { animation-delay: 0.05s; }
                    .healthcare-sidebar.mobile-open .nav-item:nth-child(2) { animation-delay: 0.1s; }
                    .healthcare-sidebar.mobile-open .nav-item:nth-child(3) { animation-delay: 0.15s; }
                    .healthcare-sidebar.mobile-open .nav-item:nth-child(4) { animation-delay: 0.2s; }
                    .healthcare-sidebar.mobile-open .nav-item:nth-child(5) { animation-delay: 0.25s; }
                    .healthcare-sidebar.mobile-open .nav-item:nth-child(6) { animation-delay: 0.3s; }
                    .healthcare-sidebar.mobile-open .nav-item:nth-child(7) { animation-delay: 0.35s; }
                    .healthcare-sidebar.mobile-open .nav-item:nth-child(8) { animation-delay: 0.4s; }
                    .healthcare-sidebar.mobile-open .nav-item:nth-child(n+9) { animation-delay: 0.45s; }

                    @keyframes slideInLeft {
                        from {
                            opacity: 0;
                            transform: translateX(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                }
            `}</style>
        </aside>
        </>
    );
}

export default Sidebar;
