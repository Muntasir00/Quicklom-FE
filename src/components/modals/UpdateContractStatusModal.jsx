import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { CONTRACT_STATUS, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from "@constants/ContractConstants";
import { useUpdateContractStatus } from "@hooks/admin/contracts/useUpdateContractStatus";
import { Chip, Box } from "@mui/material";

const UpdateContractStatusModal = ({ show, setShow, contract, onRefresh }) => {
    const {
        register,
        errors,
        handleSubmit,
        FORM_ID,
        onSubmit,
        watch
    } = useUpdateContractStatus(contract, () => {
        setShow(false);
        onRefresh?.();
    });

    const selectedStatus = watch?.("status") || contract?.status;

    return (
        <Modal show={show} size="md" onHide={() => setShow(false)} centered>
            <Modal.Header style={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
                <Modal.Title style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                    Update Contract Status
                </Modal.Title>
                <button
                    type="button"
                    className="close"
                    aria-label="Close"
                    style={{ color: 'white', opacity: 1 }}
                    onClick={() => setShow(false)}
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </Modal.Header>
            <Modal.Body>
                <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label fw-bold mb-2">
                            Current Status
                        </label>
                        <div>
                            <Chip
                                label={CONTRACT_STATUS_LABELS[contract?.status] || contract?.status || "Unknown"}
                                color={CONTRACT_STATUS_COLORS[contract?.status] || "default"}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label fw-bold mb-2" htmlFor="contractStatus">
                            New Status <span className="text-danger">*</span>
                        </label>
                        <select
                            {...register("status")}
                            className="form-control"
                            id="contractStatus"
                            style={{ fontSize: '0.95rem', padding: '10px 12px' }}
                        >
                            {Object.entries(CONTRACT_STATUS).map(([key, value]) => (
                                <option key={key} value={value}>
                                    {CONTRACT_STATUS_LABELS[value] || value}
                                </option>
                            ))}
                        </select>
                        {errors?.status && (
                            <span className="text-danger mt-1 d-block">
                                <strong>{errors.status.message}</strong>
                            </span>
                        )}
                    </div>

                    {selectedStatus && selectedStatus !== contract?.status && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                            <div className="d-flex align-items-center gap-2">
                                <span style={{ fontSize: '0.9rem' }}>Status will change:</span>
                                <Chip
                                    label={CONTRACT_STATUS_LABELS[contract?.status] || contract?.status}
                                    color={CONTRACT_STATUS_COLORS[contract?.status] || "default"}
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                />
                                <span style={{ fontSize: '1.2rem' }}>→</span>
                                <Chip
                                    label={CONTRACT_STATUS_LABELS[selectedStatus] || selectedStatus}
                                    color={CONTRACT_STATUS_COLORS[selectedStatus] || "default"}
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                />
                            </div>
                        </Box>
                    )}
                </form>
            </Modal.Body>
            <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', background: '#fafafa' }}>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Cancel
                </Button>
                <Button form={FORM_ID ?? ""} type="submit" variant="primary">
                    Update Status
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UpdateContractStatusModal;
