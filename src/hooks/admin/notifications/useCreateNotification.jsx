import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notificationSchema } from "@schemas/admin/NotificationSchema";
import { getUsersService } from "@services/admin/UserService";
import { createNotificationService } from "@services/admin/NotificationService";
import { useNavigate } from "react-router-dom";

export const useCreateNotification = (setShow) => {
    const menu = "Notifications";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [users, setUsers] = useState([]);
    const FORM_ID = "notification-form";
    const action = "Create";

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            title: "",
            message: "",
            user_ids: [], // multiple user IDs
            //send_to_all: false,
            //status: "1",
        },
    });

    const initializeStateHelper = async () => {
        try {
            const usersData = await getUsersService();
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        document.title = `${menu ?? "Quicklocum"} | Quicklocum`;
    }, []);

    const onSubmit = async (data) => {
        try {
            console.log("Submitting notification:", data);
            const status = await createNotificationService(data);
            if (status) setShow(false); 
        } catch (error) {
            console.error("Error creating notification:", error);
        }
    };

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        users,
        menu,
        sessionUserRole,
        FORM_ID,
        action,
        slug,
        watch,
        setValue,
    };
};
