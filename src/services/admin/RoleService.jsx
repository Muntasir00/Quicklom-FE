import axios from "axios";
import Swal from "sweetalert2";



export const getRolesService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/roles`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getRoleByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/roles/${id}`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }

        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Error!", "Something went wrong.", "error");
        Swal.fire("Error!", "Unable to fetch role.", "error");
        return null;
    }
};

export const createRoleService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/roles/create`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.log(response.data?.error);
            return null;
        }

        Swal.fire("Success!", "Role created successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const updateRoleService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/roles/${id}/update`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.log(response.data?.error);  
            return null;
        }

        Swal.fire("Success!", "Role updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};


export const deleteRoleService = async (id) => {
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

        const response = await axios.delete(`/v.1/admin/roles/${Number(id?.roleId)}/delete`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.log(response.data?.error);
            return false;
        }

        Swal.fire("Deleted!", "Role has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};
