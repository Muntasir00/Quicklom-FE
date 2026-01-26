import axios from "axios";
import Swal from "sweetalert2";

const API_RESOURCE = "professional";

export const getContactsService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/contacts`);
        if (response.data?.status === false) return [];
        const rawData = response?.data?.data;

        if (!Array.isArray(rawData) || !rawData.length){
            console.log("No contacts data returned");
            return [];
        }

        // Return the raw data as-is to preserve the structure with contracts
        // The data structure is: [{ user_id, user: {...}, contracts: [...] }, { admins: [...] }]
        return rawData;

    } catch (error) {
        console.error("Error occurred:", error);
        const apiError = error.response?.data;

        if (apiError?.errors) {
            const firstErrorMessage = Object.values(apiError.errors).flat().join("\n");
            Swal.fire("Error", firstErrorMessage, "error");
        } 

        return [];
    }
};