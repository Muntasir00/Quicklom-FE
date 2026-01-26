import React from "react";

const StructureLocumLicenseForm = () => {
    return (
        <form>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="position">Position <span className="text-red">*</span></label>
                        <select className="form-control" id="position">
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
                            <option value="Pharmacy Technician (ATP) - QuePharmacist">Pharmacy Technician (ATP) - QuePharmacist</option>
                            <option value="Assistant - outside Quebec Only">Assistant - outside Quebec Only</option>
                            <option value="Technician - outside Quebec Only">Technician - outside Quebec Only</option>
                            <option value="Pharmacy Clerk">Pharmacy Clerk</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="licenseRequired">License Required <span className="text-red">*</span></label>
                        <select className="form-control" id="licenseRequired">
                            <option value="">Select Option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="optional">Optional</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="licenseNumber">License Number</label>
                        <input type="text" className="form-control" id="licenseNumber" placeholder="Enter license number" />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="licenseExpiry">License Expiry Date</label>
                        <input type="date" className="form-control" id="licenseExpiry" />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="issuingAuthority">Issuing Authority</label>
                        <textarea className="form-control" id="issuingAuthority" placeholder="Enter issuing authority" rows="3"></textarea>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="licenseDocument">License Document</label>
                        <input type="file" className="form-control-file" id="licenseDocument" accept=".pdf,.jpg,.png" />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="specializations">Specializations</label>
                        <select className="form-control" id="specializations" multiple>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Orthodontics">Orthodontics</option>
                            <option value="Surgery">Surgery</option>
                            <option value="Geriatrics">Geriatrics</option>
                            <option value="Oncology">Oncology</option>
                            <option value="Emergency Medicine">Emergency Medicine</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="certifications">Certifications</label>
                        <select className="form-control" id="certifications" multiple>
                            <option value="ACLS">ACLS (Advanced Cardiac Life Support)</option>
                            <option value="PALS">PALS (Pediatric Advanced Life Support)</option>
                            <option value="BLS">BLS (Basic Life Support)</option>
                            <option value="CPR">CPR (Cardiopulmonary Resuscitation)</option>
                            <option value="First Aid">First Aid</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default StructureLocumLicenseForm;