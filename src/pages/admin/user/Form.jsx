import React from "react";
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
} from "@mui/material";

const Form = ({ register, errors, roles = [] }) => {
    return (
        <Box component="form">
            <Grid container spacing={3}>
                {/* Email Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        {...register("email")}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputLabelProps={{ shrink: true }}
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>

                {/* Name Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Name"
                        placeholder="Enter full name"
                        {...register("name")}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        InputLabelProps={{ shrink: true }}
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>

                {/* Password Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        placeholder="Enter password"
                        {...register("password")}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>

                {/* Confirm Password Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm password"
                        {...register("confirm_password")}
                        error={!!errors.confirm_password}
                        helperText={errors.confirm_password?.message}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>

                {/* Role Field */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.role_id}>
                        <InputLabel shrink>Role</InputLabel>
                        <Select
                            label="Role"
                            defaultValue=""
                            {...register("role_id")}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">Select Role</MenuItem>
                            {roles.map(role => (
                                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                            ))}
                        </Select>
                        {errors.role_id && (
                            <FormHelperText>{errors.role_id?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                {/* Status Field */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.status}>
                        <InputLabel shrink>Status</InputLabel>
                        <Select
                            label="Status"
                            defaultValue="0"
                            {...register("status")}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="1">Active</MenuItem>
                            <MenuItem value="0">Inactive</MenuItem>
                        </Select>
                        {errors.status && (
                            <FormHelperText>{errors.status?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Form;
