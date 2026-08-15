import React, { useState } from 'react';
import { Login } from '../Components/Login.jsx';
import { Signup } from '../Components/Signup.jsx';
import Aurora from '../Components/Aurora.jsx';
import { RegistrationContext } from '../Context/RegistrationContext.jsx';
import '../Styles/SignupLogin.css';

// Exporting for backward compatibility
export const isRegisteredStateContext = RegistrationContext;

export const SignupLogin = () => {
    const [isRegistered, setRegistration] = useState(1);

    return (
        <RegistrationContext.Provider value={{ isRegistered, setRegistration }}>
            <div className="row vw-100 vh-100 m-0 p-0 bg-black">
                <div className="col-12 col-lg-4 vh-100 p-0">
                    <div className="bg vh-100 p-0 d-flex justify-content-center align-items-center">
                        <div className="box login-box-responsive border border-info rounded-5 d-flex justify-content-center align-items-center">
                            {isRegistered ? <Login /> : <Signup />}
                        </div>
                    </div>
                </div>
                <Aurora />
            </div>
        </RegistrationContext.Provider>
    );
};

export default SignupLogin;