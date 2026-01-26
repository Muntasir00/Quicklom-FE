import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chat from '@components/messaging/Chat';
import { useUpdateMessaging } from "@hooks/institute/messaging/useUpdateMessaging";
import MessagingForm from "@components/forms/MessagingForm";

const Edit = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        menu,
        SESSION_USER_ROLE,
        FORM_ID,
        action,
        slug,
        messages,
        SESSION_USER_ID,
        menuLink,
        initializeStateHelper,
    } = useUpdateMessaging();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleBackToContacts = () => {
        navigate(`/${SESSION_USER_ROLE}/messaging`);
    };

    if (isMobile) {
        // Mobile WhatsApp-style full-screen chat
        return (
            <>
                <style>{`
                    .mobile-chat-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                        z-index: 9999;
                        display: flex;
                        flex-direction: column;
                    }

                    .mobile-chat-header {
                        background: linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%);
                        color: white;
                        padding: 16px 20px;
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        position: relative;
                        overflow: hidden;
                    }

                    .mobile-chat-header::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                    }

                    .mobile-back-btn {
                        background: rgba(255, 255, 255, 0.15);
                        backdrop-filter: blur(10px);
                        border: none;
                        color: white;
                        width: 40px;
                        height: 40px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        font-size: 18px;
                        transition: all 0.2s ease;
                        position: relative;
                        z-index: 1;
                    }

                    .mobile-back-btn:hover {
                        background: rgba(255, 255, 255, 0.25);
                    }

                    .mobile-header-content {
                        flex: 1;
                        position: relative;
                        z-index: 1;
                    }

                    .mobile-header-content h3 {
                        margin: 0;
                        font-size: 1.1rem;
                        font-weight: 700;
                    }

                    .mobile-header-content span {
                        font-size: 0.75rem;
                        opacity: 0.8;
                    }

                    .mobile-refresh-btn {
                        background: rgba(255, 255, 255, 0.15);
                        backdrop-filter: blur(10px);
                        border: none;
                        color: white;
                        padding: 10px 16px;
                        border-radius: 10px;
                        font-size: 0.85rem;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.2s ease;
                        position: relative;
                        z-index: 1;
                    }

                    .mobile-refresh-btn:hover {
                        background: rgba(255, 255, 255, 0.25);
                    }

                    .mobile-messages-area {
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px 16px;
                        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                    }

                    .mobile-messages-area::-webkit-scrollbar {
                        width: 4px;
                    }

                    .mobile-messages-area::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .mobile-messages-area::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 2px;
                    }

                    .mobile-messages-area .message-wrapper {
                        margin-bottom: 12px;
                    }

                    .mobile-messages-area .message-bubble.sent {
                        background: white;
                        color: #1e293b;
                        border-radius: 18px 18px 18px 4px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                        border: 1px solid #e2e8f0;
                    }

                    .mobile-messages-area .message-bubble.received {
                        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                        color: white;
                        border-radius: 18px 18px 4px 18px;
                        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                    }

                    .mobile-messages-area .date-separator span {
                        background: white;
                        color: #64748b;
                        padding: 6px 14px;
                        border-radius: 16px;
                        font-size: 0.7rem;
                        font-weight: 600;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                    }

                    .mobile-input-area {
                        background: white;
                        padding: 12px 16px;
                        border-top: 1px solid #e2e8f0;
                    }

                    .mobile-input-area .input-group {
                        display: flex;
                        align-items: center;
                        background: #f8fafc;
                        border: 2px solid #e2e8f0;
                        border-radius: 24px;
                        padding: 4px 8px;
                        transition: all 0.2s ease;
                    }

                    .mobile-input-area .input-group:focus-within {
                        border-color: #0d9488;
                        box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
                    }

                    .mobile-input-area .form-control {
                        border: none;
                        background: transparent;
                        padding: 10px 12px;
                        box-shadow: none !important;
                    }

                    .mobile-input-area .btn-primary {
                        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                        border: none;
                        border-radius: 50%;
                        width: 44px;
                        height: 44px;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
                    }
                `}</style>

                <div className="mobile-chat-container">
                    <div className="mobile-chat-header">
                        <button onClick={handleBackToContacts} className="mobile-back-btn">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="mobile-header-content">
                            <h3>Direct {menu ?? "Chat"}</h3>
                            <span>Tap to view contact info</span>
                        </div>
                        <button onClick={() => initializeStateHelper()} className="mobile-refresh-btn">
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>

                    <div className="mobile-messages-area">
                        <Chat
                            messages={messages}
                            sessionUserId={SESSION_USER_ID}
                        />
                    </div>

                    <div className="mobile-input-area">
                        <MessagingForm
                            formId={FORM_ID}
                            handleSubmit={handleSubmit}
                            onSubmit={onSubmit}
                            register={register}
                            errors={errors}
                        />
                    </div>
                </div>
            </>
        );
    }

    // Desktop view - Modern healthcare theme
    return (
        <>
            <style>{`
                .desktop-chat-wrapper {
                    margin-top: 15px;
                }

                .desktop-chat-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    margin-bottom: 30px;
                }

                .desktop-chat-header {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%);
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                }

                .desktop-chat-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .desktop-header-left {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    position: relative;
                    z-index: 1;
                }

                .desktop-header-icon {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                }

                .desktop-header-text h3 {
                    color: white;
                    margin: 0 0 4px;
                    font-size: 1.15rem;
                    font-weight: 700;
                    text-transform: capitalize;
                }

                .desktop-header-text span {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.8rem;
                }

                .desktop-header-actions {
                    display: flex;
                    gap: 10px;
                    position: relative;
                    z-index: 1;
                }

                .desktop-refresh-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    border-radius: 12px;
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .desktop-refresh-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }

                .desktop-back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    text-decoration: none;
                }

                .desktop-back-btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                    color: white;
                    text-decoration: none;
                }

                .desktop-messages-area {
                    max-height: 500px;
                    overflow-y: auto;
                    padding: 24px;
                    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                }

                .desktop-messages-area::-webkit-scrollbar {
                    width: 6px;
                }

                .desktop-messages-area::-webkit-scrollbar-track {
                    background: transparent;
                }

                .desktop-messages-area::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .desktop-messages-area .chat-messages-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .desktop-messages-area .message-wrapper {
                    margin-bottom: 14px;
                }

                .desktop-messages-area .message-bubble {
                    padding: 14px 18px;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .desktop-messages-area .message-bubble.sent {
                    background: white;
                    color: #1e293b;
                    border-radius: 18px 18px 18px 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    border: 1px solid #e2e8f0;
                }

                .desktop-messages-area .message-bubble.received {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    color: white;
                    border-radius: 18px 18px 4px 18px;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                }

                .desktop-messages-area .date-separator {
                    margin: 20px 0;
                }

                .desktop-messages-area .date-separator span {
                    background: white;
                    color: #64748b;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }

                .desktop-messages-area .message-time {
                    font-size: 0.7rem;
                    margin-top: 6px;
                }

                .desktop-input-area {
                    padding: 20px 24px;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                }

                .desktop-input-area .input-group {
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 6px 10px;
                    transition: all 0.2s ease;
                }

                .desktop-input-area .input-group:focus-within {
                    border-color: #0d9488;
                    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
                    background: white;
                }

                .desktop-input-area .input-group-text {
                    background: transparent;
                    border: none;
                    padding: 10px;
                    color: #94a3b8;
                }

                .desktop-input-area .form-control {
                    border: none;
                    background: transparent;
                    padding: 12px 14px;
                    box-shadow: none !important;
                    font-size: 0.95rem;
                }

                .desktop-input-area .form-control::placeholder {
                    color: #94a3b8;
                }

                .desktop-input-area .btn-primary {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    border: none;
                    border-radius: 12px;
                    padding: 12px 24px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                    transition: all 0.25s ease;
                }

                .desktop-input-area .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
                }
            `}</style>

            <div className="content-wrapper desktop-chat-wrapper">
                <section className="content" style={{ paddingBottom: '20px' }}>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="desktop-chat-card">
                                    <div className="desktop-chat-header">
                                        <div className="desktop-header-left">
                                            <div className="desktop-header-icon">
                                                <i className="fas fa-comments"></i>
                                            </div>
                                            <div className="desktop-header-text">
                                                <h3>Direct {menu ?? "Chat"}</h3>
                                                <span>Real-time conversation</span>
                                            </div>
                                        </div>
                                        <div className="desktop-header-actions">
                                            <button onClick={handleBackToContacts} className="desktop-back-btn">
                                                <i className="fas fa-arrow-left"></i>
                                                <span>Back</span>
                                            </button>
                                            <button onClick={() => initializeStateHelper()} className="desktop-refresh-btn">
                                                <i className="fas fa-sync-alt"></i>
                                                <span>Refresh</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="desktop-messages-area">
                                        <Chat
                                            messages={messages}
                                            sessionUserId={SESSION_USER_ID}
                                        />
                                    </div>
                                    <div className="desktop-input-area">
                                        <MessagingForm
                                            formId={FORM_ID}
                                            handleSubmit={handleSubmit}
                                            onSubmit={onSubmit}
                                            register={register}
                                            errors={errors}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default Edit;
