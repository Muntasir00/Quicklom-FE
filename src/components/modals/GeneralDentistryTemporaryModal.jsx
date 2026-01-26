import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useShowContract } from "@hooks/user/contracts/useShowContract";

const GeneralDentistryTemporaryModal = ({show, setShow, contract}) => {
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
        .contract-modal-fullscreen .section-card {
            border-radius: 8px !important;
            border: 1px solid #e9ecef !important;
            transition: box-shadow 0.2s ease !important;
        }
        .contract-modal-fullscreen .section-card:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
        }
        .contract-modal-fullscreen .info-card {
            background: #f8f9fa !important;
            border-radius: 6px !important;
            padding: 0.75rem 1rem !important;
            height: 100% !important;
        }
        .contract-modal-fullscreen .section-title {
            font-size: 0.9rem !important;
            font-weight: 600 !important;
            margin-bottom: 1rem !important;
            padding-bottom: 0.5rem !important;
            border-bottom: 2px solid #e9ecef !important;
        }
    `;

    return (
        <>
        <style>{modalStyles}</style>
        <Modal show={show} size="xl" centered dialogClassName="contract-modal-fullscreen">
            <Modal.Header className="bg-primary text-white">
                <Modal.Title className="d-flex align-items-center w-100">
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-white text-primary mr-3" style={{width: '48px', height: '48px'}}>
                        <i className="fas fa-tooth fa-lg"></i>
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="mb-0 font-weight-bold">General Dentistry Contract</h5>
                        <small className="opacity-75">Contract ID: #{contract?.id || '-'}</small>
                    </div>
                    <div className="ml-auto">
                        {contract?.status && (
                            <span className={`badge badge-${
                                contract.status === 'open' ? 'success' :
                                contract.status === 'pending' ? 'warning' :
                                contract.status === 'cancelled' ? 'danger' :
                                contract.status === 'in_discussion' ? 'info' :
                                contract.status === 'booked' ? 'light' :
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
                        {hasValue(contract?.position_sought) && (
                            <div className="col-md-6 mb-3">
                                <div className="card bg-success text-white border-0">
                                    <div className="card-body py-3 px-3">
                                        <small className="d-block opacity-75">Position Sought</small>
                                        <h5 className="mb-0 font-weight-bold">{contract.position_sought}</h5>
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
                            {hasValue(contract?.city) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">City</small>
                                            <strong>{contract.city}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.province) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Province</small>
                                            <strong>{contract.province}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.postal_code) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Postal Code</small>
                                            <strong>{contract.postal_code}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Contract Details Section */}
                {(hasValue(contract?.start_date) || hasValue(contract?.end_date) ||
                  hasValue(contract?.work_schedule) || hasValue(contract?.selected_dates)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            Contract Schedule
                        </h6>
                        <div className="row">
                            {hasValue(contract?.start_date) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Start Date</small>
                                            <strong><i className="far fa-calendar mr-1"></i>{contract.start_date}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.end_date) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">End Date</small>
                                            <strong><i className="far fa-calendar mr-1"></i>{contract.end_date}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.work_schedule) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Work Schedule</small>
                                            <strong><i className="far fa-clock mr-1"></i>{contract.work_schedule}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.selected_dates) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Selected Working Dates</small>
                                            <strong>
                                                {(() => {
                                                    try {
                                                        const dates = Array.isArray(contract.selected_dates)
                                                            ? contract.selected_dates
                                                            : JSON.parse(contract.selected_dates || '[]');
                                                        return dates.join(', ');
                                                    } catch (e) {
                                                        return contract.selected_dates;
                                                    }
                                                })()}
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
                                                                    timeSlots = Array.isArray(contract.time_slots)
                                                                        ? contract.time_slots
                                                                        : JSON.parse(contract.time_slots);
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
                            {hasValue(contract?.break_included) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Break Included</small>
                                            <strong>
                                                <span className={`badge badge-${contract.break_included === 'yes' ? 'success' : 'secondary'}`}>
                                                    {contract.break_included}
                                                </span>
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.break_duration) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Break Duration</small>
                                            <strong>{contract.break_duration}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Compensation Section */}
                {(hasValue(contract?.compensation_mode) || hasValue(contract?.daily_rate) ||
                  hasValue(contract?.hourly_rate) || hasValue(contract?.bonus_incentives)) && (
                    <div className="mb-4">
                        <h6 className="text-warning font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-dollar-sign mr-2"></i>
                            Compensation Details
                        </h6>
                        <div className="row">
                            {hasValue(contract?.compensation_mode) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Compensation Mode</small>
                                            <strong className="text-capitalize">{contract.compensation_mode}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.daily_rate) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Daily Rate</small>
                                            <strong className="text-success">${contract.daily_rate}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.hourly_rate) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Hourly Rate</small>
                                            <strong className="text-success">${contract.hourly_rate}/hr</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.contract_value) && (
                                <div className="col-md-4 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Contract Value</small>
                                            <strong className="text-success">${contract.contract_value}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.bonus_incentives) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Bonus/Incentives</small>
                                            <strong>
                                                <span className={`badge badge-${contract.bonus_incentives === 'yes' ? 'success' : 'secondary'}`}>
                                                    {contract.bonus_incentives}
                                                </span>
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
                                            <strong>{contract.fees}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Requirements Section */}
                {(hasValue(contract?.required_experience) || hasValue(contract?.languages) ||
                  hasValue(contract?.software) || hasValue(contract?.parking)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-tasks mr-2"></i>
                            Requirements & Benefits
                        </h6>
                        <div className="row">
                            {hasValue(contract?.required_experience) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Required Experience</small>
                                            <strong>{contract.required_experience}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.parking) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Parking</small>
                                            <strong>{contract.parking}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.languages) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Languages</small>
                                            <strong>{formatArray(contract.languages)}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.software) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Software</small>
                                            <strong>{formatArray(contract.software)}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Job Description Section */}
                {(hasValue(contract?.detailed_job_description) || hasValue(contract?.additional_info) || hasValue(contract?.mission_description)) && (
                    <div className="mb-4">
                        <h6 className="text-secondary font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-file-alt mr-2"></i>
                            Job Description
                        </h6>
                        {hasValue(contract?.detailed_job_description) && (
                            <div className="card bg-light border-0 mb-3">
                                <div className="card-body">
                                    <small className="text-muted d-block mb-2">Detailed Job Description</small>
                                    <p className="mb-0">{contract.detailed_job_description}</p>
                                </div>
                            </div>
                        )}
                        {hasValue(contract?.additional_info) && (
                            <div className="card bg-light border-0 mb-3">
                                <div className="card-body">
                                    <small className="text-muted d-block mb-2">Additional Information</small>
                                    <p className="mb-0">{contract.additional_info}</p>
                                </div>
                            </div>
                        )}
                        {hasValue(contract?.mission_description) && (
                            <div className="card bg-light border-0">
                                <div className="card-body">
                                    <small className="text-muted d-block mb-2">Mission Description</small>
                                    <p className="mb-0">{contract.mission_description}</p>
                                </div>
                            </div>
                        )}
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
                                    className="btn btn-outline-primary btn-sm"
                                >
                                    <i className="fas fa-download mr-2"></i>
                                    View / Download Attachment
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Positions Sought */}
                {(hasValue(contract?.contract_positions) || hasValue(contract?.position_soughts)) && (
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
                            <th>Specialty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(
                            { length: Math.max(
                                contract?.contract_positions?.length || 0,
                                contract?.position_soughts?.length || 0
                              )
                            },
                            (_, index) => {
                              const position = contract?.contract_positions?.[index];
                              const specialty = contract?.position_soughts?.[index];

                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td><strong>{position?.position?.name || "-"}</strong></td>
                                  <td><strong>{specialty?.specialist_dentist_role || "-"}</strong></td>
                                </tr>
                              );
                            }
                          )}
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
                <Button
                    variant="secondary"
                    onClick={() => setShow(false)}
                    className="px-4"
                >
                    <i className="fas fa-times mr-2"></i>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default GeneralDentistryTemporaryModal;