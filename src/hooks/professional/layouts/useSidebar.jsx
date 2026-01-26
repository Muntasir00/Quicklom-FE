import { useLocation, useNavigate } from "react-router-dom";

export const useSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const menu = location.pathname;

    const SESSION = {
        ROLE: sessionStorage.getItem("role"),
        USER_ID: sessionStorage.getItem("user_id"),
    };

    return {
        navigate,
        menu,
        SESSION,
    };
};
