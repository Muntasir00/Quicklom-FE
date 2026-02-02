import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
export default function NavGroup({ label, items }) {
    const location = useLocation();

    return (
        <SidebarGroup>
            {label && (
                <SidebarGroupLabel className="text-[#9CA3AF] text-[12px]">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarMenu>
                {/* eslint-disable-next-line react/prop-types */}
                {items?.length > 0 && items?.map((item, index) => {
                    const displayText = item.text;
                    const url = item.to; // Sidebar-এ 'to' ব্যবহার করেছেন
                    const isActive = location.pathname === url;

                    return (
                        <SidebarMenuItem key={index}>
                            <SidebarMenuButton
                                tooltip={displayText}
                                asChild
                                isActive={isActive}
                                className={
                                    isActive
                                        ? "!bg-[#2D8FE3] !text-white !rounded-[6px]"
                                        : "!text-[#2A394B]"
                                }
                            >
                                <Link to={url} className="text-[14px]">
                                    {item.icon && item.icon}
                                    <span>{displayText}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}