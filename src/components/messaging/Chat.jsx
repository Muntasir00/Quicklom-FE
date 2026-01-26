import { API_BASE_URL } from "@config/apiConfig";
import React, { useEffect, useRef } from "react";

const Chat = ({
    messages,
    sessionUserId,
    API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
}) => {
    const messagesEndRef = useRef(null);

    /**
     * SECURITY: Sanitize and validate attachment URLs to prevent path traversal/redirects
     */
    const getSafeAttachmentUrl = (attachment) => {
        if (!attachment) return null;

        // If it's already a full URL, validate it's from trusted sources
        if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
            try {
                const url = new URL(attachment);
                // Allow Firebase Storage and our own API domain
                const trustedHosts = [
                    'firebasestorage.googleapis.com',
                    'storage.googleapis.com',
                    new URL(API_BASE_URL).hostname
                ];
                if (trustedHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) {
                    return attachment;
                }
                // Untrusted URL - don't render
                console.warn('Blocked untrusted attachment URL:', url.hostname);
                return null;
            } catch (e) {
                return null;
            }
        }

        // Relative path - sanitize and construct URL
        // Remove any path traversal attempts
        const sanitized = attachment
            .replace(/\.\./g, '')  // Remove ..
            .replace(/\/+/g, '/')  // Normalize multiple slashes
            .replace(/^\/+/, '');  // Remove leading slashes

        // Only allow specific path prefixes
        const allowedPrefixes = ['uploads/', 'messaging_attachment/', 'documents/', 'profiles/'];
        if (!allowedPrefixes.some(prefix => sanitized.startsWith(prefix))) {
            console.warn('Blocked attachment with invalid path prefix:', sanitized);
            return null;
        }

        return `${API_BASE_URL}/${sanitized}`;
    };

    /**
     * Get attachment display name
     * Prefers attachment_name from API, falls back to extracting from URL
     */
    const getAttachmentName = (msg) => {
        // Use attachment_name if available (original filename from upload)
        if (msg.attachment_name) {
            return msg.attachment_name;
        }

        const url = msg.attachment;
        if (!url) return "Attachment";

        try {
            // Handle Firebase Storage URLs
            // Format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Ffilename.ext?alt=media
            if (url.includes('firebasestorage.googleapis.com')) {
                const match = url.match(/\/o\/(.+?)\?/);
                if (match) {
                    const decodedPath = decodeURIComponent(match[1]);
                    const filename = decodedPath.split('/').pop();
                    // Remove timestamp prefix if present (e.g., "1234567890_uuid_filename.ext")
                    const cleanName = filename.replace(/^\d+_[a-f0-9]+_?/, '');
                    return cleanName || filename;
                }
            }

            // Handle regular URLs
            const urlPath = url.split('?')[0];
            const filename = urlPath.split('/').pop();

            return filename || "Attachment";
        } catch (e) {
            return "Attachment";
        }
    };

    /**
     * Get appropriate icon for file type
     */
    const getFileIcon = (url) => {
        if (!url) return "fa-file";

        const ext = url.split('.').pop().split('?')[0].toLowerCase();

        const iconMap = {
            pdf: "fa-file-pdf",
            doc: "fa-file-word",
            docx: "fa-file-word",
            xls: "fa-file-excel",
            xlsx: "fa-file-excel",
            ppt: "fa-file-powerpoint",
            pptx: "fa-file-powerpoint",
            jpg: "fa-file-image",
            jpeg: "fa-file-image",
            png: "fa-file-image",
            gif: "fa-file-image",
            webp: "fa-file-image",
            zip: "fa-file-archive",
            rar: "fa-file-archive",
            txt: "fa-file-alt",
            csv: "fa-file-csv",
        };

        return iconMap[ext] || "fa-file";
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const timeStr = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (isToday) {
            return timeStr;
        } else if (isYesterday) {
            return `Yesterday ${timeStr}`;
        } else {
            return `${date.toLocaleDateString()} ${timeStr}`;
        }
    };

    const renderDateSeparator = (currentMsg, previousMsg) => {
        if (!previousMsg) return true;

        const currentDate = new Date(currentMsg.created_at).toDateString();
        const previousDate = new Date(previousMsg.created_at).toDateString();

        return currentDate !== previousDate;
    };

    /**
     * Render read receipt indicator for sent messages
     */
    const renderReadReceipt = (message) => {
        if (message.sender_id != sessionUserId) {
            return null; // Only show receipts on sent messages
        }

        if (message.status) {
            // Message has been read
            return (
                <i
                    className="fas fa-check-double text-primary ml-1"
                    style={{ fontSize: '10px' }}
                    title={`Read ${message.read_at ? new Date(message.read_at).toLocaleString() : ''}`}
                ></i>
            );
        } else {
            // Message sent but not read yet
            return (
                <i
                    className="fas fa-check text-muted ml-1"
                    style={{ fontSize: '10px' }}
                    title="Sent"
                ></i>
            );
        }
    };

    return (
        <div className="chat-messages-container">
            {messages && messages.length > 0 ? (
                <>
                    {messages.map((msg, index) => {
                        const isSender = msg.sender_id == sessionUserId;
                        const previousMsg = index > 0 ? messages[index - 1] : null;
                        const showDateSeparator = renderDateSeparator(msg, previousMsg);

                        return (
                            <React.Fragment key={msg.id}>
                                {showDateSeparator && (
                                    <div className="date-separator">
                                        <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                                    </div>
                                )}

                                <div className={`message-wrapper ${isSender ? 'sent' : 'received'}`}>
                                    {!isSender && (
                                        <img
                                            className="message-avatar"
                                            src="/assets/dist/img/user.png"
                                            alt="avatar"
                                        />
                                    )}

                                    <div className="message-content-wrapper">
                                        {!isSender && (
                                            <div className="message-sender-name">
                                                {msg?.sender?.name || "User"}
                                            </div>
                                        )}

                                        <div className={`message-bubble ${isSender ? 'sent' : 'received'}`}>
                                            <div className="message-text">
                                                {msg.body || <i className="text-muted">No message content</i>}
                                            </div>

                                            {msg?.attachment && getSafeAttachmentUrl(msg.attachment) && (
                                                <div className="message-attachment">
                                                    <a
                                                        href={getSafeAttachmentUrl(msg.attachment)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="attachment-link"
                                                    >
                                                        <i className={`fas ${getFileIcon(msg.attachment)} mr-2`}></i>
                                                        {getAttachmentName(msg)}
                                                    </a>
                                                </div>
                                            )}

                                            <div className="message-time">
                                                {formatMessageTime(msg.created_at)}
                                                {renderReadReceipt(msg)}
                                            </div>
                                        </div>
                                    </div>

                                    {isSender && (
                                        <img
                                            className="message-avatar"
                                            src="/assets/dist/img/user.png"
                                            alt="avatar"
                                        />
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </>
            ) : (
                <div className="no-messages">
                    <i className="fas fa-comments fa-3x mb-3 text-muted opacity-50"></i>
                    <p className="text-muted">No messages yet. Start the conversation!</p>
                </div>
            )}
        </div>
    );
}

export default Chat;