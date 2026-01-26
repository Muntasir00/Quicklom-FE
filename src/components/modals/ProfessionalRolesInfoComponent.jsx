import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { getProfessionalCategoryWithRolesService } from "@services/admin/ProfessionalCategoryService";

const ProfessionalRolesInfoComponent = ({ show, setShow, categoryId }) => {
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getProfessionalCategoryWithRolesService(categoryId);
            setCategory(response);
        } catch (err) {
            console.error("Failed to fetch category info:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && categoryId) fetchData();
    }, [show, categoryId]);

    return (
        <Modal show={show} size="lg" onHide={() => setShow(false)}>
            <Modal.Header>
                <Modal.Title style={{ fontSize: "1rem" }}>Professional Category Information</Modal.Title>
                <button type="button" class="close" aria-label="Close" onClick={() => {setShow(false); setCategory(null)}}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </Modal.Header>
            <Modal.Body>
                <div className="border p-4" style={{ maxWidth: "900px", margin: "auto", background: "#fff" }}>
                    {category ? (
                        <div className="info-table">
                            <table className="table table-bordered mb-3">
                                <tbody>
                                    <tr>
                                        <th style={{ width: "25%" }}>Category Name</th>
                                        <td>{category[0]?.name || "-"}</td>
                                    </tr>
                                    <tr>
                                        <th>Description</th>
                                        <td>{category[0]?.description || "-"}</td>
                                    </tr>
                                    <tr>
                                        <th>Created At</th>
                                        <td>{category[0]?.created_at ? new Date(category[0]?.created_at).toLocaleString() : "-"}</td>
                                    </tr>
                                    <tr>
                                        <th>Updated At</th>
                                        <td>{category[0]?.updated_at ? new Date(category[0]?.updated_at).toLocaleString() : "-"}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className="table table-bordered mb-3">
                                <thead>
                                    <tr>
                                        <th colSpan={2} className="text-center">Professional Roles</th>
                                    </tr>
                                    <tr>
                                        <th>#</th>
                                        <th style={{ width: "95%" }}>Role Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {category[0]?.professional_roles && category[0]?.professional_roles.length > 0 ? (
                                        category[0]?.professional_roles.map((role) => (
                                            <tr key={role.id}>
                                                <td>{role.id || "-"}</td>
                                                <td>{role.name ?? "-"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="text-center">No roles found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        !loading && <p className="text-center">No category info available</p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {setShow(false); setCategory(null)}}>
                    <span>Close</span>
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProfessionalRolesInfoComponent;
