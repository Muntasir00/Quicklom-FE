import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const RolesListModal = ({ show, setShow, role }) => {
    return (
        <Modal show={show} size="lg" onHide={() => setShow(false)}>
            <Modal.Header>
                <Modal.Title style={{ fontSize: "1rem" }}>Professional Role</Modal.Title>
                <button
                    type="button"
                    className="close"
                    aria-label="Close"
                    onClick={() => setShow(false)}
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </Modal.Header>

            <Modal.Body>
                <div className="model-component">
                    {role ? (
                        <table className="table table-bordered">
                            <tbody>
                                <tr>
                                    <th style={{ width: "25%" }}>ID</th>
                                    <td>{role.id}</td>
                                </tr>
                                <tr>
                                    <th>Name</th>
                                    <td>{role.name}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <td>{role.status ? "Active" : "Inactive"}</td>
                                </tr>
                                <tr>
                                    <th>Category ID</th>
                                    <td>{role.professional_category_id}</td>
                                </tr>
                                <tr>
                                    <th>Created At</th>
                                    <td>{role.created_at ? new Date(role.created_at).toLocaleString() : "-"}</td>
                                </tr>
                                <tr>
                                    <th>Updated At</th>
                                    <td>{role.updated_at ? new Date(role.updated_at).toLocaleString() : "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center">No role selected</p>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RolesListModal;
