import React from "react";

const Form = () => {
    return (
        <form>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="email">Email <span className="text-red">*</span></label>
                        <input type="text" className="form-control" id="email" placeholder="Enter Email" />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="name">First Name <span className="text-red">*</span></label>
                        <input type="text" className="form-control" id="name" placeholder="Enter First Name" />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="password">Password</label>
                        <input type="password" className="form-control" id="password" placeholder="Enter Password" />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="password-confirm">Confirm Password</label>
                        <input type="password" className="form-control" id="password-confirm" placeholder="Confirm Password" />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="form-check">
                        <input name="radio" type="checkbox" className="form-check-input" id="check3" checked={false}onChange={() => {}}/>
                        <label className="form-check-label" htmlFor="check3">
                            <span className="text-capitalize">Retail Pharmacy</span>
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default Form;
