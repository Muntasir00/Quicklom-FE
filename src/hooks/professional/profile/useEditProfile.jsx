import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCategoryService } from "@services/professional/ProfessionalCategoryService";
import { updateProfessionalProfileService, getProfessionalProfileService } from "@services/professional/ProfileService";

export const useEditProfile = () => {
    const menu = "Profile";
    const role = sessionStorage.getItem("role");
    const { id } = useParams();

    const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : []);
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;

    const [categories, setCategories] = useState([]);
    const [profileData, setProfileData] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const [structureLocumMainFormData, setStructureLocumMainFormData] = useState({});
    const [structureLocumLicenseFormData, setStructureLocumLicenseFormData] = useState({});
    const [mainFormData, setMainFormData] = useState({
        professional_category_id: "",
        professional_role_ids: [],
    });

    const initializeStateHelper = React.useCallback(async () => {
        try {
            const categoriesData = await getCategoryService()
            setCategories(categoriesData ?? []);

            const response = await getProfessionalProfileService();
            if (!response?.data) return;
            setMainFormData((prev) => ({
                ...prev,
                professional_category_id: response.data.professional_category_id || "",
                professional_role_ids: response.data.professional_role_ids || [],
            }));
            setProfileData((prev) => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error("Error:", error);
        }
    }, []);

    useEffect(() => {
        initializeStateHelper();
        document.title = `${menu} | Quicklocum`;
    }, []);

    const handleFormSubmit = async (locumLicenseFormData) => {
        try {
            const payload = { ...mainFormData, ...structureLocumMainFormData, ...locumLicenseFormData };
            const fileKeys = ["profile_photo", "id_upload", "license_document"];
            const formData = new FormData();

            fileKeys.forEach((field) => {
                let file = null;

                if (isFile(structureLocumMainFormData[field])) file = structureLocumMainFormData[field];
                else if (isFileList(structureLocumMainFormData[field]) && structureLocumMainFormData[field].length) file = structureLocumMainFormData[field][0];
                
                else if (isFile(locumLicenseFormData[field])) file = locumLicenseFormData[field];
                else if (isFileList(locumLicenseFormData[field]) && locumLicenseFormData[field].length) file = locumLicenseFormData[field][0];

                if (isFile(file) || isFileList(file)) {
                    payload[field] = null;
                    formData.append(field, file);
                }
            });

            formData.append("data", JSON.stringify(payload));
            console.log("Form data:", Object.fromEntries(formData.entries()));
            
            const response = await updateProfessionalProfileService(id, formData)
            if (response) initializeStateHelper();
        } catch (error) {
            console.error("Error occured: ", error)
        } 
    }
    
    return {
        menu,
        categories,
        profileData,
        currentStep,
        setCurrentStep,
        totalSteps,
        structureLocumMainFormData,
        setStructureLocumMainFormData,
        structureLocumLicenseFormData,
        setStructureLocumLicenseFormData,
        mainFormData,
        setMainFormData,
        handleFormSubmit,
    };
};
