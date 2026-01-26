import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema } from "@schemas/user/MessagingSchema";
import { createMessageService, getUserMessageService, getMessagesService } from "@services/professional/MessagingService";
import { useNavigate, useParams } from "react-router-dom";
import { upperCaseWords } from "@utils/StringUtils";
import {SESSION_KEYS, SessionUtil} from "@utils/SessionUtils"
import { getContactsService } from "@services/professional/ContactService";


export const useCreateMessaging = () => {
    const menu = "messaging";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);
    const SESSION_USER_ID = SessionUtil.get(SESSION_KEYS.USER_ID);
    const FORM_ID = "message-form";
    const action = "Create";
    const { id: receiver_id } = useParams();
    const [messages, setMessages] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const menuLink = `/${SESSION_USER_ROLE}/${menu}`;
    const [contacts, setContacts] = useState([]);
    const [uploadedFile, setUploadedFile] = useState("");

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
            receiver_id: "",
            subject: "",
            body: "",
            attachment: "",
        },
    });

    const initializeStateHelper = async () => {
        try {
            // Fetch all messages first for contact list
            try {
                const allMsgs = await getMessagesService();
                setAllMessages(Array.isArray(allMsgs) ? allMsgs : []);
            } catch (error) {
                console.error("Error fetching all messages:", error);
                setAllMessages([]);
            }

            // Fetch contacts
            const contactsResponse = await getContactsService();
            console.log("🔍 Raw contacts response:", contactsResponse);

            // ✅ FIX: Preserve the structure with contracts
            // Backend sends: [{ user_id, user, contracts }, { user_id, user, contracts }, { admins }]
            // We need to keep this structure BUT also flatten admins into contact format

            let allContacts = [];

            if (Array.isArray(contactsResponse)) {
                contactsResponse.forEach(item => {
                    // Case 1: Regular contact with user and contracts
                    if (item.user && item.user_id) {
                        // Keep the full structure with contracts
                        allContacts.push(item);
                    }
                    // Case 2: Admins object - convert to contact format
                    else if (item.admins && Array.isArray(item.admins)) {
                        // Add each admin as a separate contact
                        item.admins.forEach(admin => {
                            allContacts.push({
                                user_id: admin.id,
                                user: admin,
                                contracts: [], // Admins don't have contracts
                                isAdmin: true
                            });
                        });
                    }
                });
            }

            console.log("✅ Contacts (preserved structure with admins):", allContacts);
            setContacts(allContacts);

            // If receiver_id exists, fetch conversation messages
            if (receiver_id) {
                const messagesData = await getUserMessageService(receiver_id);
                setMessages(Array.isArray(messagesData) ? messagesData : []);

                // Set subject based on receiver
                if (allContacts.length > 0) {
                    // Find the contact - could be in { user: {...} } or { admins: [...] }
                    let targetUser = null;

                    for (const contact of allContacts) {
                        if (contact.admins) {
                            // Check in admins array
                            targetUser = contact.admins.find(admin => Number(admin.id) == Number(receiver_id));
                            if (targetUser) break;
                        } else if (contact.user) {
                            // Check if this contact's user matches
                            if (Number(contact.user.id) == Number(receiver_id)) {
                                targetUser = contact.user;
                                break;
                            }
                        }
                    }

                    if (targetUser) {
                        const userRole = targetUser?.role?.name ? targetUser.role.name.toLowerCase() : "";
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
            }

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const refreshMessaging = async () => {
        try {
            // Always refresh all messages for unread counts
            const allMsgs = await getMessagesService();
            setAllMessages(Array.isArray(allMsgs) ? allMsgs : []);

            // If viewing a specific conversation, refresh those messages
            if (receiver_id) {
                const messagesData = await getUserMessageService(receiver_id);
                setMessages(Array.isArray(messagesData) ? messagesData : []);
            }
        } catch (error) {
            console.error("Error occurred:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            console.log("Messaging form data:", data);

            const formData = new FormData();
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
            document.title = `${upperCaseWords(menu)} | Quicklocum`;
            setMessages([]);
            initializeStateHelper();
            setValue("receiver_id", receiver_id ?? "");
        } catch (error) {
            console.error("Error:", error);
        }
    }, [SESSION_USER_ID, receiver_id]);

    useEffect(() => {
        const interval = setInterval(() => {
            refreshMessaging();
        }, 5000);

        return () => clearInterval(interval);
    }, [receiver_id]);

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
        allMessages, // All messages for sidebar
        SESSION_USER_ID,
        contacts,
        SESSION_USER_ROLE,
        setValue,
        watch,
        uploadedFile,
        setUploadedFile,
        initializeStateHelper,
    };
};