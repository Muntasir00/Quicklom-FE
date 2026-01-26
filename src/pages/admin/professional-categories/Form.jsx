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

const Form = ({ register, errors }) => {
    return (
        <Box component="form">
            <Grid container spacing={3}>
                {/* Name Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Name"
                        placeholder="Enter category name"
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
