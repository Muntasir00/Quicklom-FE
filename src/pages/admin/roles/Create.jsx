import React, { useEffect } from "react";
import Form from "./Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema } from "../../../schemas/admin/RoleSchema";
import { createRoleService } from "../../../services/admin/RoleService";
import { Link, useNavigate } from "react-router-dom";
import { getPermissionsService } from "../../../services/admin/PermissionService";


const Create = () => {
    const menu = "Roles";
    const [permissions, setPermissions] = React.useState([]);
    const userRole = sessionStorage.getItem("role");
    const navigate = useNavigate();

    const initializeStateHelper = async () => {
        setPermissions(await getPermissionsService());
    };

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: "", description: "", status: "1", permission_ids: [] },
    });

    const onSubmit = async (data) => {
        try {
            const status = await createRoleService(data);
            if (status) {
                navigate(`/${userRole}/roles`);
            }
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

    useEffect(() => {
        initializeStateHelper();
        document.title = `${menu} | Quicklocum`;
    }, []);

    return (
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>{menu}</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <a href="#">{menu ?? "-"}</a>
                                </li>
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
                                <h3 className="card-title">Create {menu ?? "-"}</h3>
                            </div>
                            <div className="card-body">
                                <Form register={register} errors={errors} permissions={permissions} />
                            </div>
                            <div className="card-footer">
                                <Link to={`/${userRole}/roles`}><button className="btn btn-default" type="button">Back</button></Link>
                                <button className="btn btn-primary float-right" onClick={handleSubmit(onSubmit)}> Create </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Create;
