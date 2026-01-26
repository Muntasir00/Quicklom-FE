import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema } from "@schemas/user/MessagingSchema";
import {
    createMessageService,
    getUserMessageService,
    getMessagesService,
    getAllConversationsService,
    showUsersMessages
} from "@services/admin/MessagingService";
import { useNavigate, useParams } from "react-router-dom";
import { upperCaseWords } from "@utils/StringUtils";
import { SESSION_KEYS, SessionUtil } from "@utils/SessionUtils";
import { getContactsService } from "@services/admin/ContactService";
import Swal from "sweetalert2";

export const useCreateMessaging = () => {
    const menu = "messaging";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);
    const SESSION_USER_ID = SessionUtil.get(SESSION_KEYS.USER_ID);
    const FORM_ID = "message-form";
    const action = "Create";

    // URL params: /admin/messaging/user/:id or /admin/messaging/monitor/:user1Id/:user2Id
    const { id: receiver_id, user1Id, user2Id } = useParams();

    const [messages, setMessages] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [allConversations, setAllConversations] = useState([]);
    const menuLink = `/${SESSION_USER_ROLE}/${menu}`;
    const [contacts, setContacts] = useState([]);
    const [uploadedFile, setUploadedFile] = useState("");
    const [viewMode, setViewMode] = useState("my-messages"); // my-messages, monitor-conversation
    const [conversationPairs, setConversationPairs] = useState([]);

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            sender_id: "",
            receiver_id: "",
            subject: "",
            body: "",
            attachment: "",
        },
    });

    /**
     * Extract unique conversation pairs from all messages
     */
    const extractConversationPairs = (messages) => {
        const pairsMap = new Map();

        messages.forEach(msg => {
            const key1 = `${msg.sender_id}-${msg.receiver_id}`;
            const key2 = `${msg.receiver_id}-${msg.sender_id}`;

            if (!pairsMap.has(key1) && !pairsMap.has(key2)) {
                pairsMap.set(key1, {
                    user1_id: msg.sender_id,
                    user2_id: msg.receiver_id,
                    user1: msg.sender,
                    user2: msg.receiver,
                    lastMessage: msg,
                    unreadCount: 0,
                });
            } else {
                const existingKey = pairsMap.has(key1) ? key1 : key2;
                const pair = pairsMap.get(existingKey);

                if (new Date(msg.created_at) > new Date(pair.lastMessage.created_at)) {
                    pair.lastMessage = msg;
                }
            }
        });

        return Array.from(pairsMap.values()).sort((a, b) =>
            new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
        );
    };

    const initializeStateHelper = async () => {
        try {
            // Fetch contacts
            const contactsResponse = await getContactsService();
            setContacts(Array.isArray(contactsResponse) ? contactsResponse : []);

            // Determine view mode based on URL
            if (user1Id && user2Id) {
                // Monitor mode: viewing conversation between two users
                setViewMode("monitor-conversation");
                const conversationData = await showUsersMessages(user1Id, user2Id);
                setMessages(Array.isArray(conversationData) ? conversationData : []);

                // Still fetch admin's own messages for sidebar
                const adminMsgs = await getMessagesService();
                setAllMessages(Array.isArray(adminMsgs) ? adminMsgs : []);

            } else if (receiver_id) {
                // Normal mode: admin chatting with a user
                setViewMode("my-messages");
                const messagesData = await getUserMessageService(receiver_id);
                setMessages(Array.isArray(messagesData) ? messagesData : []);

                // Set subject based on receiver
                if (contactsResponse && contactsResponse.length > 0) {
                    const user = contactsResponse.find(u => Number(u.id) === Number(receiver_id));
                    if (user) {
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
                    }
                }

                // Fetch all admin messages for sidebar
                const adminMsgs = await getMessagesService();
                setAllMessages(Array.isArray(adminMsgs) ? adminMsgs : []);

            } else {
                // Default: show admin's messages
                setViewMode("my-messages");
                const adminMsgs = await getMessagesService();
                setAllMessages(Array.isArray(adminMsgs) ? adminMsgs : []);
            }

            // Always fetch all conversations for monitoring view
            const allConvs = await getAllConversationsService();
            setAllConversations(Array.isArray(allConvs) ? allConvs : []);

            if (allConvs && allConvs.length > 0) {
                const pairs = extractConversationPairs(allConvs);
                setConversationPairs(pairs);
            }

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const refreshMessaging = async () => {
        try {
            if (viewMode === "monitor-conversation" && user1Id && user2Id) {
                // Refresh monitored conversation
                const conversationData = await showUsersMessages(user1Id, user2Id);
                setMessages(Array.isArray(conversationData) ? conversationData : []);
            } else if (receiver_id) {
                // Refresh admin's conversation with user
                const messagesData = await getUserMessageService(receiver_id);
                setMessages(Array.isArray(messagesData) ? messagesData : []);
            }

            // Always refresh admin's messages and all conversations
            const adminMsgs = await getMessagesService();
            setAllMessages(Array.isArray(adminMsgs) ? adminMsgs : []);

            const allConvs = await getAllConversationsService();
            setAllConversations(Array.isArray(allConvs) ? allConvs : []);

            if (allConvs && allConvs.length > 0) {
                const pairs = extractConversationPairs(allConvs);
                setConversationPairs(pairs);
            }

        } catch (error) {
            console.error("Error occurred:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            // Admins can only send messages in "my-messages" mode, not when monitoring
            if (viewMode === "monitor-conversation") {
                Swal.fire("Info", "You are in monitoring mode. Switch to direct messaging to send messages.", "info");
                return;
            }

            console.log("Messaging form data:", data);

            const formData = new FormData();
            formData.append("sender_id", data.sender_id ?? "");
            formData.append("receiver_id", data.receiver_id ?? "");
            formData.append("subject", data.subject ?? "");
            formData.append("body", data.body ?? "");

            if (data.attachment instanceof FileList && data.attachment.length > 0) {
                formData.append("attachment", data.attachment[0]);
            } else if (data.attachment instanceof File) {
                formData.append("attachment", data.attachment);
            }

            const messagesResponse = await createMessageService(formData);

            if (!Array.isArray(messagesResponse) || messagesResponse.length <= 0) {
                console.log("Failed to send message, Response", messagesResponse);
                return;
            }

            console.log("Message sent successfully, Data", messagesResponse);
            setMessages(messagesResponse ?? []);
            setUploadedFile("");

            // Refresh all messages
            const allMsgs = await getMessagesService();
            setAllMessages(Array.isArray(allMsgs) ? allMsgs : []);

            reset({
                sender_id: SESSION_USER_ID ?? "",
                receiver_id: receiver_id ?? "",
                body: "",
                attachment: "",
                subject: watch("subject"),
            });
        } catch (error) {
            console.error("Error in sending message:", error);
        }
    };

    useEffect(() => {
        try {
            document.title = `${upperCaseWords(menu)} | Quicklocum Admin`;
            setMessages([]);
            initializeStateHelper();
            setValue("receiver_id", receiver_id ?? "");
            setValue("sender_id", SESSION_USER_ID ?? "");
        } catch (error) {
            console.error("Error:", error);
        }
    }, [SESSION_USER_ID, receiver_id, user1Id, user2Id]);

    useEffect(() => {
        const interval = setInterval(() => {
            refreshMessaging();
        }, 5000);

        return () => clearInterval(interval);
    }, [receiver_id, user1Id, user2Id, viewMode]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        menu,
        menuLink,
        FORM_ID,
        action,
        slug,
        messages, // Current conversation messages
        allMessages, // Admin's own messages for sidebar
        allConversations, // All conversations in the system
        conversationPairs, // Unique conversation pairs
        SESSION_USER_ID,
        contacts,
        SESSION_USER_ROLE,
        setValue,
        watch,
        uploadedFile,
        setUploadedFile,
        initializeStateHelper,
        viewMode,
        setViewMode,
    };
};