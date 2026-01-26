import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { updateAvailabilityService } from "@services/professional/AvailabilityService";
import { format } from "date-fns";

function EditAvailabilityModal({ show, onHide, availability, onSuccess }) {
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        is_recurring: false,
        recurrence_pattern: "",
        status: "available",
        notes: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (availability) {
            // Format dates for datetime-local input
            const startDate = new Date(availability.start_date);
            const endDate = new Date(availability.end_date);

            setFormData({
                start_date: format(startDate, "yyyy-MM-dd'T'HH:mm"),
                end_date: format(endDate, "yyyy-MM-dd'T'HH:mm"),
                is_recurring: availability.is_recurring || false,
                recurrence_pattern: availability.recurrence_pattern || "",
                status: availability.status || "available",
                notes: availability.notes || ""
            });
        }
    }, [availability]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate dates
        if (new Date(formData.end_date) <= new Date(formData.start_date)) {
            alert("End date must be after start date");
            setLoading(false);
            return;
        }

        const result = await updateAvailabilityService(availability.id, formData);

        setLoading(false);

        if (result) {
            onSuccess();
            onHide();
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <div className="modern-modal">
                    <div className="modal-header-modern">
                        <div className="modal-icon">
                            <i className="fas fa-calendar-edit"></i>
                        </div>
                        <div>
                            <h3 className="modal-title-modern">Edit Availability</h3>
                            <p className="modal-subtitle-modern">Update your availability details</p>
                        </div>
                        <button className="modal-close-btn" onClick={onHide}>
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
                                        className="form-input-modern"
                                        required
                                    />
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
                                        className="form-input-modern"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="form-select-modern"
                                >
                                    <option value="available">Available</option>
                                    <option value="blocked">Blocked</option>
                                </select>
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
                            </div>

                            {formData.is_recurring && (
                                <div className="form-group-modern animated-field">
                                    <label className="form-label-modern">
                                        <i className="fas fa-redo mr-2"></i>
                                        Recurrence Pattern
                                    </label>
                                    <select
                                        name="recurrence_pattern"
                                        value={formData.recurrence_pattern}
                                        onChange={handleChange}
                                        className="form-select-modern"
                                    >
                                        <option value="">Select pattern</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
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
                                onClick={onHide}
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
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save mr-2"></i>
                                        Update Availability
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <style>{`
                /* Reuse the same modern modal styles from AddAvailabilityModal */
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

export default EditAvailabilityModal;
