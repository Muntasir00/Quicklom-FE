import axios from "axios";
import Swal from "sweetalert2";

export const getPositionSoughtsService = async () => {
    try {
        const response = await axios.get(`/v.1/user/position-soughts`);
        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred:", error);
        return [];
    }
};


export const getPositionSoughtsByCategoryService = async (categoryId) => {
    try {
        if (!categoryId) return Swal.fire("Oops!", "Professional category is missing.", "error");
        const response = await axios.get(`/v.1/user/category/${categoryId}/position-soughts`);
        if (response.data?.status === false) return [];
        return response.data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return [];
    }
};
