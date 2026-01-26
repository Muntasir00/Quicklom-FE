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
    ButtonGroup,
    IconButton,
} from "@mui/material";

// MUI Icons
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";

import { getUserProfileByAdminService, updateUserProfileStatusByAdminService } from "../../../services/admin/UserService";
import PageHeader from "@components/admin/PageHeader";
import Swal from "sweetalert2";

const ViewUserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem("role")?.toLowerCase();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [profileUserRole, setProfileUserRole] = useState(null);

    useEffect(() => {
        document.title = "View User Profile | Quicklocum";
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfileByAdminService(id);

            if (data) {
                setUserData(data.user);
                setProfileData(data.profile);
                setProfileUserRole(data.user?.role?.name);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        const success = await updateUserProfileStatusByAdminService(id, newStatus);
        if (success) {
            fetchUserProfile();
        }
    };

    const renderProfileField = (label, value, icon = null) => {
        if (!value || value === "" || (Array.isArray(value) && value.length === 0)) {
            return null;
        }

        return (
            <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    {icon && (
                        <Box sx={{ color: '#3b82f6', mt: 0.5 }}>
                            {icon}
                        </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            {label}
                        </Typography>
                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {Array.isArray(value) ? value.join(", ") : value}
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        );
    };

    const renderFileLink = (label, filePath, icon = null) => {
        if (!filePath) return null;

        const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        const fileName = cleanPath.split('/').pop() || 'file';
        const fileExtension = fileName.split('.').pop()?.toLowerCase();

        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
        const isPDF = fileExtension === 'pdf';

        let fileIcon = icon || <InsertDriveFileRoundedIcon fontSize="small" />;
        if (isImage) fileIcon = <ImageRoundedIcon fontSize="small" />;
        else if (isPDF) fileIcon = <PictureAsPdfRoundedIcon fontSize="small" />;

        const fileUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/${cleanPath}`;

        const handlePreview = () => {
            if (isImage) {
                Swal.fire({
                    title: label,
                    imageUrl: fileUrl,
                    imageAlt: fileName,
                    showCloseButton: true,
                    showConfirmButton: false,
                    width: '800px',
                });
            } else if (isPDF) {
                window.open(fileUrl, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                link.click();
            }
        };

        return (
            <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    <Box sx={{ color: '#3b82f6', mt: 0.5 }}>
                        {fileIcon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            {label}
                        </Typography>
                        <ButtonGroup size="small" sx={{ mt: 0.5 }}>
                            <Button
                                onClick={handlePreview}
                                startIcon={isImage ? <VisibilityRoundedIcon /> : isPDF ? <VisibilityRoundedIcon /> : <DownloadRoundedIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: 12,
                                    borderColor: '#3b82f6',
                                    color: '#3b82f6',
                                }}
                            >
                                {isImage ? 'View' : isPDF ? 'Open' : 'Download'}
                            </Button>
                            <Button
                                href={fileUrl}
                                download={fileName}
                                sx={{
                                    borderRadius: 2,
                                    borderColor: '#e2e8f0',
                                    color: '#64748b',
                                }}
                            >
                                <DownloadRoundedIcon fontSize="small" />
                            </Button>
                        </ButtonGroup>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                            {fileName}
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        );
    };

    const renderDocumentsSection = (data, isProfessional = true) => {
        const professionalFiles = {
            'Profile Photo': data.profile_photo,
            'ID Upload': data.id_upload,
            'License Document': data.license_document,
            'CV Upload': data.cv_upload,
        };

        const instituteFiles = {
            'Business License': data.business_license,
            'Insurance Certificate': data.insurance_certificate,
            'Proof of Address': data.proof_of_address,
            'Tax Document': data.tax_document,
            'Proof of Business Registration': data.proof_of_business_registration,
            'Proof of Liability Insurance': data.proof_of_liability_insurance,
            'Confidentiality Agreement': data.confidentiality_agreement,
            'Pharmacy License': data.pharmacy_license_document,
            'Accreditation Certificate': data.accreditation_certificate,
        };

        const files = isProfessional ? professionalFiles : instituteFiles;
        const availableFiles = Object.entries(files).filter(([_, path]) => path);

        if (availableFiles.length === 0) {
            return (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No documents uploaded yet.
                </Alert>
            );
        }

        return (
            <Grid container spacing={2}>
                {availableFiles.map(([label, path]) => (
                    renderFileLink(label, path)
                ))}
            </Grid>
        );
    };

    const renderStatusSection = () => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a', mb: 1 }}>
                    Profile Status
                </Typography>
                <Chip
                    label={(profileData?.status || 'PENDING').toUpperCase()}
                    sx={{
                        backgroundColor: profileData?.status === 'approved' ? '#d1fae5' :
                            profileData?.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: profileData?.status === 'approved' ? '#059669' :
                            profileData?.status === 'rejected' ? '#dc2626' : '#d97706',
                        fontWeight: 600,
                    }}
                />
            </Box>
            <ButtonGroup variant="outlined" size="small">
                <Button
                    onClick={() => handleStatusChange('approved')}
                    disabled={profileData?.status === 'approved'}
                    startIcon={<CheckCircleRoundedIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: '#10b981',
                        color: '#10b981',
                        '&:hover': { backgroundColor: '#d1fae5', borderColor: '#10b981' },
                    }}
                >
                    Approve
                </Button>
                <Button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={profileData?.status === 'rejected'}
                    startIcon={<CancelRoundedIcon />}
                    sx={{
                        textTransform: 'none',
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        '&:hover': { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
                    }}
                >
                    Reject
                </Button>
                <Button
                    onClick={() => handleStatusChange('pending')}
                    disabled={profileData?.status === 'pending'}
                    startIcon={<PendingRoundedIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: '#f59e0b',
                        color: '#f59e0b',
                        '&:hover': { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
                    }}
                >
                    Pending
                </Button>
            </ButtonGroup>
        </Box>
    );

    const renderSectionHeader = (title, icon) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 3 }}>
            <Box sx={{ color: '#3b82f6' }}>{icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {title}
            </Typography>
        </Box>
    );

    const renderProfessionalProfile = () => {
        if (!profileData?.data) return null;
        const data = profileData.data;

        return (
            <>
                {renderStatusSection()}
                <Divider sx={{ mb: 3 }} />

                {renderSectionHeader("Personal Information", <PersonRoundedIcon />)}
                <Grid container spacing={2}>
                    {renderProfileField("First Name", data.first_name, <PersonRoundedIcon fontSize="small" />)}
                    {renderProfileField("Last Name", data.last_name, <PersonRoundedIcon fontSize="small" />)}
                    {renderProfileField("Email", data.email, <EmailRoundedIcon fontSize="small" />)}
                    {renderProfileField("Phone", data.phone_number, <PhoneRoundedIcon fontSize="small" />)}
                    {renderProfileField("Date of Birth", data.dob, <CalendarTodayRoundedIcon fontSize="small" />)}
                    {renderProfileField("Gender", data.gender, <PersonRoundedIcon fontSize="small" />)}
                    {renderProfileField("Languages", data.languages, <LanguageRoundedIcon fontSize="small" />)}
                    {renderProfileField("Province", data.province, <LocationOnRoundedIcon fontSize="small" />)}
                    {renderProfileField("City", data.city, <LocationOnRoundedIcon fontSize="small" />)}
                    {renderProfileField("Address", data.address, <LocationOnRoundedIcon fontSize="small" />)}
                    {renderProfileField("Postal Code", data.postal_code, <LocationOnRoundedIcon fontSize="small" />)}
                </Grid>

                {renderSectionHeader("Professional Information", <WorkRoundedIcon />)}
                <Grid container spacing={2}>
                    {renderProfileField("Professional Status", data.professional_status)}
                    {renderProfileField("Authorized to Practice", data.authorized_to_practice)}
                    {renderProfileField("License Number", data.license_number)}
                    {renderProfileField("Practicing Since", data.practicing_since)}
                    {renderProfileField("Province Reporting", data.province_reporting)}
                    {renderProfileField("Professional Category", data.professional_category_name)}
                    {renderProfileField("Professional Roles", data.professional_role_names)}
                </Grid>

                {(data.highest_degree_obtained || data.year_of_graduation || data.institution_name) && (
                    <>
                        {renderSectionHeader("Education", <SchoolRoundedIcon />)}
                        <Grid container spacing={2}>
                            {renderProfileField("Highest Degree", data.highest_degree_obtained)}
                            {renderProfileField("Year of Graduation", data.year_of_graduation)}
                            {renderProfileField("Institution", data.institution_name)}
                            {renderProfileField("Country", data.institution_country)}
                        </Grid>
                    </>
                )}

                {(data.years_of_experience || data.software_proficiency || data.additional_skills) && (
                    <>
                        {renderSectionHeader("Experience & Skills", <WorkRoundedIcon />)}
                        <Grid container spacing={2}>
                            {renderProfileField("Years of Experience", data.years_of_experience)}
                            {renderProfileField("Software Proficiency", data.software_proficiency)}
                            {renderProfileField("Additional Skills", data.additional_skills)}
                        </Grid>
                    </>
                )}

                {renderSectionHeader("Documents", <DescriptionRoundedIcon />)}
                {renderDocumentsSection(data, true)}
            </>
        );
    };

    const renderInstituteProfile = () => {
        if (!profileData?.data) return null;
        const data = profileData.data;
        const instituteCategory = userData?.profiles?.[0]?.institute_category?.name || 'Institute';

        const getInstituteName = () => data.institute_name || data.agency_name || data.clinic_name || data.pharmacy_name || data.company_name;
        const getContactPerson = () => data.contact_person || data.primary_contact_full_name || data.owner_name || data.manager_name;
        const getEmail = () => data.email || data.email_address || data.primary_contact_email || data.contact_email;
        const getPhone = () => data.phone_number || data.primary_contact_phone || data.contact_phone;
        const getAddress = () => data.address || data.head_office_address || data.clinic_address || data.pharmacy_address;

        return (
            <>
                {renderStatusSection()}
                <Divider sx={{ mb: 3 }} />

                {renderSectionHeader(`${instituteCategory} Information`, <BusinessRoundedIcon />)}
                <Grid container spacing={2}>
                    {renderProfileField("Name", getInstituteName(), <BusinessRoundedIcon fontSize="small" />)}
                    {renderProfileField("Category", instituteCategory)}
                    {renderProfileField("Specialties", data.institute_specialty_names || data.specialties_covered)}
                    {renderProfileField("Contact Person", getContactPerson(), <PersonRoundedIcon fontSize="small" />)}
                    {renderProfileField("Position", data.primary_contact_position || data.contact_position)}
                    {renderProfileField("Email", getEmail(), <EmailRoundedIcon fontSize="small" />)}
                    {renderProfileField("Phone", getPhone(), <PhoneRoundedIcon fontSize="small" />)}
                    {renderProfileField("Website", data.website, <LanguageRoundedIcon fontSize="small" />)}
                </Grid>

                {renderSectionHeader("Address Information", <LocationOnRoundedIcon />)}
                <Grid container spacing={2}>
                    {renderProfileField("Province", data.province)}
                    {renderProfileField("City", data.city)}
                    {renderProfileField("Address", getAddress())}
                    {renderProfileField("Postal Code", data.postal_code)}
                    {renderProfileField("Regions Served", data.regions_served)}
                </Grid>

                {(data.business_number || data.tax_number || data.years_of_experience) && (
                    <>
                        {renderSectionHeader("Business Information", <WorkRoundedIcon />)}
                        <Grid container spacing={2}>
                            {renderProfileField("Business Number", data.business_number)}
                            {renderProfileField("Tax Number", data.tax_number)}
                            {renderProfileField("Years of Experience", data.years_of_experience)}
                            {renderProfileField("Number of Recruiters", data.number_of_recruiters)}
                            {renderProfileField("Types of Contracts", data.types_of_contracts_managed)}
                        </Grid>
                    </>
                )}

                {(data.pharmacy_license_number || data.accreditation_body) && (
                    <>
                        {renderSectionHeader("Pharmacy Details", <LocalHospitalRoundedIcon />)}
                        <Grid container spacing={2}>
                            {renderProfileField("Pharmacy License Number", data.pharmacy_license_number)}
                            {renderProfileField("Accreditation Body", data.accreditation_body)}
                            {renderProfileField("Operating Hours", data.operating_hours)}
                            {renderProfileField("Services Offered", data.services_offered)}
                        </Grid>
                    </>
                )}

                {renderSectionHeader("Documents", <DescriptionRoundedIcon />)}
                {renderDocumentsSection(data, false)}

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CodeRoundedIcon />}
                        onClick={() => {
                            console.log("Profile Data:", data);
                            Swal.fire({
                                title: 'Profile Data (Debug)',
                                html: `<pre style="text-align: left; max-height: 400px; overflow: auto;">${JSON.stringify(data, null, 2)}</pre>`,
                                width: '800px',
                                confirmButtonText: 'Close'
                            });
                        }}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                        }}
                    >
                        View Raw Data
                    </Button>
                </Box>
            </>
        );
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <PageHeader
                    title="User Profile"
                    subtitle="View user profile details"
                    icon={<PersonRoundedIcon />}
                    breadcrumbs={[
                        { label: 'Dashboard', path: `/${userRole}/dashboard` },
                        { label: 'Users', path: `/${userRole}/users` },
                        { label: 'Profile' },
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
                    title="User Profile"
                    subtitle="View user profile details"
                    icon={<PersonRoundedIcon />}
                    breadcrumbs={[
                        { label: 'Dashboard', path: `/${userRole}/dashboard` },
                        { label: 'Users', path: `/${userRole}/users` },
                        { label: 'Profile' },
                    ]}
                />
                <Box sx={{ px: 4, pb: 4 }}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        User not found or you don't have permission to view this profile.
                    </Alert>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="User Profile"
                subtitle="View user profile details"
                icon={<PersonRoundedIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${userRole}/dashboard` },
                    { label: 'Users', path: `/${userRole}/users` },
                    { label: 'Profile' },
                ]}
                actionLabel="Edit Profile"
                actionPath={`/${userRole}/users/${id}/profile/edit`}
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
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <EmailRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Email</Typography>
                                </Box>
                                <Typography sx={{ color: '#0f172a' }}>{userData.email}</Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <BadgeRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Role</Typography>
                                </Box>
                                <Typography sx={{ color: '#0f172a' }}>{userData.role?.name || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
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
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Joined</Typography>
                                </Box>
                                <Typography sx={{ color: '#0f172a' }}>
                                    {new Date(userData.created_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Profile Data Card */}
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <BadgeRoundedIcon sx={{ color: '#3b82f6' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {profileUserRole === 'Professional' ? 'Professional' : 'Institute'} Profile Details
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                        {!profileData ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <PersonRoundedIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                                    No Profile Created Yet
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                                    This user hasn't created their profile yet.
                                </Typography>
                                <Button
                                    component={Link}
                                    to={`/${userRole}/users/${id}/profile/edit`}
                                    variant="contained"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        backgroundColor: '#3b82f6',
                                        '&:hover': { backgroundColor: '#2563eb' },
                                    }}
                                >
                                    Create Profile
                                </Button>
                            </Box>
                        ) : (
                            profileUserRole === 'Professional' ? renderProfessionalProfile() : renderInstituteProfile()
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default ViewUserProfile;
