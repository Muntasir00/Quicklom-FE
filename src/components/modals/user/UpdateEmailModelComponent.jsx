import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { sendVerificationTokenService, updateAccountEmail } from "@services/user/AccountService"

const UpdateEmailModelComponent = ({ show, setShow, setValue }) => {
    const [accountData, setAccountData] = React.useState({ email: "", token: null });

    return (
        <>
            <Modal show={show} size="md" onHide={() => setShow(false)} centered>
                <div className="modern-modal">
                    <Modal.Header className="modern-modal-header">
                        <div className="modal-header-content">
                            <div className="modal-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div>
                                <Modal.Title className="modal-title-modern">
                                    Update Email Address
                                </Modal.Title>
                                <p className="modal-subtitle">Verify your new email to continue</p>
                            </div>
                        </div>
                        <button type="button" className="close-button-modern" onClick={() => {setShow(false); setAccountData({ email: "", token: null });}}>
                            <i className="fas fa-times"></i>
                        </button>
                    </Modal.Header>
                    <Modal.Body className="modern-modal-body">
                        <div className="info-box">
                            <div className="info-box-icon">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <div className="info-box-text">
                                <strong>Verification Process:</strong> Click "Send Code" to receive a verification code at your new email address. Enter the code below to confirm the change.
                            </div>
                        </div>

                        <form>
                            <div className="form-group-modern">
                                <label className="label-modern">
                                    <i className="fas fa-at mr-2"></i>
                                    New Email Address
                                    <span className="badge-required">Required</span>
                                </label>
                                <div className="input-with-action">
                                    <input
                                        onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                                        name="email"
                                        value={accountData.email}
                                        type="email"
                                        className="input-modern"
                                        placeholder="your.new.email@example.com"
                                    />
                                    <button
                                        onClick={() => {sendVerificationTokenService({email: accountData.email});}}
                                        className="btn-verify-modern"
                                        type="button"
                                    >
                                        <i className="fas fa-paper-plane mr-2"></i>
                                        Send Code
                                    </button>
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <label className="label-modern">
                                    <i className="fas fa-key mr-2"></i>
                                    Verification Code
                                    <span className="badge-required">Required</span>
                                </label>
                                <input
                                    onChange={(e) => setAccountData({ ...accountData, token: e.target.value })}
                                    name="token"
                                    value={accountData.token}
                                    type="number"
                                    className="input-modern"
                                    placeholder="Enter 6-digit code from email"
                                />
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer className="modern-modal-footer">
                        <button
                            className="btn-cancel-modern"
                            onClick={() => {setShow(false); setAccountData({ email: "", token: null })}}
                        >
                            <i className="fas fa-times mr-2"></i>
                            Cancel
                        </button>
                        <button
                            className="btn-submit-modern"
                            onClick={ async() => {
                                setShow(false);
                                const status = await updateAccountEmail(accountData)
                                if (!status) return
                                setValue("email", accountData.email);
                                setAccountData({ email: "", token: null });
                            }}
                        >
                            <i className="fas fa-check-circle mr-2"></i>
                            Update Email
                        </button>
                    </Modal.Footer>
                </div>
            </Modal>

            <style>{`
                .modern-modal .modal-content {
                    border: none;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .modern-modal-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    padding: 1.5rem;
                }

                .modal-header-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                }

                .modal-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.3rem;
                }

                .modal-title-modern {
                    color: white !important;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                }

                .modal-subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.85rem;
                    margin: 0.25rem 0 0 0;
                }

                .close-button-modern {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    color: white;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-button-modern:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .modern-modal-body {
                    padding: 1.5rem;
                }

                .info-box {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    border-left: 4px solid #3b82f6;
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    gap: 0.75rem;
                }

                .info-box-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #3b82f6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.95rem;
                    flex-shrink: 0;
                }

                .info-box-text {
                    color: #1e40af;
                    font-size: 0.85rem;
                    line-height: 1.5;
                }

                .form-group-modern {
                    margin-bottom: 1.25rem;
                }

                .label-modern {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .label-modern i {
                    color: #9ca3af;
                }

                .badge-required {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    font-size: 0.65rem;
                    padding: 0.15rem 0.45rem;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .input-modern {
                    width: 100%;
                    padding: 0.65rem 0.9rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .input-modern:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .input-with-action {
                    display: flex;
                    gap: 0.5rem;
                }

                .input-with-action .input-modern {
                    flex: 1;
                }

                .btn-verify-modern {
                    padding: 0.65rem 1rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .btn-verify-modern:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
                }

                .modern-modal-footer {
                    background: #f9fafb;
                    border: none;
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }

                .btn-cancel-modern {
                    padding: 0.6rem 1.25rem;
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-cancel-modern:hover {
                    background: #e5e7eb;
                }

                .btn-submit-modern {
                    padding: 0.6rem 1.25rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
                }

                .btn-submit-modern:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
                }
            `}</style>
        </>
    );
};

export default UpdateEmailModelComponent;
