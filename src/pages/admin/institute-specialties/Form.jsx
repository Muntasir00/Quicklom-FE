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

const Form = ({ register, errors, instituteCategories }) => {
    return (
        <Box component="form">
            <Grid container spacing={3}>
                {/* Institute Category Field */}
                <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.institute_category_id}>
                        <InputLabel shrink>Institute Category *</InputLabel>
                        <Select
                            label="Institute Category *"
                            defaultValue=""
                            {...register("institute_category_id")}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">Select Category</MenuItem>
                            {instituteCategories?.length > 0 && instituteCategories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.institute_category_id && (
                            <FormHelperText>{errors?.institute_category_id?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                {/* Name Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Name"
                        placeholder="Enter specialty name"
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
