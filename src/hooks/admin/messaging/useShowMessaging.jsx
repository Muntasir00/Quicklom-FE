import React, { useState, useEffect } from "react";
import { showUsersMessages } from "@services/admin/MessagingService";
import { useNavigate } from "react-router-dom";
import { upperCaseWords } from "@utils/StringUtils";
import {SESSION_KEYS, SessionUtil} from "@utils/SessionUtils"
import { useParams } from "react-router-dom";

export const useShowMessaging = () => {
    const menu = "messaging";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);
    const SESSION_USER_ID = SessionUtil.get(SESSION_KEYS.USER_ID);
    const action = "Show";
    const { receiverId, senderId } = useParams();
    const [messages, setMessages] = useState([]);
    const menuLink = `/${SESSION_USER_ROLE}/${menu}`;

    const initializeStateHelper = async () => {
        try {
            const messagesData = await showUsersMessages(receiverId, senderId);
            setMessages(Array.isArray(messagesData) ? messagesData : []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => { 
        try {
            document.title = `${upperCaseWords(menu)} | Quicklocum`;
            initializeStateHelper();
        } catch (error) {
            console.error("Error:", error);
        }
    }, []);

    return {
        menu,
        menuLink,
        SESSION_USER_ROLE,
        action,
        slug,
        messages,
        SESSION_USER_ID,
        initializeStateHelper,
        senderId,
    };
};
