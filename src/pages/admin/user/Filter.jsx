import React, { useEffect, useState } from "react";
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Grid,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { getProfessionalCategoriesService } from "@services/admin/ProfessionalCategoryService";
import { getInstituteCategoriesService } from "@services/admin/InstituteCategoryService";

const Filter = ({ roles, getUsersService, setUsers }) => {
    const [filters, setFilters] = useState({
        role_id: "",
        created_at: "",
        updated_at: "",
        professional_category_id: "",
        institute_category_id: "",
    });

    const [professionalCategories, setProfessionalCategories] = useState([]);
    const [instituteCategories, setInstituteCategories] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const initializeStateHelper = async () => {
        const professionalCategoriesData = await getProfessionalCategoriesService();
        setProfessionalCategories(professionalCategoriesData);

        const instituteCategoriesData = await getInstituteCategoriesService();
        setInstituteCategories(instituteCategoriesData);
    };

    const handleClear = async () => {
        const cleared = { role_id: "", created_at: "", updated_at: "", professional_category_id: "", institute_category_id: "" };
        setFilters(cleared);
        const data = await getUsersService({ filters: cleared });
        setUsers(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await getUsersService({ filters });
        setUsers(data);
    };

    useEffect(() => { initializeStateHelper() }, []);

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="flex-end">
                {/* Hidden Role Filter - kept for future use */}
                <Grid item sx={{ display: 'none' }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel shrink>User Role</InputLabel>
                        <Select
                            name="role_id"
                            value={filters.role_id}
                            onChange={handleChange}
                            label="User Role"
                            sx={{ borderRadius: 2, minWidth: 150 }}
                        >
                            <MenuItem value="">All Roles</MenuItem>
                            {roles && roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Professional Category */}
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl size="small" fullWidth>
                        <InputLabel shrink>Professional Category</InputLabel>
                        <Select
                            name="professional_category_id"
                            value={filters.professional_category_id}
                            onChange={handleChange}
                            label="Professional Category"
                            displayEmpty
                            sx={{
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0'
                                }
                            }}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {professionalCategories && professionalCategories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Institute Category */}
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl size="small" fullWidth>
                        <InputLabel shrink>Institute Category</InputLabel>
                        <Select
                            name="institute_category_id"
                            value={filters.institute_category_id}
                            onChange={handleChange}
                            label="Institute Category"
                            displayEmpty
                            sx={{
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0'
                                }
                            }}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {instituteCategories && instituteCategories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Created At */}
                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Created At"
                        type="date"
                        name="created_at"
                        value={filters.created_at}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0'
                                }
                            }
                        }}
                    />
                </Grid>

                {/* Updated At */}
                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Updated At"
                        type="date"
                        name="updated_at"
                        value={filters.updated_at}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0'
                                }
                            }
                        }}
                    />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} md={2}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                            type="button"
                            variant="outlined"
                            size="small"
                            onClick={handleClear}
                            startIcon={<ClearRoundedIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                '&:hover': {
                                    borderColor: '#cbd5e1',
                                    backgroundColor: '#f1f5f9',
                                },
                            }}
                        >
                            Clear
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            startIcon={<SearchRoundedIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundColor: '#3b82f6',
                                boxShadow: '0 1px 2px rgba(59, 130, 246, 0.3)',
                                '&:hover': {
                                    backgroundColor: '#2563eb',
                                },
                            }}
                        >
                            Search
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Filter;
