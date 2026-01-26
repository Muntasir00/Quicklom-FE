import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"
import Form from './Form'; 
import { upperCaseFirst } from "@utils/StringUtils";
import { ContentHeader } from "@components/pages/ContentHeader";
import { useCreatePositionSought } from "@hooks/admin/position-soughts/useCreatePositionSought";


const Create = () => {
   const { 
        register,
        handleSubmit,
        onSubmit,
        errors,
        professionalCategories,
        menu,
        sessionUserRole,
        FORM_ID,
        action,
        slug,
    } = useCreatePositionSought();

    return (
        <div className="content-wrapper">
            <ContentHeader menu={menu ?? ""} action={action ?? ""} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-primary card-outline">
                            <div className="card-header">
                                <h3 class="card-title text-capitalize">Create {menu ?? "-"}</h3>
                            </div>
                            <div className="card-body">
                                <Form 
                                    register={register}
                                    errors={errors}
                                    professionalCategories={professionalCategories}
                                    handleSubmit={handleSubmit}
                                    onSubmit={onSubmit}
                                    FORM_ID={FORM_ID}
                                />
                            </div>

                            <div className="card-footer">
                                <Link to={`/${sessionUserRole}/${slug}`} ><button className="btn btn-default" type="button">Back</button></Link>
                                <button form={FORM_ID ?? ""} className="btn btn-primary float-right" type="submit">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Create;
