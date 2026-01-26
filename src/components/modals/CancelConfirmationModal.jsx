import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Alert,
    Box,
    CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * Reusable Cancel Confirmation Modal
 * For both contract cancellation and application withdrawal
 *
 * @param {object} props
 * @param {boolean} props.open - Modal open state
 * @param {function} props.onClose - Close handler
 * @param {function} props.onConfirm - Confirm handler (async)
 * @param {string} props.title - Modal title
 * @param {string} props.message - Warning message
 * @param {string} props.type - 'contract' or 'application'
 * @param {number} props.id - Contract or application ID
 */
const CancelConfirmationModal = ({
    open,
    onClose,
    onConfirm,
    title = "Cancel Confirmation",
    message = "Are you sure you want to proceed?",
    type = "contract", // 'contract' or 'application'
    id
}) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        setWarning(null);

        try {
            const result = await onConfirm(id, reason);

            // Check if there's a warning in the response
            if (result?.warning) {
                setWarning(result.warning);
            }

            // If successful, close modal after showing warning (if any)
            if (result?.status) {
                setTimeout(() => {
                    handleClose();
                }, warning ? 3000 : 500);
            }
        } catch (err) {
            setError(err.response?.data?.warning || err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setReason('');
            setError(null);
            setWarning(null);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: 24
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <WarningAmberIcon color="warning" fontSize="large" />
                    <Typography variant="h6" fontWeight="600">
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Warning Message */}
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {message}
                </Alert>

                {/* Critical Warning about repeated cancellations */}
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="body2" fontWeight="600" gutterBottom>
                        ⚠️ IMPORTANT: Repeated Cancellations
                    </Typography>
                    <Typography variant="caption" display="block">
                        Repeated cancellations or withdrawals may result in account suspension or banning.
                        Please be mindful when committing to {type === 'contract' ? 'contracts' : 'applications'}.
                    </Typography>
                </Alert>

                {/* Reason Input */}
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason (Optional)"
                    placeholder="Provide a reason for this cancellation..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={loading}
                    sx={{ mb: 2 }}
                />

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Warning from API */}
                {warning && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        {warning}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                >
                    Keep {type === 'contract' ? 'Contract' : 'Application'}
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    variant="contained"
                    color="error"
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? 'Processing...' : `Cancel ${type === 'contract' ? 'Contract' : 'Application'}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelConfirmationModal;
