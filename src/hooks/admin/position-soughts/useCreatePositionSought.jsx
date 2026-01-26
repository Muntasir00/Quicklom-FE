import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { positionSoughtSchema } from "@schemas/admin/PositionSoughtSchema";
import { getProfessionalCategoriesService } from "@services/admin/ProfessionalCategoryService";
import { createPositionSoughtService } from "@services/admin/PositionSoughtService";
import { useNavigate } from "react-router-dom";

export const useCreatePositionSought = () => {
    const menu = "position soughts";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [professionalCategories, setProfessionalCategories] = useState([]);
    const FORM_ID = "position-sought-form";
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
        resolver: zodResolver(positionSoughtSchema),
        defaultValues: {
            name: "",
            professional_category_id: "",
            status: "1",
        },
    });

    const initializeStateHelper = async () => {
        try {
            const professionalCategoriesData = await getProfessionalCategoriesService();
            setProfessionalCategories(Array.isArray(professionalCategoriesData) ? professionalCategoriesData : []);
        } catch (error) { 
            console.error("Error fetching professional categories:", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
        document.title = `${menu ?? "Quicklocum"} | Quicklocum`;
    }, []);

    const onSubmit = async (data) => {
        try {
            console.log("Form submitted:", data);
            const status = await createPositionSoughtService(data);
            if (status) navigate(`/${sessionUserRole}/position-soughts`);
        } catch (error) {
            console.error("Error creating position sought:", error);
        }
    };

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,       
        professionalCategories,
        menu,
        sessionUserRole,
        FORM_ID,
        action,
        slug,
    };
};
