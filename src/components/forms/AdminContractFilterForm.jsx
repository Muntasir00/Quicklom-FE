import React, { useState } from "react";
import { Card, CardContent, Box, Chip, IconButton, Collapse, TextField, MenuItem, Button, Typography, Divider, ListSubheader } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import { useFilterContract, URGENCY_OPTIONS } from "@hooks/admin/contracts/useFilterContract";
import { CONTRACT_STATUS_LABELS } from "@constants/ContractConstants";

const Filter = ({ setContracts }) => {
    const {
        CONTRACT_STATUS,
        filters,
        handleClear,
        handleSubmit,
        handleChange,
        professionalCategories,
        getFilteredPositions,
    } = useFilterContract(setContracts);

    const [expanded, setExpanded] = useState(false);

    // Count active filters
    const activeFiltersCount = Object.values(filters).filter(v => v !== "").length;

    // Get filtered positions based on selected category
    const filteredPositions = getFilteredPositions();

    return (
        <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    bgcolor: '#fafafa',
                    borderBottom: expanded ? '1px solid #e0e0e0' : 'none',
                    '&:hover': { bgcolor: '#f5f5f5' }
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <FilterListIcon sx={{ color: '#1976d2' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Filters</span>
                    {activeFiltersCount > 0 && (
                        <Chip
                            label={`${activeFiltersCount} active`}
                            size="small"
                            color="primary"
                            sx={{ height: 22, fontSize: '0.75rem' }}
                        />
                    )}
                </Box>
                <IconButton size="small">
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <CardContent sx={{ pt: 3 }}>
                    <form onSubmit={handleSubmit}>
                        {/* Row 1: Urgency & Status (highlighted) */}
                        <Box sx={{ bgcolor: '#fff8e1', p: 2, borderRadius: 2, mb: 3, border: '1px solid #ffe082' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <AccessTimeIcon sx={{ color: '#f57c00', fontSize: 20 }} />
                                <Typography variant="subtitle2" fontWeight={600} color="#e65100">
                                    Time & Status Filters
                                </Typography>
                            </Box>
                            <div className="row">
                                <div className="col-md-4">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        select
                                        label="Urgency"
                                        name="urgency"
                                        value={filters.urgency}
                                        onChange={handleChange}
                                        variant="outlined"
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {URGENCY_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: option.color
                                                        }}
                                                    />
                                                    {option.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </div>
                                <div className="col-md-4">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        select
                                        label="Status"
                                        name="status"
                                        value={filters.status}
                                        onChange={handleChange}
                                        variant="outlined"
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <MenuItem value="">All Statuses</MenuItem>
                                        {Object.entries(CONTRACT_STATUS).map(([key, value]) => (
                                            <MenuItem key={key} value={value}>
                                                {CONTRACT_STATUS_LABELS[value] || value}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </div>
                                <div className="col-md-4">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Start Date From"
                                        name="start_date"
                                        type="date"
                                        value={filters.start_date}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                        sx={{ bgcolor: 'white' }}
                                    />
                                </div>
                            </div>
                        </Box>

                        {/* Row 2: Industry & Position */}
                        <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2, mb: 3, border: '1px solid #90caf9' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <CategoryIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                                <Typography variant="subtitle2" fontWeight={600} color="#1565c0">
                                    Industry & Position Filters
                                </Typography>
                            </Box>
                            <div className="row">
                                <div className="col-md-6">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        select
                                        label="Industry (Professional Category)"
                                        name="professional_category_id"
                                        value={filters.professional_category_id}
                                        onChange={handleChange}
                                        variant="outlined"
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <MenuItem value="">All Industries</MenuItem>
                                        {Array.isArray(professionalCategories) && professionalCategories.length > 0 ? (
                                            professionalCategories.map((category) => (
                                                <MenuItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No industries available</MenuItem>
                                        )}
                                    </TextField>
                                </div>
                                <div className="col-md-6">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        select
                                        label="Position Sought"
                                        name="position_id"
                                        value={filters.position_id}
                                        onChange={handleChange}
                                        variant="outlined"
                                        sx={{ bgcolor: 'white' }}
                                        disabled={filteredPositions.length === 0}
                                    >
                                        <MenuItem value="">
                                            {filters.professional_category_id ? "All Positions in Category" : "All Positions"}
                                        </MenuItem>
                                        {filteredPositions.length > 0 ? (
                                            filteredPositions.map((position) => (
                                                <MenuItem key={position.id} value={position.id}>
                                                    {position.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>
                                                {filters.professional_category_id
                                                    ? "No positions in this category"
                                                    : "No positions available"}
                                            </MenuItem>
                                        )}
                                    </TextField>
                                </div>
                            </div>
                            {filters.professional_category_id && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Showing {filteredPositions.length} position(s) for the selected industry
                                </Typography>
                            )}
                        </Box>

                        {/* Row 3: Search fields */}
                        <div className="row">
                            <div className="col-md-2">
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Contract ID"
                                    name="id"
                                    type="number"
                                    value={filters.id}
                                    onChange={handleChange}
                                    placeholder="e.g. 123"
                                    variant="outlined"
                                />
                            </div>
                            <div className="col-md-3">
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Publisher Name"
                                    name="publisher_name"
                                    value={filters.publisher_name}
                                    onChange={handleChange}
                                    placeholder="Search by name"
                                    variant="outlined"
                                />
                            </div>
                            <div className="col-md-4">
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Publisher Email"
                                    name="publisher_email"
                                    type="email"
                                    value={filters.publisher_email}
                                    onChange={handleChange}
                                    placeholder="Search by email"
                                    variant="outlined"
                                />
                            </div>
                            <div className="col-md-3">
                                <Box display="flex" justifyContent="flex-end" gap={1} sx={{ height: '100%', alignItems: 'flex-start' }}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<ClearIcon />}
                                        onClick={handleClear}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SearchIcon />}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Search
                                    </Button>
                                </Box>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default Filter;
