// Layout components
import Header from "../pages/professional/layouts/Header";
import Sidebar from "../pages/professional/layouts/Sidebar";
import Footer from "../pages/professional/layouts/Footer";
import MyRouter from "../router/Index";
import {NotificationProvider} from "@context/NotificationContext";
import {SidebarInset, SidebarProvider} from "@components/ui/sidebar.jsx";

const AdminLayout = () => {
    return (
        <NotificationProvider>
            {/*<div className="app-container">*/}
            {/*    <Header />*/}
            {/*        <Sidebar />*/}
            {/*        <MyRouter />*/}
            {/*    <Footer />*/}
            {/*</div>*/}
            <SidebarProvider className="h-screen overflow-hidden transition-colors duration-300 ">
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
