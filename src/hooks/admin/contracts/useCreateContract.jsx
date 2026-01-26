import { useState, useEffect } from 'react';
import { Chip } from "@mui/material";
import { Radio } from "@mui/material";
import Swal from 'sweetalert2';

import { getUserContractTypesService } from "@services/user/ContractTypeService";
import { getUsersService } from "@services/admin/UserService";

import { CONTRACT_FORM_IDS_LIST } from "@constants/ContractFormConstants";
import { CONTRACT_FORM_HOOKS_LIST } from "@constants/AdminContractFormHooksConstants";
import { CONTRACT_COMPONENTS_LIST } from "@constants/ContractComponentsConstants";


export const useCreateContract = () => {
    // component state
    const menu = "contracts";
    const action = "create";
    
    // staps state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;
    
    // auth user state
    const sessionUserRole = sessionStorage.getItem("role")?.toLowerCase();
    const sessionUserId = sessionStorage.getItem("user_id");    
    
    // contracts state
    const [selectedContract, setSelectedContract] = useState(null);
    const ContractForm = CONTRACT_COMPONENTS_LIST[selectedContract];
    const ContractFormHook = CONTRACT_FORM_HOOKS_LIST[selectedContract];
    const [contractTypes, setContractTypes] = useState([]);
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({ profile_status: "approved" });
    const [selectedUserId, setSelectedUserId] = useState(null);
    
    const initializeStateHelper = async () => {
        try {
            const usersData = await getUsersService({filters});
            setUsers(usersData ?? []);
        } catch(error){
            console.error("Error in initializing states:", error);
        }
    };


    const columns = [
        {field: "#", headerName: "#", maxWidth: 50,
            renderCell: (params) => (
                <Radio
                    checked={ selectedUserId === params.row.id }
                    onChange={ async () => {
                            try {
                                if (!params?.row?.id) return;
                                setSelectedUserId(params.row.id);
                                sessionStorage.setItem("selected_contract_user_id", params.row.id);
                                const userContractTypesData = await getUserContractTypesService(params.row.id);
                                setContractTypes(Array.isArray(userContractTypesData) ? userContractTypesData : []);
                            } catch(error){
                                console.error("Error in getting user contract types:", error);
                            }
                        }
                    }
                />
            ),
        },
        // { field: "id", headerName: "#", maxWidth: 50, flex: 1 },
        { field: "name", headerName: "Name", minWidth: 150, flex: 1 },
        { field: "email", headerName: "Email", minWidth: 150, flex: 1 },
        { field: "role", headerName: "Role", minWidth: 120, 
            renderCell: (params) => params.value ? params.value.name : "-" 
        },
        {
            field: "category",
            headerName: "Category",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => {
                const profile = params.row?.profiles?.[0];

                const professionalCategories = Array.isArray(profile?.professional_category)
                    ? profile.professional_category
                    : profile?.professional_category
                    ? [profile.professional_category]
                    : [];

                const instituteCategories = Array.isArray(profile?.institute_category)
                    ? profile.institute_category
                    : profile?.institute_category
                    ? [profile.institute_category]
                    : [];

                return (
                    professionalCategories.map(c => c.name).join(", ") ||
                    instituteCategories.map(c => c.name).join(", ") ||
                    "-"
                );
            }
        },
        {
            field: "profile",
            headerName: "Profile",
            maxWidth: 120,
            flex: 1,
            renderCell: (params) => {
                const profile = params?.row?.profiles?.[0];
                const status = profile?.status || "incomplete";

                const color =
                    status === "approved" ? "success" :
                    status === "pending" ? "warning" :
                    status === "rejected" ? "error" :
                    status === "under_review" ? "info" :
                    status === "incomplete" ? "primary" :
                    status === "suspended" ? "secondary" :
                    "default";

                return (
                    <Chip
                        label={status.replace(/_/g, " ").toUpperCase()}
                        color={color}
                        size="small"
                        style={{ cursor: "pointer" }}
                    />
                );
            },
        },
        { field: "status", headerName: "Status", maxWidth: 90,
            renderCell: (params) => (
                <Chip 
                    label={params.value ? "Active" : "Inactive"} 
                    color={params.value ? "success" : "error"} 
                    size="small"
                    style={{ cursor: "pointer" }}
                />
            ),
        },
    ];
        
    useEffect(() => {
        initializeStateHelper();
        selectedUserId
            ? sessionStorage.setItem("selected_contract_user_id", selectedUserId)
            : sessionStorage.removeItem("selected_contract_user_id");
        document.title = "Contracts | Quicklocum";
    }, []);
    
    return {
        menu,
        action,
        currentStep,
        setCurrentStep,
        totalSteps,
        sessionUserRole,
        sessionUserId,
        selectedContract,
        setSelectedContract,
        contractTypes,
        setContractTypes,
        ContractForm,
        ContractFormHook,
        CONTRACT_FORM_IDS_LIST,
        columns,
        users,
    }
};