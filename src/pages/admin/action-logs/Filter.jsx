import React from "react";
import {useEffect, useState} from "react";
import { getProfessionalCategoriesService } from "@services/admin/ProfessionalCategoryService";
import { getInstituteCategoriesService } from "@services/admin/InstituteCategoryService";

const Filter = ({ roles, actionTypes, logsType, getActionLogService, setActionLogs, actionStatusTypes }) => {
    const [filters, setFilters] = React.useState({
        role_id: "",
        action_type: "",
        log_type: "",
        action_status: "",
        email: "",
        created_at: "",
        professional_category_id: "",
        institute_category_id: "",
    });

    const [professionalCategories, setProfessionalCategories] = useState([]);
    const [instituteCategories, setInstituteCategories] = useState([]);

    const initializeStateHelper = async () => { 
        const professionalCategoriesData = await getProfessionalCategoriesService();
        setProfessionalCategories(professionalCategoriesData);

        const instituteCategoriesData = await getInstituteCategoriesService();
        setInstituteCategories(instituteCategoriesData);
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClear = async () => {
        const cleared = {
            role_id: "",
            action_type: "",
            log_type: "",
            action_status: "",
            email: "",
            created_at: "",
            professional_category_id: "",
            institute_category_id: "",
        };
        
        setFilters(cleared);
        const data = await getActionLogService({ filters: cleared });
        setActionLogs(data?.logs || []);
        console.log("Clearing search filters");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await getActionLogService({ filters });
        setActionLogs(data?.logs || []);
        console.log("Submitting search with filters:", filters);
    };

    useEffect(() => { initializeStateHelper() }, []);

    return (
        <form className="mb-4" onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="professionalCategory">Professional Category</label>
                        <select onChange={handleChange}  value={filters.professional_category_id}  name="professional_category_id" className="form-control">
                            <option value="">--Select--</option>
                            {professionalCategories && professionalCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="instituteCategory">Institute Category</label>
                        <select onChange={handleChange} value={filters.institute_category_id} name="institute_category_id" className="form-control">
                            <option value="">--Select--</option>
                            {instituteCategories && instituteCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="form-group">
                        <label htmlFor="actionType">Action Type</label>
                        <select onChange={handleChange} value={filters.action_type} name="action_type" className="form-control">
                            <option value="">--Select--</option>
                            {actionTypes && actionTypes.map((type, idx) => (
                                <option key={idx} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="form-group">
                        <label htmlFor="logType">Log Type</label>
                        <select onChange={handleChange} value={filters.log_type} name="log_type" className="form-control">
                            <option value="">--Select--</option>
                            {logsType && logsType.map((type, idx) => (
                                <option key={idx} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input onChange={handleChange} value={filters.email} name="email" type="text" className="form-control" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="createdAt">Created At</label>
                        <input onChange={handleChange} value={filters.created_at} name="created_at" type="date" className="form-control" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="action_status">Status</label>
                        <select onChange={handleChange} value={filters.action_status} name="action_status" className="form-control">
                            <option value="">--Select--</option>
                            {actionStatusTypes && actionStatusTypes.map((action_status, idx) => (
                                <option key={idx} value={action_status}>{action_status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="form-actions float-right">
                        <button onClick={handleClear} type="button" className="btn btn-secondary">Clear</button>
                        <button type="submit" className="btn btn-primary" style={{ marginLeft: "8px" }}>Search</button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default Filter;
