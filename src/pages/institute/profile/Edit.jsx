import React, { useState, useEffect, useCallback } from "react";
import MainForm from './forms/MainForm';
import Swal from 'sweetalert2';
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getInstituteCategoryService, getInstituteSpecialityService } from "../../../services/institute/InstituteSpecialityService";
import { updateInstituteProfileService, editInstituteProfileService } from "../../../services/institute/ProfileService";

// profile forms
import PrivateClinicsAndPracticesForm from "./forms/PrivateClinicsAndPracticesForm";
import PharmacyForm from "./forms/PharmacyForm";
import RecruitmentAgencyForm from "./forms/RecruitmentAgencyForm"
import DentalForm from "./forms/DentalForm"
import StructureLocumMainForm from "./forms/StructureLocumMainForm"
import StructureLocumLicenseForm from "./forms/StructureLocumLicenseForm";
import HeadHunterForm from "./forms/HeadHunterForm";

// utils
import { SessionUtil, SESSION_KEYS } from "@utils/SessionUtils";


const Edit = () => {
    const menu = "Profile";
    const userRole = sessionStorage.getItem("role");
    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState({});
    const [profile, setProfile] = useState([]);
    const [userCategory, setUserCategory] = useState("");
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [showTooltip, setShowTooltip] = useState(false);
    const [isCategorySaved, setIsCategorySaved] = useState(false);

    const [mainFormData, setMainFormData] = useState({
        institute_category_id: "",
        institute_specialty_ids: []
    });

    const profileFromsList = {
        "Private Clinics and Practices": "private-clinics-and-practices-form",
        "Pharmacy": "pharmacy-form",
        "Recruitment Agency": "recruitment-agency-form",
        "Head Hunter": "headhunter-form",
    }

    // Function to get the current form ID based on selected category and specialties
    const getCurrentFormId = () => {
        if (!selectedCategory?.name) return "form-1";

        // Check if it's Private Clinics with Dental specialty
        if (selectedCategory.name === "Private Clinics and Practices") {
            const isDental = mainFormData?.institute_specialty_ids?.length === 1 &&
                specialties.some(item => item.name === "dental" && item.id === mainFormData.institute_specialty_ids[0]);

            return isDental ? "dental-form" : "private-clinics-and-practices-form";
        }

        // Return the mapped form ID or default
        return profileFromsList[selectedCategory.name] || "form-1";
    };

    const initializeStateHelper = useCallback(async () => {
        try {
            const categoriesData = await getInstituteCategoryService();
            const specialtiesData = await getInstituteSpecialityService();

            console.log("Categories:", categoriesData);
            console.log("Specialties:", specialtiesData);

            setCategories(categoriesData ?? []);
            setSpecialties(specialtiesData ?? []);
            const status = await editInstituteProfileService(setProfile, setMainFormData, setSelectedCategory, setUserCategory);
        } catch (error) {
            console.error("Error occured: ", error)
        }
    }, []);

    const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : []);
    const isFile = (val) => val instanceof File || val instanceof Blob;
    const isFileList = (val) => val instanceof FileList;

    const handleFormSubmit = async (data, filedata = []) => {
        try {
            const payload = { ...mainFormData, ...data };
            let fileKeys = [];
            fileKeys = fileKeys.concat(filedata);

            const formData = new FormData();

            //  Append files if uploaded
            if (fileKeys && fileKeys.length > 0) {
                fileKeys.forEach((field) => {
                    let file = null;
                    if (data[field]?.length) file = data[field][0];
                    if (isFile(file) || isFileList(file)) {
                        payload[field] = null;
                        formData.append(field, file);
                    }
                });
            }

            // send data to the backend
            formData.append("data", JSON.stringify(payload));
            console.log("Form data:", Object.fromEntries(formData.entries()));
            const response = await updateInstituteProfileService(id, formData)

            if (!response) return;

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Profile updated successfully',
                showConfirmButton: false,
                timer: 2000
            });

            console.log("profile data submitted successfully");

            const category = categories.find(row => row.id === Number(mainFormData.institute_category_id));
            const categoryName =  category ? category?.name : null;
            SessionUtil.set(SESSION_KEYS.INSTITUTE_CATEGORY_ID, Number(mainFormData.institute_category_id));
            SessionUtil.set(SESSION_KEYS.INSTITUTE_CATEGORY_NAME, categoryName);

            setIsCategorySaved(true);
            setIsEditMode(false);
            await initializeStateHelper(id, formData);
        } catch (error) {
            console.error("Error occured: ", error)
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to update profile',
            });
        }
    }

    const handleEditClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        Swal.fire({
            title: 'Cancel Editing?',
            text: "Any unsaved changes will be lost!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0d9488',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, cancel editing',
            cancelButtonText: 'Continue editing'
        }).then((result) => {
            if (result.isConfirmed) {
                setIsEditMode(false);
                initializeStateHelper();
            }
        });
    };

    const handleViewModeClick = (e) => {
        if (!isEditMode) {
            setTooltipPosition({ x: e.clientX, y: e.clientY });
            setShowTooltip(true);

            setTimeout(() => {
                setShowTooltip(false);
            }, 2000);
        }
    };

    useEffect(() => {
        document.title = `${menu} | Quicklocum`;
        initializeStateHelper();
    }, []);

    useEffect(() => {
        // Check if category was already saved (profile has institute_category_id)
        if (profile?.institute_category_id) {
            setIsCategorySaved(true);
        }
    }, [profile]);

    useEffect(() => {
        console.log("Profile Data:", profile);
        console.log("Selected Category:", selectedCategory);
        console.log("Main Form Data:", mainFormData);
        console.log("Selected Specialties (names):", selectedSpecialties);
    }, [profile, selectedCategory, mainFormData, selectedSpecialties]);

    return (
        <div className="content-wrapper profile-page-wrapper">
            {/* Modern Healthcare Header */}
            <div className="profile-header">
                <div className="header-background"></div>
                <div className="container-fluid">
                    <div className="header-content">
                        <div className="header-left">
                            <div className={`profile-avatar ${isEditMode ? 'edit-mode' : ''}`}>
                                <i className="fas fa-hospital-user"></i>
                                {isEditMode && <div className="edit-indicator"><i className="fas fa-pen"></i></div>}
                            </div>
                            <div className="header-info">
                                <h1 className="profile-title">
                                    Institute Profile
                                    {isEditMode && <span className="edit-badge">Editing</span>}
                                </h1>
                                <p className="profile-subtitle">
                                    {isEditMode
                                        ? 'Make changes to your institute information'
                                        : 'Manage your institute details and settings'}
                                </p>
                            </div>
                        </div>
                        <div className="header-actions">
                            {!isEditMode ? (
                                <button onClick={handleEditClick} className="btn-edit-profile">
                                    <i className="fas fa-edit"></i>
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <button onClick={handleCancelEdit} className="btn-cancel-edit">
                                    <i className="fas fa-times"></i>
                                    <span>Cancel</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="edit-tooltip" style={{ left: tooltipPosition.x + 15, top: tooltipPosition.y + 15 }}>
                    <i className="fas fa-lock"></i>
                    Click "Edit Profile" to enable editing
                </div>
            )}

            {/* Main Content */}
            <section className="profile-content">
                <div className="container-fluid">
                    {/* Progress/Status Card */}
                    <div className="profile-status-card">
                        <div className="status-item">
                            <div className={`status-icon ${selectedCategory?.name ? 'completed' : 'pending'}`}>
                                <i className="fas fa-building"></i>
                            </div>
                            <div className="status-info">
                                <span className="status-label">Category</span>
                                <span className="status-value">{selectedCategory?.name || 'Not Set'}</span>
                            </div>
                        </div>
                        <div className="status-divider"></div>
                        <div className="status-item">
                            <div className={`status-icon ${selectedSpecialties?.length > 0 ? 'completed' : 'pending'}`}>
                                <i className="fas fa-stethoscope"></i>
                            </div>
                            <div className="status-info">
                                <span className="status-label">Specialties</span>
                                <span className="status-value">
                                    {selectedSpecialties?.length > 0
                                        ? `${selectedSpecialties.length} selected`
                                        : 'Not Set'}
                                </span>
                            </div>
                        </div>
                        <div className="status-divider"></div>
                        <div className="status-item">
                            <div className={`status-icon ${isEditMode ? 'editing' : 'view'}`}>
                                <i className={`fas ${isEditMode ? 'fa-pen' : 'fa-eye'}`}></i>
                            </div>
                            <div className="status-info">
                                <span className="status-label">Mode</span>
                                <span className="status-value">{isEditMode ? 'Editing' : 'Viewing'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Profile Card */}
                    <div className="profile-main-card">
                        <div
                            className={`card-body-wrapper ${!isEditMode ? 'view-mode' : ''}`}
                            onClick={handleViewModeClick}
                        >
                            {!isEditMode && <div className="view-mode-overlay"></div>}

                            <MainForm
                                categories={categories}
                                setMainFormData={setMainFormData}
                                profileData={profile}
                                setSelectedCategory={setSelectedCategory}
                                setSelectedSpecialties={setSelectedSpecialties}
                                handleFormSubmit={handleFormSubmit}
                                isCategoryLocked={isCategorySaved}
                            />

                            {selectedCategory?.name && (
                                <>
                                    <div className="section-divider">
                                        <div className="divider-line"></div>
                                        <span className="divider-text">
                                            <i className="fas fa-file-medical-alt mr-2"></i>
                                            Additional Information
                                        </span>
                                        <div className="divider-line"></div>
                                    </div>

                                    {selectedCategory?.name === "Recruitment Agency" && (
                                        <RecruitmentAgencyForm profile={profile} userCategory={userCategory} handleFormSubmit={handleFormSubmit} />
                                    )}

                                    {selectedCategory?.name === "Pharmacy" && (
                                        <PharmacyForm
                                            profile={profile}
                                            userCategory={userCategory}
                                            handleFormSubmit={handleFormSubmit}
                                            selectedSpecialties={selectedSpecialties}
                                        />
                                    )}

                                    {selectedCategory?.name === "Head Hunter" && (
                                        <HeadHunterForm profileData={profile} handleFormSubmit={handleFormSubmit}/>
                                    )}

                                    {selectedCategory?.name === "Private Clinics and Practices" &&
                                    mainFormData?.institute_specialty_ids?.length === 1 &&
                                    specialties.some(item => item.name === "dental" && item.id === mainFormData.institute_specialty_ids[0]) && (
                                        <DentalForm profileData={profile} handleFormSubmit={handleFormSubmit} />
                                    )}

                                    {selectedCategory?.name === "Private Clinics and Practices" &&
                                    !(
                                        mainFormData?.institute_specialty_ids?.length === 1 &&
                                        specialties.some(item => item.name === "dental" && item.id === mainFormData.institute_specialty_ids[0])
                                    ) && (
                                        <PrivateClinicsAndPracticesForm
                                            profile={profile}
                                            userCategory={userCategory}
                                            handleFormSubmit={handleFormSubmit}
                                            selectedSpecialties={selectedSpecialties}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        {/* Card Footer */}
                        <div className="profile-card-footer">
                            {isEditMode ? (
                                <>
                                    <button type="button" onClick={handleCancelEdit} className="btn-footer-cancel">
                                        <i className="fas fa-times"></i>
                                        Cancel Changes
                                    </button>
                                    <button form={getCurrentFormId()} className="btn-footer-save" type="submit">
                                        <i className="fas fa-check"></i>
                                        Save Profile
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="footer-info">
                                        <i className="fas fa-info-circle"></i>
                                        Click "Edit Profile" to make changes
                                    </div>
                                    <button type="button" onClick={handleEditClick} className="btn-footer-edit">
                                        <i className="fas fa-edit"></i>
                                        Edit Profile
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                /* Healthcare Theme Variables */
                .profile-page-wrapper {
                    --primary: #0d9488;
                    --primary-dark: #0f766e;
                    --primary-light: #14b8a6;
                    --secondary: #0f172a;
                    --accent: #f0fdfa;
                    --success: #10b981;
                    --warning: #f59e0b;
                    --danger: #ef4444;
                    --gray-50: #f8fafc;
                    --gray-100: #f1f5f9;
                    --gray-200: #e2e8f0;
                    --gray-400: #94a3b8;
                    --gray-600: #475569;
                    --gray-800: #1e293b;

                    min-height: calc(100vh - 60px);
                    background: var(--gray-50);
                }

                /* Header Styles */
                .profile-header {
                    position: relative;
                    padding: 2rem 0;
                    margin-bottom: 1.5rem;
                    overflow: hidden;
                }

                .header-background {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, var(--secondary) 100%);
                    opacity: 0.97;
                }

                .header-background::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .header-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .profile-avatar {
                    width: 70px;
                    height: 70px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    color: white;
                    position: relative;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }

                .profile-avatar.edit-mode {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: var(--warning);
                }

                .edit-indicator {
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    width: 24px;
                    height: 24px;
                    background: var(--warning);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    color: white;
                    border: 2px solid white;
                    animation: pulse-indicator 2s infinite;
                }

                @keyframes pulse-indicator {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .header-info {
                    color: white;
                }

                .profile-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .edit-badge {
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.25rem 0.75rem;
                    background: var(--warning);
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .profile-subtitle {
                    margin: 0;
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .btn-edit-profile,
                .btn-cancel-edit {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .btn-edit-profile {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .btn-edit-profile:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }

                .btn-cancel-edit {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .btn-cancel-edit:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                /* Edit Tooltip */
                .edit-tooltip {
                    position: fixed;
                    background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
                    color: white;
                    padding: 0.625rem 1rem;
                    border-radius: 8px;
                    z-index: 9999;
                    font-size: 0.85rem;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
                    pointer-events: none;
                    animation: tooltipFadeIn 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Profile Content */
                .profile-content {
                    padding: 0 0 2rem 0;
                }

                /* Status Card */
                .profile-status-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.25rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--gray-100);
                    flex-wrap: wrap;
                }

                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                }

                .status-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                }

                .status-icon.completed {
                    background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
                    color: white;
                }

                .status-icon.pending {
                    background: var(--gray-100);
                    color: var(--gray-400);
                }

                .status-icon.editing {
                    background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
                    color: white;
                }

                .status-icon.view {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                }

                .status-info {
                    display: flex;
                    flex-direction: column;
                }

                .status-label {
                    font-size: 0.75rem;
                    color: var(--gray-400);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-value {
                    font-size: 0.95rem;
                    color: var(--gray-800);
                    font-weight: 600;
                }

                .status-divider {
                    width: 1px;
                    height: 40px;
                    background: var(--gray-200);
                }

                /* Main Profile Card */
                .profile-main-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
                    border: 1px solid var(--gray-100);
                    overflow: hidden;
                }

                .card-body-wrapper {
                    padding: 2rem;
                    position: relative;
                }

                .card-body-wrapper.view-mode {
                    cursor: not-allowed;
                }

                .view-mode-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.02);
                    z-index: 10;
                }

                /* Section Divider */
                .section-divider {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin: 2rem 0;
                }

                .divider-line {
                    flex: 1;
                    height: 2px;
                    background: linear-gradient(90deg, transparent 0%, var(--primary-light) 50%, transparent 100%);
                }

                .divider-text {
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    white-space: nowrap;
                    padding: 0.5rem 1rem;
                    background: var(--accent);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                }

                /* Card Footer */
                .profile-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 2rem;
                    background: var(--gray-50);
                    border-top: 1px solid var(--gray-100);
                }

                .footer-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--gray-400);
                    font-size: 0.875rem;
                }

                .btn-footer-cancel,
                .btn-footer-save,
                .btn-footer-edit {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .btn-footer-cancel {
                    background: var(--gray-100);
                    color: var(--gray-600);
                }

                .btn-footer-cancel:hover {
                    background: var(--gray-200);
                }

                .btn-footer-save {
                    background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                }

                .btn-footer-save:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                }

                .btn-footer-edit {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(13, 148, 136, 0.3);
                }

                .btn-footer-edit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .profile-header {
                        padding: 1.5rem 0;
                    }

                    .header-content {
                        flex-direction: column;
                        text-align: center;
                    }

                    .header-left {
                        flex-direction: column;
                    }

                    .profile-title {
                        font-size: 1.5rem;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .profile-status-card {
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1.25rem;
                    }

                    .status-divider {
                        width: 100%;
                        height: 1px;
                    }

                    .card-body-wrapper {
                        padding: 1.25rem;
                    }

                    .profile-card-footer {
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1.25rem;
                    }

                    .footer-info {
                        order: 2;
                    }

                    .btn-footer-edit,
                    .btn-footer-save {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default Edit;