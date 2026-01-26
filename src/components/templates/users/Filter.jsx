import React from "react";

const FilterTemplate = () => {
    return (
        <form className="mb-4">
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="userRole">User Role</label>
                        <select id="userRole" name="role_id" className="form-control">
                            <option value="">-- Select Role --</option>
                            <option value="admin">Admin</option>
                            <option value="professional">Professional</option>
                            <option value="institute">Institute</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="professionalCategory">Professional Category</label>
                        <select id="professionalCategory" name="professional_category_id" className="form-control">
                            <option value="">-- Select Professional Category --</option>
                            <option value="1">Dentistry</option>
                            <option value="2">Pharmacy</option>
                            <option value="3">Nursing</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="instituteCategory">Institute Category</label>
                        <select id="instituteCategory" name="institute_category_id" className="form-control">
                            <option value="">-- Select Institute Category --</option>
                            <option value="1">Hospital</option>
                            <option value="2">Clinic</option>
                            <option value="3">Academy</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="createdAt">Created At</label>
                        <input id="createdAt" name="created_at" type="date" className="form-control" placeholder="Created at date" />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="updatedAt">Updated At</label>
                        <input id="updatedAt" name="updated_at" type="date" className="form-control" placeholder="Updated at date" />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="searchKeyword">Search Keyword</label>
                        <input id="searchKeyword" name="keyword" type="text" className="form-control" placeholder="Enter keyword (name, email, etc.)" />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="clearButton" className="d-block">Clear Filters</label>
                        <button id="clearButton" type="button" className="btn btn-secondary">Clear</button>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="searchButton" className="d-block">Search</label>
                        <button id="searchButton" type="submit" className="btn btn-primary">Search</button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default FilterTemplate;
