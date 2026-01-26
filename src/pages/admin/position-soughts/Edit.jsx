import React from "react";
import Form from './Form'; 
import { useUpdatePositionSought } from "@hooks/admin/position-soughts/useUpdatePositionSought";
import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { upperCaseFirst } from "@utils/StringUtils";
import { ContentHeader } from "@components/pages/ContentHeader";    

const Edit = () => {
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
    } = useUpdatePositionSought();
    
    return (
        <div className="content-wrapper">
           <ContentHeader menu={menu} action={action} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-primary card-outline">
                            <div className="card-header">
                                <h3 class="card-title text-capitalize">Edit {menu ?? "-"}</h3>
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
                                <button form={FORM_ID ?? ""} className="btn btn-primary float-right" type="submit">Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Edit;
