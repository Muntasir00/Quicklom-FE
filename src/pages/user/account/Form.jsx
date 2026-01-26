import React, { useState } from "react";

const Form = ({ register, errors, setShow = () => {} }) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <form className="account-form">
            {/* Personal Information Section */}
            <div className="form-section">
                <div className="section-divider">
                    <div className="divider-icon">
                        <i className="fas fa-user"></i>
                    </div>
                    <span className="divider-text">Basic Information</span>
                    <div className="divider-line"></div>
                </div>

                <div className="row">
                    <div className="col-lg-6 col-md-6">
                        <div className="form-field">
                            <label className="field-label" htmlFor="email">
                                <div className="label-content">
                                    <i className="fas fa-envelope"></i>
                                    <span>Email Address</span>
                                </div>
                                <span className="badge required">Required</span>
                            </label>
                            <div className="input-group-custom">
                                <div className="input-icon">
                                    <i className="fas fa-at"></i>
                                </div>
                                <input
                                    readOnly
                                    type="email"
                                    id="email"
                                    className={`form-input readonly ${errors.email ? 'has-error' : ''}`}
                                    placeholder="your.email@example.com"
                                    {...register("email")}
                                />
                                <button
                                    onClick={() => setShow(true)}
                                    className="input-action-btn"
                                    type="button"
                                    title="Change Email"
                                >
                                    <i className="fas fa-pen"></i>
                                    <span>Change</span>
                                </button>
                            </div>
                            {errors.email && (
                                <div className="field-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{errors.email.message}</span>
                                </div>
                            )}
                            <div className="field-hint">
                                <i className="fas fa-info-circle"></i>
                                <span>Click "Change" to update your email address</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-6">
                        <div className="form-field">
                            <label className="field-label" htmlFor="name">
                                <div className="label-content">
                                    <i className="fas fa-id-badge"></i>
                                    <span>Full Name</span>
                                </div>
                                <span className="badge required">Required</span>
                            </label>
                            <div className="input-group-custom">
                                <div className="input-icon">
                                    <i className="fas fa-user"></i>
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    className={`form-input ${errors.name ? 'has-error' : ''}`}
                                    placeholder="Enter your full name"
                                    {...register("name")}
                                />
                            </div>
                            {errors.name && (
                                <div className="field-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{errors.name.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="form-section">
                <div className="section-divider">
                    <div className="divider-icon security">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <span className="divider-text">Security & Password</span>
                    <div className="divider-line"></div>
                </div>

                <div className="security-notice">
                    <div className="notice-icon">
                        <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="notice-content">
                        <strong>Password Change</strong>
                        <p>Enter your current password to verify your identity. Leave the new password fields empty if you don't want to change it.</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="form-field">
                            <label className="field-label" htmlFor="current_password">
                                <div className="label-content">
                                    <i className="fas fa-key"></i>
                                    <span>Current Password</span>
                                </div>
                                <span className="badge required">Required</span>
                            </label>
                            <div className="input-group-custom">
                                <div className="input-icon">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <input
                                    {...register("current_password")}
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="current_password"
                                    id="current_password"
                                    className={`form-input ${errors.current_password ? 'has-error' : ''}`}
                                    placeholder="Enter your current password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    title={showCurrentPassword ? "Hide password" : "Show password"}
                                >
                                    <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                            {errors.current_password && (
                                <div className="field-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{errors.current_password.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="password-change-section">
                    <div className="password-section-header">
                        <i className="fas fa-sync-alt"></i>
                        <span>Change Password (Optional)</span>
                    </div>

                    <div className="row">
                        <div className="col-lg-6 col-md-6">
                            <div className="form-field">
                                <label className="field-label" htmlFor="password">
                                    <div className="label-content">
                                        <i className="fas fa-lock"></i>
                                        <span>New Password</span>
                                    </div>
                                    <span className="badge optional">Optional</span>
                                </label>
                                <div className="input-group-custom">
                                    <div className="input-icon">
                                        <i className="fas fa-key"></i>
                                    </div>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        id="password"
                                        className={`form-input ${errors.password ? 'has-error' : ''}`}
                                        placeholder="Enter new password"
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        title={showNewPassword ? "Hide password" : "Show password"}
                                    >
                                        <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="field-error">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <span>{errors.password.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-6">
                            <div className="form-field">
                                <label className="field-label" htmlFor="confirm_password">
                                    <div className="label-content">
                                        <i className="fas fa-check-double"></i>
                                        <span>Confirm New Password</span>
                                    </div>
                                    <span className="badge optional">Optional</span>
                                </label>
                                <div className="input-group-custom">
                                    <div className="input-icon">
                                        <i className="fas fa-key"></i>
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirm_password"
                                        className={`form-input ${errors.confirm_password ? 'has-error' : ''}`}
                                        placeholder="Confirm new password"
                                        {...register("confirm_password")}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        title={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.confirm_password && (
                                    <div className="field-error">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <span>{errors.confirm_password.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Form Base Styles */
                .account-form {
                    --primary: #0d9488;
                    --primary-dark: #0f766e;
                    --primary-light: #14b8a6;
                    --secondary: #6366f1;
                    --secondary-dark: #4f46e5;
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
                }

                /* Form Section */
                .form-section {
                    margin-bottom: 2rem;
                }

                .form-section:last-child {
                    margin-bottom: 0;
                }

                /* Section Divider */
                .section-divider {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.75rem;
                }

                .divider-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1rem;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }

                .divider-icon.security {
                    background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
                }

                .divider-text {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--gray-800);
                    white-space: nowrap;
                }

                .divider-line {
                    flex: 1;
                    height: 2px;
                    background: linear-gradient(90deg, var(--gray-200) 0%, transparent 100%);
                    border-radius: 1px;
                }

                /* Form Field */
                .form-field {
                    margin-bottom: 1.5rem;
                }

                .field-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.65rem;
                }

                .label-content {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: var(--gray-700);
                }

                .label-content i {
                    color: var(--gray-400);
                    font-size: 0.9rem;
                    width: 18px;
                    text-align: center;
                }

                /* Badges */
                .badge {
                    font-size: 0.7rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .badge.required {
                    background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);
                    color: white;
                }

                .badge.optional {
                    background: var(--gray-100);
                    color: var(--gray-500);
                    border: 1px solid var(--gray-200);
                }

                /* Input Group */
                .input-group-custom {
                    display: flex;
                    align-items: stretch;
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gray-400);
                    font-size: 0.95rem;
                    pointer-events: none;
                    z-index: 1;
                }

                .form-input {
                    flex: 1;
                    padding: 0.85rem 1rem 0.85rem 48px;
                    border: 2px solid var(--gray-200);
                    border-radius: 12px;
                    font-size: 0.95rem;
                    color: var(--gray-800);
                    background: white;
                    transition: all 0.25s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
                }

                .form-input:focus + .input-icon,
                .form-input:focus ~ .input-icon {
                    color: var(--primary);
                }

                .form-input.readonly {
                    background: var(--gray-50);
                    color: var(--gray-600);
                    cursor: not-allowed;
                }

                .form-input.has-error {
                    border-color: var(--danger);
                    background: #fef2f2;
                }

                .form-input.has-error:focus {
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
                }

                .form-input::placeholder {
                    color: var(--gray-400);
                }

                /* Input Action Button */
                .input-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0 1.25rem;
                    margin-left: 0.75rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                    white-space: nowrap;
                }

                .input-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(13, 148, 136, 0.35);
                }

                .input-action-btn i {
                    font-size: 0.8rem;
                }

                /* Password Toggle */
                .password-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--gray-400);
                    cursor: pointer;
                    padding: 0.5rem;
                    transition: color 0.2s ease;
                    z-index: 2;
                }

                .password-toggle:hover {
                    color: var(--primary);
                }

                .input-group-custom:has(.password-toggle) .form-input {
                    padding-right: 48px;
                }

                /* Field Error */
                .field-error {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    background: #fef2f2;
                    border-radius: 8px;
                    border-left: 3px solid var(--danger);
                }

                .field-error i {
                    color: var(--danger);
                    font-size: 0.85rem;
                }

                .field-error span {
                    color: #b91c1c;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                /* Field Hint */
                .field-hint {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    font-size: 0.825rem;
                    color: var(--gray-500);
                }

                .field-hint i {
                    color: var(--info);
                    font-size: 0.8rem;
                }

                /* Security Notice */
                .security-notice {
                    display: flex;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    border-radius: 14px;
                    margin-bottom: 1.75rem;
                    border: 1px solid #bfdbfe;
                }

                .notice-icon {
                    width: 44px;
                    height: 44px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--info);
                    font-size: 1.25rem;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                }

                .notice-content strong {
                    display: block;
                    font-size: 0.95rem;
                    color: #1e40af;
                    margin-bottom: 0.35rem;
                }

                .notice-content p {
                    margin: 0;
                    font-size: 0.875rem;
                    color: #1e3a8a;
                    line-height: 1.5;
                }

                /* Password Change Section */
                .password-change-section {
                    background: var(--gray-50);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-top: 1.5rem;
                    border: 1px solid var(--gray-200);
                }

                .password-section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--gray-600);
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px dashed var(--gray-300);
                }

                .password-section-header i {
                    color: var(--primary);
                }

                .password-change-section .form-field:last-child {
                    margin-bottom: 0;
                }

                /* Responsive Styles */
                @media (max-width: 768px) {
                    .section-divider {
                        margin-bottom: 1.5rem;
                    }

                    .divider-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 0.9rem;
                    }

                    .divider-text {
                        font-size: 0.95rem;
                    }

                    .form-input {
                        padding: 0.75rem 0.85rem 0.75rem 44px;
                        font-size: 0.9rem;
                    }

                    .input-icon {
                        width: 44px;
                    }

                    .input-action-btn {
                        padding: 0 1rem;
                        font-size: 0.8rem;
                    }

                    .input-action-btn span {
                        display: none;
                    }

                    .security-notice {
                        flex-direction: column;
                        text-align: center;
                        padding: 1rem;
                    }

                    .notice-icon {
                        margin: 0 auto;
                    }

                    .password-change-section {
                        padding: 1.25rem;
                    }
                }

                @media (max-width: 480px) {
                    .field-label {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .label-content {
                        font-size: 0.9rem;
                    }

                    .form-field {
                        margin-bottom: 1.25rem;
                    }
                }
            `}</style>
        </form>
    );
};

export default Form;
