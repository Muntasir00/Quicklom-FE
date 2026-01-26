import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";
import { getInstituteSpecialityWithCategory } from "@services/admin/InstituteSpecialtyService";

const InstituteSpecialityInfoModal = ({ show, setShow, specialtyId }) => {
    const [speciality, setSpeciality] = useState(null);
    
    const fetchData = async () => {
        try {
            const response = await getInstituteSpecialityWithCategory(specialtyId);
            setSpeciality(response);
        } catch (error) {
            console.error("Failed to fetch speciality info:", error);
        }
    };
    
    useEffect(() => {
        if (show && specialtyId) fetchData();
    }, [show, specialtyId]);

    return (
        <Modal show={show} size="lg" onHide={() => setShow(false)}>
            <Modal.Header>
                <Modal.Title style={{ fontSize: "1rem" }}>
                    Institute Speciality Information
                </Modal.Title>
                 <button type="button" class="close" aria-label="Close" onClick={() => {setShow(false); setSpeciality(null)}}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </Modal.Header>
            <Modal.Body>
                {speciality ? (
                    <div className="border p-4" style={{ background: "#fff" }}>
                        <table className="table table-bordered mb-3">
                            <tbody>
                                <tr>
                                    <th style={{ width: "30%" }}>Category Name</th>
                                    <td>{speciality.institute_category?.name || "-"}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "30%" }}>Speciality Name</th>
                                    <td className="text-capitalize">{speciality.name || "-"}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <td>{speciality.status ? "Active" : "Inactive"}</td>
                                </tr>
                                <tr>
                                    <th>Created At</th>
                                    <td>{new Date(speciality.created_at).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th>Updated At</th>
                                    <td>{new Date(speciality.updated_at).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center">No speciality data available</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {setShow(false); setSpeciality(null)}}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InstituteSpecialityInfoModal;
