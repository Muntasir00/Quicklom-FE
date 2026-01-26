import axios from "axios";
import Swal from 'sweetalert2';


export const getAvailabilitiesService = async () => {
    try {
        const response = await axios.get(`/v.1/professional/availability`);
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error('Error fetching availabilities:', error);
        return [];
    }
};


export const getAvailabilityCalendarService = async (startDate = null, endDate = null) => {
    try {
        let url = `/v.1/professional/availability/calendar`;
        const params = new URLSearchParams();

        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await axios.get(url);
        if (response.data?.status === false) {
            return { availabilities: [], booked_contracts: [] };
        }
        return response.data.data;
    } catch (error) {
        console.error('Error fetching availability calendar:', error);
        return { availabilities: [], booked_contracts: [] };
    }
};


export const createAvailabilityService = async (availabilityData) => {
    try {
        const response = await axios.post(`/v.1/professional/availability`, availabilityData);

        if (response.data?.status === false) {
            Swal.fire("Error!", response.data.message || "Failed to create availability.", "error");
            return false;
        }

        Swal.fire("Success!", "Availability created successfully!", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error creating availability:", error);
        const errMsg = error.response?.data?.message ||
                       error.response?.data?.error ||
                       "An unexpected error occurred.";

        Swal.fire("Error!", errMsg, "error");
        return false;
    }
};


export const updateAvailabilityService = async (availabilityId, availabilityData) => {
    try {
        const response = await axios.put(
            `/v.1/professional/availability/${availabilityId}`,
            availabilityData
        );

        if (response.data?.status === false) {
            Swal.fire("Error!", response.data.message || "Failed to update availability.", "error");
            return false;
        }

        Swal.fire("Success!", "Availability updated successfully!", "success");
        return response.data.data;
    } catch (error) {
        console.error("Error updating availability:", error);
        const errMsg = error.response?.data?.message ||
                       error.response?.data?.error ||
                       "An unexpected error occurred.";

        Swal.fire("Error!", errMsg, "error");
        return false;
    }
};


export const deleteAvailabilityService = async (availabilityId) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) {
            return false;
        }

        const response = await axios.delete(`/v.1/professional/availability/${availabilityId}`);

        if (response.data?.status === false) {
            Swal.fire("Error!", response.data.message || "Failed to delete availability.", "error");
            return false;
        }

        Swal.fire("Deleted!", "Availability has been deleted.", "success");
        return true;
    } catch (error) {
        console.error("Error deleting availability:", error);
        const errMsg = error.response?.data?.message ||
                       error.response?.data?.error ||
                       "An unexpected error occurred.";

        Swal.fire("Error!", errMsg, "error");
        return false;
    }
};
