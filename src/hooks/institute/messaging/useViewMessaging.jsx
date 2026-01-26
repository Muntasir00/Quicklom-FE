import React, { useState, useEffect } from "react";
import { getMessagesService, deleteMessageService } from "@services/institute/MessagingService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Chip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { upperCaseWords } from "@utils/StringUtils";
import {SESSION_KEYS, SessionUtil} from "@utils/SessionUtils";
import ChatIcon from "@mui/icons-material/Chat";


export const useViewMessaging = () => {
    const menu = "messaging";
    const action = "View";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);
    const SESSION_USER_ID = SessionUtil.get(SESSION_KEYS.USER_ID);
    const [messages, setMessages] = useState([]);
    const [hasNavigated, setHasNavigated] = useState(false);

    // URL param for notification navigation
    const userIdParam = searchParams.get("user_id");

    const initializeStateHelper = async () => {
        try {
            const messagesData = await getMessagesService();
            setMessages(Array.isArray(messagesData) ? messagesData : []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        document.title = `${upperCaseWords(menu) ?? "Quicklocum"} | Quicklocum`;
    }, []);

    // Auto-navigate to conversation when user_id param is present
    useEffect(() => {
        if (userIdParam && messages.length > 0 && !hasNavigated) {
            // Find a message from/to this user to get the message_id for navigation
            const relevantMessage = messages.find(
                m => m.sender_id == userIdParam || m.receiver_id == userIdParam
            );
            if (relevantMessage) {
                setHasNavigated(true);
                navigate(`/${SESSION_USER_ROLE}/messaging/${relevantMessage.id}/user/${userIdParam}/edit`);
            }
        }
    }, [userIdParam, messages, hasNavigated, navigate, SESSION_USER_ROLE]);

    const columns = [
        { field: "id", headerName: "#", width: 70 },
        { field: "sender", headerName: "Sender", minWidth: 120, flex: 1, 
            renderCell: (params) => params.value ? params.value.name : "-" 
        },
        { field: "receiver", headerName: "Receiver", minWidth: 120, flex: 1, 
            renderCell: (params) => params.value ? params.value.name : "-" 
        },
        { field: "subject", headerName: "Subject", minWidth: 120, flex: 1 },
        { 
            field: "body",
            headerName: "Message",
            minWidth: 120,
            flex: 1,
            renderCell: (params) => (
                <span title={params.value}>
                    {params.value && params.value.length > 30 
                        ? params.value.slice(0, 30) + "..." 
                        : params.value || ""}
                </span>
            )
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 80,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Read" : "Unread"}
                    color={params.value ? "success" : "warning"}
                    size="small"
                    style={{ cursor: "pointer" }}
                />
            ),
        },
        { field: "created_at", headerName: "Created At", minWidth: 150, flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            maxWidth: 90,
            //flex: 1,
            renderCell: (params) => {
                return (
                    <div className="action-btns">
                        <IconButton
                            className="d-none"
                            size="small"
                            style={{ padding: 2 }}
                            color="primary"
                            onClick={() =>
                                console.log("dev test")
                                //navigate(`/${sessionUserRole}/messaging/${params.row.id}/edit`)
                            }
                        >
                            <EditIcon />
                        </IconButton>

                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="primary"
                            onClick={() => {
                                const receiverId = params?.row?.receiver_id;
                                const senderId = params?.row?.sender_id;
                                const userId = (senderId == SESSION_USER_ID) ? receiverId : senderId
                                const messageId = params?.row?.id;

                                if (!messageId || !userId) {
                                    console.log("No receiverId");
                                    return
                                }
                                
                                navigate(`/${SESSION_USER_ROLE}/messaging/${messageId}/user/${userId}/edit`)
                            }}
                        >
                            <ChatIcon />
                        </IconButton>

                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="error"
                            onClick={async () => {
                                const status = await deleteMessageService({ messageId: params.row.id });
                                if (status) initializeStateHelper();
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </div>
                );
            },
        },
    ];

    return {
        menu,
        navigate,
        SESSION_USER_ROLE,
        SESSION_USER_ID,
        rows: messages,
        action,
        columns,
        slug,
    };
};
