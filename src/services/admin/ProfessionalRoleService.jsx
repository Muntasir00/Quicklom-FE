import axios from "axios";
import Swal from "sweetalert2";


export const getProfessionalRolesService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/professional-roles`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};


export const getProfessionalRoleByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/professional-roles/${id}`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const createProfessionalRoleService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/professional-roles/create`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }

        Swal.fire("Success!", "Professional role created successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const updateProfessionalRoleService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/professional-roles/${id}/update`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.log(response.data?.error);
            return null;
        }

        Swal.fire("Success!", "Professional role updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};


export const deleteProfessionalRoleService = async (id) => {
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "#d33",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return false;

        const response = await axios.delete(`/v.1/admin/professional-roles/${Number(id?.roleId)}/delete`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.log(response.data?.error);
            return false;
        }

        Swal.fire("Deleted!", "Professional role has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};
