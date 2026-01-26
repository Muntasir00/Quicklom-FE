import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const View = () => {
    const menu = "Profile"
    const userRole = sessionStorage.getItem("role")
    const userId = sessionStorage.getItem("user_id")
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Simulate loading
            setTimeout(() => {
                setProfile(null);
                setLoading(false);
            }, 500);
        };
        document.title = `${menu} | Quicklocum`;
        fetchData();
    }, []);

    return (
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="text-primary">
                                <i className="fas fa-user-circle mr-2"></i>Professional Profile
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="#">
                                        <i className="fas fa-home mr-1"></i>Profile
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    <i className="fas fa-eye mr-1"></i>View
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card card-primary card-outline shadow-lg">
                                <div className="card-header bg-gradient-primary">
                                    <h3 className="card-title text-white">
                                        <i className="fas fa-id-badge mr-2"></i>My Professional Profile
                                    </h3>
                                    <div className="card-tools">
                                        <Link
                                            to={`/${userRole}/profile/${userId}/edit`}
                                            className="btn btn-sm btn-light"
                                        >
                                            <i className="fa fa-plus-circle mr-2"></i>
                                            {profile ? 'Edit Profile' : 'Create Profile'}
                                        </Link>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                            <p className="mt-3 text-muted">Loading your profile...</p>
                                        </div>
                                    ) : !profile || (Array.isArray(profile) && profile.length === 0) ? (
                                        <div className="text-center py-5">
                                            <div className="mb-4">
                                                <i className="fas fa-user-plus fa-4x text-muted"></i>
                                            </div>
                                            <h4 className="text-dark">No Profile Found</h4>
                                            <p className="text-muted mb-4">
                                                You haven't created your professional profile yet.
                                                Create one now to get started!
                                            </p>
                                            <Link
                                                to={`/${userRole}/profile/${userId}/edit`}
                                                className="btn btn-primary btn-lg"
                                            >
                                                <i className="fa fa-plus-circle mr-2"></i>
                                                Create My Profile
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover table-bordered">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th width="30%" className="text-center">
                                                            <i className="fas fa-briefcase mr-2"></i>
                                                            Professional Category
                                                        </th>
                                                        <th width="60%" className="text-center">
                                                            <i className="fas fa-user-md mr-2"></i>
                                                            Professional Role
                                                        </th>
                                                        <th width="10%" className="text-center">
                                                            <i className="fas fa-cog mr-2"></i>
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.isArray(profile) && profile.map(category => (
                                                        category.professional_roles.map((role, index) => (
                                                            <tr key={role.id}>
                                                                {index === 0 && (
                                                                    <td rowSpan={category.professional_roles.length} className="align-middle">
                                                                        <span className="badge badge-primary badge-lg p-2" style={{fontSize: "14px"}}>
                                                                            <i className="fas fa-briefcase mr-2"></i>
                                                                            {category.name}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                <td className="align-middle">
                                                                    <i className="fas fa-user-tie text-info mr-2"></i>
                                                                    {role.name}
                                                                </td>
                                                                {index === 0 && (
                                                                    <td rowSpan={category.professional_roles.length} className="text-center align-middle">
                                                                        <Link
                                                                            to={`/${userRole}/profile/${userId}/edit`}
                                                                            className="btn btn-sm btn-primary"
                                                                            title="Edit Profile"
                                                                        >
                                                                            <i className="fa fa-edit"></i>
                                                                        </Link>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {profile && (
                                    <div className="card-footer bg-light">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <small className="text-muted">
                                                    <i className="fas fa-info-circle mr-1"></i>
                                                    <strong>Note:</strong> Keep your profile updated to receive relevant opportunities
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default View;