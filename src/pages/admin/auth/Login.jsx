import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { loginService } from "../../../services/admin/AuthService"

function Login() {
    const navigate = useNavigate();
    const [login, setLogin] = useState({
        email: "",
        password: "",
    });

    const handleInput = (event) => {
        setLogin({ ...login, [event.target.name]: event.target.value });
    };

    useEffect(() => {
        document.title = "Login | Quicklocum";
    }, []);

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="card card-outline card-primary">
                    <div className="card-body">
                        <p className="login-box-msg">Sign in to start your session</p>
                        <form
                            onSubmit={async (event) => {
                                event.preventDefault(); 
                                await loginService(event, login, navigate);
                            }}
                        >
                            <div className="input-group mb-3">
                                <input type="email" className="form-control rounded-0" name="email" onChange={handleInput} placeholder="Email" required />
                            </div>
                            <div className="input-group mb-3">
                                <input type="password" className="form-control rounded-0" name="password" onChange={handleInput} placeholder="Password" required />
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <button type="submit" className="btn btn-primary btn-block">
                                        Sign In
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
