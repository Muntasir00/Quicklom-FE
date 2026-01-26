import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useShowContract } from "@hooks/user/contracts/useShowContract";

const NursingTemporaryModal = ({ show, setShow, contract }) => {
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
            <Modal.Header className="bg-danger text-white">
                <Modal.Title className="d-flex align-items-center w-100">
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-white text-danger mr-3" style={{width: '48px', height: '48px'}}>
                        <i className="fas fa-user-nurse fa-lg"></i>
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="mb-0 font-weight-bold">Nursing Temporary Contract</h5>
                        <small className="opacity-75">Contract ID: #{contract?.id || '-'}</small>
                    </div>
                    <div className="ml-auto">
                        {contract?.status && (
                            <span className={`badge badge-${
                                contract.status === 'open' ? 'success' :
                                contract.status === 'pending' ? 'warning' :
                                contract.status === 'cancelled' ? 'dark' :
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
                                <div className="card bg-success text-white border-0">
                                    <div className="card-body py-3 px-3">
                                        <small className="d-block opacity-75">Contract Type</small>
                                        <h5 className="mb-0 font-weight-bold">{contract.contract_type.contract_name}</h5>
                                    </div>
                                </div>
                            </div>
                        )}
                        {hasValue(contract?.job_title) && (
                            <div className="col-md-6 mb-3">
                                <div className="card bg-info text-white border-0">
                                    <div className="card-body py-3 px-3">
                                        <small className="d-block opacity-75">Job Title</small>
                                        <h5 className="mb-0 font-weight-bold">{contract.job_title}</h5>
                                    </div>
                                </div>
                            </div>
                        )}
                        {hasValue(contract?.status) && (
                            <div className="col-md-12 mb-3">
                                <div className="card bg-light border-0">
                                    <div className="card-body py-2 px-3">
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
                  hasValue(contract?.facility) || hasValue(contract?.city) || hasValue(contract?.province)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            Location Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.facility_name || contract?.facility) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Healthcare Facility</small>
                                            <strong>{contract.facility_name || contract.facility}</strong>
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

                {/* Schedule & Requirements Section */}
                {(hasValue(contract?.work_schedule) || hasValue(contract?.break_included) ||
                  hasValue(contract?.shifts) || hasValue(contract?.shift_pattern) ||
                  hasValue(contract?.minimum_experience) || hasValue(contract?.required_experience) ||
                  hasValue(contract?.required_domain) || hasValue(contract?.required_skills) ||
                  hasValue(contract?.certifications) || hasValue(contract?.software_skills) ||
                  hasValue(contract?.languages)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-clipboard-list mr-2"></i>
                            Schedule & Requirements
                        </h6>
                        <div className="row">
                            {hasValue(contract?.work_schedule) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Work Schedule</small>
                                            <strong>
                                                <i className="fas fa-clock mr-1"></i>
                                                {contract.work_schedule}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.break_included) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Break Included</small>
                                            <strong>
                                                <i className="fas fa-mug-hot mr-1"></i>
                                                {contract.break_included === "yes" ? "Yes" : "No"}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {contract?.break_included === "yes" && hasValue(contract?.break_duration) && (
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
                            {hasValue(contract?.shifts) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Shifts</small>
                                            <strong>
                                                <i className="fas fa-user-clock mr-1"></i>
                                                {formatArray(contract.shifts)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.shift_pattern) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Shift Pattern</small>
                                            <strong>
                                                <i className="fas fa-calendar-day mr-1"></i>
                                                {contract.shift_pattern}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.minimum_experience || contract?.required_experience) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Required Experience Level</small>
                                            <strong>
                                                <i className="fas fa-user-clock mr-1"></i>
                                                {contract.minimum_experience || contract.required_experience}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.required_domain) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Required Domain</small>
                                            <strong>
                                                <i className="fas fa-stethoscope mr-1"></i>
                                                {formatArray(contract.required_domain)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.required_skills) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Required Skills</small>
                                            <strong>
                                                <i className="fas fa-heartbeat mr-1"></i>
                                                {formatArray(contract.required_skills)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.certifications) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Certifications</small>
                                            <strong>
                                                <i className="fas fa-certificate mr-1"></i>
                                                {formatArray(contract.certifications)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.software_skills) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Software Skills</small>
                                            <strong>
                                                <i className="fas fa-laptop-medical mr-1"></i>
                                                {formatArray(contract.software_skills)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.languages) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Languages</small>
                                            <strong>
                                                <i className="fas fa-language mr-1"></i>
                                                {formatArray(contract.languages)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {(() => {
                                // Parse time slots if they exist
                                let timeSlots = [];
                                if (contract?.time_slots) {
                                    try {
                                        timeSlots = JSON.parse(contract.time_slots);
                                    } catch (e) {
                                        console.error("Error parsing time slots:", e);
                                    }
                                }

                                if (timeSlots.length > 0) {
                                    // Check if all time slots have the same start_time and end_time
                                    const allSameTime = timeSlots.every(slot =>
                                        slot.start_time === timeSlots[0].start_time &&
                                        slot.end_time === timeSlots[0].end_time
                                    );

                                    if (allSameTime) {
                                        // Compact view: Show date range + single time slot
                                        const sortedDates = [...timeSlots].sort((a, b) =>
                                            new Date(a.date) - new Date(b.date)
                                        );
                                        const firstDate = sortedDates[0].date;
                                        const lastDate = sortedDates[sortedDates.length - 1].date;
                                        const startTime = sortedDates[0].start_time;
                                        const endTime = sortedDates[0].end_time;

                                        return (
                                            <div className="col-md-12 mb-3">
                                                <div className="card bg-light border-0">
                                                    <div className="card-body py-2 px-3">
                                                        <small className="text-muted d-block mb-2">
                                                            <i className="fas fa-clock mr-1"></i>
                                                            Time Slot (All Dates)
                                                        </small>
                                                        <div className="d-flex align-items-center">
                                                            <div className="mr-4">
                                                                <small className="text-muted d-block">Date Range</small>
                                                                <strong>
                                                                    <i className="far fa-calendar mr-1"></i>
                                                                    {new Date(firstDate).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                    {firstDate !== lastDate && (
                                                                        <>
                                                                            {' → '}
                                                                            {new Date(lastDate).toLocaleDateString('en-US', {
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                                year: 'numeric'
                                                                            })}
                                                                        </>
                                                                    )}
                                                                    <span className="badge badge-info ml-2">
                                                                        {timeSlots.length} day{timeSlots.length > 1 ? 's' : ''}
                                                                    </span>
                                                                </strong>
                                                            </div>
                                                            <div className="mr-4">
                                                                <small className="text-muted d-block">Start Time</small>
                                                                <strong>
                                                                    <i className="fas fa-clock mr-1 text-success"></i>
                                                                    {startTime}
                                                                </strong>
                                                            </div>
                                                            <div>
                                                                <small className="text-muted d-block">End Time</small>
                                                                <strong>
                                                                    <i className="fas fa-clock mr-1 text-danger"></i>
                                                                    {endTime}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Detailed view: Show table with each date
                                        return (
                                            <div className="col-md-12 mb-3">
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
                                            </div>
                                        );
                                    }
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                )}

                {/* Compensation Section */}
                {(hasValue(contract?.compensation_mode) || hasValue(contract?.payment_method) ||
                  hasValue(contract?.daily_rate) || hasValue(contract?.hourly_rate) ||
                  hasValue(contract?.contract_value) || hasValue(contract?.mission_description) ||
                  hasValue(contract?.bonus_incentives) || hasValue(contract?.fees) ||
                  hasValue(contract?.parking) || hasValue(contract?.travel_costs)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-dollar-sign mr-2"></i>
                            Compensation & Benefits
                        </h6>
                        <div className="row">
                            {hasValue(contract?.compensation_mode) && (
                                <div className="col-md-12 mb-3">
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
                            {hasValue(contract?.payment_method) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Payment Method</small>
                                            <strong>
                                                <i className="fas fa-credit-card mr-1"></i>
                                                {contract.payment_method}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.hourly_rate) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Hourly Rate</small>
                                            <strong className="text-success">
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                ${Number(contract.hourly_rate).toLocaleString()} / hour
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.daily_rate) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Daily Rate</small>
                                            <strong className="text-success">
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                ${Number(contract.daily_rate).toLocaleString()} / day
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.contract_value) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Contract Value</small>
                                            <strong className="text-success">
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                ${Number(contract.contract_value).toLocaleString()}
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
                            {hasValue(contract?.bonus_incentives) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Bonus / Incentives</small>
                                            <strong>
                                                <i className="fas fa-gift mr-1"></i>
                                                {contract.bonus_incentives}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.fees) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Fees</small>
                                            <strong>
                                                <i className="fas fa-receipt mr-1"></i>
                                                {contract.fees}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.parking) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Parking</small>
                                            <strong>
                                                <i className="fas fa-parking mr-1"></i>
                                                {contract.parking}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.travel_costs) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Travel / Accommodation</small>
                                            <strong>
                                                <i className="fas fa-plane mr-1"></i>
                                                {contract.travel_costs}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Additional Information Section */}
                {(hasValue(contract?.detailed_job_description) || hasValue(contract?.job_description) ||
                  hasValue(contract?.additional_info)) && (
                    <div className="mb-4">
                        <h6 className="text-dark font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-file-alt mr-2"></i>
                            Additional Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.detailed_job_description || contract?.job_description) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Detailed Job Description</small>
                                            <p className="mb-0 mt-2">{contract.detailed_job_description || contract.job_description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.additional_info) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Additional Information</small>
                                            <p className="mb-0 mt-2">{contract.additional_info}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* License & Compliance Section */}
                {(hasValue(contract?.required_license) || hasValue(contract?.compliance)) && (
                    <div className="mb-4">
                        <h6 className="text-danger font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-shield-alt mr-2"></i>
                            License & Compliance
                        </h6>
                        <div className="row">
                            {hasValue(contract?.required_license) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Required License</small>
                                            <strong>
                                                <span className={`badge badge-${contract.required_license ? 'success' : 'secondary'}`}>
                                                    {contract.required_license ? 'Yes' : 'No'}
                                                </span>
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.compliance) && (
                                <div className="col-md-12">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block mb-2">Compliance Requirements</small>
                                            <div className="d-flex flex-wrap">
                                                {contract?.compliance?.vaccination && (
                                                    <span className="badge badge-info mr-2 mb-2">
                                                        <i className="fas fa-syringe mr-1"></i>Vaccination
                                                    </span>
                                                )}
                                                {contract?.compliance?.criminal_record && (
                                                    <span className="badge badge-info mr-2 mb-2">
                                                        <i className="fas fa-file-alt mr-1"></i>Criminal Record Check
                                                    </span>
                                                )}
                                                {contract?.compliance?.confidentiality && (
                                                    <span className="badge badge-info mr-2 mb-2">
                                                        <i className="fas fa-user-shield mr-1"></i>LPRPDE Confidentiality
                                                    </span>
                                                )}
                                                {contract?.compliance?.mandatory_training && (
                                                    <span className="badge badge-info mr-2 mb-2">
                                                        <i className="fas fa-graduation-cap mr-1"></i>Mandatory Training
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

                {/* Attachments */}
                {hasValue(contract?.attachments) && (
                    <div className="mb-4">
                        <h6 className="text-dark font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-paperclip mr-2"></i>
                            Attachments
                        </h6>
                        <div className="card bg-light border-0">
                            <div className="card-body">
                                <a
                                    href={`${API_BASE_URL ?? ""}/${contract.attachments}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-success btn-sm"
                                >
                                    <i className="fas fa-download mr-2"></i>
                                    View / Download Attachment
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Positions Sought */}
                {hasValue(contract?.contract_positions) && contract.contract_positions.length > 0 && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-briefcase mr-2"></i>
                            Position Sought
                        </h6>
                        <div className="card bg-light border-0">
                            <div className="card-body py-2 px-3">
                                <small className="text-muted d-block">Position</small>
                                <strong>
                                    <i className="fas fa-user-nurse mr-1"></i>
                                    {contract.contract_positions[0].position?.name || "-"}
                                </strong>
                                {contract.contract_positions[0].professional_category && (
                                    <div className="mt-2">
                                        <small className="text-muted d-block">Category</small>
                                        <span className="badge badge-info">
                                            {contract.contract_positions[0].professional_category?.name || "Nursing and Home Care"}
                                        </span>
                                    </div>
                                )}
                            </div>
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

export default NursingTemporaryModal;