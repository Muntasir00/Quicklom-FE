import React, { useState, useEffect } from "react";
import { upperCaseFirst } from "@utils/StringUtils";

export const useViewDashboard = () => {
    const menu = "dashboard";
    const sessionUserRole = sessionStorage.getItem("role");
   
    useEffect(() => { document.title = `${upperCaseFirst(menu ?? "Quicklocum")} | Quicklocum` }, []);

    return {
        menu,
        sessionUserRole,
    };
};
