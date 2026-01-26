import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Row, Col, Form, Spinner, Badge, InputGroup } from "react-bootstrap";
import { getUserContractTypesService } from "@services/institute/ContractApplicantsService";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Collapse, IconButton, Tooltip, Chip } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PropTypes from 'prop-types';

const ContractApplicantsFilter = ({ setApplicants, useFilterHook }) => {
    const [contractTypes, setContractTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [isFiltering, setIsFiltering] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();

    // Watch all fields to count active filters
    const watchedFields = watch();

    // Validate props
    useEffect(() => {
        if (!setApplicants || typeof setApplicants !== 'function') {
            console.error('ContractApplicantsFilter: setApplicants prop is required and must be a function');
        }
        if (!useFilterHook || typeof useFilterHook !== 'function') {
            console.error('ContractApplicantsFilter: useFilterHook prop is required and must be a function');
        }
    }, [setApplicants, useFilterHook]);

    useEffect(() => {
        // Count non-empty fields
        const count = Object.values(watchedFields).filter(value => value && value !== "").length;
        setActiveFiltersCount(count);
    }, [watchedFields]);

    // Fetch available contract types on mount
    useEffect(() => {
        const fetchContractTypes = async () => {
            try {
                setLoadingTypes(true);
                const types = await getUserContractTypesService();
                setContractTypes(Array.isArray(types) ? types : []);
            } catch (error) {
                console.error("Error fetching contract types:", error);
                setContractTypes([]);
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchContractTypes();
    }, []);

    const onSubmit = async (data) => {
        // Validate that required props are functions before proceeding
        if (typeof useFilterHook !== 'function') {
            console.error('useFilterHook is not a function');
            return;
        }

        if (typeof setApplicants !== 'function') {
            console.error('setApplicants is not a function');
            return;
        }

        try {
            setIsFiltering(true);
            const filters = {
                applicant_name: data.applicant_name || "",
                applicant_email: data.applicant_email || "",
                contract_type_id: data.contract_type_id || "",
                status: data.status || "",
                start_date: data.start_date || "",
                end_date: data.end_date || "",
                applied_start_date: data.applied_start_date || "",
                applied_end_date: data.applied_end_date || "",
            };

            const result = await useFilterHook(filters);
            setApplicants(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error filtering applicants:", error);
        } finally {
            setIsFiltering(false);
        }
    };

    const handleReset = () => {
        reset();
        setActiveFiltersCount(0);
        // Trigger a reload of all applicants
        onSubmit({});
    };

    const statusColors = {
        pending: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
        accepted: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
        rejected: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
        withdrawn: { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
    };

    return (
        <div
            className="card shadow-sm border-0"
            style={{
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '1px solid #e5e7eb'
            }}
        >
            {/* Card Header with Toggle */}
            <div
                className="card-header"
                style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    padding: '1.5rem 2rem',
                    borderBottom: 'none'
                }}
            >
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center flex-grow-1">
                        <div
                            className="d-flex align-items-center justify-content-center me-3"
                            style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <FilterListIcon style={{ fontSize: 24, color: 'white' }} />
                        </div>
                        <div className="flex-grow-1">
                            <h5 className="mb-1" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', letterSpacing: '0.3px' }}>
                                Advanced Filters
                            </h5>
                            <small style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem', fontWeight: 500 }}>
                                Refine your search results
                            </small>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {activeFiltersCount > 0 && (
                            <Tooltip title={`${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}`}>
                                <Chip
                                    label={activeFiltersCount}
                                    size="small"
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#1e40af',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        height: '32px',
                                        minWidth: '32px',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                                    }}
                                />
                            </Tooltip>
                        )}
                        <Tooltip title={isExpanded ? "Collapse filters" : "Expand filters"}>
                            <IconButton
                                onClick={() => setIsExpanded(!isExpanded)}
                                size="small"
                                style={{
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    padding: '8px'
                                }}
                            >
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <Collapse in={isExpanded}>
                <div className="card-body" style={{ padding: '2rem 1.75rem', backgroundColor: '#fafbfc' }}>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        {/* Personal Information Section */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center mb-3">
                                <PersonIcon style={{ fontSize: 20, color: '#667eea', marginRight: '8px' }} />
                                <h6 className="mb-0" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1f2937', letterSpacing: '0.3px' }}>
                                    Personal Information
                                </h6>
                            </div>
                            <Row>
                                {/* Applicant Name */}
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                                            Applicant Name
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text style={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRight: 'none',
                                                borderRadius: '10px 0 0 10px'
                                            }}>
                                                <PersonIcon style={{ fontSize: 18, color: '#9ca3af' }} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter applicant name..."
                                                {...register("applicant_name")}
                                                style={{
                                                    fontSize: '0.875rem',
                                                    borderRadius: '0 10px 10px 0',
                                                    border: '1px solid #e5e7eb',
                                                    borderLeft: 'none',
                                                    padding: '0.7rem 1rem',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: 'white'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    e.target.previousSibling.style.borderColor = '#667eea';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e5e7eb';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.previousSibling.style.borderColor = '#e5e7eb';
                                                }}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                {/* Applicant Email */}
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                                            Applicant Email
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text style={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRight: 'none',
                                                borderRadius: '10px 0 0 10px'
                                            }}>
                                                <EmailIcon style={{ fontSize: 18, color: '#9ca3af' }} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="email"
                                                placeholder="Enter email address..."
                                                {...register("applicant_email")}
                                                style={{
                                                    fontSize: '0.875rem',
                                                    borderRadius: '0 10px 10px 0',
                                                    border: '1px solid #e5e7eb',
                                                    borderLeft: 'none',
                                                    padding: '0.7rem 1rem',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: 'white'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    e.target.previousSibling.style.borderColor = '#667eea';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e5e7eb';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.previousSibling.style.borderColor = '#e5e7eb';
                                                }}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Contract Details Section */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center mb-3">
                                <BusinessIcon style={{ fontSize: 20, color: '#667eea', marginRight: '8px' }} />
                                <h6 className="mb-0" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1f2937', letterSpacing: '0.3px' }}>
                                    Contract Details
                                </h6>
                            </div>
                            <Row>
                                {/* Contract Type */}
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                                            Contract Type
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text style={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRight: 'none',
                                                borderRadius: '10px 0 0 10px'
                                            }}>
                                                <AssignmentIcon style={{ fontSize: 18, color: '#9ca3af' }} />
                                            </InputGroup.Text>
                                            <Form.Select
                                                {...register("contract_type_id")}
                                                disabled={loadingTypes || contractTypes.length === 0}
                                                style={{
                                                    fontSize: '0.875rem',
                                                    borderRadius: '0 10px 10px 0',
                                                    border: '1px solid #e5e7eb',
                                                    borderLeft: 'none',
                                                    padding: '0.7rem 1rem',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: 'white'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    e.target.previousSibling.style.borderColor = '#667eea';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e5e7eb';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.previousSibling.style.borderColor = '#e5e7eb';
                                                }}
                                            >
                                                <option value="">
                                                    {loadingTypes ? "Loading..." :
                                                     contractTypes.length === 0 ? "No contract types found" :
                                                     "All Contract Types"}
                                                </option>
                                                {contractTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.contract_name || type.name || `Contract Type ${type.id}`}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </InputGroup>
                                        {loadingTypes && (
                                            <small className="text-muted d-flex align-items-center mt-2">
                                                <Spinner size="sm" animation="border" className="me-2" style={{ width: '14px', height: '14px' }} />
                                                Loading contract types...
                                            </small>
                                        )}
                                    </Form.Group>
                                </Col>

                                {/* Application Status */}
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                                            Application Status
                                        </Form.Label>
                                        <Form.Select
                                            {...register("status")}
                                            style={{
                                                fontSize: '0.875rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                                padding: '0.7rem 1rem',
                                                transition: 'all 0.2s',
                                                backgroundColor: 'white'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="pending">⏳ Pending</option>
                                            <option value="accepted">✅ Accepted</option>
                                            <option value="rejected">❌ Rejected</option>
                                            <option value="withdrawn">↩️ Withdrawn</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Date Filters Section */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center mb-3">
                                <EventIcon style={{ fontSize: 20, color: '#667eea', marginRight: '8px' }} />
                                <h6 className="mb-0" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1f2937', letterSpacing: '0.3px' }}>
                                    Date Filters
                                </h6>
                            </div>
                            <Row>
                                {/* Contract Start Date */}
                                <Col md={6} lg={3} className="mb-3">
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                                            Contract Start Date
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            {...register("start_date")}
                                            style={{
                                                fontSize: '0.875rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                                padding: '0.7rem 1rem',
                                                transition: 'all 0.2s',
                                                backgroundColor: 'white'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Contract End Date */}
                                <Col md={6} lg={3} className="mb-3">
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                                            Contract End Date
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            {...register("end_date")}
                                            style={{
                                                fontSize: '0.875rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                                padding: '0.7rem 1rem',
                                                transition: 'all 0.2s',
                                                backgroundColor: 'white'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Applied Date From */}
                                <Col md={6} lg={3} className="mb-3">
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                                            Applied From
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            {...register("applied_start_date")}
                                            style={{
                                                fontSize: '0.875rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                                padding: '0.7rem 1rem',
                                                transition: 'all 0.2s',
                                                backgroundColor: 'white'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Applied Date To */}
                                <Col md={6} lg={3} className="mb-3">
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                                            Applied To
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            {...register("applied_end_date")}
                                            style={{
                                                fontSize: '0.875rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                                padding: '0.7rem 1rem',
                                                transition: 'all 0.2s',
                                                backgroundColor: 'white'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Action Buttons */}
                        <div
                            className="d-flex justify-content-end gap-3 pt-3"
                            style={{ borderTop: '1px solid #e5e7eb' }}
                        >
                            <Button
                                variant="light"
                                type="button"
                                onClick={handleReset}
                                disabled={isFiltering}
                                className="d-flex align-items-center"
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    padding: '0.75rem 1.75rem',
                                    borderRadius: '10px',
                                    border: '2px solid #e5e7eb',
                                    backgroundColor: 'white',
                                    color: '#6b7280',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f9fafb';
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                <RefreshIcon style={{ fontSize: 18, marginRight: '6px' }} />
                                Reset Filters
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isFiltering}
                                className="d-flex align-items-center"
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    padding: '0.75rem 2rem',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                }}
                            >
                                {isFiltering ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Filtering...
                                    </>
                                ) : (
                                    <>
                                        <SearchIcon style={{ fontSize: 18, marginRight: '6px' }} />
                                        Apply Filters
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Collapse>
        </div>
    );
};

// PropTypes for type checking
ContractApplicantsFilter.propTypes = {
    setApplicants: PropTypes.func.isRequired,
    useFilterHook: PropTypes.func.isRequired
};

export default ContractApplicantsFilter;