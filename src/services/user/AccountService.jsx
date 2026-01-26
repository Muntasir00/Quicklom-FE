import React from 'react';
import axios from "axios";
import Swal from 'sweetalert2';

export const getAccountService = async () => {
    try {
        const response = await axios.get(`/v.1/user/account`);
        
        if (response.data?.status === false) {
            Swal.fire("Error!", "Something went wrong.", "error");
            return;
        }
               
        return response.data.data;
    } catch (error) {
        console.error('Error occured:', error);
    }
}

export const updateAccount = async (formData) => {
    try {
        const response = await axios.put(`/v.1/user/account/update`, formData);
        
        if (response.data?.status === false) {
            Swal.fire("Error!", "Something went wrong.", "error");
            return;
        }
        
        Swal.fire("Success!", "Profile updated successfully!", "success");
    } catch (error) {
        console.error("Error updating profile:", error);
        let errMsg = "An unexpected error occurred.";

        if (error.response?.data?.error) {
            errMsg = error.response.data.error;
        } else if (error.response?.data?.errors) {
            const errorsObj = error.response.data.errors;
            const firstKey = Object.keys(errorsObj)[0];
            errMsg = errorsObj[firstKey][0];
        }

        Swal.fire("Error!", errMsg, "error");
    } 
};


export const sendVerificationTokenService = async ({ email }) => {
    try {
        if (!email) return Swal.fire("Warning!", "Please enter your email", "warning");

        // Ask for confirmation
        const result = await Swal.fire({
            title: "Send Verification Email?",
            text: "A verification email will be sent to your entered address.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, send it!",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) return;

        const response = await axios.post(`/v.1/user/account/send-verification-token`,  { email });

        // Check response status
        if (response.data.status === false) {
            Swal.fire({
                title: "Opps!",
                text: "Something went wrong",
                icon: "error"
            });
            return;
        }

        // Success message
        Swal.fire({
            title: "Sent!",
            text: "Verification email has been sent successfully!",
            icon: "success"
        });

    } catch (error) {
        console.error("Error occurred while sending verification email:", error);
        Swal.fire({
            title: "Error!",
            text: "Failed to send verification email. Please try again.",
            icon: "error"
        });
    }
};


export const updateAccountEmail = async (formData) => {
    try {
        const response = await axios.put(`/v.1/user/account/update/email`, formData);
        
        if (response.data?.status === false) {
            Swal.fire("Opps!", "Something went wrong.", "error");
            return false;
        }

        setTimeout(() => {
            Swal.fire("Success!", "Email updated successfully!", "success");
        }, 500); 

        return true;

    } catch (error) {
        console.error("Error updating email:", error);
        const errMsg =
            error.response?.data?.error ||                // custom error from backend
            error.response?.data?.errors?.[0] ||          // validation errors (if array)
            "An unexpected error occurred.";              // fallback
        
        setTimeout(() => {
            Swal.fire("Error!", errMsg, "error");
        }, 500); 

        return false;
    } 
};