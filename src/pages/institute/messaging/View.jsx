import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useViewMessaging } from "@hooks/institute/messaging/useViewMessaging";
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
        if (confirm("Delete?")) { await deleteMessageService({ messageId: id }); location.reload(); }
    };

    const other = (m) => m.sender_id == SESSION_USER_ID
        ? { name: m.receiver?.name, dir: 'To' }
        : { name: m.sender?.name, dir: 'From' };

    const initials = (n) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : "?";

    const gradient = (n) => {
        const g = [['#0d9488', '#0f766e'], ['#6366f1', '#4f46e5'], ['#ec4899', '#db2777'], ['#f59e0b', '#d97706'], ['#10b981', '#059669'], ['#3b82f6', '#2563eb']];
        return g[n ? n.charCodeAt(0) % g.length : 0];
    };

    return (
        <>
            <style>{`
                /* Healthcare Messaging Theme */
                .msg-container {
                    position: fixed;
                    top: 60px;
                    left: 250px;
                    right: 0;
                    bottom: 60px;
                    display: flex;
                    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                    overflow: hidden;
                    z-index: 100;
                }

                @media (max-width: 991.98px) {
                    .msg-container {
                        left: 0;
                    }
                }

                body.sidebar-collapse .msg-container {
                    left: 4.6rem;
                }

                /* Sidebar */
                .msg-sidebar {
                    width: 380px;
                    background: white;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.03);
                }

                .msg-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%);
                    position: relative;
                    overflow: hidden;
                }

                .msg-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .msg-header-content {
                    position: relative;
                    z-index: 1;
                }

                .msg-header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .msg-header-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .msg-header-icon {
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

                .msg-header-text h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                }

                .msg-header-text span {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .msg-compose {
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

                .msg-compose:hover {
                    background: rgba(255, 255, 255, 0.3);
                    color: white;
                    transform: translateY(-2px);
                }

                .msg-search {
                    position: relative;
                }

                .msg-search input {
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

                .msg-search input::placeholder {
                    color: rgba(255, 255, 255, 0.6);
                }

                .msg-search input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.25);
                }

                .msg-search i {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                }

                .msg-tabs {
                    display: flex;
                    gap: 6px;
                    padding: 16px 20px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }

                .msg-tab {
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
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .msg-tab:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }

                .msg-tab.active {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                }

                .msg-tab-count {
                    background: rgba(255, 255, 255, 0.25);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .msg-tab:not(.active) .msg-tab-count {
                    background: #e2e8f0;
                    color: #64748b;
                }

                .msg-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .msg-list::-webkit-scrollbar {
                    width: 6px;
                }

                .msg-list::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .msg-list::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .msg-list::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                .msg-empty-list {
                    padding: 60px 40px;
                    text-align: center;
                    color: #94a3b8;
                }

                .msg-empty-list-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(15, 118, 110, 0.1) 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                }

                .msg-empty-list-icon i {
                    font-size: 32px;
                    color: #0d9488;
                }

                .msg-empty-list h4 {
                    font-size: 1rem;
                    color: #475569;
                    margin: 0 0 4px;
                }

                .msg-empty-list p {
                    font-size: 0.85rem;
                    margin: 0;
                }

                .msg-item {
                    display: flex;
                    gap: 14px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    position: relative;
                }

                .msg-item:hover {
                    background: #f8fafc;
                }

                .msg-item.selected {
                    background: linear-gradient(90deg, rgba(13, 148, 136, 0.08) 0%, rgba(13, 148, 136, 0.02) 100%);
                    border-left: 3px solid #0d9488;
                    padding-left: 17px;
                }

                .msg-item.unread {
                    background: linear-gradient(90deg, rgba(13, 148, 136, 0.04) 0%, transparent 100%);
                }

                .msg-avatar {
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

                .msg-unread-dot {
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

                .msg-content {
                    flex: 1;
                    min-width: 0;
                }

                .msg-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .msg-name {
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: #1e293b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .msg-name.unread {
                    font-weight: 700;
                    color: #0f172a;
                }

                .msg-time {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    flex-shrink: 0;
                    margin-left: 10px;
                    font-weight: 500;
                }

                .msg-time.unread {
                    color: #0d9488;
                    font-weight: 600;
                }

                .msg-subject {
                    font-size: 0.85rem;
                    color: #475569;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .msg-subject.unread {
                    font-weight: 600;
                    color: #1e293b;
                }

                .msg-preview {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Detail Panel */
                .msg-detail {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background: #f8fafc;
                }

                .msg-detail-header {
                    padding: 24px 28px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                }

                .msg-detail-info {
                    display: flex;
                    gap: 16px;
                    flex: 1;
                    align-items: flex-start;
                }

                .msg-detail-avatar {
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

                .msg-detail-meta {
                    flex: 1;
                    min-width: 0;
                }

                .msg-detail-meta h3 {
                    margin: 0 0 8px;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .msg-detail-sender {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .msg-detail-sender-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #0d9488;
                    border: 1px solid #99f6e4;
                }

                .msg-detail-date {
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .msg-actions {
                    display: flex;
                    gap: 10px;
                }

                .msg-btn {
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

                .msg-btn.primary {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                }

                .msg-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
                }

                .msg-btn.danger {
                    background: #fef2f2;
                    color: #ef4444;
                    border: 1px solid #fecaca;
                }

                .msg-btn.danger:hover {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                }

                .msg-detail-body {
                    flex: 1;
                    padding: 28px;
                    overflow-y: auto;
                }

                .msg-body-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    font-size: 0.95rem;
                    line-height: 1.7;
                    color: #374151;
                    white-space: pre-wrap;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                    border: 1px solid #e2e8f0;
                }

                .msg-detail-footer {
                    padding: 20px 28px;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                }

                .msg-reply-btn {
                    width: 100%;
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: 2px dashed #cbd5e1;
                    background: #f8fafc;
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

                .msg-reply-btn:hover {
                    border-color: #0d9488;
                    color: #0d9488;
                    background: #f0fdfa;
                }

                .msg-reply-btn i {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.85rem;
                }

                /* Empty State */
                .msg-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                }

                .msg-empty-icon {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(15, 118, 110, 0.15) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    box-shadow: 0 8px 32px rgba(13, 148, 136, 0.1);
                }

                .msg-empty-icon i {
                    font-size: 40px;
                    color: #0d9488;
                }

                .msg-empty h4 {
                    margin: 0 0 8px;
                    font-size: 1.25rem;
                    color: #1e293b;
                    font-weight: 700;
                }

                .msg-empty p {
                    margin: 0 0 24px;
                    font-size: 0.95rem;
                    color: #64748b;
                }

                .msg-new-btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 4px 15px rgba(13, 148, 136, 0.3);
                    transition: all 0.25s ease;
                }

                .msg-new-btn:hover {
                    color: white;
                    text-decoration: none;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(13, 148, 136, 0.4);
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .msg-sidebar {
                        width: 340px;
                    }
                }

                @media (max-width: 992px) {
                    .msg-container {
                        left: 0;
                    }

                    .msg-sidebar {
                        width: 100%;
                        max-width: 380px;
                    }

                    .msg-detail {
                        display: none;
                    }

                    .msg-container.has-selected .msg-sidebar {
                        display: none;
                    }

                    .msg-container.has-selected .msg-detail {
                        display: flex;
                    }
                }

                @media (max-width: 768px) {
                    .msg-sidebar {
                        max-width: 100%;
                    }

                    .msg-header {
                        padding: 16px;
                    }

                    .msg-tabs {
                        padding: 12px 16px;
                    }

                    .msg-item {
                        padding: 14px 16px;
                    }

                    .msg-detail-header {
                        padding: 16px;
                        flex-direction: column;
                    }

                    .msg-actions {
                        width: 100%;
                    }

                    .msg-btn {
                        flex: 1;
                        justify-content: center;
                    }

                    .msg-detail-body {
                        padding: 16px;
                    }

                    .msg-detail-footer {
                        padding: 16px;
                    }
                }
            `}</style>

            <div className={`msg-container ${selectedMessageId ? 'has-selected' : ''}`}>
                {/* Sidebar */}
                <div className="msg-sidebar">
                    <div className="msg-header">
                        <div className="msg-header-content">
                            <div className="msg-header-top">
                                <div className="msg-header-title">
                                    <div className="msg-header-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div className="msg-header-text">
                                        <h2>Inbox</h2>
                                        <span>{stats.unread} unread message{stats.unread !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <Link to={`/${SESSION_USER_ROLE}/contacts`} className="msg-compose" title="New message">
                                    <i className="fas fa-pen" style={{ fontSize: 14 }}></i>
                                </Link>
                            </div>
                            <div className="msg-search">
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

                    <div className="msg-tabs">
                        {[
                            { key: 'all', label: 'All', icon: 'fa-inbox', count: stats.total },
                            { key: 'unread', label: 'Unread', icon: 'fa-envelope', count: stats.unread },
                            { key: 'read', label: 'Read', icon: 'fa-envelope-open', count: stats.total - stats.unread }
                        ].map(t => (
                            <button
                                key={t.key}
                                className={`msg-tab ${activeTab === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.key)}
                            >
                                <i className={`fas ${t.icon}`} style={{ fontSize: 11 }}></i>
                                {t.label}
                                {t.count > 0 && <span className="msg-tab-count">{t.count}</span>}
                            </button>
                        ))}
                    </div>

                    <div className="msg-list">
                        {filteredMessages.length === 0 ? (
                            <div className="msg-empty-list">
                                <div className="msg-empty-list-icon">
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
                                    className={`msg-item ${sel ? 'selected' : ''} ${unread ? 'unread' : ''}`}
                                    onClick={() => setSelectedMessageId(m.id)}
                                >
                                    <div className="msg-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                        {initials(o.name)}
                                        {unread && <div className="msg-unread-dot"></div>}
                                    </div>
                                    <div className="msg-content">
                                        <div className="msg-top">
                                            <span className={`msg-name ${unread ? 'unread' : ''}`}>{o.name || 'Unknown'}</span>
                                            <span className={`msg-time ${unread ? 'unread' : ''}`}>{formatTime(m.created_at)}</span>
                                        </div>
                                        <div className={`msg-subject ${unread ? 'unread' : ''}`}>{m.subject || '(No subject)'}</div>
                                        <div className="msg-preview">{m.body || '(No content)'}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detail */}
                <div className="msg-detail">
                    {selectedMessage ? (() => {
                        const o = other(selectedMessage);
                        const [c1, c2] = gradient(o.name);
                        return (
                            <>
                                <div className="msg-detail-header">
                                    <div className="msg-detail-info">
                                        <div className="msg-detail-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                            {initials(o.name)}
                                        </div>
                                        <div className="msg-detail-meta">
                                            <h3>{selectedMessage.subject || '(No subject)'}</h3>
                                            <div className="msg-detail-sender">
                                                <span className="msg-detail-sender-badge">
                                                    <i className="fas fa-user" style={{ fontSize: 11 }}></i>
                                                    {o.dir}: {o.name}
                                                </span>
                                                <span className="msg-detail-date">{formatFull(selectedMessage.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="msg-actions">
                                        <button className="msg-btn primary" onClick={() => openChat(selectedMessage)}>
                                            <i className="fas fa-reply"></i> Reply
                                        </button>
                                        <button className="msg-btn danger" onClick={(e) => deleteMsg(e, selectedMessage.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="msg-detail-body">
                                    <div className="msg-body-card">{selectedMessage.body || '(No content)'}</div>
                                </div>
                                <div className="msg-detail-footer">
                                    <button className="msg-reply-btn" onClick={() => openChat(selectedMessage)}>
                                        <i className="fas fa-pen"></i>
                                        <span>Click to reply to this message...</span>
                                    </button>
                                </div>
                            </>
                        );
                    })() : (
                        <div className="msg-empty">
                            <div className="msg-empty-icon"><i className="fas fa-envelope-open-text"></i></div>
                            <h4>Select a message</h4>
                            <p>Choose a conversation from the list to view details</p>
                            <Link to={`/${SESSION_USER_ROLE}/contacts`} className="msg-new-btn">
                                <i className="fas fa-plus"></i> New Message
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default View;
