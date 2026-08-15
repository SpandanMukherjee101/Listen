import React, { useContext, useReducer } from 'react';
import axios from 'axios';
import { RegistrationContext } from '../Context/RegistrationContext.jsx';
import '../Styles/Login.css';
import { BACKEND_URL } from '../config.js';

const SIGNUP_URL = `${BACKEND_URL}/signup`;

const formReducer = (state, action) => ({
    ...state,
    [action.field]: action.value,
});

export const Signup = () => {
    const { setRegistration } = useContext(RegistrationContext);

    const [formData, dispatch] = useReducer(formReducer, {
        userid: '',
        name: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        dispatch({
            field: e.target.name,
            value: e.target.value,
        });
    };

    const handleSignup = async () => {
        const userid = formData.userid.trim();
        const name = formData.name.trim();
        const email = formData.email.trim();
        const password = formData.password;

        if (!userid || !name || !email || !password) {
            alert('All fields are required');
            return;
        }
        if (password.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }

        try {
            const res = await axios.post(SIGNUP_URL, { userid, name, email, password });
            const token = typeof res.data === 'string' ? res.data : res.data?.token;
            const user = res.data?.user;
            if (token) {
                localStorage.setItem('token', token);
            }
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            window.location.reload();
        } catch (err) {
            const status = err.response?.status || err.status;
            const errorMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : err.message || 'Signup failed');
            if (status === 409) {
                alert(errorMsg || 'User already exists');
                setRegistration(1);
            } else {
                alert(errorMsg);
                console.error(err);
            }
        }
    };

    return (
        <div className="h-100">
            <h1 className="text-center mt-5 mb-3 text-info">
                Enter Your Details:
            </h1>
            <div className="d-flex justify-content-center align-items-center">
                <div>
                    <h5 className="mt-3 text-info">Userid:</h5>
                    <input
                        className="form-control sign-form border border-info text-info"
                        type="text"
                        name="userid"
                        value={formData.userid}
                        onChange={handleChange}
                        placeholder="Enter a unique id"
                    />
                    <h5 className="mt-3 text-info">Name:</h5>
                    <input
                        className="form-control sign-form border border-info text-info"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                    <h5 className="mt-3 text-info">Email:</h5>
                    <input
                        className="form-control sign-form border border-info text-info"
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter valid e-mail"
                    />
                    <h5 className="mt-3 text-info">Password:</h5>
                    <input
                        className="form-control sign-form border border-info text-info"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter correct password"
                    />
                    <div className="d-flex justify-content-center align-items-center">
                        <button className="btn btn-outline-info mt-4 mb-4" onClick={handleSignup}>
                            Signup
                        </button>
                    </div>
                    <div className="text-center mb-4">
                        <span className="text-light me-2">Already have an account?</span>
                        <button
                            type="button"
                            className="btn btn-link text-info p-0 text-decoration-none fw-bold"
                            onClick={() => setRegistration(1)}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
