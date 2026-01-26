import React, { useState, useEffect } from "react";
import { getNotificationsService } from "@services/admin/NotificationService";
import { useNavigate } from "react-router-dom";
import { Chip, IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { upperCaseWords } from "@utils/StringUtils";
import { SESSION_KEYS, SessionUtil } from "@utils/SessionUtils";

import { GridActionsCellItem } from "@mui/x-data-grid";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const useViewNotifications = () => {
    const menu = "notifications";
    const action = "View";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);
    const [notifications, setNotifications] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    

    const initializeStateHelper = async () => {
        try {
            const notificationsData = await getNotificationsService();
            setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        document.title = `${upperCaseWords(menu) ?? "Quicklocum"} | Quicklocum`;
    }, []);

    const columns = [
        { field: "id", headerName: "#", width: 70 },
        { field: "title", headerName: "Title", minWidth: 200, flex: 1 },
        { field: "message", headerName: "Message", minWidth: 250, flex: 1 },
        {
            field: "status",
            headerName: "Status",
            minWidth: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Read" : "Unread"}
                    color={params.value ? "success" : "warning"}
                    size="small"
                />
            ),
        },
        {
            field: "created_at",
            headerName: "Created At",
            minWidth: 150,
            flex: 1,
            renderCell: (params) => 
                params.value ? new Date(params.value).toLocaleString() : "-",
            },
        {
            field: "updated_at",
            headerName: "Updated At",
            minWidth: 100,
            flex: 1,
            renderCell: (params) => 
                params.value ? new Date(params.value).toLocaleString() : "-",
            },
        // {
        //     field: "actions",
        //     headerName: "Actions",
        //     maxWidth: 80,
        //     renderCell: (params) => (
        //         <div className="action-btns ">
        //             <Tooltip title="View Notification">
        //                 <IconButton
        //                     className="d-none"
        //                     size="small"
        //                     color="primary"
        //                     //onClick={() => navigate(`/${SESSION_USER_ROLE}/notifications/${params.row.id}/view`)}
        //                 >
        //                     <VisibilityIcon />
        //                 </IconButton>
        //             </Tooltip>
        //             <Tooltip title="Delete Notification">
        //                 <IconButton
        //                     className="d-none"
        //                     size="small"
        //                     color="error"
        //                     onClick={() => console.log("Delete", params.row.id)}
        //                 >
        //                     <DeleteIcon />
        //                 </IconButton>
        //             </Tooltip>
        //         </div>
        //     ),
        // },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            minWidth: 100,
            flex: 1,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<OpenInNewIcon color="primary" />}
                    label="View Notification"
                    onClick={() => {
                        const affectedEntity = params.row.data?.affected_entity;
                        const affectedEntityId = params.row.data?.affected_entity_id || "";
                        const path = affectedEntity && affectedEntityId
                            ? `/${SESSION_USER_ROLE}/${affectedEntity}?affected_entity_id=${affectedEntityId}`
                            : `/${SESSION_USER_ROLE}/notifications`;
                        navigate(path);
                    }}
                />,
            ],
        },
    ];

    return {
        menu,
        navigate,
        SESSION_USER_ROLE,
        rows: notifications,
        action,
        columns,
        slug,
        showCreateForm,
        setShowCreateForm,
    };
};
