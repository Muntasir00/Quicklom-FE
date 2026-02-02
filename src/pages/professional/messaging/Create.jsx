import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Chat from '@components/messaging/Chat';
import { useCreateMessaging } from "@hooks/professional/messaging/useCreateMessaging";
import MessagingForm from "@components/forms/MessagingForm";
import ContactsSidebar from "@components/messaging/ContactsSidebar";
import ContractDetailsModal from "@components/messaging/ContractDetailsModal";
import "./MessagingStyles.css";

const Create = () => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        menu,
        FORM_ID,
        action,
        menuLink,
        messages,
        allMessages,
        SESSION_USER_ID,
        contacts,
        SESSION_USER_ROLE,
        setValue,
        watch,
        uploadedFile,
        setUploadedFile,
    } = useCreateMessaging();

    const { id: receiver_id } = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);
    const [showAllContracts, setShowAllContracts] = useState(false);
    const [showContactInfo, setShowContactInfo] = useState(false);

    // Find current contact
    const currentContact = contacts.find(c => {
        if (c.admins) return false;
        return c.user_id == receiver_id || c.user?.id == receiver_id;
    });

    // Extract user and contracts
    const currentUser = currentContact?.user;
    const allContracts = currentContact?.contracts || [];
    const activeContracts = allContracts.filter(c => c.contract_status);

    const getContactType = (user) => {
        if (!user) return null;
        if (user.institute_category) return user.institute_category.name;
        if (user.professional_role) return user.professional_role.name;
        if (user.professional_category) return user.professional_category.name;
        if (user.role) return user.role.name;
        return null;
    };

    const getContactTypeIcon = (user) => {
        if (!user) return "fa-user";
        const categoryName = user.institute_category?.name?.toLowerCase();
        const professionalCategoryName = user.professional_category?.name?.toLowerCase();
        if (categoryName?.includes("clinic") || categoryName?.includes("practice")) return "fa-clinic-medical";
        if (categoryName?.includes("pharmacy")) return "fa-pills";
        if (categoryName?.includes("agency") || categoryName?.includes("headhunter")) return "fa-user-tie";
        if (professionalCategoryName?.includes("nursing") || professionalCategoryName?.includes("home care")) return "fa-user-nurse";
        if (professionalCategoryName?.includes("medicine") || professionalCategoryName?.includes("general medicine")) return "fa-user-md";
        if (professionalCategoryName?.includes("dental")) return "fa-tooth";
        if (professionalCategoryName?.includes("pharmacy")) return "fa-prescription-bottle";
        return "fa-user";
    };

    return (
        <div className=" messaging-page-wrapper">
            <div className="messaging-container-fullpage">
                <div className="messaging-layout">
                    {/* Left Sidebar - Contacts */}
                    <ContactsSidebar
                        contacts={contacts}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        SESSION_USER_ROLE={SESSION_USER_ROLE}
                        SESSION_USER_ID={SESSION_USER_ID}
                        setValue={setValue}
                        currentReceiverId={receiver_id}
                        messages={allMessages}
                    />

                    {/* Right Panel - Chat Area */}
                    <div className="chat-panel">
                        {receiver_id ? (
                            <>
                                {/* Chat Header with Contract Info */}
                                <div className="chat-header">
                                    <div className="d-flex flex-column flex-grow-1">
                                        <div className="d-flex align-items-center w-100">
                                            <img
                                                src="/assets/dist/img/user.png"
                                                alt="Avatar"
                                                className="chat-header-avatar"
                                            />
                                            <div className="chat-header-info flex-grow-1">
                                                <h5 className="mb-0">{currentUser?.name || "Contact"}</h5>
                                                {getContactType(currentUser) && (
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        marginTop: '4px'
                                                    }}>
                                                        <i className={`fas ${getContactTypeIcon(currentUser)}`} style={{ fontSize: '10px', color: 'white' }}></i>
                                                        <small style={{ color: 'white', fontSize: '11px' }}>{getContactType(currentUser)}</small>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="chat-header-actions ml-auto">
                                                <span className="badge badge-info mr-2">
                                                    {watch('subject') || "General"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowContactInfo(true)}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '8px',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                                                    title="View contact details"
                                                >
                                                    <i className="fas fa-info-circle"></i>
                                                    Info
                                                </button>
                                            </div>
                                        </div>

                                        {/* Contract Pills */}
                                        {activeContracts && activeContracts.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                                {(showAllContracts ? activeContracts : activeContracts.slice(0, 3)).map((contract, index) => {
                                                    const isBooked = contract.contract_status?.toLowerCase() === 'booked';
                                                    const isPendingSignature = contract.contract_status?.toLowerCase() === 'pending_signature';
                                                    const baseColor = isBooked ? 'rgba(59, 130, 246, 0.3)' : isPendingSignature ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.25)';
                                                    const hoverColor = isBooked ? 'rgba(59, 130, 246, 0.5)' : isPendingSignature ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.4)';
                                                    const borderColor = isBooked ? 'rgba(59, 130, 246, 0.6)' : isPendingSignature ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255, 255, 255, 0.4)';

                                                    return (
                                                        <button
                                                            key={contract.contract_id || index}
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedContract(contract); }}
                                                            title={`Click to view contract details${isBooked ? ' (Booked)' : isPendingSignature ? ' (Pending Signature)' : ''}`}
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                background: baseColor, color: 'white', border: `1px solid ${borderColor}`,
                                                                borderRadius: '12px', padding: '6px 14px', fontSize: '12px', fontWeight: '500',
                                                                cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none', whiteSpace: 'nowrap'
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = hoverColor; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = baseColor; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                        >
                                                            <i className="fas fa-file-contract" style={{ fontSize: '10px' }}></i>
                                                            <span>#{contract.contract_id} - {contract.contract_name ? (contract.contract_name.length > 25 ? contract.contract_name.substring(0, 25) + "..." : contract.contract_name) : "Contract"}</span>
                                                        </button>
                                                    );
                                                })}
                                                {activeContracts.length > 3 && !showAllContracts && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllContracts(true); }}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                            background: 'rgba(255, 255, 255, 0.2)', color: 'white',
                                                            border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px',
                                                            padding: '6px 14px', fontSize: '12px', fontWeight: '500',
                                                            cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                    >
                                                        <i className="fas fa-ellipsis-h" style={{ fontSize: '10px' }}></i>
                                                        <span>+{activeContracts.length - 3} more</span>
                                                    </button>
                                                )}
                                                {showAllContracts && activeContracts.length > 3 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllContracts(false); }}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                            background: 'rgba(255, 255, 255, 0.2)', color: 'white',
                                                            border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px',
                                                            padding: '6px 14px', fontSize: '12px', fontWeight: '500',
                                                            cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                    >
                                                        <i className="fas fa-minus" style={{ fontSize: '10px' }}></i>
                                                        <span>Show less</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="chat-messages-wrapper">
                                    <Chat messages={messages} sessionUserId={SESSION_USER_ID} />
                                </div>

                                {/* Chat Footer - Input */}
                                <div className="chat-footer">
                                    <MessagingForm
                                        formId={FORM_ID}
                                        handleSubmit={handleSubmit}
                                        onSubmit={onSubmit}
                                        register={register}
                                        errors={errors}
                                        uploadedFile={uploadedFile}
                                        setUploadedFile={setUploadedFile}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="no-chat-selected">
                                <div className="text-center text-muted">
                                    <i className="fas fa-comments fa-5x mb-3 opacity-50"></i>
                                    <h4>QuickLocum Messaging</h4>
                                    <p>Select a contact to start messaging</p>
                                    <div className="mt-3">
                                        <small className="text-muted">
                                            <i className="fas fa-file-contract mr-2"></i>
                                            Conversations are linked to contracts
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Info Modal */}
            {showContactInfo && currentUser && (
                <div className="contract-modal-overlay" onClick={() => setShowContactInfo(false)}>
                    <div className="contract-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="contract-modal-header">
                            <div className="contract-header-left">
                                <div className="contract-modal-icon">
                                    <i className="fas fa-address-card"></i>
                                </div>
                                <div>
                                    <h5 className="contract-modal-title">Contact Information</h5>
                                    <small className="contract-modal-subtitle">{currentUser.name}</small>
                                </div>
                            </div>
                            <button className="contract-modal-close" onClick={() => setShowContactInfo(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="contract-modal-body">
                            <div className="contract-detail-row">
                                <div className="contract-detail-label"><i className="fas fa-tag mr-2"></i>Type</div>
                                <div className="contract-detail-value">{currentUser.institute_category?.name || currentUser.professional_category?.name || currentUser.role?.name || "User"}</div>
                            </div>
                            <div className="contract-detail-row">
                                <div className="contract-detail-label"><i className="fas fa-envelope mr-2"></i>Email</div>
                                <div className="contract-detail-value"><a href={`mailto:${currentUser.email}`} style={{ color: '#6366f1' }}>{currentUser.email}</a></div>
                            </div>
                            <div className="contract-detail-row">
                                <div className="contract-detail-label"><i className="fas fa-circle mr-2"></i>Status</div>
                                <div className="contract-detail-value"><span className={`badge ${currentUser.status ? 'badge-success' : 'badge-secondary'}`}>{currentUser.status ? 'Active' : 'Inactive'}</span></div>
                            </div>
                            <div className="contract-detail-row">
                                <div className="contract-detail-label"><i className="fas fa-calendar mr-2"></i>Member Since</div>
                                <div className="contract-detail-value">{new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            {activeContracts && activeContracts.length > 0 && (
                                <div className="contract-detail-row">
                                    <div className="contract-detail-label"><i className="fas fa-file-contract mr-2"></i>Active Contracts</div>
                                    <div className="contract-detail-value"><span className="badge badge-primary">{activeContracts.length}</span></div>
                                </div>
                            )}
                        </div>
                        <div className="contract-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowContactInfo(false)}>
                                <i className="fas fa-times mr-2"></i>Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contract Details Modal */}
            {selectedContract && (
                <ContractDetailsModal contract={selectedContract} onClose={() => setSelectedContract(null)} />
            )}
        </div>
    );
}

export default Create;
