import React, { useState, useEffect } from "react";
import { getPositionSoughtsService, deletePositionSoughtService } from "@services/admin/PositionSoughtService";
import { useNavigate } from "react-router-dom";
import { Chip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const useViewPositionSought = () => {
    const menu = "position soughts";
    const action = "View";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [positions, setPositions] = useState([]);

    const initializeStateHelper = async () => {
        try {
            const positionsData = await getPositionSoughtsService();
            setPositions(Array.isArray(positionsData) ? positionsData : []);
        } catch (error) {
            console.error("Error fetching position soughts:", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        document.title = `${menu ?? "Quicklocum"} | Quicklocum`;
    }, []);

    const columns = [
        { field: "id", headerName: "#", maxWidth: 50, flex: 1 },
        { field: "name", headerName: "Position Name", minWidth: 200, flex: 1 },
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
            maxWidth: 100,
            flex: 1,
            renderCell: (params) => {
                return (
                    <div className="action-btns">
                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="primary"
                            onClick={() =>
                                navigate(`/${sessionUserRole}/position-soughts/${params.row.id}/edit`)
                            }
                        >
                            <EditIcon />
                        </IconButton>

                        <IconButton
                            size="small"
                            style={{ padding: 2 }}
                            color="error"
                            onClick={async () => {
                                const status = await deletePositionSoughtService({ positionId: params.row.id });
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
        sessionUserRole,
        rows: positions,
        action,
        columns,
        slug,
    };
};
