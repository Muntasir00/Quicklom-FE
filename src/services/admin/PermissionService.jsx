import axios from "axios";
import Swal from "sweetalert2";

export const getPermissionsService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/permissions`);
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getPermissionByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/permissions/${id}`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.error("Error response:", response.data);
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const createPermissionService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/permissions`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.error("Error response:", response.data);
            return null;
        }

        Swal.fire("Success!", "Permission created successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const updatePermissionService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/permissions/${id}/update`, payload);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.error("Error response:", response.data);
            return null;
        }

        Swal.fire("Success!", "Permission updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};


export const deletePermissionService = async (id) => {
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

        const response = await axios.delete(`/v.1/admin/permissions/${Number(id?.permissionId)}`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.error("Error response:", response.data);
            return false;
        }

        Swal.fire("Deleted!", "Permission has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};
