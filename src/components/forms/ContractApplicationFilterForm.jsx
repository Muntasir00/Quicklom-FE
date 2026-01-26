import React from "react";

const UserContractFilterForm = ({ setApplications, useFilterHook }) => {
    const { 
        filters, 
        handleChange, 
        handleClear, 
        handleSubmit,
        instituteSpecialties,
        positions, 
        CONTRACT_APPLICATION_STATUS 
    } = useFilterHook(setApplications);

    return (
        <form className="mb-4" onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="contract_id">
                            <i className="fas fa-hashtag mr-2"></i>
                            Contract ID
                        </label>
                        <input
                            type="number"
                            onChange={handleChange}
                            value={filters.contract_id || ''}
                            name="contract_id"
                            className="form-control"
                            placeholder="Enter contract ID"
                            min="1"
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="positionSought">Position Sought</label>
                        <select onChange={handleChange} value={filters.position_id} name="position_id" className="form-control" >
                            <option value="">-- Select Position --</option>
                             {Array.isArray(positions) && positions.length > 0 ? (
                                positions.map((position) => (
                                    <option key={position.id} value={position.id}>
                                        {position.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No positions available</option>
                            )}
                        </select>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="institute_specialty_id">Institute Specialties</label>
                        <select onChange={handleChange} value={filters.institute_specialty_id} name="institute_specialty_id" className="form-control">
                            <option value="">-- Select Specialty --</option>
                            {Array.isArray(instituteSpecialties) && instituteSpecialties?.length > 0 ? (
                                instituteSpecialties.map((specialty) => (
                                    <option key={specialty?.id} value={specialty?.id}>
                                        <span className="text-capitalize">{specialty?.name}</span>
                                    </option>
                                ))
                            ) : (
                                <option disabled>No specialties available</option>
                            )}
                        </select>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select onChange={handleChange} value={filters.status} name="status" className="form-control" >
                            <option value="">-- Select Status --</option>
                            {
                                Object.entries(CONTRACT_APPLICATION_STATUS).map(([key, value]) => (
                                    <option key={key} value={value}>
                                        {value.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="startDate">Start Date</label>
                        <input onChange={handleChange} value={filters.start_date} name="start_date" type="date" className="form-control" />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="endDate">End Date</label>
                        <input onChange={handleChange} value={filters.end_date} name="end_date" type="date" className="form-control" />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="form-actions float-right mt-4" style={{ /*marginTop: "2.1rem"*/ }}>
                        <button onClick={handleClear} type="button" className="btn btn-secondary">Clear</button>
                        <button type="submit" className="btn btn-primary" style={{ marginLeft: "8px" }}>Search</button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default UserContractFilterForm;
