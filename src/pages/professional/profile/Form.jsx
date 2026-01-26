import React, { useEffect } from "react";
import { useProfileForm } from "@hooks/professional/profile/useProfileForm";

const Form = ({ categories, profileData, setMainFormData, setCurrentStep }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        watch,
        selectedCategory,
        handleCheckboxChange,
        setIsCategoryChanged,
        selectedRoleName,
        setValue,
    } = useProfileForm({ 
        categories, 
        profileData, 
        setMainFormData, 
        setCurrentStep 
    });

    return (
        <form id="form-1" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label htmlFor="category">Professional Category: <span className="text-danger">*</span></label>
                <select onClick={() => setIsCategoryChanged(true)} id="category" className="form-control" {...register("professional_category_id")}>
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <span className={`text-danger ${errors.professional_category_id ? "" : "d-none"}`}>
                    {errors.professional_category_id && <strong>{errors.professional_category_id.message}</strong>}
                </span>
            </div>

            {selectedCategory && (
              <div className="form-group">
                <label>Professional Roles: <span className="text-danger">*</span></label>
                {selectedCategory.professional_roles.map((role, index) => (
                  <div className="form-check" key={role.id}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`check${index + 1}`}
                      checked={(watch("professional_role_ids") || []).includes(role.id)}
                      onChange={() => {
                        const current = watch("professional_role_ids") || [];

                        if (current.includes(role.id)) {
                          // Unselect
                          setValue("professional_role_ids", []);
                          setValue("specialist_dentist_role", "");
                        } else {
                          // Select only this role
                          setValue("professional_role_ids", [role.id]);
                          setValue("specialist_dentist_role", "");
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor={`check${index + 1}`}>
                      {role.name}
                    </label>
                  </div>
                ))}
                <span className={`text-danger ${errors.professional_role_ids ? "" : "d-none"}`}>
                  {errors.professional_role_ids && <strong>{errors.professional_role_ids.message}</strong>}
                </span>
              </div>
            )}

            {/* Only show specialty dropdown if Specialist Dentist selected */}
            <div className={`row ${(watch("professional_role_ids")?.length && selectedCategory.professional_roles.find(r => r.id === watch("professional_role_ids")[0])?.name.toLowerCase() === "specialist dentist") ? "" : "d-none"}`}>
              <div className="col-md-12">
                <div className="form-group">
                  <label>Specialty</label>
                  <select className="form-control" {...register("specialist_dentist_role")}>
                    <option value="">Select Option</option>
                    <option value="orthodontist">Orthodontist</option>
                    <option value="endodontist">Endodontist</option>
                    <option value="periodontist">Periodontist</option>
                    <option value="pediatric dentist">Pediatric Dentist</option>
                    <option value="prosthodontist">Prosthodontist</option>
                    <option value="oral and maxillofacial surgeon">Oral and Maxillofacial Surgeon</option>
                  </select>
                </div>
              </div>
            </div>

        </form>
    );
};

export default Form;
