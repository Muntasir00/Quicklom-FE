import React from "react";
import { Link } from "react-router-dom";
import ComprehensiveProfileForm from "@components/forms/ComprehensiveProfileForm";
import { useEditProfile } from "@hooks/professional/profile/useEditProfile";
import ProfileSetup from "@pages/professional/profile/components/ProfileSetup.jsx";

const Edit = () => {
    const {
        menu,
        categories,
        profileData,
        handleFormSubmit,
    } = useEditProfile();
    console.log(categories);
    console.log(profileData);

    return (
        <div className="">
            <ProfileSetup categories={categories} profileData={profileData} handleFormSubmit={handleFormSubmit} />
            {/*<section className="content-header">*/}
            {/*    <div className="container-fluid">*/}
            {/*        <div className="row mb-2">*/}
            {/*            <div className="col-sm-6">*/}
            {/*                <h1 className="text-primary">*/}
            {/*                    <i className="fas fa-user-edit mr-2"></i>{menu}*/}
            {/*                </h1>*/}
            {/*            </div>*/}
            {/*            <div className="col-sm-6">*/}
            {/*                <ol className="breadcrumb float-sm-right">*/}
            {/*                    <li className="breadcrumb-item">*/}
            {/*                        <Link to="#">*/}
            {/*                            <i className="fas fa-home mr-1"></i>{menu}*/}
            {/*                        </Link>*/}
            {/*                    </li>*/}
            {/*                    <li className="breadcrumb-item active">*/}
            {/*                        <i className="fas fa-edit mr-1"></i>Edit*/}
            {/*                    </li>*/}
            {/*                </ol>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</section>*/}

            {/*<section className="content">*/}
            {/*    <div className="row">*/}
            {/*        <div className="col-md-12">*/}
            {/*            <div className="card card-primary card-outline shadow-lg">*/}
            {/*                <div className="card-header bg-primary">*/}
            {/*                    <h3 className="card-title text-white">*/}
            {/*                        <i className="fas fa-user-circle mr-2"></i>Complete Professional Profile*/}
            {/*                    </h3>*/}
            {/*                    <div className="card-tools">*/}
            {/*                        <span className="badge badge-light">*/}
            {/*                            <i className="fas fa-info-circle mr-1"></i>*/}
            {/*                            Fill in all required information*/}
            {/*                        </span>*/}
            {/*                    </div>*/}
            {/*                </div>*/}

            {/*                <div className="card-body" style={{maxHeight: "calc(100vh - 250px)", overflowY: "auto"}}>*/}
            {/*                    <div className="alert alert-info alert-dismissible fade show" role="alert">*/}
            {/*                        <h5 className="alert-heading">*/}
            {/*                            <i className="fas fa-info-circle mr-2"></i>Profile Setup Instructions*/}
            {/*                        </h5>*/}
            {/*                        <p className="mb-2">*/}
            {/*                            Complete your professional profile by filling out all sections below.*/}
            {/*                            Fields marked with <span className="text-danger">*</span> are required.*/}
            {/*                        </p>*/}
            {/*                        <hr />*/}
            {/*                        <p className="mb-0">*/}
            {/*                            <small>*/}
            {/*                                <i className="fas fa-lightbulb mr-2 text-warning"></i>*/}
            {/*                                <strong>Tip:</strong> Use the address search feature to quickly fill in your location details.*/}
            {/*                            </small>*/}
            {/*                        </p>*/}
            {/*                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">*/}
            {/*                            <span aria-hidden="true">&times;</span>*/}
            {/*                        </button>*/}
            {/*                    </div>*/}

            {/*                    <ComprehensiveProfileForm*/}
            {/*                        profileData={profileData}*/}
            {/*                        categories={categories}*/}
            {/*                        handleFormSubmit={handleFormSubmit}*/}
            {/*                    />*/}
            {/*                </div>*/}

            {/*                <div className="card-footer bg-light">*/}
            {/*                    <div className="d-flex justify-content-between align-items-center">*/}
            {/*                        <Link to="#" className="btn btn-default">*/}
            {/*                            <i className="fas fa-arrow-left mr-2"></i>Cancel*/}
            {/*                        </Link>*/}

            {/*                        <div>*/}
            {/*                            <button*/}
            {/*                                form="comprehensive-profile-form"*/}
            {/*                                type="submit"*/}
            {/*                                className="btn btn-primary btn-lg"*/}
            {/*                            >*/}
            {/*                                <i className="fas fa-save mr-2"></i>Save Profile*/}
            {/*                            </button>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}

            {/*                    <div className="mt-3 text-center">*/}
            {/*                        <small className="text-muted">*/}
            {/*                            <i className="fas fa-lock mr-1"></i>*/}
            {/*                            Your information is secure and will be kept confidential*/}
            {/*                        </small>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</section>*/}
        </div>
    );
}

export default Edit;