import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema } from "@schemas/user/MessagingSchema";
import { createMessageService, getUserMessageService } from "@services/institute/MessagingService";
import { useNavigate } from "react-router-dom";
import { upperCaseWords } from "@utils/StringUtils";
import {SESSION_KEYS, SessionUtil} from "@utils/SessionUtils"
import { useParams } from "react-router-dom";


export const useUpdateMessaging = () => {
    const menu = "messaging";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);
    const SESSION_USER_ID = SessionUtil.get(SESSION_KEYS.USER_ID);
    const FORM_ID = "message-form";
    const action = "Edit";
    const { id: receiver_id } = useParams();
    const { messageId } = useParams();
    const [messages, setMessages] = useState([]);
    const menuLink = `/${SESSION_USER_ROLE}/${menu}`;

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
            const messagesData = await getUserMessageService(receiver_id);
            setMessages(Array.isArray(messagesData) ? messagesData : []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            console.log("Messeging form data:", data);
            const messagesResponse= await createMessageService(data);
            
            if (!Array.isArray(messagesResponse) && messagesResponse.length <= 0) {
                console.log("Failed to send message, Response", messagesResponse);
                return;
            }; 

            console.log("Message sent successfully, Data", messagesResponse);
            setMessages(messagesResponse ?? []);
            reset({
                receiver_id: receiver_id ?? "",
                subject: "",
                body: "",
                attachment: "",
            });
        } catch (error) {
            console.error("Error in sending message:", error);
        }
    };

    useEffect(() => {
        try {
            document.title = `${upperCaseWords(menu)} | Quicklocum`;
            initializeStateHelper();
            setValue("receiver_id", receiver_id ?? "");
        } catch (error) {
            console.error("Error:", error);
        }
    }, [SESSION_USER_ID, receiver_id]);

    
    useEffect(() => {
        const interval = setInterval(() => { initializeStateHelper() }, 5000);
        return () => clearInterval(interval)
    }, []);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        menu,
        menuLink,
        SESSION_USER_ROLE,
        FORM_ID,
        action,
        slug,
        messages,
        SESSION_USER_ID,
        initializeStateHelper,
        initializeStateHelper,
    };
};
