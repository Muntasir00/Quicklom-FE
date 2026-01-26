import { API_BASE_URL } from "@config/apiConfig";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StructureLocumLicenseFormSchema } from "@schemas/user/StructureLocumLicenseFormSchema";

const StructureLocumLicenseForm = ({ profileData, setStructureLocumLicenseFormData, setCurrentStep }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(StructureLocumLicenseFormSchema),
        defaultValues: {
            position: "",
            license_required: "",
            license_number: "",
            license_expiry: "",
            issuing_authority: "",
            license_document: null,
            notes: "",
            additional_info: "",
        },
    });

    const onSubmit = (data) => {
        setStructureLocumLicenseFormData(data);
        setCurrentStep((prev) => prev + 1);
    };

    useEffect(() => {
        if (profileData) {
            reset({
                position: profileData.position || "",
                license_required: profileData.license_required || "",
                license_number: profileData.license_number || "",
                license_expiry: profileData.license_expiry || "",
                issuing_authority: profileData.issuing_authority || "",
                license_document: profileData.license_document || null,
                notes: profileData.notes || "",
                additional_info: profileData.additional_info || "",
            });
        }
    }, [profileData, reset]);

    return (
        <form id="form-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
                <div className="col-md-12">
                    <div className="text-center">
                        <h5 className="text-dark">Section: License Information</h5><hr />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.position ? " has-error" : ""}`}>
                        <label htmlFor="position">Position <span className="text-red">*</span></label>
                        <select id="position" className="form-control" {...register("position")}>
                            <option value="">Select Position</option>
                            <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                            <option value="Licensed Practical Nurse (LPN) / Registered Nurse Practitioner (NP)">Licensed Practical Nurse (LPN) / Registered Nurse Practitioner (NP)</option>
                            <option value="Home Care Nurse">Home Care Nurse</option>
                            <option value="Healthcare Aide / Personal Support Worker (PSW)">Healthcare Aide / Personal Support Worker (PSW)</option>
                            <option value="Family Physician / General Practitioner">Family Physician / General Practitioner</option>
                            <option value="General Dentist">General Dentist</option>
                            <option value="Specialist Dentist">Specialist Dentist</option>
                            <option value="Dental Hygienist">Dental Hygienist</option>
                            <option value="Dental Assistant">Dental Assistant</option>
                            <option value="Dental Secretary">Dental Secretary</option>
                            <option value="Pharmacy Technician (ATP) - Quebec">Pharmacy Technician (ATP) - Quebec</option>
                            <option value="Pharmacist">Pharmacist</option>
                            <option value="Assistant - outside Quebec Only">Assistant - outside Quebec Only</option>
                            <option value="Technician - outside Quebec Only">Technician - outside Quebec Only</option>
                            <option value="Pharmacy Clerk">Pharmacy Clerk</option>
                        </select>
                        <span className={`text-danger ${errors.position ? "" : "d-none"}`}>
                            {errors.position && <strong>{errors.position.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.license_required ? " has-error" : ""}`}>
                        <label htmlFor="licenseRequired">License Required <span className="text-red">*</span></label>
                        <select id="licenseRequired" className="form-control" {...register("license_required")}>
                            <option value="">Select Option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="optional">Optional</option>
                        </select>
                        <span className={`text-danger ${errors.license_required ? "" : "d-none"}`}>
                            {errors.license_required && <strong>{errors.license_required.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.license_number ? " has-error" : ""}`}>
                        <label htmlFor="licenseNumber">License Number <span className="text-red">*</span></label>
                        <input type="text" id="licenseNumber" className="form-control" placeholder="12345678" {...register("license_number")} />
                        <span className={`text-danger ${errors.license_number ? "" : "d-none"}`}>
                            {errors.license_number && <strong>{errors.license_number.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.license_expiry ? " has-error" : ""}`}>
                        <label htmlFor="licenseExpiry">License Expiry Date <span className="text-red">*</span></label>
                        <input type="date" id="licenseExpiry" className="form-control" {...register("license_expiry")} />
                        <span className={`text-danger ${errors.license_expiry ? "" : "d-none"}`}>
                            {errors.license_expiry && <strong>{errors.license_expiry.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.issuing_authority ? " has-error" : ""}`}>
                        <label htmlFor="issuingAuthority">Issuing Authority <span className="text-red">*</span></label>
                        <input type="text" id="issuingAuthority" className="form-control" placeholder="Enter issuing authority" {...register("issuing_authority")} />
                        <span className={`text-danger ${errors.issuing_authority ? "" : "d-none"}`}>
                            {errors.issuing_authority && <strong>{errors.issuing_authority.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.license_document ? " has-error" : ""}`}>
                        <label htmlFor="licenseDocument">License Document <span className="text-red">*</span></label>
                        <input type="file" id="licenseDocument" className="form-control-file" accept=".pdf,.jpg,.png" {...register("license_document")} />
                        <span className={`text-danger ${errors.license_document ? "" : "d-none"}`}>
                            {errors.license_document && <strong>{errors.license_document.message}</strong>}
                        </span>
                        <small className="form-text text-muted mt-1">
                            {profileData?.license_document && (
                                <a href={`${API_BASE_URL}/${profileData.license_document}`} target="_blank" rel="noopener noreferrer">
                                    Download here
                                </a>
                            )}
                        </small>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.notes ? " has-error" : ""}`}>
                        <label htmlFor="notes">Notes <span className="text-red">*</span></label>
                        <input type="text" id="notes" className="form-control" placeholder="Enter any notes" {...register("notes")} />
                        <span className={`text-danger ${errors.notes ? "" : "d-none"}`}>
                            {errors.notes && <strong>{errors.notes.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.additional_info ? " has-error" : ""}`}>
                        <label htmlFor="additionalInfo">Additional Info <span className="text-red">*</span></label>
                        <input type="text" id="additionalInfo" className="form-control" placeholder="Enter additional info" {...register("additional_info")} />
                        <span className={`text-danger ${errors.additional_info ? "" : "d-none"}`}>
                            {errors.additional_info && <strong>{errors.additional_info.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default StructureLocumLicenseForm;
