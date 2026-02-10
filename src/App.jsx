import React from "react";
import { useLocation, Navigate } from "react-router-dom";

// configurations
import "./config/AxiosConfig";

// custom css component
import './App.css';

// Role-based Layouts
import AdminLayout from "./layouts/AdminLayout";
import InstituteLayout from "./layouts/InstituteLayout";
import ProfessionalLayout from "./layouts/ProfessionalLayout";

// Auth Pages
import AdminLogin from "./pages/admin/auth/Login";
import UserLogin from "./pages/user/auth/Login";
import UserRegister from "./pages/user/auth/Register";

function App() {
    const location = useLocation();
    const isAuthenticated = !!sessionStorage.getItem("access_token");
    const role = sessionStorage.getItem("role")?.toLowerCase();

    const roleConfig = {
        admin: { dashboard: "/admin/dashboard", prefix: "/admin", layout: <AdminLayout /> },
        institute: { dashboard: "/institute/dashboard", prefix: "/institute", layout: <InstituteLayout /> },
        professional: { dashboard: "/professional/dashboard", prefix: "/professional", layout: <ProfessionalLayout /> },
    };

    const authPages = ["/admin/login", "/admin/register"];
    const current = roleConfig[role];

    if (isAuthenticated && !current) { sessionStorage.clear(); return <Navigate to="/admin/login" replace />; }
    if (isAuthenticated && authPages.includes(location.pathname)) return <Navigate to={current.dashboard} replace />;
    if (isAuthenticated && !location.pathname.startsWith(current.prefix)) return <Navigate to={current.dashboard} replace />;
    if (isAuthenticated) return current.layout;

    if (!isAuthenticated && location.pathname === "/admin/login") return <AdminLogin />;
    if (!isAuthenticated && location.pathname === "/login") return <UserLogin />;
    if (!isAuthenticated && location.pathname === "/register") return <UserRegister />;
    return <Navigate to="/login" replace />;
}

export default App;
