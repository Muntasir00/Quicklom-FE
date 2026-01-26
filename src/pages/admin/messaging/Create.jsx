import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Card, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import Chat from '@components/messaging/Chat';
import PageHeader from "@components/admin/PageHeader";
import { useCreateMessaging } from "@hooks/admin/messaging/useCreateMessaging";
import MessagingForm from "@components/forms/MessagingForm";
import AdminContactsSidebar from "@components/messaging/AdminContactsSidebar";
import "./MessagingStyles.css";

const Create = () => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        menu,
        FORM_ID,
        action,
        menuLink,
        messages,
        allMessages,
        allConversations,
        conversationPairs,
        SESSION_USER_ID,
        contacts,
        SESSION_USER_ROLE,
        setValue,
        watch,
        uploadedFile,
        setUploadedFile,
        viewMode,
    } = useCreateMessaging();

    const { id: receiver_id, user1Id, user2Id } = useParams();
    const [searchQuery, setSearchQuery] = useState("");

    // Determine current contact or conversation participants
    let currentContact = null;
    let conversationUsers = null;

    if (viewMode === "monitor-conversation" && user1Id && user2Id) {
        // Monitoring mode: show both users
        conversationUsers = {
            user1: contacts.find(c => c.id == user1Id),
            user2: contacts.find(c => c.id == user2Id),
        };
    } else if (receiver_id) {
        // Direct chat mode
        currentContact = contacts.find(c => c.id == receiver_id);
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="New Message"
                subtitle="Start a conversation or monitor existing ones"
                icon={<ChatIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${SESSION_USER_ROLE}/dashboard` },
                    { label: 'Messaging', path: menuLink },
                    { label: action },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                        overflow: 'hidden',
                    }}
                >
                    <div className="messaging-layout">
                                        {/* Left Sidebar - Contacts */}
                                        <AdminContactsSidebar
                                            contacts={contacts}
                                            searchQuery={searchQuery}
                                            setSearchQuery={setSearchQuery}
                                            SESSION_USER_ROLE={SESSION_USER_ROLE}
                                            SESSION_USER_ID={SESSION_USER_ID}
                                            setValue={setValue}
                                            currentReceiverId={receiver_id}
                                            messages={allMessages}
                                            conversationPairs={conversationPairs}
                                            viewMode={viewMode}
                                            user1Id={user1Id}
                                            user2Id={user2Id}
                                        />

                                        {/* Right Panel - Chat Area */}
                                        <div className="chat-panel">
                                            {(receiver_id || (user1Id && user2Id)) ? (
                                                <>
                                                    {/* Chat Header */}
                                                    <div className="chat-header">
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src="/assets/dist/img/user.png"
                                                                alt="Avatar"
                                                                className="chat-header-avatar"
                                                            />
                                                            <div className="chat-header-info">
                                                                {viewMode === "monitor-conversation" ? (
                                                                    <>
                                                                        <h5 className="mb-0">
                                                                            <i className="fas fa-eye text-warning mr-2"></i>
                                                                            Monitoring Conversation
                                                                        </h5>
                                                                        <small>
                                                                            {conversationUsers?.user1?.name || "User"}
                                                                            {" ↔ "}
                                                                            {conversationUsers?.user2?.name || "User"}
                                                                        </small>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <h5 className="mb-0">{currentContact?.name || "Contact"}</h5>
                                                                        <small className="text-muted">
                                                                            {currentContact?.role?.name || "User"}
                                                                        </small>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="chat-header-actions">
                                                            {viewMode === "monitor-conversation" ? (
                                                                <span className="badge badge-warning">
                                                                    <i className="fas fa-eye mr-1"></i>
                                                                    Read-Only
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-info">
                                                                    {watch('subject') || "Support"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Chat Messages */}
                                                    <div className="chat-messages-wrapper">
                                                        <Chat
                                                            messages={messages}
                                                            sessionUserId={viewMode === "monitor-conversation" ? user1Id : SESSION_USER_ID}
                                                        />
                                                    </div>

                                                    {/* Chat Footer - Input */}
                                                    {viewMode !== "monitor-conversation" && (
                                                        <div className="chat-footer">
                                                            <MessagingForm
                                                                formId={FORM_ID}
                                                                handleSubmit={handleSubmit}
                                                                onSubmit={onSubmit}
                                                                register={register}
                                                                errors={errors}
                                                                uploadedFile={uploadedFile}
                                                                setUploadedFile={setUploadedFile}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Monitoring Mode Footer */}
                                                    {viewMode === "monitor-conversation" && (
                                                        <div className="chat-footer text-center py-3">
                                                            <p className="text-muted mb-0">
                                                                <i className="fas fa-info-circle mr-2"></i>
                                                                You are viewing this conversation in monitoring mode.
                                                                Messages cannot be sent from this view.
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="no-chat-selected">
                                                    <div className="text-center text-muted">
                                                        <i className="fas fa-comments fa-5x mb-3 opacity-50"></i>
                                                        <h4>QuickLocum Admin Messaging</h4>
                                                        <p>Select a contact to start messaging or monitor conversations</p>
                                                        <div className="mt-4">
                                                            <div className="info-card">
                                                                <i className="fas fa-user-friends text-primary mr-2"></i>
                                                                <strong>My Chats:</strong> Direct conversations with users
                                                            </div>
                                                            <div className="info-card mt-2">
                                                                <i className="fas fa-eye text-warning mr-2"></i>
                                                                <strong>Monitor:</strong> View all user conversations
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                    </div>
                </Card>
            </Box>
        </Box>
    );
}

export default Create;