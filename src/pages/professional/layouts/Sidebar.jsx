import * as React from "react"
import {useSidebar} from "@hooks/professional/layouts/useSidebar";
import {
    Sidebar as AppSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@components/ui/sidebar"
import NavGroup from "@pages/professional/layouts/nav-group.jsx";
import {TeamSwitcher} from "@pages/professional/layouts/team-switcher.jsx";
import {NavUser} from "@pages/professional/layouts/nav-user.jsx";
import {
    BellIcon,
    CalendarCheckIcon,
    Clock3Icon, CreditCardIcon,
    FileTextIcon,
    LayoutDashboardIcon, MailIcon,
    SendHorizonalIcon,
    Settings,
    User, Search
} from "lucide-react";

const Sidebar = ({...props}) => {
    const {
        SESSION,
    } = useSidebar();

    const menuGroups = [
        {
            title: 'Main',
            items: [
                {text: 'Dashboard', icon: <LayoutDashboardIcon/>, to: `/${SESSION.ROLE}/dashboard`},
                {text: 'My Account', icon: <Settings/>, to: `/${SESSION.ROLE}/account`},
                {text: 'My Profile', icon: <User/>, to: `/${SESSION.ROLE}/profile/${SESSION.USER_ID}/edit`},
            ]
        },
        {
            title: 'Career',
            items: [
                {text: 'Find Jobs', icon: <Search/>, to: `/${SESSION.ROLE}/published-contracts`},
                {text: 'My Applications', icon: <SendHorizonalIcon/>, to: `/${SESSION.ROLE}/contract-applications`},
                {text: 'Availability', icon: <CalendarCheckIcon/>, to: `/${SESSION.ROLE}/availability`},
            ]
        },
        {
            title: 'Active Work',
            items: [
                {text: 'Upcoming Work', icon: <Clock3Icon/>, to: `/${SESSION.ROLE}/upcoming-contracts`,},
                {text: 'Agreements', icon: <FileTextIcon/>, to: `/${SESSION.ROLE}/agreements`,},
            ]
        },
        {
            title: 'Billing',
            items: [
                {text: 'Cancellation Fees', icon: <CreditCardIcon/>, to: `/${SESSION.ROLE}/cancellation-fees`,}
            ]
        },
        {
            title: 'Communication',
            items: [
                {text: 'Messages', icon: <MailIcon/>, to: `/${SESSION.ROLE}/messaging`,},
                {text: 'Notifications', icon: <BellIcon/>, to: `/${SESSION.ROLE}/notifications`},
            ]
        }
    ];
    return (
        <AppSidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher/>
            </SidebarHeader>
            <SidebarContent className="border-b border-gray-200">
                {menuGroups.map((group, index) => (
                    <NavGroup
                        key={index}
                        label={group.title}
                        items={group.items}
                    />
                ))}
            </SidebarContent>
            <SidebarFooter>
                <NavUser/>
            </SidebarFooter>
            <SidebarRail/>
        </AppSidebar>
    )
}
export default Sidebar;


// import React, { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { useSidebar } from "@hooks/professional/layouts/useSidebar";
// import AgreementService from "@services/professional/professional_agreement_service";
// import { getImminentCountService } from "@services/professional/UpcomingContractsService";
// import { getUnreadCountService } from "@services/professional/MessagingService";
// import axios from "axios";
//
// const Sidebar = () => {
//     const {
//         navigate,
//         menu,
//         SESSION,
//     } = useSidebar();
//
//     const [pendingAgreements, setPendingAgreements] = useState(0);
//     const [imminentContracts, setImminentContracts] = useState(0);
//     const [unreadMessages, setUnreadMessages] = useState(0);
//     const [outstandingFees, setOutstandingFees] = useState(0);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isMobileOpen, setIsMobileOpen] = useState(false);
//     const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
//
//     // Handle window resize
//     useEffect(() => {
//         const handleResize = () => {
//             const mobile = window.innerWidth < 992;
//             setIsMobile(mobile);
//             if (!mobile) {
//                 setIsMobileOpen(false);
//                 document.body.classList.remove('sidebar-mobile-open');
//             }
//         };
//
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);
//
//     // Toggle mobile sidebar
//     const toggleMobileSidebar = useCallback(() => {
//         setIsMobileOpen(prev => {
//             const newState = !prev;
//             if (newState) {
//                 document.body.classList.add('sidebar-mobile-open');
//             } else {
//                 document.body.classList.remove('sidebar-mobile-open');
//             }
//             return newState;
//         });
//     }, []);
//
//     // Close sidebar on navigation (mobile)
//     const handleNavClick = useCallback(() => {
//         if (isMobile) {
//             setIsMobileOpen(false);
//             document.body.classList.remove('sidebar-mobile-open');
//         }
//     }, [isMobile]);
//
//     // Expose toggle function globally for header
//     useEffect(() => {
//         window.toggleProfessionalSidebar = toggleMobileSidebar;
//         return () => {
//             delete window.toggleProfessionalSidebar;
//         };
//     }, [toggleMobileSidebar]);
//
//     // Handle swipe gestures
//     useEffect(() => {
//         let touchStartX = 0;
//         let touchEndX = 0;
//
//         const handleTouchStart = (e) => {
//             touchStartX = e.touches[0].clientX;
//         };
//
//         const handleTouchMove = (e) => {
//             touchEndX = e.touches[0].clientX;
//         };
//
//         const handleTouchEnd = () => {
//             const swipeDistance = touchEndX - touchStartX;
//             const threshold = 50;
//
//             if (swipeDistance > threshold && touchStartX < 30 && !isMobileOpen) {
//                 setIsMobileOpen(true);
//                 document.body.classList.add('sidebar-mobile-open');
//             }
//
//             if (swipeDistance < -threshold && isMobileOpen) {
//                 setIsMobileOpen(false);
//                 document.body.classList.remove('sidebar-mobile-open');
//             }
//         };
//
//         if (isMobile) {
//             document.addEventListener('touchstart', handleTouchStart);
//             document.addEventListener('touchmove', handleTouchMove);
//             document.addEventListener('touchend', handleTouchEnd);
//         }
//
//         return () => {
//             document.removeEventListener('touchstart', handleTouchStart);
//             document.removeEventListener('touchmove', handleTouchMove);
//             document.removeEventListener('touchend', handleTouchEnd);
//         };
//     }, [isMobile, isMobileOpen]);
//
//     useEffect(() => {
//         fetchPendingAgreements();
//         fetchImminentContracts();
//         fetchUnreadMessages();
//         fetchOutstandingFees();
//
//         const interval = setInterval(() => {
//             fetchPendingAgreements();
//             fetchImminentContracts();
//             fetchUnreadMessages();
//             fetchOutstandingFees();
//         }, 60000);
//
//         return () => clearInterval(interval);
//     }, []);
//
//     const fetchPendingAgreements = async () => {
//         try {
//             const count = await AgreementService.getPendingCount();
//             setPendingAgreements(count);
//         } catch (error) {
//             console.error('Error fetching pending agreements:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     const fetchImminentContracts = async () => {
//         try {
//             const count = await getImminentCountService(72);
//             setImminentContracts(count);
//         } catch (error) {
//             console.error('Error fetching imminent contracts:', error);
//         }
//     };
//
//     const fetchUnreadMessages = async () => {
//         try {
//             const data = await getUnreadCountService();
//             setUnreadMessages(data?.total_unread || 0);
//         } catch (error) {
//             console.error('Error fetching unread messages:', error);
//         }
//     };
//
//     const fetchOutstandingFees = async () => {
//         try {
//             const response = await axios.get('/v.1/professional/pending-cancellation-fees');
//             if (response.data.status && response.data.data?.has_outstanding_fees) {
//                 setOutstandingFees(response.data.data.fees?.length || 0);
//             } else {
//                 setOutstandingFees(0);
//             }
//         } catch (error) {
//             console.error('Error fetching outstanding fees:', error);
//             setOutstandingFees(0);
//         }
//     };
//
//     const isActiveRoute = (route) => {
//         if (route.includes('/profile')) {
//             return new RegExp('^/' + SESSION.ROLE + '/profile(?:/\\d+(?:/\\w+)*)?$').test(menu);
//         }
//
//         if (route.includes('/agreements')) {
//             return menu === `/${SESSION.ROLE}/agreements` ||
//                    menu.startsWith(`/${SESSION.ROLE}/agreements/`);
//         }
//
//         if (route.includes('/upcoming-contracts')) {
//             return menu === `/${SESSION.ROLE}/upcoming-contracts` ||
//                    menu.startsWith(`/${SESSION.ROLE}/upcoming-contracts/`);
//         }
//
//         if (route.includes('/messaging')) {
//             return menu === `/${SESSION.ROLE}/messaging` ||
//                    menu.startsWith(`/${SESSION.ROLE}/messaging/`);
//         }
//
//         return menu === route;
//     };
//
//     const MenuItem = ({ to, icon, label, badge, badgeColor = 'danger' }) => (
//         <li className="nav-item">
//             <Link
//                 to={to}
//                 className={`nav-link ${isActiveRoute(to) ? 'active' : ''}`}
//                 onClick={handleNavClick}
//                 data-title={label}
//             >
//                 <i className={`nav-icon ${icon}`}></i>
//                 <p>
//                     {label}
//                     {badge > 0 && (
//                         <span className={`sidebar-badge ${badgeColor}`}>{badge}</span>
//                     )}
//                 </p>
//             </Link>
//         </li>
//     );
//
//     return (
//         <>
//             {/* Mobile Overlay */}
//             {isMobile && (
//                 <div
//                     className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
//                     onClick={toggleMobileSidebar}
//                 />
//             )}
//
//             <aside className={`main-sidebar elevation-4 professional-sidebar ${isMobile ? 'mobile-sidebar' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
//                 {/* Mobile Close Button */}
//                 {isMobile && (
//                     <button className="sidebar-close-btn" onClick={toggleMobileSidebar}>
//                         <i className="fas fa-times"></i>
//                     </button>
//                 )}
//
//                 {/* Brand Logo */}
//                 <Link to={`/${SESSION.ROLE}/dashboard`} className="brand-link" onClick={handleNavClick}>
//                     <div className="brand-logo-wrapper">
//                         <div className="brand-icon">
//                             <i className="fas fa-user-md"></i>
//                         </div>
//                         <div className="brand-text-wrapper">
//                             <span className="brand-text">QuickLocum</span>
//                             <span className="brand-tagline">Professional Portal</span>
//                         </div>
//                     </div>
//                 </Link>
//
//                 {/* Sidebar */}
//                 <div className="sidebar">
//                     {/* Sidebar Menu */}
//                     <nav className="sidebar-nav">
//                         <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
//
//                             {/* Main Section */}
//                             <li className="nav-header">
//                                 <i className="fas fa-th-large mr-2"></i>
//                                 MAIN
//                             </li>
//
//                             <MenuItem to={`/${SESSION.ROLE}/dashboard`} icon="fas fa-chart-line" label="Dashboard" />
//                             <MenuItem to={`/${SESSION.ROLE}/account`} icon="fas fa-user-cog" label="My Account" />
//                             <MenuItem to={`/${SESSION.ROLE}/profile/${SESSION.USER_ID}/edit`} icon="fas fa-id-badge" label="My Profile" />
//
//                             {/* Career Section */}
//                             <li className="nav-header">
//                                 <i className="fas fa-briefcase-medical mr-2"></i>
//                                 CAREER
//                             </li>
//
//                             <MenuItem to={`/${SESSION.ROLE}/published-contracts`} icon="fas fa-search" label="Find Jobs" />
//                             <MenuItem to={`/${SESSION.ROLE}/contract-applications`} icon="fas fa-paper-plane" label="My Applications" />
//                             <MenuItem to={`/${SESSION.ROLE}/availability`} icon="fas fa-calendar-alt" label="Availability" />
//
//                             {/* Work Section */}
//                             <li className="nav-header">
//                                 <i className="fas fa-clipboard-check mr-2"></i>
//                                 ACTIVE WORK
//                             </li>
//
//                             <MenuItem
//                                 to={`/${SESSION.ROLE}/upcoming-contracts`}
//                                 icon="fas fa-clock"
//                                 label="Upcoming Work"
//                                 badge={imminentContracts}
//                                 badgeColor="info"
//                             />
//                             <MenuItem
//                                 to={`/${SESSION.ROLE}/agreements`}
//                                 icon="fas fa-file-signature"
//                                 label="Agreements"
//                                 badge={pendingAgreements}
//                                 badgeColor="warning"
//                             />
//
//                             {/* Billing Section - Only show if there are outstanding fees */}
//                             {outstandingFees > 0 && (
//                                 <>
//                                     <li className="nav-header">
//                                         <i className="fas fa-credit-card mr-2"></i>
//                                         BILLING
//                                     </li>
//
//                                     <MenuItem
//                                         to={`/${SESSION.ROLE}/cancellation-fees`}
//                                         icon="fas fa-exclamation-triangle"
//                                         label="Cancellation Fees"
//                                         badge={outstandingFees}
//                                         badgeColor="warning"
//                                     />
//                                 </>
//                             )}
//
//                             {/* Communication Section */}
//                             <li className="nav-header">
//                                 <i className="fas fa-comments mr-2"></i>
//                                 COMMUNICATION
//                             </li>
//
//                             <MenuItem
//                                 to={`/${SESSION.ROLE}/messaging`}
//                                 icon="fas fa-envelope"
//                                 label="Messages"
//                                 badge={unreadMessages}
//                             />
//                             <MenuItem to={`/${SESSION.ROLE}/notifications`} icon="fas fa-bell" label="Notifications" />
//                         </ul>
//                     </nav>
//                 </div>
//
//                 {/* Bottom Accent */}
//                 <div className="sidebar-footer-accent">
//                     <div className="accent-line"></div>
//                 </div>
//
//             <style jsx>{`
//                 /* Professional Theme Colors - Blue/Purple gradient */
//                 :root {
//                     --pro-primary: #6366f1;
//                     --pro-primary-dark: #4f46e5;
//                     --pro-secondary: #0f172a;
//                     --pro-accent: #8b5cf6;
//                     --pro-light: #f5f3ff;
//                     --pro-success: #10b981;
//                     --pro-danger: #ef4444;
//                     --pro-warning: #f59e0b;
//                     --pro-info: #06b6d4;
//                 }
//
//                 .professional-sidebar {
//                     background: linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%) !important;
//                     border-right: none !important;
//                     box-shadow: 4px 0 25px rgba(99, 102, 241, 0.15) !important;
//                 }
//
//                 /* Brand Section */
//                 .brand-link {
//                     display: flex !important;
//                     align-items: center !important;
//                     min-height: 60px !important;
//                     padding: 0 1rem !important;
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
//                     border-bottom: none !important;
//                     text-decoration: none !important;
//                     position: relative;
//                     overflow: hidden;
//                 }
//
//                 .brand-link::after {
//                     content: '';
//                     position: absolute;
//                     top: 0;
//                     left: -100%;
//                     width: 100%;
//                     height: 100%;
//                     background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
//                     transition: left 0.5s ease;
//                 }
//
//                 .brand-link:hover::after {
//                     left: 100%;
//                 }
//
//                 .brand-logo-wrapper {
//                     display: flex;
//                     align-items: center;
//                     gap: 0.75rem;
//                     position: relative;
//                     z-index: 1;
//                 }
//
//                 .brand-icon {
//                     width: 42px;
//                     height: 42px;
//                     background: rgba(255, 255, 255, 0.2);
//                     border-radius: 12px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     font-size: 1.25rem;
//                     color: white;
//                     backdrop-filter: blur(10px);
//                     transition: transform 0.3s ease;
//                 }
//
//                 .brand-link:hover .brand-icon {
//                     transform: scale(1.05) rotate(5deg);
//                 }
//
//                 .brand-text-wrapper {
//                     display: flex;
//                     flex-direction: column;
//                 }
//
//                 .brand-text {
//                     font-size: 1.25rem;
//                     font-weight: 700;
//                     color: white !important;
//                     letter-spacing: 0.5px;
//                     line-height: 1.2;
//                 }
//
//                 .brand-tagline {
//                     font-size: 0.7rem;
//                     color: rgba(255, 255, 255, 0.8);
//                     font-weight: 400;
//                     letter-spacing: 0.3px;
//                 }
//
//                 /* Navigation */
//                 .sidebar-nav {
//                     padding: 0.25rem 0;
//                 }
//
//                 .nav-header {
//                     color: rgba(255, 255, 255, 0.4) !important;
//                     font-size: 0.65rem !important;
//                     font-weight: 700 !important;
//                     letter-spacing: 1px !important;
//                     padding: 0.75rem 1rem 0.35rem !important;
//                     margin-top: 0.75rem !important;
//                     text-transform: uppercase !important;
//                     display: flex !important;
//                     align-items: center !important;
//                 }
//
//                 .nav-header i {
//                     font-size: 0.6rem;
//                     opacity: 0.6;
//                 }
//
//                 .nav-sidebar .nav-item {
//                     margin: 2px 0.75rem;
//                 }
//
//                 .nav-sidebar .nav-link {
//                     color: rgba(255, 255, 255, 0.75) !important;
//                     padding: 0.6rem 0.875rem !important;
//                     border-radius: 10px !important;
//                     transition: all 0.25s ease !important;
//                     display: flex !important;
//                     align-items: center !important;
//                     font-size: 0.8rem !important;
//                     font-weight: 500 !important;
//                     position: relative;
//                     overflow: hidden;
//                 }
//
//                 .nav-sidebar .nav-link::before {
//                     content: '';
//                     position: absolute;
//                     left: 0;
//                     top: 0;
//                     bottom: 0;
//                     width: 3px;
//                     background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
//                     transform: scaleY(0);
//                     transition: transform 0.25s ease;
//                     border-radius: 0 2px 2px 0;
//                 }
//
//                 .nav-sidebar .nav-link:hover {
//                     background: rgba(255, 255, 255, 0.08) !important;
//                     color: white !important;
//                     transform: translateX(4px);
//                 }
//
//                 .nav-sidebar .nav-link:hover::before {
//                     transform: scaleY(1);
//                 }
//
//                 .nav-sidebar .nav-link.active {
//                     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
//                     color: white !important;
//                     box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4) !important;
//                     transform: translateX(0);
//                 }
//
//                 .nav-sidebar .nav-link.active::before {
//                     transform: scaleY(0);
//                 }
//
//                 .nav-sidebar .nav-link .nav-icon {
//                     width: 20px;
//                     margin-right: 0.625rem;
//                     font-size: 0.9rem;
//                     text-align: center;
//                     color: rgba(255, 255, 255, 0.6);
//                     transition: all 0.25s ease;
//                 }
//
//                 .nav-sidebar .nav-link:hover .nav-icon,
//                 .nav-sidebar .nav-link.active .nav-icon {
//                     color: white !important;
//                 }
//
//                 .nav-sidebar .nav-link p {
//                     margin: 0 !important;
//                     flex: 1;
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                 }
//
//                 /* Badges */
//                 .sidebar-badge {
//                     font-size: 0.6rem;
//                     font-weight: 700;
//                     padding: 0.2rem 0.5rem;
//                     border-radius: 20px;
//                     min-width: 20px;
//                     text-align: center;
//                     animation: badge-pulse 2s infinite;
//                 }
//
//                 .sidebar-badge.danger {
//                     background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
//                     color: white;
//                     box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
//                 }
//
//                 .sidebar-badge.warning {
//                     background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
//                     color: white;
//                     box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
//                 }
//
//                 .sidebar-badge.info {
//                     background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
//                     color: white;
//                     box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
//                 }
//
//                 @keyframes badge-pulse {
//                     0%, 100% { transform: scale(1); }
//                     50% { transform: scale(1.05); }
//                 }
//
//                 /* Sidebar Content */
//                 .sidebar {
//                     overflow-x: hidden !important;
//                     overflow-y: auto !important;
//                     padding-bottom: 1rem;
//                 }
//
//                 @media (min-width: 992px) {
//                     .sidebar {
//                         scrollbar-width: none;
//                         -ms-overflow-style: none;
//                     }
//
//                     .sidebar::-webkit-scrollbar {
//                         display: none;
//                     }
//                 }
//
//                 /* Footer Accent */
//                 .sidebar-footer-accent {
//                     position: absolute;
//                     bottom: 0;
//                     left: 0;
//                     right: 0;
//                     height: 4px;
//                     z-index: 10;
//                 }
//
//                 .accent-line {
//                     height: 3px;
//                     background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
//                     box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
//                 }
//
//                 /* Main Sidebar */
//                 .main-sidebar {
//                     position: fixed;
//                     top: 0;
//                     left: 0;
//                     height: 100vh;
//                     max-height: 100vh;
//                     z-index: 1038;
//                     overflow: hidden !important;
//                     display: flex;
//                     flex-direction: column;
//                 }
//
//                 .main-sidebar .sidebar {
//                     flex: 1;
//                     min-height: 0;
//                 }
//
//                 /* Desktop Sidebar Width */
//                 @media (min-width: 992px) {
//                     .main-sidebar.professional-sidebar {
//                         width: 250px;
//                         transition: width 0.3s ease-in-out, margin-left 0.3s ease-in-out;
//                     }
//                 }
//
//                 /* Collapsed State - Using AdminLTE standard class */
//                 body.sidebar-collapse .main-sidebar.professional-sidebar {
//                     width: 4.6rem !important;
//                     margin-left: 0 !important;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .brand-text-wrapper {
//                     display: none !important;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .brand-link {
//                     justify-content: center;
//                     padding: 0 0.5rem !important;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .brand-icon {
//                     width: 34px;
//                     height: 34px;
//                     font-size: 1rem;
//                     border-radius: 8px;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .nav-header {
//                     display: none !important;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .nav-sidebar .nav-link p {
//                     display: none !important;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .nav-sidebar .nav-link {
//                     justify-content: center;
//                     padding: 0.65rem !important;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .nav-sidebar .nav-link .nav-icon {
//                     margin-right: 0;
//                     font-size: 1rem;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .nav-sidebar .nav-item {
//                     margin: 2px 0.5rem;
//                 }
//
//                 body.sidebar-collapse .professional-sidebar .nav-sidebar .nav-link::before {
//                     display: none;
//                 }
//
//                 /* Mobile Overlay */
//                 .sidebar-overlay {
//                     position: fixed;
//                     top: 0;
//                     left: 0;
//                     right: 0;
//                     bottom: 0;
//                     background: rgba(15, 23, 42, 0.7);
//                     backdrop-filter: blur(4px);
//                     z-index: 1039;
//                     opacity: 0;
//                     visibility: hidden;
//                     transition: all 0.3s ease;
//                 }
//
//                 .sidebar-overlay.active {
//                     opacity: 1;
//                     visibility: visible;
//                 }
//
//                 /* Mobile Close Button */
//                 .sidebar-close-btn {
//                     position: absolute;
//                     top: 12px;
//                     right: 12px;
//                     width: 36px;
//                     height: 36px;
//                     border: none;
//                     background: rgba(255, 255, 255, 0.15);
//                     border-radius: 10px;
//                     color: white;
//                     font-size: 1.1rem;
//                     cursor: pointer;
//                     z-index: 10;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     transition: all 0.2s ease;
//                 }
//
//                 .sidebar-close-btn:hover {
//                     background: rgba(255, 255, 255, 0.25);
//                     transform: scale(1.05);
//                 }
//
//                 /* Mobile Sidebar */
//                 @media (max-width: 991.98px) {
//                     .professional-sidebar {
//                         position: fixed !important;
//                         top: 0;
//                         left: 0;
//                         width: 280px !important;
//                         height: 100vh !important;
//                         z-index: 1040 !important;
//                         transform: translateX(-100%);
//                         transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//                         box-shadow: none !important;
//                     }
//
//                     .professional-sidebar.mobile-open {
//                         transform: translateX(0);
//                         box-shadow: 10px 0 40px rgba(99, 102, 241, 0.3) !important;
//                     }
//
//                     body:not(.sidebar-open) .main-sidebar {
//                         margin-left: 0 !important;
//                     }
//
//                     body.sidebar-mobile-open {
//                         overflow: hidden;
//                     }
//
//                     .sidebar {
//                         height: calc(100vh - 60px - 4px) !important;
//                         overflow-y: auto !important;
//                         -webkit-overflow-scrolling: touch;
//                     }
//
//                     .nav-sidebar .nav-link {
//                         padding: 0.75rem 1rem !important;
//                         min-height: 48px;
//                     }
//
//                     .nav-header {
//                         padding: 1rem 1rem 0.4rem !important;
//                     }
//
//                     .brand-link {
//                         padding-right: 50px !important;
//                     }
//                 }
//
//                 @media (min-width: 768px) and (max-width: 991.98px) {
//                     .professional-sidebar {
//                         width: 300px !important;
//                     }
//                 }
//
//                 @media (max-width: 575.98px) {
//                     .professional-sidebar {
//                         width: 85vw !important;
//                         max-width: 300px;
//                     }
//
//                     .brand-text {
//                         font-size: 1.1rem !important;
//                     }
//
//                     .brand-tagline {
//                         font-size: 0.65rem !important;
//                     }
//
//                     .nav-sidebar .nav-link {
//                         font-size: 0.85rem !important;
//                     }
//                 }
//
//                 @supports (padding-top: env(safe-area-inset-top)) {
//                     @media (max-width: 991.98px) {
//                         .professional-sidebar {
//                             padding-top: env(safe-area-inset-top);
//                             padding-bottom: env(safe-area-inset-bottom);
//                         }
//                     }
//                 }
//
//                 @media (max-width: 991.98px) {
//                     .sidebar::-webkit-scrollbar {
//                         width: 4px;
//                     }
//
//                     .sidebar::-webkit-scrollbar-track {
//                         background: rgba(255, 255, 255, 0.05);
//                     }
//
//                     .sidebar::-webkit-scrollbar-thumb {
//                         background: rgba(255, 255, 255, 0.2);
//                         border-radius: 4px;
//                     }
//
//                     .professional-sidebar.mobile-open .nav-item {
//                         animation: slideInLeft 0.3s ease forwards;
//                         opacity: 0;
//                     }
//
//                     .professional-sidebar.mobile-open .nav-item:nth-child(1) { animation-delay: 0.05s; }
//                     .professional-sidebar.mobile-open .nav-item:nth-child(2) { animation-delay: 0.1s; }
//                     .professional-sidebar.mobile-open .nav-item:nth-child(3) { animation-delay: 0.15s; }
//                     .professional-sidebar.mobile-open .nav-item:nth-child(4) { animation-delay: 0.2s; }
//                     .professional-sidebar.mobile-open .nav-item:nth-child(5) { animation-delay: 0.25s; }
//                     .professional-sidebar.mobile-open .nav-item:nth-child(6) { animation-delay: 0.3s; }
//                     .professional-sidebar.mobile-open .nav-item:nth-child(7) { animation-delay: 0.35s; }
//                     .professional-sidebar.mobile-open .nav-item:nth-child(8) { animation-delay: 0.4s; }
//                     .professional-sidebar.mobile-open .nav-item:nth-child(n+9) { animation-delay: 0.45s; }
//
//                     @keyframes slideInLeft {
//                         from {
//                             opacity: 0;
//                             transform: translateX(-20px);
//                         }
//                         to {
//                             opacity: 1;
//                             transform: translateX(0);
//                         }
//                     }
//                 }
//             `}</style>
//         </aside>
//         </>
//     );
// }
//
// export default Sidebar;
