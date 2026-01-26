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

const Form = ({ register, errors, professionalCategories }) => {
    return (
        <Box component="form">
            <Grid container spacing={3}>
                {/* Professional Category Field */}
                <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.professional_category_id}>
                        <InputLabel shrink>Professional Category *</InputLabel>
                        <Select
                            label="Professional Category *"
                            defaultValue=""
                            {...register("professional_category_id")}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">Select Category</MenuItem>
                            {professionalCategories?.length > 0 && professionalCategories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.professional_category_id && (
                            <FormHelperText>{errors?.professional_category_id?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>

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
