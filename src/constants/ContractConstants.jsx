// Contract status values must match backend: app/models/contract_model.py ContractStatus enum
export const CONTRACT_STATUS = Object.freeze({
    PENDING: "pending",
    OPEN: "open",
    PENDING_SIGNATURE: "pending_signature",
    BOOKED: "booked",
    CLOSED: "closed",
    CANCELLED: "cancelled",
});

// Human-readable labels for contract statuses
export const CONTRACT_STATUS_LABELS = Object.freeze({
    pending: "Pending",
    open: "Open",
    pending_signature: "Pending Signature",
    booked: "Booked",
    closed: "Closed",
    cancelled: "Cancelled",
});

// Colors for contract status badges/chips
export const CONTRACT_STATUS_COLORS = Object.freeze({
    pending: "warning",
    open: "success",
    pending_signature: "info",
    booked: "primary",
    closed: "secondary",
    cancelled: "error",
});
