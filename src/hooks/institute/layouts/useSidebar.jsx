import { useLocation, useNavigate } from "react-router-dom";

export const useSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menu = location.pathname;
    const ALLOWED_APPLICANT_CATEGORIES = ["recruitment agency", "head hunter"];

    const SESSION = {
        ROLE: sessionStorage.getItem("role"),
        USER_ID: sessionStorage.getItem("user_id"),
        INSTITUTE_CATEGORY: (sessionStorage.getItem("institute_category_name") || '').toLowerCase(),
    };

    return {
        navigate,
        menu,
        SESSION,
        ALLOWED_APPLICANT_CATEGORIES
    };
};
