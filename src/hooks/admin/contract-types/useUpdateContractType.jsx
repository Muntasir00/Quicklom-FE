import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractFormSchema } from "@schemas/admin/ContractFormSchema";
import { getRolesService } from "@services/admin/RoleService";
import { getInstituteCategoriesService } from "@services/admin/InstituteCategoryService";
import { getInstituteSpecialtiesService } from "@services/admin/InstituteSpecialtyService";
import { getProfessionalCategoriesService } from "@services/admin/ProfessionalCategoryService";
import { getProfessionalRolesService } from "@services/admin/ProfessionalRoleService";
import { getContractTypeByIdService, updateContractTypeService } from "@services/admin/ContractTypeService";
import { useNavigate } from "react-router-dom";

import { CONTRACT_TYPE_NAMES } from "@constants/ContractTypeConstants";
import { USER_ROLE } from "@constants/UserConstants";


export const useUpdateContractType = (contractId) => {
    const [userRoles, setUserRoles] = useState([]);
    const [instituteSpecialties, setInstituteSpecialties] = useState([]);
    const [instituteCategories, setInstituteCategories] = useState([]);
    const [professionalCategories, setProfessionalCategories] = useState([]);
    const [professionalRoles, setProfessionalRoles] = useState([]);
    const navigate = useNavigate();
    const sessionUserRole = sessionStorage.getItem("role");
    const [instituteRows, setInstituteRows] = useState([{id: 1, name: ""}]);
    
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
    const instituteCategoryId = watch("institute_category_id");
    const professionalCategoryId = watch("professional_category_id");
    const roleName = roleId ? userRoles.find(role => Number(role.id) === Number(roleId))?.name ?? "" : "";

    const categorySpecialties = (instituteSpecialties ?? []).filter(
        item => Number(item.institute_category_id) === Number(instituteCategoryId)
    );

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

        // Remove row from react-hook-form
        const currentCategories = watch("institute_categories") || [];
        const updatedCategories = currentCategories.filter((_, i) => i !== (id-1));
        setValue("institute_categories", updatedCategories);
    };

    const initializeStateHelper = async () => {
        const userRolesData = await getRolesService();
        const instituteCategoriesData = await getInstituteCategoriesService();
        const instituteSpecialtiesData = await getInstituteSpecialtiesService();
        const professionalCategoriesData = await getProfessionalCategoriesService();
        const professionalRolesData = await getProfessionalRolesService();
        
        setUserRoles(Array.isArray(userRolesData) ? userRolesData : []);
        setInstituteCategories(Array.isArray(instituteCategoriesData) ? instituteCategoriesData : []);
        setInstituteSpecialties(Array.isArray(instituteSpecialtiesData) ? instituteSpecialtiesData : []);
        setProfessionalCategories(Array.isArray(professionalCategoriesData) ? professionalCategoriesData : []);
        setProfessionalRoles(Array.isArray(professionalRolesData) ? professionalRolesData : []);
    };

    const transformData = (data) => ({
        contract_name: data?.contract_name,
        role_id: data?.role_id,
        institute_categories: (data?.contract_type_categories || []).map(cat => ({
            institute_category_id: cat?.institute_category_id?.toString() || "",
            institute_specialty_ids: cat?.institute_specialty_ids?.map(id => id.toString()) || [],
        })),
        professional_category_id: data?.contract_type_categories?.[0]?.professional_category_id || "",
        professional_role_ids: data?.contract_type_categories?.[0]?.professional_role_ids || [],
        status: data?.status ? "1" : "0",
    });


    const fetchContract = async () => {
        if (!contractId) return;
        try {
            const data = await getContractTypeByIdService(contractId);
            if (!data || Object.keys(data).length <= 0) return; 
            reset(transformData(data));
            setInstituteRows(Array.isArray(data?.contract_type_categories) && data?.contract_type_categories?.map((cat, index) => ({ id: index + 1, name: "" }))); 
        } catch (error) {
            console.error("Error fetching contract type:", error);
        }
    };

    useEffect(() => { initializeStateHelper() }, []);
    useEffect(() => { fetchContract() }, [userRoles]);

    useEffect(() => {
        setValue("institute_categories", [
            { institute_category_id: "", institute_specialty_ids: [] }
        ]);
    }, [roleId, setValue]);

    const onSubmit = async (data) => {
        try {
            console.log("Update payload:", data);
            const status = await updateContractTypeService(contractId, data);
            if (status) navigate(`/${sessionUserRole}/contract-types`);
        } catch (error) {
            console.error("Error updating contract type:", error);
        }
    };

    return {
        register, 
        handleSubmit, 
        onSubmit, 
        errors, 
        roleName,
        userRoles,
        instituteCategories,
        categorySpecialties,
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
