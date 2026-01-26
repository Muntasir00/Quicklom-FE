import React from "react";
import { Link } from "react-router-dom";

const ChatContacts = ({
    contacts, 
    sessionUseRrole, 
    setIsChatContactsOpen,
    setValue = () => {},
}) => {
    return (
        <div className="direct-chat-contacts" style={{ height: '360px' }}>
            <ul className="contacts-list">
                {Array.isArray(contacts) && contacts.length > 0 ? (
                    contacts.map((contact) => (
                        <li key={contact.id}>
                            <Link 
                                to={`/${sessionUseRrole}/messaging/user/${contact?.id}/create`} 
                                onClick={() => {
                                    try {
                                        setIsChatContactsOpen(prev => !prev);
                                        const userRole = contact?.role?.name ? contact.role.name.toLowerCase() : "";
                                        const subject = userRole == "admin" ? "support" : "contract";
                                        setValue("subject", subject);
                                    } catch (error) {
                                        console.error("Error occured", error);
                                    }
                                }}
                            >
                                <img className="contacts-list-img" src="/assets/dist/img/user.png" alt="User Avatar"/>
                                <div className="contacts-list-info">
                                    <span className="contacts-list-name">
                                        <span>{contact?.name ?? "-"}</span>
                                        <small className="contacts-list-date float-right">{contact?.created_at ? new Date(contact.created_at).toLocaleString() : "—"}</small>
                                    </span>
                                    <span className="contacts-list-msg">{contact?.role?.name ?? "-"}</span>
                                </div>
                            </Link>
                        </li>
                    ))
                ) : (
                    <div className="text-center text-muted py-3">
                        No contacts available
                    </div>
                )}
            </ul>
        </div>
    );
};

export default ChatContacts;
