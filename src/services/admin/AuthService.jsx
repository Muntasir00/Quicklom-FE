import Swal from 'sweetalert2';
import axios from 'axios';
import { RoleResolver } from "../../utils/UserRoleResolver"


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
            const response = await axios.post('v.1/admin/logout/');
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
                        return true;
                        window.location.href = "/admin/login"; 
                    }, 100);
                });
            }

            return false;
        }
    }

    return false; 
};



export const loginService = async (event, login, navigate) => {
    event.preventDefault();

    try {
        const response = await axios.post("v.1/admin/login", {email: login.email,  password: login.password,});
        if (response.data.status === false) return;
        sessionStorage.setItem('access_token', response.data.data.access_token); 
        sessionStorage.setItem('refresh_token', response.data.data.refresh_token);  
        sessionStorage.setItem('user_id', response.data.data.id); 
        sessionStorage.setItem('role', RoleResolver(response?.data?.data?.role));
        console.log(response.data.data);
        navigate("/admin/dashboard");
    } catch (error) {
        console.error("Axios error:", error);
        if (error.response) {
            console.error("Response Status:", error.response.status);
            console.error("Response Data:", error.response.data);
            console.error("Error Message:", error.response.data.error);
            console.error("Status:", error.response.data.status);
            Swal.fire({
                icon: "error",
                title: "Oops!",
                text: "Something went wrong. Please try again later.",
                confirmButtonText: "OK",
            });
        } else {
            console.error("Error Message:", error.message);
            Swal.fire({
                icon: "error",
                title: "Oops!",
                text: "Something went wrong. Please try again later.",
                confirmButtonText: "OK",
            });
        }
    }
};