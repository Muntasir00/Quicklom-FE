import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { editAccountSchema } from "@schemas/user/AccountSchema";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUserByIdService, updateUserService } from "@services/admin/UserService";

const AccountForm = () => {
    const formId = "account"; 
    const { id } = useParams();
    
    const initializeStateHelper = async () => {
        try {
            if (id) {
                const data = await getUserByIdService(Number(id));
                if (!data) return;
                setValue("email", data?.email || "");
                setValue("name", data?.name || "");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(editAccountSchema),
        defaultValues: { email: "", name: "", password: "", confirm_password: "" },
    });

    const onSubmit = (data) => {
        console.log(data);
        if (!id) return
        const response = updateUserService(Number(id), data);
        if (!response) return;
        reset ({ email: response.email, name: response.name });
    }

    React.useEffect(() => {
        initializeStateHelper();
    }, []);
    
    return (
        <form id="account-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="email">Email <span className="text-red">*</span></label>
                        <input {...register("email")} type="email" id="email" className="form-control" placeholder="Enter Email" />
                        <span className={`text-danger ${errors.email ? '' : 'd-none'}`}>
                            {errors?.email && <strong>{errors.email.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="name">Name <span className="text-red">*</span></label>
                        <input {...register("name")} type="text" id="name" className="form-control" placeholder="Enter Name" />
                        <span className={`text-danger ${errors.name ? '' : 'd-none'}`}>
                            {errors?.name && <strong>{errors.name.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="password">Password</label>
                        <input {...register("password")} type="password" id="password" className="form-control" placeholder="Enter Password" />
                        <span className={`text-danger ${errors.name ? '' : 'd-none'}`}>
                            {errors?.password && <strong>{errors.password.message}</strong>}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="control-label" htmlFor="confirm_password">Confirm Password</label>
                        <input {...register("confirm_password")} type="password" id="confirm_password" className="form-control" placeholder="Confirm Password" />
                        <span className={`text-danger ${errors.confirm_password ? '' : 'd-none'}`}>
                            {errors?.confirm_password && <strong>{errors.confirm_password.message}</strong>}
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AccountForm;
