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
                {/* Province/Territory Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Province/Territory"
                        placeholder="Enter Province/Territory"
                        {...register("province_territory")}
                        error={!!errors.province_territory}
                        helperText={errors.province_territory?.message}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>

                {/* Abbreviation Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Abbreviation"
                        placeholder="Enter Abbreviation"
                        {...register("abbreviation")}
                        error={!!errors.abbreviation}
                        helperText={errors.abbreviation?.message}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>

                {/* Official Name Field */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Official Name in English"
                        placeholder="Enter Official Name"
                        {...register("official_name")}
                        error={!!errors.official_name}
                        helperText={errors.official_name?.message}
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
