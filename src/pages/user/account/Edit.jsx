import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Form from "./Form";
import { getAccountService, updateAccount } from "../../../services/user/AccountService";
import { editAccountSchema } from "../../../schemas/user/AccountSchema";
import UpdateEmailModelComponent from "@components/modals/user/UpdateEmailModelComponent";


const Edit = () => {
    const role = sessionStorage.getItem("role")
    const [show, setShow] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(editAccountSchema),
        defaultValues: { email: "", name: "", password: "", confirm_password: "", current_password: "" },
    });

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const accountData = await getAccountService();
                Object.keys(accountData).forEach((key) => setValue(key, accountData[key]));
            } catch (err) {
                console.error("Error fetching account:", err);
            }
        };
        fetchAccount();
        document.title = "Account Settings | Quicklocum";
    }, [setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSaveSuccess(false);
        try {
            await updateAccount(data);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            if (err.response?.data?.errors) {
                const serverErrors = err.response.data.errors;
                Object.keys(serverErrors).forEach((field) => {
                    setError(field, { type: "server", message: serverErrors[field] });
                });
            } else {
                console.error("Unexpected error:", err);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="content-wrapper account-page-wrapper">
            {/* Modern Healthcare Header */}
            <div className="account-header">
                <div className="header-background"></div>
                <div className="container-fluid">
                    <div className="header-content">
                        <div className="header-left">
                            <div className="account-avatar">
                                <i className="fas fa-user-cog"></i>
                            </div>
                            <div className="header-info">
                                <h1 className="account-title">Account Settings</h1>
                                <p className="account-subtitle">
                                    Manage your personal information and security settings
                                </p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <Link to={`/${role}/dashboard`} className="btn-back">
                                <i className="fas fa-arrow-left"></i>
                                <span>Back to Dashboard</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="account-content">
                <div className="container-fluid">
                    {/* Quick Info Cards */}
                    <div className="quick-info-row">
                        <div className="info-card">
                            <div className="info-icon security">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <div className="info-details">
                                <span className="info-label">Security Status</span>
                                <span className="info-value">Protected</span>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon encryption">
                                <i className="fas fa-lock"></i>
                            </div>
                            <div className="info-details">
                                <span className="info-label">Connection</span>
                                <span className="info-value">Encrypted</span>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon account">
                                <i className="fas fa-user-check"></i>
                            </div>
                            <div className="info-details">
                                <span className="info-label">Account Type</span>
                                <span className="info-value capitalize">{role}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Settings Card */}
                    <div className="settings-main-card">
                        {/* Personal Information Section */}
                        <div className="settings-section">
                            <div className="section-header">
                                <div className="section-icon personal">
                                    <i className="fas fa-user-circle"></i>
                                </div>
                                <div className="section-title-group">
                                    <h3 className="section-title">Personal Information</h3>
                                    <p className="section-description">Update your email and name details</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="settings-section">
                            <div className="section-header">
                                <div className="section-icon security">
                                    <i className="fas fa-shield-alt"></i>
                                </div>
                                <div className="section-title-group">
                                    <h3 className="section-title">Security & Password</h3>
                                    <p className="section-description">Manage your password and security preferences</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="settings-form-wrapper">
                            <Form register={register} errors={errors} setShow={setShow} />
                            <UpdateEmailModelComponent show={show} setShow={setShow} setValue={setValue} />
                        </div>

                        {/* Card Footer */}
                        <div className="settings-card-footer">
                            <div className="footer-left">
                                <div className="security-badges">
                                    <div className="security-badge success">
                                        <i className="fas fa-check-circle"></i>
                                        <span>256-bit SSL</span>
                                    </div>
                                    <div className="security-badge info">
                                        <i className="fas fa-fingerprint"></i>
                                        <span>Secure Auth</span>
                                    </div>
                                </div>
                                {isDirty && (
                                    <div className="unsaved-indicator">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <span>You have unsaved changes</span>
                                    </div>
                                )}
                            </div>
                            <div className="footer-right">
                                {saveSuccess && (
                                    <div className="save-success-message">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Changes saved successfully!</span>
                                    </div>
                                )}
                                <button
                                    className={`btn-save ${isSubmitting ? 'loading' : ''}`}
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner"></span>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save"></i>
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info Card */}
                    <div className="info-tip-card">
                        <div className="tip-icon">
                            <i className="fas fa-lightbulb"></i>
                        </div>
                        <div className="tip-content">
                            <h4>Password Security Tips</h4>
                            <ul>
                                <li>Use a combination of uppercase, lowercase, numbers, and special characters</li>
                                <li>Avoid using personal information in your password</li>
                                <li>Change your password regularly for enhanced security</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                /* Healthcare Theme Variables */
                .account-page-wrapper {
                    --primary: #0d9488;
                    --primary-dark: #0f766e;
                    --primary-light: #14b8a6;
                    --secondary: #0f172a;
                    --accent: #f0fdfa;
                    --success: #10b981;
                    --warning: #f59e0b;
                    --danger: #ef4444;
                    --info: #0ea5e9;
                    --gray-50: #f8fafc;
                    --gray-100: #f1f5f9;
                    --gray-200: #e2e8f0;
                    --gray-300: #cbd5e1;
                    --gray-400: #94a3b8;
                    --gray-500: #64748b;
                    --gray-600: #475569;
                    --gray-700: #334155;
                    --gray-800: #1e293b;
                    --gray-900: #0f172a;

                    min-height: calc(100vh - 60px);
                    background: linear-gradient(180deg, var(--gray-50) 0%, #e2e8f0 100%);
                }

                /* Header Styles */
                .account-header {
                    position: relative;
                    padding: 2.5rem 0;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }

                .header-background {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, var(--secondary) 100%);
                    opacity: 0.97;
                }

                .header-background::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .header-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .account-avatar {
                    width: 72px;
                    height: 72px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.85rem;
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.25);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .account-avatar:hover {
                    transform: scale(1.05);
                    border-color: rgba(255, 255, 255, 0.4);
                }

                .header-info {
                    color: white;
                }

                .account-title {
                    font-size: 1.85rem;
                    font-weight: 700;
                    margin: 0 0 0.35rem 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .account-subtitle {
                    margin: 0;
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.85);
                }

                .btn-back {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.75rem 1.5rem;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    color: white;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-decoration: none;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    transition: all 0.3s ease;
                }

                .btn-back:hover {
                    background: rgba(255, 255, 255, 0.25);
                    color: white;
                    text-decoration: none;
                    transform: translateY(-2px);
                }

                /* Quick Info Row */
                .quick-info-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                    margin-bottom: 1.75rem;
                }

                .info-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
                    border: 1px solid var(--gray-100);
                    transition: all 0.3s ease;
                }

                .info-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
                }

                .info-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .info-icon.security {
                    background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
                    color: white;
                }

                .info-icon.encryption {
                    background: linear-gradient(135deg, var(--info) 0%, #0284c7 100%);
                    color: white;
                }

                .info-icon.account {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                }

                .info-details {
                    display: flex;
                    flex-direction: column;
                }

                .info-label {
                    font-size: 0.8rem;
                    color: var(--gray-500);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-size: 1.05rem;
                    color: var(--gray-800);
                    font-weight: 700;
                }

                .info-value.capitalize {
                    text-transform: capitalize;
                }

                /* Main Settings Card */
                .settings-main-card {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06);
                    border: 1px solid var(--gray-100);
                    overflow: hidden;
                }

                .settings-section {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid var(--gray-100);
                }

                .settings-section:last-of-type {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .section-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .section-icon.personal {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                }

                .section-icon.security {
                    background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
                    color: white;
                }

                .section-title-group {
                    flex: 1;
                }

                .section-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: var(--gray-800);
                    margin: 0 0 0.25rem 0;
                }

                .section-description {
                    font-size: 0.875rem;
                    color: var(--gray-500);
                    margin: 0;
                }

                /* Form Wrapper */
                .settings-form-wrapper {
                    padding: 0 2rem 2rem 2rem;
                }

                /* Card Footer */
                .settings-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 2rem;
                    background: linear-gradient(180deg, var(--gray-50) 0%, var(--gray-100) 100%);
                    border-top: 1px solid var(--gray-200);
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .footer-left {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .footer-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .security-badges {
                    display: flex;
                    gap: 0.75rem;
                }

                .security-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.5rem 0.85rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .security-badge.success {
                    background: #d1fae5;
                    color: #059669;
                }

                .security-badge.info {
                    background: #dbeafe;
                    color: #0284c7;
                }

                .security-badge i {
                    font-size: 0.75rem;
                }

                .unsaved-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #fef3c7;
                    color: #d97706;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    animation: pulse-subtle 2s infinite;
                }

                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .save-success-message {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #d1fae5;
                    color: #059669;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .btn-save {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.85rem 2rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(13, 148, 136, 0.3);
                }

                .btn-save:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(13, 148, 136, 0.4);
                }

                .btn-save:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-save.loading {
                    background: linear-gradient(135deg, var(--gray-400) 0%, var(--gray-500) 100%);
                }

                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Info Tip Card */
                .info-tip-card {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    gap: 1.25rem;
                    margin-top: 1.75rem;
                    border: 1px solid #fcd34d;
                }

                .tip-icon {
                    width: 48px;
                    height: 48px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.35rem;
                    color: #d97706;
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
                }

                .tip-content h4 {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #92400e;
                    margin: 0 0 0.75rem 0;
                }

                .tip-content ul {
                    margin: 0;
                    padding-left: 1.25rem;
                }

                .tip-content li {
                    font-size: 0.9rem;
                    color: #78350f;
                    margin-bottom: 0.35rem;
                    line-height: 1.5;
                }

                .tip-content li:last-child {
                    margin-bottom: 0;
                }

                /* Account Content */
                .account-content {
                    padding: 0 0 2.5rem 0;
                }

                /* Responsive Design */
                @media (max-width: 992px) {
                    .quick-info-row {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .quick-info-row .info-card:last-child {
                        grid-column: span 2;
                        max-width: 50%;
                        margin: 0 auto;
                    }
                }

                @media (max-width: 768px) {
                    .account-header {
                        padding: 1.75rem 0;
                    }

                    .header-content {
                        flex-direction: column;
                        text-align: center;
                    }

                    .header-left {
                        flex-direction: column;
                    }

                    .account-title {
                        font-size: 1.5rem;
                    }

                    .btn-back {
                        width: 100%;
                        justify-content: center;
                    }

                    .quick-info-row {
                        grid-template-columns: 1fr;
                    }

                    .quick-info-row .info-card:last-child {
                        grid-column: span 1;
                        max-width: 100%;
                    }

                    .settings-section {
                        padding: 1.25rem 1.25rem;
                    }

                    .settings-form-wrapper {
                        padding: 0 1.25rem 1.25rem 1.25rem;
                    }

                    .settings-card-footer {
                        flex-direction: column;
                        padding: 1.25rem;
                    }

                    .footer-left {
                        width: 100%;
                        justify-content: center;
                        flex-direction: column;
                    }

                    .footer-right {
                        width: 100%;
                        flex-direction: column;
                    }

                    .btn-save {
                        width: 100%;
                        justify-content: center;
                    }

                    .security-badges {
                        justify-content: center;
                    }

                    .info-tip-card {
                        flex-direction: column;
                        text-align: center;
                    }

                    .tip-icon {
                        margin: 0 auto;
                    }

                    .tip-content ul {
                        text-align: left;
                    }
                }

                @media (max-width: 480px) {
                    .account-avatar {
                        width: 60px;
                        height: 60px;
                        font-size: 1.5rem;
                    }

                    .account-title {
                        font-size: 1.35rem;
                    }

                    .info-card {
                        padding: 1rem;
                    }

                    .info-icon {
                        width: 44px;
                        height: 44px;
                        font-size: 1.1rem;
                    }

                    .section-icon {
                        width: 42px;
                        height: 42px;
                        font-size: 1rem;
                    }

                    .section-title {
                        font-size: 1rem;
                    }

                    .security-badges {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Edit;
