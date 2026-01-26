import { API_BASE_URL } from "@config/apiConfig";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StructureLocumLicenseFormSchema } from "@schemas/user/StructureLocumLicenseFormSchema";

const StructureLocumLicenseForm = ({
  profileData,
  setStructureLocumLicenseFormData,
  setCurrentStep,
  handleFormSubmit,
  categories ,
  mainFormData,
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const professional_category_id = mainFormData?.professional_category_id;
  const selectedCategory = categories.find(cat => String(cat.id) === professional_category_id);

  console.log("categories",categories);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
    handleFormSubmit(data);
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

  const licenseRequired = (() => {
    if (!mainFormData?.professional_role_ids?.length) return "";
    const roleId = mainFormData.professional_role_ids[0];
    const role = selectedCategory?.professional_roles?.find(r => r.id === roleId);
    if (!role) return "";

    const licenseMap = {
      "Registered Nurse (RN)": "yes",
      "Licensed Practical Nurse (LPN) / Registered Practical Nurse (RPN)": "yes",
      "Nurse Practitioner (NP)": "yes",
      "Home Care Nurse": "yes",
      "Healthcare Aide / Personal Support Worker (PSW)": "no",
      "Family Physician / General Practitioner": "yes",
      "General Dentist": "yes",
      "Specialist Dentist": "yes",
      "Dental Hygienist": "yes",
      "Dental Assistant": "optional",
      "Dental Secretary": "no",
      "Pharmacy Technician (ATP) - Quebec only": "yes",
      "Pharmacist": "yes",
      "Assistant - outside Quebec Only": "no",
      "Technician - outside Quebec Only": "yes",
      "Pharmacy Clerk": "no",
    };

    return licenseMap[role.name] || "";
  })();
  useEffect(() => {
    if (licenseRequired?.toLowerCase() === "no") {
      setValue("license_number", "");
      setValue("license_expiry", "");
      setValue("issuing_authority", "");
      setValue("license_document", null);
      setValue("notes", "");
      setValue("additional_info", "");
    }
  }, [licenseRequired, setValue]);



  return (
    <form id="form-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-md-12">
          <div className="text-center">
            <h5 className="text-dark">Section: License Information</h5>
            <hr />
          </div>
        </div>
      </div>

      {/* Always visible fields */}
      <div className="row">
        <div className="col-md-6">
          <div className={`form-group${errors.position ? " has-error" : ""}`}>
            {/* Show selected category */}
            {selectedCategory && (
              <p className="mb-2">
                <strong>Category:</strong> {selectedCategory.name}
              </p>
            )}

            <div className={`form-group${errors.professional_roles ? " has-error" : ""}`}>
              <label htmlFor="primaryRole">
                Primary Role <span className="text-danger">*</span>
              </label>

              {selectedCategory?.professional_roles
                ?.filter(role => (mainFormData.professional_role_ids || []).includes(role.id))
                .map((role, index) => (
                  <div className="form-check" key={role.id}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`check${index}`}
                      checked
                      readOnly
                    />
                    <label className="form-check-label" htmlFor={`check${index}`}>
                      {role.name}
                    </label>

                    {/* Display selected specialty if role is Specialist Dentist */}
                    {role.name.toLowerCase() === "specialist dentist" && mainFormData.specialist_dentist_role && (
                      <div className="mt-1">
                        <small className="text-muted">
                          Specialty: <strong>{mainFormData.specialist_dentist_role}</strong>
                        </small>
                      </div>
                    )}
                  </div>
                ))}

              <span className={`text-danger ${errors.professional_roles ? "" : "d-none"}`}>
                {errors.professional_roles && <strong>{errors.professional_roles.message}</strong>}
              </span>
            </div>
          </div>
        </div>


        <div className="col-md-6">
          <div className={`form-group${errors.license_required ? " has-error" : ""}`}>
            <label htmlFor="licenseRequired">
              License Required <span className="text-red">*</span>
            </label>

            <input
              type="text"
              id="licenseRequired"
              className="form-control"
              value={
                (() => {
                  if (!mainFormData?.professional_role_ids?.length) return "";
                  const roleId = mainFormData.professional_role_ids[0]; // assuming only 1 primary role
                  const role = selectedCategory?.professional_roles?.find(r => r.id === roleId);
                  if (!role) return "";

                  const licenseMap = {
                    "Registered Nurse (RN)": "yes",
                    "Licensed Practical Nurse (LPN) / Registered Practical Nurse (RPN)": "yes",
                    "Nurse Practitioner (NP)": "yes",
                    "Home Care Nurse": "yes",
                    "Healthcare Aide / Personal Support Worker (PSW)": "no",
                    "Family Physician / General Practitioner": "yes",
                    "General Dentist": "yes",
                    "Specialist Dentist": "yes",
                    "Dental Hygienist": "yes",
                    "Dental Assistant": "optional",
                    "Dental Secretary": "no",
                    "Pharmacy Technician (ATP) - Quebec only": "yes",
                    "Pharmacist": "yes",
                    "Assistant - outside Quebec Only": "no",
                    "Technician - outside Quebec Only": "yes",
                    "Pharmacy Clerk": "no",
                  };

                  return licenseMap[role.name] || "";
                })()
              }
              readOnly
            />

            <span className={`text-danger ${errors.license_required ? "" : "d-none"}`}>
              {errors.license_required && <strong>{errors.license_required.message}</strong>}
            </span>
          </div>
        </div>
      </div>


      {/* Conditionally visible license fields */}
      {licenseRequired?.toLowerCase() === "yes" && (
        <>
          <div className="row">
            <div className="col-md-6">
              <div className={`form-group${errors.license_number ? " has-error" : ""}`}>
                <label htmlFor="licenseNumber">
                  License Number <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  className="form-control"
                  placeholder="12345678"
                  {...register("license_number")}
                />
                <span className={`text-danger ${errors.license_number ? "" : "d-none"}`}>
                  {errors.license_number && <strong>{errors.license_number.message}</strong>}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              <div className={`form-group${errors.license_expiry ? " has-error" : ""}`}>
                <label htmlFor="licenseExpiry">
                  License Expiry Date <span className="text-red">*</span>
                </label>
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
                <label htmlFor="issuingAuthority">
                  Issuing Authority <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  id="issuingAuthority"
                  className="form-control"
                  placeholder="Enter issuing authority"
                  {...register("issuing_authority")}
                />
                <span className={`text-danger ${errors.issuing_authority ? "" : "d-none"}`}>
                  {errors.issuing_authority && <strong>{errors.issuing_authority.message}</strong>}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              <div className={`form-group${errors.license_document ? " has-error" : ""}`}>
                <label htmlFor="licenseDocument">
                  License Document <span className="text-red">*</span>
                </label>
                <input
                  type="file"
                  id="licenseDocument"
                  className="form-control-file"
                  accept=".pdf,.jpg,.png"
                  {...register("license_document")}
                />
                <span className={`text-danger ${errors.license_document ? "" : "d-none"}`}>
                  {errors.license_document && <strong>{errors.license_document.message}</strong>}
                </span>
                <small className="form-text text-muted mt-1">
                  {profileData?.license_document && (
                    <a
                      href={`${API_BASE_URL}/${profileData.license_document}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
                <label htmlFor="notes">
                  Notes <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  id="notes"
                  className="form-control"
                  placeholder="Enter any notes"
                  {...register("notes")}
                />
                <span className={`text-danger ${errors.notes ? "" : "d-none"}`}>
                  {errors.notes && <strong>{errors.notes.message}</strong>}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              <div className={`form-group${errors.additional_info ? " has-error" : ""}`}>
                <label htmlFor="additionalInfo">
                  Additional Info <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  id="additionalInfo"
                  className="form-control"
                  placeholder="Enter additional info"
                  {...register("additional_info")}
                />
                <span className={`text-danger ${errors.additional_info ? "" : "d-none"}`}>
                  {errors.additional_info && <strong>{errors.additional_info.message}</strong>}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  );
};

export default StructureLocumLicenseForm;
