import React from 'react';
import axios from "axios";
import Swal from 'sweetalert2';

export const getCategoryService = async () => {
    try {
        const response = await axios.get(`/v.1/professional/professional-categories`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error occured:', error);
    }
}