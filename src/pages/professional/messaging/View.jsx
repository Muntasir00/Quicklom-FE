import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useViewMessaging } from "@hooks/professional/messaging/useViewMessaging";
import { deleteMessageService } from "@services/institute/MessagingService";

const View = () => {
    const {
        navigate,
        SESSION_USER_ROLE,
        rows,
        SESSION_USER_ID,
    } = useViewMessaging();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [selectedMessageId, setSelectedMessageId] = useState(null);

    const filteredMessages = useMemo(() => {
        let filtered = rows;
        if (activeTab === "unread") filtered = filtered.filter(m => !m.status);
        else if (activeTab === "read") filtered = filtered.filter(m => m.status);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.sender?.name?.toLowerCase().includes(q) ||
                m.receiver?.name?.toLowerCase().includes(q) ||
                m.subject?.toLowerCase().includes(q) ||
                m.body?.toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [rows, activeTab, searchQuery]);

    const stats = useMemo(() => ({
        total: rows.length,
        unread: rows.filter(m => !m.status).length
    }), [rows]);

    const selectedMessage = filteredMessages.find(m => m.id === selectedMessageId);

    const formatTime = (d) => {
        if (!d) return "";
        const date = new Date(d);
        const now = new Date();
        const diff = Math.floor((now - date) / 86400000);
        if (diff === 0) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatFull = (d) => d ? new Date(d).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : "";

    const openChat = (m) => {
        const userId = m.sender_id == SESSION_USER_ID ? m.receiver_id : m.sender_id;
        if (m.id && userId) navigate(`/${SESSION_USER_ROLE}/messaging/${m.id}/user/${userId}/edit`);
    };

    const deleteMsg = async (e, id) => {
        e.stopPropagation();
        if (confirm("Delete this message?")) {
            await deleteMessageService({ messageId: id });
            location.reload();
        }
    };

    const other = (m) => m.sender_id == SESSION_USER_ID
        ? { name: m.receiver?.name, dir: 'To' }
        : { name: m.sender?.name, dir: 'From' };

    const initials = (n) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : "?";

    // Purple/Indigo gradients for professional theme
    const gradient = (n) => {
        const g = [
            ['#6366f1', '#4f46e5'], // Indigo
            ['#8b5cf6', '#7c3aed'], // Violet
            ['#a855f7', '#9333ea'], // Purple
            ['#ec4899', '#db2777'], // Pink
            ['#3b82f6', '#2563eb'], // Blue
            ['#10b981', '#059669']  // Emerald
        ];
        return g[n ? n.charCodeAt(0) % g.length : 0];
    };

    return (
        <div className=" ">
            <style>{`
                /* Professional Messaging Page Layout */
                .pro-msg-page {
                    background: linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%) !important;
                    min-height: calc(100vh - 120px) !important;
                    padding: 0 !important;
                    display: flex;
                    flex-direction: column;
                }

                .pro-msg-container {
                    flex: 1;
                    display: flex;
                    background: transparent;
                    overflow: hidden;
                    height: calc(100vh - 120px);
                    min-height: 500px;
                }

                /* Sidebar */
                .pro-msg-sidebar {
                    width: 380px;
                    background: white;
                    border-right: 1px solid #e9d5ff;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 2px 0 15px rgba(99, 102, 241, 0.05);
                }

                .pro-msg-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%);
                    position: relative;
                    overflow: hidden;
                }

                .pro-msg-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .pro-msg-header-content {
                    position: relative;
                    z-index: 1;
                }

                .pro-msg-header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .pro-msg-header-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .pro-msg-header-icon {
                    width: 44px;
                    height: 44px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.1rem;
                }

                .pro-msg-header-text h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                }

                .pro-msg-header-text span {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .pro-msg-compose {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    transition: all 0.25s ease;
                }

                .pro-msg-compose:hover {
                    background: rgba(255, 255, 255, 0.3);
                    color: white;
                    transform: translateY(-2px);
                }

                .pro-msg-search {
                    position: relative;
                }

                .pro-msg-search input {
                    width: 100%;
                    padding: 12px 16px 12px 44px;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    color: white;
                    transition: all 0.25s ease;
                }

                .pro-msg-search input::placeholder {
                    color: rgba(255, 255, 255, 0.6);
                }

                .pro-msg-search input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.25);
                }

                .pro-msg-search i {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                }

                .pro-msg-tabs {
                    display: flex;
                    gap: 6px;
                    padding: 16px 20px;
                    background: #faf5ff;
                    border-bottom: 1px solid #e9d5ff;
                }

                .pro-msg-tab {
                    flex: 1;
                    padding: 10px 12px;
                    border: none;
                    background: white;
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid #e9d5ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .pro-msg-tab:hover {
                    background: #f3e8ff;
                    border-color: #c4b5fd;
                }

                .pro-msg-tab.active {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .pro-msg-tab-count {
                    background: rgba(255, 255, 255, 0.25);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .pro-msg-tab:not(.active) .pro-msg-tab-count {
                    background: #e9d5ff;
                    color: #7c3aed;
                }

                .pro-msg-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .pro-msg-list::-webkit-scrollbar {
                    width: 6px;
                }

                .pro-msg-list::-webkit-scrollbar-track {
                    background: #faf5ff;
                }

                .pro-msg-list::-webkit-scrollbar-thumb {
                    background: #c4b5fd;
                    border-radius: 3px;
                }

                .pro-msg-list::-webkit-scrollbar-thumb:hover {
                    background: #a78bfa;
                }

                .pro-msg-empty-list {
                    padding: 60px 40px;
                    text-align: center;
                    color: #94a3b8;
                }

                .pro-msg-empty-list-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                }

                .pro-msg-empty-list-icon i {
                    font-size: 32px;
                    color: #6366f1;
                }

                .pro-msg-empty-list h4 {
                    font-size: 1rem;
                    color: #475569;
                    margin: 0 0 4px;
                }

                .pro-msg-empty-list p {
                    font-size: 0.85rem;
                    margin: 0;
                }

                .pro-msg-item {
                    display: flex;
                    gap: 14px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #f3e8ff;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    position: relative;
                }

                .pro-msg-item:hover {
                    background: #faf5ff;
                }

                .pro-msg-item.selected {
                    background: linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%);
                    border-left: 3px solid #6366f1;
                    padding-left: 17px;
                }

                .pro-msg-item.unread {
                    background: linear-gradient(90deg, rgba(99, 102, 241, 0.04) 0%, transparent 100%);
                }

                .pro-msg-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    flex-shrink: 0;
                    position: relative;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .pro-msg-unread-dot {
                    position: absolute;
                    top: -3px;
                    right: -3px;
                    width: 14px;
                    height: 14px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
                }

                .pro-msg-content {
                    flex: 1;
                    min-width: 0;
                }

                .pro-msg-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .pro-msg-name {
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: #1e293b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pro-msg-name.unread {
                    font-weight: 700;
                    color: #0f172a;
                }

                .pro-msg-time {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    flex-shrink: 0;
                    margin-left: 10px;
                    font-weight: 500;
                }

                .pro-msg-time.unread {
                    color: #6366f1;
                    font-weight: 600;
                }

                .pro-msg-subject {
                    font-size: 0.85rem;
                    color: #475569;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pro-msg-subject.unread {
                    font-weight: 600;
                    color: #1e293b;
                }

                .pro-msg-preview {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Detail Panel */
                .pro-msg-detail {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background: #faf5ff;
                }

                .pro-msg-detail-header {
                    padding: 24px 28px;
                    background: white;
                    border-bottom: 1px solid #e9d5ff;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                }

                .pro-msg-detail-info {
                    display: flex;
                    gap: 16px;
                    flex: 1;
                    align-items: flex-start;
                }

                .pro-msg-detail-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
                }

                .pro-msg-detail-meta {
                    flex: 1;
                    min-width: 0;
                }

                .pro-msg-detail-meta h3 {
                    margin: 0 0 8px;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .pro-msg-detail-sender {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .pro-msg-detail-sender-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #6366f1;
                    border: 1px solid #c4b5fd;
                }

                .pro-msg-detail-date {
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .pro-msg-actions {
                    display: flex;
                    gap: 10px;
                }

                .pro-msg-btn {
                    padding: 10px 20px;
                    border-radius: 10px;
                    border: none;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }

                .pro-msg-btn.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .pro-msg-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }

                .pro-msg-btn.danger {
                    background: #fef2f2;
                    color: #ef4444;
                    border: 1px solid #fecaca;
                }

                .pro-msg-btn.danger:hover {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                }

                .pro-msg-detail-body {
                    flex: 1;
                    padding: 28px;
                    overflow-y: auto;
                }

                .pro-msg-body-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    font-size: 0.95rem;
                    line-height: 1.7;
                    color: #374151;
                    white-space: pre-wrap;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                    border: 1px solid #e9d5ff;
                }

                .pro-msg-detail-footer {
                    padding: 20px 28px;
                    background: white;
                    border-top: 1px solid #e9d5ff;
                }

                .pro-msg-reply-btn {
                    width: 100%;
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: 2px dashed #c4b5fd;
                    background: #faf5ff;
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.2s ease;
                }

                .pro-msg-reply-btn:hover {
                    border-color: #6366f1;
                    color: #6366f1;
                    background: #f5f3ff;
                }

                .pro-msg-reply-btn i {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.85rem;
                }

                /* Empty State */
                .pro-msg-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    background: linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%);
                }

                .pro-msg-empty-icon {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.15) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
                }

                .pro-msg-empty-icon i {
                    font-size: 40px;
                    color: #6366f1;
                }

                .pro-msg-empty h4 {
                    margin: 0 0 8px;
                    font-size: 1.25rem;
                    color: #1e293b;
                    font-weight: 700;
                }

                .pro-msg-empty p {
                    margin: 0 0 24px;
                    font-size: 0.95rem;
                    color: #64748b;
                }

                .pro-msg-new-btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
                    transition: all 0.25s ease;
                }

                .pro-msg-new-btn:hover {
                    color: white;
                    text-decoration: none;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(99, 102, 241, 0.4);
                }

                /* Back button for mobile */
                .pro-msg-back-btn {
                    display: none;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.15);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-right: 16px;
                    transition: all 0.2s ease;
                }

                .pro-msg-back-btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .pro-msg-sidebar {
                        width: 340px;
                    }
                }

                @media (max-width: 992px) {
                    .pro-msg-sidebar {
                        width: 100%;
                        max-width: 380px;
                    }

                    .pro-msg-detail {
                        display: none;
                    }

                    .pro-msg-container.has-selected .pro-msg-sidebar {
                        display: none;
                    }

                    .pro-msg-container.has-selected .pro-msg-detail {
                        display: flex;
                    }

                    .pro-msg-container.has-selected .pro-msg-back-btn {
                        display: flex;
                    }
                }

                @media (max-width: 768px) {
                    .pro-msg-page {
                        min-height: calc(100vh - 100px) !important;
                    }

                    .pro-msg-container {
                        height: auto;
                        min-height: calc(100vh - 100px);
                        flex-direction: column;
                    }

                    .pro-msg-sidebar {
                        max-width: 100%;
                        height: auto;
                        min-height: 400px;
                        flex: 1;
                    }

                    .pro-msg-header {
                        padding: 16px;
                    }

                    .pro-msg-tabs {
                        padding: 12px 16px;
                    }

                    .pro-msg-item {
                        padding: 14px 16px;
                    }

                    .pro-msg-detail-header {
                        padding: 16px;
                        flex-direction: column;
                    }

                    .pro-msg-actions {
                        width: 100%;
                    }

                    .pro-msg-btn {
                        flex: 1;
                        justify-content: center;
                    }

                    .pro-msg-detail-body {
                        padding: 16px;
                    }

                    .pro-msg-detail-footer {
                        padding: 16px;
                    }
                }
            `}</style>

            <div className={`pro-msg-container ${selectedMessageId ? 'has-selected' : ''}`}>
                {/* Sidebar */}
                <div className="pro-msg-sidebar">
                    <div className="pro-msg-header">
                        <div className="pro-msg-header-content">
                            <div className="pro-msg-header-top">
                                <div className="pro-msg-header-title">
                                    <div className="pro-msg-header-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div className="pro-msg-header-text">
                                        <h2>Messages</h2>
                                        <span>{stats.unread} unread message{stats.unread !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <Link to={`/${SESSION_USER_ROLE}/contacts`} className="pro-msg-compose" title="New message">
                                    <i className="fas fa-pen" style={{ fontSize: 14 }}></i>
                                </Link>
                            </div>
                            <div className="pro-msg-search">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pro-msg-tabs">
                        {[
                            { key: 'all', label: 'All', icon: 'fa-inbox', count: stats.total },
                            { key: 'unread', label: 'Unread', icon: 'fa-envelope', count: stats.unread },
                            { key: 'read', label: 'Read', icon: 'fa-envelope-open', count: stats.total - stats.unread }
                        ].map(t => (
                            <button
                                key={t.key}
                                className={`pro-msg-tab ${activeTab === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.key)}
                            >
                                <i className={`fas ${t.icon}`} style={{ fontSize: 11 }}></i>
                                {t.label}
                                {t.count > 0 && <span className="pro-msg-tab-count">{t.count}</span>}
                            </button>
                        ))}
                    </div>

                    <div className="pro-msg-list">
                        {filteredMessages.length === 0 ? (
                            <div className="pro-msg-empty-list">
                                <div className="pro-msg-empty-list-icon">
                                    <i className="fas fa-inbox"></i>
                                </div>
                                <h4>No messages</h4>
                                <p>{searchQuery ? 'No results found' : 'Your inbox is empty'}</p>
                            </div>
                        ) : filteredMessages.map(m => {
                            const o = other(m);
                            const unread = !m.status;
                            const sel = selectedMessageId === m.id;
                            const [c1, c2] = gradient(o.name);
                            return (
                                <div
                                    key={m.id}
                                    className={`pro-msg-item ${sel ? 'selected' : ''} ${unread ? 'unread' : ''}`}
                                    onClick={() => setSelectedMessageId(m.id)}
                                >
                                    <div className="pro-msg-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                        {initials(o.name)}
                                        {unread && <div className="pro-msg-unread-dot"></div>}
                                    </div>
                                    <div className="pro-msg-content">
                                        <div className="pro-msg-top">
                                            <span className={`pro-msg-name ${unread ? 'unread' : ''}`}>{o.name || 'Unknown'}</span>
                                            <span className={`pro-msg-time ${unread ? 'unread' : ''}`}>{formatTime(m.created_at)}</span>
                                        </div>
                                        <div className={`pro-msg-subject ${unread ? 'unread' : ''}`}>{m.subject || '(No subject)'}</div>
                                        <div className="pro-msg-preview">{m.body || '(No content)'}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detail */}
                <div className="pro-msg-detail">
                    {selectedMessage ? (() => {
                        const o = other(selectedMessage);
                        const [c1, c2] = gradient(o.name);
                        return (
                            <>
                                <div className="pro-msg-detail-header">
                                    <div className="pro-msg-detail-info">
                                        <button
                                            className="pro-msg-back-btn"
                                            onClick={() => setSelectedMessageId(null)}
                                        >
                                            <i className="fas fa-arrow-left"></i>
                                            Back
                                        </button>
                                        <div className="pro-msg-detail-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                            {initials(o.name)}
                                        </div>
                                        <div className="pro-msg-detail-meta">
                                            <h3>{selectedMessage.subject || '(No subject)'}</h3>
                                            <div className="pro-msg-detail-sender">
                                                <span className="pro-msg-detail-sender-badge">
                                                    <i className="fas fa-user" style={{ fontSize: 11 }}></i>
                                                    {o.dir}: {o.name}
                                                </span>
                                                <span className="pro-msg-detail-date">{formatFull(selectedMessage.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pro-msg-actions">
                                        <button className="pro-msg-btn primary" onClick={() => openChat(selectedMessage)}>
                                            <i className="fas fa-reply"></i> Reply
                                        </button>
                                        <button className="pro-msg-btn danger" onClick={(e) => deleteMsg(e, selectedMessage.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="pro-msg-detail-body">
                                    <div className="pro-msg-body-card">{selectedMessage.body || '(No content)'}</div>
                                </div>
                                <div className="pro-msg-detail-footer">
                                    <button className="pro-msg-reply-btn" onClick={() => openChat(selectedMessage)}>
                                        <i className="fas fa-pen"></i>
                                        <span>Click to reply to this message...</span>
                                    </button>
                                </div>
                            </>
                        );
                    })() : (
                        <div className="pro-msg-empty">
                            <div className="pro-msg-empty-icon"><i className="fas fa-envelope-open-text"></i></div>
                            <h4>Select a message</h4>
                            <p>Choose a conversation from the list to view details</p>
                            <Link to={`/${SESSION_USER_ROLE}/contacts`} className="pro-msg-new-btn">
                                <i className="fas fa-plus"></i> New Message
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default View;
