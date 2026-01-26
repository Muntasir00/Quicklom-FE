import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { CONTRACT_APPLICATION_STATUS } from "@constants/ContractApplicationConstants";
import { useUpdateContractApplicantStatus } from "@hooks/institute/contract-applicants/useUpdateContractApplicantStatus";

const UpdateContractApplicantStatusModal = ({ show, setShow, contract, onRefresh }) => {
    const {
        register,
        errors,
        handleSubmit,
        FORM_ID,
        onSubmit
    } = useUpdateContractApplicantStatus(contract, () => {
        setShow(false); // callback functions
        onRefresh?.(); // callback functions
    });

    return (
        <Modal show={show} size="md" onHide={() => setShow(false)}>
            <Modal.Header>
                <Modal.Title style={{ fontSize: "1rem" }}>
                    <span>Update Application Status</span>
                </Modal.Title>
                <button type="button" className="close" aria-label="Close"
                    onClick={() => {
                        setShow(false);
                    }}
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </Modal.Header>
            <Modal.Body>
                <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label className="control-label" htmlFor="contractStatus">Application Status <span className="text-red">*</span></label>
                                <select {...register("status")} className="form-control" id="contractStatus">
                                    {
                                        Object.entries(CONTRACT_APPLICATION_STATUS).map(([key, value]) => (
                                            <option key={key} value={value}>
                                                {value.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </option>
                                        ))
                                    }
                                </select>
                                <span className={`text-danger ${typeof errors !== "undefined" && errors.status ? "" : "d-none"}`}>
                                    {typeof errors !== "undefined" && errors.status && (
                                        <strong>{errors.status.message}</strong>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => { setShow(false); }}>
                    Close
                </Button>
                <Button form={FORM_ID ?? ""} type="submit" variant="primary" >
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UpdateContractApplicantStatusModal;
