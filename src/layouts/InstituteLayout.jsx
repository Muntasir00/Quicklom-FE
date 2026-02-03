import React from "react";

// Layout components
import Header from "../pages/institute/layouts/Header";
import Sidebar from "../pages/institute/layouts/Sidebar";
import Footer from "../pages/institute/layouts/Footer";
import MyRouter from "../router/Index";
import {NotificationProvider} from "@context/NotificationContext";
import {SidebarInset, SidebarProvider} from "@components/ui/sidebar.jsx";

const AdminLayout = () => {
    const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith('sidebar:state='))
        ?.split('=')[1]

    const defaultOpen = cookieValue === 'true'
    return (
        <NotificationProvider>
            {/*<div className="app-container">*/}
            {/*    <Header />*/}
            {/*        <Sidebar />*/}
            {/*        <MyRouter /> */}
            {/*    <Footer />*/}
            {/*</div>*/}
            <SidebarProvider
                defaultOpen={defaultOpen}
                className="h-screen overflow-hidden transition-colors duration-300"
            >
                <Sidebar/>
                <SidebarInset className="overflow-y-auto overflow-x-hidden">
                    <Header/>
                    <section className={`flex flex-1 flex-col gap-4 pt-0 overflow-y-auto`}>
                        <div className="flex flex-1 flex-col gap-4 p-4">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <MyRouter/>
                            </div>
                        </div>
                    </section>
                </SidebarInset>
            </SidebarProvider>
        </NotificationProvider>
    );
};

export default AdminLayout;
