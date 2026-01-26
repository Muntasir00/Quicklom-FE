import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Button,
    Typography,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Divider,
} from "@mui/material";

// MUI Icons
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

import {
    getUserProfileByAdminService,
    updateUserProfileByAdminService
} from "../../../services/admin/UserService";
import { getProfessionalCategoriesService } from "../../../services/admin/ProfessionalCategoryService";
import { getInstituteCategoriesService } from "../../../services/admin/InstituteCategoryService";
import { getInstituteSpecialtiesService } from "../../../services/admin/InstituteSpecialtyService";
import ComprehensiveProfileForm from "../../../components/forms/ComprehensiveProfileForm";
import PageHeader from "@components/admin/PageHeader";
import Swal from "sweetalert2";

// Import institute forms
import MainForm from "../../institute/profile/forms/MainForm";
import PrivateClinicsAndPracticesForm from "../../institute/profile/forms/PrivateClinicsAndPracticesForm";
import PharmacyForm from "../../institute/profile/forms/PharmacyForm";
import RecruitmentAgencyForm from "../../institute/profile/forms/RecruitmentAgencyForm";
import DentalForm from "../../institute/profile/forms/DentalForm";
import HeadHunterForm from "../../institute/profile/forms/HeadHunterForm";

const EditUserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem("role")?.toLowerCase();

    // State for user and profile data
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [profileUserRole, setProfileUserRole] = useState(null);

    // State for form data
    const [professionalCategories, setProfessionalCategories] = useState([]);
    const [instituteCategories, setInstituteCategories] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);

    // Institute specific states
    const [mainFormData, setMainFormData] = useState({
        institute_category_id: "",
        institute_specialty_ids: []
    });

    useEffect(() => {
        document.title = "Edit User Profile | Quicklocum";
        initializeData();
    }, [id]);

    const initializeData = async () => {
        try {
            setLoading(true);

            // Fetch user profile
            const data = await getUserProfileByAdminService(id);

            if (data) {
                setUserData(data.user);
                setProfileData(data.profile?.data || {});
                setProfileUserRole(data.user?.role?.name);

                // Load categories based on role
                if (data.user?.role?.name === 'Professional') {
                    const profCategories = await getProfessionalCategoriesService();
                    setProfessionalCategories(profCategories);
                } else if (data.user?.role?.name === 'Institute') {
                    const instCategories = await getInstituteCategoriesService();
                    const instSpecialties = await getInstituteSpecialtiesService();

                    setInstituteCategories(instCategories);
                    setSpecialties(instSpecialties);

                    // Set initial form data for institute
                    if (data.profile?.data) {
                        setMainFormData({
                            institute_category_id: data.profile.data.institute_category_id || "",
                            institute_specialty_ids: data.profile.data.institute_specialty_ids || []
                        });

                        // Set selected category for institute
                        if (data.profile.data.institute_category_id) {
                            const selectedCat = instCategories.find(
                                row => row.id === Number(data.profile.data.institute_category_id)
                            );
                            setSelectedCategory(selectedCat);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error initializing data:", error);
            Swal.fire("Error", "Failed to load user profile", "error");
        } finally {
            setLoading(false);
        }
    };

    // Professional profile submit handler
    const handleProfessionalSubmit = async (formData) => {
        try {
            const files = {};
            const profilePayload = {};

            Object.keys(formData).forEach(key => {
                if (formData[key] instanceof File || formData[key] instanceof FileList) {
                    if (formData[key] instanceof FileList && formData[key].length > 0) {
                        files[key] = formData[key][0];
                    } else if (formData[key] instanceof File) {
                        files[key] = formData[key];
                    }
                } else {
                    profilePayload[key] = formData[key];
                }
            });

            const success = await updateUserProfileByAdminService(id, profilePayload, files);

            if (success) {
                navigate(`/${userRole}/users/${id}/profile/view`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    // Institute profile submit handler
    const handleInstituteSubmit = async (formData, fileFields = []) => {
        try {
            const payload = { ...mainFormData, ...formData };
            const files = {};

            // Extract files
            fileFields.forEach(field => {
                if (formData[field]) {
                    if (formData[field] instanceof FileList && formData[field].length > 0) {
                        files[field] = formData[field][0];
                    } else if (formData[field] instanceof File) {
                        files[field] = formData[field];
                    }
                    delete payload[field];
                }
            });

            const success = await updateUserProfileByAdminService(id, payload, files);

            if (success) {
                navigate(`/${userRole}/users/${id}/profile/view`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    // Get current form ID for submit button
    const getCurrentFormId = () => {
        if (!selectedCategory?.name) return "form-1";

        const profileFormsList = {
            "Private Clinics and Practices": "private-clinics-and-practices-form",
            "Pharmacy": "pharmacy-form",
            "Recruitment Agency": "recruitment-agency-form",
            "Head Hunter": "headhunter-form",
        };

        // Check if it's Private Clinics with Dental specialty
        if (selectedCategory.name === "Private Clinics and Practices") {
            const isDental = mainFormData?.institute_specialty_ids?.length === 1 &&
                specialties.some(item =>
                    item.name.toLowerCase() === "dental" &&
                    item.id === mainFormData.institute_specialty_ids[0]
                );

            return isDental ? "dental-form" : "private-clinics-and-practices-form";
        }

        return profileFormsList[selectedCategory.name] || "form-1";
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <PageHeader
                    title="Edit User Profile"
                    subtitle="Update user profile information"
                    icon={<EditRoundedIcon />}
                    breadcrumbs={[
                        { label: 'Dashboard', path: `/${userRole}/dashboard` },
                        { label: 'Users', path: `/${userRole}/users` },
                        { label: 'Edit Profile' },
                    ]}
                />
                <Box sx={{ px: 4, pb: 4, display: 'flex', justifyContent: 'center', pt: 8 }}>
                    <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
            </Box>
        );
    }

    if (!userData) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <PageHeader
                    title="Edit User Profile"
                    subtitle="Update user profile information"
                    icon={<EditRoundedIcon />}
                    breadcrumbs={[
                        { label: 'Dashboard', path: `/${userRole}/dashboard` },
                        { label: 'Users', path: `/${userRole}/users` },
                        { label: 'Edit Profile' },
                    ]}
                />
                <Box sx={{ px: 4, pb: 4 }}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        User not found or you don't have permission to edit this profile.
                    </Alert>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Edit User Profile"
                subtitle="Update user profile information"
                icon={<EditRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: 'Users', path: `/${userRole}/users` },
                    { label: 'View Profile', path: `/${userRole}/users/${id}/profile/view` },
                    { label: 'Edit' },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                {/* User Info Card */}
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                        mb: 3
                    }}
                >
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <PersonRoundedIcon sx={{ color: '#3b82f6' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {userData.name}
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <EmailRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Email</Typography>
                                </Box>
                                <Typography sx={{ color: '#0f172a' }}>{userData.email}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <BadgeRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Role</Typography>
                                </Box>
                                <Typography sx={{ color: '#0f172a' }}>{userData.role?.name || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <BadgeRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Account Status</Typography>
                                </Box>
                                <Chip
                                    label={userData.status ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{
                                        backgroundColor: userData.status ? '#d1fae5' : '#fee2e2',
                                        color: userData.status ? '#059669' : '#dc2626',
                                        fontWeight: 500,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Profile Edit Card */}
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                    }}
                >
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderBottom: '1px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '16px 16px 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <EditRoundedIcon sx={{ color: 'white' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                            Edit {profileUserRole} Profile
                        </Typography>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                        {profileUserRole === 'Professional' ? (
                            <ComprehensiveProfileForm
                                profileData={profileData}
                                categories={professionalCategories}
                                handleFormSubmit={handleProfessionalSubmit}
                            />
                        ) : profileUserRole === 'Institute' ? (
                            <>
                                {/* MainForm for category/specialty selection */}
                                <MainForm
                                    categories={instituteCategories}
                                    setMainFormData={setMainFormData}
                                    profileData={profileData}
                                    setSelectedCategory={setSelectedCategory}
                                    setSelectedSpecialties={setSelectedSpecialties}
                                    handleFormSubmit={handleInstituteSubmit}
                                />

                                {/* Show specific form based on selected category */}
                                {selectedCategory?.name && (
                                    <>
                                        <Divider sx={{ my: 4, borderColor: '#3b82f6', borderWidth: 2 }} />

                                        {selectedCategory?.name === "Recruitment Agency" && (
                                            <RecruitmentAgencyForm
                                                profile={profileData}
                                                userCategory={selectedCategory.name}
                                                handleFormSubmit={handleInstituteSubmit}
                                            />
                                        )}

                                        {selectedCategory?.name === "Pharmacy" && (
                                            <PharmacyForm
                                                profile={profileData}
                                                userCategory={selectedCategory.name}
                                                handleFormSubmit={handleInstituteSubmit}
                                                selectedSpecialties={selectedSpecialties}
                                            />
                                        )}

                                        {selectedCategory?.name === "Head Hunter" && (
                                            <HeadHunterForm
                                                profileData={profileData}
                                                handleFormSubmit={handleInstituteSubmit}
                                            />
                                        )}

                                        {selectedCategory?.name === "Private Clinics and Practices" &&
                                            mainFormData?.institute_specialty_ids?.length === 1 &&
                                            specialties.some(item => item.name.toLowerCase() === "dental" && item.id === mainFormData.institute_specialty_ids[0]) && (
                                                <DentalForm
                                                    profileData={profileData}
                                                    handleFormSubmit={handleInstituteSubmit}
                                                />
                                            )}

                                        {selectedCategory?.name === "Private Clinics and Practices" &&
                                            !(
                                                mainFormData?.institute_specialty_ids?.length === 1 &&
                                                specialties.some(item => item.name.toLowerCase() === "dental" && item.id === mainFormData.institute_specialty_ids[0])
                                            ) && (
                                                <PrivateClinicsAndPracticesForm
                                                    profile={profileData}
                                                    userCategory={selectedCategory.name}
                                                    handleFormSubmit={handleInstituteSubmit}
                                                    selectedSpecialties={selectedSpecialties}
                                                />
                                            )}
                                    </>
                                )}
                            </>
                        ) : (
                            <Alert
                                severity="warning"
                                sx={{ borderRadius: 2 }}
                                icon={<WarningRoundedIcon />}
                            >
                                Unknown user role. Cannot display profile form.
                            </Alert>
                        )}
                    </CardContent>

                    {/* Footer with action buttons */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: '0 0 16px 16px',
                        }}
                    >
                        <Button
                            component={Link}
                            to={`/${userRole}/users/${id}/profile/view`}
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                px: 4,
                                '&:hover': {
                                    borderColor: '#cbd5e1',
                                    backgroundColor: '#f1f5f9',
                                },
                            }}
                        >
                            Cancel
                        </Button>

                        {profileUserRole === 'Professional' ? (
                            <Button
                                form="comprehensive-profile-form"
                                type="submit"
                                variant="contained"
                                startIcon={<SaveRoundedIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    backgroundColor: '#10b981',
                                    px: 4,
                                    '&:hover': {
                                        backgroundColor: '#059669',
                                    },
                                }}
                            >
                                Save Changes
                            </Button>
                        ) : profileUserRole === 'Institute' ? (
                            <Button
                                form={getCurrentFormId()}
                                type="submit"
                                variant="contained"
                                startIcon={<SaveRoundedIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    backgroundColor: '#10b981',
                                    px: 4,
                                    '&:hover': {
                                        backgroundColor: '#059669',
                                    },
                                }}
                            >
                                Save Changes
                            </Button>
                        ) : null}
                    </Box>
                </Card>
            </Box>
        </Box>
    );
};

export default EditUserProfile;
