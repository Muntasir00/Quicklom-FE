import React from "react";

const Form = ({ 
    register, 
    errors, 
    professionalCategories, 
    FORM_ID,
    handleSubmit,
    onSubmit,
}) => {
    return (
        <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group">
                        <label className="control-label" htmlFor="professional_category_id">Professional Category <span className="text-red">*</span></label>
                        <select class="form-control" {...register("professional_category_id")}>
                            <option value="">Select Category</option>
                            {professionalCategories?.length > 0 && professionalCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <span className={`text-danger ${!errors.professional_category_id ? "d-none" : ""}`}>
                            <strong>{errors?.professional_category_id?.message}</strong>
                        </span>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="name">Name <span className="text-red">*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Position Name" {...register("name")} />
                        <span className={`text-danger ${!errors.name ? "d-none" : ""}`}>
                            <strong>{errors.name?.message}</strong>
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="status">Status <span className="text-red">*</span></label>
                        <select class="form-control" {...register("status")}>
                            <option value="1">Active</option>
                            <option value="0">InActive</option>
                        </select>
                        <span className={`text-danger ${!errors.status ? "d-none" : ""}`}>
                            <strong>{errors.status?.message}</strong>
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default Form;
