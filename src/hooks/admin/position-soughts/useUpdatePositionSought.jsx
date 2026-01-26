import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { positionSoughtSchema } from "@schemas/admin/PositionSoughtSchema";
import { getProfessionalCategoriesService } from "@services/admin/ProfessionalCategoryService";
import { getPositionSoughtByIdService, updatePositionSoughtService } from "@services/admin/PositionSoughtService";
import { Link, useNavigate, useParams } from "react-router-dom";


export const useUpdatePositionSought = () => {
    const menu = "position soughts";
    const slug = menu.toLowerCase().replace(/\s+/g, "-");
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const { id: positionId  } = useParams();
    const [professionalCategories, setProfessionalCategories] = useState([]);
    const FORM_ID = "position-sought-form";
    const action = "Edit";

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(positionSoughtSchema),
        defaultValues: {
            name: "",
            professional_category_id: "",
            status: "",
        },
    });


    const initializeStateHelper = async () => {
        try {
            const professionalCategoriesData = await getProfessionalCategoriesService();
            setProfessionalCategories(Array.isArray(professionalCategoriesData) ? professionalCategoriesData : []);

            const positionSoughtData = await getPositionSoughtByIdService(positionId);
            if (!positionSoughtData || Object.keys(positionSoughtData).length <= 0) return;
            reset({
                name: positionSoughtData?.name, 
                status: positionSoughtData?.status ? "1" : "0", 
                professional_category_id: positionSoughtData?.professional_category_id
            });
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
            console.log("Update payload:", data);
            const status = await updatePositionSoughtService(positionId, data);
            if (status) navigate(`/${sessionUserRole}/position-soughts`);
        } catch (error) {
            console.error("Error updating position sought:", error);
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
        positionId,
        FORM_ID,
        action,
        slug,
    };
};
