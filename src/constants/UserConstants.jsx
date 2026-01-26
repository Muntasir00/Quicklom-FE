export const USER_ROLE = {
    ADMIN: "admin",
    PROFESSIONAL: "professional",
    INSTITUTE: "institute",
};

export const USER_ROLE_LABELS = {
    [USER_ROLE.ADMIN]: "Administrator",
    [USER_ROLE.PROFESSIONAL]: "Professional",
    [USER_ROLE.INSTITUTE]: "Institution",
};


export const ROLE_MAP = {
    [USER_ROLE.ADMIN]: [
        "admin", "super_admin", "manager_admin", "admin_head",
        "system_admin", "root_admin", "administrator",
        "admin_supervisor", "chief_admin", "admin_lead"
    ],
    [USER_ROLE.INSTITUTE]: [
        "institute", "institute_manager", "institution", "institution_head",
        "inst_manager", "institute_admin", "institute_director",
        "school_admin", "college_manager", "academic_head",
        "branch_manager", "academy_lead"
    ],
    [USER_ROLE.PROFESSIONAL]: [
        "professional", "doctor", "specialist", "medic",
        "nurse", "therapist", "consultant", "physician",
        "surgeon", "clinician", "practitioner", "healthcare_worker"
    ],
};
