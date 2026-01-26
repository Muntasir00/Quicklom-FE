import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useShowContract } from "@hooks/user/contracts/useShowContract";

const PermanentStaffingDentalModal = ({ show, setShow, contract }) => {
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
                        <h5 className="mb-0 font-weight-bold">Permanent Staffing (Dental)</h5>
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
                        {hasValue(contract?.job_title || contract?.position_title) && (
                            <div className="col-md-6 mb-3">
                                <div className="card bg-primary text-white border-0">
                                    <div className="card-body py-3 px-3">
                                        <small className="d-block opacity-75">Job Title</small>
                                        <h5 className="mb-0 font-weight-bold">{contract.job_title || contract.position_title}</h5>
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
                {(hasValue(contract?.specialty) || hasValue(contract?.specialist_dentist_role)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-user-md mr-2"></i>
                            Specialty Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.specialty) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Dental Specialty</small>
                                            <strong>
                                                <i className="fas fa-tooth mr-1"></i>
                                                {formatArray(contract.specialty)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.specialty.specialist_dentist_role) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Specialist Dentist Role</small>
                                            <strong>
                                                <i className="fas fa-user-md mr-1"></i>
                                                {formatArray(contract.specialty.specialist_dentist_role)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Location Information Section */}
                {(hasValue(contract?.facility_name) || hasValue(contract?.contract_location) ||
                  hasValue(contract?.city) || hasValue(contract?.province)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            Location Information
                        </h6>
                        <div className="row">
                            {hasValue(contract?.facility_name) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Dental Clinic/Facility</small>
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

                {/* Contract Dates Section */}
                {(hasValue(contract?.start_date) || hasValue(contract?.end_date)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            Contract Dates
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

                {/* Requirements Section */}
                {(hasValue(contract?.required_experience) || hasValue(contract?.minimum_experience) ||
                  hasValue(contract?.required_skills) || hasValue(contract?.software_skills) ||
                  hasValue(contract?.languages) || hasValue(contract?.dental_equipment)) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-clipboard-list mr-2"></i>
                            Requirements
                        </h6>
                        <div className="row">
                            {hasValue(contract?.required_experience || contract?.minimum_experience) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Required Experience Level</small>
                                            <strong>
                                                <i className="fas fa-user-clock mr-1"></i>
                                                {contract.required_experience || contract.minimum_experience}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.working_shifts) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Working Shifts</small>
                                            <strong>
                                                <i className="fas fa-clock mr-1"></i>
                                                {formatArray(contract.working_shifts)}
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
                                                <i className="fas fa-tools mr-1"></i>
                                                {formatArray(contract.required_skills)}
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
                                                <i className="fas fa-laptop mr-1"></i>
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
                            {hasValue(contract?.dental_equipment) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Dental Equipment</small>
                                            <strong>
                                                <i className="fas fa-medkit mr-1"></i>
                                                {formatArray(contract.dental_equipment)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Compensation & Benefits Section */}
                {(hasValue(contract?.annual_salary) || hasValue(contract?.gross_salary) ||
                  hasValue(contract?.hourly_rate) || hasValue(contract?.compensation_mode) ||
                  hasValue(contract?.benefits) || hasValue(contract?.additional_bonus) ||
                  hasValue(contract?.travel_costs)) && (
                    <div className="mb-4">
                        <h6 className="text-success font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-dollar-sign mr-2"></i>
                            Compensation & Benefits
                        </h6>
                        <div className="row">
                            {/* Primary field: Gross Annual Salary */}
                            {hasValue(contract?.annual_salary) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-success text-white border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="d-block opacity-75">Gross Annual Salary</small>
                                            <strong>
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                ${Number(contract.annual_salary).toLocaleString()} CAD / Year
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Legacy fields for backward compatibility */}
                            {hasValue(contract?.hourly_rate) && !hasValue(contract?.annual_salary) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Hourly Rate (Legacy)</small>
                                            <strong className="text-success">
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                ${Number(contract.hourly_rate).toLocaleString()} CAD / Hour
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.production_percentage) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Production Percentage</small>
                                            <strong className="text-success">
                                                <i className="fas fa-percentage mr-1"></i>
                                                {contract.production_percentage}% of Production
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.other_compensation) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Compensation Details</small>
                                            <strong className="text-success">
                                                <i className="fas fa-file-alt mr-1"></i>
                                                {contract.other_compensation}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.compensation) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Compensation (Legacy)</small>
                                            <strong className="text-success">
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                {contract.compensation}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.gross_salary) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Gross Annual Salary (Legacy)</small>
                                            <strong className="text-success">
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                ${Number(contract.gross_salary).toLocaleString()}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.benefits) && (
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Benefits</small>
                                            <strong>
                                                <i className="fas fa-gift mr-1"></i>
                                                {formatArray(contract.benefits)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasValue(contract?.additional_bonus) && (
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-2 px-3">
                                            <small className="text-muted d-block">Additional Bonus / Incentives</small>
                                            <strong>
                                                <i className="fas fa-trophy mr-1"></i>
                                                {contract.additional_bonus}
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

                {/* Urgent Need */}
                {hasValue(contract?.urgent_need) && (
                    <div className="mb-4">
                        <div className="card bg-warning border-0">
                            <div className="card-body py-2 px-3">
                                <small className="text-dark d-block">Urgent Need</small>
                                <strong>
                                    <span className="badge badge-danger">
                                        <i className="fas fa-exclamation-triangle mr-1"></i>
                                        {contract.urgent_need ? 'YES - URGENT' : 'No'}
                                    </span>
                                </strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Job Description */}
                {hasValue(contract?.job_description || contract?.detailed_job_description) && (
                    <div className="mb-4">
                        <h6 className="text-dark font-weight-bold mb-3 pb-2 border-bottom">
                            <i className="fas fa-file-alt mr-2"></i>
                            Job Description
                        </h6>
                        <div className="card bg-light border-0">
                            <div className="card-body py-2 px-3">
                                <p className="mb-0">{contract.job_description || contract.detailed_job_description}</p>
                            </div>
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
                                    className="btn btn-outline-info btn-sm"
                                >
                                    <i className="fas fa-download mr-2"></i>
                                    View / Download Attachment
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Positions Sought */}
                {hasValue(contract?.contract_positions) && (
                    <div className="mb-4">
                        <h6 className="text-info font-weight-bold mb-3 pb-2 border-bottom">
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

export default PermanentStaffingDentalModal;