import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const userRole = sessionStorage.getItem("role") || "institute";

    return (
        <footer className="main-footer healthcare-footer">
            <div className="container-fluid">
                <div className="footer-content">
                    {/* Left Side - Brand & Copyright */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <i className="fas fa-heartbeat"></i>
                        </div>
                        <div className="footer-info">
                            <span className="footer-name">QuickLocum</span>
                            <span className="footer-copyright">© {currentYear} All rights reserved</span>
                        </div>
                    </div>

                    {/* Center - Quick Links */}
                    <div className="footer-links d-none d-md-flex">
                        <Link to={`/${userRole}/dashboard`} className="footer-link">
                            <i className="fas fa-home"></i>
                            Dashboard
                        </Link>
                        <Link to={`/${userRole}/contracts`} className="footer-link">
                            <i className="fas fa-file-contract"></i>
                            Contracts
                        </Link>
                        <Link to={`/${userRole}/messaging`} className="footer-link">
                            <i className="fas fa-envelope"></i>
                            Messages
                        </Link>
                    </div>

                    {/* Right Side - Legal & Version */}
                    <div className="footer-legal">
                        <Link to={`/${userRole}/terms-of-use`} className="legal-link">
                            Terms of Service
                        </Link>
                        <span className="footer-divider">|</span>
                        <span className="footer-version">v1.0.0</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .healthcare-footer {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
                    border-top: 3px solid #0d9488 !important;
                    padding: 0 !important;
                    margin-left: 250px;
                    position: relative;
                    z-index: 1000;
                }

                .footer-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.875rem 1rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                /* Brand Section */
                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .footer-logo {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.95rem;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
                }

                .footer-info {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.2;
                }

                .footer-name {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: white;
                }

                .footer-copyright {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                /* Quick Links */
                .footer-links {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .footer-link {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.5rem 0.875rem;
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-decoration: none !important;
                    border-radius: 8px;
                    transition: all 0.25s ease;
                }

                .footer-link:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #14b8a6 !important;
                }

                .footer-link i {
                    font-size: 0.75rem;
                    opacity: 0.8;
                }

                /* Legal Section */
                .footer-legal {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .legal-link {
                    color: rgba(255, 255, 255, 0.6) !important;
                    font-size: 0.8rem;
                    text-decoration: none !important;
                    transition: color 0.25s ease;
                }

                .legal-link:hover {
                    color: #14b8a6 !important;
                }

                .footer-divider {
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 0.8rem;
                }

                .footer-version {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 0.25rem 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                }

                /* ========================================
                   RESPONSIVE FOOTER STYLES
                   ======================================== */

                /* Tablet and below - No sidebar margin */
                @media (max-width: 991.98px) {
                    .healthcare-footer {
                        margin-left: 0 !important;
                        position: relative;
                    }
                }

                /* Mobile adjustments */
                @media (max-width: 767.98px) {
                    .footer-content {
                        justify-content: center;
                        text-align: center;
                        padding: 1rem 0.75rem;
                    }

                    .footer-brand {
                        width: 100%;
                        justify-content: center;
                    }

                    .footer-legal {
                        width: 100%;
                        justify-content: center;
                    }

                    .footer-logo {
                        width: 32px;
                        height: 32px;
                        font-size: 0.85rem;
                    }

                    .footer-name {
                        font-size: 0.85rem;
                    }

                    .footer-copyright {
                        font-size: 0.65rem;
                    }
                }

                /* Small mobile */
                @media (max-width: 575.98px) {
                    .footer-content {
                        gap: 0.75rem;
                        padding: 0.875rem 0.5rem;
                    }

                    .footer-legal {
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }

                    .legal-link {
                        font-size: 0.75rem;
                    }

                    .footer-version {
                        font-size: 0.7rem;
                    }
                }

                /* Sidebar collapsed state - Desktop only */
                @media (min-width: 992px) {
                    body.sidebar-collapse .healthcare-footer {
                        margin-left: 4.6rem;
                    }
                }

                /* Safe area for notched devices */
                @supports (padding-bottom: env(safe-area-inset-bottom)) {
                    .healthcare-footer {
                        padding-bottom: env(safe-area-inset-bottom) !important;
                    }
                }
            `}</style>
        </footer>
    );
}

export default Footer;
