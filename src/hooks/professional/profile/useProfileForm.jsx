import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormSchema } from "@schemas/professional/ProfileFormSchema";

/**
 * Custom hook for managing the professional profile form
 * @param {Object} params
 * @param {Array} params.categories - List of professional categories
 * @param {Object} params.profileData - Existing profile data to pre-fill form
 * @param {Function} params.setMainFormData - Function to update parent form data
 * @param {Function} params.setCurrentStep - Function to move to next step in multi-step form
*/
export const useProfileForm = ({ categories, profileData, setMainFormData, setCurrentStep }) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ProfileFormSchema(categories)),
        defaultValues: {
            professional_category_id: "",
            professional_role_ids: [],
            specialist_dentist_role: "",
        },
    });

    const professional_category_id = watch("professional_category_id");
    const professional_role_ids = watch("professional_role_ids");
    const selectedCategory = categories.find(cat => String(cat.id) === professional_category_id);
    const [selectedRoleName, setSelectedRoleName] = useState(null);
    const [isCategoryChanged, setIsCategoryChanged] = useState(false);
    
    const handleCheckboxChange = (id) => {
        try {
            const current = watch("professional_role_ids") || [];
            let updated = [];
            if (current.includes(id)) {
                updated = current.filter(item => item !== id);
            } else {
                updated = [...current, id];
            }
            setValue("professional_role_ids", updated, { shouldValidate: true });
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const onSubmit = (data) => {
        try {
            console.log("Form Data:", data);
            setMainFormData(data);
            setCurrentStep((prev) => prev + 1);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    useEffect(() => {
        if (profileData) {
            reset({
                professional_category_id: profileData.professional_category_id || "",
                professional_role_ids: profileData.professional_role_ids || [],
                specialist_dentist_role: profileData.specialist_dentist_role || "",
            });
        }
    }, [profileData, reset]);

    // helper to reset roles when category changes
    useEffect(() => {
        if (!isCategoryChanged) return;
        setValue("professional_role_ids", [], { shouldValidate: true });
        setValue("specialist_dentist_role", "");
    }, [selectedCategory, setValue, isCategoryChanged]);

    // get rolename when category changes
    useEffect(() => {
        try {
            if (professional_role_ids.length <= 0) return;
            const selectedRole = selectedCategory?.professional_roles?.find(role => role.id === professional_role_ids[0]);
            const roleName = selectedRole ? selectedRole.name.trim().toLowerCase() : null;
            setSelectedRoleName(roleName);
        } catch (error) {
            console.error("Error in retreiving role name:", error);
        }
    }, [professional_role_ids, selectedCategory, setValue]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        watch,
        selectedCategory,
        handleCheckboxChange,
        setIsCategoryChanged,
        selectedRoleName,
        setValue,
    };
};
