import React, { useEffect } from "react";
import Form from "./Form"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema } from "../../../schemas/admin/RoleSchema";
import { updateRoleService, getRoleByIdService } from "../../../services/admin/RoleService";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPermissionsService } from "../../../services/admin/PermissionService";


const Edit = () => {
    const menu = "Roles";
    const userRole = sessionStorage.getItem("role");
    const { id } = useParams();
    const navigate = useNavigate();
    const [permissions, setPermissions] = React.useState([]);
    

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: "", description: "", status: "", permission_ids: [] },
    });

    const onSubmit = async (data) => {
        try {
            const status = await updateRoleService(Number(id), data);
            if (!status) return;
            navigate(`/${userRole}/roles`);
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
        const initializeStateHelper = async () => {
            try {
                setPermissions(await getPermissionsService());
                const data = await getRoleByIdService(Number(id));
                if (!data) return;
                reset({
                    name: data?.role?.name,
                    description: data?.role?.description,
                    status: data?.role?.status ? "1" : "0",
                    permission_ids: data?.permission_ids?.map(String) ?? [],
                });
            } catch (error) {
                console.error("Error fetching role data:", error);
            }
        };
        initializeStateHelper();
        document.title = `${menu} | Quicklocum`;
    }, [id, reset]);

    return (
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>{menu ?? "-"}</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="#">{menu ?? "-"}</a></li>
                                <li className="breadcrumb-item active">Edit</li>
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
                                <h3 className="card-title">Edit {menu ?? "-"}</h3>
                            </div>
                            <div className="card-body">
                                <Form register={register} errors={errors} permissions={permissions} />
                            </div>

                            <div className="card-footer">
                                <Link to={`/${userRole}/roles`}>
                                    <button className="btn btn-default" type="button">Back</button>
                                </Link>
                                <button className="btn btn-primary float-right" type="button" onClick={handleSubmit(onSubmit)}>
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
