import axios from "axios";
import Swal from "sweetalert2";

export const getInstituteSpecialtiesService = async () => {
    try {
        const response = await axios.get(`/v.1/admin/institute-specialties`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return [];
    }
};

export const getInstituteSpecialityWithCategory = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/institute-specialty/${id}/category`);
        if (response.data?.status === false) return [];
        return response?.data?.data[0];
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};


export const getInstituteSpecialtyByIdService = async (id) => {
    try {
        const response = await axios.get(`/v.1/admin/institute-specialties/${id}`);
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

export const createInstituteSpecialtyService = async (payload) => {
    try {
        const response = await axios.post(`/v.1/admin/institute-specialties/create`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            return null;
        }
        Swal.fire("Success!", "Institute specialty created successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};

export const updateInstituteSpecialtyService = async (id, payload) => {
    try {
        const response = await axios.put(`/v.1/admin/institute-specialties/${id}/update`, payload);
        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.error("Error:", response.data?.error);
            return null;
        }
        Swal.fire("Success!", "Institute specialty updated successfully.", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Error!", "Unable to update specialty.", "error");
        return null;
    }
};

export const deleteInstituteSpecialtyService = async (id) => {
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

        const response = await axios.delete(`/v.1/admin/institute-specialties/${Number(id?.specialtyId)}/delete`);

        if (response.data?.status === false) {
            Swal.fire("Oops!", "Something went wrong.", "error");
            console.error("Error:", response.data?.error);
            return false;
        }

        Swal.fire("Deleted!", "Institute specialty has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};
