import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const MainFormSchema = (categories, standaloneCategories) =>
    z.object({
        institute_category_id: z.string().min(1, "Institute category is required"),
        institute_specialty_ids: z.array(z.number()).optional(),
    }).superRefine((data, ctx) => {
        const category = categories.find(c => String(c.id) === data.institute_category_id);

        if (!standaloneCategories.includes(category?.name) && (!data.institute_specialty_ids || data.institute_specialty_ids.length === 0)) {
            ctx.addIssue({
                code: "custom",
                path: ["institute_specialty_ids"],
                message: "At least one specialty must be selected",
            });
        }
    });

const MainForm = ({
    categories,
    setMainFormData,
    setCurrentStep,
    profileData,
    setSelectedCategory,
    setSelectedSpecialties = () => {},
    handleFormSubmit,
    isCategoryLocked = false
}) => {
    const standaloneCategories = ["Recruitment Agency", "Head Hunter"];
    const [isCategoryChanged, setIsCategoryChanged] = React.useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(MainFormSchema(categories, standaloneCategories)),
        defaultValues: {
            institute_category_id: "",
            institute_specialty_ids: [],
        },
    });

    const institute_category_id = watch("institute_category_id");
    const selectedCategory = categories.find(cat => String(cat.id) === String(institute_category_id));
    const specialties = selectedCategory?.institute_specialties || [];
    const selectedSpecialtyIds = watch("institute_specialty_ids") || [];

    React.useEffect(() => { setSelectedCategory(selectedCategory) }, [selectedCategory, setSelectedCategory]);

    // NEW: Update parent's mainFormData immediately when category or specialties change
    React.useEffect(() => {
        setMainFormData({
            institute_category_id: institute_category_id || "",
            institute_specialty_ids: selectedSpecialtyIds
        });
        console.log("MainForm: Updated mainFormData immediately:", {
            institute_category_id,
            institute_specialty_ids: selectedSpecialtyIds
        });
    }, [institute_category_id, selectedSpecialtyIds, setMainFormData]);

    // NEW: Update selectedSpecialties immediately when specialty IDs change (not just on submit)
    React.useEffect(() => {
        if (Array.isArray(specialties) && specialties.length > 0 && selectedSpecialtyIds.length > 0) {
            const specialtiesNames = specialties
                .filter(spec => selectedSpecialtyIds.includes(spec.id))
                .map(spec => spec.name);
            setSelectedSpecialties(specialtiesNames);
            console.log("MainForm: Updated selected specialties names:", specialtiesNames);
        } else {
            setSelectedSpecialties([]);
            console.log("MainForm: Cleared selected specialties (no specialties selected)");
        }
    }, [selectedSpecialtyIds, specialties, setSelectedSpecialties]);

    const onSubmit = (data) => {
        try {
            // Note: selectedSpecialties is now updated in the useEffect above, not here
            if (Array.isArray(specialties) && specialties.length > 0) {
                const specialtiesNames = specialties.filter(spec => data.institute_specialty_ids.includes(spec.id)).map(spec => spec.name);
                console.log("MainForm onSubmit: Selected specialties names:", specialtiesNames);
            }

            console.log("submitted form Data:", data);
            setMainFormData(data);

            if (handleFormSubmit) {
                handleFormSubmit(data, []);
            } else {
                setCurrentStep((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const handleCheckboxChange = (id, isRadio) => {
        const current = watch("institute_specialty_ids") || [];
        let updated = [];

        if (isRadio) {
            updated = [id];
        } else {
            if (current.includes(id)) {
                updated = current.filter(item => item !== id);
            } else {
                updated = [...current, id];
            }
        }

        setValue("institute_specialty_ids", updated, { shouldValidate: true });
    };

    React.useEffect(() => {
        if (profileData) {
            reset({
                institute_category_id: profileData?.institute_category_id || "",
                institute_specialty_ids: profileData?.institute_specialty_ids || [],
            });
        }
    }, [profileData, reset]);

    React.useEffect(() => {
        if (isCategoryChanged){
            setValue("institute_specialty_ids", [], { shouldValidate: true });
        }
    }, [selectedCategory, setValue, isCategoryChanged]);

    return (
        <form id="form-1" onSubmit={handleSubmit(onSubmit)} className="needs-validation main-form-healthcare">
            {/* Institute Category Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">
                        <i className="fas fa-building"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Institute Category</h3>
                        <p className="section-description">Select your institute type to customize your profile</p>
                    </div>
                </div>

                <div className="form-content">
                    {isCategoryLocked ? (
                        /* Locked Category Display */
                        <div className="locked-category-display">
                            <div className="locked-category-card">
                                <div className="locked-icon">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <div className="locked-content">
                                    <span className="locked-label">Institute Category</span>
                                    <span className="locked-value">{selectedCategory?.name || 'Not Set'}</span>
                                </div>
                                <div className="locked-badge">
                                    <i className="fas fa-check-circle"></i>
                                    Verified
                                </div>
                            </div>
                            <div className="locked-notice">
                                <i className="fas fa-info-circle"></i>
                                <span>Institute category cannot be changed once saved. Contact support if you need to modify this.</span>
                            </div>
                            {/* Hidden input to maintain form data */}
                            <input type="hidden" {...register("institute_category_id")} />
                        </div>
                    ) : (
                        /* Editable Category Select */
                        <div className="category-select-wrapper">
                            <label className="form-label">
                                Select Category <span className="required">*</span>
                            </label>
                            <div className="select-container">
                                <select
                                    onClick={() => setIsCategoryChanged(true)}
                                    className={`form-select ${errors.institute_category_id ? 'is-invalid' : ''} ${selectedCategory ? 'has-value' : ''}`}
                                    {...register("institute_category_id")}
                                >
                                    <option value="">-- Choose your institute category --</option>
                                    {Array.isArray(categories) && categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                <div className="select-icon">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            {errors.institute_category_id && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.institute_category_id.message}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Institute Specialties Section */}
            {selectedCategory?.name && !standaloneCategories.includes(selectedCategory?.name) && (
                <div className="form-section specialties-section">
                    <div className="section-header">
                        <div className="section-icon specialties">
                            <i className="fas fa-stethoscope"></i>
                        </div>
                        <div className="section-title-wrapper">
                            <h3 className="section-title">Specialties</h3>
                            <p className="section-description">
                                {selectedCategory?.name === "Pharmacy"
                                    ? "Select your pharmacy specialty"
                                    : "Select all specialties that apply to your institute"}
                            </p>
                        </div>
                    </div>

                    <div className="form-content">
                        <div className="specialties-grid">
                            {specialties.map((specialty, index) => {
                                const isRadio = selectedCategory?.name === "Pharmacy";
                                const selectedIds = watch("institute_specialty_ids") || [];
                                const checked = selectedIds.includes(specialty.id);

                                return (
                                    <div
                                        key={specialty.id}
                                        className={`specialty-card ${checked ? 'selected' : ''}`}
                                        onClick={() => handleCheckboxChange(specialty.id, isRadio)}
                                    >
                                        <div className="specialty-checkbox">
                                            {isRadio ? (
                                                <div className={`radio-indicator ${checked ? 'checked' : ''}`}>
                                                    {checked && <div className="radio-dot"></div>}
                                                </div>
                                            ) : (
                                                <div className={`checkbox-indicator ${checked ? 'checked' : ''}`}>
                                                    {checked && <i className="fas fa-check"></i>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="specialty-info">
                                            <span className="specialty-name">{specialty?.name}</span>
                                        </div>
                                        {checked && (
                                            <div className="selected-badge">
                                                <i className="fas fa-check-circle"></i>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {errors.institute_specialty_ids && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.institute_specialty_ids.message}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .main-form-healthcare {
                    --primary: #0d9488;
                    --primary-dark: #0f766e;
                    --primary-light: #14b8a6;
                    --accent: #f0fdfa;
                    --success: #10b981;
                    --warning: #f59e0b;
                    --danger: #ef4444;
                    --gray-50: #f8fafc;
                    --gray-100: #f1f5f9;
                    --gray-200: #e2e8f0;
                    --gray-300: #cbd5e1;
                    --gray-400: #94a3b8;
                    --gray-600: #475569;
                    --gray-800: #1e293b;
                }

                /* Form Section */
                .form-section {
                    background: var(--gray-50);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--gray-100);
                }

                .section-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .section-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    color: white;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                    flex-shrink: 0;
                }

                .section-icon.specialties {
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
                }

                .section-title-wrapper {
                    flex: 1;
                }

                .section-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: var(--gray-800);
                    margin: 0 0 0.25rem 0;
                }

                .section-description {
                    font-size: 0.875rem;
                    color: var(--gray-400);
                    margin: 0;
                }

                .form-content {
                    padding-left: 0;
                }

                /* Locked Category Display */
                .locked-category-display {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .locked-category-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: white;
                    border: 2px solid var(--primary);
                    border-radius: 12px;
                    padding: 1.25rem;
                    position: relative;
                }

                .locked-icon {
                    width: 44px;
                    height: 44px;
                    background: var(--accent);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    font-size: 1rem;
                }

                .locked-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .locked-label {
                    font-size: 0.75rem;
                    color: var(--gray-400);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .locked-value {
                    font-size: 1.125rem;
                    color: var(--gray-800);
                    font-weight: 700;
                }

                .locked-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.375rem 0.75rem;
                    border-radius: 20px;
                }

                .locked-notice {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    background: #fef3c7;
                    border: 1px solid #fcd34d;
                    border-radius: 10px;
                    padding: 0.875rem 1rem;
                    font-size: 0.85rem;
                    color: #92400e;
                }

                .locked-notice i {
                    font-size: 1rem;
                    color: var(--warning);
                }

                /* Category Select */
                .category-select-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--gray-600);
                }

                .required {
                    color: var(--danger);
                }

                .select-container {
                    position: relative;
                }

                .form-select {
                    width: 100%;
                    padding: 0.875rem 3rem 0.875rem 1rem;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--gray-600);
                    background: white;
                    border: 2px solid var(--gray-200);
                    border-radius: 10px;
                    appearance: none;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .form-select:hover {
                    border-color: var(--gray-300);
                }

                .form-select:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
                }

                .form-select.has-value {
                    color: var(--gray-800);
                    border-color: var(--primary);
                }

                .form-select.is-invalid {
                    border-color: var(--danger);
                }

                .select-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--gray-400);
                    pointer-events: none;
                    transition: transform 0.25s ease;
                }

                .form-select:focus + .select-icon {
                    color: var(--primary);
                }

                /* Error Message */
                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--danger);
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-top: 0.5rem;
                }

                /* Specialties Grid */
                .specialties-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .specialty-card {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    background: white;
                    border: 2px solid var(--gray-200);
                    border-radius: 12px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                }

                .specialty-card:hover {
                    border-color: var(--gray-300);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                .specialty-card.selected {
                    border-color: var(--primary);
                    background: var(--accent);
                }

                .checkbox-indicator,
                .radio-indicator {
                    width: 22px;
                    height: 22px;
                    border: 2px solid var(--gray-300);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .checkbox-indicator {
                    border-radius: 6px;
                }

                .radio-indicator {
                    border-radius: 50%;
                }

                .checkbox-indicator.checked,
                .radio-indicator.checked {
                    background: var(--primary);
                    border-color: var(--primary);
                }

                .checkbox-indicator.checked i {
                    color: white;
                    font-size: 0.7rem;
                }

                .radio-dot {
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                }

                .specialty-info {
                    flex: 1;
                }

                .specialty-name {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--gray-700);
                    text-transform: capitalize;
                }

                .selected-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 24px;
                    height: 24px;
                    background: var(--primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.7rem;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .form-section {
                        padding: 1.25rem;
                    }

                    .section-header {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .specialties-grid {
                        grid-template-columns: 1fr;
                    }

                    .locked-category-card {
                        flex-direction: column;
                        text-align: center;
                    }

                    .locked-badge {
                        position: absolute;
                        top: -10px;
                        right: -10px;
                    }
                }
            `}</style>
        </form>
    );
};

export default MainForm;