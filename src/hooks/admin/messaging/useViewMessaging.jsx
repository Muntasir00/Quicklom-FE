import React, { useState, useEffect } from "react";
import { getMessagesService, deleteMessageService, getUsersMessageService } from "@services/admin/MessagingService";
import { useNavigate } from "react-router-dom";
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
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);
    const SESSION_USER_ID = SessionUtil.get(SESSION_KEYS.USER_ID);
    const [messages, setMessages] = useState([]);
    const [usersMessages, setusersMessages] = useState([]);
    const [tab, setTab] = useState(2);
    
    const initializeStateHelper = async () => {
        try {
            const messagesData = await getMessagesService();
            const usersMessegesData = await getUsersMessageService();

            setMessages(Array.isArray(messagesData) ? messagesData : []);
            setusersMessages(Array.isArray(usersMessegesData) ? usersMessegesData : []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        document.title = `${upperCaseWords(menu) ?? "Quicklocum"} | Quicklocum`;
    }, []);

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

    const usersMessagesColumns = [
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
            maxWidth: 80,
            //flex: 1,
            renderCell: (params) => {
                return (
                    <div className="action-btns">
                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="primary"
                            onClick={() => {
                                const receiverId = params?.row?.receiver_id;
                                const senderId = params?.row?.sender_id;
                                if (!receiverId || !senderId) return;
                                navigate(`/${SESSION_USER_ROLE}/messaging/users/${receiverId}/${senderId}/show`)
                            }}
                        >
                            <ChatIcon />
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
        rows: messages,
        action,
        columns,
        slug,
        tab,
        setTab,
        rowsUsersMessages: usersMessages,
        columnsUsersMessages: usersMessagesColumns,
    };
};
