import React from "react";
import IconButton from "@mui/material/IconButton";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const ActionButtons = ({ userId, userRole, onDelete }) => {
    const navigate = useNavigate();

    return (
        <div className="button-group" style={{ display: "flex" }}>
            <IconButton
                size="small"
                style={{ padding: 2 }}
                color="secondary"
                onClick={() => { console.log("Email clicked", userId) }}
            >
                <EmailIcon fontSize="small" />
            </IconButton>

            <IconButton
                size="small"
                style={{ padding: 2 }}
                color="primary"
                onClick={() => navigate(`/${userRole}/users/${userId}/edit`)}
            >
                <EditIcon fontSize="small" />
            </IconButton>

            <IconButton
                size="small"
                style={{ padding: 2 }}
                color="error"
                onClick={async () => {
                    if (onDelete) await onDelete(userId);
                }}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        </div>
    );
};

export default ActionButtons;
