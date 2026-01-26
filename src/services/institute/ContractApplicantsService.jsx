import axios from "axios";
import Swal from "sweetalert2";

const API_RESOURCE = "institute";


export const getContractApplicantsService = async ({ filters } = {}) => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/contract-applicants`, {
            params: {
                applicant_name: filters?.applicant_name || "",
                applicant_email: filters?.applicant_email || "",
                contract_type_id: filters?.contract_type_id || "",
                status: filters?.status || "",
                start_date: filters?.start_date || "",
                end_date: filters?.end_date || "",
                applied_start_date: filters?.applied_start_date || "",
                applied_end_date: filters?.applied_end_date || "",
            }
        });

        if (response.data?.status === false) return [];
        return response?.data?.data;
    } catch (error) {
        console.error("Error occurred while fetching applicants:", error);
        return [];
    }
};

/**
 * Get distinct contract types from user's published contracts
 */
export const getUserContractTypesService = async () => {
    try {
        const response = await axios.get(`/v.1/${API_RESOURCE}/contract-types/published`);

        if (response.data?.status === false) return [];
        return response?.data?.data || [];
    } catch (error) {
        console.error("Error occurred while fetching contract types:", error);
        return [];
    }
};

/**
 * Accept a contract applicant
 * @param {Object} payload - The payload containing application ID and optional candidate ID
 * @param {number} payload.applicationId - The application ID to accept
 * @param {number} [payload.candidateId] - Optional candidate ID (for recruitment agencies)
 * @returns {boolean} true if acceptance successful, false otherwise
 */
export const acceptContractApplicant = async ({ applicationId, candidateId = null }) => {
    try {
        const result = await Swal.fire({
            title: "Accept Applicant",
            text: candidateId
                ? "Are you sure you want to accept this candidate?"
                : "Are you sure you want to accept this applicant?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, accept!",
            confirmButtonColor: "#10b981",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return false;

        const response = await axios.put(
            `/v.1/${API_RESOURCE}/contract-applicants/${applicationId}/accept`,
            {
                application_id: applicationId,
                candidate_id: candidateId
            }
        );

        if (response.data?.status === false) {
            Swal.fire("Error", response.data?.message || "Failed to accept applicant.", "error");
            return false;
        }

        Swal.fire("Success!", "Applicant accepted successfully!", "success");
        return true;
    } catch (error) {
        console.error("Error occurred while accepting applicant:", error);
        const apiError = error.response?.data;
        const statusCode = error.response?.status;

        // Handle contract overlap error (409 Conflict)
        if (statusCode === 409 && apiError?.error_code === "CONTRACT_OVERLAP") {
            const conflicts = apiError?.data?.conflicting_contracts || [];
            let conflictDetails = "";

            if (conflicts.length > 0) {
                conflictDetails = "<br><br><strong>Conflicting contracts:</strong><ul style='text-align: left; margin-top: 10px;'>";
                conflicts.forEach(c => {
                    conflictDetails += `<li>Contract #${c.id}: ${c.start_date} to ${c.end_date} (${c.status})</li>`;
                });
                conflictDetails += "</ul>";
            }

            Swal.fire({
                title: "Cannot Accept - Schedule Conflict",
                html: `This applicant already has a contract booked during this period. A professional cannot work on overlapping contracts.${conflictDetails}`,
                icon: "warning",
                confirmButtonText: "OK"
            });
            return false;
        }

        Swal.fire("Oops!", apiError?.message || "Something went wrong.", "error");
        return false;
    }
};

/**
 * Reject a contract applicant
 * @param {Object} payload - The payload containing application ID
 * @param {number} payload.applicationId - The application ID to reject
 * @param {number} [payload.candidateId] - Optional candidate ID (for future use)
 * @returns {boolean} true if rejection successful, false otherwise
 */
export const rejectContractApplicant = async ({ applicationId, candidateId = null }) => {
    try {
        const result = await Swal.fire({
            title: "Reject Applicant",
            text: "Are you sure you want to reject this applicant? This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, reject",
            confirmButtonColor: "#ef4444",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return false;

        const response = await axios.put(
            `/v.1/${API_RESOURCE}/contract-applicants/${applicationId}/reject`,
            {
                application_id: applicationId,
                candidate_id: candidateId
            }
        );

        if (response.data?.status === false) {
            Swal.fire("Error", response.data?.message || "Failed to reject applicant.", "error");
            return false;
        }

        Swal.fire("Success!", "Applicant rejected successfully!", "success");
        return true;
    } catch (error) {
        console.error("Error occurred while rejecting applicant:", error);
        Swal.fire("Oops!", error.response?.data?.message || "Something went wrong.", "error");
        return false;
    }
};

/**
 * Update the status of a contract applicant (LEGACY - use accept/reject instead)
 * @param {Object} payload - The payload containing applicant object.
 * @param {Object} payload.applicant - The applicant to update.
 * @returns {boolean} true if update successful, false otherwise.
 */
export const updateContractApplicantsStatus = async ({ applicant }) => {
    try {
        const result = await Swal.fire({
            title: "Warning",
            text: "This action will change the applicant's status permanently.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, update it!",
            confirmButtonColor: "#3085d6",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return false;

        const response = await axios.put(
            `/v.1/${API_RESOURCE}/contract-applicants/${applicant?.id}/update/status`,
            {},
            {
                params: {
                    status: applicant?.status || "",
                },
            }
        );

        if (response.data?.status === false) {
            Swal.fire("Error", "Failed to update applicant status.", "error");
            return false;
        }

        Swal.fire("Success!", "Applicant status updated successfully!", "success");
        return true;
    } catch (error) {
        console.error("Error occurred while updating applicant status:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};


export const updateContractApplicantStatusService = async ({ contractId, payload }) => {
    try {
        if (!contractId) return Swal.fire("Error!", "Invalid contract ID.", "error");
        const response = await axios.put(`/v.1/${API_RESOURCE}/contract-applicants/${contractId}/update/status`, payload);
        if (response.data.status === false) return Swal.fire("Oops!", "Something went wrong.", "error");
        Swal.fire("Success!", "Contract status updated successfully!", "success");
        return true;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire("Oops!", "Something went wrong.", "error");
        return false;
    }
};