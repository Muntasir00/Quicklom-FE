import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Form from "./Form";
import { getAccountService, updateAccount } from "../../../services/admin/AccountService";
import { editAccountSchema } from "../../../schemas/admin/AccountSchema";
import UpdateEmailModelComponent from "@components/modals/UpdateEmailModelComponent";


const Edit = () => {
    const [show, setShow] = useState(false);    
    
    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(editAccountSchema),
        defaultValues: { email: "", name: "", password: "", confirm_password: "", current_password:"" },
    });

    const fetchAccount = async () => {
        try {
            const accountData = await getAccountService();
            Object.keys(accountData).forEach((key) => setValue(key, accountData[key]));
        } catch (err) {
            console.error("Error fetching account:", err);
        }
    };

    useEffect(() => {
        fetchAccount();
        document.title = "Account | Quicklocum";
    }, [setValue]);

    const onSubmit = async (data) => {
        try {
            await updateAccount(data);
        } catch (err) {
            if (err.response?.data?.errors) {
                const serverErrors = err.response.data.errors;
                Object.keys(serverErrors).forEach((field) => {
                    setError(field, { type: "server", message: serverErrors[field] });
                });
            } else {
                console.error("Unexpected error:", err);
            }
        }
    };

    return (
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Account</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="#">Account</a></li>
                                <li className="breadcrumb-item active">Edit</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <section className="content">
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    <i className="fa fa-exclamation-triangle mr-2"></i>
                    <strong>Note:</strong> Leave <em>Password</em> and <em>Confirm Password</em> fields empty if you do not wish to change your password.
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-primary card-outline">
                            <div className="card-header">
                                <h3 className="card-title">Edit Account</h3>
                            </div>
                            <div className="card-body">
                                <Form register={register} errors={errors} setShow={setShow} />
                                <UpdateEmailModelComponent show={show} setShow={setShow} setValue={setValue} />
                            </div>

                            <div className="card-footer">
                                <Link to="/admin/dashboard"><button className="btn btn-default" type="button">Back</button></Link>
                                <button className="btn btn-primary float-right" onClick={handleSubmit(onSubmit)}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Edit;
