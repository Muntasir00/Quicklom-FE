import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const showContractService = async (id) => {
    try {
        const response = await axios.get(`/v.1/user/contracts/${id}/show`);
        if (response.data?.status === false) return null;
        const data = response?.data?.data?.data;
        console.log("data: ", data);
        return data ?? null;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return null;
    }
};