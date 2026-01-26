import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useShowContract } from "@hooks/user/contracts/useShowContract";

const GeneralPracticeTemporaryModal = ({ show, setShow, contract }) => {
    const { API_BASE_URL } = useShowContract();

    // Helper function to check if a field exists and has a value
    const hasValue = (value) => {
        return value !== null && value !== undefined && value !== '' &&
               (Array.isArray(value) ? value.length > 0 : true);
    };

    // Helper to format array values
    const formatArray = (value) => {
        if (Array.isArray(value)) return value.join(", ");
        return value;
    };

    // Parse selected dates if they exist
    const getSelectedDates = () => {
        if (contract?.selected_dates) {
            try {
                return JSON.parse(contract.selected_dates);
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const selectedDates = getSelectedDates();

    // Group consecutive dates for display
    const groupConsecutiveDates = (dates) => {
        if (dates.length === 0) return [];
        const sorted = [...dates].sort();
        const groups = [];
        let currentGroup = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i - 1]);
            const currDate = new Date(sorted[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                currentGroup.push(sorted[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [sorted[i]];
            }
        }
        groups.push(currentGroup);
        return groups;
    };

    const formatDateDisplay = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const dateGroups = groupConsecutiveDates(selectedDates);

    // Get the appropriate rate based on compensation mode
    const getDisplayRate = () => {
        if (hasValue(contract?.contract_value)) {
            return {
                label: "Contract Value",
                value: `${Number(contract.contract_value).toLocaleString()} CAD`
            };
        } else if (hasValue(contract?.hourly_rate)) {
            return {
                label: "Hourly Rate",
                value: `${Number(contract.hourly_rate).toLocaleString()} CAD / Hour`
            };
        } else if (hasValue(contract?.daily_rate)) {
            return {
                label: "Daily Rate",
                value: `${Number(contract.daily_rate).toLocaleString()} CAD / Day`
            };
        } else if (hasValue(contract?.service_rate)) {
            return {
                label: "Rate per Service",
                value: `${Number(contract.service_rate).toLocaleString()} CAD / Service`
            };
        }
        return null;
    };

    const displayRate = getDisplayRate();

    const modalStyles = `
        .contract-modal-fullscreen .modal-dialog {
            max-width: 95vw !important;
            width: 95vw !important;
            margin: 1.75rem auto !important;
        }
        .contract-modal-fullscreen .modal-content {
            max-height: calc(100vh - 3.5rem) !important;
            display: flex !important;
            flex-direction: column !important;
            border-radius: 12px !important;
            overflow: hidden !important;
        }
        .contract-modal-fullscreen .modal-header {
            flex-shrink: 0 !important;
            border-bottom: none !important;
            padding: 1.25rem 1.5rem !important;
        }
        .contract-modal-fullscreen .modal-body {
            flex: 1 1 auto !important;
            overflow-y: auto !important;
            padding: 1.5rem !important;
        }
        .contract-modal-fullscreen .modal-footer {
            flex-shrink: 0 !important;
            border-top: 1px solid #e9ecef !important;
            padding: 1rem 1.5rem !important;
        }
    `;

    return (
        <>
        <style>{modalStyles}</style>
        <Modal show={show} size="xl" centered dialogClassName="contract-modal-fullscreen">
            <Modal.Header className="bg-purple text-white" style={{backgroundColor: '#6f42c1'}}>
                <Modal.Title className="d-flex align-items-center w-100">
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-white mr-3" style={{width: '48px', height: '48px', color: '#6f42c1'}}>
                        <i className="fas fa-stethoscope fa-lg"></i>
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="mb-0 font-weight-bold">General Practice Temporary</h5>
                        <small className="opacity-75">Contract ID: #{contract?.id || '-'}</small>
                    </div>
                    <div className="ml-auto">
                        {contract?.status && (
                            <span className={`badge badge-${
                                contract.status === 'open' ? 'success' :
                                contract.status === 'pending' ? 'warning' :
                                contract.status === 'cancelled' ? 'danger' :
                                contract.status === 'in_discussion' ? 'info' :
                                contract.status === 'booked' ? 'primary' :
                                'secondary'
                            } px-3 py-2`} style={{fontSize: '0.85rem'}}>
                                {contract.status.replace('_', ' ').toUpperCase()}
                            </span>
                        )}
                    </div>
                </Modal.Title>
                <button
                    type="button"
                    className="close text-white ml-3"
                    aria-label="Close"
                    onClick={() => setShow(false)}
                >
                    <span aria-hidden="true" style={{fontSize: '1.5rem'}}>&times;</span>
                </button>
            </Modal.Header>

            <Modal.Body>
                {/* Contract Overview Section */}
                <div className="mb-4">
                    <h6 className="text-dark font-weight-bold mb-3 pb-2 border-bottom">
                        <i className="fas fa-info-circle mr-2"></i>
                        Contract Overview
                    </h6>
                    <div className="row">
                        {hasValue(contract?.contract_type?.contract_name) && (
                            <div className="col-md-6 mb-3">
                                <div className="card bg-primary text-white border-0">
                                    <div className="card-body py-3 px-3">
                                        <small className="d-block opacity-75">Contract Type</small>
                                        <h5 className="mb-0 font-weight-bold">{contract.contract_type.contract_name}</h5>
                                    </div>
                                </div>
                            </div>
                        )}
                        {hasValue(contract?.status) && (
                            <div className="col-md-6 mb-3">
                                <div className="card bg-light border-0">
                                    <div className="card-body py-3 px-3">
                                        <small className="text-muted d-block">Contract Status</small>
                                        <strong>
                                            <span className={`badge badge-${
                                                contract.status === 'open' ? 'success' :
                                                contract.status === 'pending' ? 'warning' :
                                                contract.status === 'cancelled' ? 'danger' :
                                                contract.status === 'in_discussion' ? 'info' :
                                                contract.status === 'booked' ? 'primary' :
                                                contract.status === 'closed' ? 'secondary' : 'secondary'
                                            }`}>
                                                {contract.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Location Information Section */}
                {(hasValue(contract?.facility_name) || hasValue(contract?.contract_location) ||
                  hasValue(contract?.city) || hasValue(contract?.province)) && (
                    <div className="mb-4">
                        <h6 className="text-primary font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            Location Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.facility_name) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Facility Name</small>
                                            <strong>{contract.facility_name}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.contract_location) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Contract Location</small>
                                            <strong>{contract.contract_location}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.street_address) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Street Address</small>
                                            <strong>{contract.street_address}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="col-md-4 mb-3">
                                {hasValue(contract?.city) && (
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">City</small>
                                            <strong>{contract.city}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-4 mb-3">
                                {hasValue(contract?.province) && (
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Province</small>
                                            <strong>{contract.province}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-4 mb-3">
                                {hasValue(contract?.postal_code) && (
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Postal Code</small>
                                            <strong>{contract.postal_code}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Selected Dates Section */}
                {selectedDates.length > 0 && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            Selected Contract Dates ({selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''})
                        </h6>
                        <div className="card bg-light border-0">
                            <div className="card-body">
                                <div className="d-flex flex-wrap">
                                    {dateGroups.map((group, idx) => (
                                        <span key={idx} className="badge badge-success mr-2 mb-2 p-2">
                                            <i className="far fa-calendar-check mr-1"></i>
                                            {group.length === 1
                                                ? formatDateDisplay(group[0])
                                                : `${formatDateDisplay(group[0])} - ${formatDateDisplay(group[group.length - 1])}`
                                            }
                                            {group.length > 1 && ` (${group.length} days)`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contract Dates Section */}
                {(hasValue(contract?.start_date) || hasValue(contract?.end_date)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            Contract Period
                        </h6>
                        <div className="row">
                            {hasValue(contract?.start_date) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Start Date</small>
                                            <strong>
                                                <i className="far fa-calendar-check mr-1"></i>
                                                {new Date(contract.start_date).toLocaleDateString()}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.end_date) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">End Date</small>
                                            <strong>
                                                <i className="far fa-calendar-times mr-1"></i>
                                                {new Date(contract.end_date).toLocaleDateString()}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Time Slots Section */}
                {(() => {
                    let timeSlots = [];
                    if (contract?.time_slots) {
                        try {
                            timeSlots = JSON.parse(contract.time_slots);
                        } catch (e) {
                            console.error("Error parsing time slots:", e);
                        }
                    }

                    if (timeSlots.length > 0) {
                        const allSameTime = timeSlots.every(slot =>
                            slot.start_time === timeSlots[0].start_time &&
                            slot.end_time === timeSlots[0].end_time
                        );

                        return (
                            <div className="mb-4">
                                <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                                    <i className="fas fa-clock mr-2"></i>
                                    Time Slots
                                </h6>
                                {allSameTime ? (
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block mb-2">
                                                <i className="fas fa-clock mr-1"></i>
                                                Time Slot (All Dates)
                                            </small>
                                            <div className="d-flex align-items-center">
                                                <div className="mr-4">
                                                    <small className="text-muted d-block">Start Time</small>
                                                    <strong>
                                                        <i className="fas fa-clock mr-1 text-success"></i>
                                                        {timeSlots[0].start_time}
                                                    </strong>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">End Time</small>
                                                    <strong>
                                                        <i className="fas fa-clock mr-1 text-danger"></i>
                                                        {timeSlots[0].end_time}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block mb-2">
                                                <i className="fas fa-clock mr-1"></i>
                                                Specific Time Slots per Date
                                            </small>
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered mb-0">
                                                    <thead className="thead-light">
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Start Time</th>
                                                            <th>End Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {timeSlots
                                                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                            .map((slot, idx) => (
                                                                <tr key={idx}>
                                                                    <td>
                                                                        <strong>{new Date(slot.date).toLocaleDateString('en-US', {
                                                                            weekday: 'short',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric'
                                                                        })}</strong>
                                                                    </td>
                                                                    <td>{slot.start_time}</td>
                                                                    <td>{slot.end_time}</td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Break Information Section */}
                {(hasValue(contract?.break_included) || hasValue(contract?.break_duration)) && (
                    <div className="mb-4">
                        <h6 className="text-warning font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-mug-hot mr-2"></i>
                            Break Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.break_included) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Break Included</small>
                                            <strong>
                                                <i className={`fas ${contract.break_included === 'yes' ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} mr-1`}></i>
                                                {contract.break_included === 'yes' ? 'Yes' : 'No'}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.break_duration) && contract.break_included === 'yes' && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Break Duration</small>
                                            <strong>
                                                <i className="fas fa-clock mr-1"></i>
                                                {contract.break_duration}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Skills & Requirements Section */}
                {(hasValue(contract?.required_skills) || hasValue(contract?.software_skills) ||
                  hasValue(contract?.minimum_experience) || hasValue(contract?.languages)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-clipboard-list mr-2"></i>
                            Skills & Requirements
                        </h6>
                        <div className="row">
                            {hasValue(contract?.required_skills) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block mb-2">
                                                <i className="fas fa-stethoscope mr-1"></i>
                                                Required Skills
                                            </small>
                                            <div className="d-flex flex-wrap gap-2">
                                                {formatArray(contract.required_skills).split(', ').map((skill, index) => (
                                                    <span key={index} className="badge badge-primary">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.software_skills) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block mb-2">
                                                <i className="fas fa-laptop-medical mr-1"></i>
                                                Software Skills
                                            </small>
                                            <div className="d-flex flex-wrap gap-2">
                                                {formatArray(contract.software_skills).split(', ').map((software, index) => (
                                                    <span key={index} className="badge badge-info">
                                                        {software}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.minimum_experience) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Minimum Experience</small>
                                            <strong>
                                                <i className="fas fa-user-clock mr-1"></i>
                                                {contract.minimum_experience}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.languages) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block mb-2">
                                                <i className="fas fa-language mr-1"></i>
                                                Languages
                                            </small>
                                            <div className="d-flex flex-wrap gap-2">
                                                {formatArray(contract.languages).split(', ').map((language, index) => (
                                                    <span key={index} className="badge badge-secondary">
                                                        {language}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Compensation & Payment Details */}
                {(hasValue(contract?.compensation_mode) || hasValue(contract?.payment_method) || displayRate || hasValue(contract?.travel_costs) || hasValue(contract?.mission_description)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-dollar-sign mr-2"></i>
                            Compensation & Payment Details
                        </h6>
                        <div className="row">
                            {hasValue(contract?.compensation_mode) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Compensation Mode</small>
                                            <strong>
                                                <i className="fas fa-credit-card mr-1"></i>
                                                {contract.compensation_mode}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Legacy field for backward compatibility */}
                            {hasValue(contract?.payment_method) && !hasValue(contract?.compensation_mode) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Payment Method (Legacy)</small>
                                            <strong>
                                                <i className="fas fa-credit-card mr-1"></i>
                                                {contract.payment_method}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {displayRate && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">{displayRate.label}</small>
                                            <strong className="text-success">
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                {displayRate.value}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.mission_description) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Mission Description</small>
                                            <p className="mb-0 mt-2">{contract.mission_description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.travel_costs) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Travel / Accommodation Costs</small>
                                            <strong>
                                                <i className={`fas ${contract.travel_costs === 'yes' ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} mr-1`}></i>
                                                {contract.travel_costs === 'yes' ? 'Yes - Covered' : 'No'}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Compliance & Licensing Section */}
                {(hasValue(contract?.required_license) || hasValue(contract?.compliance)) && (
                    <div className="mb-4">
                        <h6 className="text-danger font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-shield-alt mr-2"></i>
                            Compliance & Licensing
                        </h6>
                        <div className="row">
                            {hasValue(contract?.required_license) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Provincial Medical License Required</small>
                                            <strong>
                                                <i className={`fas ${contract.required_license ? 'fa-check-circle text-success' : 'fa-times-circle text-secondary'} mr-1`}></i>
                                                {contract.required_license ? 'Yes - Required' : 'No'}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.compliance) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block mb-2">
                                                <i className="fas fa-clipboard-check mr-1"></i>
                                                Additional Compliance Requirements
                                            </small>
                                            <div className="d-flex flex-wrap gap-3">
                                                {contract.compliance?.vaccination && (
                                                    <span className="badge badge-success">
                                                        <i className="fas fa-syringe mr-1"></i>
                                                        Vaccination Records
                                                    </span>
                                                )}
                                                {contract.compliance?.criminal_record && (
                                                    <span className="badge badge-warning">
                                                        <i className="fas fa-shield-alt mr-1"></i>
                                                        Criminal Background Check
                                                    </span>
                                                )}
                                                {contract.compliance?.confidentiality && (
                                                    <span className="badge badge-info">
                                                        <i className="fas fa-user-lock mr-1"></i>
                                                        LPRPDE Confidentiality
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Positions Sought */}
                {hasValue(contract?.contract_positions) && (
                    <div className="mb-4">
                        <h6 className="text-primary font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-briefcase mr-2"></i>
                            Positions Sought
                        </h6>
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead className="thead-light">
                                    <tr>
                                        <th width="10%">#</th>
                                        <th>Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contract.contract_positions.map((row, index) => (
                                        <tr key={row?.id ?? index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <strong>{row.position?.name || "-"}</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="row">
                    <div className="col-md-6">
                        <div className="card bg-light border-0">
                            <div className="card-body py-2 px-3">
                                <small className="text-muted d-block">Created At</small>
                                <strong>
                                    <i className="far fa-clock mr-1"></i>
                                    {contract?.created_at ? new Date(contract.created_at).toLocaleString() : "-"}
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card bg-light border-0">
                            <div className="card-body py-2 px-3">
                                <small className="text-muted d-block">Updated At</small>
                                <strong>
                                    <i className="far fa-clock mr-1"></i>
                                    {contract?.updated_at ? new Date(contract.updated_at).toLocaleString() : "-"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="bg-light d-flex justify-content-between align-items-center">
                <small className="text-muted">
                    <i className="far fa-clock mr-1"></i>
                    Last updated: {contract?.updated_at ? new Date(contract.updated_at).toLocaleDateString() : '-'}
                </small>
                <Button variant="secondary" onClick={() => setShow(false)} className="px-4">
                    <i className="fas fa-times mr-2"></i>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default GeneralPracticeTemporaryModal;