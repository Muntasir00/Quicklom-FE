import React from 'react';
import axios from "axios";
import Swal from 'sweetalert2';

export const getActionLogService = async ({filters} = {}) => {
    try {
        const response = await axios.get(`/v.1/admin/action-logs`, {
            params: {
                role_id: filters?.role_id || "",
                created_at: filters?.created_at || "",
                action_type: filters?.action_type || "",
                log_type: filters?.log_type || "",
                action_status: filters?.action_status || "",
                email: filters?.email || "",
                professional_category_id: filters?.professional_category_id || "",
                institute_category_id: filters?.institute_category_id || "",
            }
        });
        
        if (response.data.success === false) return [];
        console.log(response.data.data);
        return response.data.data; 
    } catch (error) {
        console.error('Error occurred:', error);
        return [];
    }
}
