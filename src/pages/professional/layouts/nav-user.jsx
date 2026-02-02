import React from "react";
import {
    BadgeCheck,
    Bell, CalendarDaysIcon,
    ChevronsUpDown, ContactIcon,
    LogOut,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@components/ui/sidebar"
import {useHeader} from "@hooks/professional/layouts/useHeader.jsx";
import {logoutService} from "@services/user/AuthService.jsx";

export function NavUser() {
    const {isMobile} = useSidebar();
    const userName = sessionStorage.getItem("name") || "User";
    const userRole = sessionStorage.getItem("role") || "Professional";

    const {
        navigate,
        SESSION,
    } = useHeader();

    async function handleLogout(event) {
        const status = await logoutService(event);
        if (status === true) {
            navigate("/login");
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {/*<AvatarImage src={user?.avatar} alt={userName}/>*/}
                                <AvatarFallback className="rounded-lg">SH</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{userName}</span>
                                <span className="truncate text-xs">{userRole}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg cursor-pointer"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {/*<AvatarImage src={user?.avatar} alt={userName}/>*/}
                                    <AvatarFallback className="rounded-lg">SH</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{userName}</span>
                                    <span className="truncate text-xs">{userRole}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="border border-gray-600"/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="cursor-pointer"
                                              onClick={() => navigate(`/${SESSION.USER_ROLE}/profile/${SESSION.USER_ID}/edit`)}>
                                <ContactIcon/>
                                Profile
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="border border-gray-600"/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="cursor-pointer"
                                              onClick={() => navigate(`/${SESSION.USER_ROLE}/account`)}>
                                <BadgeCheck/>
                                Account Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer"
                                              onClick={() => navigate(`/${SESSION.USER_ROLE}/availability`)}>
                                <CalendarDaysIcon/>
                                My Availability
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer"
                                              onClick={() => navigate(`/${SESSION.USER_ROLE}/notifications`)}>
                                <Bell/>
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="border border-gray-600"/>
                        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                            <LogOut/>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
};
