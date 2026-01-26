import React from "react";

// Layout components
import Header from "../pages/professional/layouts/Header";
import Sidebar from "../pages/professional/layouts/Sidebar";
import Footer from "../pages/professional/layouts/Footer";
import MyRouter from "../router/Index";
import { NotificationProvider } from "@context/NotificationContext";

const AdminLayout = () => {
    return (
        <NotificationProvider>
            <div className="app-container">
                <Header />
                    <Sidebar />
                    <MyRouter />
                <Footer />
            </div>
        </NotificationProvider>
    );
};

export default AdminLayout;
