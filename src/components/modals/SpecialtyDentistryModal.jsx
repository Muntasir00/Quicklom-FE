import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useShowContract } from "@hooks/user/contracts/useShowContract";

const SpecialtyDentistryModal = ({ show, setShow, contract }) => {
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
    `;

    return (
        <>
        <style>{modalStyles}</style>
        <Modal show={show} size="xl" centered dialogClassName="contract-modal-fullscreen">
            <Modal.Header className="bg-info text-white">
                <Modal.Title className="d-flex align-items-center w-100">
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-white text-info mr-3" style={{width: '48px', height: '48px'}}>
                        <i className="fas fa-tooth fa-lg"></i>
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="mb-0 font-weight-bold">Specialty Dentistry Contract</h5>
                        <small className="opacity-75">Contract ID: #{contract?.id || '-'}</small>
                    </div>
                    <div className="ml-auto">
                        {contract?.status && (
                            <span className={`badge badge-${
                                contract.status === 'open' ? 'success' :
                                contract.status === 'pending' ? 'warning' :
                                contract.status === 'cancelled' ? 'danger' :
                                contract.status === 'in_discussion' ? 'light' :
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
                                <div className="card bg-info text-white border-0">
                                    <div className="card-body py-3 px-3">
                                        <small className="d-block opacity-75">Contract Type</small>
                                        <h5 className="mb-0 font-weight-bold">{contract.contract_type.contract_name}</h5>
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

                {/* Specialty Information */}
                {hasValue(contract?.data?.required_specialty || contract?.data?.specialty) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-user-md mr-2"></i>
                            Dental Specialty
                        </h6>
                        <div className="card bg-light border-0">
                            <div className="card-body py-2 px-3">
                                <small className="text-muted d-block">Required Specialty</small>
                                <strong className="text-info">
                                    <i className="fas fa-tooth mr-1"></i>
                                    {contract.data.required_specialty || formatArray(contract.data.specialty)}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mission Objective / Procedure */}
                {hasValue(contract?.data?.mission_objective) && (
                    <div className="mb-4">
                        <h6 className="text-dark font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-tasks mr-2"></i>
                            Mission Objective / Procedure
                        </h6>
                        <div className="card bg-light border-0">
                            <div className="card-body py-2 px-3">
                                <p className="mb-0">{contract.data.mission_objective}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Location Information Section */}
                {(hasValue(contract?.data?.facility_name) || hasValue(contract?.data?.contract_location) ||
                  hasValue(contract?.data?.city) || hasValue(contract?.data?.province)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            Location Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.data?.facility_name) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Dental Clinic/Facility</small>
                                            <strong>{contract.data.facility_name}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.contract_location) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Contract Location</small>
                                            <strong>{contract.data.contract_location}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.street_address) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Street Address</small>
                                            <strong>{contract.data.street_address}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="col-md-4 mb-3">
                                {hasValue(contract?.data?.city) && (
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">City</small>
                                            <strong>{contract.data.city}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-4 mb-3">
                                {hasValue(contract?.data?.province) && (
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Province</small>
                                            <strong>{contract.data.province}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-4 mb-3">
                                {hasValue(contract?.data?.postal_code) && (
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Postal Code</small>
                                            <strong>{contract.data.postal_code}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contract Dates Section */}
                {(hasValue(contract?.start_date) || hasValue(contract?.end_date) || hasValue(contract?.data?.estimated_duration)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            Schedule & Duration
                        </h6>
                        <div className="row">
                            {hasValue(contract?.start_date) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Desired Start Date</small>
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
                                            <small className="text-muted d-block">Desired End Date</small>
                                            <strong>
                                                <i className="far fa-calendar-times mr-1"></i>
                                                {new Date(contract.end_date).toLocaleDateString()}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.estimated_duration) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Estimated Duration</small>
                                            <strong>
                                                <i className="fas fa-clock mr-1"></i>
                                                {typeof contract.data.estimated_duration === 'object'
                                                    ? `${contract.data.estimated_duration.start_hour || '-'} to ${contract.data.estimated_duration.end_hour || '-'}`
                                                    : contract.data.estimated_duration
                                                }
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Selected Dates */}
                {hasValue(contract?.data?.selected_dates) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-calendar-check mr-2"></i>
                            Selected Dates
                        </h6>
                        <div className="d-flex flex-wrap">
                            {(() => {
                                try {
                                    const dates = Array.isArray(contract.data.selected_dates)
                                        ? contract.data.selected_dates
                                        : JSON.parse(contract.data.selected_dates || '[]');

                                    if (Array.isArray(dates) && dates.length > 0) {
                                        return dates.sort().map(date => (
                                            <span key={date} className="badge badge-primary mr-2 mb-2 px-3 py-2">
                                                <i className="fas fa-calendar-day mr-1"></i>
                                                {new Date(date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        ));
                                    }
                                } catch (error) {
                                    console.error("Error parsing dates:", error);
                                }
                                return <span className="text-muted">No dates selected</span>;
                            })()}
                        </div>
                    </div>
                )}

                {/* Duration Information */}
                {(hasValue(contract?.data?.estimated_duration) || hasValue(contract?.data?.date_durations)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-clock mr-2"></i>
                            Work Duration
                        </h6>

                        {contract?.data?.duration_mode === "per_date" && contract?.data?.date_durations ? (
                            <div className="card bg-light border-0">
                                <div className="card-body">
                                    <small className="text-muted d-block mb-2">
                                        <i className="fas fa-calendar-day mr-1"></i>Duration varies by date
                                    </small>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped mb-0">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Start Time</th>
                                                    <th>End Time</th>
                                                    <th>Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    try {
                                                        const durations = typeof contract.data.date_durations === 'string'
                                                            ? JSON.parse(contract.data.date_durations)
                                                            : contract.data.date_durations;

                                                        return Object.entries(durations).sort(([a], [b]) => a.localeCompare(b)).map(([date, times]) => {
                                                            const start = times.start_hour.split(':');
                                                            const end = times.end_hour.split(':');
                                                            const startMins = parseInt(start[0]) * 60 + parseInt(start[1]);
                                                            const endMins = parseInt(end[0]) * 60 + parseInt(end[1]);
                                                            const durationMins = endMins - startMins;
                                                            const hours = Math.floor(durationMins / 60);
                                                            const mins = durationMins % 60;

                                                            return (
                                                                <tr key={date}>
                                                                    <td>
                                                                        <strong>
                                                                            {new Date(date).toLocaleDateString('en-US', {
                                                                                month: 'short', day: 'numeric', year: 'numeric'
                                                                            })}
                                                                        </strong>
                                                                    </td>
                                                                    <td><span className="badge badge-success">{times.start_hour}</span></td>
                                                                    <td><span className="badge badge-danger">{times.end_hour}</span></td>
                                                                    <td><span className="badge badge-info">{hours}h {mins}m</span></td>
                                                                </tr>
                                                            );
                                                        });
                                                    } catch (error) {
                                                        console.error("Error parsing durations:", error);
                                                        return <tr><td colSpan="4" className="text-danger">Error displaying durations</td></tr>;
                                                    }
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : contract?.data?.estimated_duration ? (
                            <div className="row">
                                {hasValue(contract.data.estimated_duration?.start_hour) && (
                                    <div className="col-md-4 mb-3">
                                        <div className="card bg-light border-0">
                                            <div className="card-body py-2 px-3">
                                                <small className="text-muted d-block">Start Time</small>
                                                <strong>
                                                    <i className="fas fa-hourglass-start mr-1"></i>
                                                    {contract.data.estimated_duration.start_hour}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hasValue(contract.data.estimated_duration?.end_hour) && (
                                    <div className="col-md-4 mb-3">
                                        <div className="card bg-light border-0">
                                            <div className="card-body py-2 px-3">
                                                <small className="text-muted d-block">End Time</small>
                                                <strong>
                                                    <i className="fas fa-hourglass-end mr-1"></i>
                                                    {contract.data.estimated_duration.end_hour}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hasValue(contract.data.estimated_duration?.start_hour) && hasValue(contract.data.estimated_duration?.end_hour) && (
                                    <div className="col-md-4 mb-3">
                                        <div className="card bg-info text-white border-0">
                                            <div className="card-body py-2 px-3">
                                                <small className="d-block opacity-75">Total Duration</small>
                                                <strong>
                                                    {(() => {
                                                        const start = contract.data.estimated_duration.start_hour.split(':');
                                                        const end = contract.data.estimated_duration.end_hour.split(':');
                                                        const startMins = parseInt(start[0]) * 60 + parseInt(start[1]);
                                                        const endMins = parseInt(end[0]) * 60 + parseInt(end[1]);
                                                        const durationMins = endMins - startMins;
                                                        const hours = Math.floor(durationMins / 60);
                                                        const mins = durationMins % 60;
                                                        return `${hours}h ${mins}m`;
                                                    })()}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Compensation Information */}
                {(hasValue(contract?.data?.compensation_mode) || hasValue(contract?.data?.hourly_rate) ||
                  hasValue(contract?.data?.contract_value) || hasValue(contract?.data?.proposed_rate) || hasValue(contract?.data?.rate_amount)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-dollar-sign mr-2"></i>
                            Compensation Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.data?.compensation_mode) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Compensation Mode</small>
                                            <strong>
                                                <span className={`badge badge-${contract.data.compensation_mode === 'Per Hour' ? 'info' : 'primary'} px-3 py-2`}>
                                                    <i className="fas fa-clock mr-1"></i>
                                                    {contract.data.compensation_mode}
                                                </span>
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.hourly_rate) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-success text-white border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="d-block opacity-75">Hourly Rate</small>
                                            <h5 className="mb-0 font-weight-bold">
                                                <i className="fas fa-dollar-sign mr-1"></i>
                                                {parseFloat(contract.data.hourly_rate).toFixed(2)} CAD / Hour
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.contract_value) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-success text-white border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="d-block opacity-75">Contract Value</small>
                                            <h5 className="mb-0 font-weight-bold">
                                                <i className="fas fa-dollar-sign mr-1"></i>
                                                {parseFloat(contract.data.contract_value).toFixed(2)} CAD
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.mission_description) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Mission Description</small>
                                            <p className="mb-0">{contract.data.mission_description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Legacy fields for backward compatibility */}
                            {hasValue(contract?.data?.proposed_rate) && !hasValue(contract?.data?.compensation_mode) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Rate Type (Legacy)</small>
                                            <strong>
                                                <span className={`badge badge-${contract.data.proposed_rate === 'hourly' ? 'info' : 'primary'} px-3 py-2`}>
                                                    <i className="fas fa-clock mr-1"></i>
                                                    {contract.data.proposed_rate === 'hourly' ? 'Per Hour' : 'Fixed Contract Value'}
                                                </span>
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.rate_amount) && !hasValue(contract?.data?.hourly_rate) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-success text-white border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="d-block opacity-75">
                                                {contract.data.proposed_rate === 'hourly' ? 'Hourly Rate' : 'Contract Value'} (Legacy)
                                            </small>
                                            <h5 className="mb-0 font-weight-bold">
                                                <i className="fas fa-dollar-sign mr-1"></i>
                                                {parseFloat(contract.data.rate_amount).toFixed(2)} CAD
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Equipment & Requirements */}
                {(hasValue(contract?.data?.equipment_room) || hasValue(contract?.data?.dental_equipment) ||
                  hasValue(contract?.data?.required_documents)) && (
                    <div className="mb-4">
                        <h6 className="text-warning font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-tools mr-2"></i>
                            Equipment & Requirements
                        </h6>
                        <div className="row">
                            {hasValue(contract?.data?.equipment_room) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Equipment / Room</small>
                                            <strong>
                                                <i className="fas fa-medkit mr-1"></i>
                                                {contract.data.equipment_room}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.dental_equipment) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Dental Equipment</small>
                                            <strong>
                                                <i className="fas fa-medkit mr-1"></i>
                                                {formatArray(contract.data.dental_equipment)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.required_documents) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Required Documents / Consent</small>
                                            <strong>
                                                <i className="fas fa-file-medical mr-1"></i>
                                                {contract.data.required_documents}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Practice Information */}
                {(hasValue(contract?.data?.practice_type) || hasValue(contract?.data?.patient_demographics)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-clinic-medical mr-2"></i>
                            Practice Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.data?.practice_type) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Practice Type</small>
                                            <strong>
                                                <i className="fas fa-building mr-1"></i>
                                                {contract.data.practice_type}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.patient_demographics) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Patient Demographics</small>
                                            <strong>
                                                <i className="fas fa-users mr-1"></i>
                                                {contract.data.patient_demographics}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Additional Information */}
                {hasValue(contract?.data?.additional_info || contract?.data?.detailed_job_description) && (
                    <div className="mb-4">
                        <h6 className="text-dark font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-file-alt mr-2"></i>
                            Additional Information
                        </h6>
                        <div className="card bg-light border-0">
                            <div className="card-body py-2 px-3">
                                <p className="mb-0">{contract.data.additional_info || contract.data.detailed_job_description}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* License & Compliance Section */}
                {(hasValue(contract?.data?.required_license) || hasValue(contract?.data?.compliance)) && (
                    <div className="mb-4">
                        <h6 className="text-danger font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-shield-alt mr-2"></i>
                            License & Compliance
                        </h6>
                        <div className="row">
                            {hasValue(contract?.data?.required_license) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Required License</small>
                                            <strong>
                                                <span className={`badge badge-${contract.data.required_license ? 'success' : 'secondary'}`}>
                                                    {contract.data.required_license ? 'Yes' : 'No'}
                                                </span>
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.data?.compliance) && (
                                <div className="col-md-12">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block mb-2">Compliance Requirements</small>
                                            <div className="d-flex flex-wrap">
                                                {contract?.data?.compliance?.vaccination && (
                                                    <span className="badge badge-info mr-2 mb-2">
                                                        <i className="fas fa-syringe mr-1"></i>Vaccination
                                                    </span>
                                                )}
                                                {contract?.data?.compliance?.criminal_record && (
                                                    <span className="badge badge-info mr-2 mb-2">
                                                        <i className="fas fa-file-alt mr-1"></i>Criminal Record Check
                                                    </span>
                                                )}
                                                {contract?.data?.compliance?.confidentiality && (
                                                    <span className="badge badge-info mr-2 mb-2">
                                                        <i className="fas fa-user-shield mr-1"></i>Confidentiality Agreement
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
                {hasValue(contract?.data?.attachments) && (
                    <div className="mb-4">
                        <h6 className="text-dark font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-paperclip mr-2"></i>
                            Attachments
                        </h6>
                        <div className="card bg-light border-0">
                            <div className="card-body">
                                <a
                                    href={`${API_BASE_URL ?? ""}/${contract.data.attachments}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-info btn-sm"
                                >
                                    <i className="fas fa-download mr-2"></i>
                                    View / Download Attachment
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Positions Sought with Specialty */}
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
                <Button variant="secondary" onClick={() => setShow(false)} className="px-4">
                    <i className="fas fa-times mr-2"></i>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default SpecialtyDentistryModal;