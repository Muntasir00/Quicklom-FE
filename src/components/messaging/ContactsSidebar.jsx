import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    getContactData,
    getActiveContracts,
    formatContractsDisplay,
    filterContactsBySearch,
    cleanContacts
} from "@utils/contactUtils";

const ContactsSidebar = ({
    contacts,
    searchQuery,
    setSearchQuery,
    SESSION_USER_ROLE,
    SESSION_USER_ID,
    setValue,
    currentReceiverId,
    messages = [],
}) => {
    const [activeFilter, setActiveFilter] = useState("all");

    const getUnreadCount = (contactId) => {
        if (!Array.isArray(messages)) return 0;
        return messages.filter(
            msg =>
                msg.sender_id == contactId &&
                msg.receiver_id == SESSION_USER_ID &&
                msg.status === false
        ).length;
    };

    const getLastMessage = (contactId) => {
        if (!Array.isArray(messages)) return null;
        const contactMessages = messages.filter(
            msg =>
                (msg.sender_id == contactId && msg.receiver_id == SESSION_USER_ID) ||
                (msg.sender_id == SESSION_USER_ID && msg.receiver_id == contactId)
        );
        if (contactMessages.length === 0) return null;
        const sortedMessages = contactMessages.sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );
        return sortedMessages[sortedMessages.length - 1];
    };

    const isSupportContact = (user) => {
        return user?.role?.name?.toLowerCase() === "admin";
    };

    const getContactType = (user) => {
        if (!user) return null;

        // Check if it's an institute - show specific category name
        if (user.institute_category) {
            return user.institute_category.name;
        }

        // Check if it's a professional - show professional role (General Dentist, Specialist Dentist, etc.)
        if (user.professional_role) {
            return user.professional_role.name;
        }

        // Fallback to professional category if no role
        if (user.professional_category) {
            return user.professional_category.name;
        }

        // Fallback to role name
        if (user.role) {
            return user.role.name;
        }

        return null;
    };

    const getContactTypeIcon = (user) => {
        if (!user) return "fa-user";

        const categoryName = user.institute_category?.name?.toLowerCase();
        const professionalCategoryName = user.professional_category?.name?.toLowerCase();

        // Institute categories
        if (categoryName?.includes("clinic") || categoryName?.includes("practice")) {
            return "fa-clinic-medical";
        }
        if (categoryName?.includes("pharmacy")) {
            return "fa-pills";
        }
        if (categoryName?.includes("agency") || categoryName?.includes("headhunter")) {
            return "fa-user-tie";
        }

        // Professional categories
        // 1: Nursing and Home Care
        if (professionalCategoryName?.includes("nursing") || professionalCategoryName?.includes("home care")) {
            return "fa-user-nurse";
        }
        // 2: General Medicine
        if (professionalCategoryName?.includes("medicine") || professionalCategoryName?.includes("general medicine")) {
            return "fa-user-md";
        }
        // 3: Dental Care
        if (professionalCategoryName?.includes("dental")) {
            return "fa-tooth";
        }
        // 4: Pharmacy
        if (professionalCategoryName?.includes("pharmacy")) {
            return "fa-prescription-bottle";
        }

        return "fa-user";
    };

    // Clean and filter contacts
    const cleanedContacts = cleanContacts(contacts);
    const filteredContacts = filterContactsBySearch(cleanedContacts, searchQuery);

    // Separate support and regular contacts
    const supportContacts = filteredContacts.filter(contact => {
        const data = getContactData(contact);
        return data && isSupportContact(data.user);
    });

    const regularContacts = filteredContacts.filter(contact => {
        const data = getContactData(contact);
        return data && !isSupportContact(data.user);
    });

    const sortContacts = (contactsList) => {
        return contactsList.sort((a, b) => {
            const aData = getContactData(a);
            const bData = getContactData(b);

            const aUnread = aData ? getUnreadCount(aData.user.id) : 0;
            const bUnread = bData ? getUnreadCount(bData.user.id) : 0;

            if (aUnread > 0 && bUnread === 0) return -1;
            if (aUnread === 0 && bUnread > 0) return 1;

            const aLastMsg = aData ? getLastMessage(aData.user.id) : null;
            const bLastMsg = bData ? getLastMessage(bData.user.id) : null;

            if (!aLastMsg && !bLastMsg) return 0;
            if (!aLastMsg) return 1;
            if (!bLastMsg) return -1;

            return new Date(bLastMsg.created_at) - new Date(aLastMsg.created_at);
        });
    };

    const sortedSupportContacts = sortContacts(supportContacts);
    const sortedRegularContacts = sortContacts(regularContacts);

    const supportUnreadCount = sortedSupportContacts.reduce((total, contact) => {
        const data = getContactData(contact);
        return data ? total + getUnreadCount(data.user.id) : total;
    }, 0);

    const chatsUnreadCount = sortedRegularContacts.reduce((total, contact) => {
        const data = getContactData(contact);
        return data ? total + getUnreadCount(data.user.id) : total;
    }, 0);

    const renderContactItem = (contact, isSupport = false) => {
        const data = getContactData(contact);
        if (!data) return null;

        const { user } = data;

        const activeContracts = getActiveContracts(contact);
        const contractsDisplay = formatContractsDisplay(contact);
        const unreadCount = getUnreadCount(user.id);
        const lastMessage = getLastMessage(user.id);
        const isActive = currentReceiverId == user.id;

        return (
            <Link
                key={user.id}
                to={`/${SESSION_USER_ROLE}/messaging/user/${user.id}/create`}
                className={`contact-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''} ${isSupport ? 'support-contact' : ''}`}
                onClick={() => {
                    try {
                        const userRole = user?.role?.name ? user.role.name.toLowerCase() : "";
                        let subject = "general";
                        if (userRole === "admin") {
                            subject = "support";
                        } else if (userRole === "institute") {
                            subject = "institute";
                        } else {
                            subject = "contract";
                        }
                        setValue("subject", subject);
                    } catch (error) {
                        console.error("Error occurred", error);
                    }
                }}
            >
                <div className="contact-avatar-wrapper">
                    {isSupport ? (
                        <div className="support-avatar">
                            <i className="fas fa-headset"></i>
                        </div>
                    ) : (
                        <>
                            <img
                                src="/assets/dist/img/user.png"
                                alt="Avatar"
                                className="contact-avatar"
                            />
                            {user.status && (
                                <span className="status-indicator online"></span>
                            )}
                        </>
                    )}
                </div>

                <div className="contact-info">
                    <div className="contact-header-row">
                        <h6 className={`contact-name mb-0 ${unreadCount > 0 ? 'font-weight-bold' : ''}`}>
                            {user?.name || "Unknown"}
                        </h6>
                        {lastMessage && (
                            <small className="contact-time">
                                {(() => {
                                    const msgDate = new Date(lastMessage.created_at);
                                    const today = new Date();
                                    const yesterday = new Date(today);
                                    yesterday.setDate(yesterday.getDate() - 1);

                                    if (msgDate.toDateString() === today.toDateString()) {
                                        return msgDate.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                    } else if (msgDate.toDateString() === yesterday.toDateString()) {
                                        return "Yesterday";
                                    } else {
                                        return msgDate.toLocaleDateString([], {
                                            month: 'short',
                                            day: 'numeric'
                                        });
                                    }
                                })()}
                            </small>
                        )}
                    </div>

                    {/* Contact Type & Contracts Count - Compact row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {!isSupport && getContactType(user) && (
                            <div className="contact-type-badge">
                                <i className={`fas ${getContactTypeIcon(user)} mr-1`} style={{ fontSize: '10px' }}></i>
                                <small>{getContactType(user)}</small>
                            </div>
                        )}
                        {/* Contracts Count Badge */}
                        {activeContracts && activeContracts.length > 0 && (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.65rem',
                                color: 'white',
                                fontWeight: 600,
                            }}>
                                <i className="fas fa-file-contract" style={{ fontSize: '8px' }}></i>
                                <span>{activeContracts.length}</span>
                            </div>
                        )}
                    </div>

                    <div className="contact-message-row">
                        <p className={`contact-last-message mb-0 ${unreadCount > 0 ? 'font-weight-bold' : ''}`}>
                            {lastMessage ? (
                                <>
                                    {lastMessage.sender_id == SESSION_USER_ID && (
                                        <i className={`fas ${lastMessage.status ? 'fa-check-double text-primary' : 'fa-check text-muted'} mr-1`}></i>
                                    )}
                                    {lastMessage.body?.substring(0, 30) || "Attachment"}
                                    {lastMessage.body?.length > 30 && "..."}
                                </>
                            ) : (
                                <span className="text-muted">
                                    {isSupport ? "Support Team" : (contractsDisplay || user?.role?.name || "User")}
                                </span>
                            )}
                        </p>
                        {unreadCount > 0 && (
                            <span className={`unread-badge ${isSupport ? 'support-badge' : ''}`}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        );
    };

    const hasSupport = sortedSupportContacts.length > 0;
    const hasChats = sortedRegularContacts.length > 0;
    const showSupport = (activeFilter === "all" || activeFilter === "support") && hasSupport;
    const showChats = (activeFilter === "all" || activeFilter === "chats") && hasChats;

    return (
        <div className="contacts-sidebar">
            <div className="contacts-header">
                <h5 className="mb-0">Messages</h5>
            </div>

            <div className="filter-pills">
                <button
                    className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All
                    {(supportUnreadCount + chatsUnreadCount) > 0 && (
                        <span className="pill-badge">{supportUnreadCount + chatsUnreadCount}</span>
                    )}
                </button>
                <button
                    className={`filter-pill ${activeFilter === 'support' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('support')}
                >
                    <i className="fas fa-life-ring mr-1"></i>
                    Support
                    {supportUnreadCount > 0 && (
                        <span className="pill-badge support">{supportUnreadCount}</span>
                    )}
                </button>
                <button
                    className={`filter-pill ${activeFilter === 'chats' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('chats')}
                >
                    <i className="fas fa-comments mr-1"></i>
                    Chats
                    {chatsUnreadCount > 0 && (
                        <span className="pill-badge">{chatsUnreadCount}</span>
                    )}
                </button>
            </div>

            <div className="contacts-search">
                <div className="search-input-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="clear-search-btn"
                            onClick={() => setSearchQuery("")}
                            title="Clear search"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            <div className="contacts-list-wrapper">
                {showSupport && (
                    <div className="contacts-section">
                        {activeFilter === 'all' && hasChats && (
                            <div className="section-divider">
                                <span className="divider-text">
                                    <i className="fas fa-life-ring mr-2"></i>
                                    Support Team
                                </span>
                            </div>
                        )}
                        {sortedSupportContacts.map(contact => renderContactItem(contact, true))}
                    </div>
                )}

                {showChats && (
                    <div className="contacts-section">
                        {activeFilter === 'all' && hasSupport && (
                            <div className="section-divider">
                                <span className="divider-text">
                                    <i className="fas fa-comments mr-2"></i>
                                    Recent Chats
                                </span>
                            </div>
                        )}
                        {sortedRegularContacts.map(contact => renderContactItem(contact, false))}
                    </div>
                )}

                {!showSupport && !showChats && (
                    <div className="empty-state">
                        <i className="fas fa-inbox fa-3x mb-3"></i>
                        <p className="mb-1">
                            {searchQuery ? "No matches found" :
                             activeFilter === 'support' ? "No support conversations" :
                             activeFilter === 'chats' ? "No chat conversations" :
                             "No conversations yet"}
                        </p>
                        {searchQuery && (
                            <button
                                className="btn btn-sm btn-link"
                                onClick={() => setSearchQuery("")}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsSidebar;