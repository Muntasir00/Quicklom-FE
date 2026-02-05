import React, {useState} from "react";
import {useParams} from "react-router-dom";
import Chat from '@components/messaging/Chat';
import {useCreateMessaging} from "@hooks/institute/messaging/useCreateMessaging";
import MessagingForm from "@components/forms/MessagingForm";
import ContactsSidebar from "@components/messaging/ContactsSidebar";
import ContractDetailsModal from "@components/messaging/ContractDetailsModal";
import {Avatar, AvatarFallback, AvatarImage} from "@components/ui/avatar.jsx";

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

    const {id: receiver_id} = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);
    const [showAllContracts, setShowAllContracts] = useState(false);
    const [showContracts, setShowContracts] = useState(false);

    // Find current contact
    const currentContact = contacts.find(c => {
        if (c.admins) return false;
        return c.user_id == receiver_id || c.user?.id == receiver_id;
    });

    // Extract user and contracts
    const currentUser = currentContact?.user;
    const allContracts = currentContact?.contracts || [];
    const activeContracts = allContracts.filter(c => c.contract_status);

    // Get current user's institute category
    const instituteCategory = sessionStorage.getItem('institute_category_id');
    const isHeadhunterOrAgency = instituteCategory === '3' || instituteCategory === '4';

    // Helper to get industry from contract_type_id
    const getContractIndustry = (contract_type_id) => {
        const industryMap = {
            1: 'Dental Care',
            2: 'Pharmacy',
            3: 'General Practice',
            4: 'General Practice',
            5: 'Nursing',
            6: 'Nursing',
            7: 'Dental Care',
            8: 'Pharmacy',
            9: 'Dental Care',
        };
        return industryMap[contract_type_id] || 'Healthcare';
    };

    // Helper to get industry color
    const getIndustryColor = (industry) => {
        const colorMap = {
            'Dental Care': {
                base: 'rgba(139, 92, 246, 0.3)',
                hover: 'rgba(139, 92, 246, 0.5)',
                border: 'rgba(139, 92, 246, 0.6)'
            },
            'Pharmacy': {
                base: 'rgba(34, 197, 94, 0.3)',
                hover: 'rgba(34, 197, 94, 0.5)',
                border: 'rgba(34, 197, 94, 0.6)'
            },
            'General Practice': {
                base: 'rgba(239, 68, 68, 0.3)',
                hover: 'rgba(239, 68, 68, 0.5)',
                border: 'rgba(239, 68, 68, 0.6)'
            },
            'Nursing': {
                base: 'rgba(236, 72, 153, 0.3)',
                hover: 'rgba(236, 72, 153, 0.5)',
                border: 'rgba(236, 72, 153, 0.6)'
            },
            'Healthcare': {
                base: 'rgba(148, 163, 184, 0.3)',
                hover: 'rgba(148, 163, 184, 0.5)',
                border: 'rgba(148, 163, 184, 0.6)'
            }
        };
        return colorMap[industry] || colorMap['Healthcare'];
    };

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
        <>
            <style>{`
                /* Healthcare Messaging Theme */
                .messaging-fullpage {
                    position: fixed;
                    top: 60px;
                    left: 250px;
                    right: 0;
                    bottom: 60px;
                    display: flex;
                    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                    z-index: 100;
                    overflow: hidden;
                }

                @media (max-width: 991.98px) {
                    .messaging-fullpage {
                        left: 0;
                    }
                }

                body.sidebar-collapse .messaging-fullpage {
                    left: 4.6rem;
                }

                /* Contacts Sidebar Overrides */
                .messaging-fullpage .contacts-sidebar {
                    width: 340px;
                    min-width: 340px;
                    background: white;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.03);
                }

                .messaging-fullpage .contacts-header {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%);
                    padding: 20px;
                    flex-shrink: 0;
                    position: relative;
                    overflow: hidden;
                }

                .messaging-fullpage .contacts-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .messaging-fullpage .contacts-header h5 {
                    color: white;
                    margin: 0;
                    font-size: 1.15rem;
                    font-weight: 700;
                    position: relative;
                    z-index: 1;
                }

                .messaging-fullpage .filter-pills {
                    background: #f8fafc;
                    padding: 12px 16px;
                    gap: 6px;
                    flex-shrink: 0;
                    border-bottom: 1px solid #e2e8f0;
                }

                .messaging-fullpage .filter-pill {
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border: 1px solid #e2e8f0;
                    background: white;
                    transition: all 0.2s ease;
                }

                .messaging-fullpage .filter-pill:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }

                .messaging-fullpage .filter-pill.active {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    border-color: transparent;
                    color: white;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                }

                .messaging-fullpage .contacts-search {
                    padding: 12px 16px;
                    flex-shrink: 0;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                }

                .messaging-fullpage .search-input {
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    padding: 10px 16px 10px 42px;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                }

                .messaging-fullpage .search-input:focus {
                    border-color: #0d9488;
                    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
                }

                .messaging-fullpage .contacts-list-wrapper {
                    flex: 1;
                    overflow-y: auto;
                }

                .messaging-fullpage .contacts-list-wrapper::-webkit-scrollbar {
                    width: 6px;
                }

                .messaging-fullpage .contacts-list-wrapper::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .messaging-fullpage .contacts-list-wrapper::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .messaging-fullpage .contact-item {
                    padding: 14px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    transition: all 0.15s ease;
                }

                .messaging-fullpage .contact-item:hover {
                    background: #f8fafc;
                }

                .messaging-fullpage .contact-item.active {
                    background: linear-gradient(90deg, rgba(13, 148, 136, 0.08) 0%, rgba(13, 148, 136, 0.02) 100%);
                    border-left: 3px solid #0d9488;
                    padding-left: 13px;
                }

                .messaging-fullpage .contact-item.support-contact.active {
                    border-left-color: #f59e0b;
                    background: linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%);
                }

                .messaging-fullpage .unread-badge {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .messaging-fullpage .support-avatar {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 14px;
                }

                .messaging-fullpage .contact-avatar {
                    border-radius: 14px;
                    border: 2px solid #e2e8f0;
                }

                /* Chat Panel */
                .messaging-chat-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #f8fafc;
                    min-width: 0;
                    height: 100%;
                    overflow: hidden;
                }

                .messaging-chat-header {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%);
                    padding: 20px 24px;
                    color: white;
                    flex-shrink: 0;
                    position: relative;
                    overflow: hidden;
                }

                .messaging-chat-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .messaging-chat-header-top {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    position: relative;
                    z-index: 1;
                }

                .messaging-chat-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    border: 3px solid rgba(255,255,255,0.25);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    object-fit: cover;
                }

                .messaging-chat-info {
                    flex: 1;
                }

                .messaging-chat-info h4 {
                    margin: 0 0 6px 0;
                    font-size: 1.15rem;
                    font-weight: 700;
                }

                .messaging-chat-type {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .messaging-chat-subject {
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .messaging-contract-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 16px;
                    position: relative;
                    z-index: 1;
                }

                .messaging-contract-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    border: 1px solid;
                    color: white;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                }

                .messaging-contract-pill:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                    background: rgba(255, 255, 255, 0.25);
                }

                .messaging-contract-pill i {
                    font-size: 0.7rem;
                }

                /* Messages Area */
                .messaging-messages-area {
                    flex: 1 1 0;
                    overflow-y: auto;
                    padding: 24px 20px;
                    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                    min-height: 0;
                }

                .messaging-messages-area::-webkit-scrollbar {
                    width: 6px;
                }

                .messaging-messages-area::-webkit-scrollbar-track {
                    background: transparent;
                }

                .messaging-messages-area::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .messaging-messages-area .chat-messages-container {
                    width: 100%;
                    max-width: 100%;
                    margin: 0;
                }

                .messaging-messages-area .message-wrapper {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: flex-end;
                    gap: 10px;
                }

                .messaging-messages-area .message-wrapper.sent {
                    justify-content: flex-start !important;
                    margin-right: auto;
                    margin-left: 0;
                }

                .messaging-messages-area .message-wrapper.received {
                    justify-content: flex-end !important;
                    margin-left: auto;
                    margin-right: 0;
                }

                .messaging-messages-area .message-content-wrapper {
                    max-width: 65%;
                    display: flex;
                    flex-direction: column;
                }

                .messaging-messages-area .message-wrapper.sent .message-content-wrapper {
                    align-items: flex-start;
                }

                .messaging-messages-area .message-wrapper.received .message-content-wrapper {
                    align-items: flex-end;
                }

                .messaging-messages-area .message-avatar {
                    display: none !important;
                }

                .messaging-messages-area .message-bubble {
                    padding: 14px 18px;
                    max-width: 100%;
                    word-wrap: break-word;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .messaging-messages-area .message-bubble.sent {
                    background: white;
                    color: #1e293b;
                    border-radius: 20px 20px 20px 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    border: 1px solid #e2e8f0;
                }

                .messaging-messages-area .message-bubble.received {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    color: white;
                    border-radius: 20px 20px 6px 20px;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                }

                .messaging-messages-area .message-sender-name {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-bottom: 6px;
                    font-weight: 600;
                }

                .messaging-messages-area .message-time {
                    font-size: 0.7rem;
                    margin-top: 6px;
                    opacity: 0.7;
                }

                .messaging-messages-area .message-wrapper.sent .message-time {
                    text-align: left;
                    color: #94a3b8;
                }

                .messaging-messages-area .message-wrapper.received .message-time {
                    text-align: right;
                    color: rgba(255, 255, 255, 0.7);
                }

                .messaging-messages-area .date-separator {
                    text-align: center;
                    margin: 24px 0;
                }

                .messaging-messages-area .date-separator span {
                    background: white;
                    color: #64748b;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e2e8f0;
                }

                .messaging-messages-area .no-messages {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #94a3b8;
                    padding: 40px;
                }

                .messaging-messages-area .no-messages i {
                    font-size: 48px;
                    color: #0d9488;
                    opacity: 0.3;
                    margin-bottom: 16px;
                }

                /* Input Area */
                .messaging-input-area {
                    background: white;
                    padding: 20px 24px;
                    border-top: 1px solid #e2e8f0;
                    flex-shrink: 0;
                }

                .messaging-input-area .input-group {
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 6px 10px;
                    transition: all 0.2s ease;
                }

                .messaging-input-area .input-group:focus-within {
                    border-color: #0d9488;
                    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
                    background: white;
                }

                .messaging-input-area .input-group-text {
                    background: transparent;
                    border: none;
                    padding: 10px;
                    color: #94a3b8;
                }

                .messaging-input-area .form-control {
                    border: none;
                    background: transparent;
                    padding: 12px 14px;
                    box-shadow: none !important;
                    font-size: 0.95rem;
                }

                .messaging-input-area .form-control::placeholder {
                    color: #94a3b8;
                }

                .messaging-input-area .input-group-append {
                    display: flex;
                }

                .messaging-input-area .btn-primary {
                    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                    border: none;
                    border-radius: 12px;
                    padding: 12px 24px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                    transition: all 0.25s ease;
                }

                .messaging-input-area .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
                }

                /* Empty State */
                .messaging-empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                    color: #64748b;
                }

                .messaging-empty-icon {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(15, 118, 110, 0.15) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 28px;
                    box-shadow: 0 8px 32px rgba(13, 148, 136, 0.1);
                }

                .messaging-empty-icon i {
                    font-size: 48px;
                    color: #0d9488;
                }

                .messaging-empty-state h3 {
                    margin: 0 0 10px;
                    font-size: 1.5rem;
                    color: #1e293b;
                    font-weight: 700;
                }

                .messaging-empty-state p {
                    margin: 0;
                    font-size: 1rem;
                    color: #64748b;
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .messaging-fullpage .contacts-sidebar {
                        width: 300px;
                        min-width: 300px;
                    }
                }

                @media (max-width: 992px) {
                    .messaging-fullpage {
                        left: 0;
                    }

                    .messaging-fullpage .contacts-sidebar {
                        width: 280px;
                        min-width: 280px;
                    }
                }

                @media (max-width: 768px) {
                    .messaging-fullpage .contacts-sidebar {
                        display: none;
                    }

                    .messaging-chat-header {
                        padding: 16px;
                    }

                    .messaging-chat-avatar {
                        width: 44px;
                        height: 44px;
                    }

                    .messaging-chat-info h4 {
                        font-size: 1rem;
                    }

                    .messaging-messages-area {
                        padding: 16px;
                    }

                    .messaging-messages-area .message-content-wrapper {
                        max-width: 85%;
                    }

                    .messaging-input-area {
                        padding: 12px 16px;
                    }
                }
            `}</style>

            <div className="flex h-[calc(100vh-105px)] w-full bg-[#FBFBFB] overflow-hidden font-sans text-slate-900">
                {/*<div className="messaging-fullpage">*/}
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

                <div className="flex h-full flex-col bg-slate-50 w-full">
                    {receiver_id ? (
                        <>
                            {/* Header */}
                            <div
                                className="h-16 p-4 border-b border-[#E4E7EC] bg-[#F9FAFB] flex items-center justify-between shrink-0 z-10">
                                <div className="flex items-center gap-3">

                                    <div className="relative">
                                        <Avatar className="rounded-md border-[1.6px] border-[#BDD7ED]">
                                            <AvatarImage src="https://avatar.iran.liara.run/public/49"/>
                                            <AvatarFallback>
                                                {currentUser?.name
                                                    ? currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                                                    : "???"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span
                                            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>

                                    <div className="leading-tight">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-slate-900 !mb-0">
                                                {currentUser?.name || "Contact"}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-slate-500 !mb-0">
                                            {currentUser?.username || currentUser?.email || "—"}
                                        </p>
                                    </div>
                                </div>

                                {/* Right action */}
                                {activeContracts && activeContracts.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowContracts(!showContracts)}
                                        className={[
                                            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition",
                                            showContracts
                                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                                        ].join(" ")}
                                        title="View contracts shared with this contact"
                                    >
                                        <span>{showContracts ? "Hide Shared Contracts" : "Show Shared Contracts"}</span>
                                        <span
                                            className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-blue-600 px-1.5 text-[11px] font-bold text-white">
              {activeContracts.length}
            </span>
                                    </button>
                                )}
                            </div>

                            {/* Contracts pills (same logic, only styling) */}
                            {activeContracts && activeContracts.length > 0 && showContracts && (
                                <div className="border-b border-slate-200 bg-white px-5 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        {(showAllContracts ? activeContracts : activeContracts.slice(0, 3)).map((contract, index) => (
                                            <button
                                                key={contract.contract_id || index}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedContract(contract);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                            >
                                                <i className="fas fa-file-contract text-slate-500"/>
                                                <span className="max-w-[220px] truncate">
                  #{contract.contract_id} — {contract.contract_name?.substring(0, 20) || "Contract"}
                </span>
                                            </button>
                                        ))}

                                        {activeContracts.length > 3 && !showAllContracts && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllContracts(true)}
                                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                +{activeContracts.length - 3} more
                                            </button>
                                        )}

                                        {showAllContracts && activeContracts.length > 3 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllContracts(false)}
                                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Show less
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto bg-slate-50">
                                <div className="mx-auto w-full max-w-5xl px-6 py-6">
                                    <Chat messages={messages} sessionUserId={SESSION_USER_ID}/>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="border-t border-slate-200 bg-white px-5 py-3">
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
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <div
                                    className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
                                    <i className="fas fa-comments text-slate-400 text-xl"/>
                                </div>
                                <h3 className="text-base font-semibold text-slate-800">Select a conversation</h3>
                                <p className="mt-1 text-sm text-slate-500">Choose a contact from the list to start
                                    messaging</p>
                            </div>
                        </div>
                    )}
                </div>


                {/*<div className="messaging-chat-panel">*/}
                {/*    {receiver_id ? (*/}
                {/*        <>*/}
                {/*            /!* Chat Header *!/*/}
                {/*            <div className="messaging-chat-header">*/}
                {/*                <div className="messaging-chat-header-top">*/}
                {/*                    <img*/}
                {/*                        src="/assets/dist/img/user.png"*/}
                {/*                        alt="Avatar"*/}
                {/*                        className="messaging-chat-avatar"*/}
                {/*                    />*/}
                {/*                    <div className="messaging-chat-info">*/}
                {/*                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>*/}
                {/*                            <h4 style={{ margin: 0 }}>{currentUser?.name || "Contact"}</h4>*/}
                {/*                            /!* Contracts Toggle Button - Next to name *!/*/}
                {/*                            {activeContracts && activeContracts.length > 0 && (*/}
                {/*                                <button*/}
                {/*                                    type="button"*/}
                {/*                                    onClick={() => setShowContracts(!showContracts)}*/}
                {/*                                    style={{*/}
                {/*                                        background: showContracts ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',*/}
                {/*                                        border: '1px solid rgba(255,255,255,0.3)',*/}
                {/*                                        borderRadius: '20px',*/}
                {/*                                        padding: '5px 12px',*/}
                {/*                                        color: 'white',*/}
                {/*                                        fontSize: '0.7rem',*/}
                {/*                                        fontWeight: 600,*/}
                {/*                                        cursor: 'pointer',*/}
                {/*                                        display: 'flex',*/}
                {/*                                        alignItems: 'center',*/}
                {/*                                        gap: '5px',*/}
                {/*                                        transition: 'all 0.2s ease',*/}
                {/*                                    }}*/}
                {/*                                    title="View contracts shared with this contact"*/}
                {/*                                >*/}
                {/*                                    <i className="fas fa-file-contract" style={{ fontSize: '10px' }}></i>*/}
                {/*                                    <span>{showContracts ? 'Hide' : 'Show'} Shared Contracts ({activeContracts.length})</span>*/}
                {/*                                    <i className={`fas fa-chevron-${showContracts ? 'up' : 'down'}`} style={{ fontSize: '8px' }}></i>*/}
                {/*                                </button>*/}
                {/*                            )}*/}
                {/*                        </div>*/}
                {/*                        {getContactType(currentUser) && (*/}
                {/*                            <div className="messaging-chat-type">*/}
                {/*                                <i className={`fas ${getContactTypeIcon(currentUser)}`} style={{ fontSize: '10px' }}></i>*/}
                {/*                                <span>{getContactType(currentUser)}</span>*/}
                {/*                            </div>*/}
                {/*                        )}*/}
                {/*                    </div>*/}
                {/*                    <div className="messaging-chat-subject">*/}
                {/*                        <i className="fas fa-tag" style={{ fontSize: 11 }}></i>*/}
                {/*                        {watch('subject') || "General"}*/}
                {/*                    </div>*/}
                {/*                </div>*/}

                {/*                /!* Contract Pills - Hidden by default, shown when toggled *!/*/}
                {/*                {activeContracts && activeContracts.length > 0 && showContracts && (*/}
                {/*                    <div className="messaging-contract-pills">*/}
                {/*                        {(showAllContracts ? activeContracts : activeContracts.slice(0, 3)).map((contract, index) => {*/}
                {/*                            const industry = getContractIndustry(contract.contract_type_id);*/}
                {/*                            const industryColors = getIndustryColor(industry);*/}
                {/*                            const isPublisher = contract.is_publisher ?? false;*/}
                {/*                            const roleText = isPublisher ? 'Publisher' : 'Applicant';*/}
                {/*                            const isBooked = contract.contract_status?.toLowerCase() === 'booked';*/}
                {/*                            const isPendingSignature = contract.contract_status?.toLowerCase() === 'pending_signature';*/}
                {/*                            const statusBaseColor = isBooked ? 'rgba(59, 130, 246, 0.3)' : isPendingSignature ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.25)';*/}
                {/*                            const statusBorderColor = isBooked ? 'rgba(59, 130, 246, 0.6)' : isPendingSignature ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255, 255, 255, 0.4)';*/}
                {/*                            const baseColor = isHeadhunterOrAgency ? industryColors.base : statusBaseColor;*/}
                {/*                            const borderColor = isHeadhunterOrAgency ? industryColors.border : statusBorderColor;*/}

                {/*                            return (*/}
                {/*                                <button*/}
                {/*                                    key={contract.contract_id || index}*/}
                {/*                                    type="button"*/}
                {/*                                    className="messaging-contract-pill"*/}
                {/*                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedContract(contract); }}*/}
                {/*                                    style={{ background: baseColor, borderColor: borderColor }}*/}
                {/*                                >*/}
                {/*                                    <i className="fas fa-file-contract"></i>*/}
                {/*                                    <span>*/}
                {/*                                        {isHeadhunterOrAgency ? `${industry} - ${roleText}` : `#${contract.contract_id} - ${contract.contract_name?.substring(0, 20) || "Contract"}`}*/}
                {/*                                    </span>*/}
                {/*                                </button>*/}
                {/*                            );*/}
                {/*                        })}*/}
                {/*                        {activeContracts.length > 3 && !showAllContracts && (*/}
                {/*                            <button type="button" className="messaging-contract-pill" onClick={() => setShowAllContracts(true)}*/}
                {/*                                style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}>*/}
                {/*                                <i className="fas fa-ellipsis-h"></i>*/}
                {/*                                <span>+{activeContracts.length - 3} more</span>*/}
                {/*                            </button>*/}
                {/*                        )}*/}
                {/*                        {showAllContracts && activeContracts.length > 3 && (*/}
                {/*                            <button type="button" className="messaging-contract-pill" onClick={() => setShowAllContracts(false)}*/}
                {/*                                style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}>*/}
                {/*                                <i className="fas fa-chevron-up"></i>*/}
                {/*                                <span>Show less</span>*/}
                {/*                            </button>*/}
                {/*                        )}*/}
                {/*                    </div>*/}
                {/*                )}*/}
                {/*            </div>*/}

                {/*            /!* Chat Messages *!/*/}
                {/*            <div className="messaging-messages-area">*/}
                {/*                <Chat messages={messages} sessionUserId={SESSION_USER_ID} />*/}
                {/*            </div>*/}

                {/*            /!* Chat Input *!/*/}
                {/*            <div className="messaging-input-area">*/}
                {/*                <MessagingForm*/}
                {/*                    formId={FORM_ID}*/}
                {/*                    handleSubmit={handleSubmit}*/}
                {/*                    onSubmit={onSubmit}*/}
                {/*                    register={register}*/}
                {/*                    errors={errors}*/}
                {/*                    uploadedFile={uploadedFile}*/}
                {/*                    setUploadedFile={setUploadedFile}*/}
                {/*                />*/}
                {/*            </div>*/}
                {/*        </>*/}
                {/*    ) : (*/}
                {/*        <div className="messaging-empty-state">*/}
                {/*            <div className="messaging-empty-icon">*/}
                {/*                <i className="fas fa-comments"></i>*/}
                {/*            </div>*/}
                {/*            <h3>Select a conversation</h3>*/}
                {/*            <p>Choose a contact from the list to start messaging</p>*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</div>*/}
            </div>

            {/* Contract Details Modal */}
            {selectedContract && (
                <ContractDetailsModal
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                />
            )}
        </>
    );
}

export default Create;
