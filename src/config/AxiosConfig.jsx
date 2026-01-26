import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from 'jwt-decode'

// Backend API URL from environment variable or default to localhost
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Remove trailing slash if present and add /api/
const baseURL = apiUrl.replace(/\/$/, '') + '/api/';

// Axios configuration setup
axios.defaults.baseURL = baseURL;  // Set the base URL for all axios requests
axios.defaults.headers.common['Accept'] = 'application/json';  // Default 'Accept' header to expect JSON responses
axios.defaults.headers.post['Content-Type'] = 'application/json';  // Default 'Content-Type' for POST requests to handle form data
axios.defaults.withCredentials = true;  // Include credentials (like cookies) in requests
axios.interceptors.request.use(function (config) {
    const access_token = sessionStorage.getItem('access_token');  // Retrieve the access token from session storage
    //const url = config.url.replace(/^v\d+\.\d+\.\d+\//, ''); // Removes 'v1.1.1/'
    const url = config.url.replace(/^v\.1\//, '');
    const exemptedRoutes = ['admin/login', 'admin/register', 'user/login', 'user/register'];

    
    // Exempt certain routes from requiring a token
    if (exemptedRoutes.includes(url)) {
        return config;
    }
   
    // Check if token exists
    if (!access_token) {
        Swal.fire("Error", "No auth token found!", "error").then(() => {
            setTimeout(() => {
                window.location.href = "/login"; // Redirect to login page
            }, 1000); // 1-second delay
        });
        return Promise.reject('No auth token found');
    }

    // Check if the token has expired - reject request if so
    if (isTokenExpired(access_token)) {
        return Promise.reject('Token has expired or is invalid');
    }

    config.headers.Authorization = `Bearer ${access_token}`;  // Add Authorization header
    return config;  // Return the modified request configuration

}, function (error) {
    return Promise.reject(error);
});

// Function to check if the token has expired
// Returns true if token is expired/invalid, false otherwise
const isTokenExpired = (access_token) => {
    try {
        const decodedToken = jwtDecode(access_token);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        // Check if the token has expired
        if (decodedToken.exp < currentTime) {
            sessionStorage.removeItem('access_token'); // Remove the expired token
            Swal.fire("Error", "Your session has expired!", "error").then(() => {
                setTimeout(() => {
                    window.location.href = "/login"; // Redirect to login page
                }, 1000); // 1-second delay
            });
            return true; // Token is expired
        }
        return false; // Token is valid
    } catch (error) {
        sessionStorage.removeItem('access_token'); // Remove the invalid token (fixed: was 'auth_token')
        Swal.fire("Error", "Invalid token detected", "error").then(() => {
            setTimeout(() => {
                window.location.href = "/login"; // Redirect to login page
            }, 1000);
        });
        return true; // Token is invalid
    }
};

export default axios;