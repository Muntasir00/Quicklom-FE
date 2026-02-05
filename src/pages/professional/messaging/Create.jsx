import React, {useState} from "react";
import {useParams} from "react-router-dom";
import Chat from '@components/messaging/Chat';
import {useCreateMessaging} from "@hooks/professional/messaging/useCreateMessaging";
import MessagingForm from "@components/forms/MessagingForm";
import ContactsSidebar from "@components/messaging/ContactsSidebar";
import ContractDetailsModal from "@components/messaging/ContractDetailsModal";
import "./MessagingStyles.css";
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
        <div className="flex h-[calc(100vh-105px)] w-full bg-[#FBFBFB] overflow-hidden font-sans text-slate-900">
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
            <div className="w-full flex h-full flex-col bg-slate-50 w-full">
                {/*<div className="flex h-full flex-col overflow-hidden w-full rounded-xl border border-slate-200 bg-slate-50">*/}
                {receiver_id ? (
                    <>
                        {/* ✅ Chat Header (Tailwind) */}
                        <div
                            className=" p-4 border-b border-[#E4E7EC] bg-[#F9FAFB] flex items-center justify-between shrink-0 z-10">

                            {/*<div className="border-b border-slate-200 bg-white px-5 py-4">*/}
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
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
                                    {/*<div className="relative shrink-0">*/}
                                    {/*    <img*/}
                                    {/*        src="/assets/dist/img/user.png"*/}
                                    {/*        alt="Avatar"*/}
                                    {/*        className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"*/}
                                    {/*    />*/}
                                    {/*    /!* Optional online dot (remove if you don't need) *!/*/}
                                    {/*    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />*/}
                                    {/*</div>*/}

                                    {/* Name + Type */}
                                    <div className="min-w-0 flex-1">
                                        <h5 className="truncate text-sm font-semibold text-slate-900 !mb-0">
                                            {currentUser?.name || "Contact"}
                                        </h5>

                                        {getContactType(currentUser) && (
                                            <div
                                                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                                <i className={`fas ${getContactTypeIcon(currentUser)} text-[11px]`}/>
                                                <span className="truncate">{getContactType(currentUser)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="ml-auto flex items-center gap-2">
                                        {/* Subject badge */}
                                        <span
                                            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                <i className="fas fa-tag mr-1 text-[11px]"/>
                                            {watch("subject") || "General"}
              </span>

                                        {/* Info button */}
                                        <button
                                            type="button"
                                            onClick={() => setShowContactInfo(true)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
                                            title="View contact details"
                                        >
                                            <i className="fas fa-info-circle"/>
                                            Info
                                        </button>
                                    </div>
                                </div>

                                {/* ✅ Contract Pills (Tailwind only; logic same) */}
                                {activeContracts && activeContracts.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(showAllContracts ? activeContracts : activeContracts.slice(0, 3)).map(
                                            (contract, index) => {
                                                const isBooked = contract.contract_status?.toLowerCase() === "booked";
                                                const isPendingSignature =
                                                    contract.contract_status?.toLowerCase() === "pending_signature";

                                                const pillClass = isBooked
                                                    ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                    : isPendingSignature
                                                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

                                                const titleText = `Click to view contract details${
                                                    isBooked ? " (Booked)" : isPendingSignature ? " (Pending Signature)" : ""
                                                }`;

                                                const contractName =
                                                    contract.contract_name
                                                        ? contract.contract_name.length > 25
                                                            ? contract.contract_name.substring(0, 25) + "..."
                                                            : contract.contract_name
                                                        : "Contract";

                                                return (
                                                    <button
                                                        key={contract.contract_id || index}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedContract(contract);
                                                        }}
                                                        title={titleText}
                                                        className={[
                                                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
                                                            "text-xs font-semibold transition",
                                                            "shadow-sm hover:shadow active:scale-[0.99]",
                                                            "focus:outline-none focus:ring-2 focus:ring-blue-100",
                                                            pillClass,
                                                        ].join(" ")}
                                                    >
                                                        <i className="fas fa-file-contract text-[11px]"/>
                                                        <span className="max-w-[320px] truncate">
                        #{contract.contract_id} - {contractName}
                      </span>
                                                    </button>
                                                );
                                            }
                                        )}

                                        {activeContracts.length > 3 && !showAllContracts && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowAllContracts(true);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow active:scale-[0.99]"
                                            >
                                                <i className="fas fa-ellipsis-h text-[11px]"/>
                                                <span>+{activeContracts.length - 3} more</span>
                                            </button>
                                        )}

                                        {showAllContracts && activeContracts.length > 3 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowAllContracts(false);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow active:scale-[0.99]"
                                            >
                                                <i className="fas fa-minus text-[11px]"/>
                                                <span>Show less</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ✅ Chat Messages Wrapper (only wrapper changed; Chat component untouched) */}
                        <div className="flex-1 overflow-y-auto bg-slate-50">
                            {/* inner padding like screenshot */}
                            <div className="px-6 py-6">
                                <Chat messages={messages} sessionUserId={SESSION_USER_ID}/>
                            </div>
                        </div>

                        {/* ✅ Footer / Input wrapper (MessagingForm untouched) */}
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
                    <div className="flex h-full items-center justify-center bg-slate-50 px-6">
                        <div className="max-w-md text-center">
                            <div
                                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
                                <i className="fas fa-comments text-2xl text-slate-400"/>
                            </div>
                            <h4 className="text-base font-semibold text-slate-800">QuickLocum Messaging</h4>
                            <p className="mt-1 text-sm text-slate-500">Select a contact to start messaging</p>
                            <div className="mt-4 text-sm text-slate-500">
                                <i className="fas fa-file-contract mr-2 text-slate-400"/>
                                Conversations are linked to contracts
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Contact Info Modal */}
            {showContactInfo && currentUser && (
                <div className="contract-modal-overlay" onClick={() => setShowContactInfo(false)}>
                    <div className="contract-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
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
                                <div
                                    className="contract-detail-value">{currentUser.institute_category?.name || currentUser.professional_category?.name || currentUser.role?.name || "User"}</div>
                            </div>
                            <div className="contract-detail-row">
                                <div className="contract-detail-label"><i className="fas fa-envelope mr-2"></i>Email
                                </div>
                                <div className="contract-detail-value"><a href={`mailto:${currentUser.email}`}
                                                                          style={{color: '#6366f1'}}>{currentUser.email}</a>
                                </div>
                            </div>
                            <div className="contract-detail-row">
                                <div className="contract-detail-label"><i className="fas fa-circle mr-2"></i>Status
                                </div>
                                <div className="contract-detail-value"><span
                                    className={`badge ${currentUser.status ? 'badge-success' : 'badge-secondary'}`}>{currentUser.status ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div className="contract-detail-row">
                                <div className="contract-detail-label"><i className="fas fa-calendar mr-2"></i>Member
                                    Since
                                </div>
                                <div
                                    className="contract-detail-value">{new Date(currentUser.created_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}</div>
                            </div>
                            {activeContracts && activeContracts.length > 0 && (
                                <div className="contract-detail-row">
                                    <div className="contract-detail-label"><i className="fas fa-file-contract mr-2"></i>Active
                                        Contracts
                                    </div>
                                    <div className="contract-detail-value"><span
                                        className="badge badge-primary">{activeContracts.length}</span></div>
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
                <ContractDetailsModal contract={selectedContract} onClose={() => setSelectedContract(null)}/>
            )}
        </div>
    );
}

export default Create;
