import axios from "axios";
import Swal from "sweetalert2";

export const getPositionSoughtsService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/position-soughts`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};

export const getPositionSoughtByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/position-soughts/${id}`);
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

export const createPositionSoughtService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/position-soughts/create`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }
        Swal.fire("Success!", "Position created successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const updatePositionSoughtService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/position-soughts/${id}/update`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.log(response.data?.error);
            return null;
        }
        Swal.fire("Success!", "Position updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const deletePositionSoughtService = async (id) => {
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

        const response = await axios.delete(`/v.1/admin/position-soughts/${Number(id?.positionId)}/delete`);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.log(response.data?.error);
            return false;
        }

        Swal.fire("Deleted!", "Position has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};
