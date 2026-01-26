import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { format, addMonths, addWeeks, addDays } from "date-fns";
import { createAvailabilityService } from "@services/professional/AvailabilityService";

function AddAvailabilityModal({ show, onHide, onSuccess, preselectedDate }) {
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        is_recurring: false,
        recurrence_pattern: "",
        notes: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Populate form when a day is clicked
    useEffect(() => {
        if (preselectedDate && show) {
            // Set start time to 9:00 AM of the selected date
            const startDate = new Date(preselectedDate);
            startDate.setHours(9, 0, 0, 0);

            // Set end time to 5:00 PM of the selected date
            const endDate = new Date(preselectedDate);
            endDate.setHours(17, 0, 0, 0);

            setFormData(prev => ({
                ...prev,
                start_date: format(startDate, "yyyy-MM-dd'T'HH:mm"),
                end_date: format(endDate, "yyyy-MM-dd'T'HH:mm")
            }));
        }
    }, [preselectedDate, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // If toggling recurring ON and we have a start_date, extend the end_date
        if (name === 'is_recurring' && checked && formData.start_date) {
            const startDate = new Date(formData.start_date);
            const extendedEndDate = addMonths(startDate, 1); // Default: 1 month

            setFormData(prev => ({
                ...prev,
                [name]: checked,
                end_date: format(extendedEndDate, "yyyy-MM-dd'T'HH:mm")
            }));
        }
        // If changing recurrence pattern, adjust end_date accordingly
        else if (name === 'recurrence_pattern' && formData.start_date) {
            const startDate = new Date(formData.start_date);
            let extendedEndDate;

            switch(value) {
                case 'daily':
                    extendedEndDate = addMonths(startDate, 1); // 1 month for daily
                    break;
                case 'weekly':
                    extendedEndDate = addMonths(startDate, 3); // 3 months for weekly
                    break;
                case 'monthly':
                    extendedEndDate = addMonths(startDate, 12); // 12 months for monthly
                    break;
                default:
                    extendedEndDate = new Date(formData.end_date);
            }

            setFormData(prev => ({
                ...prev,
                [name]: value,
                end_date: format(extendedEndDate, "yyyy-MM-dd'T'HH:mm")
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.start_date) {
            newErrors.start_date = "Start date is required";
        }
        if (!formData.end_date) {
            newErrors.end_date = "End date is required";
        }
        if (formData.start_date && formData.end_date) {
            if (new Date(formData.end_date) <= new Date(formData.start_date)) {
                newErrors.end_date = "End date must be after start date";
            }
        }
        if (formData.is_recurring && !formData.recurrence_pattern) {
            newErrors.recurrence_pattern = "Please select a recurrence pattern";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const result = await createAvailabilityService(formData);
        setLoading(false);

        if (result) {
            setFormData({
                start_date: "",
                end_date: "",
                is_recurring: false,
                recurrence_pattern: "",
                notes: ""
            });
            setErrors({});
            onSuccess();
            onHide();
        }
    };

    const handleClose = () => {
        setFormData({
            start_date: "",
            end_date: "",
            is_recurring: false,
            recurrence_pattern: "",
            notes: ""
        });
        setErrors({});
        onHide();
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg" centered>
                <div className="modern-modal">
                    <div className="modal-header-modern">
                        <div className="modal-icon">
                            <i className="fas fa-calendar-plus"></i>
                        </div>
                        <div>
                            <h3 className="modal-title-modern">Add Availability</h3>
                            <p className="modal-subtitle-modern">
                                {preselectedDate
                                    ? `Setting availability for ${format(preselectedDate, 'MMMM d, yyyy')}`
                                    : 'Set your available time slots'}
                            </p>
                        </div>
                        <button className="modal-close-btn" onClick={handleClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body-modern">
                            <div className="form-row-modern">
                                <div className="form-group-modern">
                                    <label className="form-label-modern">
                                        <i className="far fa-calendar-alt mr-2"></i>
                                        Start Date & Time
                                        <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className={`form-input-modern ${errors.start_date ? 'input-error' : ''}`}
                                        required
                                    />
                                    {errors.start_date && (
                                        <span className="error-message">{errors.start_date}</span>
                                    )}
                                </div>

                                <div className="form-group-modern">
                                    <label className="form-label-modern">
                                        <i className="far fa-calendar-check mr-2"></i>
                                        End Date & Time
                                        <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className={`form-input-modern ${errors.end_date ? 'input-error' : ''}`}
                                        required
                                    />
                                    {errors.end_date && (
                                        <span className="error-message">{errors.end_date}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <label className="checkbox-label-modern">
                                    <input
                                        type="checkbox"
                                        name="is_recurring"
                                        checked={formData.is_recurring}
                                        onChange={handleChange}
                                        className="checkbox-modern"
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-text">
                                        <i className="fas fa-sync-alt mr-2"></i>
                                        Recurring Availability
                                    </span>
                                </label>
                                {formData.is_recurring && (
                                    <div className="help-text-modern">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        The end date will be automatically extended based on your recurrence pattern
                                    </div>
                                )}
                            </div>

                            {formData.is_recurring && (
                                <div className="form-group-modern animated-field">
                                    <label className="form-label-modern">
                                        <i className="fas fa-redo mr-2"></i>
                                        Recurrence Pattern
                                        <span className="required-star">*</span>
                                    </label>
                                    <select
                                        name="recurrence_pattern"
                                        value={formData.recurrence_pattern}
                                        onChange={handleChange}
                                        className={`form-select-modern ${errors.recurrence_pattern ? 'input-error' : ''}`}
                                    >
                                        <option value="">Select pattern</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                    {errors.recurrence_pattern && (
                                        <span className="error-message">{errors.recurrence_pattern}</span>
                                    )}
                                </div>
                            )}

                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="far fa-comment-dots mr-2"></i>
                                    Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="form-textarea-modern"
                                    placeholder="Add any additional notes about your availability..."
                                />
                            </div>
                        </div>

                        <div className="modal-footer-modern">
                            <button
                                type="button"
                                className="btn-secondary-modern"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                <i className="fas fa-times mr-2"></i>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary-modern"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-small mr-2"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check-circle mr-2"></i>
                                        Create Availability
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <style>{`
                .modern-modal {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                }

                .modal-header-modern {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    position: relative;
                }

                .modal-icon {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                    backdrop-filter: blur(10px);
                }

                .modal-title-modern {
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                }

                .modal-subtitle-modern {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.875rem;
                    margin: 0.25rem 0 0;
                }

                .modal-close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .modal-close-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

                .modal-body-modern {
                    padding: 2rem;
                }

                .form-row-modern {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .form-group-modern {
                    margin-bottom: 1.5rem;
                }

                .animated-field {
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .form-label-modern {
                    display: block;
                    color: #2d3748;
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                }

                .required-star {
                    color: #ef4444;
                    margin-left: 0.25rem;
                }

                .form-input-modern,
                .form-select-modern,
                .form-textarea-modern {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    color: #2d3748;
                    background: white;
                    transition: all 0.3s ease;
                    font-family: inherit;
                }

                .form-input-modern:focus,
                .form-select-modern:focus,
                .form-textarea-modern:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .form-input-modern.input-error,
                .form-select-modern.input-error {
                    border-color: #ef4444;
                }

                .form-input-modern.input-error:focus,
                .form-select-modern.input-error:focus {
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }

                .form-textarea-modern {
                    resize: vertical;
                    min-height: 80px;
                }

                .checkbox-label-modern {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    position: relative;
                    padding: 1rem;
                    background: #f8f9fa;
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }

                .checkbox-label-modern:hover {
                    background: #f1f3f5;
                    border-color: #667eea;
                }

                .checkbox-modern {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                }

                .checkbox-custom {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #cbd5e0;
                    border-radius: 6px;
                    margin-right: 0.75rem;
                    position: relative;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .checkbox-modern:checked ~ .checkbox-custom {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                }

                .checkbox-modern:checked ~ .checkbox-custom::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 0.875rem;
                    font-weight: bold;
                }

                .checkbox-text {
                    color: #2d3748;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                }

                .error-message {
                    display: block;
                    color: #ef4444;
                    font-size: 0.8rem;
                    margin-top: 0.375rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .error-message::before {
                    content: '⚠';
                }

                .modal-footer-modern {
                    padding: 1.5rem 2rem;
                    background: #f8f9fa;
                    border-top: 2px solid #e9ecef;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .btn-primary-modern,
                .btn-secondary-modern {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-primary-modern {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }

                .btn-primary-modern:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }

                .btn-primary-modern:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-secondary-modern {
                    background: white;
                    color: #718096;
                    border: 2px solid #e2e8f0;
                }

                .btn-secondary-modern:hover:not(:disabled) {
                    background: #f7fafc;
                    border-color: #cbd5e0;
                }

                .spinner-small {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    display: inline-block;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .help-text-modern {
                    margin-top: 0.5rem;
                    padding: 0.75rem;
                    background: rgba(102, 126, 234, 0.1);
                    border-left: 3px solid #667eea;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    color: #4a5568;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .form-row-modern {
                        grid-template-columns: 1fr;
                    }

                    .modal-header-modern {
                        padding: 1.5rem;
                    }

                    .modal-body-modern {
                        padding: 1.5rem;
                    }

                    .modal-footer-modern {
                        flex-direction: column;
                    }

                    .btn-primary-modern,
                    .btn-secondary-modern {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}

export default AddAvailabilityModal;
