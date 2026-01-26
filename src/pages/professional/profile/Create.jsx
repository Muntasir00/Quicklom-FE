import React from "react";
import Form from './Form'; 


const Create = () => {
    return (
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Users</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="#">Users</a></li>
                                <li className="breadcrumb-item active">Create</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-primary card-outline">
                            <div className="card-header">
                                <h3 class="card-title">Create User</h3>
                            </div>
                            <div className="card-body">
                                <Form />
                            </div>

                            <div className="card-footer">
                                <a href="#" ><button className="btn btn-default" type="button">Back</button></a>
                                <button className="btn btn-primary float-right" type="submit">Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Create;
