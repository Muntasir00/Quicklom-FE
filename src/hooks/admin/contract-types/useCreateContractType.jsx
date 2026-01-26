import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractFormSchema } from "@schemas/admin/ContractFormSchema"; 
import { getRolesService } from "@services/admin/RoleService";
import { getInstituteCategoriesService } from "@services/admin/InstituteCategoryService";
import { getInstituteSpecialtiesService } from "@services/admin/InstituteSpecialtyService";
import { getProfessionalCategoriesService } from "@services/admin/ProfessionalCategoryService";
import { getProfessionalRolesService } from "@services/admin/ProfessionalRoleService";
import { createContractTypeService } from "@services/admin/ContractTypeService";
import { useNavigate } from "react-router-dom";

import { CONTRACT_TYPE_NAMES } from "@constants/ContractTypeConstants";
import { USER_ROLE } from "@constants/UserConstants";


export const useCreateContractType = (contractId = null) => {
    const [userRoles, setUserRoles] = useState([]);
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");

    const {
        register,
        control,
        handleSubmit,
        setValue,
        setError,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(contractFormSchema(userRoles)),
        defaultValues: {
            contract_name: "",
            role_id: "",
            institute_categories: [
                {
                    institute_category_id: "",        // string or naumber
                    institute_specialty_ids: []       // array of strings/numbers
                }
            ],
            professional_category_id: "",
            professional_role_ids: [],
            status: "",
        }
    });

    const roleId = watch("role_id"); 
    const professionalCategoryId = watch("professional_category_id");
    const roleName = roleId ? (userRoles.find(role => Number(role.id) === Number(roleId))?.name ?? "").toLowerCase() : "";
    
    const [instituteSpecialties, setInstituteSpecialties] = useState([]);
    const [instituteCategories, setInstituteCategories] = useState([]);
    const [professionalCategories, setProfessionalCategories] = useState([]);
    const [professionalRoles, setProfessionalRoles] = useState([]);
    const [instituteRows, setInstituteRows] = useState([{id: 1, name: ""}]);

    const categoryRoles = (professionalRoles ?? []).filter(
        item => Number(item.professional_category_id) === Number(professionalCategoryId)
    );

    const handleAddInstituteRow = () => {
        const lastId = instituteRows.length > 0 ? instituteRows[instituteRows.length - 1].id + 1 : 0;
        const newId =  lastId + 1;
        setInstituteRows([...instituteRows, {id: newId, name: ""}]);
    };

    const handleRemoveInstituteRow = (id) => {
        const filteredRows = instituteRows.filter(row => row.id!== id);
        setInstituteRows(filteredRows);
    };

    const initializeStateHelper = async () => {
        const userRolesData = await getRolesService();
        const instituteCategoriesData = await getInstituteCategoriesService();
        const instituteSpecialtiesData = await getInstituteSpecialtiesService();
        const professionalCategoriesData = await getProfessionalCategoriesService();
        const professionalRolesData = await getProfessionalRolesService();
        
        setInstituteSpecialties(Array.isArray(instituteSpecialtiesData)? instituteSpecialtiesData : []);
        setInstituteCategories(Array.isArray(instituteCategoriesData)? instituteCategoriesData : []);  
        setUserRoles(Array.isArray(userRolesData) ? userRolesData : []);
        setProfessionalCategories(Array.isArray(professionalCategoriesData)? professionalCategoriesData : []);
        setProfessionalRoles(Array.isArray(professionalRolesData)? professionalRolesData : []);
    };

    useEffect(() => { initializeStateHelper() }, []);

    useEffect(() => {
        setValue("institute_categories", [
            { institute_category_id: "", institute_specialty_ids: [] }
        ]);
    }, [roleId, setValue]);

    const onSubmit = async (data) => {
        try {
            console.log("Form submitted:", data);
            const status = await createContractTypeService(data);
            if (status) navigate(`/${sessionUserRole}/contract-types`);
        } catch (error) {
            console.error("Error creating contract type:", error);
        }
    };

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        roleName,      
        setValue,  
        reset,     
        setError,
        userRoles,
        instituteCategories,
        professionalCategories,
        categoryRoles,
        CONTRACT_TYPE_NAMES,
        instituteRows,
        handleAddInstituteRow,
        handleRemoveInstituteRow,
        watch,
        instituteSpecialties,
        USER_ROLE
    };
};
