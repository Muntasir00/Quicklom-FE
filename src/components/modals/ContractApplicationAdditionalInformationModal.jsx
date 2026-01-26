import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useContractApplicationAdditionalInformation } from "@hooks/institute/published-contracts/useContractApplicationAdditionalInformation";

// Form field component - defined outside to prevent re-creation on every render
const FormField = ({ label, required, error, children, icon, hint }) => (
    <div className="form-group mb-3">
        <label style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }}>
            {icon && <i className={icon} style={{ color: '#667eea', fontSize: '12px' }}></i>}
            {label}
            {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {children}
        {hint && !error && (
            <small style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                {hint}
            </small>
        )}
        {error && (
            <div style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                <i className="fas fa-exclamation-circle"></i>
                {error.message}
            </div>
        )}
    </div>
);

// Style functions - defined outside to prevent re-creation
const getInputStyle = (hasError) => ({
    borderRadius: '8px',
    border: hasError ? '2px solid #ef4444' : '1.5px solid #e5e7eb',
    padding: '10px 14px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backgroundColor: hasError ? '#fef2f2' : '#fff'
});

const getSelectStyle = (hasError) => ({
    ...getInputStyle(hasError),
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px'
});

const ContractApplicationAdditionalInformationModal = ({ show, setShow, contractId }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        FORM_ID,
        candidates,
        addCandidate,
        removeCandidate,
        updateCandidate,
    } = useContractApplicationAdditionalInformation(contractId, setShow);

    const [activeCandidate, setActiveCandidate] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use the external style functions
    const inputStyle = getInputStyle;
    const selectStyle = getSelectStyle;

    return (
        <Modal
            show={show}
            onHide={() => setShow(false)}
            size="xl"
            backdrop="static"
            centered
            dialogClassName="modal-enhanced modal-fullheight"
        >
            {/* Custom Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1.5rem 2rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-30%',
                    left: '10%',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '50%'
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <i className="fas fa-user-plus" style={{ fontSize: '20px' }}></i>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '20px' }}>
                                        Propose Candidates
                                    </h4>
                                    <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                        Contract Application #{contractId}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShow(false)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '8px',
                                width: '36px',
                                height: '36px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Progress indicator */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '10px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#667eea',
                            fontWeight: '700',
                            fontSize: '16px'
                        }}>
                            {candidates.length}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''} Added
                            </div>
                            <div style={{ opacity: 0.8, fontSize: '12px' }}>
                                Add at least one candidate to submit your application
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal.Body style={{ padding: 0, background: '#f8fafc', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <form id={FORM_ID} onSubmit={handleSubmit(handleFormSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* Left Sidebar - Candidate List */}
                        <div style={{
                            width: '280px',
                            minWidth: '280px',
                            borderRight: '1px solid #e5e7eb',
                            background: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '16px',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <h6 style={{
                                    margin: 0,
                                    fontWeight: '700',
                                    color: '#374151',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <i className="fas fa-users" style={{ color: '#667eea' }}></i>
                                    Candidates List
                                </h6>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px' }}>
                                {candidates.map((candidate, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setActiveCandidate(index)}
                                        style={{
                                            padding: '12px',
                                            marginBottom: '8px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            background: activeCandidate === index
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : '#f3f4f6',
                                            color: activeCandidate === index ? 'white' : '#374151',
                                            transition: 'all 0.2s ease',
                                            border: activeCandidate === index ? 'none' : '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: activeCandidate === index
                                                    ? 'rgba(255,255,255,0.2)'
                                                    : '#667eea',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '700',
                                                fontSize: '14px'
                                            }}>
                                                {index + 1}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {candidate.first_name || 'New Candidate'}
                                                    {candidate.last_name ? ` ${candidate.last_name}` : ''}
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    opacity: 0.8,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {candidate.primary_role || 'Role not specified'}
                                                </div>
                                            </div>
                                            {candidates.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeCandidate(index);
                                                        if (activeCandidate >= candidates.length - 1) {
                                                            setActiveCandidate(Math.max(0, candidates.length - 2));
                                                        }
                                                    }}
                                                    style={{
                                                        background: activeCandidate === index
                                                            ? 'rgba(255,255,255,0.2)'
                                                            : '#fee2e2',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        width: '28px',
                                                        height: '28px',
                                                        color: activeCandidate === index ? 'white' : '#ef4444',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        addCandidate();
                                        setActiveCandidate(candidates.length);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '2px dashed #667eea',
                                        background: '#f5f3ff',
                                        color: '#667eea',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#667eea';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#f5f3ff';
                                        e.target.style.color = '#667eea';
                                    }}
                                >
                                    <i className="fas fa-plus"></i>
                                    Add Candidate
                                </button>
                            </div>
                        </div>

                        {/* Right Content - Form */}
                        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px' }}>
                            {candidates.map((candidate, index) => (
                                <div
                                    key={index}
                                    style={{ display: activeCandidate === index ? 'block' : 'none' }}
                                >
                                    {/* Section: Personal Information */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '16px',
                                            paddingBottom: '12px',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                <i className="fas fa-user" style={{ fontSize: '14px' }}></i>
                                            </div>
                                            <h6 style={{ margin: 0, fontWeight: '700', color: '#1f2937' }}>
                                                Personal Information
                                            </h6>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <FormField
                                                    label="First Name"
                                                    required
                                                    icon="fas fa-user"
                                                    error={errors.candidates?.[index]?.first_name}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.first_name)}
                                                        placeholder="Enter first name"
                                                        {...register(`candidates.${index}.first_name`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="Last Name"
                                                    icon="fas fa-user"
                                                    error={errors.candidates?.[index]?.last_name}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.last_name)}
                                                        placeholder="Enter last name"
                                                        {...register(`candidates.${index}.last_name`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="Email"
                                                    icon="fas fa-envelope"
                                                    error={errors.candidates?.[index]?.email}
                                                >
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.email)}
                                                        placeholder="candidate@example.com"
                                                        {...register(`candidates.${index}.email`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="Phone"
                                                    icon="fas fa-phone"
                                                    error={errors.candidates?.[index]?.phone}
                                                >
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.phone)}
                                                        placeholder="+1 (555) 000-0000"
                                                        {...register(`candidates.${index}.phone`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="Date of Birth"
                                                    icon="fas fa-calendar"
                                                    error={errors.candidates?.[index]?.dob}
                                                >
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.dob)}
                                                        {...register(`candidates.${index}.dob`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="Gender"
                                                    icon="fas fa-venus-mars"
                                                    error={errors.candidates?.[index]?.gender}
                                                >
                                                    <select
                                                        className="form-control"
                                                        style={selectStyle(errors.candidates?.[index]?.gender)}
                                                        {...register(`candidates.${index}.gender`)}
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                                    </select>
                                                </FormField>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Professional Information */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '16px',
                                            paddingBottom: '12px',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                <i className="fas fa-briefcase" style={{ fontSize: '14px' }}></i>
                                            </div>
                                            <h6 style={{ margin: 0, fontWeight: '700', color: '#1f2937' }}>
                                                Professional Information
                                            </h6>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <FormField
                                                    label="Primary Role"
                                                    required
                                                    icon="fas fa-user-md"
                                                    error={errors.candidates?.[index]?.primary_role}
                                                    hint="e.g., Dentist, Pharmacist, Nurse"
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.primary_role)}
                                                        placeholder="Enter primary role"
                                                        {...register(`candidates.${index}.primary_role`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="Level of Experience"
                                                    required
                                                    icon="fas fa-chart-line"
                                                    error={errors.candidates?.[index]?.experience}
                                                >
                                                    <select
                                                        className="form-control"
                                                        style={selectStyle(errors.candidates?.[index]?.experience)}
                                                        {...register(`candidates.${index}.experience`)}
                                                    >
                                                        <option value="">Select Experience Level</option>
                                                        <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                                                        <option value="Intermediate (3-5 years)">Intermediate (3-5 years)</option>
                                                        <option value="Experienced (6-10 years)">Experienced (6-10 years)</option>
                                                        <option value="Senior (10+ years)">Senior (10+ years)</option>
                                                    </select>
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="License Number"
                                                    icon="fas fa-id-card"
                                                    error={errors.candidates?.[index]?.license_number}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.license_number)}
                                                        placeholder="Enter license number"
                                                        {...register(`candidates.${index}.license_number`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="Languages"
                                                    icon="fas fa-language"
                                                >
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '16px',
                                                        padding: '12px',
                                                        background: '#f9fafb',
                                                        borderRadius: '8px',
                                                        border: '1.5px solid #e5e7eb'
                                                    }}>
                                                        <label style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: '500'
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                value="english"
                                                                style={{ width: '16px', height: '16px', accentColor: '#667eea' }}
                                                                {...register(`candidates.${index}.languages`)}
                                                            />
                                                            English
                                                        </label>
                                                        <label style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: '500'
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                value="french"
                                                                style={{ width: '16px', height: '16px', accentColor: '#667eea' }}
                                                                {...register(`candidates.${index}.languages`)}
                                                            />
                                                            French
                                                        </label>
                                                    </div>
                                                </FormField>
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    label="ID Upload"
                                                    icon="fas fa-upload"
                                                    error={errors.candidates?.[index]?.id_upload}
                                                    hint="Accepted: PDF, JPG, PNG (max 5MB)"
                                                >
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        style={{
                                                            ...inputStyle(errors.candidates?.[index]?.id_upload),
                                                            padding: '8px 12px'
                                                        }}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        {...register(`candidates.${index}.id_upload`)}
                                                    />
                                                </FormField>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Location Information */}
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '16px',
                                            paddingBottom: '12px',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                <i className="fas fa-map-marker-alt" style={{ fontSize: '14px' }}></i>
                                            </div>
                                            <h6 style={{ margin: 0, fontWeight: '700', color: '#1f2937' }}>
                                                Location Information
                                            </h6>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12">
                                                <FormField
                                                    label="Address"
                                                    icon="fas fa-home"
                                                    error={errors.candidates?.[index]?.address}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.address)}
                                                        placeholder="Enter street address"
                                                        {...register(`candidates.${index}.address`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-4">
                                                <FormField
                                                    label="City"
                                                    icon="fas fa-city"
                                                    error={errors.candidates?.[index]?.city}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.city)}
                                                        placeholder="Enter city"
                                                        {...register(`candidates.${index}.city`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-4">
                                                <FormField
                                                    label="Province"
                                                    required
                                                    icon="fas fa-map"
                                                    error={errors.candidates?.[index]?.province}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.province)}
                                                        placeholder="Enter province"
                                                        {...register(`candidates.${index}.province`)}
                                                    />
                                                </FormField>
                                            </div>
                                            <div className="col-md-4">
                                                <FormField
                                                    label="Postal Code"
                                                    icon="fas fa-mail-bulk"
                                                    error={errors.candidates?.[index]?.postal_code}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={inputStyle(errors.candidates?.[index]?.postal_code)}
                                                        placeholder="A1A 1A1"
                                                        {...register(`candidates.${index}.postal_code`)}
                                                    />
                                                </FormField>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal.Body>

            {/* Custom Footer */}
            <div style={{
                padding: '16px 24px',
                background: 'white',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px' }}>
                    <i className="fas fa-info-circle"></i>
                    Fields marked with <span style={{ color: '#ef4444' }}>*</span> are required
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setShow(false)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: '1.5px solid #e5e7eb',
                            background: 'white',
                            color: '#374151',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <i className="fas fa-times"></i>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form={FORM_ID}
                        disabled={isSubmitting}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isSubmitting
                                ? '#9ca3af'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i>
                                Submit Application ({candidates.length} Candidate{candidates.length !== 1 ? 's' : ''})
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                .modal-fullheight {
                    max-width: 1200px !important;
                    width: 95vw !important;
                    margin: 1.75rem auto !important;
                    height: calc(100vh - 3.5rem) !important;
                }
                .modal-fullheight .modal-content {
                    height: 100% !important;
                    max-height: 100% !important;
                    min-height: 600px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    border: none !important;
                    border-radius: 16px !important;
                    overflow: hidden !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                }
                .modal-enhanced .modal-body {
                    padding: 0;
                    overflow: hidden;
                }
                .modal-enhanced .form-control:focus,
                .modal-enhanced input:focus,
                .modal-enhanced select:focus,
                .modal-enhanced textarea:focus {
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15) !important;
                    outline: none !important;
                }
            `}</style>
        </Modal>
    );
};

export default ContractApplicationAdditionalInformationModal;
