import { API_BASE_URL } from "@config/apiConfig";
import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const UserProfileModal = ({ show, setShow, userProfile }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const profile = userProfile?.profile || {};
    const showSensitive = false; // Always keep sensitive information hidden

    // Define sensitive fields that should be masked
    const sensitiveFields = [
        "phone",
        "phone_number",
        "mobile",
        "email",
        "address",
        "street",
        "home_address",
        "residential_address",
        "national_id",
        "passport",
        "ssn",
        "social_security",
        "tax_id",
        "bank_account",
        "iban",
        "date_of_birth",
        "dob",
        "birth_date",
        "emergency_contact",
        "next_of_kin",
        "primary_contact_name",
        "agency_name",
        "business_number",
        "first_name",
        "last_name",
        "profile_photo",
        "id_upload",
        "license_number",
        "license_number_detail",
        "license_document",
        "educational_institution",
        "postal_code",
        "city",
        "notes",
        "additional_info",
    ];

    const isSensitiveField = (key) => {
        const lowerKey = key.toLowerCase();
        return sensitiveFields.some(field => lowerKey.includes(field));
    };

    const maskValue = (value) => {
        if (!value) return value;

        if (typeof value === "string") {
            // Mask email
            if (value.includes("@")) {
                const [username, domain] = value.split("@");
                return `${username.substring(0, 2)}${"*".repeat(Math.max(3, username.length - 2))}@${domain}`;
            }
            // Mask phone numbers
            if (/^\+?[\d\s\-()]+$/.test(value) && value.replace(/\D/g, "").length >= 7) {
                return `****${value.slice(-4)}`;
            }
            // Mask other sensitive strings (show first 2 and last 2 characters)
            if (value.length > 8) {
                return `${value.substring(0, 2)}${"*".repeat(value.length - 4)}${value.slice(-2)}`;
            }
            return "*".repeat(Math.min(value.length, 8));
        }

        return "***";
    };

    const formatValue = (key, value) => {
        if (!value) return "-";

        // Check if this is a sensitive field and mask it if needed
        if (isSensitiveField(key) && !showSensitive) {
            return <span className="text-muted font-italic">{maskValue(value)}</span>;
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.join(", ");
        }

        // Handle nested objects
        if (typeof value === "object" && value !== null) {
            return Object.entries(value)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ");
        }

        // Handle uploaded files (starting with 'uploads/')
        if (typeof value === "string" && value.startsWith("uploads/")) {
            return <span className="text-muted font-italic">🔒 Hidden for privacy</span>;
        }

        return value;
    };

    const renderRows = () => {
        try {
            const removeKeys = [
                "position_sought_ids",
                "professional_role_ids",
                "professional_category_id",
                "institute_category_id",
                "institute_specialty_ids",
            ];

            const entries = Object.entries(profile).filter(([key]) => !removeKeys.includes(key));
            const rows = [];

            for (let i = 0; i < entries.length; i += 2) {
                const [key1, value1] = entries[i];
                const nextEntry = entries[i + 1];
                const [key2, value2] = nextEntry || ["", ""];

                const isSensitive1 = isSensitiveField(key1);
                const isSensitive2 = key2 ? isSensitiveField(key2) : false;

                rows.push(
                    <tr key={i} className="align-middle">
                        <th className={`bg-light ${isSensitive1 ? 'border-start border-3 border-warning' : ''}`}>
                            <div className="d-flex align-items-center">
                                {isSensitive1 && <span className="me-1" title="Sensitive Information">🔒</span>}
                                {key1.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                        </th>
                        <td>{formatValue(key1, value1)}</td>
                        {key2 ? (
                            <>
                                <th className={`bg-light ${isSensitive2 ? 'border-start border-3 border-warning' : ''}`}>
                                    <div className="d-flex align-items-center">
                                        {isSensitive2 && <span className="me-1" title="Sensitive Information">🔒</span>}
                                        {key2.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </div>
                                </th>
                                <td>{formatValue(key2, value2)}</td>
                            </>
                        ) : (
                            <>
                                <th className="bg-light"></th>
                                <td></td>
                            </>
                        )}
                    </tr>
                );
            }

            return rows;
        } catch (error) {
            console.error("Error", error);
            return [];
        }
    };

    return (
        <Modal show={show} size="xl" onHide={() => setShow(false)} centered>
            <Modal.Header className="bg-primary text-white border-0">
                <Modal.Title style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                    👤 User Profile Details
                </Modal.Title>
                <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close"
                    onClick={() => setShow(false)}
                ></button>
            </Modal.Header>

            <Modal.Body className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Privacy Notice */}
                <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                    <span className="me-2">🔒</span>
                    <div>
                        <strong>Privacy Protection Active</strong>
                        <p className="mb-0 small">Sensitive information and attachments are permanently hidden to protect user privacy and prevent identification</p>
                    </div>
                </div>

                <div className="modal-component">
                    {/* User Overview Card */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h6 className="mb-0 text-primary">📋 User Overview</h6>
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-bordered table-sm mb-0">
                                <tbody>
                                    <tr className="align-middle">
                                        <th className="bg-light" width="15%">Username</th>
                                        <td width="18%">{userProfile.user_name || "-"}</td>
                                        <th className="bg-light border-start border-3 border-warning" width="15%">
                                            <div className="d-flex align-items-center">
                                                <span className="me-1" title="Sensitive Information">🔒</span>
                                                User Email
                                            </div>
                                        </th>
                                        <td width="18%">
                                            {showSensitive ? (
                                                userProfile.user_email || "-"
                                            ) : (
                                                <span className="text-muted font-italic">
                                                    {maskValue(userProfile.user_email)}
                                                </span>
                                            )}
                                        </td>
                                        <th className="bg-light" width="18%">Profile Status</th>
                                        <td width="16%">
                                            <span className={`badge ${
                                                userProfile.profile_status === "approved" ? "bg-success" :
                                                userProfile.profile_status === "pending" ? "bg-warning" :
                                                userProfile.profile_status === "rejected" ? "bg-danger" :
                                                "bg-secondary"
                                            }`}>
                                                {userProfile.profile_status || "-"}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Profile Details Card */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h6 className="mb-0 text-primary">📝 Profile Details</h6>
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-bordered table-sm mb-0">
                                <tbody>{renderRows()}</tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </Modal.Body>

            <Modal.Footer className="bg-light border-0">
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Close
                </Button>
            </Modal.Footer>

            <style jsx>{`
                .table th {
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                .table td {
                    font-size: 0.875rem;
                }
                .card {
                    border: none;
                }
                .card-header {
                    border-bottom: 2px solid #dee2e6;
                }
            `}</style>
        </Modal>
    );
};

export default UserProfileModal;