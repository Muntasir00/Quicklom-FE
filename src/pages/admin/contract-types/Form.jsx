import React from "react";
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    Typography,
    IconButton,
    Paper,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const ContractForm = ({ ContractFormHook, contractId = null }) => {
    const formId = "contract-form";
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        roleName,
        userRoles,
        instituteCategories,
        categorySpecialties,
        professionalCategories,
        categoryRoles,
        CONTRACT_TYPE_NAMES,
        instituteRows,
        handleAddInstituteRow,
        handleRemoveInstituteRow,
        watch,
        instituteSpecialties,
        USER_ROLE
    } = ContractFormHook(contractId);

    return (
        <Box component="form" id={formId} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                {/* Contract Name Field */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors?.contract_name}>
                        <InputLabel shrink>Contract Name *</InputLabel>
                        <Select
                            label="Contract Name *"
                            defaultValue=""
                            {...register("contract_name")}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">--select--</MenuItem>
                            {Object.entries(CONTRACT_TYPE_NAMES).map(([key, label]) => (
                                <MenuItem key={key} value={label}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors?.contract_name && (
                            <FormHelperText>{errors?.contract_name?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                {/* Role Field */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.role_id}>
                        <InputLabel shrink>Role *</InputLabel>
                        <Select
                            label="Role *"
                            defaultValue=""
                            {...register("role_id")}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">--select--</MenuItem>
                            {Array.isArray(userRoles) && userRoles.length > 0 ? (
                                userRoles.map(role =>
                                    [USER_ROLE.INSTITUTE].includes(role?.name?.toLowerCase()) && (
                                        <MenuItem key={role.id} value={role?.id}>
                                            {role?.name}
                                        </MenuItem>
                                    )
                                )
                            ) : (
                                <MenuItem disabled>No roles available</MenuItem>
                            )}
                        </Select>
                        {errors.role_id && (
                            <FormHelperText>{errors.role_id?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                {/* Institute Category Rows */}
                {instituteRows?.length > 0 && instituteRows.map((row, index) => {
                    const selectedCategoryId = watch(`institute_categories.${index}.institute_category_id`);
                    const categorySpecialtiesForRow = (instituteSpecialties ?? []).filter(
                        item => Number(item.institute_category_id) === Number(selectedCategoryId)
                    );

                    return (
                        <Grid
                            item
                            xs={12}
                            key={row.id}
                            sx={{ display: roleName?.toLowerCase() !== USER_ROLE.INSTITUTE ? 'none' : 'block' }}
                        >
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    borderColor: '#e2e8f0',
                                }}
                            >
                                <Grid container spacing={2} alignItems="flex-start">
                                    <Grid item xs={12} md={5}>
                                        <FormControl
                                            fullWidth
                                            error={!!errors?.institute_categories?.[index]?.institute_category_id}
                                        >
                                            <InputLabel shrink>Institute Category *</InputLabel>
                                            <Select
                                                label="Institute Category *"
                                                defaultValue=""
                                                {...register(`institute_categories.${index}.institute_category_id`)}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                <MenuItem value="">--select--</MenuItem>
                                                {Array.isArray(instituteCategories) && instituteCategories.length > 0 ? (
                                                    instituteCategories.map((category) => (
                                                        <MenuItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>No categories available</MenuItem>
                                                )}
                                            </Select>
                                            {errors?.institute_categories?.[index]?.institute_category_id && (
                                                <FormHelperText>
                                                    {errors?.institute_categories?.[index]?.institute_category_id?.message}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={5}>
                                        <FormControl
                                            fullWidth
                                            error={!!errors?.institute_categories?.[index]?.institute_specialty_ids}
                                        >
                                            <InputLabel shrink>Institute Specialty *</InputLabel>
                                            <Select
                                                multiple
                                                label="Institute Specialty *"
                                                defaultValue={[]}
                                                {...register(`institute_categories.${index}.institute_specialty_ids`)}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                {Array.isArray(categorySpecialtiesForRow) && categorySpecialtiesForRow.length > 0 ? (
                                                    categorySpecialtiesForRow.map((speciality) => (
                                                        <MenuItem key={speciality.id} value={speciality.id}>
                                                            {speciality.name}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>No specialties available</MenuItem>
                                                )}
                                            </Select>
                                            {errors?.institute_categories?.[index]?.institute_specialty_ids && (
                                                <FormHelperText>
                                                    {errors?.institute_categories?.[index]?.institute_specialty_ids?.message}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                                        {row?.id && row?.id === 1 ? (
                                            <IconButton
                                                onClick={handleAddInstituteRow}
                                                sx={{
                                                    backgroundColor: '#3b82f6',
                                                    color: '#fff',
                                                    '&:hover': { backgroundColor: '#2563eb' },
                                                }}
                                            >
                                                <AddRoundedIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                onClick={() => handleRemoveInstituteRow(row.id)}
                                                sx={{
                                                    backgroundColor: '#ef4444',
                                                    color: '#fff',
                                                    '&:hover': { backgroundColor: '#dc2626' },
                                                }}
                                            >
                                                <DeleteRoundedIcon />
                                            </IconButton>
                                        )}
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    );
                })}

                {/* Professional Category (Hidden) */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{ display: roleName !== "professional" ? 'none' : 'none' }}
                >
                    <FormControl fullWidth error={!!errors.professional_category_id}>
                        <InputLabel shrink>Professional Category *</InputLabel>
                        <Select
                            label="Professional Category *"
                            defaultValue=""
                            {...register("professional_category_id")}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">--select--</MenuItem>
                            {Array.isArray(professionalCategories) && professionalCategories.length > 0 ? (
                                professionalCategories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No categories available</MenuItem>
                            )}
                        </Select>
                        {errors.professional_category_id && (
                            <FormHelperText>{errors?.professional_category_id?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                {/* Professional Role (Hidden) */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{ display: roleName !== "professional" ? 'none' : 'none' }}
                >
                    <FormControl fullWidth error={!!errors.professional_role_ids}>
                        <InputLabel shrink>Professional Role *</InputLabel>
                        <Select
                            multiple
                            label="Professional Role *"
                            defaultValue={[]}
                            {...register("professional_role_ids")}
                            sx={{ borderRadius: 2 }}
                        >
                            {Array.isArray(categoryRoles) && categoryRoles.length > 0 ? (
                                categoryRoles.map((roles) => (
                                    <MenuItem key={roles.id} value={roles.id}>
                                        {roles.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No roles available</MenuItem>
                            )}
                        </Select>
                        {errors.professional_role_ids && (
                            <FormHelperText>{errors?.professional_role_ids?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                {/* Status Field */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.status}>
                        <InputLabel shrink>Status *</InputLabel>
                        <Select
                            label="Status *"
                            defaultValue=""
                            {...register("status")}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">--select--</MenuItem>
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

export default ContractForm;
