import { API_BASE_URL } from "@config/apiConfig";
import { useState, useEffect, useCallback } from "react";

export const useShowContract = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return { API_BASE_URL };
};
