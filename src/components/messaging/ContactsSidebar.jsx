import React, {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {
    getContactData,
    getActiveContracts,
    formatContractsDisplay,
    filterContactsBySearch,
    cleanContacts,
} from "@utils/contactUtils";
import {Headphones, Plus} from "lucide-react";
import {Avatar} from "@components/ui/avatar.jsx";
import {AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";

const ContactsSidebar = ({
                             contacts,
                             searchQuery,
                             setSearchQuery,
                             SESSION_USER_ROLE,
                             SESSION_USER_ID,
                             setValue,
                             currentReceiverId,
                             messages = [],
                         }) => {
    const [activeFilter, setActiveFilter] = useState("all");

    const getUnreadCount = (contactId) => {
        if (!Array.isArray(messages)) return 0;
        return messages.filter(
            (msg) =>
                msg.sender_id == contactId &&
                msg.receiver_id == SESSION_USER_ID &&
                msg.status === false
        ).length;
    };

    const getLastMessage = (contactId) => {
        if (!Array.isArray(messages)) return null;
        const contactMessages = messages.filter(
            (msg) =>
                (msg.sender_id == contactId && msg.receiver_id == SESSION_USER_ID) ||
                (msg.sender_id == SESSION_USER_ID && msg.receiver_id == contactId)
        );
        if (contactMessages.length === 0) return null;
        const sortedMessages = contactMessages.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        return sortedMessages[sortedMessages.length - 1];
    };

    const isSupportContact = (user) => user?.role?.name?.toLowerCase() === "admin";

    const getContactType = (user) => {
        if (!user) return null;
        if (user.institute_category) return user.institute_category.name;
        if (user.professional_role) return user.professional_role.name;
        if (user.professional_category) return user.professional_category.name;
        if (user.role) return user.role.name;
        return null;
    };

    // data prep (same functionality)
    const cleanedContacts = useMemo(() => cleanContacts(contacts), [contacts]);
    const filteredContacts = useMemo(
        () => filterContactsBySearch(cleanedContacts, searchQuery),
        [cleanedContacts, searchQuery]
    );

    const supportContacts = filteredContacts.filter((contact) => {
        const data = getContactData(contact);
        return data && isSupportContact(data.user);
    });

    const regularContacts = filteredContacts.filter((contact) => {
        const data = getContactData(contact);
        return data && !isSupportContact(data.user);
    });

    const sortContacts = (contactsList) => {
        return contactsList.sort((a, b) => {
            const aData = getContactData(a);
            const bData = getContactData(b);

            const aUnread = aData ? getUnreadCount(aData.user.id) : 0;
            const bUnread = bData ? getUnreadCount(bData.user.id) : 0;

            if (aUnread > 0 && bUnread === 0) return -1;
            if (aUnread === 0 && bUnread > 0) return 1;

            const aLastMsg = aData ? getLastMessage(aData.user.id) : null;
            const bLastMsg = bData ? getLastMessage(bData.user.id) : null;

            if (!aLastMsg && !bLastMsg) return 0;
            if (!aLastMsg) return 1;
            if (!bLastMsg) return -1;

            return new Date(bLastMsg.created_at) - new Date(aLastMsg.created_at);
        });
    };

    const sortedSupportContacts = useMemo(
        () => sortContacts([...supportContacts]),
        [supportContacts]
    );
    const sortedRegularContacts = useMemo(
        () => sortContacts([...regularContacts]),
        [regularContacts]
    );

    const supportUnreadCount = useMemo(
        () =>
            sortedSupportContacts.reduce((total, contact) => {
                const data = getContactData(contact);
                return data ? total + getUnreadCount(data.user.id) : total;
            }, 0),
        [sortedSupportContacts, messages]
    );

    const chatsUnreadCount = useMemo(
        () =>
            sortedRegularContacts.reduce((total, contact) => {
                const data = getContactData(contact);
                return data ? total + getUnreadCount(data.user.id) : total;
            }, 0),
        [sortedRegularContacts, messages]
    );

    const hasSupport = sortedSupportContacts.length > 0;
    const hasChats = sortedRegularContacts.length > 0;

    const showSupport = (activeFilter === "all" || activeFilter === "support") && hasSupport;
    const showChats = (activeFilter === "all" || activeFilter === "chats") && hasChats;

    const formatLastTime = (iso) => {
        if (!iso) return "";
        const msgDate = new Date(iso);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (msgDate.toDateString() === today.toDateString()) {
            return msgDate.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
        }
        if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";
        return msgDate.toLocaleDateString([], {month: "short", day: "numeric"});
    };

    const Tab = ({id, children, badge}) => {
        const active = activeFilter === id;
        return (
            <button
                type="button"
                onClick={() => setActiveFilter(id)}
                className={[
                    "relative !rounded-md px-3 py-1 !text-base font-medium transition",
                    active
                        ? "bg-[#EAF5FE] text-[#2D8FE3] ring-1 ring-[#BDD7ED]"
                        : "text-[#2A394B] hover:bg-[#2A394B]/50 hover:text-white",
                ].join(" ")}
            >
                {children}
          {/*      {badge > 0 && (*/}
          {/*          <span*/}
          {/*              className="ml-2 inline-flex min-w-4 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">*/}
          {/*  {badge}*/}
          {/*</span>*/}
          {/*      )}*/}
            </button>
        );
    };

    const renderContactItem = (contact, isSupport = false) => {
        const data = getContactData(contact);
        if (!data) return null;

        const {user} = data;

        const activeContracts = getActiveContracts(contact);
        const contractsDisplay = formatContractsDisplay(contact);
        const unreadCount = getUnreadCount(user.id);
        const lastMessage = getLastMessage(user.id);
        const isActive = currentReceiverId == user.id;

        return (
            <Link
                key={user.id}
                to={`/${SESSION_USER_ROLE}/messaging/user/${user.id}/create`}
                className={[
                    "group flex items-center gap-3 rounded-lg px-3 py-2 transition",
                    isActive ? "bg-gradient-to-r from-blue-50 to-indigo-50 ring-1 ring-blue-200" : "hover:bg-slate-50",
                ].join(" ")}
                onClick={() => {
                    try {
                        const userRole = user?.role?.name ? user.role.name.toLowerCase() : "";
                        let subject = "general";
                        if (userRole === "admin") subject = "support";
                        else if (userRole === "institute") subject = "institute";
                        else subject = "contract";
                        setValue("subject", subject);
                    } catch (error) {
                        console.error("Error occurred", error);
                    }
                }}
            >
                {/* Avatar */}
                <div className="relative">
                    {isSupport ? (
                        <>
                            {/*<div*/}
                            {/*    className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">*/}
                            {/*    /!*<i className="fas fa-headset text-blue-600 text-sm"/>*!/*/}
                            {/*    <Headphones className="fas fa-headset text-blue-600 text-sm"/>*/}
                            {/*</div>*/}
                            <Avatar className="w-10 h-10 rounded-sm">
                                <div
                                    className={` ${isActive ? "bg-white" : "bg-blue-50"} text-blue-500 w-full h-full flex items-center justify-center`}>
                                    <Headphones size={20}/>
                                </div>
                            </Avatar>
                        </>
                    ) : (
                        <div className="relative w-10 h-10">
                            <Avatar className="w-full h-full rounded-sm border-[1.6px] border-[#BDD7ED]">
                                <img
                                    src="/assets/dist/img/user.png"
                                    alt="Avatar"
                                    className="block w-full h-full object-cover"
                                />
                            </Avatar>

                            {user.status && (
                                <span
                                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Main */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900  !mb-0">
                            {user?.name || "Unknown"}
                        </p>

                        <div className="flex items-center gap-2">
                            {lastMessage?.created_at && (
                                <span className="shrink-0 text-[11px] text-slate-400">
                                  {formatLastTime(lastMessage.created_at)}
                                </span>
                            )}
                            {/* unread dot like screenshot */}
                            {unreadCount > 0 && (
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                                    title={`${unreadCount} unread`}
                                />
                            )}
                        </div>
                    </div>

                    <div className="mt-0.5 flex items-center gap-2">
                        <p className="truncate text-xs text-slate-500  !mb-0">
                            {lastMessage ? (
                                <>
                                    {lastMessage.sender_id == SESSION_USER_ID && (
                                        <i
                                            className={[
                                                "fas mr-1",
                                                lastMessage.status ? "fa-check-double text-blue-600" : "fa-check text-slate-400",
                                            ].join(" ")}
                                        />
                                    )}
                                    {lastMessage.body?.substring(0, 28) || "Attachment"}
                                    {lastMessage.body?.length > 28 && "..."}
                                </>
                            ) : (
                                <span className="text-slate-400">
                  {isSupport ? "Support Team" : contractsDisplay || user?.role?.name || "User"}
                </span>
                            )}
                        </p>

                        {/* tiny count chip (kept, but subtle) */}
                        {/*          {activeContracts && activeContracts.length > 0 && !isSupport && (*/}
                        {/*              <span*/}
                        {/*                  className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">*/}
                        {/*  {activeContracts.length}*/}
                        {/*</span>*/}
                        {/*          )}*/}
                    </div>

                    {/* Optional: tiny type label (kept but subtle, doesn’t change behavior) */}
                    {/*      {!isSupport && getContactType(user) && (*/}
                    {/*          <div className="mt-0.5">*/}
                    {/*<span*/}
                    {/*    className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-100">*/}
                    {/*  <i className="fas fa-user text-[10px]"/>*/}
                    {/*  <span className="truncate">{getContactType(user)}</span>*/}
                    {/*</span>*/}
                    {/*          </div>*/}
                    {/*      )}*/}
                </div>
            </Link>
        );
    };

    return (
        <aside
            className="w-full lg:w-72 bg-[#FBFBFB]  border-r border-[#E5E7EB] flex-col hidden lg:flex">
            {/*<aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">*/}
            {/* Top tabs (All / Support / Contacts) */}
            <div className="px-3 pt-3">
                <div className="inline-flex gap-2 rounded-lg bg-white border border-slate-200 p-1">
                    <Tab id="all" badge={supportUnreadCount + chatsUnreadCount}>
                        All
                    </Tab>
                    <Tab id="support" badge={supportUnreadCount}>
                        Support
                    </Tab>
                    {/* keeping your existing filter value mapping: "chats" == Contacts tab in screenshot */}
                    <Tab id="chats" badge={chatsUnreadCount}>
                        Contacts
                    </Tab>
                </div>

                {/* New conversation row */}
                <div className="mt-3 flex items-center gap-2">
                    <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        // keep functionality-free (you can wire this to your create flow if you already have one)
                        onClick={() => {
                            /* no-op by design */
                        }}
                    >
                        <span
                            className="inline-flex h-5 w-5 p-1 items-center justify-center rounded-full border border-slate-200">
                          {/*<i className="fas fa-plus text-[11px] text-slate-600"/>*/}
                            <Plus className="text-[11px] text-slate-600"/>
                        </span>
                        New Conversation
                    </button>

                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                        title="Search"
                        onClick={() => {
                            // focus search input if you want (optional)
                            const el = document.getElementById("contacts-search-input");
                            if (el) el.focus();
                        }}
                    >
                        <i className="fas fa-search text-sm"/>
                    </button>
                </div>

                {/* Search input */}
                <div className="mt-3">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"/>
                        <input
                            id="contacts-search-input"
                            type="text"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                onClick={() => setSearchQuery("")}
                                title="Clear search"
                            >
                                <i className="fas fa-times text-xs"/>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="mt-3 flex-1 overflow-y-auto px-2 pt-1 pb-3 space-y-2">
                {showSupport && sortedSupportContacts.map((c) => renderContactItem(c, true))}
                {showChats && sortedRegularContacts.map((c) => renderContactItem(c, false))}

                {!showSupport && !showChats && (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <i className="fas fa-inbox text-3xl text-slate-300"/>
                        <p className="mt-3 text-sm font-medium text-slate-600 !mb-0">
                            {searchQuery
                                ? "No matches found"
                                : activeFilter === "support"
                                    ? "No support conversations"
                                    : activeFilter === "chats"
                                        ? "No chat conversations"
                                        : "No conversations yet"}
                        </p>
                        {searchQuery && (
                            <button
                                type="button"
                                className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                                onClick={() => setSearchQuery("")}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default ContactsSidebar;


// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import {
//     getContactData,
//     getActiveContracts,
//     formatContractsDisplay,
//     filterContactsBySearch,
//     cleanContacts
// } from "@utils/contactUtils";
//
// const ContactsSidebar = ({
//     contacts,
//     searchQuery,
//     setSearchQuery,
//     SESSION_USER_ROLE,
//     SESSION_USER_ID,
//     setValue,
//     currentReceiverId,
//     messages = [],
// }) => {
//     const [activeFilter, setActiveFilter] = useState("all");
//
//     const getUnreadCount = (contactId) => {
//         if (!Array.isArray(messages)) return 0;
//         return messages.filter(
//             msg =>
//                 msg.sender_id == contactId &&
//                 msg.receiver_id == SESSION_USER_ID &&
//                 msg.status === false
//         ).length;
//     };
//
//     const getLastMessage = (contactId) => {
//         if (!Array.isArray(messages)) return null;
//         const contactMessages = messages.filter(
//             msg =>
//                 (msg.sender_id == contactId && msg.receiver_id == SESSION_USER_ID) ||
//                 (msg.sender_id == SESSION_USER_ID && msg.receiver_id == contactId)
//         );
//         if (contactMessages.length === 0) return null;
//         const sortedMessages = contactMessages.sort((a, b) =>
//             new Date(a.created_at) - new Date(b.created_at)
//         );
//         return sortedMessages[sortedMessages.length - 1];
//     };
//
//     const isSupportContact = (user) => {
//         return user?.role?.name?.toLowerCase() === "admin";
//     };
//
//     const getContactType = (user) => {
//         if (!user) return null;
//
//         // Check if it's an institute - show specific category name
//         if (user.institute_category) {
//             return user.institute_category.name;
//         }
//
//         // Check if it's a professional - show professional role (General Dentist, Specialist Dentist, etc.)
//         if (user.professional_role) {
//             return user.professional_role.name;
//         }
//
//         // Fallback to professional category if no role
//         if (user.professional_category) {
//             return user.professional_category.name;
//         }
//
//         // Fallback to role name
//         if (user.role) {
//             return user.role.name;
//         }
//
//         return null;
//     };
//
//     const getContactTypeIcon = (user) => {
//         if (!user) return "fa-user";
//
//         const categoryName = user.institute_category?.name?.toLowerCase();
//         const professionalCategoryName = user.professional_category?.name?.toLowerCase();
//
//         // Institute categories
//         if (categoryName?.includes("clinic") || categoryName?.includes("practice")) {
//             return "fa-clinic-medical";
//         }
//         if (categoryName?.includes("pharmacy")) {
//             return "fa-pills";
//         }
//         if (categoryName?.includes("agency") || categoryName?.includes("headhunter")) {
//             return "fa-user-tie";
//         }
//
//         // Professional categories
//         // 1: Nursing and Home Care
//         if (professionalCategoryName?.includes("nursing") || professionalCategoryName?.includes("home care")) {
//             return "fa-user-nurse";
//         }
//         // 2: General Medicine
//         if (professionalCategoryName?.includes("medicine") || professionalCategoryName?.includes("general medicine")) {
//             return "fa-user-md";
//         }
//         // 3: Dental Care
//         if (professionalCategoryName?.includes("dental")) {
//             return "fa-tooth";
//         }
//         // 4: Pharmacy
//         if (professionalCategoryName?.includes("pharmacy")) {
//             return "fa-prescription-bottle";
//         }
//
//         return "fa-user";
//     };
//
//     // Clean and filter contacts
//     const cleanedContacts = cleanContacts(contacts);
//     const filteredContacts = filterContactsBySearch(cleanedContacts, searchQuery);
//
//     // Separate support and regular contacts
//     const supportContacts = filteredContacts.filter(contact => {
//         const data = getContactData(contact);
//         return data && isSupportContact(data.user);
//     });
//
//     const regularContacts = filteredContacts.filter(contact => {
//         const data = getContactData(contact);
//         return data && !isSupportContact(data.user);
//     });
//
//     const sortContacts = (contactsList) => {
//         return contactsList.sort((a, b) => {
//             const aData = getContactData(a);
//             const bData = getContactData(b);
//
//             const aUnread = aData ? getUnreadCount(aData.user.id) : 0;
//             const bUnread = bData ? getUnreadCount(bData.user.id) : 0;
//
//             if (aUnread > 0 && bUnread === 0) return -1;
//             if (aUnread === 0 && bUnread > 0) return 1;
//
//             const aLastMsg = aData ? getLastMessage(aData.user.id) : null;
//             const bLastMsg = bData ? getLastMessage(bData.user.id) : null;
//
//             if (!aLastMsg && !bLastMsg) return 0;
//             if (!aLastMsg) return 1;
//             if (!bLastMsg) return -1;
//
//             return new Date(bLastMsg.created_at) - new Date(aLastMsg.created_at);
//         });
//     };
//
//     const sortedSupportContacts = sortContacts(supportContacts);
//     const sortedRegularContacts = sortContacts(regularContacts);
//
//     const supportUnreadCount = sortedSupportContacts.reduce((total, contact) => {
//         const data = getContactData(contact);
//         return data ? total + getUnreadCount(data.user.id) : total;
//     }, 0);
//
//     const chatsUnreadCount = sortedRegularContacts.reduce((total, contact) => {
//         const data = getContactData(contact);
//         return data ? total + getUnreadCount(data.user.id) : total;
//     }, 0);
//
//     const renderContactItem = (contact, isSupport = false) => {
//         const data = getContactData(contact);
//         if (!data) return null;
//
//         const { user } = data;
//
//         const activeContracts = getActiveContracts(contact);
//         const contractsDisplay = formatContractsDisplay(contact);
//         const unreadCount = getUnreadCount(user.id);
//         const lastMessage = getLastMessage(user.id);
//         const isActive = currentReceiverId == user.id;
//
//         return (
//             <Link
//                 key={user.id}
//                 to={`/${SESSION_USER_ROLE}/messaging/user/${user.id}/create`}
//                 className={`contact-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''} ${isSupport ? 'support-contact' : ''}`}
//                 onClick={() => {
//                     try {
//                         const userRole = user?.role?.name ? user.role.name.toLowerCase() : "";
//                         let subject = "general";
//                         if (userRole === "admin") {
//                             subject = "support";
//                         } else if (userRole === "institute") {
//                             subject = "institute";
//                         } else {
//                             subject = "contract";
//                         }
//                         setValue("subject", subject);
//                     } catch (error) {
//                         console.error("Error occurred", error);
//                     }
//                 }}
//             >
//                 <div className="contact-avatar-wrapper">
//                     {isSupport ? (
//                         <div className="support-avatar">
//                             <i className="fas fa-headset"></i>
//                         </div>
//                     ) : (
//                         <>
//                             <img
//                                 src="/assets/dist/img/user.png"
//                                 alt="Avatar"
//                                 className="contact-avatar"
//                             />
//                             {user.status && (
//                                 <span className="status-indicator online"></span>
//                             )}
//                         </>
//                     )}
//                 </div>
//
//                 <div className="contact-info">
//                     <div className="contact-header-row">
//                         <h6 className={`contact-name mb-0 ${unreadCount > 0 ? 'font-weight-bold' : ''}`}>
//                             {user?.name || "Unknown"}
//                         </h6>
//                         {lastMessage && (
//                             <small className="contact-time">
//                                 {(() => {
//                                     const msgDate = new Date(lastMessage.created_at);
//                                     const today = new Date();
//                                     const yesterday = new Date(today);
//                                     yesterday.setDate(yesterday.getDate() - 1);
//
//                                     if (msgDate.toDateString() === today.toDateString()) {
//                                         return msgDate.toLocaleTimeString([], {
//                                             hour: '2-digit',
//                                             minute: '2-digit'
//                                         });
//                                     } else if (msgDate.toDateString() === yesterday.toDateString()) {
//                                         return "Yesterday";
//                                     } else {
//                                         return msgDate.toLocaleDateString([], {
//                                             month: 'short',
//                                             day: 'numeric'
//                                         });
//                                     }
//                                 })()}
//                             </small>
//                         )}
//                     </div>
//
//                     {/* Contact Type & Contracts Count - Compact row */}
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
//                         {!isSupport && getContactType(user) && (
//                             <div className="contact-type-badge">
//                                 <i className={`fas ${getContactTypeIcon(user)} mr-1`} style={{ fontSize: '10px' }}></i>
//                                 <small>{getContactType(user)}</small>
//                             </div>
//                         )}
//                         {/* Contracts Count Badge */}
//                         {activeContracts && activeContracts.length > 0 && (
//                             <div style={{
//                                 display: 'inline-flex',
//                                 alignItems: 'center',
//                                 gap: '4px',
//                                 background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//                                 padding: '2px 8px',
//                                 borderRadius: '10px',
//                                 fontSize: '0.65rem',
//                                 color: 'white',
//                                 fontWeight: 600,
//                             }}>
//                                 <i className="fas fa-file-contract" style={{ fontSize: '8px' }}></i>
//                                 <span>{activeContracts.length}</span>
//                             </div>
//                         )}
//                     </div>
//
//                     <div className="contact-message-row">
//                         <p className={`contact-last-message mb-0 ${unreadCount > 0 ? 'font-weight-bold' : ''}`}>
//                             {lastMessage ? (
//                                 <>
//                                     {lastMessage.sender_id == SESSION_USER_ID && (
//                                         <i className={`fas ${lastMessage.status ? 'fa-check-double text-primary' : 'fa-check text-muted'} mr-1`}></i>
//                                     )}
//                                     {lastMessage.body?.substring(0, 30) || "Attachment"}
//                                     {lastMessage.body?.length > 30 && "..."}
//                                 </>
//                             ) : (
//                                 <span className="text-muted">
//                                     {isSupport ? "Support Team" : (contractsDisplay || user?.role?.name || "User")}
//                                 </span>
//                             )}
//                         </p>
//                         {unreadCount > 0 && (
//                             <span className={`unread-badge ${isSupport ? 'support-badge' : ''}`}>
//                                 {unreadCount}
//                             </span>
//                         )}
//                     </div>
//                 </div>
//             </Link>
//         );
//     };
//
//     const hasSupport = sortedSupportContacts.length > 0;
//     const hasChats = sortedRegularContacts.length > 0;
//     const showSupport = (activeFilter === "all" || activeFilter === "support") && hasSupport;
//     const showChats = (activeFilter === "all" || activeFilter === "chats") && hasChats;
//
//     return (
//         <div className="contacts-sidebar">
//             <div className="contacts-header">
//                 <h5 className="mb-0">Messages</h5>
//             </div>
//
//             <div className="filter-pills">
//                 <button
//                     className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
//                     onClick={() => setActiveFilter('all')}
//                 >
//                     All
//                     {(supportUnreadCount + chatsUnreadCount) > 0 && (
//                         <span className="pill-badge">{supportUnreadCount + chatsUnreadCount}</span>
//                     )}
//                 </button>
//                 <button
//                     className={`filter-pill ${activeFilter === 'support' ? 'active' : ''}`}
//                     onClick={() => setActiveFilter('support')}
//                 >
//                     <i className="fas fa-life-ring mr-1"></i>
//                     Support
//                     {supportUnreadCount > 0 && (
//                         <span className="pill-badge support">{supportUnreadCount}</span>
//                     )}
//                 </button>
//                 <button
//                     className={`filter-pill ${activeFilter === 'chats' ? 'active' : ''}`}
//                     onClick={() => setActiveFilter('chats')}
//                 >
//                     <i className="fas fa-comments mr-1"></i>
//                     Chats
//                     {chatsUnreadCount > 0 && (
//                         <span className="pill-badge">{chatsUnreadCount}</span>
//                     )}
//                 </button>
//             </div>
//
//             <div className="contacts-search">
//                 <div className="search-input-wrapper">
//                     <i className="fas fa-search search-icon"></i>
//                     <input
//                         type="text"
//                         className="search-input"
//                         placeholder="Search messages..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                     {searchQuery && (
//                         <button
//                             className="clear-search-btn"
//                             onClick={() => setSearchQuery("")}
//                             title="Clear search"
//                         >
//                             <i className="fas fa-times"></i>
//                         </button>
//                     )}
//                 </div>
//             </div>
//
//             <div className="contacts-list-wrapper">
//                 {showSupport && (
//                     <div className="contacts-section">
//                         {activeFilter === 'all' && hasChats && (
//                             <div className="section-divider">
//                                 <span className="divider-text">
//                                     <i className="fas fa-life-ring mr-2"></i>
//                                     Support Team
//                                 </span>
//                             </div>
//                         )}
//                         {sortedSupportContacts.map(contact => renderContactItem(contact, true))}
//                     </div>
//                 )}
//
//                 {showChats && (
//                     <div className="contacts-section">
//                         {activeFilter === 'all' && hasSupport && (
//                             <div className="section-divider">
//                                 <span className="divider-text">
//                                     <i className="fas fa-comments mr-2"></i>
//                                     Recent Chats
//                                 </span>
//                             </div>
//                         )}
//                         {sortedRegularContacts.map(contact => renderContactItem(contact, false))}
//                     </div>
//                 )}
//
//                 {!showSupport && !showChats && (
//                     <div className="empty-state">
//                         <i className="fas fa-inbox fa-3x mb-3"></i>
//                         <p className="mb-1">
//                             {searchQuery ? "No matches found" :
//                              activeFilter === 'support' ? "No support conversations" :
//                              activeFilter === 'chats' ? "No chat conversations" :
//                              "No conversations yet"}
//                         </p>
//                         {searchQuery && (
//                             <button
//                                 className="btn btn-sm btn-link"
//                                 onClick={() => setSearchQuery("")}
//                             >
//                                 Clear search
//                             </button>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default ContactsSidebar;