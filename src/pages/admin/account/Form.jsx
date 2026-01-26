import React from "react";

const Form = ({ register, errors, setShow }) => {
    return (
        <form>
            <div className="row">
                <div className="col-md-6">
                    <div className={`form-group${errors.email ? " has-error" : ""}`}>
                        <label className="control-label" htmlFor="email">Email <span className="text-red">*</span></label>
                        <div className="input-group">
                            <input readOnly type="email" id="email" className="form-control" placeholder="Enter Email" {...register("email")} />
                            <div className="input-group-append">
                                <button onClick={() => setShow(true)} className="btn btn-outline-primary" type="button">
                                    <i className="fas fa-pen"></i>
                                </button>
                            </div>
                        </div>
                        <span className={`text-danger ${errors.email ? '' : 'd-none'}`}>
                            {errors.email && <strong>{errors.email.message}</strong>}
                        </span>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className={`form-group${errors.name ? " has-error" : ""}`}>
                        <label className="control-label" htmlFor="name">Name <span className="text-red">*</span></label>
                        <input type="text" id="name" className="form-control" placeholder="Enter Name" {...register("name")}/>
                        <span className={`text-danger ${errors.name ? '' : 'd-none'}`}>
                            {errors.name && <strong>{errors.name.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label">Current Password <span className="text-red">*</span></label>
                        <input {...register("current_password")} type="password" name="current_password" className="form-control" placeholder="Enter Current Password" />
                        <span className={`text-danger ${errors.current_password ? '' : 'd-none'}`}>
                            {errors.current_password && <strong>{errors.current_password.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className={`form-group${errors.password ? " has-error" : ""}`}>
                        <label className="control-label" htmlFor="password">New Password</label>
                        <input type="password" id="password" className="form-control" placeholder="Enter Password" {...register("password")}/>
                        <span className={`text-danger ${errors.password ? '' : 'd-none'}`}>
                            {errors.password && <strong>{errors.password.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className={`form-group${errors.confirm_password ? " has-error" : ""}`}>
                        <label className="control-label" htmlFor="confirm_password">
                            Confirm Password
                        </label>
                        <input type="password" id="confirm_password" className="form-control" placeholder="Confirm Password" {...register("confirm_password")} />
                        <span className={`text-danger ${errors.confirm_password ? '' : 'd-none'}`}>
                            {errors.confirm_password && <strong>{errors.confirm_password.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default Form;
