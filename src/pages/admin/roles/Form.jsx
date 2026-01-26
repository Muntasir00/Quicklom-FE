import React from "react";
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Typography,
    FormControlLabel,
    Checkbox,
    Grid,
    Paper,
} from "@mui/material";

const Form = ({ register, errors, permissions }) => {
    return (
        <Box component="form">
            <Grid container spacing={3}>
                {/* Name Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Name"
                        placeholder="Enter role name"
                        {...register("name")}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>

                {/* Status Field */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.status}>
                        <InputLabel shrink>Status</InputLabel>
                        <Select
                            label="Status"
                            defaultValue="1"
                            {...register("status")}
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            <MenuItem value="1">Active</MenuItem>
                            <MenuItem value="0">Inactive</MenuItem>
                        </Select>
                        {errors.status && (
                            <FormHelperText>{errors.status?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                {/* Permissions */}
                <Grid item xs={12} md={6}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            borderColor: errors.permission_ids ? '#ef4444' : '#e2e8f0',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#475569',
                                mb: 1.5,
                            }}
                        >
                            Permissions <span style={{ color: '#ef4444' }}>*</span>
                        </Typography>
                        {permissions?.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {permissions.map((permission) => (
                                    <FormControlLabel
                                        key={permission.id}
                                        control={
                                            <Checkbox
                                                value={permission.id}
                                                {...register("permission_ids")}
                                                size="small"
                                                sx={{
                                                    color: '#94a3b8',
                                                    '&.Mui-checked': {
                                                        color: '#3b82f6',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    color: '#475569',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {permission?.name}
                                            </Typography>
                                        }
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>
                                No permissions available.
                            </Typography>
                        )}
                        {errors.permission_ids && (
                            <Typography sx={{ fontSize: 12, color: '#ef4444', mt: 1 }}>
                                {errors.permission_ids?.message}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Description Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Description"
                        placeholder="Enter description"
                        multiline
                        rows={4}
                        {...register("description")}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Form;
