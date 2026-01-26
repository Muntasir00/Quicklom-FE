import Swal from 'sweetalert2';
import axios from 'axios';
import { RoleResolver } from "@utils/UserRoleResolver"


export const logoutService = async (event) => {
    event.preventDefault();

    // Show confirmation dialog
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to logout!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, logout!"
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.post('v.1/user/logout');
            if (response.data.status === false) return;
            sessionStorage.clear();      // remove all session storage items
            return true;
        } catch (error) {
            const errData = error.response?.data?.detail;

            if (errData?.status === false) {
                Swal.fire({
                    icon: "error",  
                    title: "Oops...",  
                    text: errData?.error || 'An error occurred.'  
                }).then(() => {
                    setTimeout(() => {
                        sessionStorage.clear();      // remove all session storage items
                        window.location.href = "/login"; 
                        return true;
                    }, 100);
                });
            }

            return false;
        }
    }

    return false; 
};


export const loginService = async (event, formData) => {
    event.preventDefault();

    try {
        const response = await axios.post("v.1/user/login", {email: formData.email,  password: formData.password,});
        
        if (response.data.status === false) return false;
        
        sessionStorage.setItem('access_token', response.data.data.access_token);
        sessionStorage.setItem('refresh_token', response.data.data.refresh_token);
        sessionStorage.setItem('user_id', response.data.data.id);

        // Store user name from profile or fallback to email
        const userName = response.data.data.profiles?.[0]?.name ||
                         response.data.data.name ||
                         response.data.data.email?.split('@')[0] ||
                         'User';
        sessionStorage.setItem('name', userName);

        const userRole = RoleResolver(response?.data?.data?.role);

        if (userRole) {
            sessionStorage.setItem('role', userRole);
        }

        if (userRole && userRole === "institute") {
            const instituteCategoryId = response?.data?.data?.institute_category_id;
            const instituteCategoryName = response?.data?.data?.profiles?.[0]?.institute_category?.name;

            if (instituteCategoryId && instituteCategoryName) {
                sessionStorage.setItem('institute_category_id', instituteCategoryId);
                sessionStorage.setItem('institute_category_name', instituteCategoryName);
            }
        }

        if (userRole === "professional") {
            const professionalCategoryId = response?.data?.data?.professional_category_id;

            if (professionalCategoryId && !sessionStorage.getItem('professional_category_id')) {
                sessionStorage.setItem('professional_category_id', professionalCategoryId);
            }
        }
        
        return true;
    } catch (error) {
        console.error("Axios error:", error);
        if (error.response) {
            console.error("Response Status:", error.response.status);
            console.error("Response Data:", error.response.data);
            console.error("Error Message:", error.response.data.error);
            console.error("Status:", error.response.data.status);
            Swal.fire({icon: "error", title: "Error!", text: error.response.data.error || "Internal Server occured"});
            return false;
        } else {
            Swal.fire({icon: "error", title: "Login Failed", text: "Please contact the admin"});
            console.error("Error Message:", error.message);
            return false;
        }
    }
};
// Add this function to AuthService.jsx

export const getCurrentUserService = async () => {
    try {
        const response = await axios.get('/v.1/user/account');

        if (response.data?.status === false) {
            throw new Error('Failed to fetch user data');
        }

        const userData = response.data.data;

        return {
            id: userData.id || parseInt(sessionStorage.getItem('user_id')),
            email: userData.email,
            name: userData.name,
            // Get institute_category_id from top level (added by backend) or from profile
            institute_category_id: userData.institute_category_id || userData.profiles?.[0]?.institute_category_id,
            institute_category_name: userData.institute_category_name || userData.profiles?.[0]?.institute_category?.name,
            profiles: userData.profiles || [],
            role: userData.role,
            // Include full user data in case you need it
            full_data: userData
        };
    } catch (error) {
        console.error('Error getting current user:', error);

        // Fallback to sessionStorage
        const userId = sessionStorage.getItem('user_id');
        if (userId) {
            return {
                id: parseInt(userId),
                email: null,
                name: null,
                institute_category_id: parseInt(sessionStorage.getItem('institute_category_id')),
                institute_category_name: sessionStorage.getItem('institute_category_name'),
                profiles: [],
                role: null
            };
        }

        throw error;
    }
};