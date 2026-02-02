import * as React from "react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, useSidebar
} from "@components/ui/sidebar"
import {GalleryHorizontalEnd} from "lucide-react";

export function TeamSwitcher() {
    const {open} = useSidebar()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {!open && <div
                                className="data-[state=open]:hidden bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg group-data-[collapsible=icon]:flex group-data-[collapsible=expanded]:hidden">
                                <GalleryHorizontalEnd className="size-4"/>
                            </div>}
                            <div className="grid flex-1 text-left text-sm leading-tight py-2 text-[#175CD3]">
                                <span className="truncate font-bold text-2xl">Quicklocum</span>
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
