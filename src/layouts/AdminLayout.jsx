import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import md3Theme from "../theme/md3Theme";

// Layout components
import Header from "../pages/admin/layouts/Header";
import Sidebar from "../pages/admin/layouts/Sidebar";
import Footer from "../pages/admin/layouts/Footer";
import MyRouter from "../router/Index";

const AdminLayout = () => {
    return (
        <ThemeProvider theme={md3Theme}>
            <CssBaseline />
            <div className="app-container">
                <Sidebar />
                <div className="main-content-wrapper" style={{ marginLeft: '280px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Header />
                    <main style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                        <MyRouter />
                    </main>
                    <Footer />
                </div>
            </div>
        </ThemeProvider>
    );
};

export default AdminLayout;
