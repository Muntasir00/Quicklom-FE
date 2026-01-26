import React, { useState } from "react";
import { Link } from "react-router-dom";

const AdminContactsSidebar = ({
    contacts,
    searchQuery,
    setSearchQuery,
    SESSION_USER_ROLE,
    SESSION_USER_ID,
    setValue,
    currentReceiverId,
    messages = [],
    conversationPairs = [],
    viewMode,
    user1Id,
    user2Id,
}) => {
    const [activeFilter, setActiveFilter] = useState("all"); // all, my-chats, monitoring

    /**
     * Calculate unread count per contact (for admin's own messages)
     */
    const getUnreadCount = (contactId) => {
        if (!Array.isArray(messages)) return 0;

        return messages.filter(
            msg =>
                msg.sender_id == contactId &&
                msg.receiver_id == SESSION_USER_ID &&
                msg.status === false
        ).length;
    };

    /**
     * Get last message for each contact (admin's conversations)
     */
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

    // Filter contacts based on search (excluding self)
    const filteredContacts = Array.isArray(contacts)
        ? contacts.filter(contact => {
            if (contact.id === SESSION_USER_ID) return false;
            return contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   contact?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        })
        : [];

    // Filter conversation pairs based on search
    const filteredConversationPairs = Array.isArray(conversationPairs)
        ? conversationPairs.filter(pair => {
            const user1Name = pair.user1?.name?.toLowerCase() || "";
            const user2Name = pair.user2?.name?.toLowerCase() || "";
            const query = searchQuery.toLowerCase();
            return user1Name.includes(query) || user2Name.includes(query);
        })
        : [];

    const sortContacts = (contactsList) => {
        return contactsList.sort((a, b) => {
            const aUnread = getUnreadCount(a.id);
            const bUnread = getUnreadCount(b.id);

            if (aUnread > 0 && bUnread === 0) return -1;
            if (aUnread === 0 && bUnread > 0) return 1;

            const aLastMsg = getLastMessage(a.id);
            const bLastMsg = getLastMessage(b.id);

            if (!aLastMsg && !bLastMsg) return 0;
            if (!aLastMsg) return 1;
            if (!bLastMsg) return -1;

            return new Date(bLastMsg.created_at) - new Date(aLastMsg.created_at);
        });
    };

    const sortedContacts = sortContacts(filteredContacts);

    // Calculate unread counts
    const myChatsUnreadCount = filteredContacts.reduce((total, contact) =>
        total + getUnreadCount(contact.id), 0
    );

    /**
     * Render individual contact item (admin's direct chats)
     */
    const renderContactItem = (contact) => {
        const unreadCount = getUnreadCount(contact.id);
        const lastMessage = getLastMessage(contact.id);
        const isActive = currentReceiverId == contact.id && !user1Id && !user2Id;

        return (
            <Link
                key={contact.id}
                to={`/${SESSION_USER_ROLE}/messaging/user/${contact.id}/create`}
                className={`contact-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => {
                    try {
                        const userRole = contact?.role?.name ? contact.role.name.toLowerCase() : "";
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
                    <img
                        src="/assets/dist/img/user.png"
                        alt="Avatar"
                        className="contact-avatar"
                    />
                    {contact.status && (
                        <span className="status-indicator online"></span>
                    )}
                </div>

                <div className="contact-info">
                    <div className="contact-header-row">
                        <h6 className={`contact-name mb-0 ${unreadCount > 0 ? 'font-weight-bold' : ''}`}>
                            {contact?.name || "Unknown"}
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
                                <span className="text-muted">{contact?.role?.name || "User"}</span>
                            )}
                        </p>
                        {unreadCount > 0 && (
                            <span className="unread-badge">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        );
    };

    /**
     * Render conversation pair item (monitoring view)
     */
    const renderConversationPair = (pair) => {
        const isActive = (user1Id == pair.user1_id && user2Id == pair.user2_id) ||
                        (user1Id == pair.user2_id && user2Id == pair.user1_id);
        const lastMessage = pair.lastMessage;

        return (
            <Link
                key={`${pair.user1_id}-${pair.user2_id}`}
                to={`/${SESSION_USER_ROLE}/messaging/monitor/${pair.user1_id}/${pair.user2_id}`}
                className={`contact-item monitor-item ${isActive ? 'active' : ''}`}
            >
                <div className="monitor-avatar-group">
                    <img
                        src="/assets/dist/img/user.png"
                        alt="User 1"
                        className="monitor-avatar monitor-avatar-1"
                    />
                    <img
                        src="/assets/dist/img/user.png"
                        alt="User 2"
                        className="monitor-avatar monitor-avatar-2"
                    />
                </div>

                <div className="contact-info">
                    <div className="contact-header-row">
                        <h6 className="contact-name mb-0">
                            {pair.user1?.name || "User"} ↔ {pair.user2?.name || "User"}
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

                    <div className="contact-message-row">
                        <p className="contact-last-message mb-0">
                            {lastMessage ? (
                                <>
                                    <strong>{lastMessage.sender?.name?.split(' ')[0]}:</strong>{" "}
                                    {lastMessage.body?.substring(0, 25) || "Attachment"}
                                    {lastMessage.body?.length > 25 && "..."}
                                </>
                            ) : (
                                <span className="text-muted">No messages yet</span>
                            )}
                        </p>
                        <span className="badge badge-warning badge-sm">
                            <i className="fas fa-eye"></i>
                        </span>
                    </div>
                </div>
            </Link>
        );
    };

    // Determine what to show based on filter
    const showMyChats = activeFilter === "all" || activeFilter === "my-chats";
    const showMonitoring = activeFilter === "all" || activeFilter === "monitoring";

    return (
        <div className="contacts-sidebar">
            {/* Sidebar Header */}
            <div className="contacts-header">
                <h5 className="mb-0">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Admin Messages
                </h5>
            </div>

            {/* Filter Pills */}
            <div className="filter-pills">
                <button
                    className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-pill ${activeFilter === 'my-chats' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('my-chats')}
                >
                    <i className="fas fa-user mr-1"></i>
                    My Chats
                    {myChatsUnreadCount > 0 && (
                        <span className="pill-badge">{myChatsUnreadCount}</span>
                    )}
                </button>
                <button
                    className={`filter-pill ${activeFilter === 'monitoring' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('monitoring')}
                >
                    <i className="fas fa-eye mr-1"></i>
                    Monitor
                    <span className="pill-badge-info">{filteredConversationPairs.length}</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="contacts-search">
                <div className="search-input-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search conversations..."
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

            {/* Contacts List */}
            <div className="contacts-list-wrapper">
                {/* My Chats Section */}
                {showMyChats && sortedContacts.length > 0 && (
                    <div className="contacts-section">
                        {activeFilter === 'all' && (
                            <div className="section-divider">
                                <span className="divider-text">
                                    <i className="fas fa-user mr-2"></i>
                                    My Direct Chats
                                </span>
                            </div>
                        )}
                        {sortedContacts.map(contact => renderContactItem(contact))}
                    </div>
                )}

                {/* Monitoring Section */}
                {showMonitoring && filteredConversationPairs.length > 0 && (
                    <div className="contacts-section">
                        {activeFilter === 'all' && sortedContacts.length > 0 && (
                            <div className="section-divider">
                                <span className="divider-text">
                                    <i className="fas fa-eye mr-2"></i>
                                    User Conversations
                                </span>
                            </div>
                        )}
                        {filteredConversationPairs.map(pair => renderConversationPair(pair))}
                    </div>
                )}

                {/* Empty State */}
                {(
                    (showMyChats && sortedContacts.length === 0 && showMonitoring && filteredConversationPairs.length === 0) ||
                    (activeFilter === 'my-chats' && sortedContacts.length === 0) ||
                    (activeFilter === 'monitoring' && filteredConversationPairs.length === 0)
                ) && (
                    <div className="empty-state">
                        <i className="fas fa-inbox fa-3x mb-3"></i>
                        <p className="mb-1">
                            {searchQuery ? "No matches found" :
                             activeFilter === 'my-chats' ? "No direct chats yet" :
                             activeFilter === 'monitoring' ? "No user conversations to monitor" :
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

export default AdminContactsSidebar;