import { useState, useEffect } from "react";
import { getContactsService } from "@services/institute/ContactService";
import { useNavigate } from "react-router-dom";
import { Chip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { upperCaseWords } from "@utils/StringUtils";
import {SESSION_KEYS, SessionUtil} from "@utils/SessionUtils";
import CommentIcon from "@mui/icons-material/Comment";
import ChatIcon from "@mui/icons-material/Chat";



export const useViewContacts = () => {
    const menu = "contacts";
    const action = "View";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const SESSION_USER_ROLE = SessionUtil.get(SESSION_KEYS.USER_ROLE);
    const [contacts, setContacts] = useState([]);

    const initializeStateHelper = async () => {
        try {
            const contactsData = await getContactsService();
            setContacts(Array.isArray(contactsData) ? contactsData : []);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        document.title = `${upperCaseWords(menu) ?? "Quicklocum"} | Quicklocum`;
    }, []);

    const columns = [
        { field: "id", headerName: "#", width: 70 },
        { field: "name", headerName: "Name", minWidth: 200, flex: 1 },
        { field: "email", headerName: "Email", minWidth: 250, flex: 1 },
        {
            field: "status",
            headerName: "Status",
            minWidth: 80,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Active" : "Inactive"}
                    color={params.value ? "success" : "error"}
                    size="small"
                    style={{ cursor: "pointer" }}
                />
            ),
        },
        { field: "created_at", headerName: "Created At", minWidth: 150, flex: 1 },
        { field: "updated_at", headerName: "Updated At", minWidth: 150, flex: 1 },
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
                            onClick={() => navigate(`/${SESSION_USER_ROLE}/messaging/user/${params.row.id}/create`)}
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
        rows: contacts,
        action,
        columns,
        slug,
    };
};
