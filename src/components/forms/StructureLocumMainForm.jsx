import { API_BASE_URL } from "@config/apiConfig";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StructureLocumMainFormSchema } from "@schemas/user/StructureLocumMainFormSchema"
import { provinces } from "@constants/ProfileConstants"
import { getPositionSoughtsByCategoryService } from "@services/user/PositionSoughtService";


const StructureLocumMainForm = ({
    profileData,
    setStructureLocumMainFormData,
    setCurrentStep,
    mainFormData ,
    categories
}) => {

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const professional_category_id = mainFormData.professional_category_id;
    const selectedCategory = categories.find(cat => String(cat.id) === professional_category_id);
    const [positions, setPositions] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(StructureLocumMainFormSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            profile_photo: null,
            dob: "",
            gender: "",
            languages: [],
            province: "",
            city: "",
            address: "",
            postal_code: "",
            id_upload: null,
            //primary_role: mainFormData?.professional_role_ids ?? [],
            professional_status: "",
            authorized_to_practice: "",
            license_number: "",
            practicing_since: "",
            province_reporting: "",
            education_level: "",
            educational_institution: "",
            graduation_year: "",
            software_proficiency: [],
            additional_skills: [],
            contract_type: "",
            //position_sought_ids: [],
            position_sought_ids: mainFormData?.professional_role_ids ?? [],
        },
    });

    const onSubmit = (data) => {
        try {
            console.log("data:", JSON.stringify(data, null, 2));
            console.log("mainFormData:", JSON.stringify(mainFormData, null, 2));

            setStructureLocumMainFormData(data);
            setCurrentStep((prev) => prev + 1)
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    useEffect(() => {
        if (profileData) {
            reset({
                first_name: profileData.first_name || "",
                last_name: profileData.last_name || "",
                email: profileData.email || "",
                phone_number: profileData.phone_number || "",
                profile_photo: profileData.profile_photo || null,
                dob: profileData.dob || "",
                gender: profileData.gender || "",
                languages: profileData.languages || [],
                province: profileData.province || "",
                city: profileData.city || "",
                address: profileData.address || "",
                postal_code: profileData.postal_code || "",
                id_upload: profileData.id_upload || null,
                //primary_role: profileData.primary_role || "",
                professional_status: profileData.professional_status || "",
                authorized_to_practice: profileData.authorized_to_practice || "",
                license_number: profileData.license_number || "",
                practicing_since: profileData.practicing_since || "",
                province_reporting: profileData.province_reporting || "",
                education_level: profileData.education_level || "",
                educational_institution: profileData.educational_institution || "",
                graduation_year: profileData.graduation_year || "",
                software_proficiency: profileData.software_proficiency || [],
                additional_skills: profileData.additional_skills || [],
                contract_type: profileData.contract_type || "",
                position_sought_ids: profileData.position_sought_ids || [],
            });
        }
    }, [profileData, reset]);

    const initializeStateHelper = async () => {
        try {
            if (!professional_category_id) return;
            const positionsData = await getPositionSoughtsByCategoryService(professional_category_id);
            setPositions(Array.isArray(positionsData) ? positionsData : []);
        } catch (error) {
            console.error("Error fetching position soughts:", error);
        }
    };

    useEffect(() => { if (professional_category_id) initializeStateHelper(); }, [professional_category_id]);

    return (
        <form id="form-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
                <div className="col-md-12">
                    <div className="text-center">
                        <h5 className="text-dark">Section: Personal Information</h5><hr />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.first_name ? " has-error" : ""}`}>
                        <label htmlFor="firstName">First Name <span className="text-red">*</span></label>
                        <input type="text" id="firstName" className="form-control" placeholder="Jean" {...register("first_name")} />
                        <span className={`text-danger ${errors.first_name ? "" : "d-none"}`}>
                            {errors.first_name && <strong>{errors.first_name.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.last_name ? " has-error" : ""}`}>
                        <label htmlFor="lastName">Last Name <span className="text-red">*</span></label>
                        <input type="text" id="lastName" className="form-control" placeholder="Dupont" {...register("last_name")} />
                        <span className={`text-danger ${errors.last_name ? "" : "d-none"}`}>
                            {errors.last_name && <strong>{errors.last_name.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.email ? " has-error" : ""}`}>
                        <label htmlFor="email">Email Address <span className="text-red">*</span></label>
                        <input type="email" id="email" className="form-control" placeholder="jean.dupont@email.com" {...register("email")} />
                        <span className={`text-danger ${errors.email ? "" : "d-none"}`}>
                            {errors.email && <strong>{errors.email.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.phone_number ? " has-error" : ""}`}>
                        <label htmlFor="phoneNumber">Phone Number <span className="text-red">*</span></label>
                        <input type="tel" id="phoneNumber" className="form-control" placeholder="+1 514 123 4567" {...register("phone_number")} />
                        <span className={`text-danger ${errors.phone_number ? "" : "d-none"}`}>
                            {errors.phone_number && <strong>{errors.phone_number.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.gender ? " has-error" : ""}`}>
                        <label htmlFor="gender">Gender / Sex <span className="text-red">*</span></label>
                        <select id="gender" className="form-control" {...register("gender")}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="preferNotSay">Prefer not to say</option>
                        </select>
                        <span className={`text-danger ${errors.gender ? "" : "d-none"}`}>
                            {errors.gender && <strong>{errors.gender.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.dob ? " has-error" : ""}`}>
                        <label htmlFor="dob">Date of Birth <span className="text-red">*</span></label>
                        <input type="date" id="dob" className="form-control" {...register("dob")} />
                        <span className={`text-danger ${errors.dob ? "" : "d-none"}`}>
                            {errors.dob && <strong>{errors.dob.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.province ? " has-error" : ""}`}>
                        <label htmlFor="province">
                            Province <span className="text-red">*</span>
                        </label>
                        <select id="province" className="form-control" {...register("province")}>
                            <option value="">Select Province...</option>
                            {provinces.map((province) => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                        <span className={`text-danger ${errors.province ? "" : "d-none"}`}>
                            {errors.province && <strong>{errors.province.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.city ? " has-error" : ""}`}>
                        <label htmlFor="city">City of Residence <span className="text-red">*</span></label>
                        <input type="text" id="city" className="form-control" placeholder="Montreal" {...register("city")} />
                        <span className={`text-danger ${errors.city ? "" : "d-none"}`}>
                            {errors.city && <strong>{errors.city.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.address ? " has-error" : ""}`}>
                        <label htmlFor="address">Address <span className="text-red">*</span></label>
                        <input type="text" id="address" className="form-control" placeholder="123 Sainte-Catherine Street" {...register("address")} />
                        <span className={`text-danger ${errors.address ? "" : "d-none"}`}>
                            {errors.address && <strong>{errors.address.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.postal_code ? " has-error" : ""}`}>
                        <label htmlFor="postalCode">Postal Code <span className="text-red">*</span></label>
                        <input type="text" id="postalCode" className="form-control" placeholder="H3C 1K2" {...register("postal_code")} />
                        <span className={`text-danger ${errors.postal_code ? "" : "d-none"}`}>
                            {errors.postal_code && <strong>{errors.postal_code.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.profile_photo ? " has-error" : ""}`}>
                        <label htmlFor="profilePhoto">Profile Photo <span className="text-red">*</span></label>
                        <input type="file" id="profilePhoto" className="form-control-file" accept="image/*" {...register("profile_photo")} />
                        <span className={`text-danger ${errors.profile_photo ? "" : "d-none"}`}>
                            {errors.profile_photo && <strong>{errors.profile_photo.message}</strong>}
                        </span>
                        <small className="form-text text-muted mt-1">
                            {profileData?.profile_photo && (
                                <a href={`${API_BASE_URL}/${profileData.profile_photo}`} target="_blank" rel="noopener noreferrer">
                                    Download here
                                </a>
                            )}
                        </small>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.id_upload ? " has-error" : ""}`}>
                        <label htmlFor="idUpload">ID <span className="text-red">*</span></label>
                        <input type="file" id="idUpload" className="form-control-file" {...register("id_upload")} />
                        <span className={`text-danger ${errors.id_upload ? "" : "d-none"}`}>
                            {errors.id_upload && <strong>{errors.id_upload.message}</strong>}
                        </span>
                        <small className="form-text text-muted mt-1">
                            {profileData?.id_upload && (
                                <a href={`${API_BASE_URL}/${profileData.id_upload}`} target="_blank" rel="noopener noreferrer">
                                    Download here
                                </a>
                            )}
                        </small>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.languages ? " has-error" : ""}`}>
                        <label htmlFor="languages">Spoken Languages <span className="text-red">*</span></label>
                        <select id="languages" className="form-control" multiple {...register("languages")}>
                            <option value="french">French</option>
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                        </select>
                        <span className={`text-danger ${errors.languages ? "" : "d-none"}`}>
                            {errors.languages && <strong>{errors.languages.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="text-center">
                        <h5 className="text-dark">Section: Professional Information</h5><hr />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.professional_status ? " has-error" : ""}`}>
                        <label htmlFor="professionalStatus">Professional Status <span className="text-red">*</span></label>
                        <select id="professionalStatus" className="form-control" {...register("professional_status")}>
                            <option value="">Select Status</option>
                            <option value="active">Active</option>
                            <option value="looking">Looking for work</option>
                            <option value="onHold">On hold</option>
                        </select>
                        <span className={`text-danger ${errors.professional_status ? "" : "d-none"}`}>
                            {errors.professional_status && <strong>{errors.professional_status.message}</strong>}
                        </span>
                    </div>
                </div>

                <div className="col-md-6">
                  <div className={`form-group${errors.primary_role ? " has-error" : ""}`}>
                    <label htmlFor="primaryRole">Primary Role <span className="text-danger">*</span></label>
                    {selectedCategory?.professional_roles?.map((role, index) => (
                      <div className="form-check" key={role.id}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`check${index + 1}`}
                          checked={(mainFormData.professional_role_ids || []).includes(role.id)}
                          readOnly
                        />
                        <label className="form-check-label" htmlFor={`check${index + 1}`}>
                          {role.name}
                        </label>
                        <span className={`text-danger ${errors.professional_roles ? "" : "d-none"}`}>
                          {errors.professional_roles && <strong>{errors.professional_roles.message}</strong>}
                        </span>

                        {/* Display selected specialty if role is Specialist Dentist */}
                        {role.name.toLowerCase() === "specialist dentist" &&
                          (mainFormData.professional_role_ids || []).includes(role.id) &&
                          mainFormData.specialist_dentist_role && (
                            <div className="mt-1">
                              <small className="text-muted">
                                Specialty: <strong>{mainFormData.specialist_dentist_role}</strong>
                              </small>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {false && (
                    <div className="col-md-6">
                        <div className={`form-group${errors.position_sought_ids ? " has-error" : ""}`}>
                            <label htmlFor="primaryRole">Primary Role <span className="text-danger">*</span></label>
                            {positions && positions.length > 0 ? (
                                positions.map((position, index) => (
                                    <div className="form-check" key={position?.id}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`check${index + 1}`}
                                            value={position.id.toString()}
                                            {...register("position_sought_ids")}
                                        />
                                        <label className="form-check-label" htmlFor={`check${index + 1}`}>
                                            {position?.name ?? ""}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No positions available</p>
                            )}
                            <span className={`text-danger ${errors.position_sought_ids ? "" : "d-none"}`}>
                                {errors.position_sought_ids && <strong>{errors.position_sought_ids.message}</strong>}
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div className="row">
                {/*<div className="col-md-6">
                    <div className={`form-group${errors.license_number ? " has-error" : ""}`}>
                        <label htmlFor="licenseNumber">License Number</label>
                        <input type="text" id="licenseNumber" className="form-control" placeholder="12345678" {...register("license_number")} />
                        <span className={`text-danger ${errors.license_number ? "" : "d-none"}`}>
                            {errors.license_number && <strong>{errors.license_number.message}</strong>}
                        </span>
                    </div>
                </div>*/}
                <div className="col-md-6">
                    <div className={`form-group${errors.practicing_since ? " has-error" : ""}`}>
                        <label htmlFor="practicingSince">Practicing Since <span className="text-red">*</span></label>
                        <input type="text" id="practicingSince" className="form-control" placeholder="2020" {...register("practicing_since")} />
                        <span className={`text-danger ${errors.practicing_since ? "" : "d-none"}`}>
                            {errors.practicing_since && <strong>{errors.practicing_since.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.province_reporting ? " has-error" : ""}`}>
                        <label htmlFor="provinceReporting">Province for Reporting <span className="text-red">*</span></label>
                        {/* <input type="text" id="provinceReporting" className="form-control" placeholder="Quebec / Ontario..." {...register("province_reporting")} /> */}
                        <select id="provinceReporting" className="form-control" {...register("province_reporting")}>
                            <option value="">Select Province...</option>
                            {provinces.map((province) => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                        <span className={`text-danger ${errors.province_reporting ? "" : "d-none"}`}>
                            {errors.province_reporting && <strong>{errors.province_reporting.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`form-group${errors.authorized_to_practice ? " has-error" : ""}`}>
                        <label>Authorized to Practice? <span className="text-red">*</span></label>
                        <div>
                            <input type="radio" id="authYes" value="yes" {...register("authorized_to_practice")} /> <label htmlFor="authYes">Yes</label> <br/>
                            <input type="radio" id="authInProgress" value="inProgress" {...register("authorized_to_practice")} /> <label htmlFor="authInProgress">In progress</label><br/>
                            <input type="radio" id="authNo" value="no" {...register("authorized_to_practice")} /> <label htmlFor="authNo">No</label>
                        </div>
                        <span className={`text-danger ${errors.authorized_to_practice ? "" : "d-none"}`}>
                            {errors.authorized_to_practice && <strong>{errors.authorized_to_practice.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="text-center">
                        <h5 className="text-dark">Section: Education and Skills</h5><hr />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="educationLevel">Education Level <span className="text-red">*</span></label>
                        <input {...register("education_level")} type="text" className="form-control" id="educationLevel" placeholder="IDEC, DEP, Bachelor's, Doctorate..." list="educationOptions" />
                        <datalist id="educationOptions">
                            <option value="IDEC" />
                            <option value="DEP" />
                            <option value="Bachelor's" />
                            <option value="Master's" />
                            <option value="Doctorate" />
                            <option value="Certificate" />
                            <option value="Diploma" />
                            <option value="Associate Degree" />
                        </datalist>
                        <span className={`text-danger ${errors.education_level ? "" : "d-none"}`}>
                            {errors.education_level && <strong>{errors.education_level.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="graduationYear">Graduation Year <span className="text-red">*</span></label>
                        <select className="form-control" id="graduationYear" {...register("graduation_year")}>
                            <option value="">Select Year</option>
                            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <span className={`text-danger ${errors.graduation_year ? "" : "d-none"}`}>
                            {errors.graduation_year && <strong>{errors.graduation_year.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
               <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="softwareProficiency">Software Proficiency <span className="text-red">*</span></label>
                        <select className="form-control" id="softwareProficiency" multiple {...register("software_proficiency")}>
                            <option value="Medesync">Medesync</option>
                            <option value="Oscar">Oscar</option>
                            <option value="Accuro">Accuro</option>
                            <option value="Practice Solutions">Practice Solutions</option>
                            <option value="Telus Health">Telus Health</option>
                            <option value="MedAccess">MedAccess</option>
                            <option value="Wolf Medical">Wolf Medical</option>
                            <option value="PS Suite">PS Suite</option>
                            <option value="Medi-Map">Medi-Map</option>
                            <option value="Pharmaprix">Pharmaprix</option>
                            <option value="Uniprix">Uniprix</option>
                            <option value="Jean Coutu">Jean Coutu</option>
                        </select>
                        <span className={`text-danger ${errors.software_proficiency ? "" : "d-none"}`}>
                            {errors.software_proficiency && <strong>{errors.software_proficiency.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="additionalSkills">Additional Skills <span className="text-red">*</span></label>
                        <select className="form-control" id="additionalSkills" multiple {...register("additional_skills")}>
                            <option value="CPR Certification">CPR Certification</option>
                            <option value="First Aid">First Aid</option>
                            <option value="Phlebotomy">Phlebotomy</option>
                            <option value="Wound Care">Wound Care</option>
                            <option value="Vaccination">Vaccination</option>
                            <option value="EKG">EKG</option>
                            <option value="IV Therapy">IV Therapy</option>
                            <option value="Patient Assessment">Patient Assessment</option>
                            <option value="Medical Terminology">Medical Terminology</option>
                            <option value="Bilingual">Bilingual</option>
                            <option value="Multilingual">Multilingual</option>
                            <option value="Medical Records Management">Medical Records Management</option>
                        </select>
                        <span className={`text-danger ${errors.additional_skills ? "" : "d-none"}`}>
                            {errors.additional_skills && <strong>{errors.additional_skills.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="educational_institution">Educational Institution <span className="text-red">*</span></label>
                        <input {...register("educational_institution")} type="text" className="form-control" id="educational_institution" placeholder="Université de Montréal,..." list="educational_institution" />
                        <datalist id="educational_institution">
                            <option value="Université de Montréal" />
                        </datalist>
                        <span className={`text-danger ${errors.educational_institution ? "" : "d-none"}`}>
                            {errors.educational_institution && <strong>{errors.educational_institution.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="text-center">
                        <h5 className="text-dark">Section: Contract Preferences</h5><hr />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group">
                        <label className="control-label" htmlFor="contractType">Type of Contract Sought <span className="text-red">*</span></label>
                        <select className="form-control" multiple {...register("contract_type")}>
                            <option value="">Select Contract Type</option>
                            <option value="Temporary Staffing">Temporary Staffing</option>
                            <option value="Permanent Staffing">Permanent Staffing</option>
                        </select>
                        <span className={`text-danger ${errors.contract_type ? "" : "d-none"}`}>
                            {errors.contract_type && <strong>{errors.contract_type.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default StructureLocumMainForm;
