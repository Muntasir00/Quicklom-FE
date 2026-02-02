import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"
import Chat from '@components/messaging/Chat'; 
 
import { upperCaseFirst } from "@utils/StringUtils";
import { ContentHeader } from "@components/pages/ContentHeader";
import { useUpdateMessaging } from "@hooks/institute/messaging/useUpdateMessaging";

import MessagingForm from "@components/forms/MessagingForm";


const Edit = () => {
   const { 
        register,
        handleSubmit,
        onSubmit,
        errors,
        menu,
        sessionUserRole,
        FORM_ID,
        action,
        slug,
        messages,
        SESSION_USER_ID,
        menuLink,
        initializeStateHelper,
    } = useUpdateMessaging();

    return (
        <div className="">
            <ContentHeader 
                menu={menu} 
                action={action}
                menuLink={menuLink} 
            />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card direct-chat direct-chat-primary card-primary card-outline">
                            <div className="card-header">
                                <h3 class="card-title text-capitalize">Direct {menu ?? "-"}</h3>
                                <div className="row">
                                    <div className="col-md-12">
                                        <button onClick={() => initializeStateHelper()} type="buton" className="btn btn-sm btn-primary float-right">
                                            <i className="fa fa-envelope-open-text pr-1"></i> Load New
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <Chat 
                                    messages={messages}
                                    sessionUserId={SESSION_USER_ID}
                                />
                            </div>
                            <div className="card-footer">
                                <MessagingForm 
                                    formId={FORM_ID}
                                    handleSubmit={handleSubmit}
                                    onSubmit={onSubmit}
                                    register={register}
                                    errors={errors}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Edit;
